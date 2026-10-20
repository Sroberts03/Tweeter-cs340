import { useState, useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useParams } from "react-router-dom";
import { useMessageActions } from "../hooks/MessageHooks";
import { useUserInfo, useUserInfoActions } from "../features/social/hooks/userHooks";
import { PageItemPresenter, PageItemView } from "../presenter/PageItemPresenter";
import { Service } from "../model.service/Service";

interface ItemScrollerProps<T, U extends Service> {
  presenterFactory: (listener: PageItemView<T>) => PageItemPresenter<T, U>;
  itemComponentGenerator: (item: T) => JSX.Element;
}

const ItemScroller = <T, U extends Service>(props: ItemScrollerProps<T, U>) => {
  const { displayErrorMessage } = useMessageActions();
  const [items, setItems] = useState<T[]>([]);
  const { displayedUser, authToken } = useUserInfo();
  const { setDisplayedUser } = useUserInfoActions();
  const { displayedUser: displayedUserAliasParam } = useParams();

  const listener: PageItemView<T> = {
    addItems: (newItems: T[]) => {
      setItems((previousItems) => [...previousItems, ...newItems]);
    },
    displayErrorMessage: (message: string) => {
      displayErrorMessage(message);
    },
  };
  const presenterRef = useRef<PageItemPresenter<T, U> | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = props.presenterFactory(listener);
  }

  // Update the displayed user context variable whenever the displayedUser url parameter changes. This allows browser forward and back buttons to work correctly.
  useEffect(() => {
    if (
      authToken &&
      displayedUserAliasParam &&
      displayedUserAliasParam != displayedUser!.alias
    ) {
      presenterRef.current!.getUser(authToken!, displayedUserAliasParam!).then((toUser) => {
        if (toUser) {
          setDisplayedUser(toUser);
        }
      });
    }
  }, [displayedUserAliasParam]);

  // Initialize the component whenever the displayed user changes
  useEffect(() => {
    reset();
    loadMoreItems();
  }, [displayedUser]);

  const reset = async () => {
    setItems(() => []);
    presenterRef.current!.reset();
  };

  const loadMoreItems = async () => {
    presenterRef.current!.loadMoreItems(authToken!, displayedUser!.alias);
  };

  return (
    <div className="container px-0 overflow-visible vh-100">
      <InfiniteScroll
        className="pr-0 mr-0"
        dataLength={items.length}
        next={loadMoreItems}
        hasMore={presenterRef.current!.hasMoreItems}
        loader={<h4>Loading...</h4>}
      >
        {items.map((item, index) => (
          <div
            key={index}
            className="row mb-3 mx-0 px-0 border rounded bg-white"
          >
            {props.itemComponentGenerator(item)}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default ItemScroller;
