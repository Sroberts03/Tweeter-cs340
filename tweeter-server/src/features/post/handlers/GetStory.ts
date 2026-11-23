import { AuthToken, PagedItemRequest, PagedItemResponse, Status, StatusDto } from "tweeter-shared";
import { DynamoDaoFactory } from "../../../dal/dao/DynamoDaoFactory";
import { PostService } from "../PostService";

export const handler = async (
  req: PagedItemRequest<StatusDto>,
): Promise<PagedItemResponse<StatusDto>> => {
  const { authToken, userAlias, pageSize, lastItem } = req;

  const postService = new PostService(new DynamoDaoFactory());
  const [stories, hasMorePages] = await postService.loadMoreStoryItems(
    AuthToken.fromDto(authToken)!,
    userAlias,
    pageSize,
    Status.fromDto(lastItem),
  );

  return {
    items: stories.map((story) => story.dto),
    hasMore: hasMorePages,
    success: true,
    message: "Successfully loaded story items.",
  };
};
