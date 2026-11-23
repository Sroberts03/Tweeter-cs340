import {
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { User } from "tweeter-shared";
import { DynamoClient } from "../../../../dal/dao/dynamo/DynamoClient";
import { DynamoUserDao } from "../../../user/dal/dao/DynamoUserDao";
import { ISocialDao } from "../interface/ISocialDao";

/**
 * Shape of a Follow record in the DynamoDB `follow` table.
 */
export interface FollowTableRecord {
  readonly follower_alias: string;
  readonly followee_alias: string;
}

/**
 * DynamoDB implementation of ISocialDao.
 * Manages follow relationships and follower/followee counts across the
 * `follow` table, `follow_index` GSI, and `user` table.
 */
export class DynamoSocialDao implements ISocialDao {
  public static readonly TABLE_NAME = "follow" as const;
  public static readonly INDEX_NAME = "follow_index" as const;
  public static readonly PARTITION_KEY = "follower_alias" as const;
  public static readonly SORT_KEY = "followee_alias" as const;

  /**
   * Generic helper that queries followers or followees and resolves them to User models.
   */
  private async queryFollowPage(params: {
    targetAlias: string;
    pageSize: number;
    lastAlias: string | null;
    isFollowersQuery: boolean;
  }): Promise<[User[], boolean]> {
    const { targetAlias, pageSize, lastAlias, isFollowersQuery } = params;
    if (!targetAlias?.trim()) {
      return [[], false];
    }

    const keyAttr = isFollowersQuery
      ? DynamoSocialDao.SORT_KEY
      : DynamoSocialDao.PARTITION_KEY;

    const startKey = lastAlias
      ? isFollowersQuery
        ? {
            [DynamoSocialDao.SORT_KEY]: targetAlias,
            [DynamoSocialDao.PARTITION_KEY]: lastAlias,
          }
        : {
            [DynamoSocialDao.PARTITION_KEY]: targetAlias,
            [DynamoSocialDao.SORT_KEY]: lastAlias,
          }
      : undefined;

    const client = DynamoClient.getDocumentClient();
    const command = new QueryCommand({
      TableName: DynamoSocialDao.TABLE_NAME,
      IndexName: isFollowersQuery ? DynamoSocialDao.INDEX_NAME : undefined,
      KeyConditionExpression: "#k = :target",
      ExpressionAttributeNames: {
        "#k": keyAttr,
      },
      ExpressionAttributeValues: {
        ":target": targetAlias,
      },
      Limit: pageSize,
      ExclusiveStartKey: startKey,
    });

    const response = await client.send(command);
    const items = (response.Items ?? []) as FollowTableRecord[];

    const aliasesToFetch = items.map((item) =>
      isFollowersQuery ? item.follower_alias : item.followee_alias
    );

    const userRecords = await Promise.all(
      aliasesToFetch.map((alias) => DynamoUserDao.getRecord(alias))
    );

    const users: User[] = [];
    for (const record of userRecords) {
      if (record) {
        users.push(
          new User(
            record.firstName,
            record.lastName,
            record.alias,
            record.imageUrl
          )
        );
      }
    }

    return [users, !!response.LastEvaluatedKey];
  }

  public async getPageOfFollowers(
    followeeAlias: string,
    pageSize: number,
    lastFollowerAlias: string | null
  ): Promise<[User[], boolean]> {
    return this.queryFollowPage({
      targetAlias: followeeAlias,
      pageSize,
      lastAlias: lastFollowerAlias,
      isFollowersQuery: true,
    });
  }

  public async getPageOfFollowees(
    followerAlias: string,
    pageSize: number,
    lastFolloweeAlias: string | null
  ): Promise<[User[], boolean]> {
    return this.queryFollowPage({
      targetAlias: followerAlias,
      pageSize,
      lastAlias: lastFolloweeAlias,
      isFollowersQuery: false,
    });
  }

  public async isFollower(
    followerAlias: string,
    followeeAlias: string
  ): Promise<boolean> {
    if (!followerAlias?.trim() || !followeeAlias?.trim()) {
      return false;
    }

    const client = DynamoClient.getDocumentClient();
    const command = new GetCommand({
      TableName: DynamoSocialDao.TABLE_NAME,
      Key: {
        [DynamoSocialDao.PARTITION_KEY]: followerAlias,
        [DynamoSocialDao.SORT_KEY]: followeeAlias,
      },
    });

    const response = await client.send(command);
    return !!response.Item;
  }

  public async getFollowerCount(alias: string): Promise<number> {
    const record = await DynamoUserDao.getRecord(alias);
    return record?.followerCount ?? 0;
  }

  public async getFolloweeCount(alias: string): Promise<number> {
    const record = await DynamoUserDao.getRecord(alias);
    return record?.followeeCount ?? 0;
  }

  public async follow(
    followerAlias: string,
    followeeAlias: string
  ): Promise<void> {
    if (!followerAlias?.trim() || !followeeAlias?.trim()) {
      throw new Error("[Bad Request] Invalid follower or followee alias");
    }
    if (followerAlias === followeeAlias) {
      throw new Error("[Bad Request] Users cannot follow themselves");
    }

    await this.executeFollowTransaction(
      followerAlias,
      followeeAlias,
      "follow",
      "[Bad Request] Already following this user"
    );
  }

  public async unfollow(
    followerAlias: string,
    followeeAlias: string
  ): Promise<void> {
    if (!followerAlias?.trim() || !followeeAlias?.trim()) {
      throw new Error("[Bad Request] Invalid follower or followee alias");
    }

    await this.executeFollowTransaction(
      followerAlias,
      followeeAlias,
      "unfollow",
      "[Bad Request] Not following this user"
    );
  }

  /**
   * Helper that executes the atomic TransactWriteCommand for follow/unfollow and count updates.
   */
  private async executeFollowTransaction(
    followerAlias: string,
    followeeAlias: string,
    action: "follow" | "unfollow",
    duplicateError: string
  ): Promise<void> {
    const isFollow = action === "follow";
    const delta = isFollow ? 1 : -1;
    const client = DynamoClient.getDocumentClient();

    const relationItem = isFollow
      ? {
          Put: {
            TableName: DynamoSocialDao.TABLE_NAME,
            Item: {
              [DynamoSocialDao.PARTITION_KEY]: followerAlias,
              [DynamoSocialDao.SORT_KEY]: followeeAlias,
            } satisfies FollowTableRecord,
            ConditionExpression:
              "attribute_not_exists(#fer) AND attribute_not_exists(#fee)",
            ExpressionAttributeNames: {
              "#fer": DynamoSocialDao.PARTITION_KEY,
              "#fee": DynamoSocialDao.SORT_KEY,
            },
          },
        }
      : {
          Delete: {
            TableName: DynamoSocialDao.TABLE_NAME,
            Key: {
              [DynamoSocialDao.PARTITION_KEY]: followerAlias,
              [DynamoSocialDao.SORT_KEY]: followeeAlias,
            },
            ConditionExpression:
              "attribute_exists(#fer) AND attribute_exists(#fee)",
            ExpressionAttributeNames: {
              "#fer": DynamoSocialDao.PARTITION_KEY,
              "#fee": DynamoSocialDao.SORT_KEY,
            },
          },
        };

    const command = new TransactWriteCommand({
      TransactItems: [
        relationItem,
        {
          Update: {
            TableName: DynamoUserDao.TABLE_NAME,
            Key: {
              [DynamoUserDao.PARTITION_KEY]: followerAlias,
            },
            UpdateExpression: "ADD #fec :delta",
            ExpressionAttributeNames: {
              "#fec": "followeeCount",
            },
            ExpressionAttributeValues: {
              ":delta": delta,
            },
          },
        },
        {
          Update: {
            TableName: DynamoUserDao.TABLE_NAME,
            Key: {
              [DynamoUserDao.PARTITION_KEY]: followeeAlias,
            },
            UpdateExpression: "ADD #frc :delta",
            ExpressionAttributeNames: {
              "#frc": "followerCount",
            },
            ExpressionAttributeValues: {
              ":delta": delta,
            },
          },
        },
      ],
    });

    try {
      await client.send(command);
    } catch (error: any) {
      if (error?.name === "TransactionCanceledException") {
        throw new Error(duplicateError);
      }
      throw error;
    }
  }
}
