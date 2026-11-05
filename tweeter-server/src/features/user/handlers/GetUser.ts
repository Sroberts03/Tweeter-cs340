import { AuthToken, GetUserRequest, GetUserResponse, User } from "tweeter-shared";
import { UserService } from "../UserService";

export const handler = async (req: GetUserRequest): Promise<GetUserResponse> => {
    const { authToken, alias } = req;
    const service = new UserService();
    
    const user: User | null = await service.getUser(
        AuthToken.fromDto(authToken)!,
        alias
    )

    return {
        user: user ? user.dto : null,
        success: true,
        message: "User gotten successfully"
    }
}