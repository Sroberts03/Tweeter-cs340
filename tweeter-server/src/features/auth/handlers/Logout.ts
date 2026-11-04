import { AuthorizedRequest, TweeterResponse } from "tweeter-shared";
import { AuthService } from "../AuthService";

export const handler = async (req: AuthorizedRequest): Promise<TweeterResponse> => {
    const service = new AuthService();
    await service.logout(req.token);
    return {success: true, message: "Logout successful"};
}