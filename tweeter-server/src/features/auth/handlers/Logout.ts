import { AuthToken, AuthorizedRequest, TweeterResponse } from "tweeter-shared";
import { DynamoDaoFactory } from "../../../dal/dao/DynamoDaoFactory";
import { AuthService } from "../AuthService";

export const handler = async (req: AuthorizedRequest): Promise<TweeterResponse> => {
    const service = new AuthService(new DynamoDaoFactory());
    await service.logout(AuthToken.fromDto(req.authToken)!);
    return {success: true, message: "Logout successful"};
}