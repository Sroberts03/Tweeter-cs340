import { AuthToken, User } from "tweeter-shared";
import { IDaoFactory } from "../../dal/interface/IDaoFactory";
import { Service } from "../../Service";
import { AuthorizationService } from "../auth/AuthorizationService";
import { IUserDao } from "./dal/interface/IUserDao";

export class UserService implements Service {
  private readonly userDao: IUserDao;
  private readonly authService: AuthorizationService;

  public constructor(daoFactory: IDaoFactory) {
    this.userDao = daoFactory.getUserDao();
    this.authService = new AuthorizationService(daoFactory);
  }

  public async getUser(
    authToken: AuthToken,
    alias: string
  ): Promise<User | null> {
    if (!alias?.trim()) {
      throw new Error("[Bad Request] Alias is required");
    }

    // Authenticate caller session against DynamoDB
    await this.authService.validateToken(authToken);

    // Retrieve user from DynamoDB user table
    return this.userDao.getUser(alias);
  }
}
