# Mobile real-device integration smoke

Use this checklist after browser E2E passes and before release packaging. It verifies
that the Expo app can talk to the real server over the device network, store an
auth session, and exercise the planning flow outside the web harness.

## Prerequisites

- Phone/emulator and development machine are on the same Wi-Fi or reachable LAN.
- Server dependencies are running, including MongoDB replica set and Redis.
- Server starts with a device-reachable host. The app already listens on
  `0.0.0.0`, so the important part is using your computer LAN IP from mobile.
- Mobile `.env.local` stays local. Do not commit env files or credentials.

## Start the server

From the repository root:

```sh
pnpm --dir ai-scheduler-server dev
```

If the phone cannot connect, check firewall rules and confirm that
`http://<LAN_IP>:3000/health` is reachable from the device browser.

## Start Expo for a device smoke

Set the API URL to the machine LAN IP, not `localhost`:

```sh
EXPO_PUBLIC_API_BASE_URL=http://<LAN_IP>:3000 \
pnpm --dir ai-scheduler-mobile device:smoke
```

Platform shortcuts are also available:

```sh
EXPO_PUBLIC_API_BASE_URL=http://<LAN_IP>:3000 \
pnpm --dir ai-scheduler-mobile device:android

EXPO_PUBLIC_API_BASE_URL=http://<LAN_IP>:3000 \
pnpm --dir ai-scheduler-mobile device:ios
```

The script disables mock auth and mock calendar flags so this run verifies real
integration surfaces. For simulator-only checks, set
`ALLOW_LOOPBACK_DEVICE_API=true` if loopback is intentionally required.

## Smoke checklist

1. Open the app on the physical device or emulator.
2. Confirm Google login completes and returns to the app.
3. Create a goal and at least one protected task.
4. Generate a schedule draft and verify loading, success, and error UI states.
5. Approve or reject the draft, then confirm the resulting status is reflected.
6. Kill and reopen the app to confirm the auth session is restored or refreshed.

## Expected result

The planning flow works through the mobile app with real network calls, without
checking in `.env.local`, tokens, screenshots, or device-specific caches.
