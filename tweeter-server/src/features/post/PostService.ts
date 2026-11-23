import { AuthToken, Status } from "tweeter-shared";
import { DynamoDaoFactory } from "../../dal/dao/DynamoDaoFactory";
import { IDaoFactory } from "../../dal/interface/IDaoFactory";
import { Service } from "../../Service";
import { AuthorizationService } from "../auth/AuthorizationService";
import { ISocialDao } from "../social/dal/interface/ISocialDao";
import { IFeedDao } from "./dal/interface/IFeedDao";
import { IStoryDao } from "./dal/interface/IStoryDao";

type StatusPageType = "story" | "feed";

export class PostService implements Service {
  private readonly storyDao: IStoryDao;
  private readonly feedDao: IFeedDao;
  private readonly socialDao: ISocialDao;
  private readonly authService: AuthorizationService;

  public constructor(daoFactory: IDaoFactory = new DynamoDaoFactory()) {
    this.storyDao = daoFactory.getStoryDao();
    this.feedDao = daoFactory.getFeedDao();
    this.socialDao = daoFactory.getSocialDao();
    this.authService = new AuthorizationService(daoFactory);
  }

  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    return this.fetchStatusPage("story", authToken, userAlias, pageSize, lastItem);
  }

  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null
  ): Promise<[Status[], boolean]> {
    return this.fetchStatusPage("feed", authToken, userAlias, pageSize, lastItem);
  }

  private async fetchStatusPage(
    type: StatusPageType,
    token: AuthToken,
    alias: string,
    limit: number,
    cursor: Status | null
  ): Promise<[Status[], boolean]> {
    if (!alias?.trim()) {
      throw new Error("[Bad Request] User alias is required");
    }

    await this.authService.validateToken(token);
    const lastTimestamp = cursor ? cursor.timestamp : null;

    return type === "story"
      ? this.storyDao.getPageOfStoryItems(alias, limit, lastTimestamp)
      : this.feedDao.getPageOfFeedItems(alias, limit, lastTimestamp);
  }

  public async postStatus(
    authToken: AuthToken,
    newStatus: Status
  ): Promise<void> {
    if (!newStatus?.user?.alias || !newStatus?.post?.trim()) {
      throw new Error("[Bad Request] Status and author are required");
    }

    // Authenticate caller session against DynamoDB
    const callerAlias = await this.authService.validateToken(authToken);

    // Ensure status author matches authenticated caller
    if (newStatus.user.alias !== callerAlias) {
      throw new Error("[Unauthorized] You can only post statuses as yourself");
    }

    // 1. Save status to author's story
    await this.storyDao.putStory(newStatus);

    // 2. Retrieve all followers of the author to fan out
    const followerAliases = await this.getAllFollowerAliases(callerAlias);

    // 3. Batch write status into all followers' feeds
    if (followerAliases.length > 0) {
      await this.feedDao.batchWriteFeedItems(followerAliases, newStatus);
    }
  }

  /**
   * Helper to retrieve all follower aliases for the author across all pages.
   */
  private async getAllFollowerAliases(authorAlias: string): Promise<string[]> {
    const followerAliases: string[] = [];
    let lastFollower: string | null = null;
    let hasMore = true;
    const batchSize = 100;

    while (hasMore) {
      const [followers, more] = await this.socialDao.getPageOfFollowers(
        authorAlias,
        batchSize,
        lastFollower
      );

      for (const follower of followers) {
        followerAliases.push(follower.alias);
      }

      hasMore = more;
      if (followers.length > 0) {
        lastFollower = followers[followers.length - 1].alias;
      } else {
        break;
      }
    }

    return followerAliases;
  }
}
