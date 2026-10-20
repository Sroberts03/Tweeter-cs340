import { AuthToken } from "tweeter-shared";
import { AuthService } from "../features/auth/models.service/AuthService";
import { BaseView } from "../views.components/BaseView";

export interface AppNavbarView extends BaseView {
    clearUserInfo: () => void;
}

export class AppNavbarPresenter {
    private view: AppNavbarView;
    private authService: AuthService;

    constructor(view: AppNavbarView) {
        this.view = view;
        this.authService = new AuthService();
    }

    public async logOut(
        authToken: AuthToken | null,
    ) {
        const loggingOutToastId = this.view.displayInfoMessage("Logging Out...", 0);

        try {
            await this.authService.logout(authToken!);

            this.view.deleteMessage(loggingOutToastId);
            this.view.clearUserInfo();
            this.view.navigate("/login");
        } catch (error) {
            this.view.displayErrorMessage(`Failed to log user out because of exception: ${error}`);
        }
    };
}