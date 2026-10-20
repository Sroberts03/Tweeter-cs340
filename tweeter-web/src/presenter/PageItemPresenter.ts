import { AuthToken, User } from "tweeter-shared";
import { Presenter, View } from "./Presenter";
import { UserService } from "../model.service/UserService";
import { Service } from "../model.service/Service";

export const PAGE_SIZE = 10;

export interface PageItemView<T> extends View {
  addItems: (newItems: T[]) => void;
}

export abstract class PageItemPresenter<T, U extends Service> extends Presenter<PageItemView<T>> {
  private _hasMoreItems = true;
  private _lastItem: T | null = null;
  private _service: U;
  private userService: any;

  constructor(view: PageItemView<T>) {
    super(view);
    this._service = this.serviceFactory();
    this.userService = new UserService();
  }

  public get service(): U {
    return this._service;
  }

  public get hasMoreItems(): boolean {
    return this._hasMoreItems;
  }

  protected set hasMoreItems(value: boolean) {
    this._hasMoreItems = value;
  }

  protected get lastItem(): T | null {
    return this._lastItem;
  }

  protected set lastItem(value: T | null) {
    this._lastItem = value;
  }

  public reset() {
    this._hasMoreItems = true;
    this._lastItem = null;
  }

  public async getUser(
    authToken: AuthToken,
    alias: string,
  ): Promise<User | null> {
    return await this.userService.getUser(authToken, alias);
  }

  public async loadMoreItems(authToken: AuthToken, userAlias: string) {
    this.doFailureReportingOperation(async () => {
      const [newItems, hasMore] = await this.getMoreItems(authToken, userAlias);

      this.hasMoreItems = hasMore;
      this.lastItem =
        newItems.length > 0 ? newItems[newItems.length - 1] : null;
      this.view.addItems(newItems);
    }, this.itemDescription());
  }

  protected abstract itemDescription(): string; 
  protected abstract serviceFactory(): U;
  protected abstract getMoreItems(authToken: AuthToken, userAlias: string): Promise<[T[], boolean]>;
}
