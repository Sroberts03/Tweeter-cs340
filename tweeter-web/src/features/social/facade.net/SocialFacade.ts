import { FollowResponse, UserRequest } from "tweeter-shared";
import { ClientCommunicator } from "../../../../net/ClientComunicator";

export class SocialFacade {
  private SERVER_URL: string = import.meta.env.VITE_SERVER_URL;
  private clientCommunicator: ClientCommunicator = new ClientCommunicator(
    this.SERVER_URL,
  );

  public async follow(
    request: UserRequest,
  ): Promise<[followerCount: number, followeeCount: number]> {
    const response = await this.clientCommunicator.doPost<
      UserRequest,
      FollowResponse
    >(request, "/follow");

    return this.handleFollowResponse(response);
  }

  private handleFollowResponse(
    response: FollowResponse,
  ): [followerCount: number, followeeCount: number] {
    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }

    return [response.followerCount, response.followeeCount];
  }
}
