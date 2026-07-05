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

Run `Mobile visual smoke` manually from the Actions tab. It installs Chromium,
captures each planning story, and uploads screenshots, traces, and the HTML
report for seven days. The existing pull-request CI remains unchanged.

## Failure triage

1. Download the `planning-storybook-screenshots` artifact.
2. Inspect the failing screenshot and Playwright trace.
3. Reproduce with `pnpm visual:capture`.
4. Update baselines only when the UI change is intentional.
