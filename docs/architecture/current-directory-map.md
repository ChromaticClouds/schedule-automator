# Current Directory Map

## 1. 백엔드 폴더 맵

현재 백엔드는 `ai-scheduler-server/src` 아래에 계층별 폴더가 있고, 기능별 폴더(`features/*`)는 아직 없다.

```txt
ai-scheduler-server/src/
  app.ts                    # Fastify 앱 조립
  server.ts                 # 서버 시작점
  auth/                     # 세션 보안, OAuth return URL, Google identity
  config/                   # 서버 환경 설정
  db/                       # MongoDB 연결
  models/                   # Mongoose 모델
  routes/                   # HTTP route 등록과 route utility
  schemas/                  # Zod request/response schema
  services/                 # 기능 로직, 외부 API client, shared helper가 혼재
  types/                    # Fastify JWT 타입 보강
  workers/                  # daily schedule worker entry
```

주요 기능 흐름은 `routes/* -> services/* -> models/schemas/*` 구조다. 기능 단위로 가까이 모여 있지 않아 schedule, task, review 관련 파일을 찾으려면 여러 폴더를 왕복해야 한다.

## 2. 모바일 폴더 맵

모바일은 `ai-scheduler-mobile/src` 아래에 Expo Router, 공용 UI, feature 폴더가 함께 있다.

```txt
ai-scheduler-mobile/src/
  app/                      # Expo Router screens, tabs, layout
  api/                      # 공용 API client/transport
  components/               # 공용 UI, providers, tabs, auth bootstrap
  config/                   # mobile env/config
  constants/                # theme constants
  features/
    auth/                   # auth UI, session, storage, OAuth
    planning/               # schedule, task, goal, review, protected-time UI/logic
    settings/               # schedule settings UI/API/hooks/types
  hooks/                    # 공용 theme/color hooks
  theme/                    # design token
  types/                    # global style types
```

`features/planning`이 실제로는 schedule drafts, weekly reschedule, daily review, task summary, goal breakdown, protected time, planning create flow를 모두 소유하고 있다.

## 3. 위치가 잘못된 것으로 보이는 파일

| 현재 위치 | 문제 | 권장 위치 |
| --- | --- | --- |
| `ai-scheduler-server/src/services/google-client.ts` | 외부 Google client가 기능 service와 섞임 | `src/integrations/google/google.client.ts` |
| `ai-scheduler-server/src/services/google-oauth.ts` | OAuth provider 연동과 auth feature 경계가 불명확 | `src/integrations/google/google-oauth.service.ts` 또는 `src/features/auth/` |
| `ai-scheduler-server/src/services/gemini-*.ts` | Gemini 연동이 기능 service와 섞임 | `src/integrations/gemini/` |
| `ai-scheduler-server/src/services/external-api-error.ts` | feature 전용이 아닌 공용 오류 처리 | `src/shared/errors/` 또는 `src/core/errors/` |
| `ai-scheduler-server/src/services/schedule-time.ts` | schedule 전용인지 공용 time helper인지 불명확 | 전용이면 `features/schedule-drafts/`, 공용이면 `shared/time/` |
| `ai-scheduler-server/src/routes/schedule-draft-route-utils.ts` | route helper가 전역 routes 폴더에 단독 존재 | `features/schedule-drafts/schedule-draft.routes.ts` 주변 |
| `ai-scheduler-server/src/services/daily-schedule-*.ts` + `src/workers/daily-schedule.ts` | worker, loop, store, helper가 분산 | `features/daily-schedule/`에 모으고 worker entry만 얇게 유지 |
| `ai-scheduler-mobile/src/features/planning/*fixtures.ts` | fixture가 production import에 섞일 위험 | `features/planning/__fixtures__/` 또는 `tests/fixtures/` |
| `ai-scheduler-mobile/src/features/planning/goal-breakdown-*` | goal 기능이 planning 내부에 묶임 | `features/goals/` 후보 |
| `ai-scheduler-mobile/src/features/planning/task-*` | task 기능이 planning 내부에 묶임 | `features/tasks/` 후보 |
| `ai-scheduler-mobile/src/components/auth-bootstrap.tsx` | auth-specific component가 공용 components에 있음 | `features/auth/auth-bootstrap.tsx` 또는 screen composition layer |

## 4. 권장 기능 소유권

백엔드 목표 소유권:

- `core`: `auth/session-security.ts`, `auth/security.ts`, `config/env.ts`, `db/connection.ts`, `routes/http.ts`, 서버 공통 error/http glue
- `integrations/google`: `google-client.ts`, Google Calendar/OAuth provider client
- `integrations/gemini`: `gemini-breakdown.ts`, `gemini-schedule.ts`, `gemini-weekly-reschedule.ts`
- `features/schedule-drafts`: schedule draft route/schema/model/service, edit/regenerate/lifecycle/approval/context/idempotency/validation
- `features/task-breakdown`: task breakdown route/schema/service, breakdown contract/persistence/idempotency, Gemini breakdown adapter 호출부
- `features/daily-review`: daily review route/schema/model/service/transition
- `features/weekly-reschedule`: weekly reschedule route/schema/service/context/contract/persistence/idempotency/validation
- `features/daily-schedule`: worker loop, store, service, helper, types
- `features/calendar`: calendar route/schema/events/writer, Google calendar integration 호출부
- `features/tasks`, `features/goals`, `features/protected-times`, `features/schedule-preferences`: 각 route/schema/model/service 소유
- `shared`: time, validation, idempotency, cross-feature contracts, logging, external API error normalization

모바일 목표 소유권:

- `app`: route/layout만 유지하고 기능 구현은 feature로 위임
- `features/auth`: auth panel, bootstrap, OAuth, session, storage, mock session
- `features/planning`: planning dashboard/create flow와 feature orchestration만 유지
- `features/schedule-drafts`: schedule draft state/panel/edit/regenerate/date/recovery
- `features/weekly-reschedule`: weekly reschedule hooks/state/panel/view
- `features/daily-review`: daily review hooks/panel/view
- `features/tasks`: task summary/manage/create/mutation UI
- `features/goals`: goal breakdown/create UI/state/hooks
- `features/protected-times`: protected time form/create UI
- `features/settings`: 현재처럼 schedule settings 소유
- `components`: themed primitives, providers, tabs처럼 domain-neutral UI만 소유

## 5. 가장 안전한 마이그레이션 순서

1. 문서와 `scripts/check-architecture.mjs`의 목표 경계를 먼저 확정한다.
2. 백엔드 `schedule-drafts`를 route/schema/model/service 단위로 이동하고 import만 갱신한다.
3. `task-breakdown`을 이동한다. Gemini 호출부는 아직 얇은 adapter로만 연결한다.
4. `daily-review`를 이동한다.
5. `weekly-reschedule`을 이동한다.
6. `daily-schedule` service/store/helper/worker loop를 이동하고 `workers/daily-schedule.ts`는 entry 역할만 남긴다.
7. Google/Gemini client를 `integrations/*`로 이동한다.
8. 공용 time, validation, idempotency, error helper를 `shared/*`로 마지막에 이동한다.
9. 모바일은 먼저 fixture를 `__fixtures__` 또는 test 전용 위치로 분리한 뒤, `planning`에서 `tasks/goals/schedule-drafts/weekly-reschedule/daily-review/protected-times` 순서로 쪼갠다.
10. 각 단계는 한 기능 폴더 단위의 작은 PR로 진행하고, API contract와 DB schema 변경은 포함하지 않는다.

## 6. 위험 요소 및 유효성 검사 명령

위험 요소:

- 경로 이동 중 alias/relative import가 깨질 수 있다.
- Mongoose model import 순서가 바뀌면 runtime registration 문제가 생길 수 있다.
- route registration 순서와 auth hook 적용 범위가 바뀌면 API 동작이 달라질 수 있다.
- Gemini/Google client 이동 시 env 접근 위치와 secret 노출 경계를 재확인해야 한다.
- 모바일 fixture가 production bundle에 남아 있으면 테스트 데이터가 런타임에 섞일 수 있다.
- Expo Router `app/*` 파일을 옮기면 routing이 바뀌므로 screen 파일 이동은 마지막에 한다.

검증 명령:

```sh
pnpm check:architecture
pnpm validate:server
pnpm validate:mobile
pnpm validate
pnpm --dir ai-scheduler-server typecheck
pnpm --dir ai-scheduler-server lint
pnpm --dir ai-scheduler-mobile typecheck
pnpm --dir ai-scheduler-mobile lint
```
