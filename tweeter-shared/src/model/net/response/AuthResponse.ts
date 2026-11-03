import { AuthTokenDto } from "../../dto/AuthTokenDto";
import { UserDto } from "../../dto/UserDto";
import { TweeterResponse } from "./TweeterResponse";

// Used by Login and Register
export interface AuthResponse extends TweeterResponse {
  readonly user: UserDto;
  readonly authToken: AuthTokenDto;
}
