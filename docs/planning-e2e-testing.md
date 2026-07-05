# Planning E2E Testing

The browser smoke test exercises the mobile web UI, mobile API client, JWT
authorization, Fastify routes, MongoDB persistence, Redis-backed application
lifecycle, and schedule idempotency.

## Local run

Start the CI MongoDB and Redis services and initialize the replica set:

```sh
docker compose -f docker-compose.ci.yml up -d --wait
docker compose -f docker-compose.ci.yml exec -T mongo mongosh --quiet \
  --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'localhost:27017'}]})"
```

Then run:

```sh
pnpm --dir ai-scheduler-mobile e2e:test
```

Playwright starts the E2E server harness and Expo web app. The harness issues
isolated test sessions and replaces only Gemini schedule generation and Google
Calendar context with deterministic providers. Test records are removed when
the harness stops.

## Security boundary

Mock authentication requires both `EXPO_PUBLIC_APP_ENV=test` and
`EXPO_PUBLIC_ENABLE_MOCK_AUTH=true`. The `/auth/e2e-session` route exists only
in the E2E harness and is never registered by the production server entrypoint.

## Real Google smoke

Google consent and Calendar writes remain manual:

1. Run the production server entrypoint with development credentials.
2. Sign in through the mobile app using an authorized Google test account.
3. Generate and approve a draft.
4. Confirm events appear only in the dedicated AI calendar.
5. Revoke or expire the connection and verify the reconnect action.

Do not store a personal Google session or refresh token in CI.
