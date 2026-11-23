import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { User } from "tweeter-shared";
import { DynamoClient } from "../../../../dal/dao/dynamo/DynamoClient";
import { IUserDao } from "../interface/IUserDao";

/**
 * Shape of a User record as stored in the DynamoDB `user` table.
 */
export interface UserTableRecord {
  readonly alias: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly passwordHash: string;
  readonly imageUrl: string;
  readonly followerCount: number;
  readonly followeeCount: number;
}

/**
 * DynamoDB implementation of IUserDao.
 * Reads user records from the `user` table.
 */
export class DynamoUserDao implements IUserDao {
  public static readonly TABLE_NAME = "user" as const;
  public static readonly PARTITION_KEY = "alias" as const;

  public async getUser(alias: string): Promise<User | null> {
    if (!alias?.trim()) {
      return null;
    }

    const client = DynamoClient.getDocumentClient();
    const command = new GetCommand({
      TableName: DynamoUserDao.TABLE_NAME,
      Key: {
        [DynamoUserDao.PARTITION_KEY]: alias,
      },
    });

    const response = await client.send(command);
    const item = response.Item as Partial<UserTableRecord> | undefined;

    if (
      !item ||
      typeof item.alias !== "string" ||
      typeof item.firstName !== "string" ||
      typeof item.lastName !== "string" ||
      typeof item.imageUrl !== "string"
    ) {
      return null;
    }

    return new User(
      item.firstName,
      item.lastName,
      item.alias,
      item.imageUrl
    );
  }
}
