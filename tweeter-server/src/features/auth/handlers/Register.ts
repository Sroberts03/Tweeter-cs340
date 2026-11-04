import { AuthResponse, RegisterRequest } from "tweeter-shared";
import { AuthService } from "../AuthService";

export const handler = async (req: RegisterRequest): Promise<AuthResponse> => {
  const service = new AuthService();
  const [user, authToken] = await service.register(
    req.firstName,
    req.lastName,
    req.alias,
    req.password,
    req.userImageBytes,
    req.imageFileExtension,
  );
  return {
    user: user.dto,
    authToken: authToken.dto,
    success: true,
    message: "Registration successful",
  };
};
