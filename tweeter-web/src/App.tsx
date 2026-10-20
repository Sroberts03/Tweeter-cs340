import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import MainLayout from "./views.components/mainLayout/MainLayout";
import Toaster from "./views.components/toaster/Toaster";
import ItemScroller from "./views.components/ItemScroller";
import StatusItem from "./features/post/views.components/statusItem/StatusItem";
import UserItem from "./features/social/views.components/userItem/UserItem";
import { useUserInfo } from "./features/social/hooks/userHooks";
import { StoryPresenter } from "./features/post/presenters/StoryPresenter";
import { FeedPresenter } from "./features/post/presenters/FeedPresenter";
import { FolloweePresenter } from "./features/social/presenters/FolloweePresenter";
import { FollowerPresenter } from "./features/social/presenters/FollowerPresenter";
import Login from "./features/auth/views.components/login/Login";
import Register from "./features/auth/views.components/register/Register";
import { Status } from "tweeter-shared/dist/model/domain/Status";
import { PageItemView } from "./presenter/PageItemPresenter";
import { User } from "tweeter-shared/dist/model/domain/User";

const App = () => {
  const { currentUser, authToken } = useUserInfo();

  const isAuthenticated = (): boolean => {
    return !!currentUser && !!authToken;
  };

  return (
    <div>
      <Toaster position="top-right" />
      <BrowserRouter>
        {isAuthenticated() ? (
          <AuthenticatedRoutes />
        ) : (
          <UnauthenticatedRoutes />
        )}
      </BrowserRouter>
    </div>
  );
};

const AuthenticatedRoutes = () => {
  const { displayedUser } = useUserInfo();

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          index
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />}
        />
        <Route
          path="feed/:displayedUser"
          element={
            <ItemScroller
              key={`feed-${displayedUser!.alias}`}
              presenterFactory={(listener: PageItemView<Status>) =>
                new FeedPresenter(listener)
              }
              itemComponentGenerator={(item: Status) => (
                <StatusItem item={item} featurePath="/feed" />
              )}
            />
          }
        />
        <Route
          path="story/:displayedUser"
          element={
            <ItemScroller
              key={`story-${displayedUser!.alias}`}
              presenterFactory={(listener: PageItemView<Status>) =>
                new StoryPresenter(listener)
              }
              itemComponentGenerator={(item: Status) => (
                <StatusItem item={item} featurePath="/story" />
              )}
            />
          }
        />
        <Route
          path="followees/:displayedUser"
          element={
            <ItemScroller
              key={`followees-${displayedUser!.alias}`}
              presenterFactory={(listener: PageItemView<User>) =>
                new FolloweePresenter(listener)
              }
              itemComponentGenerator={(item: User) => (
                <UserItem user={item} featurePath="/followees" />
              )}
            />
          }
        />
        <Route
          path="followers/:displayedUser"
          element={
            <ItemScroller
              key={`followers-${displayedUser!.alias}`}
              presenterFactory={(listener: PageItemView<User>) =>
                new FollowerPresenter(listener)
              }
              itemComponentGenerator={(item: User) => (
                <UserItem user={item} featurePath="/followers" />
              )}
            />
          }
        />
        <Route path="logout" element={<Navigate to="/login" />} />
        <Route
          path="*"
          element={<Navigate to={`/feed/${displayedUser!.alias}`} />}
        />
      </Route>
    </Routes>
  );
};

const UnauthenticatedRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Login originalUrl={location.pathname} />} />
    </Routes>
  );
};

export default App;
