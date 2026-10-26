import { MemoryRouter } from "react-router-dom";
import Login from "../../../../../src/features/auth/views.components/login/Login";
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { LoginPresenter } from "../../../../../src/features/auth/presenters/LoginPresenter";
import { instance, mock, verify } from "@typestrong/ts-mockito";

describe("Login View", () => {
  library.add(fab);

  it("starts with sign in button disabled", () => {
    const { signInButton } = renderLoginAndGetElements("/");
    expect(signInButton).toBeDisabled();
  });

  it("enables the sign in button when alias and password are entered", async () => {
    const { user, signInButton, aliasInput, passwordInput } =
      renderLoginAndGetElements("/");
    await user.type(aliasInput, "testuser");
    await user.type(passwordInput, "testpassword");
    expect(signInButton).toBeEnabled();
  });

  it("disables the sign in button when alias or password is cleared", async () => {
    const { user, signInButton, aliasInput, passwordInput } =
      renderLoginAndGetElements("/");
    await user.type(aliasInput, "testuser");
    await user.type(passwordInput, "testpassword");
    expect(signInButton).toBeEnabled();

    await user.clear(aliasInput);
    expect(signInButton).toBeDisabled();

    await user.type(aliasInput, "testuser");
    expect(signInButton).toBeEnabled();

    await user.clear(passwordInput);
    expect(signInButton).toBeDisabled();
  });

  it("calls the presenter's login method with correct parameters when the sign-in button is pressed", async () => {
    const mockLoginPresenter = mock<LoginPresenter>();
    const mockLoginPresenterInstance = instance(mockLoginPresenter);
    const { user, signInButton, aliasInput, passwordInput } =
      renderLoginAndGetElements("/original-url", mockLoginPresenterInstance);

    const originalUrl = "/original-url";
    const alias = "testuser";
    const password = "testpassword";
    
    const rememberMe = false;
    await user.type(aliasInput, alias);
    await user.type(passwordInput, password);
    expect(signInButton).toBeEnabled();
    await user.click(signInButton);

    verify(mockLoginPresenter.doLogin(
      alias,
      password,
      rememberMe,
      originalUrl
    )).once();
  });
});

function renderLogin(originalUrl: string, presenter?: LoginPresenter) {
  return render(
    <MemoryRouter>
      {!!presenter ? (
        <Login originalUrl={originalUrl} presenter={presenter} />
      ) : (
        <Login originalUrl={originalUrl} />
      )}
    </MemoryRouter>,
  );
}

function renderLoginAndGetElements(
  originalUrl: string,
  presenter?: LoginPresenter,
) {
  const user = userEvent.setup();
  renderLogin(originalUrl, presenter);
  const signInButton = screen.getByRole("button", { name: /Sign in/i });
  const aliasInput = screen.getByLabelText(/alias/i);
  const passwordInput = screen.getByLabelText(/password/i);
  return { user, signInButton, aliasInput, passwordInput };
}
