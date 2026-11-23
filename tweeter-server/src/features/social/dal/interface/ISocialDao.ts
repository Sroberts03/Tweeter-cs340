import { User } from "tweeter-shared";

/**
 * Database-agnostic interface for follow relationship data access.
 * Supports the operations needed by SocialService.
 */
export interface ISocialDao {
  /**
   * Get a paginated list of followers for a user.
   *
   * @param followeeAlias  The user whose followers to retrieve
   * @param pageSize       Number of followers per page
   * @param lastFollowerAlias  Alias of the last follower from the previous page, or `null` for the first page
   * @returns The page of follower Users and whether more pages exist.
   */
  getPageOfFollowers(
    followeeAlias: string,
    pageSize: number,
    lastFollowerAlias: string | null
  ): Promise<[User[], boolean]>;

  /**
   * Get a paginated list of followees for a user.
   *
   * @param followerAlias  The user whose followees to retrieve
   * @param pageSize       Number of followees per page
   * @param lastFolloweeAlias  Alias of the last followee from the previous page, or `null` for the first page
   * @returns The page of followee Users and whether more pages exist.
   */
  getPageOfFollowees(
    followerAlias: string,
    pageSize: number,
    lastFolloweeAlias: string | null
  ): Promise<[User[], boolean]>;

  /**
   * Check whether one user follows another.
   *
   * @param followerAlias  The potential follower
   * @param followeeAlias  The potential followee
   */
  isFollower(followerAlias: string, followeeAlias: string): Promise<boolean>;

  /**
   * Get the number of followers a user has.
   *
   * @param alias  The user's alias
   */
  getFollowerCount(alias: string): Promise<number>;

  /**
   * Get the number of users a user follows.
   *
   * @param alias  The user's alias
   */
  getFolloweeCount(alias: string): Promise<number>;

  /**
   * Create a follow relationship.
   *
   * @param followerAlias  The user who is following
   * @param followeeAlias  The user being followed
   */
  follow(followerAlias: string, followeeAlias: string): Promise<void>;

  /**
   * Remove a follow relationship.
   *
   * @param followerAlias  The user who is unfollowing
   * @param followeeAlias  The user being unfollowed
   */
  unfollow(followerAlias: string, followeeAlias: string): Promise<void>;
}
