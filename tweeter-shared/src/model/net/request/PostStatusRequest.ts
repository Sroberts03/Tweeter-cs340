import { StatusDto } from "../../dto/StatusDto";
import { AuthorizedRequest } from "./AuthorizedRequest";

export interface PostStatusRequest extends AuthorizedRequest {
  readonly newStatus: StatusDto;
}
