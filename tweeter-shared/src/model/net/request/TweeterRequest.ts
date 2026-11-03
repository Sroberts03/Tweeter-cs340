// Base request for every endpoint that requires the user to be logged in
export interface TweeterRequest {
  readonly token: string;
}
