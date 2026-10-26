import "./Login.css";
import "bootstrap/dist/css/bootstrap.css";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import AuthenticationFields from "../AuthenticationFields";
import { LoginPresenter } from "../../presenters/LoginPresenter";
import { useAuthView } from "../../hooks/authHooks";

interface Props {
  originalUrl?: string;
  presenter?: LoginPresenter;
}

const Login = (props: Props) => {
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const { authView, rememberMe, setRememberMe, isLoading } = useAuthView();

  const presenterRef = useRef<LoginPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = props.presenter || new LoginPresenter(authView);
  };

  useEffect(() => {
    presenterRef.current = props.presenter || new LoginPresenter(authView);
  }, [rememberMe]);

  const checkSubmitButtonStatus = (): boolean => {
    return presenterRef.current!.checkSubmitButtonStatus(alias, password);
  };

  const loginOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    presenterRef.current!.loginOnEnter(event.key, alias, password, rememberMe, props.originalUrl);
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
