import { AuthToken, User } from "tweeter-shared";
import { UserService } from "../../../model.service/UserService";

export interface UserNavigationView {
  setDisplayedUser: (user: User) => void;
  navigate: (path: string) => void;
  displayErrorMessage: (message: string) => void;
}

export class UserNavigationPresenter {
  private _view: UserNavigationView;
  private userService: UserService;

  constructor(view: UserNavigationView) {
    this._view = view;
    this.userService = new UserService();
  }

  public async navigateToUser(
    clickedValue: string,
    featureUrl: string,
    authToken: AuthToken,
    displayedUser: User,
  ): Promise<void> {
    try {
      const alias = this.extractAlias(clickedValue);

      const toUser = await this.userService.getUser(authToken, alias);

      if (toUser) {
        if (!toUser.equals(displayedUser)) {
          this._view.setDisplayedUser(toUser);
          this._view.navigate(`${featureUrl}/${toUser.alias}`);
        }
      }
    } catch (error) {
      this._view.displayErrorMessage(
        `Failed to get user because of exception: ${error}`,
      );
    }
  }

  public extractAlias(value: string): string {
    const index = value.indexOf("@");
    return value.substring(index);
  }
}
