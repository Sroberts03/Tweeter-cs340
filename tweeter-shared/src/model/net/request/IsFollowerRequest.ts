import { UserDto } from "../../dto/UserDto";
import { AuthorizedRequest } from "./AuthorizedRequest";

export interface IsFollowerRequest extends AuthorizedRequest {
  readonly user: UserDto;
  readonly selectedUser: UserDto;
}
