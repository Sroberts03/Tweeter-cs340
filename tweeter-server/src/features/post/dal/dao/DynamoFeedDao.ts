import {
  BatchWriteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { Status } from "tweeter-shared";
import { DynamoClient } from "../../../../dal/dao/dynamo/DynamoClient";
import { IFeedDao } from "../interface/IFeedDao";
import { StatusItemConverter, StatusTableRecord } from "./StatusItemConverter";

/**
 * Shape of a Feed record stored in the DynamoDB `feed` table.
 */
export interface FeedTableRecord extends StatusTableRecord {
  readonly receiver_alias: string;
}

/**
 * DynamoDB implementation of IFeedDao.
 * Manages pre-computed user feeds in the `feed` table.
 */
export class DynamoFeedDao implements IFeedDao {
  public static readonly TABLE_NAME = "feed" as const;
  public static readonly PARTITION_KEY = "receiver_alias" as const;
  public static readonly SORT_KEY = "timestamp" as const;
  private static readonly MAX_BATCH_WRITE_SIZE = 25;

  public async getPageOfFeedItems(
    receiverAlias: string,
    pageSize: number,
    lastTimestamp: number | null
  ): Promise<[Status[], boolean]> {
    if (!receiverAlias?.trim()) {
      return [[], false];
    }

    const client = DynamoClient.getDocumentClient();
    const command = new QueryCommand({
      TableName: DynamoFeedDao.TABLE_NAME,
      KeyConditionExpression: "#receiver = :receiverAlias",
      ExpressionAttributeNames: {
        "#receiver": DynamoFeedDao.PARTITION_KEY,
      },
      ExpressionAttributeValues: {
        ":receiverAlias": receiverAlias,
      },
      // ScanIndexForward: false sorts newest-to-oldest by sort key (timestamp)
      ScanIndexForward: false,
      Limit: pageSize,
      ExclusiveStartKey:
        lastTimestamp !== null
          ? {
              [DynamoFeedDao.PARTITION_KEY]: receiverAlias,
              [DynamoFeedDao.SORT_KEY]: lastTimestamp,
            }
          : undefined,
    });

    const response = await client.send(command);
    const items = (response.Items ?? []) as FeedTableRecord[];
    const statuses = StatusItemConverter.fromRecords(items);

    return [statuses, !!response.LastEvaluatedKey];
  }

  public async batchWriteFeedItems(
    receiverAliases: string[],
    status: Status
  ): Promise<void> {
    if (!receiverAliases || receiverAliases.length === 0) {
      return;
    }
    if (
      !status?.user?.alias ||
      !status?.post ||
      typeof status?.timestamp !== "number"
    ) {
      throw new Error("[Bad Request] Invalid status for feed fanout");
    }

    const client = DynamoClient.getDocumentClient();

    // Chunk into batches of up to 25 items (DynamoDB limit for BatchWriteItem)
    for (
      let i = 0;
      i < receiverAliases.length;
      i += DynamoFeedDao.MAX_BATCH_WRITE_SIZE
    ) {
      const chunk = receiverAliases.slice(
        i,
        i + DynamoFeedDao.MAX_BATCH_WRITE_SIZE
      );

      const writeRequests = chunk.map((receiverAlias) => ({
        PutRequest: {
          Item: {
            [DynamoFeedDao.PARTITION_KEY]: receiverAlias,
            [DynamoFeedDao.SORT_KEY]: status.timestamp,
            post: status.post,
            sender_alias: status.user.alias,
            sender_firstName: status.user.firstName,
            sender_lastName: status.user.lastName,
            sender_imageUrl: status.user.imageUrl,
          } satisfies FeedTableRecord,
        },
      }));

      let requestItems: Record<string, any> = {
        [DynamoFeedDao.TABLE_NAME]: writeRequests,
      };

      // Loop to retry any unprocessed items (due to throttling/capacity)
      do {
        const command = new BatchWriteCommand({
          RequestItems: requestItems,
        });

        const response = await client.send(command);

        if (
          response.UnprocessedItems &&
          Object.keys(response.UnprocessedItems).length > 0 &&
          response.UnprocessedItems[DynamoFeedDao.TABLE_NAME]?.length > 0
        ) {
          requestItems = {
            [DynamoFeedDao.TABLE_NAME]:
              response.UnprocessedItems[DynamoFeedDao.TABLE_NAME],
          };
          // Short exponential backoff before retrying unprocessed items
          await new Promise((res) => setTimeout(res, 50));
        } else {
          break;
        }
      } while (true);
    }
  }
}
