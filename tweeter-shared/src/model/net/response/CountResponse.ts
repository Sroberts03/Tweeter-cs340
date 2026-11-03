import { TweeterResponse } from "./TweeterResponse";

// Used by GetFollowerCount and GetFolloweeCount
export interface CountResponse extends TweeterResponse {
  readonly count: number;
}
