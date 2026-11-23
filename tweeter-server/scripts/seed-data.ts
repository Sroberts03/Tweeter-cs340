import bcrypt from "bcryptjs";
import { AuthToken, Status, User } from "tweeter-shared";
import { DynamoDaoFactory } from "../src/dal/dao/DynamoDaoFactory";

/**
 * Seed script to populate DynamoDB tables with initial users, follow relationships,
 * and statuses (>10 items per tab) so pagination can be tested.
 *
 * Usage:
 *   AWS_PROFILE=cs340 npx ts-node scripts/seed-data.ts
 */
async function seed(): Promise<void> {
  console.log("Starting database seed...");
  const factory = new DynamoDaoFactory();

  const authUserDao = factory.getAuthUserDao();
  const authTokenDao = factory.getAuthTokenDao();
  const socialDao = factory.getSocialDao();
  const storyDao = factory.getStoryDao();
  const feedDao = factory.getFeedDao();

  const defaultPassword = "password123";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  const defaultImage =
    "https://faculty.cs.byu.edu/~jwilkerson/cs340/tweeter/images/donald_duck.png";

  // 1. Create primary test user: @allen
  console.log("Creating primary user @allen...");
  const mainAlias = "@allen";
  try {
    await authUserDao.putUser(
      mainAlias,
      "Allen",
      "Anderson",
      passwordHash,
      defaultImage
    );
  } catch (err: any) {
    console.log(`User ${mainAlias} might already exist: ${err.message}`);
  }

  // Create persistent auth token for testing
  const mainToken = new AuthToken("seed-test-token-allen", Date.now());
  await authTokenDao.putAuthToken(mainToken, mainAlias);
  console.log(`Created test auth token for ${mainAlias}: ${mainToken.token}`);

  // 2. Create 25 additional users (@user1 through @user25)
  console.log("Creating 25 additional users for pagination testing...");
  const users: User[] = [];

  for (let i = 1; i <= 25; i++) {
    const alias = `@user${i}`;
    const firstName = `TestUser${i}`;
    const lastName = `Doe`;
    try {
      await authUserDao.putUser(
        alias,
        firstName,
        lastName,
        passwordHash,
        defaultImage
      );
    } catch (err: any) {
      // Ignore if user already exists
    }
    users.push(new User(firstName, lastName, alias, defaultImage));
  }

  // 3. Establish follow relationships:
  // - 15 users follow @allen (testing followers pagination on @allen)
  // - @allen follows 15 users (testing followees pagination on @allen)
  console.log("Seeding follow relationships (>10 items)...");
  for (let i = 0; i < 15; i++) {
    const targetAlias = users[i].alias;

    // target follows allen
    try {
      await socialDao.follow(targetAlias, mainAlias);
    } catch (err: any) {
      // already following
    }

    // allen follows target
    try {
      await socialDao.follow(mainAlias, targetAlias);
    } catch (err: any) {
      // already following
    }
  }

  // 4. Create 15 story statuses posted by @allen
  console.log("Seeding 15 story statuses for @allen...");
  const mainUser = new User("Allen", "Anderson", mainAlias, defaultImage);
  const now = Date.now();

  for (let i = 1; i <= 15; i++) {
    const timestamp = now - (16 - i) * 60000; // 1 minute apart
    const postText = `Hello world! This is story post #${i} by ${mainAlias}. Testing pagination >10 items!`;
    const status = new Status(postText, mainUser, timestamp);
    await storyDao.putStory(status);
  }

  // 5. Create 15 feed items for @allen (pre-computed feeds from users he follows)
  console.log("Seeding 15 pre-computed feed items for @allen...");
  for (let i = 0; i < 15; i++) {
    const sender = users[i];
    const timestamp = now - (16 - i) * 45000;
    const postText = `Hey ${mainAlias}! Feed update #${i + 1} from ${sender.alias}! #tweeter`;
    const status = new Status(postText, sender, timestamp);
    await feedDao.batchWriteFeedItems([mainAlias], status);
  }

  console.log("\nDatabase seed completed successfully!");
  console.log("Summary of seeded data:");
  console.log(`- Primary user: ${mainAlias} (Password: ${defaultPassword})`);
  console.log(`- Auth token: ${mainToken.token}`);
  console.log("- Followers count for @allen: 15 (>10 items)");
  console.log("- Followees count for @allen: 15 (>10 items)");
  console.log("- Story items for @allen: 15 (>10 items)");
  console.log("- Feed items for @allen: 15 (>10 items)");
}

seed().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
