import bcrypt from "bcryptjs";
import { AuthToken, User } from "tweeter-shared";
import { DynamoDaoFactory } from "../../dal/dao/DynamoDaoFactory";
import { IDaoFactory } from "../../dal/interface/IDaoFactory";
import { Service } from "../../Service";
import { IAuthTokenDao } from "./dal/interface/IAuthTokenDao";
import { IAuthUserDao } from "./dal/interface/IAuthUserDao";
import { IImageDao } from "./dal/interface/IImageDao";

export class AuthService implements Service {
  private readonly authUserDao: IAuthUserDao;
  private readonly authTokenDao: IAuthTokenDao;
  private readonly imageDao: IImageDao;

  public constructor(daoFactory: IDaoFactory = new DynamoDaoFactory()) {
    this.authUserDao = daoFactory.getAuthUserDao();
    this.authTokenDao = daoFactory.getAuthTokenDao();
    this.imageDao = daoFactory.getImageDao();
  }

  public async logout(authToken: AuthToken): Promise<void> {
    if (!authToken?.token?.trim()) {
      throw new Error("[Bad Request] Auth token is required to log out");
    }
    await this.authTokenDao.deleteAuthToken(authToken.token);
  }

  public async login(
    alias: string,
    password: string
  ): Promise<[User, AuthToken]> {
    if (!alias?.trim() || !password?.trim()) {
      throw new Error("[Bad Request] Alias and password are required");
    }

    const userWithPassword = await this.authUserDao.getUserWithPassword(alias);
    if (!userWithPassword) {
      throw new Error("[Bad Request] Invalid alias or password");
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userWithPassword.passwordHash
    );
    if (!isPasswordValid) {
      throw new Error("[Bad Request] Invalid alias or password");
    }

    const authToken = AuthToken.Generate();
    await this.authTokenDao.putAuthToken(authToken, alias);

    return [userWithPassword.user, authToken];
  }

  public async register(
    firstName: string,
    lastName: string,
    alias: string,
    password: string,
    userImageBase64: string,
    imageFileExtension: string
  ): Promise<[User, AuthToken]> {
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !alias?.trim() ||
      !password?.trim() ||
      !userImageBase64?.trim() ||
      !imageFileExtension?.trim()
    ) {
      throw new Error("[Bad Request] All registration fields are required");
    }

    // 1. Upload profile image to S3
    const fileName = `${alias}-${Date.now()}.${imageFileExtension.replace(/^\./, "")}`;
    const imageUrl = await this.imageDao.putImage(
      fileName,
      userImageBase64,
      imageFileExtension
    );

    // 2. Hash password with bcryptjs
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // 3. Persist new user in user table
    await this.authUserDao.putUser(
      alias,
      firstName,
      lastName,
      passwordHash,
      imageUrl
    );

    // 4. Generate and persist new AuthToken in authtoken table
    const authToken = AuthToken.Generate();
    await this.authTokenDao.putAuthToken(authToken, alias);

    const user = new User(firstName, lastName, alias, imageUrl);
    return [user, authToken];
  }
}
