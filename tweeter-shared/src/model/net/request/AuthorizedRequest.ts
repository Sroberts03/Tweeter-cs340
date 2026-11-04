import { TweeterRequest } from "./TweeterRequest";

// Base request for every endpoint that requires the user to be logged in
export interface AuthorizedRequest extends TweeterRequest {
  readonly token: string;
}
