import { AuthToken, PagedItemRequest, PagedItemResponse, User, UserDto } from "tweeter-shared";
import { DynamoDaoFactory } from "../../../dal/dao/DynamoDaoFactory";
import { SocialService } from "../SocialService";

export const handler = async (
  req: PagedItemRequest<UserDto>,
): Promise<PagedItemResponse<UserDto>> => {
  const { authToken, userAlias, pageSize, lastItem } = req;

  const socialService = new SocialService(new DynamoDaoFactory());
  const [followers, hasMorePages] = await socialService.loadMoreFollowers(
    AuthToken.fromDto(authToken)!,
    userAlias,
    pageSize,
    User.fromDto(lastItem),
  );

  return {
    items: followers.map((user) => user.dto),
    hasMore: hasMorePages,
    success: true,
    message: "Successfully loaded followers.",
  };
};
