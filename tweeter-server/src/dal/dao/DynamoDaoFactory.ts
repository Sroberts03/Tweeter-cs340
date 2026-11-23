import { IDaoFactory } from "../interface/IDaoFactory";
import { IAuthTokenDao } from "../../features/auth/dal/interface/IAuthTokenDao";
import { IAuthUserDao } from "../../features/auth/dal/interface/IAuthUserDao";
import { IImageDao } from "../../features/auth/dal/interface/IImageDao";
import { IFeedDao } from "../../features/post/dal/interface/IFeedDao";
import { IStoryDao } from "../../features/post/dal/interface/IStoryDao";
import { ISocialDao } from "../../features/social/dal/interface/ISocialDao";
import { IUserDao } from "../../features/user/dal/interface/IUserDao";

import { DynamoAuthTokenDao } from "../../features/auth/dal/dao/DynamoAuthTokenDao";
import { DynamoAuthUserDao } from "../../features/auth/dal/dao/DynamoAuthUserDao";
import { S3ImageDao } from "../../features/auth/dal/dao/S3ImageDao";
import { DynamoFeedDao } from "../../features/post/dal/dao/DynamoFeedDao";
import { DynamoStoryDao } from "../../features/post/dal/dao/DynamoStoryDao";
import { DynamoSocialDao } from "../../features/social/dal/dao/DynamoSocialDao";
import { DynamoUserDao } from "../../features/user/dal/dao/DynamoUserDao";

/**
 * Concrete implementation of IDaoFactory for Amazon DynamoDB and AWS S3.
 * Creates and provides DAO instances for all features across the server.
 */
export class DynamoDaoFactory implements IDaoFactory {
  private userDao: IUserDao | null = null;
  private authTokenDao: IAuthTokenDao | null = null;
  private authUserDao: IAuthUserDao | null = null;
  private imageDao: IImageDao | null = null;
  private socialDao: ISocialDao | null = null;
  private storyDao: IStoryDao | null = null;
  private feedDao: IFeedDao | null = null;

  public getUserDao(): IUserDao {
    if (!this.userDao) {
      this.userDao = new DynamoUserDao();
    }
    return this.userDao;
  }

  public getAuthTokenDao(): IAuthTokenDao {
    if (!this.authTokenDao) {
      this.authTokenDao = new DynamoAuthTokenDao();
    }
    return this.authTokenDao;
  }

  public getAuthUserDao(): IAuthUserDao {
    if (!this.authUserDao) {
      this.authUserDao = new DynamoAuthUserDao();
    }
    return this.authUserDao;
  }

  public getImageDao(): IImageDao {
    if (!this.imageDao) {
      this.imageDao = new S3ImageDao();
    }
    return this.imageDao;
  }

  public getSocialDao(): ISocialDao {
    if (!this.socialDao) {
      this.socialDao = new DynamoSocialDao();
    }
    return this.socialDao;
  }

  public getStoryDao(): IStoryDao {
    if (!this.storyDao) {
      this.storyDao = new DynamoStoryDao();
    }
    return this.storyDao;
  }

  public getFeedDao(): IFeedDao {
    if (!this.feedDao) {
      this.feedDao = new DynamoFeedDao();
    }
    return this.feedDao;
  }
}
