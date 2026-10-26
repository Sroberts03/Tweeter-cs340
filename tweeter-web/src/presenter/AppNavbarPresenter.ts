import { AuthToken } from "tweeter-shared";
import { AuthService } from "../features/auth/models.service/AuthService";
import { MessageView, Presenter, View } from "./Presenter";

export interface AppNavbarView extends MessageView {
  clearUserInfo: () => void;
  navigate: (path: string) => void;
}

export class AppNavbarPresenter extends Presenter<AppNavbarView> {
  private _authService: AuthService;

  constructor(view: AppNavbarView) {
    super(view);
    this._authService = new AuthService();
  }

  public get authService(): AuthService {
    return this._authService;
  }

  public async logOut(authToken: AuthToken | null) {
    const loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);

    this.doFailureReportingOperation(async () => {
      await this.authService.logout(authToken!);

      this.view.deleteMessage(loggingOutToastId);
      this.view.clearUserInfo();
      this.view.navigate("/login");
    }, "log user out");
  }
}
