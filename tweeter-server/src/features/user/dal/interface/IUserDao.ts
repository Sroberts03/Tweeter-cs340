import { User } from "tweeter-shared";

/**
 * Database-agnostic interface for user data access.
 * Supports the operations needed by UserService.
 */
export interface IUserDao {
  /**
   * Retrieve a user by alias.
   *
   * @param alias  The user's handle (e.g. "@allen")
   * @returns The User, or `null` if the alias does not exist.
   */
  getUser(alias: string): Promise<User | null>;
}
