export interface AuthenticationFormLayoutView {
  displayInfoMessage: (
    message: string,
    duration: number,
    className?: string,
  ) => void;
}

export class AuthenticationFormLayoutPresenter {
  private _view: AuthenticationFormLayoutView;

  constructor(view: AuthenticationFormLayoutView) {
    this._view = view;
  }

  public displayInfoMessageWithDarkBackground(message: string): void {
    this._view.displayInfoMessage(message, 3000, "text-white bg-primary");
  }
}
