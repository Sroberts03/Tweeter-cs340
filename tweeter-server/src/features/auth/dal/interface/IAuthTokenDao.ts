import { AuthToken } from "tweeter-shared";

/**
 * Database-agnostic interface for auth token data access.
 * Supports the operations needed by AuthService (login/register/logout)
 * and AuthorizationService (token validation).
 */
export interface IAuthTokenDao {
  /**
   * Persist a new auth token.
   *
   * @param authToken  The token to store (contains token string, timestamp)
   * @param alias      The user alias this token belongs to
   */
  putAuthToken(authToken: AuthToken, alias: string): Promise<void>;

  /**
   * Retrieve an auth token record by token string.
   *
   * @param token  The token string (UUID)
   * @returns The token and associated alias, or `null` if the token does not exist.
   */
  getAuthToken(
    token: string
  ): Promise<{ authToken: AuthToken; alias: string } | null>;

  /**
   * Delete an auth token (used for logout).
   *
   * @param token  The token string to remove
   */
  deleteAuthToken(token: string): Promise<void>;

  /**
   * Update the timestamp on an existing token (to refresh it on use).
   *
   * @param token      The token string
   * @param timestamp  The new timestamp (epoch ms)
   */
  updateTimestamp(token: string, timestamp: number): Promise<void>;
}
