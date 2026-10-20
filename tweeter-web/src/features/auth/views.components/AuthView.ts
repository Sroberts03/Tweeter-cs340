import { User, AuthToken } from "tweeter-shared";
import { View } from "../../../presenter/Presenter";

export interface AuthView extends View {
  updateUserInfo: (
    user: User,
    displayUser: User,
    authToken: AuthToken,
    rememberMe: boolean,
  ) => void;
  setIsLoading: (loading: boolean) => void;
  navigate: (path: string) => void;
}
