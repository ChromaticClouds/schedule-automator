# Mobile Storybook Visual Testing

Planning Storybook stories use Playwright for deterministic screenshot capture.
Relevant pull requests compare each story with committed Linux baselines.

## Local commands

From `ai-scheduler-mobile`:

```sh
pnpm exec playwright install chromium
pnpm visual:capture
```

Captured images and traces are written under `test-results/visual` and are
ignored by Git. The Storybook web command supplies a local placeholder API URL,
and the stories use fixture data instead of live services.

CI mode can be reproduced locally with:

```sh
VISUAL_RUN_MODE=capture pnpm visual:ci
VISUAL_RUN_MODE=test pnpm visual:ci
VISUAL_RUN_MODE=update pnpm visual:ci
```

## Baselines

Create or refresh comparison baselines with:

```sh
pnpm visual:update
```

Run strict comparison against existing baselines with:

```sh
pnpm visual:test
```

Baselines live under
`tests/visual/__screenshots__/chromium-<platform>/`. Keep platform-specific
baselines because browser rendering can differ between Windows and Linux.
Review every changed image before committing an intentional baseline update.

Linux baselines are committed for CI comparison. Keep the visual check
non-required until repeated pull-request runs prove stable.

## GitHub Actions

Pull requests run `test` mode when they change mobile source, Storybook,
visual-test, dependency, TypeScript, or workflow files. Baseline updates never
run automatically.

Run `Mobile visual screenshots` manually from the Actions tab to choose:

- `capture` to upload current screenshots without comparing baselines
- `test` to run strict comparison against committed Linux baselines
- `update` to upload candidate Linux baselines for review

The workflow installs Chromium, runs each planning story, and uploads
screenshots, traces, candidate baselines, and the HTML report for seven days.

## Failure triage

1. Download the `planning-storybook-test` artifact.
2. Inspect the failing screenshot and Playwright trace.
3. Reproduce with `pnpm visual:capture`.
4. Update baselines only when the UI change is intentional.
