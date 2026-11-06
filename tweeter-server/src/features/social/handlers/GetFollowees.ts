import { AuthToken, PagedItemRequest, PagedItemResponse, User, UserDto } from "tweeter-shared";
import { SocialService } from "../SocialService";

export const handler = async (
  req: PagedItemRequest<UserDto>,
): Promise<PagedItemResponse<UserDto>> => {
  const { authToken, userAlias, pageSize, lastItem } = req;

  const socialService = new SocialService();
  const [followees, hasMorePages] = await socialService.loadMoreFollowees(
    AuthToken.fromDto(authToken)!,
    userAlias,
    pageSize,
    User.fromDto(lastItem),
  );

  return {
    items: followees.map((user) => user.dto),
    hasMore: hasMorePages,
    success: true,
    message: "Successfully loaded followees.",
  };
};
