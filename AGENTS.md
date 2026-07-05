# Git Commit & Branch Rules

## Core Policy
- Do not force-push unless explicitly requested.
- After an implementation request, run validation, then commit, push, and open a draft PR unless the user says not to.
- Before committing, inspect `git status` and changed files.
- Never commit secrets, env files, keystores, tokens, credentials, or generated caches.
- Keep commits small, logical, and focused.
- Do not mix unrelated mobile/server/docs/env changes in one commit.
- If a secret appears in a diff, stop and warn the user.
- Keep source and docs files under 150 lines unless approved; `AGENTS.md` has no line limit.
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

## Expo React Native Design Standard

이 프로젝트의 UI는 Expo Go에서 실제 기기로 확인 가능한 모바일 앱 UI를 기준으로 한다.

### Core Rules

- 웹 DOM/CSS 기준이 아니라 React Native View/Text/Pressable/ScrollView 기준으로 설계한다.
- hover 중심 인터랙션을 만들지 않는다.
- 모든 주요 액션은 터치 친화적인 크기를 가진다.
- Safe Area, notch, status bar, bottom tab, keyboard overlap을 고려한다.
- iOS와 Android의 기본 폰트, shadow, elevation, status bar 차이를 고려한다.
- 화면은 390px급 모바일 폭을 우선 기준으로 잡고, 태블릿 폭은 보조로 고려한다.
- 빈 상태, 로딩 상태, 에러 상태, disabled 상태를 반드시 고려한다.
- 스크롤 가능한 화면은 하단 CTA, 키보드, tab bar에 가리지 않게 한다.

### Anti AI-Slop Rules

다음 패턴을 피한다.

- 의미 없는 보라/파랑 그라디언트
- 웹 랜딩페이지 같은 과한 hero section
- 모바일에서 너무 작은 텍스트와 터치 영역
- 카드만 반복되는 평면적인 UI
- 과한 shadow/elevation
- iOS/Android에서 다르게 깨질 수 있는 임의 absolute 배치
- Safe Area를 무시한 상단/하단 요소
- 긴 텍스트가 잘리거나 줄바꿈이 깨지는 버튼
- 모든 spacing을 임의 숫자로 때우는 방식

### Token Rules

- 색상은 semantic token을 사용한다.
- spacing은 4px scale을 따른다.
- radius는 토큰으로 관리한다.
- shadow/elevation은 목적이 있을 때만 사용한다.
- raw hex color는 금지한다. 필요하면 token으로 추가한다.

### Touch Rules

- 주요 버튼과 터치 요소는 최소 44~48dp 수준의 hit area를 확보한다.
- 아이콘 버튼은 시각 크기가 작더라도 padding으로 터치 영역을 확보한다.
- 터치 가능한 요소 사이에는 충분한 간격을 둔다.
