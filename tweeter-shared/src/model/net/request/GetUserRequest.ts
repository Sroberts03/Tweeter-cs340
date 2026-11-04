import { AuthorizedRequest } from "./AuthorizedRequest";

export interface GetUserRequest extends AuthorizedRequest {
  readonly alias: string;
}
