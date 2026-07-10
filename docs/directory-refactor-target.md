# Directory refactor target

## Backend target

Move the backend toward this shape:

ai-scheduler-server/src/
  app.ts
  server.ts

  core/
    auth/
    config/
    db/
    errors/
    http/

  integrations/
    google/
    gemini/

  features/
    goals/
    tasks/
    protected-times/
    schedule-preferences/
    schedule-drafts/
    task-breakdown/
    daily-review/
    daily-schedule/
    weekly-reschedule/
    calendar/

  shared/
    time/
    validation/
    idempotency/
    logging/

## Feature folder convention

Each feature may contain:

- *.routes.ts
- *.service.ts
- *.model.ts
- *.schema.ts
- *.types.ts
- *.contract.ts
- *.validation.ts
- *.test.ts

Keep files close to the feature that owns them.

## Migration order

1. Move schedule-drafts files.
2. Move task-breakdown files.
3. Move daily-review files.
4. Move weekly-reschedule files.
5. Move daily-schedule worker/store/helper files.
6. Move Google/Gemini clients into integrations.
7. Move shared utilities last.

## Non-goals

Do not:
- redesign API contracts
- rewrite business rules
- change database schemas
- change OAuth scopes
- change Gemini prompts unless a moved file requires import updates
- change mobile UI during backend directory PRs
