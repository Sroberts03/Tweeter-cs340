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
