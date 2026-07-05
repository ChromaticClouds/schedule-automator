# Mobile Storybook Visual Testing

Planning Storybook stories use Playwright for deterministic screenshot capture.
The first stage is an opt-in smoke workflow; it does not block pull requests.

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

This initial task does not commit baselines. Strict comparison should become a
required CI check only after Linux baselines are generated and proven stable.

## GitHub Actions

Run `Mobile visual screenshots` manually from the Actions tab. Choose:

- `capture` to upload current screenshots without comparing baselines
- `test` to run strict comparison against committed Linux baselines
- `update` to upload candidate Linux baselines for review

The workflow installs Chromium, runs each planning story, and uploads
screenshots, traces, candidate baselines, and the HTML report for seven days.
The existing pull-request CI remains unchanged.

## Failure triage

1. Download the `planning-storybook-screenshots` artifact.
2. Inspect the failing screenshot and Playwright trace.
3. Reproduce with `pnpm visual:capture`.
4. Update baselines only when the UI change is intentional.
