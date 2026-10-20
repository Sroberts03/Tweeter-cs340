import { AuthPresenter } from "./AuthPresenter";
import { AuthView } from "../views.components/AuthView";

export class LoginPresenter extends AuthPresenter<AuthView> {
    constructor(view: AuthView) {
        super(view);
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
        await this.doAuthentication(
            () => this.authService.login(alias, password),
            rememberMe,
            "log user in",
            originalUrl
        );
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