import { AuthToken, User } from "tweeter-shared";
import { DynamoDaoFactory } from "../../dal/dao/DynamoDaoFactory";
import { IDaoFactory } from "../../dal/interface/IDaoFactory";
import { Service } from "../../Service";
import { AuthorizationService } from "../auth/AuthorizationService";
import { ISocialDao } from "./dal/interface/ISocialDao";

type FollowPageType = "followers" | "followees";
type CountType = "followers" | "followees";

export class SocialService implements Service {
  private readonly socialDao: ISocialDao;
  private readonly authService: AuthorizationService;

  public constructor(daoFactory: IDaoFactory = new DynamoDaoFactory()) {
    this.socialDao = daoFactory.getSocialDao();
    this.authService = new AuthorizationService(daoFactory);
  }

  public async loadMoreFollowers(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastUser: User | null
  ): Promise<[User[], boolean]> {
    return this.fetchPagedRelationship(
      "followers",
      authToken,
      userAlias,
      pageSize,
      lastUser
    );
  }

  public async loadMoreFollowees(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastUser: User | null
  ): Promise<[User[], boolean]> {
    return this.fetchPagedRelationship(
      "followees",
      authToken,
      userAlias,
      pageSize,
      lastUser
    );
  }

  private async fetchPagedRelationship(
    type: FollowPageType,
    token: AuthToken,
    target: string,
    limit: number,
    cursor: User | null
  ): Promise<[User[], boolean]> {
    if (!target?.trim()) {
      throw new Error("[Bad Request] User alias is required");
    }

    await this.authService.validateToken(token);
    const lastAlias = cursor ? cursor.alias : null;

    return type === "followers"
      ? this.socialDao.getPageOfFollowers(target, limit, lastAlias)
      : this.socialDao.getPageOfFollowees(target, limit, lastAlias);
  }

  public async getIsFollowerStatus(
    authToken: AuthToken,
    user: User,
    selectedUser: User
  ): Promise<boolean> {
    if (!user?.alias || !selectedUser?.alias) {
      throw new Error("[Bad Request] Both user and selected user are required");
    }

    await this.authService.validateToken(authToken);
    return this.socialDao.isFollower(user.alias, selectedUser.alias);
  }

  public async getFolloweeCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    return this.retrieveCount("followees", authToken, user);
  }

  public async getFollowerCount(
    authToken: AuthToken,
    user: User
  ): Promise<number> {
    return this.retrieveCount("followers", authToken, user);
  }

  private async retrieveCount(
    type: CountType,
    token: AuthToken,
    user: User
  ): Promise<number> {
    if (!user?.alias) {
      throw new Error("[Bad Request] User alias is required");
    }

    await this.authService.validateToken(token);
    return type === "followers"
      ? this.socialDao.getFollowerCount(user.alias)
      : this.socialDao.getFolloweeCount(user.alias);
  }

  public async follow(
    authToken: AuthToken,
    userToFollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.modifyRelationship(true, authToken, userToFollow);
  }

  public async unfollow(
    authToken: AuthToken,
    userToUnfollow: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    return this.modifyRelationship(false, authToken, userToUnfollow);
  }

  private async modifyRelationship(
    isFollow: boolean,
    token: AuthToken,
    target: User
  ): Promise<[followerCount: number, followeeCount: number]> {
    if (!target?.alias) {
      throw new Error("[Bad Request] Target user is required");
    }

    const caller = await this.authService.validateToken(token);
    if (isFollow) {
      await this.socialDao.follow(caller, target.alias);
    } else {
      await this.socialDao.unfollow(caller, target.alias);
    }

    const followerCount = await this.socialDao.getFollowerCount(target.alias);
    const followeeCount = await this.socialDao.getFolloweeCount(target.alias);

    return [followerCount, followeeCount];
  }
}
