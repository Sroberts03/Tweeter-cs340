import { Status } from "tweeter-shared";

/**
 * Database-agnostic interface for feed (pre-computed) data access.
 * Supports the operations needed by PostService.
 */
export interface IFeedDao {
  /**
   * Get a paginated list of feed items for a user, newest first.
   *
   * @param receiverAlias  The user whose feed to retrieve
   * @param pageSize       Number of items per page
   * @param lastTimestamp  Timestamp of the last item from the previous page, or `null` for the first page
   * @returns The page of Status items and whether more pages exist.
   */
  getPageOfFeedItems(
    receiverAlias: string,
    pageSize: number,
    lastTimestamp: number | null
  ): Promise<[Status[], boolean]>;

  /**
   * Fan out a status to multiple followers' feeds in batch.
   * The implementation should handle chunking into batches of up to 25 items.
   *
   * @param receiverAliases  The aliases of followers who should receive this status
   * @param status           The status to add to each follower's feed
   */
  batchWriteFeedItems(
    receiverAliases: string[],
    status: Status
  ): Promise<void>;
}
