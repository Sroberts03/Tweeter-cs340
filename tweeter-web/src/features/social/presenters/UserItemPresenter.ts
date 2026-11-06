import { User } from "tweeter-shared";
import { PageItemPresenter } from "../../../presenter/PageItemPresenter";
import { SocialService } from "../models.service/SocialService";
export abstract class UserItemPresenter extends PageItemPresenter<User, SocialService> {
    protected serviceFactory(): SocialService {
        return new SocialService();
    }
}