import { Buffer } from "buffer";
import { AuthToken, User } from "tweeter-shared";
import { Service } from "../../../model.service/Service";
import { AuthFacade } from "../facade.net/AuthFacade";

export class AuthService implements Service {
    public async logout (authToken: AuthToken): Promise<void> {
        const facade = new AuthFacade();
        await facade.logout({ token: authToken.token });
    };

    public async login (
        alias: string,
        password: string
    ): Promise<[User, AuthToken]> {
        const facade = new AuthFacade();
        return facade.login({ alias, password });
    };

    public async register (
        firstName: string,
        lastName: string,
        alias: string,
        password: string,
        userImageBytes: Uint8Array,
        imageFileExtension: string
    ): Promise<[User, AuthToken]> {
        const imageStringBase64: string =
            Buffer.from(userImageBytes).toString("base64");

        const facade = new AuthFacade();
        return facade.register({
            firstName,
            lastName,
            alias,
            password,
            userImageBytes: imageStringBase64,
            imageFileExtension
        });
    };
}
