import { AuthToken, AuthorizedRequest, TweeterResponse } from "tweeter-shared";
import { AuthService } from "../AuthService";

export const handler = async (req: AuthorizedRequest): Promise<TweeterResponse> => {
    const service = new AuthService();
    await service.logout(AuthToken.fromDto(req.authToken)!);
    return {success: true, message: "Logout successful"};
}