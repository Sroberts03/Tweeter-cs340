import { AuthResponse, LoginRequest } from "tweeter-shared";
import { AuthService } from "../AuthService";

export const handler = async (req: LoginRequest): Promise<AuthResponse> => {
    const service = new AuthService();
    const [user, authToken] = await service.login(req.alias, req.password);
    return {user: user.dto, authToken: authToken.dto, success: true, message: "Login successful"};
} 