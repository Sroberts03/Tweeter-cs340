import { useContext } from "react";
import { UserInfoActionsContext, UserInfoContext } from "../contexts/UserInfoContexts";

export const useUserInfoActions = () => {
    return useContext(UserInfoActionsContext);
};

export const useUserInfo = () => {
    return useContext(UserInfoContext);
};