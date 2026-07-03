# Git Commit & Branch Rules

## Core Policy
- Do not force-push unless explicitly requested.
- After an implementation request, run validation, then commit, push, and open a draft PR unless the user says not to.
- Before committing, inspect `git status` and changed files.
- Never commit secrets, env files, keystores, tokens, credentials, or generated caches.
- Keep commits small, logical, and focused.
- Do not mix unrelated mobile/server/docs/env changes in one commit.
- If a secret appears in a diff, stop and warn the user.
- Keep each source or docs file under 150 lines unless explicitly approved.
- Follow `docs/issue-pr-templates.md` when opening issues or PRs.

## Commit Format
Use Conventional Commit style:

```txt
<type>(<scope>): <summary>
```

Allowed types: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`, `perf`, `security`, `build`, `ci`, `revert`.

Recommended scopes: `mobile`, `server`, `env`, `auth`, `calendar`, `gemini`, `scheduler`, `tasks`, `goals`, `review`, `db`, `api`, `ui`, `config`, `docs`.

Summary rules:
- Use lowercase unless a proper noun is required.
- Prefer under 72 characters.
- Do not end with a period.
- Describe the result, not the process.
- Avoid vague summaries like `update`, `changes`, `wip`, `fix bug`.

Good examples: `chore(env): split mobile and server env files`, `feat(server): add fastify health check endpoint`, `fix(auth): correct google oauth redirect uri`, `security(env): prevent secrets from entering mobile config`.

## Commit Body
Use a body only when context matters, especially for env changes, auth/OAuth/security, DB schema or migrations, breaking changes, limitations, or follow-up work.

Example:

```txt
chore(env): split mobile and server env files

- keep expo public variables in mobile env only
- move gemini and google client secrets to server env
- add example values for android emulator api url
```

## Branch Naming
Use lowercase kebab-case: `<type>/<scope>-<short-description>`.

Examples: `chore/env-split-mobile-server`, `feat/server-google-oauth`, `feat/mobile-schedule-draft-screen`, `fix/server-cors-origin`, `security/remove-client-secret-from-mobile`.

## Before Commit
1. Run `git status`.
2. Review changed files.
3. Ensure secret/env files are not staged.
4. Run relevant build, lint, and typecheck commands; report any skipped checks.
5. Group changes into logical commits.
6. Use a Conventional Commit message.

## Before Push
1. Confirm current branch name and remote target.
2. Confirm there are no uncommitted changes.
3. Ensure branch name follows the convention.
4. Push and open a draft PR for implemented changes unless told otherwise.
