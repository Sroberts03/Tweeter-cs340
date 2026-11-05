import {
  AuthorizedRequest,
  AuthResponse,
  AuthToken,
  LoginRequest,
  RegisterRequest,
  TweeterResponse,
  User,
} from "tweeter-shared";
import { ClientCommunicator } from "tweeter-web/net/ClientComunicator";

export class AuthFacade {
  private SERVER_URL: string = import.meta.env.VITE_SERVER_URL;
  private clientCommunicator: ClientCommunicator = new ClientCommunicator(
    this.SERVER_URL + "/auth",
  );

  public async login(request: LoginRequest): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      LoginRequest,
      AuthResponse
    >(request, "/login");

    return this.handleAuthResponse(response);
  }

  public async register(request: RegisterRequest): Promise<[User, AuthToken]> {
    const response = await this.clientCommunicator.doPost<
      RegisterRequest,
      AuthResponse
    >(request, "/register");

    return this.handleAuthResponse(response);
  }

  public async logout(request: AuthorizedRequest): Promise<void> {
    const response = await this.clientCommunicator.doPost<
      AuthorizedRequest,
      TweeterResponse
    >(request, "/logout");

    // Handle errors
    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }

  // Shared by login and register: convert the DTOs to domain objects and handle errors
  private handleAuthResponse(response: AuthResponse): [User, AuthToken] {
    const user: User | null =
      response.success && response.user ? User.fromDto(response.user) : null;
    const authToken: AuthToken | null =
      response.success && response.authToken
        ? AuthToken.fromDto(response.authToken)
        : null;

    if (response.success) {
      if (user == null || authToken == null) {
        throw new Error(`No user or auth token returned`);
      } else {
        return [user, authToken];
      }
    } else {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }
  }
}
