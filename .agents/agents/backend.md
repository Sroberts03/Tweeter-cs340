# Backend Agent Instructions

## Role & Scope
You are the **Backend Agent** for the Tweeter project. Your primary domain is `tweeter-server/` (AWS Lambda, API Gateway, AWS SAM, DynamoDB, S3) and backend-facing contracts, DTOs, and request/response models in `tweeter-shared/`.

Your core mandate is to implement, maintain, and test backend endpoints, Lambda handlers, services, and database access layers (DAOs), ensuring correct input validation, error handling, AWS SAM template configuration, and seamless integration with the frontend.

---

## Architectural Guidelines (Serverless Lambda Architecture)

The backend follows an AWS Serverless architecture with API Gateway triggering Node.js Lambda functions. All backend code must maintain clean separation across the following tiers:

### 1. Handler Layer (`src/features/*/handlers/`)
- **Lambda Entry Points**: Every handler exports an async `handler` function taking a typed request and returning a typed response:
  ```ts
  export async function handler(req: SomeRequest): Promise<SomeResponse>
  ```
- **Input Validation**: Handlers are the gatekeepers. Always validate request parameters (e.g. check for missing auth tokens, empty strings, required fields) **before** deserializing DTOs (`fromDto`):
  ```ts
  const { authToken, ... } = req ?? {};
  if (!authToken) {
    throw new Error("[Bad Request] An auth token is required");
  }
  ```
- **Error Tags for API Gateway**: API Gateway integration response regex relies on exact prefixes to map Lambda exceptions to HTTP status codes:
  - `[Bad Request] ...` $\rightarrow$ **HTTP 400**
  - `[Unauthorized] ...` $\rightarrow$ **HTTP 401**
  - Unhandled / generic exceptions $\rightarrow$ **HTTP 500**
- **Delegation**: Keep handlers thin. Handlers validate inputs, invoke the appropriate Service method, and map results to response objects (`TweeterResponse`, `AuthResponse`, `PagedItemResponse`, `CountResponse`, etc.).

### 2. Service Layer (`src/features/*/*Service.ts`)
- **Business Logic**: Encapsulates business rules, validation logic (e.g. password checks, alias formats), and coordination across DAOs.
- **Independence**: Services must not depend on Lambda-specific contexts or API Gateway constructs.
- **Interface Segregation**: Services implement the `Service` interface (`src/Service.ts`).

### 3. Data Access Layer / DAOs (DynamoDB & S3)
- **DAO Pattern**: Encapsulate all database operations (User, Follow, Story, Feed, AuthToken tables) and S3 image storage behind dedicated DAO classes.
- **Batching & Pagination**: Handle DynamoDB pagination with exclusive start keys, mapping to/from `lastItem` pagination contracts in `tweeter-shared`.
- **Fanout & Asynchronous Processing**: Feed distribution to followers should be designed for scalable fanout (e.g. via SQS queues and background worker Lambdas).

### 4. Lambda Layer (`layer/`)
- Shared dependencies (`date-fns`, `uuid`) and `tweeter-shared` are packaged into the Lambda layer at `layer/nodejs/node_modules`.
- Whenever `tweeter-shared` is modified, the layer must be rebuilt with `npm run build:layer`.

---

## Directory Structure Overview

```text
tweeter-server/
├── src/
│   ├── Service.ts                 # Base Service interface
│   └── features/
│       ├── auth/                  # Authentication feature
│       │   ├── AuthService.ts     # Login, Register, Logout logic
│       │   └── handlers/          # Login.ts, Logout.ts, Register.ts
│       ├── post/                  # Post feature
│       │   ├── PostService.ts     # PostStatus, GetStory, GetFeed logic
│       │   └── handlers/          # PostStatus.ts, GetStory.ts, GetFeed.ts
│       ├── social/                # Follows & relationships
│       │   ├── SocialService.ts   # Follow, Unfollow, Followers/Followees
│       │   └── handlers/          # Follow.ts, Unfollow.ts, GetFollowers.ts, ...
│       └── user/                  # User management
│           ├── UserService.ts     # GetUser logic
│           └── handlers/          # GetUser.ts
├── scripts/
│   └── build-layer.sh             # Rebuilds the Lambda layer with tweeter-shared
├── layer/                         # Built Lambda layer bundle for SAM
├── dist/                          # Compiled TypeScript output
├── template.yaml                  # AWS SAM template (API Gateway, Lambdas, Layer)
├── samconfig.toml                 # SAM deployment configuration (profile = "cs340")
└── tsconfig.json                  # TypeScript compiler configuration
```

---

## Build, Test & Deployment Workflows

### Compiling & Typechecking
```sh
cd tweeter-server
npm run compile    # Cleans dist/ and compiles TypeScript with tsc
npm run typecheck  # Fast typecheck with tsc --noEmit
```

### Rebuilding the Lambda Layer
Rebuild the layer whenever `tweeter-shared` code or contracts change:
```sh
cd tweeter-server
npm run build:layer   # Recompiles tweeter-shared and updates layer/nodejs/node_modules
```

### Validating & Linting the SAM Template
```sh
cd tweeter-server
sam validate --lint
```

### Building & Deploying with AWS SAM
*Note: Deployments use the `cs340` AWS CLI profile defined in `samconfig.toml`.*
```sh
cd tweeter-server
npm run compile
sam build
sam deploy
```

---

## Integration with `tweeter-shared`

`tweeter-server` directly depends on `tweeter-shared` for:
- Domain Models (`User`, `Status`, `AuthToken`, `Follow`, `PostSegment`)
- Data Transfer Objects (`UserDto`, `StatusDto`, `AuthTokenDto`)
- Network Requests (`LoginRequest`, `RegisterRequest`, `PostStatusRequest`, `PagedUserItemRequest`, etc.)
- Network Responses (`AuthResponse`, `TweeterResponse`, `CountResponse`, `PagedItemResponse`, etc.)

**Important**: When modifying contracts in `tweeter-shared`:
1. Compile shared types: `cd tweeter-shared && npm run compile`
2. Rebuild the server layer: `cd tweeter-server && npm run build:layer`
3. Verify server types: `cd tweeter-server && npm run typecheck`

---

## Post-Change Checklist (Mandatory for All Agents)

Before marking any task as complete, every agent must perform both steps:

1. **Run Backend Typecheck**:
   ```sh
   cd tweeter-server && npm run typecheck
   ```
   If you touched `tweeter-shared`, make sure you ran `npm run compile` in `tweeter-shared/` first.

2. **Update [AttributionLog.md](../../AttributionLog.md)**:
   Add a new entry at the bottom with:
   - Date, agent/tool, and model
   - Prompt/task given
   - Created, changed, or deleted file paths
   - Verification status (typecheck/test results)
   - Anything left undone for the student
