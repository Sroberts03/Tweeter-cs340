import { Status } from "tweeter-shared";

/**
 * Database-agnostic interface for story (a user's own posts) data access.
 * Supports the operations needed by PostService.
 */
export interface IStoryDao {
  /**
   * Get a paginated list of story items for a user, newest first.
   *
   * @param senderAlias    The user whose story to retrieve
   * @param pageSize       Number of items per page
   * @param lastTimestamp  Timestamp of the last item from the previous page, or `null` for the first page
   * @returns The page of Status items and whether more pages exist.
   */
  getPageOfStoryItems(
    senderAlias: string,
    pageSize: number,
    lastTimestamp: number | null
  ): Promise<[Status[], boolean]>;

  /**
   * Save a new status to the user's story.
   *
   * @param status  The status to persist
   */
  putStory(status: Status): Promise<void>;
}
