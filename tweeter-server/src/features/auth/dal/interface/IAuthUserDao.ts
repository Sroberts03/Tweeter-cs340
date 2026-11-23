import { User } from "tweeter-shared";

/**
 * Database-agnostic interface for user data access needed by AuthService.
 * Handles user creation (register) and credential lookup (login).
 */
export interface IAuthUserDao {
  /**
   * Retrieve a user and their password hash by alias.
   * Used by login to verify credentials.
   *
   * @param alias  The user's handle (e.g. "@allen")
   * @returns The user and their password hash, or `null` if the alias does not exist.
   */
  getUserWithPassword(
    alias: string
  ): Promise<{ user: User; passwordHash: string } | null>;

  /**
   * Persist a new user record.
   * Used by register.
   *
   * @param alias        Unique handle (e.g. "@allen")
   * @param firstName    User's first name
   * @param lastName     User's last name
   * @param passwordHash Bcrypt-hashed password
   * @param imageUrl     S3 URL for the profile image
   */
  putUser(
    alias: string,
    firstName: string,
    lastName: string,
    passwordHash: string,
    imageUrl: string
  ): Promise<void>;
}
