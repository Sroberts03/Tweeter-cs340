import "./Register.css";
import "bootstrap/dist/css/bootstrap.css";
import { useRef } from "react";
import { ChangeEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthenticationFormLayout from "../AuthenticationFormLayout";
import { AuthToken, User } from "tweeter-shared";
import AuthenticationFields from "../AuthenticationFields";
import { useMessageActions } from "../../../../hooks/MessageHooks";
import { useUserInfoActions } from "../../../social/hooks/userHooks";
import { RegisterPresenter } from "../../presenters/RegisterPresenter";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [alias, setAlias] = useState("");
  const [password, setPassword] = useState("");
  const [imageBytes, setImageBytes] = useState<Uint8Array>(new Uint8Array());
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFileExtension, setImageFileExtension] = useState<string>("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();

  const listener = {
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
    },
    setImageUrl: (imageUrl: string): void => {
      setImageUrl(imageUrl);
    },
    setImageBytes: (imageBytes: Uint8Array): void => {
      setImageBytes(imageBytes);
    },
    setImageFileExtension: (imageFileExtension: string): void => {
      setImageFileExtension(imageFileExtension);
    },
  };
  const presenterRef = useRef<RegisterPresenter | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = new RegisterPresenter(listener);
  };

  const registerOnEnter = (event: React.KeyboardEvent<HTMLElement>) => {
    presenterRef.current!.registerOnEnter(
      event,
      firstName,
      lastName,
      alias,
      password,
      imageUrl,
      imageBytes,
      imageFileExtension,
      rememberMe
    );
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    presenterRef.current!.handleFileChange(event);
  };

  const doRegister = async () => {
    presenterRef.current!.doRegister(
      firstName,
      lastName,
      alias,
      password,
      imageBytes,
      imageFileExtension,
      rememberMe
    );
  };

  const inputFieldFactory = () => {
    return (
      <>
        <AuthenticationFields 
          onKeyDown={registerOnEnter}
          onFirstNameChange={(event) => setFirstName(event.target.value)}
          onLastNameChange={(event) => setLastName(event.target.value)}
          onAliasChange={(event) => setAlias(event.target.value)}
          onPasswordChange={(event) => setPassword(event.target.value)}
          isRegister={true}
        />
        <div className="form-floating mb-3">
          <input
            type="file"
            className="d-inline-block py-5 px-4 form-control bottom"
            id="imageFileInput"
            onKeyDown={registerOnEnter}
            onChange={handleFileChange}
          />
          {imageUrl.length > 0 && (
            <>
              <label htmlFor="imageFileInput">User Image</label>
              <img src={imageUrl} className="img-thumbnail" alt=""></img>
            </>
          )}
        </div>
      </>
    );
  };

  const switchAuthenticationMethodFactory = () => {
    return (
      <div className="mb-3">
        Already registered? <Link to="/login">Sign in</Link>
      </div>
    );
  };

  return (
    <AuthenticationFormLayout
      headingText="Please Register"
      submitButtonLabel="Register"
      oAuthHeading="Register with:"
      inputFieldFactory={inputFieldFactory}
      switchAuthenticationMethodFactory={switchAuthenticationMethodFactory}
      setRememberMe={setRememberMe}
      submitButtonDisabled={() => presenterRef.current!.checkSubmitButtonStatus(
        firstName,
        lastName,
        alias,
        password,
        imageUrl,
        imageFileExtension
      )}
      isLoading={isLoading}
      submit={doRegister}
    />
  );
};

export default Register;
