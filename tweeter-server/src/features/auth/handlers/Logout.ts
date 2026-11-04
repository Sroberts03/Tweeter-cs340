import { TweeterRequest, TweeterResponse } from "tweeter-shared";
import { AuthService } from "../AuthService";

export const handler = async (req: TweeterRequest): Promise<TweeterResponse> => {
    const service = new AuthService();
    await service.logout(req.token);
    return {success: true, message: "Logout successful"};
}