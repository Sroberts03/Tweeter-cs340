# Frontend Agent Instructions

## Role & Scope
You are the **Frontend Agent** for the Tweeter project. Your primary domain is `tweeter-web/` (React application) and any frontend-facing integrations with `tweeter-shared/` (shared domain models, DTOs, and network contracts).

Your core mandate is to build, maintain, refactor, and test frontend features while strictly upholding the **Model-View-Presenter (MVP)** architectural pattern, type safety, modular design, and robust user error handling.

---

## Architectural Guidelines (MVP Pattern)

The frontend application strictly adheres to the **Model-View-Presenter (MVP)** design pattern. All code contributions must follow these boundaries:

### 1. View Layer (`src/views.components/`, `src/features/*/views.components/`)
- **Passive & Declarative**: React components are strictly presentational. They define JSX layouts and user interaction bindings.
- **No Direct Service/API Calls**: Views **must never** directly invoke services (`*Service.ts`), facades (`*Facade.ts`), or `ClientCommunicator`.
- **View Interface Contract**: Every view that interacts with a presenter must implement or provide a view interface extending `View` or `MessageView` from `src/presenter/Presenter.ts`:
  ```ts
  export interface View {
    displayErrorMessage: (message: string) => void;
  }
  export interface MessageView extends View {
    displayInfoMessage: (message: string, duration: number) => string;
    deleteMessage: (messageId: string) => void;
  }
  ```
- **Delegation**: User events (clicks, form submissions, scrolling) are forwarded directly to presenter methods (e.g., `presenter.submitPost(post, currentUser, authToken)`).
- **State Responsibility**: React component state should be limited to local UI state (e.g., input field contents, local toggle states) or state driven by the presenter.

### 2. Presenter Layer (`src/presenter/`, `src/features/*/presenters/`)
- **Presentation Logic**: Presenters orchestrate user workflows, call domain services, and update the view through the view interface.
- **Base Presenters**:
  - `Presenter<V extends View>`: Base class providing `doFailureReportingOperation()` for standardized error handling and notifications.
  - `PageItemPresenter<Item, Service>`: Base class for infinite scroll/paged item presenters (Feed, Story, Followers, Followees).
  - `ToasterPresenter`: Base presenter for toast notifications.
- **Standardized Error Handling**: Wrap asynchronous operations with `doFailureReportingOperation`:
  ```ts
  await this.doFailureReportingOperation(
    async () => {
      await this.service.someAction(...);
      this.view.doSuccessAction(...);
    },
    "perform operation description",
    () => { /* optional finally callback */ }
  );
  ```

### 3. Model & Service Layer (`src/features/*/models.service/`, `src/model.service/`)
- Encapsulates business logic, data fetching, and state transformations.
- Delegates network communication to the network facades.
- Never directly manipulate UI elements or view states.

### 4. Network Facade Layer (`src/features/*/facade.net/`, `src/facade.net/`)
- Manages HTTP communication with API Gateway using `ClientCommunicator.doRequest()`.
- Responsible for transforming domain models to/from DTOs defined in `tweeter-shared`.

### 5. Contexts & Hooks (`src/contexts/`, `src/hooks/`, `src/features/*/contexts/`, `src/features/*/hooks/`)
- `UserInfoContexts`: Provides authentication state (`currentUser`, `authToken`, `displayedUser`).
- `ToastContexts`: Global toast messaging service (`displayInfoMessage`, `displayErrorMessage`, `deleteMessage`).
- Feature hooks (e.g. `authHooks.ts`, `userHooks.ts`, `useUserNavigation.ts`) bridge React context and presenter instantiation.

---

## Directory Structure Overview

```text
tweeter-web/
├── src/
│   ├── contexts/                  # Global React contexts (Toasts, etc.)
│   ├── features/                  # Modular feature directories
│   │   ├── auth/                  # Login, Register, OAuth, AuthPresenters, AuthFacade
│   │   ├── post/                  # PostStatus, Feed, Story, StatusItem
│   │   └── social/                # UserInfo, Followers, Followees, Navigation
│   ├── hooks/                     # Shared custom hooks
│   ├── net/                       # ClientCommunicator (HTTP client)
│   ├── presenter/                 # Base Presenter classes (Presenter, PageItemPresenter)
│   ├── views.components/          # Shared UI views (AppNavbar, ItemScroller, Toaster, MainLayout)
│   └── App.tsx                    # Main router and layout orchestrator
├── test/                          # Unit and integration test suites
│   ├── features/                  # Presenter and View component tests
│   ├── net/                       # Server facade integration tests
│   └── presenter/                 # Shared presenter tests
```

---

## Verification & Commands

### Running Locally
```sh
cd tweeter-web
npm start          # Runs Vite dev server
```

### Building & Frontend Typechecking
```sh
cd tweeter-web
npm run build      # Executes tsc && vite build
```

### Running Tests
```sh
cd tweeter-web
npm test           # Runs Jest test suites
```
To run a specific test suite:
```sh
cd tweeter-web
npx jest test/features/post/presenters/postStatus/PostStatusPresenters.test.ts
```

### Working with `tweeter-shared`
When modifying domain models, DTOs, or network request/response types in `tweeter-shared`:
```sh
cd tweeter-shared
npm run compile    # Recompiles TypeScript definitions to dist/
```
*Note: After recompiling `tweeter-shared`, rebuild `tweeter-web` (`npm run build`) and restart any running dev servers/IDE language servers if types do not immediately refresh.*

---

## Testing Guidelines

1. **Presenter Tests (`test/**/presenters/`)**:
   - Use `@typestrong/ts-mockito` to mock the view (`mock<SomeView>()`) and service (`mock<SomeService>()`).
   - Use `spy` when partially mocking the presenter under test.
   - Verify view interactions (`verify(view.displayInfoMessage(...)).once()`, `verify(view.displayErrorMessage(...)).never()`).
   - Verify proper error reporting when services throw exceptions.

2. **Component/View Tests (`test/**/views.components/`)**:
   - Use `@testing-library/react` and `@testing-library/user-event`.
   - Verify UI rendering, button enabled/disabled states, text input updates, and that presenter methods are called with expected parameters upon user interaction.

3. **Jest & Vite Environment Notes**:
   - `test/importMetaTransformer.js` transforms `import.meta.env` references for Jest CommonJS compatibility.

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
