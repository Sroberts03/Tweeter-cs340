import { Toast } from "../objects/Toast";

export interface ToasterView {
    deleteMessage: (messageId: string) => void;
}

export class ToasterPresenter {
    private _view: ToasterView;

    constructor(view: ToasterView) {
        this._view = view;
    }

    public deleteExpiredToasts(messageList: Toast[]) {
        const now = Date.now();

        for (let message of messageList) {
            if (
                message.expirationMillisecond > 0 &&
                message.expirationMillisecond < now
            ) {
                this._view.deleteMessage(message.id);
            }
        }
  };
}