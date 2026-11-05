import { GetUserRequest, GetUserResponse, User } from "tweeter-shared";
import { ClientCommunicator } from "../../net/ClientComunicator";

export class UserFacade {
  private SERVER_URL: string = import.meta.env.VITE_SERVER_URL;
  private clientCommunicator: ClientCommunicator = new ClientCommunicator(
    this.SERVER_URL,
  );

  public async getUser(req: GetUserRequest): Promise<User | null> {
    const response = await this.clientCommunicator.doPost<
      GetUserRequest,
      GetUserResponse
    >(req, "/user/get");

    return this.handleGetUserResponse(response);
  }

  private handleGetUserResponse(res: GetUserResponse): User | null {
    if (!res.success) {
      console.error(res);
      throw new Error(res.message ?? undefined);
    }

    const user: User | null = res.user ? User.fromDto(res.user) : null;

    return user;
  }
}
