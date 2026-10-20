import { AuthToken } from "tweeter-shared/dist/model/domain/AuthToken";
import { User } from "tweeter-shared/dist/model/domain/User";
import { FakeData } from "tweeter-shared/dist/util/FakeData";
import { Service } from "./Service";

export class UserService implements Service {
    public async getUser(
        authToken: AuthToken,
        alias: string
      ): Promise<User | null> {
        // TODO: Replace with the result of calling server
        return FakeData.instance.findUserByAlias(alias);
      };
}