import { MemoryRouter } from "react-router-dom";
import PostStatus from "../../../../../src/features/post/views.components/postStatus/PostStatus";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { PostStatusPresenter } from "../../../../../src/features/post/presenters/postStatus/PostStatusPresenters";
import { instance, mock, verify } from "@typestrong/ts-mockito";
import { AuthToken, User } from "tweeter-shared";
import { useUserInfo } from "../../../../../src/features/social/hooks/userHooks";

jest.mock("../../../../../src/features/social/hooks/userHooks", () => ({
  ...jest.requireActual("../../../../../src/features/social/hooks/userHooks"),
  __esModule: true,
  useUserInfo: jest.fn(),
}));

describe("PostStatus View", () => {
  library.add(fab);

  const mockUserInstance = instance(mock<User>());
  const mockAuthTokenInstance = instance(mock<AuthToken>());

  beforeAll(() => {
    (useUserInfo as jest.Mock).mockReturnValue({
      currentUser: mockUserInstance,
      authToken: mockAuthTokenInstance,
    });
  });

  it("starts with the post status and clear buttons disabled", () => {
    const { postStatusButton, clearButton } = renderPostStatusAndGetElements();
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("enables both buttons when the text field has text", async () => {
    const { user, postStatusButton, clearButton, postStatusInput } =
      renderPostStatusAndGetElements();
    await user.type(postStatusInput, "Hello world");
    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();
  });

  it("disables both buttons when the text field is cleared", async () => {
    const { user, postStatusButton, clearButton, postStatusInput } =
      renderPostStatusAndGetElements();
    await user.type(postStatusInput, "Hello world");
    expect(postStatusButton).toBeEnabled();
    expect(clearButton).toBeEnabled();

    await user.clear(postStatusInput);
    expect(postStatusButton).toBeDisabled();
    expect(clearButton).toBeDisabled();
  });

  it("calls the presenter's submitPost method with correct parameters when the post status button is pressed", async () => {
    const mockPostStatusPresenter = mock<PostStatusPresenter>();
    const mockPostStatusPresenterInstance = instance(mockPostStatusPresenter);
    const { user, postStatusButton, postStatusInput } =
      renderPostStatusAndGetElements(mockPostStatusPresenterInstance);

    const post = "Hello world";
    await user.type(postStatusInput, post);
    expect(postStatusButton).toBeEnabled();
    await user.click(postStatusButton);

    verify(mockPostStatusPresenter.submitPost(
      mockAuthTokenInstance,
      mockUserInstance,
      post
    )).once();
  });
});

function renderPostStatus(presenter?: PostStatusPresenter) {
  return render(
    <MemoryRouter>
      {!!presenter ? (
        <PostStatus presenter={presenter} />
      ) : (
        <PostStatus />
      )}
    </MemoryRouter>,
  );
}

function renderPostStatusAndGetElements(presenter?: PostStatusPresenter) {
  const user = userEvent.setup();
  renderPostStatus(presenter);
  const postStatusButton = screen.getByRole("button", { name: /Post Status/i });
  const clearButton = screen.getByRole("button", { name: /Clear/i });
  const postStatusInput = screen.getByLabelText(/postStatusText/i);
  return { user, postStatusButton, clearButton, postStatusInput };
}
