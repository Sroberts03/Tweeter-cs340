import "./App.css";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import MainLayout from "./components/mainLayout/MainLayout";
import Toaster from "./components/toaster/Toaster";
import UserItemScroller from "./features/social/views.components/UserItemScroller";
import StatusItemScroller from "./features/post/views.components/StatusItemScroller";
import { useUserInfo } from "./features/social/hooks/userHooks";
import { StoryPresenter } from "./features/post/presenters/StoryPresenter";
import { FeedPresenter } from "./features/post/presenters/FeedPresenter";
import { FolloweePresenter } from "./features/social/presenters/FolloweePresenter";
import { FollowerPresenter } from "./features/social/presenters/FollowerPresenter";
import Login from "./features/auth/views.components/login/Login";
import Register from "./features/auth/views.components/register/Register";

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
        <Route index element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
        <Route path="feed/:displayedUser" element={<StatusItemScroller 
          key={`feed-${displayedUser!.alias}`}
          featureUrl="/feed"
          presenterFactory={(listener) => new FeedPresenter(listener)}
        />} />
        <Route path="story/:displayedUser" element={<StatusItemScroller
          key={`story-${displayedUser!.alias}`}
          featureUrl="/story" 
          presenterFactory={(listener) => new StoryPresenter(listener)}
        />} />
        <Route path="followees/:displayedUser" element={
          <UserItemScroller
            key={`followees-${displayedUser!.alias}`}
            featureUrl="/followees"
            presenterFactory={(listener) => new FolloweePresenter(listener)}
          />} 
        />
        <Route path="followers/:displayedUser" element={
          <UserItemScroller 
            key={`followers-${displayedUser!.alias}`}
            featureUrl="/followers" 
            presenterFactory={(listener) => new FollowerPresenter(listener)}
          />} 
        />
        <Route path="logout" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={`/feed/${displayedUser!.alias}`} />} />
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
