import { AuthToken } from "tweeter-shared";
import { IDaoFactory } from "../../dal/interface/IDaoFactory";
import { IAuthTokenDao } from "./dal/interface/IAuthTokenDao";

/**
 * Service responsible for validating caller session tokens.
 * Enforces authentication and session timeouts across all protected endpoints.
 */
export class AuthorizationService {
  private readonly authTokenDao: IAuthTokenDao;
  // Session timeout: 60 minutes in milliseconds
  public static readonly SESSION_TIMEOUT_MS = 60 * 60 * 1000;

  public constructor(daoFactory: IDaoFactory) {
    this.authTokenDao = daoFactory.getAuthTokenDao();
  }

  /**
   * Validates that an AuthToken exists, is well-formed, and has not expired.
   * On successful validation, refreshes the token's timestamp in the database.
   *
   * @param authToken  The AuthToken submitted by the client
   * @returns The alias associated with the authenticated session
   * @throws Error with prefix `[Unauthorized]` if the token is missing, invalid, or expired
   */
  public async validateToken(authToken: AuthToken | null | undefined): Promise<string> {
    if (!authToken || !authToken.token?.trim()) {
      throw new Error("[Unauthorized] Missing or invalid auth token");
    }

    const tokenRecord = await this.authTokenDao.getAuthToken(authToken.token);
    if (!tokenRecord) {
      throw new Error("[Unauthorized] Invalid or expired auth token");
    }

    const now = Date.now();
    const age = now - tokenRecord.authToken.timestamp;

    if (age > AuthorizationService.SESSION_TIMEOUT_MS) {
      // Token expired: clean it up
      await this.authTokenDao.deleteAuthToken(authToken.token);
      throw new Error("[Unauthorized] Auth token has expired");
    }

    // Refresh the timestamp in the database to extend active session
    await this.authTokenDao.updateTimestamp(authToken.token, now);

    return tokenRecord.alias;
  }
}
