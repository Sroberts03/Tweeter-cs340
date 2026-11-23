import { AuthToken, PagedItemRequest, PagedItemResponse, Status, StatusDto } from "tweeter-shared";
import { DynamoDaoFactory } from "../../../dal/dao/DynamoDaoFactory";
import { PostService } from "../PostService";

export const handler = async (
  req: PagedItemRequest<StatusDto>,
): Promise<PagedItemResponse<StatusDto>> => {
  const { authToken, userAlias, pageSize, lastItem } = req;

  const postService = new PostService(new DynamoDaoFactory());
  const [statuses, hasMorePages] = await postService.loadMoreFeedItems(
    AuthToken.fromDto(authToken)!,
    userAlias,
    pageSize,
    Status.fromDto(lastItem),
  );

  return {
    items: statuses.map((status) => status.dto),
    hasMore: hasMorePages,
    success: true,
    message: "Successfully loaded feed items.",
  };
};
