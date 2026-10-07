import { AuthToken, User } from "tweeter-shared";
import { FollowService } from "../models.service/FollowService";

export interface UserInfoView {
  setIsFollower: (isFollower: boolean) => void;
  setFolloweeCount: (count: number) => void;
  setFollowerCount: (count: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  displayInfoMessage: (message: string, duration: number) => string;
  displayErrorMessage: (message: string) => void;
  deleteMessage: (messageId: string) => void;
  setDisplayedUser: (user: User) => void;
  navigate: (path: string) => void;
}

export class UserInfoPresenter {
  private _view: UserInfoView;
  private followService: FollowService;

  constructor(view: UserInfoView) {
    this._view = view;
    this.followService = new FollowService();
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User,
  ): Promise<void> {
    try {
      if (currentUser === displayedUser) {
        this._view.setIsFollower(false);
      } else {
        this._view.setIsFollower(
          await this.followService.getIsFollowerStatus(
            authToken,
            currentUser,
            displayedUser,
          ),
        );
      }
    } catch (error) {
      this._view.displayErrorMessage(
        `Failed to determine follower status because of exception: ${error}`,
      );
    }
  }

  public async setNumbFollowees(
    authToken: AuthToken,
    displayedUser: User,
  ): Promise<void> {
    try {
      this._view.setFolloweeCount(
        await this.followService.getFolloweeCount(authToken, displayedUser),
      );
    } catch (error) {
      this._view.displayErrorMessage(
        `Failed to get followees count because of exception: ${error}`,
      );
    }
  }

  public async setNumbFollowers(
    authToken: AuthToken,
    displayedUser: User,
  ): Promise<void> {
    try {
      this._view.setFollowerCount(
        await this.followService.getFollowerCount(authToken, displayedUser),
      );
    } catch (error) {
      this._view.displayErrorMessage(
        `Failed to get followers count because of exception: ${error}`,
      );
    }
  }

  public switchToLoggedInUser(currentUser: User, pathname: string): void {
    this._view.setDisplayedUser(currentUser);
    this._view.navigate(`${this.getBaseUrl(pathname)}/${currentUser.alias}`);
  }

  public getBaseUrl(pathname: string): string {
    const segments = pathname.split("/@");
    return segments.length > 1 ? segments[0] : "/";
  }

  public async followDisplayedUser(
    authToken: AuthToken,
    displayedUser: User,
  ): Promise<void> {
    var followingUserToast = "";

    try {
      this._view.setIsLoading(true);
      followingUserToast = this._view.displayInfoMessage(
        `Following ${displayedUser.name}...`,
        0,
      );

      const [followerCount, followeeCount] = await this.followService.follow(
        authToken,
        displayedUser,
      );

      this._view.setIsFollower(true);
      this._view.setFollowerCount(followerCount);
      this._view.setFolloweeCount(followeeCount);
    } catch (error) {
      this._view.displayErrorMessage(
        `Failed to follow user because of exception: ${error}`,
      );
    } finally {
      this._view.deleteMessage(followingUserToast);
      this._view.setIsLoading(false);
    }
  }

  public async unfollowDisplayedUser(
    authToken: AuthToken,
    displayedUser: User,
  ): Promise<void> {
    var unfollowingUserToast = "";

    try {
      this._view.setIsLoading(true);
      unfollowingUserToast = this._view.displayInfoMessage(
        `Unfollowing ${displayedUser.name}...`,
        0,
      );

      const [followerCount, followeeCount] = await this.followService.unfollow(
        authToken,
        displayedUser,
      );

      this._view.setIsFollower(false);
      this._view.setFollowerCount(followerCount);
      this._view.setFolloweeCount(followeeCount);
    } catch (error) {
      this._view.displayErrorMessage(
        `Failed to unfollow user because of exception: ${error}`,
      );
    } finally {
      this._view.deleteMessage(unfollowingUserToast);
      this._view.setIsLoading(false);
    }
  }
}
