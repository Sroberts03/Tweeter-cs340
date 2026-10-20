import { AuthToken, User } from "tweeter-shared";
import { AuthService } from "../models.service/AuthService";
import { Presenter, View } from "../../../presenter/Presenter";

export interface LoginView extends View {
  updateUserInfo: (user: User, displayUser: User, authToken: AuthToken, rememberMe: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  navigate: (path: string) => void;
}

export class LoginPresenter extends Presenter<LoginView> {
    private authService: AuthService;

    constructor(view: LoginView) {
        super(view);
        this.authService = new AuthService();
    }

    public checkSubmitButtonStatus(alias: string, password: string): boolean {
        return !alias || !password;
    }

    public async doLogin(
        alias: string, 
        password: string, 
        rememberMe: boolean, 
        originalUrl: string | undefined
    ): Promise<void> {
        this.doFailureReportingOperation(async () => {
            this.view.setIsLoading(true);

            const [user, authToken] = await this.authService.login(alias, password);

            this.view.updateUserInfo(user, user, authToken, rememberMe);

            if (!!originalUrl) {
                this.view.navigate(originalUrl);
            } else {
                this.view.navigate(`/feed/${user.alias}`);
            }
        }, "log user in", () => {
            this.view.setIsLoading(false);
        });
    };

    public loginOnEnter (
        key: string,
        alias: string,
        password: string,
        rememberMe: boolean,
        originalUrl: string | undefined
    ): void {
        if (key == "Enter" && !this.checkSubmitButtonStatus(alias, password)) {
            this.doLogin(alias, password, rememberMe, originalUrl);
        }
    };
};