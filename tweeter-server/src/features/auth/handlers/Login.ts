import { AuthResponse, LoginRequest } from "tweeter-shared";
import { DynamoDaoFactory } from "../../../dal/dao/DynamoDaoFactory";
import { AuthService } from "../AuthService";

export const handler = async (req: LoginRequest): Promise<AuthResponse> => {
    const service = new AuthService(new DynamoDaoFactory());
    const [user, authToken] = await service.login(req.alias, req.password);
    return {user: user.dto, authToken: authToken.toDto(), success: true, message: "Login successful"};
} 