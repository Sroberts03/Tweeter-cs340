import "isomorphic-fetch";
import { AuthToken, FakeData, Status } from "tweeter-shared";
import { StatusService } from "../../../../src/features/post/models.service/StatusService";

// Integration test: StatusService -> PostFacade -> deployed server (FakeData).
describe("StatusService integration", () => {
  const statusService = new StatusService();
  const authToken = AuthToken.Generate();
  const allen = FakeData.instance.firstUser!;
  const fakeAliases = FakeData.instance.fakeUsers.map((u) => u.alias);

  it("loads the first page of a user's story", async () => {
    const pageSize = 10;
    const [statuses, hasMore] = await statusService.loadMoreStoryItems(
      authToken,
      allen.alias,
      pageSize,
      null,
    );

    const [expectedStatuses, expectedHasMore] =
      FakeData.instance.getPageOfStatuses(null, pageSize);

    expect(statuses).toHaveLength(pageSize);
    expect(hasMore).toBe(expectedHasMore);

    statuses.forEach((status, i) => {
      expect(status).toBeInstanceOf(Status);
      expect(status.equals(expectedStatuses[i])).toBe(true);
      expect(status.post).toBe(expectedStatuses[i].post);
      expect(status.user.equals(expectedStatuses[i].user)).toBe(true);
      expect(fakeAliases).toContain(status.user.alias);
    });
  });

  it("loads the next page of a story without repeating statuses", async () => {
    const pageSize = 5;
    const [firstPage] = await statusService.loadMoreStoryItems(
      authToken,
      allen.alias,
      pageSize,
      null,
    );
    const [secondPage] = await statusService.loadMoreStoryItems(
      authToken,
      allen.alias,
      pageSize,
      firstPage[firstPage.length - 1],
    );

    const [expectedSecondPage] = FakeData.instance.getPageOfStatuses(
      firstPage[firstPage.length - 1],
      pageSize,
    );

    expect(secondPage).toHaveLength(expectedSecondPage.length);
    secondPage.forEach((status, i) => {
      expect(status.equals(expectedSecondPage[i])).toBe(true);
      expect(firstPage.some((s) => s.equals(status))).toBe(false);
    });
  });
});
