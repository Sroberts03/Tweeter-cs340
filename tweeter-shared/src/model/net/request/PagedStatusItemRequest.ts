import { StatusDto } from "../../dto/StatusDto";
import { AuthorizedRequest } from "./AuthorizedRequest";

export interface PagedStatusItemRequest extends AuthorizedRequest {
  readonly userAlias: string;
  readonly pageSize: number;
  readonly lastItem: StatusDto | null;
}
