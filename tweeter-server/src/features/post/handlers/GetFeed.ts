import { PagedItemRequest, PagedItemResponse, Status, StatusDto } from "tweeter-shared";
import { PostService } from "../PostService";

export const handler = async (
  req: PagedItemRequest<StatusDto>,
): Promise<PagedItemResponse<StatusDto>> => {
  const { token, userAlias, pageSize, lastItem } = req;

  const postService = new PostService();
  const [statuses, hasMorePages] = await postService.loadMoreFeedItems(
    token,
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
