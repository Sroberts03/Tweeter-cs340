import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "tweeter-shared";
import { useUserInfo, useUserInfoActions } from "./userHooks";
import { useMessageActions } from "../../../hooks/MessageHooks";
import { UserNavigationPresenter, UserNavigationView } from "../presenters/UserNavigationPresenter";

interface UserNavigation {
    navigateToUser: (event: React.MouseEvent, featureUrl: string) => Promise<void>;
}
export const useUserNavigation = (): UserNavigation => {
    const { displayErrorMessage } = useMessageActions();
    const { setDisplayedUser } = useUserInfoActions();
    const { displayedUser, authToken } = useUserInfo();
    const navigate = useNavigate();

    const listener: UserNavigationView = {
        setDisplayedUser: (user: User) => {
            setDisplayedUser(user);
        },
        navigate: (path: string) => {
            navigate(path);
        },
        displayErrorMessage: (message: string) => {
            displayErrorMessage(message);
        },
    };
    const presenterRef = useRef<UserNavigationPresenter | null>(null);
    if (!presenterRef.current) {
        presenterRef.current = new UserNavigationPresenter(listener);
    }

    const navigateToUser = async (event: React.MouseEvent, featureUrl: string): Promise<void> => {
        event.preventDefault();
        await presenterRef.current!.navigateToUser(
            event.target.toString(),
            featureUrl,
            authToken!,
            displayedUser!
        );
    };

    return {
        navigateToUser: navigateToUser
    };
}
