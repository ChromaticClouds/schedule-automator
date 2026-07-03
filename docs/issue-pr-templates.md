# Issue and PR Templates

Use these templates when drafting GitHub issues or pull requests. Keep entries concise, factual, and scoped to one logical change.

## Issue Template

```md
## Summary

Briefly describe the problem, feature, or documentation need.

## Context

- Area: mobile | server | docs | env | auth | calendar | scheduler | db | api | ui
- Related requirement:
- Related files:

## Expected Outcome

Describe the result that should exist when this issue is complete.

## Acceptance Criteria

- [ ] Behavior or document change is implemented
- [ ] Relevant validation is run or clearly marked as not applicable
- [ ] No secrets, generated caches, or local env files are committed

## Notes

Add constraints, follow-up ideas, or known risks.
```

## Bug Issue Additions

Add these sections for bugs:

```md
## Actual Behavior

What happened.

## Expected Behavior

What should have happened.

## Reproduction

1. Step one
2. Step two
3. Observed result
```

## PR Template

```md
## Summary

- What changed
- Why it changed

## Scope

- Area: mobile | server | docs | env | auth | calendar | scheduler | db | api | ui
- Related issue:

## Validation

- [ ] Typecheck/build/test command:
- [ ] Manual check:
- [ ] Not applicable, because:

## Security Check

- [ ] No `.env`, `.env.local`, credentials, tokens, keystores, or generated caches
- [ ] Mobile does not expose server secrets
- [ ] AI and calendar inputs remain validated where touched

## Notes

Call out migrations, env changes, breaking changes, limitations, or follow-up work.
```

## PR Rules

- Default to draft PRs unless explicitly asked to mark ready for review.
- Include exact validation commands and results.
- Mention skipped checks and why they were skipped.
- Keep PRs focused; split unrelated mobile/server/docs/env changes.
- Use Conventional Commit wording for PR titles when practical.
