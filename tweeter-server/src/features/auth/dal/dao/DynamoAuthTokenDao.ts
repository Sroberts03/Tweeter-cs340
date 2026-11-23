import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { AuthToken } from "tweeter-shared";
import { DynamoClient } from "../../../../dal/dao/dynamo/DynamoClient";
import { IAuthTokenDao } from "../interface/IAuthTokenDao";

/**
 * Shape of an AuthToken record as stored in DynamoDB `authtoken` table.
 */
export interface AuthTokenTableRecord {
  readonly token: string;
  readonly alias: string;
  readonly timestamp: number;
}

/**
 * DynamoDB implementation of IAuthTokenDao.
 * Manages token lifecycle in the `authtoken` table.
 */
export class DynamoAuthTokenDao implements IAuthTokenDao {
  public static readonly TABLE_NAME = "authtoken" as const;
  public static readonly PARTITION_KEY = "token" as const;

  public async putAuthToken(
    authToken: AuthToken,
    alias: string
  ): Promise<void> {
    if (!authToken?.token || !alias?.trim()) {
      throw new Error("[Bad Request] Invalid auth token or alias");
    }

    const client = DynamoClient.getDocumentClient();
    const command = new PutCommand({
      TableName: DynamoAuthTokenDao.TABLE_NAME,
      Item: {
        [DynamoAuthTokenDao.PARTITION_KEY]: authToken.token,
        alias,
        timestamp: authToken.timestamp,
      } satisfies AuthTokenTableRecord,
    });

    await client.send(command);
  }

  public async getAuthToken(
    token: string
  ): Promise<{ authToken: AuthToken; alias: string } | null> {
    if (!token?.trim()) {
      return null;
    }

    const client = DynamoClient.getDocumentClient();
    const command = new GetCommand({
      TableName: DynamoAuthTokenDao.TABLE_NAME,
      Key: {
        [DynamoAuthTokenDao.PARTITION_KEY]: token,
      },
    });

    const response = await client.send(command);
    const item = response.Item as Partial<AuthTokenTableRecord> | undefined;

    if (
      !item ||
      typeof item.token !== "string" ||
      typeof item.alias !== "string" ||
      typeof item.timestamp !== "number"
    ) {
      return null;
    }

    return {
      authToken: new AuthToken(item.token, item.timestamp),
      alias: item.alias,
    };
  }

  public async deleteAuthToken(token: string): Promise<void> {
    if (!token?.trim()) {
      return;
    }

    const client = DynamoClient.getDocumentClient();
    const command = new DeleteCommand({
      TableName: DynamoAuthTokenDao.TABLE_NAME,
      Key: {
        [DynamoAuthTokenDao.PARTITION_KEY]: token,
      },
    });

    await client.send(command);
  }

  public async updateTimestamp(
    token: string,
    timestamp: number
  ): Promise<void> {
    if (!token?.trim()) {
      throw new Error("[Bad Request] Invalid token for timestamp update");
    }

    const client = DynamoClient.getDocumentClient();
    const command = new UpdateCommand({
      TableName: DynamoAuthTokenDao.TABLE_NAME,
      Key: {
        [DynamoAuthTokenDao.PARTITION_KEY]: token,
      },
      UpdateExpression: "SET #ts = :newTimestamp",
      ExpressionAttributeNames: {
        "#ts": "timestamp",
      },
      ExpressionAttributeValues: {
        ":newTimestamp": timestamp,
      },
    });

    await client.send(command);
  }
}
