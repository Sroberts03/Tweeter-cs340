import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../../models.service/StatusService";

export interface PostStatusView {
  setIsLoading: (isLoading: boolean) => void;
  displayInfoMessage: (message: string, duration: number) => string;
  deleteMessage: (messageId: string) => void;
  displayErrorMessage: (message: string) => void;
  setPost: (post: string) => void;
}

export class PostStatusPresenter {
  private _view: PostStatusView;
  private statusService: StatusService;

  constructor(view: PostStatusView) {
    this._view = view;
    this.statusService = new StatusService();
  }

  public async submitPost(
    event: React.MouseEvent,
    authToken: AuthToken,
    currentUser: User | null,
    post: string,
  ): Promise<void> {
    event.preventDefault();

    var postingStatusToastId = "";

    try {
      this._view.setIsLoading(true);
      postingStatusToastId = this._view.displayInfoMessage(
        "Posting status...",
        0,
      );

      const status = new Status(post, currentUser!, Date.now());

      await this.statusService.postStatus(authToken!, status);

      this._view.setPost("");
      this._view.displayInfoMessage("Status posted!", 2000);
    } catch (error) {
      this._view.displayErrorMessage(
        `Failed to post the status because of exception: ${error}`,
      );
    } finally {
      this._view.deleteMessage(postingStatusToastId);
      this._view.setIsLoading(false);
    }
  }

  public clearPost(event: React.MouseEvent) {
    event.preventDefault();
    this._view.setPost("");
  }

  public checkButtonStatus(
    post: string,
    authToken: AuthToken | null,
    currentUser: User | null,
    isLoading: boolean,
  ): boolean {
    return !post.trim() || !authToken || !currentUser || isLoading;
  }
}
