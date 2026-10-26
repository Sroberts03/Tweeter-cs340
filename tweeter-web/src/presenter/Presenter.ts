export interface View {
  displayErrorMessage: (message: string) => void;
}
export interface MessageView extends View {
  displayInfoMessage: (message: string, duration: number) => string;
  deleteMessage: (messageId: string) => void;
}

export abstract class Presenter<T extends View> {
  private _view: T;

  constructor(view: T) {
    this._view = view;
  }

  protected get view(): T {
    return this._view;
  }

  protected async doFailureReportingOperation(
    operation: () => Promise<void>,
    operationDescription: string,
    finallyCallback?: () => void,
  ): Promise<void> {
    try {
      await operation();
    } catch (error) {
      this.view.displayErrorMessage(
        `Failed to ${operationDescription} because of exception: ${(error as Error).toString()}`,
      );
    } finally {
      if (finallyCallback) {
        finallyCallback();
      }
    }
  }
}
