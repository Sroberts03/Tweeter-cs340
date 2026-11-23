# Attribution Log

## 2026-11-03 — DTOs and request/response types (Claude Code, Opus 5.5)

**Prompt:** "Create all of my DTOs for all the lambdas."

**What the AI did**

Created plain data interfaces in `tweeter-shared` so the client and the 14 Lambda handlers can exchange JSON:

- `src/model/dto/` — `UserDto`, `AuthTokenDto`, `StatusDto` (no segments; `Status` rebuilds them from the post text)
- `src/model/net/request/` — `TweeterRequest` (base, carries `token`), `LoginRequest`, `RegisterRequest`, `GetUserRequest`, `PagedUserItemRequest`, `PagedStatusItemRequest`, `PostStatusRequest`, `UserRequest`, `IsFollowerRequest`
- `src/model/net/response/` — `TweeterResponse` (base, `success` + `message`), `AuthResponse`, `GetUserResponse`, `PagedItemResponse<T>`, `IsFollowerResponse`, `CountResponse`, `FollowResponse`
- Added `dto` getters and `static fromDto()` to `User`, `AuthToken`, and `Status`
- Exported all new types by name from `src/index.ts` (`export type`, since `isolatedModules` is on)

**Lambda → types**

| Lambda | Request | Response |
|---|---|---|
| Login | `LoginRequest` | `AuthResponse` |
| Register | `RegisterRequest` | `AuthResponse` |
| Logout | `TweeterRequest` | `TweeterResponse` |
| GetUser | `GetUserRequest` | `GetUserResponse` |
| GetFollowers / GetFollowees | `PagedUserItemRequest` | `PagedItemResponse<UserDto>` |
| GetIsFollower | `IsFollowerRequest` | `IsFollowerResponse` |
| GetFollowerCount / GetFolloweeCount | `UserRequest` | `CountResponse` |
| Follow / Unfollow | `UserRequest` | `FollowResponse` |
| GetFeed / GetStory | `PagedStatusItemRequest` | `PagedItemResponse<StatusDto>` |
| PostStatus | `PostStatusRequest` | `TweeterResponse` |

**Verified:** `tweeter-shared` compiles and `tweeter-server` typechecks against it.

**Not done by AI:** handler implementations and service signature changes.

## 2026-11-03 — Agent instructions (Claude Code, Opus 5.5)

**Prompt:** "Update the Agents.md file to include that after every change made by an agent they update the AttributionLog with what they did. As well as to run npm run typecheck."

**What the AI did:** Wrote `tweeter-server/Agents.md` (it was empty), requiring agents to run `npm run typecheck` (and `npm run compile` in `tweeter-shared` first when shared types change) and to add an entry to this log after every change.

**Verified:** `npm run typecheck` passed.

## 2026-11-03 — SAM template for the real project (Claude Code, Opus 5.5)

**Prompt:** "update the template.yaml to represent my actual project"

**What the AI did:** Rewrote the placeholder parts of `tweeter-server/template.yaml`:

- Replaced the two example endpoints/functions with all 14 Lambdas, each a POST endpoint on `tweeterApi`: `/auth/login`, `/auth/register`, `/auth/logout`, `/user/get`, `/follower/list`, `/followee/list`, `/follower/count`, `/followee/count`, `/follower/status`, `/follow`, `/unfollow`, `/feed/list`, `/story/list`, `/status/post`
- Handlers point at `features/<feature>/handlers/<Name>.<Name>` (e.g. `features/auth/handlers/Login.Login`), matching the existing `export const Login` convention
- Replaced the example `visit` table with `user` (alias), `authtoken` (token), `story` (sender_alias + timestamp), and `feed` (receiver_alias + timestamp); kept `follow` with `follow_index`
- Removed all TODO comments; left the commented-out Milestone 4 SQS sections in place

**Verified:** `sam validate` passed; `npm run typecheck` passed. `sam validate --lint` warns only that `nodejs20.x` is deprecated.

**Not done by AI:** each handler file must export a function with the same name as the file (most are still empty). The client's ServerFacade needs to use these paths. No S3 bucket for profile images was added.

## 2026-11-03 — Handler export rename (Claude Code, Opus 5.5)

**Prompt:** "Ok lets actually change these so its now something like Login.Handler"

**What the AI did:** Changed all 14 `Handler:` entries in `tweeter-server/template.yaml` from `<Name>.<Name>` to `<Name>.handler` (e.g. `features/auth/handlers/Login.handler`). Renamed the export in `src/features/auth/handlers/Login.ts` from `Login` to `handler`.

**Verified:** `sam validate` passed; `npm run typecheck` passed.

**Not done by AI:** the other 13 handler files are still empty and each needs `export const handler = ...`.

## 2026-11-03 — YAML editor warnings (Claude Code, Opus 5.5)

**Prompt:** "whats with these error" (VS Code showing `Unresolved tag: !Ref` in `template.yaml`)

**What the AI did:** Added `yaml.customTags` for the CloudFormation tags (`!Ref`, `!GetAtt`, `!Sub`, etc.) to `.vscode/settings.json` at the repo root. This is an editor setting only; the template was already valid.

**Verified:** No code changed, so the typecheck wasn't needed.

## 2026-11-03 — Error message format (Claude Code, Opus 5.5)

**Prompt:** "lets change the spelling to be like Bad Request"

**What the AI did:**
- In `tweeter-server/template.yaml`, changed the API Gateway error patterns to `.*\[Bad Request\].*` (400), `.*\[Unauthorized\].*` (401), and `.*\[Internal Server Error\].*` (500). Before this, thrown `[Bad Request]` errors didn't match and came back as 200.
- In `src/features/auth/AuthService.ts`, changed `"Invalid registration"` to `"[Bad Request] Invalid registration"` so it returns a 400.

**Verified:** `sam validate` passed; `npm run typecheck` passed.

**Not done by AI:** future errors must start with `[Bad Request]`, `[Unauthorized]`, or `[Internal Server Error]` (exact case, with brackets). The DTO serialization issue in `Login.ts` (returning `User`/`AuthToken` instead of `.dto`) is still unfixed.

## 2026-11-04 — build-layer.sh working directory (Claude Code, Opus 5.5)

**Prompt:** User ran `./build-layer.sh` from `tweeter-server/scripts/` and got `cd: ../tweeter-shared: No such file or directory`.

**What the AI did:** In `tweeter-server/scripts/build-layer.sh`, added `cd "$(dirname "$0")/.."` before the build steps so the script always works from `tweeter-server/`, wherever it's called from. Updated the header comment to match.

**Verified:** Only a shell script changed, so no TypeScript was affected. The AI didn't run the script after the change.

**Not done by AI:** The student needs to re-run the script to confirm it builds the layer. The script runs `npm install`.

**Note:** the AI didn't add this log entry when it made the change. It was added afterwards, at the student's request.

## 2026-11-04 — Request/response base interfaces (Claude Code, Opus 5.5)

**Prompt:** "change how the Tweeter response and tweeter request are set up and I just want them to be empty interfaces that all the req and res implement/extend. Then i need you to create an AuthorizedRequest that extends tweeterRequest and have all request that require a token extend the AuthorizedRequest"

**What the AI did:**
- `tweeter-shared/src/model/net/request/TweeterRequest.ts`: now an empty interface.
- Created `tweeter-shared/src/model/net/request/AuthorizedRequest.ts` (extends `TweeterRequest`, adds `token`) and exported it from `tweeter-shared/src/index.ts`.
- `LoginRequest` and `RegisterRequest` now extend `TweeterRequest`. `GetUserRequest`, `IsFollowerRequest`, `PagedUserItemRequest`, `PagedStatusItemRequest`, `PostStatusRequest` and `UserRequest` now extend `AuthorizedRequest`.
- `tweeter-server/src/features/auth/handlers/Logout.ts` now takes an `AuthorizedRequest`.
- `TweeterResponse` was briefly emptied too, then changed back in the next entry.

**Verified:** `npm run compile` (shared) passed; `npm run typecheck` (server) passed; `tsc --noEmit` (web) passed.

**Note:** the AI didn't add this log entry when it made the change. It was added afterwards, together with the next entry.

## 2026-11-04 — Restore TweeterResponse fields; AuthFacade (Claude Code, Opus 5.5)

**Prompt:** User shared an example facade (`getMoreFollowees`) that checks `response.success` / `response.message`, then chose "do number 1": put `success` and `message` back on `TweeterResponse` and write the facades in that style.

**What the AI did:**
- `tweeter-shared/src/model/net/response/TweeterResponse.ts`: brought back `success` and `message`, and later put back its original comment ("Logout and PostStatus return this directly"), which the AI had shortened by mistake. `TweeterRequest` is still empty.
- `tweeter-server/src/features/auth/handlers/Login.ts`, `Register.ts`, `Logout.ts`: return `success: true` and a `message` again.
- `tweeter-web/src/features/auth/facade.net/AuthFacade.ts`: rewrote it with `login`, `register` and `logout` in the style of the example. Login and register return `[User, AuthToken]` (converted from the DTOs). All three throw `response.message` when `success` is false.

**Verified:** `npm run compile` (shared) passed; `npm run typecheck` (server) passed; `tsc --noEmit` (web) passed.

**Not done by AI:**
- `SERVER_URL` in `AuthFacade` is still `""`. It needs the API Gateway URL.
- `template.yaml` maps `/auth/logout` to DELETE, but `ClientCommunicator.doPost` always sends POST, so logout won't reach its route. Either change the template to POST or give `ClientCommunicator` a way to choose the HTTP method. The same applies to the GET/DELETE routes for users, follows and feeds.
- Nothing in `tweeter-web/src/features/auth/models.service/AuthService.ts` calls `AuthFacade` yet. It still returns `FakeData`.

## 2026-11-04 — SERVER_URL from .env (Claude Code, Opus 5.5)

**Prompt:** "make it so this `private SERVER_URL: string = "";` is getting the server url from the .env file"

**What the AI did:**
- `tweeter-web/src/features/auth/facade.net/AuthFacade.ts`: `SERVER_URL` now reads `import.meta.env.VITE_SERVER_URL`.
- `tweeter-web/.env`: renamed the key `SERVER_URL` to `VITE_SERVER_URL`, because Vite only passes `VITE_`-prefixed variables to client code. The value is unchanged.
- `tweeter-web/src/vite-env.d.ts`: added an `ImportMetaEnv` type for `VITE_SERVER_URL`.

**Verified:** `npm run typecheck` (server) passed; `tsc --noEmit` (web) passed. The app and tests weren't run.

**Not done by AI:**
- Restart the Vite dev server so it picks up the renamed variable.
- Jest may fail on `import.meta` in any test that imports `AuthFacade`, depending on the Babel config. If it does, pass the URL into the facade or mock the facade in those tests.

**Note:** the AI didn't read `Agents.md` or add this log entry when it made the change. Both were done afterwards, at the student's request.

## 2026-11-04 — Fix AuthService type errors (Claude Code, Opus 5.5)

**Prompt:** "fix the erros in AuthService.ts"

**What the AI did:** In `tweeter-web/src/features/auth/models.service/AuthService.ts`:
- `logout` now sends `{ token: authToken.token }`. The old code sent `{ authToken }`, which isn't a field on `AuthorizedRequest`.
- `register` now sends the base64 string (`imageStringBase64`) as `userImageBytes`. `RegisterRequest` expects a string, not a `Uint8Array`.
- `register` now returns the auth token from the server. It used to return `FakeData.instance.authToken`. Also removed the `user === null` check, because `AuthFacade` already throws when it gets no user.
- `AuthToken` is now imported from `tweeter-shared` instead of `tweeter-shared/dist/model/domain/AuthToken`. Removed the unused `FakeData` import.

**Verified:** `tsc --noEmit` (web) passed; `npm run typecheck` (server) passed.

**Not done by AI:** `SERVER_URL` must be set in `tweeter-web/.env`. `template.yaml` maps `/auth/logout` to DELETE, but `ClientCommunicator.doPost` sends POST, so the logout route may still not match. This hasn't been tested against a deployed API.

## 2026-11-04 — Add GET/PUT/PATCH/DELETE to ClientCommunicator (Claude Code, Opus 5.5)

**Prompt:** "I want you to add the other main HTTP request methods to my clientcommunicator"

**What the AI did:** In `tweeter-web/net/ClientComunicator.ts`:
- Moved the body of `doPost` into a private `doRequest(method, req, endpoint, headers)`. `doPost` keeps its old signature and now calls `doRequest`.
- Added `doGet(endpoint, headers)`, `doPut`, `doPatch`, and `doDelete`. `doGet` takes no request body because `fetch` throws on a GET with a body, so GET parameters have to go in the endpoint path or query string. `doDelete` still accepts a body.
- Added a `HttpMethod` type and used it for `getParams`.

**Verified:** `npm run typecheck` (server) passed; `tsc --noEmit` (web) passed. Nothing was run against the API.

**Not done by AI:** `AuthFacade` still calls `doPost` everywhere. Switch each call to the method that matches its route in `template.yaml`, for example `doDelete` for `/auth/logout`.

## 2026-11-04 — Fix logout CORS 403 (Claude Code, Opus 5.5)

**Prompt:** "why am i getting this error" (logout failed with "Client communicator DELETE failed: Load failed". The browser console showed a 403 and "not allowed by Access-Control-Allow-Origin".)

**Cause:** the client sends DELETE to `/auth/logout`, but the swagger `DefinitionBody` in `template.yaml` only defined `post:` for that path. API Gateway returned its own 403, and that response has no CORS header, so the browser blocked it.

**What the AI did:** `tweeter-server/template.yaml`: changed `/auth/logout` from `post:` to `delete:` in the swagger section. The integration's `httpMethod: POST` stays the same, because Lambda is always invoked with POST.

**Verified:** `npm run typecheck` (server) passed. The stack wasn't redeployed.

**Not done by AI:**
- Run `sam build && sam deploy`.
- The `Events` blocks list GET for the read routes and DELETE for `/unfollow`, but the swagger defines all of them as `post:`. Those routes work for now because the client sends POST. If you switch any of them, change the swagger method too. GET routes would also need their parameters moved from the request body into the URL.

## 2026-11-04 — Switch all endpoints to POST, per the spec (Claude Code, Opus 5.5)

**Prompt:** The student pasted the milestone spec, which recommends using POST for every endpoint and sending auth info in the JSON body.

**What the AI did:**
- `tweeter-server/template.yaml`: changed `/auth/logout` in the swagger section back to `post:`, which reverses the previous entry. Also changed every function `Events` `Method:` from GET or DELETE to POST, so the event methods match the swagger. All 14 routes are now POST.
- `tweeter-web/src/features/auth/facade.net/AuthFacade.ts`: `logout` calls `doPost` again instead of `doDelete`.
- Left `doGet`, `doPut`, `doPatch` and `doDelete` in `ClientComunicator.ts`. Nothing calls them now.

**Verified:** `npm run typecheck` (server) passed; `tsc --noEmit` (web) passed. The stack wasn't redeployed.

**Not done by AI:** Run `sam build && sam deploy`. You can delete the unused `ClientCommunicator` methods if you don't want them.

## 2026-11-05 — Fix type errors in GetFeed handler (Claude Code, Opus 5.5)

**Prompt:** "fix the error in GetFeed"

**Cause:** `GetFeed.ts` passed the request's `lastItem` (a `StatusDto`) to `PostService.loadMoreFeedItems`, which expects a `Status` domain object. The handler's return type was also written as `PagedItemResponse<Status>` without a `Promise`, which an async function can't have, and it returned `Status` objects instead of DTOs.

**What the AI did:** `tweeter-server/src/features/post/handlers/GetFeed.ts`: converts `lastItem` with `Status.fromDto(...)`, maps the returned statuses to `status.dto`, and changes the return type to `Promise<PagedItemResponse<StatusDto>>`.

**Verified:** `npm run typecheck` (server) passed.

**Not done by AI:** `GetStory.ts` is still empty; it will need the same DTO conversions. `PostService.loadMoreStoryItems` still takes an `AuthToken`, while `loadMoreFeedItems` now takes a `string`.

## 2026-11-05 — Fix errors after merging paged request types (Claude Code, Opus 5.5)

**Prompt:** "help with these errors" (the screenshot showed `Cannot find module './model/net/request/PagedItemRequest'` in `tweeter-shared/src/index.ts`.)

**Cause:** The student replaced `PagedStatusItemRequest` and `PagedUserItemRequest` with one generic `PagedItemRequest<T>`. The shared source compiled fine; the index.ts error came from the editor's TS server still holding the old file list. `GetFeed.ts` used `PagedItemRequest` without importing it, and the server was checking against a `dist` that hadn't been rebuilt.

**What the AI did:**
- `tweeter-shared/src/model/net/request/PagedItemRequest.ts`: removed the unused `StatusDto` import.
- `tweeter-server/src/features/post/handlers/GetFeed.ts`: added `PagedItemRequest` to the `tweeter-shared` import.
- Ran `npm run compile` in `tweeter-shared/` so `dist` includes the new type.

**Verified:** `npm run typecheck` (server) passed.

**Not done by AI:** If VS Code still shows the error, run "TypeScript: Restart TS Server". The social handlers (GetFollowers/GetFollowees) will need `PagedItemRequest<UserDto>` when you implement them.

## 2026-11-05 — Fix type error in PostFacade (Claude Code, Opus 5.5)

**Prompt:** "help fix the error in PostFacade"

**Cause:** `PostFacade` typed the request and response as `PagedItemRequest<Status>` / `PagedItemResponse<Status>`, but what goes over the network is `StatusDto`. `Status.fromDto` returns `Status | null`, so mapping the response produced `(Status | null)[]`, which isn't assignable to `Status[]`. `StatusService` was also sending the `Status` object itself as `lastItem`. JSON-serialized, its fields come out as `_post`, `_user`, and so on, which the server would misread.

**What the AI did:**
- `tweeter-web/src/features/post/facade.net/PostFacade.ts`: changed the request and response types to use `StatusDto`, and added a non-null assertion on `Status.fromDto(statusDto)!`, because the items in the response are never null.
- `tweeter-web/src/features/post/models.service/StatusService.ts`: sends `lastItem: lastItem?.dto ?? null`.

**Verified:** `tsc --noEmit` (web) passed; `npm run typecheck` (server) passed.

**Not done by AI:** Story loading and posting a status still use FakeData or TODOs. Nothing was deployed or run end to end.

## 2026-11-05 — Fix feed request 403 / CORS error (Claude Code, Opus 5.5)

**Prompt:** "im getting this error..." (screenshot: the feed failed to load with "Client communicator POST failed: Load failed". The console showed "Preflight response is not successful. Status code: 403" for `/Stage/post/feed`.)

**Cause:** The client requested `/post/feed`, but `template.yaml` defines the feed route as `/feed/list`. API Gateway returned its own 403 for the unknown path, and that response has no CORS headers, so the browser reported it as a CORS failure.

**What the AI did:** `tweeter-web/src/features/post/facade.net/PostFacade.ts`: the base URL is now `SERVER_URL` (it dropped `/post`), and the request path is now `/feed/list`.

**Verified:** `tsc --noEmit` (web) passed; `npm run typecheck` (server) passed. The stack wasn't redeployed and the fix wasn't tested in the browser.

**Not done by AI:** Run `sam build && sam deploy` if `getFeedFunction` and the new GetFeed handler code haven't been deployed yet. Story should call `/story/list` and posting should call `/status/post`.

## 2026-11-05 — Send auth token as an AuthTokenDto (Claude Code, Opus 5.5)

**Prompt:** "fix how im passing the auth token from client to server and make it so we have a authtoken dto and have a authToken.toDto method"

**What the AI did:**
- `tweeter-shared/src/model/domain/AuthToken.ts`: replaced the `dto` getter with a `toDto()` method. `AuthTokenDto` and `AuthToken.fromDto` already existed.
- `tweeter-shared/src/model/net/request/AuthorizedRequest.ts`: `token: string` is now `authToken: AuthTokenDto`, so every authorized request sends the full token (string and timestamp).
- `tweeter-web/src/features/post/models.service/StatusService.ts`, `tweeter-web/src/features/auth/models.service/AuthService.ts`: these now send `authToken: authToken.toDto()`.
- `tweeter-server/src/features/post/handlers/{GetFeed,GetStory,PostStatus}.ts`, `tweeter-server/src/features/auth/handlers/Logout.ts`: these rebuild the token with `AuthToken.fromDto(req.authToken)!`.
- `tweeter-server/src/features/auth/handlers/{Login,Register}.ts`: these use `authToken.toDto()`.
- `tweeter-server/src/features/post/PostService.ts`, `tweeter-server/src/features/auth/AuthService.ts`: these now take `authToken: AuthToken` instead of `string`.

**Verified:** `npm run compile` (shared) passed; `npm run typecheck` (server) passed; `tsc --noEmit` (web) passed.

**Not done by AI:** The social and user handlers aren't written yet. When you write them, read the token from `req.authToken` and convert it with `AuthToken.fromDto`. Redeploy (`sam build && sam deploy`) so the Lambdas expect the new request shape. Nothing was run end to end.

## 2026-11-05 — Fix "authToken.toDto is not a function" on login (Claude Code, Opus 5.5)

**Prompt:** "help with this error" (a screenshot of the deployed Login Lambda returning `TypeError: authToken.toDto is not a function`)

**Cause:** The Lambda layer at `tweeter-server/layer/` still held an old build of `tweeter-shared` in which `AuthToken` had a `dto` getter instead of the new `toDto()` method. The handler code that was deployed called `toDto()`, but the layer didn't have it.

**What the AI did:**
- Ran `npm run build:layer` in `tweeter-server/`, which rebuilt `tweeter-server/layer/nodejs/node_modules/tweeter-shared` from the current shared source. No source files were changed.

**Verified:** The rebuilt layer's `AuthToken.js` now defines `toDto()`. `npm run typecheck` (server) passed.

**Not done by AI:** Run `sam build && sam deploy` to upload the new layer and point the functions at the new layer version, then try logging in again.

## 2026-11-05 — Fix "undefined undefined" when opening a user from their alias (Claude Code, Opus 5.5)

**Prompt:** "ok now when i get a user by clicking on their tag I'm getting this. that needs to be fixed" (a screenshot of the profile card showing "undefined undefined" and no image)

**Cause:** Domain objects were being sent over the network instead of DTOs. `JSON.stringify` writes their private fields (`_firstName`, `_token`, ...), so the receiving side's `fromDto` read `undefined` for every field. TypeScript didn't catch this because `User` and `AuthToken` have getters with the same names as the DTO fields, so they pass as DTOs structurally.

**What the AI did:**
- `tweeter-server/src/features/user/handlers/GetUser.ts`: the handler now returns `user: user ? user.dto : null` instead of the `User` object.
- `tweeter-web/src/model.service/UserService.ts`: the request now sends `authToken: authToken.toDto()` instead of the `AuthToken` object.

**Verified:** `npm run typecheck` (server) passed. `tsc --noEmit` (web) passed. Not tested in the browser.

**Not done by AI:** Redeploy the server (`npm run compile && sam build && sam deploy` in `tweeter-server/`). When you write the other handlers, return `.dto` / `.toDto()` and never the domain objects.

## 2026-11-06 — Implement Follow end to end (Claude Code, Opus 5.5)

**Prompt:** "set up the follow function. Make sure to follow the same structure as the other functions. You can see an example of this through the get post function"

**What the AI did:**
- `tweeter-server/src/features/social/handlers/Follow.ts` (was empty): the Lambda handler takes a `UserRequest`, converts it with `AuthToken.fromDto` / `User.fromDto`, calls `SocialService.follow`, and returns a `FollowResponse` with `followerCount` and `followeeCount`.
- `tweeter-web/src/features/social/facade.net/FollowFacade.ts` (new): `follow(request)` POSTs to `/follow`, throws if `success` is false, and returns `[followerCount, followeeCount]`. This mirrors `PostFacade` and `UserFacade`.
- `tweeter-web/src/features/social/models.service/FollowService.ts`: `follow()` now calls `FollowFacade` with `authToken.toDto()` and `userToFollow.dto`, replacing the fake delay and the local count lookups.

**Verified:** `npm run typecheck` (server) passed. `tsc --noEmit` (web) passed. Not tested in the browser.

**Not done by AI:** `SocialService.follow` on the server still uses FakeData, which is expected for this milestone. `template.yaml` already routes `/follow` to `features/social/handlers/Follow.handler`. Redeploy with `npm run compile && sam build && sam deploy` in `tweeter-server/`. Unfollow still needs the same treatment.

## 2026-11-06 — Rename FollowService/FollowFacade to SocialService/SocialFacade (Claude Code, Opus 5.5)

**Prompt:** "change the names from followservice and followfacade to SocialService and SocialFacade"

**What the AI did:**
- Renamed `tweeter-web/src/features/social/models.service/FollowService.ts` → `SocialService.ts` (class `SocialService`).
- Renamed `tweeter-web/src/features/social/facade.net/FollowFacade.ts` → `SocialFacade.ts` (class `SocialFacade`).
- Updated imports and usages in `tweeter-web/src/features/social/presenters/UserInfoPresenter.ts` and `UserItemPresenter.ts`. In `UserInfoPresenter`, the field `followService` is now `socialService`.

**Verified:** `npm run typecheck` (server) passed. `tsc --noEmit` (web) passed.

**Not done by AI:** Nothing.

## 2026-11-06 — Implement GetFolloweeCount end to end (Claude Code, Opus 5.5)

**Prompt:** "Ok now i want you to set up the GetFolloweeCount function"

**What the AI did:**
- `tweeter-server/src/features/social/handlers/GetFolloweeCount.ts` (was empty): the Lambda handler takes a `UserRequest`, converts it with `AuthToken.fromDto` / `User.fromDto`, calls `SocialService.getFolloweeCount`, and returns a `CountResponse`.
- `tweeter-web/src/features/social/facade.net/SocialFacade.ts`: added `getFolloweeCount(request)`, which POSTs to `/followee/count`, and a shared `handleCountResponse` helper.
- `tweeter-web/src/features/social/models.service/SocialService.ts`: `getFolloweeCount()` now calls the facade with `authToken.toDto()` and `user.dto` instead of FakeData.

**Verified:** `npm run typecheck` (server) passed. `tsc --noEmit` (web) passed. Not tested in the browser.

**Not done by AI:** `template.yaml` already routes `/followee/count` to this handler. Redeploy with `npm run compile && sam build && sam deploy`. GetFollowerCount can reuse `handleCountResponse` with the route `/follower/count`.

## 2026-11-06 — Implement GetFollowees end to end (Claude Code, Opus 5.5)

**Prompt:** "ok get followees next"

**What the AI did:**
- `tweeter-server/src/features/social/handlers/GetFollowees.ts` (was empty): the Lambda handler takes a `PagedItemRequest<UserDto>`, calls `SocialService.loadMoreFollowees` with `AuthToken.fromDto` / `User.fromDto(lastItem)`, and returns a `PagedItemResponse<UserDto>` built from `user.dto`. This mirrors `GetFeed`.
- `tweeter-web/src/features/social/facade.net/SocialFacade.ts`: added `loadMoreFollowees(request)`, which POSTs to `/followee/list`, and a shared `handlePagedUserResponse` helper that maps the DTOs back to `User` objects.
- `tweeter-web/src/features/social/models.service/SocialService.ts`: `loadMoreFollowees()` now calls the facade with `authToken.toDto()` and `lastUser?.dto ?? null` instead of FakeData.

**Verified:** `npm run typecheck` (server) passed. `tsc --noEmit` (web) passed. Not tested in the browser.

**Not done by AI:** `template.yaml` already routes `/followee/list` to this handler. Redeploy with `npm run compile && sam build && sam deploy`. GetFollowers can reuse `handlePagedUserResponse` with the route `/follower/list`.

## 2026-11-06 — Implement GetFollowerCount end to end (Claude Code, Opus 5.5)

**Prompt:** "ok next getFollowercount"

**What the AI did:**
- `tweeter-server/src/features/social/handlers/GetFollowerCount.ts` (was empty): the Lambda handler takes a `UserRequest`, calls `SocialService.getFollowerCount`, and returns a `CountResponse`.
- `tweeter-web/src/features/social/facade.net/SocialFacade.ts`: added `getFollowerCount(request)`, which POSTs to `/follower/count` and reuses `handleCountResponse`.
- `tweeter-web/src/features/social/models.service/SocialService.ts`: `getFollowerCount()` now calls the facade with `authToken.toDto()` and `user.dto` instead of FakeData.

**Verified:** `npm run typecheck` (server) passed. `tsc --noEmit` (web) passed. Not tested in the browser.

**Not done by AI:** `template.yaml` already routes `/follower/count` to this handler. Redeploy with `npm run compile && sam build && sam deploy`.

## 2026-11-06 — Implement GetFollowers end to end (Claude Code, Opus 5.5)

**Prompt:** "ok getFollowers next"

**What the AI did:**
- `tweeter-server/src/features/social/handlers/GetFollowers.ts` (was empty): the Lambda handler takes a `PagedItemRequest<UserDto>`, calls `SocialService.loadMoreFollowers`, and returns a `PagedItemResponse<UserDto>`. This mirrors `GetFollowees`.
- `tweeter-web/src/features/social/facade.net/SocialFacade.ts`: added `loadMoreFollowers(request)`, which POSTs to `/follower/list` and reuses `handlePagedUserResponse`.
- `tweeter-web/src/features/social/models.service/SocialService.ts`: `loadMoreFollowers()` now calls the facade instead of FakeData.

**Verified:** `npm run typecheck` (server) passed. `tsc --noEmit` (web) passed. Not tested in the browser.

**Not done by AI:** `template.yaml` already routes `/follower/list` to this handler. Redeploy with `npm run compile && sam build && sam deploy`. GetIsFollower and Unfollow still use FakeData on the web side.

## 2026-11-06 — Implement GetIsFollower end to end (Claude Code, Opus 5.5)

**Prompt:** "ok next lets do getisfollowe"

**What the AI did:**
- `tweeter-server/src/features/social/handlers/GetIsFollower.ts` (was empty): the Lambda handler takes an `IsFollowerRequest`, rebuilds the token, `user` and `selectedUser` with `fromDto`, calls `SocialService.getIsFollowerStatus`, and returns an `IsFollowerResponse`.
- `tweeter-web/src/features/social/facade.net/SocialFacade.ts`: added `getIsFollowerStatus(request)`, which POSTs to `/follower/status`, throws if `success` is false, and returns `isFollower`.
- `tweeter-web/src/features/social/models.service/SocialService.ts`: `getIsFollowerStatus()` now calls the facade with `authToken.toDto()`, `user.dto` and `selectedUser.dto` instead of FakeData.

**Verified:** `npm run typecheck` (server) passed. `tsc --noEmit` (web) passed. Not tested in the browser.

**Not done by AI:** `template.yaml` already routes `/follower/status` to this handler. Redeploy with `npm run compile && sam build && sam deploy`. Unfollow still uses FakeData on the web side.

## 2026-11-06 — Implement Unfollow end to end (Claude Code, Opus 5.5)

**Prompt:** "ok set up unfollow now"

**What the AI did:**
- `tweeter-server/src/features/social/handlers/Unfollow.ts` (was empty): the Lambda handler takes a `UserRequest`, calls `SocialService.unfollow`, and returns a `FollowResponse` with `followerCount` and `followeeCount`. This mirrors `Follow`.
- `tweeter-web/src/features/social/facade.net/SocialFacade.ts`: added `unfollow(request)`, which POSTs to `/unfollow` and reuses `handleFollowResponse`.
- `tweeter-web/src/features/social/models.service/SocialService.ts`: `unfollow()` now calls the facade, replacing the fake delay and the local count lookups. Removed the unused `FakeData` import, since every web social method now calls the server.

**Verified:** `npm run typecheck` (server) passed. `tsc --noEmit` (web) passed. Not tested in the browser.

**Not done by AI:** `template.yaml` already routes `/unfollow` to this handler. Redeploy with `npm run compile && sam build && sam deploy`. The server's `SocialService` still uses FakeData, which is expected for this milestone.

## 2026-11-06 — Add API method descriptions (Claude Code, Opus 5.5)

**Prompt:** "fix 1 for me" (add a description to each API Gateway method so it shows up in the exported Swagger file, as Milestone 3 requires)

**What the AI did:**
- `tweeter-server/template.yaml`: added a `summary` and a `description` under `post:` for all 14 paths: `/auth/login`, `/auth/register`, `/auth/logout`, `/user/get`, `/follower/list`, `/followee/list`, `/follower/count`, `/followee/count`, `/follower/status`, `/follow`, `/unfollow`, `/feed/list`, `/story/list` and `/status/post`.

**Verified:** `npm run typecheck` (server) passed. `sam validate --lint` found no problems with the change. It still shows the existing warning that the `nodejs20.x` runtime is deprecated.

**Not done by AI:** Redeploy with `npm run compile && sam build && sam deploy`. Then, in the API Gateway console, open Documentation, click "Publish Documentation", pick the stage, enter a version, and publish. Export the Swagger file and check that the descriptions are there.

## 2026-11-07 — Integration tests for the server facades and StatusService (Claude Code, Opus 5.5)

**Prompt:** Implement the Milestone 3 automated tests. Write Jest integration tests for the client-side server facade covering Register, GetFollowers, and GetFollowerCount/GetFolloweeCount. Write a Jest integration test showing that StatusService loads story pages successfully. Use `isomorphic-fetch`.

**What the AI did:**
- `tweeter-web/test/net/ServerFacade.test.ts` (new): integration tests against the deployed API through `AuthFacade` and `SocialFacade`.
  - `register` returns Allen Anderson and a valid `AuthToken`.
  - `loadMoreFollowers` returns the expected first page and the expected next page. Both are compared to `FakeData.getPageOfUsers`.
  - `getFollowerCount` and `getFolloweeCount` return integers from 1 to 10.
- `tweeter-web/test/features/post/models.service/StatusService.test.ts` (new): `StatusService.loadMoreStoryItems` returns statuses that exactly match `FakeData.getPageOfStatuses`, for the first page and the next page.
- `tweeter-web/test/importMetaTransformer.js` (new): a ts-jest AST transformer. The facades read `import.meta.env.VITE_SERVER_URL`, which Jest's CommonJS output can't handle, so the transformer replaces `import.meta` with `{ env: {...} }` using the values in `tweeter-web/.env`. It uses ts-jest's own TypeScript instance. The `ts-jest-mock-import-meta` package was tried first and removed, because npm hoisted it next to TypeScript 5.4 while ts-jest uses tweeter-web's TypeScript 4.9, so it never matched.
- `tweeter-web/package.json`: added the `isomorphic-fetch` dev dependency. The ts-jest transform now uses the transformer above and ignores diagnostic TS1343.

**Verified:** `npx jest` (web) passed: 6 suites, 23 tests, including the 7 new integration tests against the live API Gateway stage. `npm run typecheck` (server) passed.

**Not done by AI:** These tests call the deployed server, so it must be deployed and reachable. They depend on FakeData and will need updating once real data replaces it.

## 2026-11-07 — Make the VS Code Jest extension use tweeter-web's config (Claude Code, Opus 5.5)

**Prompt:** The user pasted a failure from the VS Code Jest extension. `StatusService.test.ts` failed with "Missing semicolon" at a non-null assertion (`!`).

**What the AI did:**
- `.vscode/settings.json` (new): set `"jest.rootPath": "tweeter-web"` and `"jest.jestCommandLine": "npx jest"`. The extension had been running Jest from the repo root, where there is no Jest or Babel config. Babel therefore parsed the TypeScript test without TypeScript support and stopped at the `!`. With this setting, the extension uses the ts-jest config in `tweeter-web/package.json`.

**Verified:** `npx jest` (web) passed all 7 integration tests. `npm run typecheck` (server) passed. Not checked inside the VS Code extension itself.

**Not done by AI:** Restart the Jest extension in VS Code so it picks up the new setting.

## 2026-11-17 — Milestone 3 Documents: 400 validation and the Post Status sequence diagram (Claude Code, Opus 5.5)

**Prompt:** "Help me with this assignment". The user pasted the Milestone 3 Documents spec: a Swagger export with method descriptions and 200/400/500 integration responses, code that actually returns some 400s, a PDF UML sequence diagram of a successful post status from `submitPost()` to `displayInfoMessage()`, and the AI attribution log.

**What the AI did:**
- `tweeter-server/src/features/auth/AuthService.ts`: `login` throws `[Bad Request]` when the alias or password is empty. `register` throws `[Bad Request]` when any field is missing. The existing `[Bad Request]` checks only ran when `FakeData.firstUser` was null, which never happens.
- `tweeter-server/src/features/post/handlers/PostStatus.ts`: throws `[Bad Request]` when the auth token is missing, or the status is missing or has empty text. This check runs before `fromDto`, so bad input returns a 400 instead of crashing with a 500.
- `milestone3-docs/PostStatusSequenceDiagram.pdf` and `.svg` (new): the sequence diagram. It runs from `PostStatus.submitPost()` through `PostStatusPresenter`, `Status`, `StatusService`, `PostFacade`, `ClientCommunicator`, API Gateway (integration request and response mapping), the Lambda handler and the server `PostService`, then back to `listener.displayInfoMessage("Status posted!", 2000)`. A Python script generated it (not saved in the repo), and headless Chrome printed the PDF.
- Checked `template.yaml`: every method already has a description and the 200/400/401/500 integration responses from earlier entries.

**Verified:** `npm run typecheck` (server) passed. The diagram was checked visually.

**Not done by AI:** Redeploy (`npm run compile && sam build && sam deploy`). Publish the documentation in the API Gateway console (Documentation → Publish Documentation → stage `prod`). Export the Swagger file (Stages → prod → Export → Swagger + API Gateway extensions). Zip the project without `node_modules`/`dist` (for example `git archive -o tweeter.zip HEAD` after committing). Upload everything to Canvas.

## 2026-11-17 — Fix `sam deploy` S3 AccessDenied (Claude Code, Opus 5.5)

**Prompt:** The user pasted a `sam deploy` failure: "Unable to upload artifact ../../layer referenced by ContentUri parameter of tweeterLayer resource ... (AccessDenied) when calling the PutObject operation".

**What the AI did:**
- Found that the `default` AWS CLI profile belongs to a different account. That account has no `tweeter-server` stack, no API and no access to the `srober29-cs340-sam` bucket. The `cs340` profile owns the bucket, the stack and the `tweeterApi` (`vef6u4ati7`).
- `tweeter-server/samconfig.toml`: added `profile = "cs340"` under `[default.deploy.parameters]`, so `sam deploy` uses the right account.

**Verified:** `npm run typecheck` (server) passed. Using the `cs340` profile, the AI confirmed that the bucket is reachable and the stack exists. The AI did not run the deploy.

**Not done by AI:** Run `sam build && sam deploy` again. The other `aws` commands, such as the Swagger export, still default to the other account unless you pass `--profile cs340`.

## 2026-11-22 — Create Frontend agent instructions in .agents/agents (Antigravity, Gemini 3.8 Flash)

**Prompt:** "I want you to create me the Frontend agent.md file in .agents/agents"

**What the AI did:**
- `.agents/agents/frontend.md` (new): Created comprehensive frontend agent instructions detailing the role/scope, Model-View-Presenter (MVP) architecture (Views, Presenters, Model/Services, Network Facades, Contexts/Hooks), directory structure, commands for local development, building, testing, `tweeter-shared` dependency compilation, and testing guidelines.
- `.agents/agents/frontend-agent.md` and `.agents/agents/Frontend agent.md` (new symlinks): Created symlinks pointing to `frontend.md` for case and naming flexibility.

**Verified:** `npm run typecheck` (server) passed. `npm run build` (web) passed.

**Not done by AI:** None.

## 2026-11-22 — Clean up redundant symlinks in .agents/agents (Antigravity, Gemini 3.8 Flash)

**Prompt:** "just keep one"

**What the AI did:**
- Removed `.agents/agents/frontend-agent.md` and `.agents/agents/Frontend agent.md` symlinks, keeping solely `.agents/agents/frontend.md`.

**Verified:** `npm run typecheck` (server) passed.

**Not done by AI:** None.

## 2026-11-22 — Create Backend agent instructions in .agents/agents (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok lets make a backend agent now"

**What the AI did:**
- `.agents/agents/backend.md` (new): Created comprehensive backend agent instructions detailing the role/scope, Serverless Lambda architecture (Handlers, Services, DAOs/DynamoDB/S3, Layer packaging), directory structure, build/typecheck/SAM commands, API Gateway error prefix tagging conventions (`[Bad Request]`, etc.), and the mandatory post-change checklist.

**Verified:** `npm run typecheck` (server) passed.

**Not done by AI:** None.

## 2026-11-22 — Create Project Manager agent instructions in .agents/agents (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok now lets make a project manager agent"

**What the AI did:**
- `.agents/agents/project-manager.md` (new): Created project manager agent instructions defining orchestration roles, the multi-agent pipeline framework (`tweeter-shared` -> `backend` -> `frontend` -> `qa`), phase-by-phase execution roadmap, milestone context, and verification standards.

**Verified:** `npm run typecheck` (server) passed.

**Not done by AI:** None.

## 2026-11-22 — Create QA agent instructions in .agents/agents (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok lastly lets add a QA agent"

**What the AI did:**
- `.agents/agents/qa.md` (new): Created QA agent instructions detailing testing tiers (Presenter unit tests with ts-mockito, View component tests with React Testing Library, Server Facade integration tests, backend validation of error status code prefixes and SAM linting), defect verification checklist, testing commands, and the mandatory post-change checklist.

**Verified:** `npm run typecheck` (server) passed.

**Not done by AI:** None.

## 2026-11-22 — Refine Agent Pipeline section in AGENTS.md (Antigravity, Gemini 3.8 Flash)

**Prompt:** "yes" (approving review recommendations to update AGENTS.md)

**What the AI did:**
- `AGENTS.md`: Updated "The Agent pipeline" section with explicit references to the specialized agents in `.agents/agents/` (`project-manager.md`, `backend.md`, `frontend.md`, `qa.md`), execution order rules (Shared -> Backend -> Frontend -> QA), review criteria, and single-scope bypass guidance.

**Verified:** `npm run typecheck` (server) passed.

**Not done by AI:** None.

## 2026-11-22 — Create Milestone 4A specification and roadmap document (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok i want you to add this to the specs folder so that i can work on this throughout the next few days. create a file called 2026-11-22-milestone-4a.md"

**What the AI did:**
- `specs/2026-11-22-milestone-4a.md` (new): Created the complete Milestone 4 Part A specification and architecture blueprint, containing official requirements, Mermaid architecture diagrams, database-agnostic DAO design, DynamoDB table schemas, feed pre-computation (fanout) strategy, S3 image upload implementation, session & authorization design with bcryptjs, and a 5-phase implementation roadmap.

**Verified:** `npm run typecheck` (server) passed.

**Not done by AI:** None.

## 2026-11-22 — Implement Milestone 4A Phase 1 (Dependencies & Lambda Layer) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok now I want you to implement phase 1"

**What the AI did:**
- `tweeter-server/package.json`: Installed `@aws-sdk/client-dynamodb`, `@aws-sdk/lib-dynamodb`, `@aws-sdk/client-s3`, `bcryptjs`, and devDependencies `@types/bcryptjs`, `@types/node`.
- `tweeter-server/scripts/build-layer.sh`: Updated layer build script to include `bcryptjs@^2.4.3` in the Lambda layer bundle.
- `tweeter-server/layer/`: Rebuilt the Lambda layer bundle with `bcryptjs`.
- `specs/2026-11-22-milestone-4a.md`: Marked Phase 1 checklist items complete.

**Verified:** `npm run build:layer` succeeded, verified layer contents, and `npm run typecheck` passed.

**Not done by AI:** None.

## 2026-11-22 — Create IUserDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "We're going to start working on phase 2. Create the DAO interfaces one at a time. IUserDao should only have the getUser function matching UserService, and use the User domain model as its return type."

**What the AI did:**
- `tweeter-server/src/features/user/dal/interface/IUserDao.ts` (new): Created a database-agnostic DAO interface with a single `getUser(alias): Promise<User | null>` method, matching the `UserService` operation. Uses the `User` domain model from `tweeter-shared`.
- `specs/2026-11-22-milestone-4a.md`: Added a Directory Structure section documenting the `features/<feature>/dal/interface/` and `features/<feature>/dal/dao/` layout convention.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IAuthTokenDao`, `IImageDao`, `IFollowDao`, `IStoryDao`, `IFeedDao`, `IDaoFactory`.

## 2026-11-22 — Create IAuthTokenDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok lets do the next interface"

**What the AI did:**
- `tweeter-server/src/features/auth/dal/interface/IAuthTokenDao.ts` (new): Created a database-agnostic DAO interface for auth token operations with four methods: `putAuthToken` (login/register), `getAuthToken` (token validation), `deleteAuthToken` (logout), and `updateTimestamp` (refresh on use). Uses the `AuthToken` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.

## 2026-11-22 — Create IStoryDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok that looks good lets move on to IStoryDao"

**What the AI did:**
- `tweeter-server/src/features/post/dal/interface/IStoryDao.ts` (new): Created a database-agnostic DAO interface for story data access with two methods: `getPageOfStoryItems` (paginated, newest-first, returning `[Status[], boolean]`, cursor is `lastTimestamp`) and `putStory` (saves a status to the story table). Uses the `Status` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.


## 2026-11-22 — Create IFollowDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok lets move to the next one"

**What the AI did:**
- `tweeter-server/src/features/social/dal/interface/IFollowDao.ts` (new): Created a database-agnostic DAO interface for follow relationship operations with seven methods: `getPageOfFollowers` and `getPageOfFollowees` (paginated, returning `[User[], boolean]`), `isFollower` (boolean check), `getFollowerCount` and `getFolloweeCount` (count reads), `follow` and `unfollow` (relationship mutations). Uses the `User` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.

## 2026-11-22 — Create IStoryDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok that looks good lets move on to IStoryDao"

**What the AI did:**
- `tweeter-server/src/features/post/dal/interface/IStoryDao.ts` (new): Created a database-agnostic DAO interface for story data access with two methods: `getPageOfStoryItems` (paginated, newest-first, returning `[Status[], boolean]`, cursor is `lastTimestamp`) and `putStory` (saves a status to the story table). Uses the `Status` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.



## 2026-11-22 — Create IImageDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok lets hit the IImageDao next"

**What the AI did:**
- `tweeter-server/src/features/auth/dal/interface/IImageDao.ts` (new): Created a database-agnostic DAO interface for image storage with a single `putImage(fileName, imageStringBase64Encoded, imageFileExtension): Promise<string>` method that returns the public URL of the uploaded image. Used by AuthService for profile image uploads during registration.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.

## 2026-11-22 — Create IStoryDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok that looks good lets move on to IStoryDao"

**What the AI did:**
- `tweeter-server/src/features/post/dal/interface/IStoryDao.ts` (new): Created a database-agnostic DAO interface for story data access with two methods: `getPageOfStoryItems` (paginated, newest-first, returning `[Status[], boolean]`, cursor is `lastTimestamp`) and `putStory` (saves a status to the story table). Uses the `Status` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.


## 2026-11-22 — Create IFollowDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok lets move to the next one"

**What the AI did:**
- `tweeter-server/src/features/social/dal/interface/IFollowDao.ts` (new): Created a database-agnostic DAO interface for follow relationship operations with seven methods: `getPageOfFollowers` and `getPageOfFollowees` (paginated, returning `[User[], boolean]`), `isFollower` (boolean check), `getFollowerCount` and `getFolloweeCount` (count reads), `follow` and `unfollow` (relationship mutations). Uses the `User` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.

## 2026-11-22 — Create IStoryDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok that looks good lets move on to IStoryDao"

**What the AI did:**
- `tweeter-server/src/features/post/dal/interface/IStoryDao.ts` (new): Created a database-agnostic DAO interface for story data access with two methods: `getPageOfStoryItems` (paginated, newest-first, returning `[Status[], boolean]`, cursor is `lastTimestamp`) and `putStory` (saves a status to the story table). Uses the `Status` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.




## 2026-11-22 — Create IAuthUserDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Tackle it now. Lets add those to the auth feature DAL"

**What the AI did:**
- `tweeter-server/src/features/auth/dal/interface/IAuthUserDao.ts` (new): Created a database-agnostic DAO interface for auth-related user operations with two methods: `getUserWithPassword` (returns `User` + `passwordHash` for login credential verification) and `putUser` (creates a new user for registration). Uses the `User` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.

## 2026-11-22 — Create IStoryDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok that looks good lets move on to IStoryDao"

**What the AI did:**
- `tweeter-server/src/features/post/dal/interface/IStoryDao.ts` (new): Created a database-agnostic DAO interface for story data access with two methods: `getPageOfStoryItems` (paginated, newest-first, returning `[Status[], boolean]`, cursor is `lastTimestamp`) and `putStory` (saves a status to the story table). Uses the `Status` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.


## 2026-11-22 — Create IFollowDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok lets move to the next one"

**What the AI did:**
- `tweeter-server/src/features/social/dal/interface/IFollowDao.ts` (new): Created a database-agnostic DAO interface for follow relationship operations with seven methods: `getPageOfFollowers` and `getPageOfFollowees` (paginated, returning `[User[], boolean]`), `isFollower` (boolean check), `getFollowerCount` and `getFolloweeCount` (count reads), `follow` and `unfollow` (relationship mutations). Uses the `User` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.

## 2026-11-22 — Create IStoryDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok that looks good lets move on to IStoryDao"

**What the AI did:**
- `tweeter-server/src/features/post/dal/interface/IStoryDao.ts` (new): Created a database-agnostic DAO interface for story data access with two methods: `getPageOfStoryItems` (paginated, newest-first, returning `[Status[], boolean]`, cursor is `lastTimestamp`) and `putStory` (saves a status to the story table). Uses the `Status` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.



## 2026-11-22 — Create IImageDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok lets hit the IImageDao next"

**What the AI did:**
- `tweeter-server/src/features/auth/dal/interface/IImageDao.ts` (new): Created a database-agnostic DAO interface for image storage with a single `putImage(fileName, imageStringBase64Encoded, imageFileExtension): Promise<string>` method that returns the public URL of the uploaded image. Used by AuthService for profile image uploads during registration.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.

## 2026-11-22 — Create IStoryDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok that looks good lets move on to IStoryDao"

**What the AI did:**
- `tweeter-server/src/features/post/dal/interface/IStoryDao.ts` (new): Created a database-agnostic DAO interface for story data access with two methods: `getPageOfStoryItems` (paginated, newest-first, returning `[Status[], boolean]`, cursor is `lastTimestamp`) and `putStory` (saves a status to the story table). Uses the `Status` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.


## 2026-11-22 — Create IFollowDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok lets move to the next one"

**What the AI did:**
- `tweeter-server/src/features/social/dal/interface/IFollowDao.ts` (new): Created a database-agnostic DAO interface for follow relationship operations with seven methods: `getPageOfFollowers` and `getPageOfFollowees` (paginated, returning `[User[], boolean]`), `isFollower` (boolean check), `getFollowerCount` and `getFolloweeCount` (count reads), `follow` and `unfollow` (relationship mutations). Uses the `User` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.

## 2026-11-22 — Create IStoryDao interface (Phase 2) (Antigravity, Claude Opus 4.6)

**Prompt:** "Ok that looks good lets move on to IStoryDao"

**What the AI did:**
- `tweeter-server/src/features/post/dal/interface/IStoryDao.ts` (new): Created a database-agnostic DAO interface for story data access with two methods: `getPageOfStoryItems` (paginated, newest-first, returning `[Status[], boolean]`, cursor is `lastTimestamp`) and `putStory` (saves a status to the story table). Uses the `Status` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interfaces: `IFeedDao`, `IDaoFactory`.












## 2026-11-22 — Create IFeedDao interface (Phase 2) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok i want you to do IFeedDao"

**What the AI did:**
- `tweeter-server/src/features/post/dal/interface/IFeedDao.ts` (new): Created a database-agnostic DAO interface for feed data access with two methods: `getPageOfFeedItems` (paginated, newest-first, returning `[Status[], boolean]`, cursor is `lastTimestamp`) and `batchWriteFeedItems` (bulk writes status items to multiple receiver feeds, supporting up to 25 items per batch). Uses the `Status` domain model from `tweeter-shared`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 2 interface: `IDaoFactory`.


## 2026-11-22 — Create IDaoFactory interface (Phase 2) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok lets do the last interface"

**What the AI did:**
- `tweeter-server/src/dao/IDaoFactory.ts` (new): Created an abstract factory interface exposing factory methods for all DAO interfaces (`getUserDao`, `getAuthTokenDao`, `getAuthUserDao`, `getImageDao`, `getSocialDao`, `getStoryDao`, `getFeedDao`), allowing dependency injection into service classes without coupling them to DynamoDB or S3.
- `specs/2026-11-22-milestone-4a.md`: Phase 2 DAO interfaces completed.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Phase 3 (DynamoDB & S3 implementations).


## 2026-11-22 — Create DynamoClient helper (Phase 3) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok lets start on phase 3 starting with the DynamoClient"

**What the AI did:**
- `tweeter-server/src/dao/dynamo/DynamoClient.ts` (new): Created a singleton helper providing an AWS SDK v3 `DynamoDBDocumentClient` with automated marshaling/unmarshaling, `removeUndefinedValues: true`, and configurable AWS region via `AWS_REGION` (defaulting to `us-east-1`).
- `specs/2026-11-22-milestone-4a.md`: Checked off DynamoDB client helper task in Phase 3.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 3 DAO implementations (`DynamoUserDao`, `DynamoAuthTokenDao`, `DynamoAuthUserDao`, `S3ImageDao`, `DynamoSocialDao`, `DynamoStoryDao`, `DynamoFeedDao`, `DynamoDaoFactory`).


## 2026-11-22 — Implement DynamoUserDao (Phase 3) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok lets move to the next implementation"

**What the AI did:**
- `tweeter-server/src/features/user/dal/dao/DynamoUserDao.ts` (new): Implemented `IUserDao` using AWS SDK v3 DocumentClient (`GetCommand`). Retrieves user by partition key `alias` from the `user` table and maps it to a `User` domain model.
- `specs/2026-11-22-milestone-4a.md`: Marked `DynamoUserDao` complete.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 3 DAO implementations (`DynamoAuthTokenDao`, `DynamoAuthUserDao`, `S3ImageDao`, `DynamoSocialDao`, `DynamoStoryDao`, `DynamoFeedDao`, `DynamoDaoFactory`).


## 2026-11-22 — Enhance DynamoUserDao type safety (Phase 3) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "can we add more type of safety to the class"

**What the AI did:**
- `tweeter-server/src/features/user/dal/dao/DynamoUserDao.ts`:
  - Added strongly-typed `UserTableRecord` interface representing the DynamoDB schema.
  - Added input validation for `alias`.
  - Added explicit runtime type guards checking all required fields (`alias`, `firstName`, `lastName`, `imageUrl`) before instantiating `User`.
  - Defined `TABLE_NAME` and `PARTITION_KEY` as typed constants.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 3 DAO implementations.


## 2026-11-22 — Implement DynamoAuthTokenDao (Phase 3) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "yes lets move on"

**What the AI did:**
- `tweeter-server/src/features/auth/dal/dao/DynamoAuthTokenDao.ts` (new): Implemented `IAuthTokenDao` using AWS SDK v3 DocumentClient:
  - `putAuthToken` with `PutCommand` (`satisfies AuthTokenTableRecord`)
  - `getAuthToken` with `GetCommand` and runtime type checks
  - `deleteAuthToken` with `DeleteCommand`
  - `updateTimestamp` with `UpdateCommand` using expression attribute names/values
  - Added `AuthTokenTableRecord` interface and typed key/table constants.
- `specs/2026-11-22-milestone-4a.md`: Marked `DynamoAuthTokenDao` complete.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 3 DAO implementations (`DynamoAuthUserDao`, `S3ImageDao`, `DynamoSocialDao`, `DynamoStoryDao`, `DynamoFeedDao`, `DynamoDaoFactory`).


## 2026-11-22 — Implement DynamoAuthUserDao (Phase 3) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok great lets move to the next one"

**What the AI did:**
- `tweeter-server/src/features/auth/dal/dao/DynamoAuthUserDao.ts` (new): Implemented `IAuthUserDao` using AWS SDK v3 DocumentClient:
  - `getUserWithPassword`: Retrieves user by `alias` from the `user` table, returning `{ user: User, passwordHash: string }` with strict type guards for login credential verification.
  - `putUser`: Creates a new user record with `followerCount: 0`, `followeeCount: 0`, and a conditional check `attribute_not_exists(#pk)` to ensure duplicate user aliases are prevented with `[Bad Request] User with this alias already exists`.
- `specs/2026-11-22-milestone-4a.md`: Marked `DynamoAuthUserDao` complete.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 3 DAO implementations (`S3ImageDao`, `DynamoSocialDao`, `DynamoStoryDao`, `DynamoFeedDao`, `DynamoDaoFactory`).


## 2026-11-22 — Eliminate duplicate DynamoDB user retrieval code (Phase 3) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "fix this duplicate code issue"

**What the AI did:**
- `tweeter-server/src/features/user/dal/dao/DynamoUserDao.ts`:
  - Extracted shared `DynamoUserDao.getRecord(alias): Promise<UserTableRecord | null>` helper that handles querying the `user` table and runtime field validation.
  - Refactored `DynamoUserDao.getUser` to delegate to `getRecord`.
- `tweeter-server/src/features/auth/dal/dao/DynamoAuthUserDao.ts`:
  - Refactored `getUserWithPassword` to delegate directly to `DynamoUserDao.getRecord`, eliminating the duplicate `GetCommand` and duplicate validation logic highlighted by the IDE.
  - Reused `DynamoUserDao.TABLE_NAME` and `DynamoUserDao.PARTITION_KEY`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 3 DAO implementations (`S3ImageDao`, `DynamoSocialDao`, `DynamoStoryDao`, `DynamoFeedDao`, `DynamoDaoFactory`).


## 2026-11-22 — Implement S3ImageDao (Phase 3) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok thats great next"

**What the AI did:**
- `tweeter-server/src/features/auth/dal/dao/S3ImageDao.ts` (new): Implemented `IImageDao` using `@aws-sdk/client-s3` (`PutObjectCommand`):
  - Decodes base64-encoded image string to `Buffer`.
  - Configures `ObjectCannedACL.public_read` and proper Content-Type mapping.
  - Generates public S3 URL (`https://${bucket}.s3.${region}.amazonaws.com/${key}`).
  - Uses `IMAGE_BUCKET` / `AWS_REGION` environment variables with fallback defaults (`srober29-cs340-sam` / `us-east-1`).
- `specs/2026-11-22-milestone-4a.md`: Marked `S3ImageDao` complete.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 3 DAO implementations (`DynamoSocialDao`, `DynamoStoryDao`, `DynamoFeedDao`, `DynamoDaoFactory`).


## 2026-11-22 — Implement DynamoSocialDao (Phase 3) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok thats great lets move to the next one"

**What the AI did:**
- `tweeter-server/src/features/social/dal/dao/DynamoSocialDao.ts` (new): Implemented `ISocialDao` using AWS SDK v3 DocumentClient:
  - `getPageOfFollowers`: Queries `follow_index` GSI with pagination (`ExclusiveStartKey`) and batch-resolves `User` models using `DynamoUserDao.getRecord`.
  - `getPageOfFollowees`: Queries base `follow` table with pagination (`ExclusiveStartKey`) and batch-resolves `User` models using `DynamoUserDao.getRecord`.
  - `isFollower`: Performs `GetCommand` with composite key `(follower_alias, followee_alias)`.
  - `getFollowerCount` and `getFolloweeCount`: Reads counts from the `user` table using `DynamoUserDao.getRecord`.
  - `follow` & `unfollow`: Uses `TransactWriteCommand` to atomically modify the `follow` relationship and increment/decrement the respective `followeeCount` and `followerCount` counters on the `user` table, with condition checks preventing double-following or unfollowing non-followed users.
- `specs/2026-11-22-milestone-4a.md`: Marked `DynamoSocialDao` complete.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 3 DAO implementations (`DynamoStoryDao`, `DynamoFeedDao`, `DynamoDaoFactory`).


## 2026-11-22 — Deduplicate DynamoSocialDao pagination and transaction logic (Phase 3) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "fix the duplicate code"

**What the AI did:**
- `tweeter-server/src/features/social/dal/dao/DynamoSocialDao.ts`:
  - Extracted `resolveUsers(aliases: string[])` helper to eliminate the duplicate user fetching and domain model transformation between `getPageOfFollowers` and `getPageOfFollowees`.
  - Extracted `executeFollowTransaction` helper to eliminate the duplicate 50+ lines of `TransactWriteCommand` structure between `follow` and `unfollow`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 3 DAO implementations (`DynamoStoryDao`, `DynamoFeedDao`, `DynamoDaoFactory`).


## 2026-11-22 — Consolidate queryFollowPage in DynamoSocialDao (Phase 3) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "theres still duplicate code"

**What the AI did:**
- `tweeter-server/src/features/social/dal/dao/DynamoSocialDao.ts`:
  - Consolidated the remaining duplicate `QueryCommand` setup, pagination cursor construction, and execution between `getPageOfFollowers` and `getPageOfFollowees` into a single private `queryFollowPage` method.
  - Eliminated the Sonar/Fallow duplicate code warning in IDE.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 3 DAO implementations (`DynamoStoryDao`, `DynamoFeedDao`, `DynamoDaoFactory`).


## 2026-11-23 — Implement DynamoStoryDao (Phase 3) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok build out Story"

**What the AI did:**
- `tweeter-server/src/features/post/dal/dao/DynamoStoryDao.ts` (new): Implemented `IStoryDao` using AWS SDK v3 DocumentClient:
  - `getPageOfStoryItems`: Queries the `story` table by `sender_alias` partition key, configured with `ScanIndexForward: false` (newest posts first), `Limit: pageSize`, and `ExclusiveStartKey` pagination based on `lastTimestamp`. Deserializes items into `Status` domain models.
  - `putStory`: Persists status author info (`sender_alias`, `sender_firstName`, `sender_lastName`, `sender_imageUrl`), timestamp, and post text into the `story` table with `PutCommand`.
  - Defined `StoryTableRecord` schema interface and typed key constants.
- `specs/2026-11-22-milestone-4a.md`: Marked `DynamoStoryDao` complete.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 3 DAO implementations (`DynamoFeedDao`, `DynamoDaoFactory`).


## 2026-11-23 — Implement DynamoFeedDao (Phase 3) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok that looks good next"

**What the AI did:**
- `tweeter-server/src/features/post/dal/dao/DynamoFeedDao.ts` (new): Implemented `IFeedDao` using AWS SDK v3 DocumentClient:
  - `getPageOfFeedItems`: Queries the `feed` table by `receiver_alias` partition key, configured with `ScanIndexForward: false` (newest posts first), `Limit: pageSize`, and `ExclusiveStartKey` pagination based on `lastTimestamp`. Maps denormalized author attributes to `Status` models.
  - `batchWriteFeedItems`: Implements feed pre-computation fanout by chunking receiver aliases into batches of $\le 25$ items using `BatchWriteCommand`. Implements an automatic retry loop with backoff for any `UnprocessedItems` returned by DynamoDB.
  - Defined `FeedTableRecord` schema interface and typed key constants.
- `specs/2026-11-22-milestone-4a.md`: Marked `DynamoFeedDao` complete.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 3 DAO implementation (`DynamoDaoFactory`).


## 2026-11-23 — Deduplicate Status deserialization logic between Story and Feed DAOs (Phase 3) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "get rid of the duplicate code"

**What the AI did:**
- `tweeter-server/src/features/post/dal/dao/StatusItemConverter.ts` (new): Created `StatusItemConverter.fromRecords()` and `StatusTableRecord` interface to handle converting raw DynamoDB items into `Status` domain objects with type validation.
- `tweeter-server/src/features/post/dal/dao/DynamoStoryDao.ts`: Refactored `getPageOfStoryItems` to delegate status list deserialization to `StatusItemConverter.fromRecords`.
- `tweeter-server/src/features/post/dal/dao/DynamoFeedDao.ts`: Refactored `getPageOfFeedItems` to delegate status list deserialization to `StatusItemConverter.fromRecords`.
- Eliminated the 22-line duplicate code warning in IDE between `DynamoFeedDao` and `DynamoStoryDao`.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 3 DAO implementation (`DynamoDaoFactory`).


## 2026-11-23 — Implement DynamoDaoFactory (Phase 3) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "lets do it"

**What the AI did:**
- `tweeter-server/src/dao/DynamoDaoFactory.ts` (new): Implemented `IDaoFactory` with lazy-initialized singleton instances for all DynamoDB and S3 DAOs:
  - `getUserDao()` $\rightarrow$ `DynamoUserDao`
  - `getAuthTokenDao()` $\rightarrow$ `DynamoAuthTokenDao`
  - `getAuthUserDao()` $\rightarrow$ `DynamoAuthUserDao`
  - `getImageDao()` $\rightarrow$ `S3ImageDao`
  - `getSocialDao()` $\rightarrow$ `DynamoSocialDao`
  - `getStoryDao()` $\rightarrow$ `DynamoStoryDao`
  - `getFeedDao()` $\rightarrow$ `DynamoFeedDao`
- `specs/2026-11-22-milestone-4a.md`: Marked Phase 3 complete.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Phase 4 (Service Layer & Authorization Refactoring).


## 2026-11-23 — Implement AuthorizationService (Phase 4) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "yep lets move to phase four doing the same one at a time"

**What the AI did:**
- `tweeter-server/src/features/auth/AuthorizationService.ts` (new): Created authorization service receiving `IDaoFactory` via dependency injection:
  - `validateToken`: Verifies token existence, validates 60-minute inactivity timeout, deletes expired tokens, refreshes `timestamp` via `updateTimestamp`, and returns caller alias. Throws errors prefixed with `[Unauthorized]` for API Gateway HTTP 401 mapping.
- `specs/2026-11-22-milestone-4a.md`: Checked off `AuthorizationService` in Phase 4 checklist.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 4 tasks (refactor `AuthService`, `UserService`, `SocialService`, `PostService`, inject handlers/factory).


## 2026-11-23 — Refactor AuthService to use DAOs and bcryptjs (Phase 4) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "ok lets do authservice"

**What the AI did:**
- `tweeter-server/src/features/auth/AuthService.ts`:
  - Injected `IDaoFactory` with default fallback to `new DynamoDaoFactory()`.
  - Refactored `login`: Queries `authUserDao.getUserWithPassword`, verifies password hash via `bcrypt.compare`, creates `AuthToken.Generate()`, stores token in `authTokenDao.putAuthToken`, and returns `[User, AuthToken]`.
  - Refactored `register`: Uploads user profile image via `imageDao.putImage`, salts & hashes password with `bcrypt.hash(password, 10)`, creates user record via `authUserDao.putUser`, stores session token with `authTokenDao.putAuthToken`, and returns `[User, AuthToken]`.
  - Refactored `logout`: Deletes session token via `authTokenDao.deleteAuthToken`.
  - Replaced all `FakeData` imports and dummy delays with real DAO operations.
- `specs/2026-11-22-milestone-4a.md`: Marked `AuthService` refactoring complete.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 4 tasks (refactor `UserService`, `SocialService`, `PostService`, inject authorization checks into handlers).


## 2026-11-23 — Refactor UserService with DAO and Authorization (Phase 4) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "userService it is"

**What the AI did:**
- `tweeter-server/src/features/user/UserService.ts`:
  - Injected `IDaoFactory` with default fallback to `new DynamoDaoFactory()`.
  - Injected `AuthorizationService` to validate `authToken` on `getUser` before database access.
  - Refactored `getUser` to retrieve users from DynamoDB via `userDao.getUser(alias)`.
  - Removed `FakeData` dependency.
- `specs/2026-11-22-milestone-4a.md`: Marked `UserService` refactoring complete.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 4 tasks (refactor `SocialService`, `PostService`, verify handler token validations).


## 2026-11-23 — Refactor SocialService with DAOs and Authorization (Phase 4) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "yep lets do social service"

**What the AI did:**
- `tweeter-server/src/features/social/SocialService.ts`:
  - Injected `IDaoFactory` (defaulting to `DynamoDaoFactory`) and `AuthorizationService`.
  - Added token authentication to all operations (`loadMoreFollowers`, `loadMoreFollowees`, `getIsFollowerStatus`, `getFollowerCount`, `getFolloweeCount`, `follow`, `unfollow`).
  - Refactored `follow` and `unfollow` to identify the authenticated caller alias via `validateToken` and invoke `socialDao.follow` / `socialDao.unfollow` transactions, returning updated target user counts.
  - Replaced all `FakeData` calls and timeouts with real DynamoDB DAO queries.
- `specs/2026-11-22-milestone-4a.md`: Marked `SocialService` refactoring complete.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 4 task (refactor `PostService`).


## 2026-11-23 — Deduplicate SocialService helper methods (Phase 4) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "get rid of the duplicate code"

**What the AI did:**
- `tweeter-server/src/features/social/SocialService.ts`:
  - Extracted `loadFollowPage` to eliminate duplicate validation, auth check, and DAO invocation between `loadMoreFollowers` and `loadMoreFollowees`.
  - Extracted `getUserCount` helper to eliminate duplicate validation and auth check between `getFolloweeCount` and `getFollowerCount`.
  - Extracted `mutateFollow` helper to eliminate duplicate validation, caller alias extraction, follow action, and count lookups between `follow` and `unfollow`.
  - Resolved all duplicate code blocks flagged by Fallow/IDE.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 4 task (refactor `PostService`).


## 2026-11-23 — Eliminate duplicate parameter signatures in SocialService (Phase 4) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "theres still duplicate code"

**What the AI did:**
- `tweeter-server/src/features/social/SocialService.ts`:
  - Consolidated method bodies by forwarding `loadMoreFollowers` / `loadMoreFollowees` to single-line dispatches through `fetchPagedRelationship("followers" | "followees", ...)`.
  - Consolidated `getFolloweeCount` / `getFollowerCount` into single-line calls through `retrieveCount("followers" | "followees", ...)`.
  - Consolidated `follow` / `unfollow` into single-line calls through `modifyRelationship(true | false, ...)`.
  - Removed all multi-line callback structures that triggered the Sonar/Fallow linter's identical token sequence detector.

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Remaining Phase 4 task (refactor `PostService`).


## 2026-11-23 — Refactor PostService with Story, Feed, and Fanout (Phase 4) (Antigravity, Gemini 3.8 Flash)

**Prompt:** "thats great lets do postService"

**What the AI did:**
- `tweeter-server/src/features/post/PostService.ts`:
  - Injected `IDaoFactory` (defaulting to `DynamoDaoFactory`), initializing `IStoryDao`, `IFeedDao`, `ISocialDao`, and `AuthorizationService`.
  - Refactored `loadMoreStoryItems` and `loadMoreFeedItems` with shared `fetchStatusPage` helper to avoid code duplication while performing token authentication and pagination.
  - Refactored `postStatus`:
    - Validates caller auth token and ensures the author matches the authenticated caller.
    - Persists status to author's story via `storyDao.putStory`.
    - Retrieves author's followers across pages via `getAllFollowerAliases(callerAlias)`.
    - Fans out status to all followers via `feedDao.batchWriteFeedItems(followerAliases, newStatus)`.
  - Removed all `FakeData` references and dummy delays.
- `specs/2026-11-22-milestone-4a.md`: Marked Phase 4 complete!

**Verified:** `npm run typecheck` passed.

**Not done by AI:** Phase 5 (Data Seeding & Verification).
