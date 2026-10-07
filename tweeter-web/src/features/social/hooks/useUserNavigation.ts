import { useNavigate } from "react-router-dom";
import { AuthToken, FakeData, User } from "tweeter-shared";
import { useUserInfo, useUserInfoActions } from "./userHooks";
import { useMessageActions } from "../../../hooks/MessageHooks";

interface UserNavigation {
    navigateToUser: (event: React.MouseEvent, featureUrl: string) => Promise<void>;
    extractAlias: (value: string) => string;
    getUser: (authToken: AuthToken, alias: string) => Promise<User | null>;
}
export const useUserNavigation = (): UserNavigation => {
    const { displayErrorMessage } = useMessageActions();
    const { setDisplayedUser } = useUserInfoActions();
    const { displayedUser, authToken } = useUserInfo();
    const navigate = useNavigate();

    const navigateToUser = async (event: React.MouseEvent, featureUrl: string): Promise<void> => {
        event.preventDefault();

        try {
        const alias = extractAlias(event.target.toString());

        const toUser = await getUser(authToken!, alias);

        if (toUser) {
            if (!toUser.equals(displayedUser!)) {
            setDisplayedUser(toUser);
            navigate(`${featureUrl}/${toUser.alias}`);
            }
        }
        } catch (error) {
            displayErrorMessage(`Failed to get user because of exception: ${error}`);
        }
    };

    const extractAlias = (value: string): string => {
        const index = value.indexOf("@");
        return value.substring(index);
    };

    const getUser = async (
        authToken: AuthToken,
        alias: string
    ): Promise<User | null> => {
        // TODO: Replace with the result of calling server
        return FakeData.instance.findUserByAlias(alias);
    };

    return {
        navigateToUser: navigateToUser,
        extractAlias: extractAlias,
        getUser: getUser
    };
}