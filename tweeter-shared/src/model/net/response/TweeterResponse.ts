// Base response for every endpoint. Logout and PostStatus return this directly.
export interface TweeterResponse {
  readonly success: boolean;
  readonly message: string | null;
}
