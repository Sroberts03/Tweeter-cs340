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
