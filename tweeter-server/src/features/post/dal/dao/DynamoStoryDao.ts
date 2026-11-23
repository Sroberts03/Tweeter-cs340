import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Status, User } from "tweeter-shared";
import { DynamoClient } from "../../../../dal/dao/dynamo/DynamoClient";
import { IStoryDao } from "../interface/IStoryDao";

/**
 * Shape of a Story record stored in the DynamoDB `story` table.
 */
export interface StoryTableRecord {
  readonly sender_alias: string;
  readonly timestamp: number;
  readonly post: string;
  readonly sender_firstName: string;
  readonly sender_lastName: string;
  readonly sender_imageUrl: string;
}

/**
 * DynamoDB implementation of IStoryDao.
 * Manages an author's posts in the `story` table.
 */
export class DynamoStoryDao implements IStoryDao {
  public static readonly TABLE_NAME = "story" as const;
  public static readonly PARTITION_KEY = "sender_alias" as const;
  public static readonly SORT_KEY = "timestamp" as const;

  public async getPageOfStoryItems(
    senderAlias: string,
    pageSize: number,
    lastTimestamp: number | null
  ): Promise<[Status[], boolean]> {
    if (!senderAlias?.trim()) {
      return [[], false];
    }

    const client = DynamoClient.getDocumentClient();
    const command = new QueryCommand({
      TableName: DynamoStoryDao.TABLE_NAME,
      KeyConditionExpression: "#sender = :senderAlias",
      ExpressionAttributeNames: {
        "#sender": DynamoStoryDao.PARTITION_KEY,
      },
      ExpressionAttributeValues: {
        ":senderAlias": senderAlias,
      },
      // ScanIndexForward: false sorts newest-to-oldest by sort key (timestamp)
      ScanIndexForward: false,
      Limit: pageSize,
      ExclusiveStartKey:
        lastTimestamp !== null
          ? {
              [DynamoStoryDao.PARTITION_KEY]: senderAlias,
              [DynamoStoryDao.SORT_KEY]: lastTimestamp,
            }
          : undefined,
    });

    const response = await client.send(command);
    const items = (response.Items ?? []) as StoryTableRecord[];

    const statuses: Status[] = [];
    for (const item of items) {
      if (
        item &&
        typeof item.post === "string" &&
        typeof item.sender_firstName === "string" &&
        typeof item.sender_lastName === "string" &&
        typeof item.sender_alias === "string" &&
        typeof item.sender_imageUrl === "string" &&
        typeof item.timestamp === "number"
      ) {
        const author = new User(
          item.sender_firstName,
          item.sender_lastName,
          item.sender_alias,
          item.sender_imageUrl
        );
        statuses.push(new Status(item.post, author, item.timestamp));
      }
    }

    return [statuses, !!response.LastEvaluatedKey];
  }

  public async putStory(status: Status): Promise<void> {
    if (!status?.user?.alias || !status?.post || typeof status?.timestamp !== "number") {
      throw new Error("[Bad Request] Invalid status to put in story");
    }

    const client = DynamoClient.getDocumentClient();
    const command = new PutCommand({
      TableName: DynamoStoryDao.TABLE_NAME,
      Item: {
        [DynamoStoryDao.PARTITION_KEY]: status.user.alias,
        [DynamoStoryDao.SORT_KEY]: status.timestamp,
        post: status.post,
        sender_firstName: status.user.firstName,
        sender_lastName: status.user.lastName,
        sender_imageUrl: status.user.imageUrl,
      } satisfies StoryTableRecord,
    });

    await client.send(command);
  }
}
