# Directory Refactor Skill

Use this skill when the user asks to improve, reorganize, or refactor repository directories.

## Workflow

1. Inspect current tree.
2. Identify one feature boundary.
3. Propose a small movement plan.
4. Move files without changing behavior.
5. Update imports.
6. Run targeted validation.
7. Summarize:
   - files moved
   - imports updated
   - behavior intentionally unchanged
   - checks run
   - remaining follow-up refactors

## Rules

- Keep PRs small.
- Prefer one backend feature per task.
- Do not mix backend and mobile moves unless requested.
- Do not rewrite business logic during directory-only work.
- Do not rename database models, API fields, or route paths.
- Do not introduce new abstractions unless import churn proves it is necessary.
- Preserve test coverage and fixtures.

## Acceptance criteria

A directory refactor is done only when:
- imports compile
- tests still pass or missing tests are reported
- architecture boundaries are not worsened
- diff is mostly file moves and import updates
