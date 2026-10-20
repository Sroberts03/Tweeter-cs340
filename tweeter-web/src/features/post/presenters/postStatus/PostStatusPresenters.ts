import { AuthToken, Status, User } from "tweeter-shared";
import { StatusService } from "../../models.service/StatusService";
import { MessageView, Presenter } from "../../../../presenter/Presenter";

export interface PostStatusView extends MessageView {
  setPost: (post: string) => void;
  setIsLoading: (loading: boolean) => void;
}

export class PostStatusPresenter extends Presenter<PostStatusView> {
  private statusService: StatusService;

  constructor(view: PostStatusView) {
    super(view);
    this.statusService = new StatusService();
  }

  public async submitPost(
    authToken: AuthToken,
    currentUser: User | null,
    post: string,
  ): Promise<void> {
    var postingStatusToastId = "";
    this.doFailureReportingOperation(async () => {
      this.view.setIsLoading(true);
      postingStatusToastId = this.view.displayInfoMessage(
        "Posting status...",
        0,
      );

      const status = new Status(post, currentUser!, Date.now());

      await this.statusService.postStatus(authToken!, status);

      this.view.setPost("");
      this.view.displayInfoMessage("Status posted!", 2000);
    }, "post the status", () => {
      this.view.deleteMessage(postingStatusToastId);
      this.view.setIsLoading(false);
    });
  }

  public clearPost() {
    this.view.setPost("");
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
