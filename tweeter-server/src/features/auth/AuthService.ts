import { AuthToken, FakeData, User } from "tweeter-shared";
import { Service } from "../../Service";

export class AuthService implements Service {
    public async logout (authToken: string): Promise<void> {
        // Pause so we can see the logging out message. Delete when the call to the server is implemented.
        await new Promise((res) => setTimeout(res, 1000));
    };

    public async login (
        alias: string,
        password: string
    ): Promise<[User, AuthToken]> {
        // TODO: Replace with the result of calling the server
        const user = FakeData.instance.firstUser;
    
        if (user === null) {
          throw new Error("[Bad Request] Invalid alias or password");
        }
    
        return [user, FakeData.instance.authToken];
    };

    public async register (
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        userImageBase64: string,
        imageFileExtension: string
    ): Promise<[User, AuthToken]> {
        // TODO: Replace with the result of calling the server
        const user = FakeData.instance.firstUser;

        if (user === null) {
            throw new Error("[Bad Request] Invalid registration");
        }

        return [user, FakeData.instance.authToken];
    };
}