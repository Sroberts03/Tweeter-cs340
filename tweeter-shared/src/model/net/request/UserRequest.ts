import { UserDto } from "../../dto/UserDto";
import { AuthorizedRequest } from "./AuthorizedRequest";

// Used by GetFollowerCount, GetFolloweeCount, Follow, and Unfollow
export interface UserRequest extends AuthorizedRequest {
  readonly user: UserDto;
}
