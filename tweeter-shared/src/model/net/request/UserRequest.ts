import { UserDto } from "../../dto/UserDto";
import { TweeterRequest } from "./TweeterRequest";

// Used by GetFollowerCount, GetFolloweeCount, Follow, and Unfollow
export interface UserRequest extends TweeterRequest {
  readonly user: UserDto;
}
