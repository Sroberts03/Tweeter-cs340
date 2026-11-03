import { TweeterResponse } from "./TweeterResponse";

// Used by Follow and Unfollow
export interface FollowResponse extends TweeterResponse {
  readonly followerCount: number;
  readonly followeeCount: number;
}
