import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { Status } from "tweeter-shared/dist/model/domain/Status";
import { FakeData } from "tweeter-shared/dist/util/FakeData";
import { Service } from "../../../model.service/Service";
import { PostFacade } from "../facade.net/PostFacade";
import { TweeterResponse } from "tweeter-shared/dist/model/net/response/TweeterResponse";

export class StatusService implements Service {
  public async loadMoreStoryItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null,
  ): Promise<[Status[], boolean]> {
    const facade = new PostFacade();
    return facade.loadMoreStoryItems({
      authToken: authToken.toDto(),
      userAlias,
      pageSize,
      lastItem: lastItem?.dto ?? null,
    });
  }

  public async loadMoreFeedItems(
    authToken: AuthToken,
    userAlias: string,
    pageSize: number,
    lastItem: Status | null,
  ): Promise<[Status[], boolean]> {
    const facade = new PostFacade();
    return facade.loadMoreFeedItems({
      authToken: authToken.toDto(),
      userAlias,
      pageSize,
      lastItem: lastItem?.dto ?? null,
    });
  }

  public async postStatus(
    authToken: AuthToken,
    newStatus: Status,
  ): Promise<TweeterResponse> {
    const facade = new PostFacade();
    return facade.postStatus({
      authToken: authToken.toDto(),
      newStatus: newStatus.dto,
    });
  }
}