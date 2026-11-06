import { AuthToken, CountResponse, User, UserRequest } from "tweeter-shared";
import { SocialService } from "../SocialService";

export const handler = async (req: UserRequest): Promise<CountResponse> => {
  const { authToken, user } = req;
  const socialService = new SocialService();

  const count = await socialService.getFolloweeCount(
    AuthToken.fromDto(authToken)!,
    User.fromDto(user)!,
  );

  return {
    count,
    success: true,
    message: "Successfully retrieved followee count.",
  };
};
