import { PagedItemRequest, PagedItemResponse, Status, StatusDto } from "tweeter-shared";
import { ClientCommunicator } from "../../../../net/ClientComunicator";

export class PostFacade {
  private SERVER_URL: string = import.meta.env.VITE_SERVER_URL;
  private clientCommunicator: ClientCommunicator = new ClientCommunicator(
    this.SERVER_URL
  );

  public async loadMoreFeedItems(request: PagedItemRequest<StatusDto>): Promise<[Status[], boolean]> {
    const response = await this.clientCommunicator.doPost<
      PagedItemRequest<StatusDto>,
      PagedItemResponse<StatusDto>
    >(request, "/feed/list");

    return this.handlePostResponse(response);
  }

  private handlePostResponse(response: PagedItemResponse<StatusDto>): [Status[], boolean] {
    if (!response.success) {
      console.error(response);
      throw new Error(response.message ?? undefined);
    }

    const posts: Status[] = response.items.map((statusDto) => Status.fromDto(statusDto)!);
    return [posts, response.hasMore];
  }
}