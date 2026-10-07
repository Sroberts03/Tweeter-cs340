import "./PostStatus.css";
import { useRef, useState } from "react";
import { useMessageActions } from "../../../../hooks/MessageHooks";
import { useUserInfo } from "../../../social/hooks/userHooks";
import { PostStatusPresenter, PostStatusView } from "../../presenters/postStatus/PostStatusPresenters";

const PostStatus = () => {
  const { displayInfoMessage, displayErrorMessage, deleteMessage } = useMessageActions();
  const { currentUser, authToken } = useUserInfo();
  const [post, setPost] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const listener: PostStatusView = {
    setIsLoading: (isLoading: boolean): void => {
      setIsLoading(isLoading);
    },
    displayInfoMessage: (message: string, duration: number): string => {
      return displayInfoMessage(message, duration);
    },
    deleteMessage: (messageId: string): void => {
      deleteMessage(messageId);
    },
    displayErrorMessage: (message: string): void => {
      displayErrorMessage(message);
    },
    setPost: (post: string): void => {
      setPost(post);
    }
  }
  const postStatusPresenter = useRef<PostStatusPresenter | null>(null);
  if (!postStatusPresenter.current) {
    postStatusPresenter.current = new PostStatusPresenter(listener);
  }

  const submitPost = async (event: React.MouseEvent) => {
    event.preventDefault();
    await postStatusPresenter.current!.submitPost(
      authToken!,
      currentUser!,
      post
    );
  };

  return (
    <form>
      <div className="form-group mb-3">
        <textarea
          className="form-control"
          id="postStatusTextArea"
          rows={10}
          placeholder="What's on your mind?"
          value={post}
          onChange={(event) => {
            setPost(event.target.value);
          }}
        />
      </div>
      <div className="form-group">
        <button
          id="postStatusButton"
          className="btn btn-md btn-primary me-1"
          type="button"
          disabled={postStatusPresenter.current!.checkButtonStatus(post, authToken, currentUser, isLoading) || false}
          style={{ width: "8em" }}
          onClick={submitPost}
        >
          {isLoading ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <div>Post Status</div>
          )}
        </button>
        <button
          id="clearStatusButton"
          className="btn btn-md btn-secondary"
          type="button"
          disabled={postStatusPresenter.current!.checkButtonStatus(post, authToken, currentUser, isLoading) || false}
          onClick={(event) => {
            event.preventDefault();
            postStatusPresenter.current!.clearPost();
          }}
        >
          Clear
        </button>
      </div>
    </form>
  );
};

export default PostStatus;
