import { AuthToken, User } from "tweeter-shared";
import { SocialService } from "../models.service/SocialService";
import { MessageView, Presenter, View } from "../../../presenter/Presenter";

export interface UserInfoView extends MessageView {
  setIsFollower: (isFollower: boolean) => void;
  setFolloweeCount: (count: number) => void;
  setFollowerCount: (count: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setDisplayedUser: (user: User) => void;
  navigate: (path: string) => void;
}

export class UserInfoPresenter extends Presenter<UserInfoView> {
  private socialService: SocialService;

  constructor(view: UserInfoView) {
    super(view);
    this.socialService = new SocialService();
  }

  public async setIsFollowerStatus(
    authToken: AuthToken,
    currentUser: User,
    displayedUser: User,
  ): Promise<void> {
    this.doFailureReportingOperation(async () => {
      if (currentUser === displayedUser) {
        this.view.setIsFollower(false);
      } else {
        this.view.setIsFollower(
          await this.socialService.getIsFollowerStatus(
            authToken,
            currentUser,
            displayedUser,
          ),
        );
      }
    }, "determine follower status");
  }

  public async setNumbFollowees(
    authToken: AuthToken,
    displayedUser: User,
  ): Promise<void> {
    this.doFailureReportingOperation(async () => {
      this.view.setFolloweeCount(
        await this.socialService.getFolloweeCount(authToken, displayedUser),
      );
    }, "get followees count");
  }

  public async setNumbFollowers(
    authToken: AuthToken,
    displayedUser: User,
  ): Promise<void> {
    this.doFailureReportingOperation(async () => {
      this.view.setFollowerCount(
        await this.socialService.getFollowerCount(authToken, displayedUser),
      );
    }, "get followers count");
  }

  public switchToLoggedInUser(currentUser: User, pathname: string): void {
    this.view.setDisplayedUser(currentUser);
    this.view.navigate(`${this.getBaseUrl(pathname)}/${currentUser.alias}`);
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
    this.doFailureReportingOperation(
      async () => {
        this.view.setIsLoading(true);
        followingUserToast = this.view.displayInfoMessage(
          `Following ${displayedUser.name}...`,
          0,
        );

        const [followerCount, followeeCount] = await this.socialService.follow(
          authToken,
          displayedUser,
        );

        this.view.setIsFollower(true);
        this.view.setFollowerCount(followerCount);
        this.view.setFolloweeCount(followeeCount);
      },
      "follow user",
      () => {
        this.view.deleteMessage(followingUserToast);
        this.view.setIsLoading(false);
      },
    );
  }

  public async unfollowDisplayedUser(
    authToken: AuthToken,
    displayedUser: User,
  ): Promise<void> {
    var unfollowingUserToast = "";
    this.doFailureReportingOperation(
      async () => {
        this.view.setIsLoading(true);
        unfollowingUserToast = this.view.displayInfoMessage(
          `Unfollowing ${displayedUser.name}...`,
          0,
        );

        const [followerCount, followeeCount] =
          await this.socialService.unfollow(authToken, displayedUser);

        this.view.setIsFollower(false);
        this.view.setFollowerCount(followerCount);
        this.view.setFolloweeCount(followeeCount);
      },
      "unfollow user",
      () => {
        this.view.deleteMessage(unfollowingUserToast);
        this.view.setIsLoading(false);
      },
    );
  }
}
