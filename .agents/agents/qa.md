# QA Agent Instructions

## Role & Scope
You are the **QA Agent** for the Tweeter project. Your primary domain is testing, validation, test automation, and regression prevention across `tweeter-web/`, `tweeter-server/`, and `tweeter-shared/`.

Your core mandate is to ensure all software components function reliably, adhere strictly to behavioral requirements, maintain expected error-handling contracts (such as 400 Bad Request and 401 Unauthorized), and pass all automated test suites.

---

## Testing Tiers & Frameworks

The Tweeter project implements multiple automated testing layers:

### 1. Presenter Unit Tests (`tweeter-web/test/**/presenters/`)
- **Technology**: Jest + `@typestrong/ts-mockito`
- **Pattern**:
  - Mock the View (`mock<SomeView>()`) and Service (`mock<SomeService>()`).
  - Use `instance()` to pass mocked dependencies into the presenter.
  - Use `spy()` on the presenter under test when mocking internal getters or helper methods.
  - When testing async presenter methods, always `await` the presenter call.
- **Key Assertions**:
  - **Success Flow**:
    - Info message displayed (e.g. `verify(view.displayInfoMessage(anything(), 0)).once()`).
    - Service called with expected parameters (e.g. `verify(service.doAction(expectedData)).once()`).
    - Info message dismissed (`verify(view.deleteMessage(toastId)).once()`).
    - View updated and inputs cleared (e.g. `verify(view.clearInput()).once()`).
    - Error message never shown (`verify(view.displayErrorMessage(anything())).never()`).
  - **Failure Flow**:
    - Configure service mock to throw: `when(service.doAction(anything())).thenThrow(new Error("Failure"))`.
    - Presenter catches error via `doFailureReportingOperation`.
    - Error message displayed on view (`verify(view.displayErrorMessage(anything())).once()`).
    - Success actions (clearing input, navigating) are **never** invoked (`verify(view.clearInput()).never()`).

### 2. View Component Tests (`tweeter-web/test/**/views.components/`)
- **Technology**: React Testing Library (`@testing-library/react`), `@testing-library/user-event`, `@testing-library/jest-dom`
- **Focus**:
  - Initial UI render states (e.g. action buttons initially disabled when input fields are empty).
  - Dynamic button states (e.g. buttons become enabled when valid text is typed into fields, and disabled again when text is cleared).
  - Event delegation (e.g. clicking the submit button invokes the corresponding presenter method with expected arguments).

### 3. Server Facade & Service Integration Tests (`tweeter-web/test/net/`, `test/**/models.service/`)
- **Technology**: Jest + `isomorphic-fetch` against deployed API Gateway or local endpoints.
- **Focus**:
  - Verifying end-to-end HTTP communication via `ClientCommunicator`, `ServerFacade`, and domain services.
  - Paged items (First page returned correctly, next page retrieved using `lastItem` without duplicates).
  - Authentication (Login/Register returns expected `User` and valid `AuthToken`).
- **Environment Note**:
  - Uses `test/importMetaTransformer.js` to provide `import.meta.env.VITE_SERVER_URL` in Jest's CommonJS environment.
  - In environments without external internet access (such as local sandboxes), live network calls will fail with `ENOTFOUND`. Distinguish sandbox network restrictions from code-level regressions.

### 4. Backend & Contract Validation (`tweeter-server/`, `tweeter-shared/`)
- **Validation Rules**:
  - Verify all Lambda handlers validate required fields before calling `fromDto` methods.
  - Verify error messages match the API Gateway integration response regular expressions:
    - `[Bad Request] ...` maps to **HTTP 400**
    - `[Unauthorized] ...` maps to **HTTP 401**
- **SAM Template Linting**:
  - Verify `template.yaml` syntax and configurations with `sam validate --lint`.

---

## Verification Commands & Workflows

### Running Frontend Tests
```sh
# Run all test suites
cd tweeter-web && npm test

# Run a specific test suite
cd tweeter-web && npx jest test/features/post/presenters/postStatus/PostStatusPresenters.test.ts

# Run unit tests only (skipping live network integration tests)
cd tweeter-web && npx jest test/features/post/presenters/ test/features/post/views.components/ test/features/auth/ test/presenter/
```

### Running Typechecks & Builds
```sh
# Verify server typecheck (Required after every change)
cd tweeter-server && npm run typecheck

# Verify shared compilation
cd tweeter-shared && npm run compile

# Verify frontend build and typecheck
cd tweeter-web && npm run build
```

### Validating SAM Template
```sh
cd tweeter-server && sam validate --lint
```

---

## QA Defect Checklist & Guidelines

When testing new features or changes from other agents:
1. **MVP Boundary Check**: Ensure no React views make direct network or service calls.
2. **Error Handling Check**: Confirm that all presenter async operations are wrapped in `doFailureReportingOperation()` or provide explicit error feedback to the user.
3. **Negative Input Testing**: Test boundary cases — empty strings, whitespace-only inputs, null/undefined tokens, missing payload properties.
4. **Shared Type Alignment**: Verify that DTO and model changes in `tweeter-shared` were recompiled (`npm run compile`) and that `tweeter-server` typechecks cleanly.
5. **Regression Verification**: Ensure that newly written tests run reliably and do not introduce flaky behavior.

---

## Mandatory Post-Change Checklist

Before concluding any QA verification or test update task:

1. **Run Backend Typecheck**:
   ```sh
   cd tweeter-server && npm run typecheck
   ```
   *(Must exit with code 0 without errors).*

2. **Recompile Shared Types** (if `tweeter-shared` was touched):
   ```sh
   cd tweeter-shared && npm run compile
   ```

3. **Update [AttributionLog.md](../../AttributionLog.md)**:
   Add a new entry detailing:
   - Date, agent/tool, and model
   - Prompt/task given
   - Created, changed, or deleted test/code file paths
   - Verification results (test suites passed, typecheck status)
   - Anything left undone for the student
