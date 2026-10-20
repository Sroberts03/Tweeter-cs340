import { AuthToken, User } from "tweeter-shared";
import { AuthService } from "../models.service/AuthService";
import { BaseView } from "../../../views.components/BaseView";

export interface LoginView extends BaseView {
  updateUserInfo: (user: User, displayUser: User, authToken: AuthToken, rememberMe: boolean) => void;
}

export class LoginPresenter {
    private view: LoginView;
    private authService: AuthService;

    constructor(view: LoginView) {
        this.view = view;
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
        try {
            this.view.setIsLoading(true);

            const [user, authToken] = await this.authService.login(alias, password);

            this.view.updateUserInfo(user, user, authToken, rememberMe);

            if (!!originalUrl) {
                this.view.navigate(originalUrl);
            } else {
                this.view.navigate(`/feed/${user.alias}`);
            }
        } catch (error) {
            this.view.displayErrorMessage(`Failed to log user in because of exception: ${error}`);
        } finally {
            this.view.setIsLoading(false);
        }
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