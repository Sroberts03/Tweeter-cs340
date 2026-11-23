import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { User } from "tweeter-shared";
import { DynamoClient } from "../../../../dal/dao/dynamo/DynamoClient";
import { DynamoUserDao, UserTableRecord } from "../../../user/dal/dao/DynamoUserDao";
import { IAuthUserDao } from "../interface/IAuthUserDao";

/**
 * DynamoDB implementation of IAuthUserDao.
 * Manages user credential lookup and user creation in the `user` table.
 */
export class DynamoAuthUserDao implements IAuthUserDao {
  public async getUserWithPassword(
    alias: string
  ): Promise<{ user: User; passwordHash: string } | null> {
    const record = await DynamoUserDao.getRecord(alias);
    if (!record) {
      return null;
    }

    return {
      user: new User(
        record.firstName,
        record.lastName,
        record.alias,
        record.imageUrl
      ),
      passwordHash: record.passwordHash,
    };
  }

  public async putUser(
    alias: string,
    firstName: string,
    lastName: string,
    passwordHash: string,
    imageUrl: string
  ): Promise<void> {
    if (
      !alias?.trim() ||
      !firstName?.trim() ||
      !lastName?.trim() ||
      !passwordHash?.trim() ||
      !imageUrl?.trim()
    ) {
      throw new Error("[Bad Request] All user fields are required to create a user");
    }

    const client = DynamoClient.getDocumentClient();
    const command = new PutCommand({
      TableName: DynamoUserDao.TABLE_NAME,
      Item: {
        [DynamoUserDao.PARTITION_KEY]: alias,
        firstName,
        lastName,
        passwordHash,
        imageUrl,
        followerCount: 0,
        followeeCount: 0,
      } satisfies UserTableRecord,
      ConditionExpression: "attribute_not_exists(#pk)",
      ExpressionAttributeNames: {
        "#pk": DynamoUserDao.PARTITION_KEY,
      },
    });

    try {
      await client.send(command);
    } catch (error: any) {
      if (error?.name === "ConditionalCheckFailedException") {
        throw new Error("[Bad Request] User with this alias already exists");
      }
      throw error;
    }
  }
}
