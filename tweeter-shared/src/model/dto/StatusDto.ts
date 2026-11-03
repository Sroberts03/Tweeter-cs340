import { UserDto } from "./UserDto";

// Segments are not included because Status rebuilds them from the post text
export interface StatusDto {
  readonly post: string;
  readonly user: UserDto;
  readonly timestamp: number;
}
