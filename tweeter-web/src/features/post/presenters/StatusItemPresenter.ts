import { Status } from "tweeter-shared";
import { PageItemPresenter,  } from "../../../presenter/PageItemPresenter";
import { StatusService } from "../models.service/StatusService";

export abstract class StatusItemPresenter extends PageItemPresenter<Status, StatusService> {
    protected serviceFactory(): StatusService {
        return new StatusService();
    }
}