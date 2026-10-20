import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../../../model.service/UserService";
import { Presenter, View } from "../../../presenter/Presenter";

export interface UserNavigationView extends View {
  setDisplayedUser: (user: User) => void;
  navigate: (path: string) => void;
}

export class UserNavigationPresenter extends Presenter<UserNavigationView> {
  private userService: UserService;

  constructor(view: UserNavigationView) {
    super(view);
    this.userService = new UserService();
  }

  public async navigateToUser(
    clickedValue: string,
    featureUrl: string,
    authToken: AuthToken,
    displayedUser: User,
  ): Promise<void> {
    this.doFailureReportingOperation(async () => {
      const alias = this.extractAlias(clickedValue);

      const toUser = await this.userService.getUser(authToken, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser)) {
          this.view.setDisplayedUser(toUser);
          this.view.navigate(`${featureUrl}/${toUser.alias}`);
        }
      }
    }, "get user");
  }

  public extractAlias(value: string): string {
    const index = value.indexOf("@");
    return value.substring(index);
  }
}
