import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { AppNavbarPresenter, AppNavbarView } from "../../src/presenter/AppNavbarPresenter";
import { anything, instance, mock, spy, verify, when } from "@typestrong/ts-mockito";
import { AuthService } from "../../src/features/auth/models.service/AuthService";

describe('AppNavbarPresenter', () => {
    let mockAppNavbarPresenterView: AppNavbarView ;
    let appNavbarPresenter: AppNavbarPresenter;
    let mockAuthService: AuthService;
    const authToken = new AuthToken("test-token", Date.now());

    beforeEach(() => {
        mockAppNavbarPresenterView = mock<AppNavbarView>();
        const mockAppNavbarPresenterViewInstance = instance(mockAppNavbarPresenterView);
        when(mockAppNavbarPresenterView.displayInfoMessage(anything(), 0)).thenReturn("mock-toast-id");

        const appNavbarPresenterSpy = spy(new AppNavbarPresenter(mockAppNavbarPresenterViewInstance));
        appNavbarPresenter = instance(appNavbarPresenterSpy);

        mockAuthService = mock<AuthService>();
        when(appNavbarPresenterSpy.authService).thenReturn(instance(mockAuthService));
    });

    it('tells the view to display a logging out message', async () => {
        await appNavbarPresenter.logOut(authToken);
        verify(mockAppNavbarPresenterView.displayInfoMessage("Logging Out...", 0)).once();
    });

    it('logout on the user service with the correct auth token', async () => {
        await appNavbarPresenter.logOut(authToken);
        verify(mockAuthService.logout(authToken)).once();
    });

    it('tells the view to clear the info message that was displayed previously,' +
        'clear the user info, and navigate to the login page.', async () => {
        await appNavbarPresenter.logOut(authToken);
        verify(mockAppNavbarPresenterView.deleteMessage("mock-toast-id")).once();
        verify(mockAppNavbarPresenterView.clearUserInfo()).once();
        verify(mockAppNavbarPresenterView.navigate("/login")).once();
        verify(mockAppNavbarPresenterView.displayErrorMessage(anything())).never();
    });

    it('tells the view to display an error message ' +
        'and does not tell it to clear the info message, clear the user info or navigate to the login page.', async () => {
        const error = new Error("Logout failed");    
        when(mockAuthService.logout(anything())).thenThrow(error);
        await appNavbarPresenter.logOut(authToken);
        verify(mockAppNavbarPresenterView.displayErrorMessage(`Failed to log user out because of exception: ${error}`)).once();
        verify(mockAppNavbarPresenterView.deleteMessage(anything())).never();
        verify(mockAppNavbarPresenterView.clearUserInfo()).never();
        verify(mockAppNavbarPresenterView.navigate("/login")).never();
    });
});
