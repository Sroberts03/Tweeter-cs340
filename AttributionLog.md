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
