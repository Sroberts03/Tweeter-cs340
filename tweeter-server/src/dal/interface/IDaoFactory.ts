import { IAuthTokenDao } from "../../features/auth/dal/interface/IAuthTokenDao";
import { IAuthUserDao } from "../../features/auth/dal/interface/IAuthUserDao";
import { IImageDao } from "../../features/auth/dal/interface/IImageDao";
import { IFeedDao } from "../../features/post/dal/interface/IFeedDao";
import { IStoryDao } from "../../features/post/dal/interface/IStoryDao";
import { ISocialDao } from "../../features/social/dal/interface/ISocialDao";
import { IUserDao } from "../../features/user/dal/interface/IUserDao";

/**
 * Abstract factory interface for creating database-agnostic DAO instances.
 * Enables dependency injection across all service classes without coupling
 * them to any specific database implementation (e.g. DynamoDB vs in-memory).
 */
export interface IDaoFactory {
  getUserDao(): IUserDao;
  getAuthTokenDao(): IAuthTokenDao;
  getAuthUserDao(): IAuthUserDao;
  getImageDao(): IImageDao;
  getSocialDao(): ISocialDao;
  getStoryDao(): IStoryDao;
  getFeedDao(): IFeedDao;
}
