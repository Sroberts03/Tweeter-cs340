import { AuthToken, IsFollowerRequest, IsFollowerResponse, User } from "tweeter-shared";
import { SocialService } from "../SocialService";

export const handler = async (req: IsFollowerRequest): Promise<IsFollowerResponse> => {
  const { authToken, user, selectedUser } = req;
  const socialService = new SocialService();

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
