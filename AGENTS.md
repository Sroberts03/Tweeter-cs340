# Agent Instructions

## After every change

Every agent must do both of these after each change, before reporting the work as done:

1. **Run the typecheck** from `tweeter-server/`:

   ```sh
   npm run typecheck
   ```

   If the change touched `tweeter-shared`, run `npm run compile` in `tweeter-shared/` first so the server checks against the updated types. Fix any errors before finishing. If an error can't be fixed, say so and include the output.

2. **Update [AttributionLog.md](AttributionLog.md)** with a new entry at the bottom that includes:
   - the date, the agent/tool, and the model
   - the prompt or task it was given
   - what it created, changed, or deleted (file paths)
   - whether the typecheck passed
   - anything it left undone for the student to do

## The Agent pipeline

Decide when this step is necessary. If a task is complex, multi-layered, or touches both the frontend and backend, coordinate using the specialized agent instructions located in `.agents/agents/`:

- **Project Manager** (`.agents/agents/project-manager.md`): Plans the roadmap, analyzes requirements, coordinates sub-agents, and verifies contract alignment.
- **Backend Agent** (`.agents/agents/backend.md`): Owns `tweeter-server/` (Lambda handlers, services, DAOs, DynamoDB, S3, SAM template, and layer packaging).
- **Frontend Agent** (`.agents/agents/frontend.md`): Owns `tweeter-web/` (React UI, MVP architecture, presenters, views, facades, and client services).
- **QA Agent** (`.agents/agents/qa.md`): Owns test creation and verification (presenter unit tests with `ts-mockito`, view tests, integration tests, negative cases).

### Coordination Guidelines
1. **Order of Execution**: When changes touch multiple areas, execute in dependency order:
   - **Shared**: Update domain models/DTOs in `tweeter-shared/` and run `npm run compile`.
   - **Backend**: Implement Lambda handlers, services, DAOs, and rebuild the layer.
   - **Frontend**: Update network facades, services, presenters, and views.
   - **QA**: Verify unit, component, and integration tests.
2. **Review & Synthesis**: Once sub-agents complete their tasks, review their work against the requirements, run `npm run typecheck` from `tweeter-server/`, and update `AttributionLog.md`.
3. **Single-Scope Tasks**: For localized, small changes (e.g., a styling adjustment, a simple bug fix in one file, or a quick doc update), agents may work directly without spinning up the full pipeline.

