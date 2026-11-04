import { UserDto } from "../../dto/UserDto";
import { AuthorizedRequest } from "./AuthorizedRequest";

export interface PagedUserItemRequest extends AuthorizedRequest {
  readonly userAlias: string;
  readonly pageSize: number;
  readonly lastItem: UserDto | null;
}
