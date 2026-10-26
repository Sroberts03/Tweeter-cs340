import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { User } from "tweeter-shared/dist/model/domain/User";
import { Status } from "tweeter-shared/dist/model/domain/Status";
import { PostStatusPresenter, PostStatusView } from "../../../../src/features/post/presenters/postStatus/PostStatusPresenters";
import { anything, capture, instance, mock, spy, verify, when } from "@typestrong/ts-mockito";
import { StatusService } from "../../../../src/features/post/models.service/StatusService";

describe('PostStatusPresenter', () => {
    let mockPostStatusView: PostStatusView;
    let postStatusPresenter: PostStatusPresenter;
    let mockStatusService: StatusService;
    const authToken = new AuthToken("test-token", Date.now());
    const currentUser = new User("first", "last", "@alias", "imageUrl");
    const post = "test post";

    beforeEach(() => {
        mockPostStatusView = mock<PostStatusView>();
        const mockPostStatusViewInstance = instance(mockPostStatusView);
        when(mockPostStatusView.displayInfoMessage("Posting status...", 0)).thenReturn("mock-toast-id");

        const postStatusPresenterSpy = spy(new PostStatusPresenter(mockPostStatusViewInstance));
        postStatusPresenter = instance(postStatusPresenterSpy);

        mockStatusService = mock<StatusService>();
        when(postStatusPresenterSpy.statusService).thenReturn(instance(mockStatusService));
    });

    it('tells the view to display a posting status message', async () => {
        await postStatusPresenter.submitPost(authToken, currentUser, post);
        verify(mockPostStatusView.displayInfoMessage("Posting status...", 0)).once();
    });

    it('calls postStatus on the status service with the correct status string and auth token', async () => {
        await postStatusPresenter.submitPost(authToken, currentUser, post);
        verify(mockStatusService.postStatus(authToken, anything())).once();

        const [capturedAuthToken, capturedStatus] = capture(mockStatusService.postStatus).last();
        expect(capturedAuthToken).toEqual(authToken);
        expect((capturedStatus as Status).post).toEqual(post);
    });

    it('tells the view to clear the info message that was displayed previously, ' +
        'clear the post, and display a status posted message', async () => {
        await postStatusPresenter.submitPost(authToken, currentUser, post);
        verify(mockPostStatusView.deleteMessage("mock-toast-id")).once();
        verify(mockPostStatusView.setPost("")).once();
        verify(mockPostStatusView.displayInfoMessage("Status posted!", 2000)).once();
        verify(mockPostStatusView.displayErrorMessage(anything())).never();
    });

    it('tells the view to clear the info message and display an error message ' +
        'but does not tell it to clear the post or display a status posted message', async () => {
        const error = new Error("Post failed");
        when(mockStatusService.postStatus(anything(), anything())).thenThrow(error);
        await postStatusPresenter.submitPost(authToken, currentUser, post);
        verify(mockPostStatusView.deleteMessage("mock-toast-id")).once();
        verify(mockPostStatusView.displayErrorMessage(`Failed to post the status because of exception: ${error}`)).once();
        verify(mockPostStatusView.setPost(anything())).never();
        verify(mockPostStatusView.displayInfoMessage("Status posted!", anything())).never();
    });
});
