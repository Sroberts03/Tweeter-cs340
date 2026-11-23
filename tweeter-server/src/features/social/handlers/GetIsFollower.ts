import { AuthToken, IsFollowerRequest, IsFollowerResponse, User } from "tweeter-shared";
import { DynamoDaoFactory } from "../../../dal/dao/DynamoDaoFactory";
import { SocialService } from "../SocialService";

export const handler = async (req: IsFollowerRequest): Promise<IsFollowerResponse> => {
  const { authToken, user, selectedUser } = req;
  const socialService = new SocialService(new DynamoDaoFactory());

  const isFollower = await socialService.getIsFollowerStatus(
    AuthToken.fromDto(authToken)!,
    User.fromDto(user)!,
    User.fromDto(selectedUser)!,
  );

  return {
    isFollower,
    success: true,
    message: "Successfully retrieved follower status.",
  };
};
