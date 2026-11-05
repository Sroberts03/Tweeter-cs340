import { AuthorizedRequest } from "./AuthorizedRequest";

export interface PagedItemRequest<T> extends AuthorizedRequest {
  readonly userAlias: string;
  readonly pageSize: number;
  readonly lastItem: T | null;
}
