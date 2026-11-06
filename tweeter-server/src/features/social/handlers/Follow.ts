import { AuthToken, FollowResponse, User, UserRequest } from "tweeter-shared";
import { SocialService } from "../SocialService";

export const handler = async (req: UserRequest): Promise<FollowResponse> => {
  const { authToken, user } = req;
  const socialService = new SocialService();

  const [followerCount, followeeCount] = await socialService.follow(
    AuthToken.fromDto(authToken)!,
    User.fromDto(user)!,
  );

  return {
    followerCount,
    followeeCount,
    success: true,
    message: "Successfully followed user.",
  };
};
