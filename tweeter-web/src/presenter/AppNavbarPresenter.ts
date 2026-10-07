import { AuthToken } from "tweeter-shared";
import { AuthService } from "../features/auth/models.service/AuthService";

export interface AppNavbarView {
    displayInfoMessage: (message: string, duration: number) => string;
    displayErrorMessage: (message: string) => void;
    deleteMessage: (messageId: string) => void;
    clearUserInfo: () => void;
    navigate: (path: string) => void;
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