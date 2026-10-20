import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthToken, User } from "tweeter-shared";
import { useMessageActions } from "../../../hooks/MessageHooks";
import { useUserInfoActions } from "../../social/hooks/userHooks";
import { AuthView } from "../views.components/AuthView";

export const useAuthView = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { updateUserInfo } = useUserInfoActions();
  const { displayErrorMessage } = useMessageActions();

  const authView: AuthView = {
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
  };

  return { authView, rememberMe, setRememberMe, isLoading };
};
