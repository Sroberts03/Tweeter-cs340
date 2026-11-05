import { PagedItemRequest, PagedItemResponse, Status, StatusDto } from "tweeter-shared";
import { PostService } from "../PostService";

export const handler = async (
  req: PagedItemRequest<StatusDto>,
): Promise<PagedItemResponse<StatusDto>> => {
  const { token, userAlias, pageSize, lastItem } = req;

  const postService = new PostService();
  const [stories, hasMorePages] = await postService.loadMoreStoryItems(
    token,
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
