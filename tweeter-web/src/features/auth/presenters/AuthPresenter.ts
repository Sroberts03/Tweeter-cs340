import { AuthToken, User } from "tweeter-shared";
import { AuthService } from "../models.service/AuthService";
import { Presenter } from "../../../presenter/Presenter";
import { AuthView } from "../views.components/AuthView";

export abstract class AuthPresenter<T extends AuthView> extends Presenter<T> {
  protected authService: AuthService;

  constructor(view: T) {
    super(view);
    this.authService = new AuthService();
  }

  protected async doAuthentication(
    authenticate: () => Promise<[User, AuthToken]>,
    rememberMe: boolean,
    operationDescription: string,
    originalUrl?: string,
  ): Promise<void> {
    await this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);

      const [user, authToken] = await authenticate();

      this.view.updateUserInfo(user, user, authToken, rememberMe);

      if (!!originalUrl) {
        this.view.navigate(originalUrl);
      } else {
        this.view.navigate(`/feed/${user.alias}`);
      }
    }, operationDescription, () => {
      this.view.setIsLoading(false);
    });
  }
}
