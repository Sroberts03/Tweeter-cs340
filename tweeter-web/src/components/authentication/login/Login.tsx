import "./Login.css";
import "bootstrap/dist/css/bootstrap.css";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import { AuthToken, User } from "tweeter-shared";
import AuthenticationFields from "../AuthenticationFields";
import { useMessageActions } from "../../toaster/MessageHooks";
import { useUserInfoActions } from "../../userInfo/userHooks";
import { LoginPresenter, LoginView } from "../../../presenter/LoginPresenter";

interface Props {
  originalUrl?: string;
}

const Login = (props: Props) => {
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();

  const listener: LoginView = {
    displayErrorMessage: (message: string): void => {
      displayErrorMessage(message);
    },
    updateUserInfo: (
      user: User, 
      displayUser: User, 
      authToken: AuthToken, 
      rememberMe: boolean
    ): void => {
      updateUserInfo(user, displayUser, authToken, rememberMe);
    },
    navigate: (path: string): void => {
      navigate(path);
    },
    setIsLoading: (loading: boolean): void => {
      setIsLoading(loading);
    }
  };

  const presenterRef = useRef<LoginPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = new LoginPresenter(listener);
  };

  const checkSubmitButtonStatus = (): boolean => {
    return presenterRef.current!.checkSubmitButtonStatus(alias, password);
  };

  const loginOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    presenterRef.current!.loginOnEnter(event, alias, password, rememberMe, props.originalUrl);
  };

  const inputFieldFactory = () => {
    return (
      <>
        <AuthenticationFields 
          onKeyDown={loginOnEnter}
          onAliasChange={(event) => setAlias(event.target.value)} 
          onPasswordChange={(event) => setPassword(event.target.value)} 
          isRegister={false}
        />
      </>
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div className="mb-3">
        Not registered? <Link to="/register">Register</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Sign In"
      submitButtonLabel="Sign in"
      oAuthHeading="Sign in with:"
      inputFieldFactory={inputFieldFactory}
      switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      setRememberMe={setRememberMe}
      submitButtonDisabled={checkSubmitButtonStatus}
      isLoading={isLoading}
      submit={
        () => 
          presenterRef.current!.doLogin(
            alias, 
            password, 
            rememberMe, 
            props.originalUrl
          )}
    />
  );
};

export default Login;
