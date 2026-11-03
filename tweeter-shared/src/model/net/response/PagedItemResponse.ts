import { TweeterResponse } from "./TweeterResponse";

// Used with UserDto by GetFollowers/GetFollowees and with StatusDto by GetFeed/GetStory
export interface PagedItemResponse<T> extends TweeterResponse {
  readonly items: T[];
  readonly hasMore: boolean;
}
