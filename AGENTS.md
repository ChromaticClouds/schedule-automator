# Git Commit & Branch Rules

## Core Policy
- Do not commit, push, or force-push unless explicitly requested.
- Before committing, inspect `git status` and changed files.
- Never commit secrets, env files, keystores, tokens, credentials, or generated caches.
- Keep commits small, logical, and focused.
- Do not mix unrelated mobile/server/docs/env changes in one commit.

## Commit Format
Use Conventional Commit style:

```txt
<type>(<scope>): <summary>
```

Allowed types:

```txt
feat      new feature
fix       bug fix
refactor  internal improvement without behavior change
chore     setup, config, dependency, maintenance
docs      documentation only
style     formatting only
test      tests only
perf      performance improvement
security  security-related change
build     build or package config
ci        CI/CD workflow
revert    revert previous commit
```

Recommended scopes for this project:

```txt
mobile
server
env
auth
calendar
gemini
scheduler
tasks
goals
review
db
api
ui
config
docs
```

## Commit Summary Rules

* Use lowercase unless a proper noun is required.
* Keep summary concise, preferably under 72 characters.
* Do not end with a period.
* Describe the result, not the process.
* Avoid vague summaries like `update`, `changes`, `wip`, `fix bug`.

Good examples:

```txt
chore(env): split mobile and server env files
feat(server): add fastify health check endpoint
feat(mobile): add expo environment validation
fix(auth): correct google oauth redirect uri
security(env): prevent secrets from entering mobile config
docs(setup): document google oauth client setup
```

## Commit Body

Use a body only when extra context matters.

Use body for:

* env changes
* auth/OAuth/security changes
* DB schema or migration changes
* breaking changes
* known limitations or follow-up work

Example:

```txt
chore(env): split mobile and server env files

- keep expo public variables in mobile env only
- move gemini and google client secrets to server env
- add example values for android emulator api url
```

## Branch Naming

Use lowercase kebab-case:

```txt
<type>/<scope>-<short-description>
```

Examples:

```txt
chore/env-split-mobile-server
feat/server-google-oauth
feat/mobile-schedule-draft-screen
feat/calendar-ai-schedule-sync
fix/server-cors-origin
refactor/scheduler-validation-layer
security/remove-client-secret-from-mobile
docs/google-oauth-client-setup
```

If a secret appears in a diff, stop and warn the user.

## Agent Checklist Before Commit

1. Run `git status`.
2. Review changed files.
3. Check that secret/env files are not staged.
4. Group changes into logical commits.
5. Suggest a commit message.
6. Commit only after explicit approval.

## Agent Checklist Before Push

1. Confirm current branch name.
2. Confirm remote target.
3. Confirm there are no uncommitted changes.
4. Ensure branch name follows the convention.
5. Push only after explicit approval.
