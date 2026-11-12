import "isomorphic-fetch";
import { AuthToken, FakeData, User } from "tweeter-shared";
import { AuthFacade } from "../../src/features/auth/facade.net/AuthFacade";
import { SocialFacade } from "../../src/features/social/facade.net/SocialFacade";

// Integration tests: these hit the deployed server, which currently returns FakeData.
describe("ServerFacade integration", () => {
  const authFacade = new AuthFacade();
  const socialFacade = new SocialFacade();
  const authToken = AuthToken.Generate();
  const allen = FakeData.instance.firstUser!;

  it("registers a user and returns that user with an auth token", async () => {
    const [user, token] = await authFacade.register({
      firstName: "Test",
      lastName: "User",
      alias: "@testuser",
      password: "password",
      userImageBytes: "aW1hZ2U=", // base64 for "image"
      imageFileExtension: "png",
    });

    expect(user).toBeInstanceOf(User);
    expect(user.firstName).toBe("Allen");
    expect(user.lastName).toBe("Anderson");
    expect(user.alias).toBe("@allen");
    expect(user.equals(allen)).toBe(true);

    expect(token).toBeInstanceOf(AuthToken);
    expect(token.token).toBeTruthy();
    expect(token.timestamp).toBeGreaterThan(0);
  });

  it("returns the first page of followers", async () => {
    const pageSize = 10;
    const [followers, hasMore] = await socialFacade.loadMoreFollowers({
      authToken: authToken.toDto(),
      userAlias: allen.alias,
      pageSize,
      lastItem: null,
    });

    const [expectedFollowers, expectedHasMore] =
      FakeData.instance.getPageOfUsers(null, pageSize, allen.alias);

    expect(followers).toHaveLength(pageSize);
    expect(hasMore).toBe(expectedHasMore);
    followers.forEach((follower, i) => {
      expect(follower).toBeInstanceOf(User);
      expect(follower.equals(expectedFollowers[i])).toBe(true);
      expect(follower.alias).not.toBe(allen.alias);
    });
  });

  it("returns the next page of followers after the last one", async () => {
    const pageSize = 5;
    const [firstPage] = FakeData.instance.getPageOfUsers(null, pageSize, allen.alias);
    const lastUser = firstPage[firstPage.length - 1];

    const [followers] = await socialFacade.loadMoreFollowers({
      authToken: authToken.toDto(),
      userAlias: allen.alias,
      pageSize,
      lastItem: lastUser.dto,
    });

    const [expectedFollowers] = FakeData.instance.getPageOfUsers(
      lastUser,
      pageSize,
      allen.alias,
    );

    expect(followers).toHaveLength(expectedFollowers.length);
    followers.forEach((follower, i) =>
      expect(follower.equals(expectedFollowers[i])).toBe(true),
    );
  });

  it("returns a follower count between 1 and 10", async () => {
    const count = await socialFacade.getFollowerCount({
      authToken: authToken.toDto(),
      user: allen.dto,
    });

    expect(Number.isInteger(count)).toBe(true);
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(10);
  });

  it("returns a followee count between 1 and 10", async () => {
    const count = await socialFacade.getFolloweeCount({
      authToken: authToken.toDto(),
      user: allen.dto,
    });

    expect(Number.isInteger(count)).toBe(true);
    expect(count).toBeGreaterThanOrEqual(1);
    expect(count).toBeLessThanOrEqual(10);
  });
});
