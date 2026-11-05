import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { User } from "tweeter-shared/dist/model/domain/User";
import { Service } from "./Service";
import { UserFacade } from "../facade.net/UserFacade";

export class UserService implements Service {
  public async getUser(
    authToken: AuthToken,
    alias: string,
  ): Promise<User | null> {
    const facade = new UserFacade();
    return facade.getUser({
      authToken: authToken.toDto(),
      alias,
    });
  }
}
