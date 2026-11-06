import { AuthToken, User } from "tweeter-shared";
import { Service } from "../../../model.service/Service";
import { SocialFacade } from "../facade.net/SocialFacade";

export class SocialService implements Service {
    constructor() {}

    public async loadMoreFollowers(
        authToken: AuthToken,
        userAlias: string,
        pageSize: number,
        lastUser: User | null
      ): Promise<[User[], boolean]> {
        const facade = new SocialFacade();
        return facade.loadMoreFollowers({
          authToken: authToken.toDto(),
          userAlias,
          pageSize,
          lastItem: lastUser?.dto ?? null,
        });
      };

      public async loadMoreFollowees(
        authToken: AuthToken,
        userAlias: string,
        pageSize: number,
        lastUser: User | null
      ): Promise<[User[], boolean]> {
        const facade = new SocialFacade();
        return facade.loadMoreFollowees({
          authToken: authToken.toDto(),
          userAlias,
          pageSize,
          lastItem: lastUser?.dto ?? null,
        });
      };

      public async getIsFollowerStatus(
        authToken: AuthToken,
        user: User,
        selectedUser: User
      ): Promise<boolean> {
        const facade = new SocialFacade();
        return facade.getIsFollowerStatus({
          authToken: authToken.toDto(),
          user: user.dto,
          selectedUser: selectedUser.dto,
        });
      };

      public async getFolloweeCount(
        authToken: AuthToken,
        user: User
      ): Promise<number> {
        const facade = new SocialFacade();
        return facade.getFolloweeCount({
          authToken: authToken.toDto(),
          user: user.dto,
        });
      };

      public async getFollowerCount(
        authToken: AuthToken,
        user: User
      ): Promise<number> {
        const facade = new SocialFacade();
        return facade.getFollowerCount({
          authToken: authToken.toDto(),
          user: user.dto,
        });
      };

      public async follow(
        authToken: AuthToken,
        userToFollow: User
      ): Promise<[followerCount: number, followeeCount: number]> {
        const facade = new SocialFacade();
        return facade.follow({
          authToken: authToken.toDto(),
          user: userToFollow.dto,
        });
      };

      public async unfollow(
        authToken: AuthToken,
        userToUnfollow: User
      ): Promise<[followerCount: number, followeeCount: number]> {
        const facade = new SocialFacade();
        return facade.unfollow({
          authToken: authToken.toDto(),
          user: userToUnfollow.dto,
        });
      };
}
