import { Toast } from "../objects/Toast";
import { MessageView, Presenter } from "./Presenter";

export class ToasterPresenter extends Presenter<MessageView> {
    public deleteExpiredToasts(messageList: Toast[]) {
        const now = Date.now();

        for (let message of messageList) {
            if (
                message.expirationMillisecond > 0 &&
                message.expirationMillisecond < now
            ) {
                this.view.deleteMessage(message.id);
            }
        }
  };
}