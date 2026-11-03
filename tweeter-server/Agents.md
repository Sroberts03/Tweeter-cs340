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
