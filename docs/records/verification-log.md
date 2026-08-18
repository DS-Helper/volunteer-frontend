# 검증 기록

> 상태: 진행 중 · 작업 ID: FE-503  
> 요구사항: `volunteer_plan.md` §5-19, §11, §13  
> v1 API/Mock: 검증 결과에 사용한 데이터가 Mock인지 실 API인지 명시한다.  
> 디자인 기준 DS-01: 시각 검증에는 `#0DBA53`, `#3C3B3B`, `#F6F6F6`, Pretendard, 12px/pill radius와 responsive 결과를 포함한다.

## 2026-07-12 — FE-001 문서 작업

## 2026-07-19 — FE-011 Netlify Next.js 배포 대상 설정

| 검증 | 데이터 | 상태 | 결과 |
| --- | --- | --- | --- |
| `netlify.toml` 설정 검토 | Netlify 공식 문서 | 통과 | 최신 Next.js 자동 어댑터를 고정하지 않고 `npm run build`, `.next`를 명시 |
| `npm.cmd run lint` | 정적 | 통과 | ESLint 오류·경고 0 |
| `npm.cmd run typecheck` | 정적 | 통과 | `next typegen && tsc --noEmit` 통과 |
| `npm.cmd run test:run` | MSW/fixture | 통과 | 6 files, 33 tests 통과 |
| `npm.cmd run build` | production build | 통과 | Next.js 16.2.10 컴파일·TypeScript·페이지 데이터 수집 통과 |
| Netlify 재배포 및 운영 URL | 운영 환경 | 미실행 | 저장소 변경을 아직 원격 기본 브랜치에 반영·재배포하지 않았음 |

## 2026-07-19 — FE-011 Runtime plugin 보완

| 검증 | 데이터 | 상태 | 결과 |
| --- | --- | --- | --- |
| `npm.cmd run lint` | 정적 | 통과 | ESLint 오류·경고 0 |
| `npm.cmd run typecheck` | 정적 | 통과 | `next typegen && tsc --noEmit` 통과 |
| `npm.cmd run build` | production build | 통과 | Next.js 16.2.10에서 static·dynamic route 생성 통과 |
| Netlify production deploy | 운영 환경 | 통과 | deploy `6a5baf6d9af4a50008dff472`, commit `ffea3cc`; Next.js Runtime 성공 및 Function 1개 배포 |
| 운영 URL `/` | production | 통과 | HTTP 200 |
| 운영 URL `/volunteer` | production | 통과 | HTTP 200 |
| 운영 URL `/volunteer/events` | production | 통과 | HTTP 200 |

## 2026-07-19 — FE-012 실 API 기본 전환

| 검증 | 데이터 | 상태 | 결과 |
| --- | --- | --- | --- |
| `npm.cmd run lint` | 정적 | 통과 | ESLint 오류·경고 0 |
| `npm.cmd run typecheck` | 정적 | 통과 | `next typegen && tsc --noEmit` 통과 |
| `npm.cmd run test:run` | MSW/fixture | 통과 | 6 files, 33 tests 통과 |
| `npm.cmd run build` | dynamic production build | 통과 | API request-time dynamic layout으로 build 통과 |
| Mock activation rule | 정적 | 통과 | `NEXT_PUBLIC_USE_VOLUNTEER_MOCKS=true`일 때만 Mock handler 주입 |
| Backend live smoke | 실 API | 미실행 | 운영 backend 인증·CORS 계약과 유효 사용자 세션이 필요 |

## 2026-07-19 — FE-013 OAuth 로그인·회원가입과 JWT 저장

| 검증 | 데이터 | 상태 | 결과 |
| --- | --- | --- | --- |
| DSHelper(BE) OAuth controller 대조 | backend-test 소스 | 통과 | 카카오·네이버·구글 login-url/callback 및 DTO 확인 |
| `npm.cmd run lint` | 정적 | 통과 | ESLint 오류·경고 0 |
| `npm.cmd run typecheck` | 정적 | 통과 | `next typegen && tsc --noEmit` 통과 |
| `npm.cmd run test:run` | MSW/fixture | 통과 | 6 files, 33 tests 통과 |
| OAuth provider 실제 로그인 | 외부 provider | 미실행 | BE client secret, redirect URI, CORS 설정 필요 |
| 로그인 후 user-store hydrate | 정적/BE 계약 | 통과 | `/user/my-identifier`, `/user/my-info` 병렬 조회와 로그아웃 초기화 코드 확인 |

| 검증 | 데이터 | 상태 | 결과 |
| --- | --- | --- | --- |
| 허용 경로 변경 확인 | 해당 없음 | 통과 | 이번 작업의 patch 대상이 `AGENTS.md`, `docs/**`뿐임을 확인 |
| Markdown 링크·고립 문서 확인 | 해당 없음 | 통과 | Markdown 26개, 라우터 연결 25개, 고립 문서 0개 |
| 단일 라우터 확인 | 해당 없음 | 통과 | `docs/README.md` 외 하위 README 0개 |
| UTF-8 한글 깨짐 확인 | 해당 없음 | 통과 | strict UTF-8 decode 및 U+FFFD 검사 통과 |
| Next.js 관리 블록 확인 | 해당 없음 | 통과 | BEGIN/END 블록 원문 정규식 비교 통과 |
| `npm run lint` | Mock | 미실행 | 문서 전용 변경, 전체 구현 작업에서 실행 예정 |
| `npm run build` | Mock | 미실행 | 문서 전용 변경, 전체 구현 작업에서 실행 예정 |

## 2026-07-12 — FE-002 전체 구현

| 검증 | 데이터 | 상태 | 결과 |
| --- | --- | --- | --- |
| `npm.cmd run lint` | Mock/정적 | 통과 | ESLint 오류·경고 0 |
| `npm.cmd run typecheck` | Mock/정적 | 통과 | `next typegen && tsc --noEmit` 통과 |
| `npm.cmd run test:run` | MSW/fixture | 통과 | 6 files, 33 tests 통과 |
| `npm.cmd run build` | Mock fallback | 통과 | Next.js 16.2.10 production build, 요구 라우트 16개 포함 |
| `npx playwright test --list` | Mock | 통과 | 사용자 3개·관리자 1개 smoke, desktop/mobile project 인식 |
| `npm.cmd run test:e2e` | Mock | 통과 | Chromium Desktop Chrome·Pixel 7, 총 8개 E2E 통과 |
| 모바일·데스크톱 반응형 smoke | Mock | 통과 | 동일 핵심 경로를 Desktop Chrome과 Pixel 7 viewport에서 검증 |

## 2026-07-12 — FE-006 BE 사용자 API 정합화

| 검증 | 데이터 | 상태 | 결과 |
| --- | --- | --- | --- |
| `npm.cmd run typecheck` | 정적/BE DTO 경계 | 통과 | `next typegen && tsc --noEmit` 통과 |
| `npm.cmd run lint` | 정적 | 통과 | ESLint 오류·경고 0 |
| `npm.cmd run test:run` | 기존 Mock | 통과 | 6 files, 33 tests 통과 |
| `npm.cmd run build` | Mock fallback | 확인 중 | 컴파일·TypeScript·정적 페이지 생성 단계까지 확인. 최종 종료 출력은 재확인 필요 |

## 2026-07-15 — FE-007 관리자 일정 이미지 2단계 업로드 계약

| 검증 | 데이터 | 상태 | 결과 |
| --- | --- | --- | --- |
| `npm.cmd run typecheck` | 정적/Mock 계약 | 통과 | `next typegen && tsc --noEmit` 통과 |
| `npm.cmd run lint` | 정적 | 통과 | ESLint 오류·경고 0 |
| `npm.cmd run test:run` | MSW/fixture | 통과 | 6 files, 33 tests 통과 |
| `npm.cmd run build` | Mock fallback | 통과 | Next.js 16.2.10 production build 및 정적 페이지 생성 통과 |

## 2026-07-15 — FE-008 Admin API 실계약 정합화

| 검증 | 데이터 | 상태 | 결과 |
| --- | --- | --- | --- |
| `npm.cmd run typecheck` | 정적/UUID 경계 | 통과 | `next typegen && tsc --noEmit` 통과 |
| `npm.cmd run lint` | 정적 | 통과 | ESLint 오류·경고 0 |
| `npm.cmd run test:run` | MSW/fixture | 통과 | 6 files, 33 tests 통과 |
| `gradlew.bat compileJava` | Admin 서버 DTO | 통과 | 관리자 capability·참여자 DTO 확장 컴파일 통과 |
| `gradlew.bat test --tests "…VolunteerAdminServiceTest"` | Admin 서버 | 통과 | 관리자 봉사 서비스 대상 테스트 통과 |

## 2026-07-15 — FE-009 출석 Enum 단일화

| 검증 | 데이터 | 상태 | 결과 |
| --- | --- | --- | --- |
| DSHelper(BE) Enum 대조 | DSHelper(BE) 소스 | 통과 | `APPLIED`, `CANCELED`, `ATTENDED`, `ABSENT`를 단일 계약으로 확인 |
| `npm.cmd run typecheck` | 정적 | 통과 | 출석 상태 전용 프론트 타입 제거 후 통과 |
| `npm.cmd run test:run` | MSW/fixture | 통과 | 6 files, 33 tests 통과 |
| `gradlew.bat compileJava` | Admin 서버 | 통과 | `attendanceStatus` 제거 및 취소 참여자 제외 로직 컴파일 통과 |

## 2026-07-15 — FE-010 단원 상세 및 검색 계약 정합화

| 검증 | 데이터 | 상태 | 결과 |
| --- | --- | --- | --- |
| `npm.cmd run typecheck` | 정적 | 통과 | 단원 상세 adapter와 사진 optional 타입 통과 |
| `npm.cmd run lint` | 정적 | 통과 | ESLint 오류·경고 0 |
| `gradlew.bat compileJava` | Admin 서버 | 통과 | 단원 통계·상세 DTO와 신청 검색 파라미터 컴파일 통과 |
| `npm.cmd run test:run` | MSW/fixture | 통과 | 6 files, 33 tests 통과 |

## 기록 형식

```text
날짜 / 작업 ID / commit 또는 작업 트리 / 명령·수동 절차 / Mock·실 API / 결과 / 실패 원인
```

## 체크리스트

- [ ] 실제 실행한 명령만 통과로 기록한다.
- [ ] 실패도 삭제하지 않고 후속 결과를 연결한다.
- [ ] 시각 검증은 viewport와 scenario를 기록한다.

## 미해결 질문

- CI에서 요구할 필수 명령과 Node/npm 버전은?
- 시각 회귀 screenshot을 저장소에서 관리할 것인가?

### FE-013

| 검증 항목 | 방식 | 결과 | 비고 |
|---|---|---|---|
| OAuth 정적 callback provider 전달 | 코드 검토 | 통과 | Google은 `providerOverride="google"`, Kakao는 `providerOverride="kakao"` |
| `npm.cmd run lint` | ESLint | 통과 | 오류·경고 없음 |
| `npm.cmd run typecheck` | Next typegen + TypeScript | 통과 | 타입 오류 없음 |

### FE-017

| 검증 항목 | 방식 | 결과 | 비고 |
|---|---|---|---|
| 프론트 contract smoke check | `npm.cmd run contract:check` | 통과 | 필수 관리자 path 4개 확인 |
| DSHelper(BE) 봉사 테스트 | `gradlew.bat test --no-daemon` | 통과 | BUILD SUCCESSFUL |
| DS-Helper-Admin 봉사 테스트 | `gradlew.bat test --no-daemon` | 통과 | BUILD SUCCESSFUL |
| `npm.cmd run lint` | ESLint | 통과 | 오류·경고 없음 |
| `npm.cmd run typecheck` | Next typegen + TypeScript | 통과 | 타입 오류 없음 |
| `git diff --check` | Git whitespace 검사 | 통과 | 공백 오류 없음 |

### FE-014

| 검증 항목 | 방식 | 결과 | 비고 |
|---|---|---|---|
| 신청 현황 API 인증 | 코드 검토 | 통과 | 브라우저 API client가 `localStorage.accessToken`을 `Authorization: Bearer`로 전송 |
| `npm.cmd run lint` | ESLint | 통과 | 오류·경고 없음 |
| `npm.cmd run typecheck` | Next typegen + TypeScript | 통과 | 타입 오류 없음 |
| `git diff --check` | Git whitespace 검사 | 통과 | 공백 오류 없음 |

### FE-015

| 검증 항목 | 방식 | 결과 | 비고 |
|---|---|---|---|
| 관리자 인증 API 호출 | 코드 검토 | 통과 | 인증 조회 화면을 Client Component로 전환 |
| 관리자 로딩·오류 상태 | 코드 검토 | 통과 | 주요 조회 화면에 `role=status`/`role=alert` 추가 |
| `npm.cmd run lint` | ESLint | 통과 | 오류·경고 없음 |
| `npm.cmd run typecheck` | Next typegen + TypeScript | 통과 | 타입 오류 없음 |

### FE-018

| 검증 항목 | 방식 | 결과 | 비고 |
|---|---|---|---|
| 실제 백엔드 E2E 기본 실행 | `npm.cmd run test:e2e:backend` | 조건부 건너뜀 | `E2E_RUN_REAL_BACKEND`와 토큰 미설정 시 실서버를 호출하지 않음 |
| mutation 안전장치 | 코드 검토 | 통과 | `E2E_ADMIN_MUTATE=true`일 때만 승인·반려·출석 실행 |

### FE-019

| 검증 항목 | 방식 | 결과 | 비고 |
|---|---|---|---|
| 실서버 연결성 | `GET https://be-test.dshelper.kr/api/v1/volunteer-events` | 확인 | 무토큰 요청이 `401`을 반환해 서버 및 인증 경계 응답 확인 |
| 수동 workflow 정적 검토 | YAML 및 secret 참조 검토 | 통과 | 기본 push/PR workflow와 분리, 토큰을 로그에 출력하지 않음 |

### FE-020

| 검증 항목 | 방식 | 결과 | 비고 |
|---|---|---|---|
| 임시 관리자 토큰 발급 API | `POST https://be-test.dshelper.kr/test/temp-token` | 재검증 필요 | DSHelper(BE) test 브랜치 Controller 매핑이 POST임을 소스에서 확인; 배포 응답은 다음 실 API 실행에서 확인 |
| 토큰 공급자 E2E 코드 | Playwright API fixture 코드 검토 및 typecheck/lint | 통과 | 토큰을 파일·로그에 저장하지 않고 요청 시 발급·메모리 사용 |

### FE-021

| 검증 항목 | 방식 | 결과 | 비고 |
|---|---|---|---|
| 문서 라우터 구조 | `npm.cmd run docs:check` | 통과 | 28개 Markdown이 `docs/README.md`에서 연결됨 |

### FE-023

| 검증 항목 | 방식 | 결과 | 비고 |
|---|---|---|---|
| OAuth API 계약 | Vitest `auth-api.test.ts` | 통과 | 카카오·네이버·구글 login-url 및 code/state payload |
| OAuth redirect URI | Vitest `oauth-redirect.test.ts` | 통과 | 네이버 `/oauth/naver/callback` 포함 |
| 사용자 봉사 API 계약 | Vitest `volunteer-user-api.test.ts` | 통과 | 4개 흐름의 path·method·cache/FormData |
| 전체 단위·통합 테스트 | `npm.cmd run test:run` | 통과 | 9 files / 47 tests |
| typecheck/lint | npm scripts | 통과 | 오류 없음 |
# FE-026 검증

- `npm run typecheck` 통과
- `npm run build` 통과
- `npm run test:run` 통과 (9 files, 47 tests)
- `npm run lint` 통과
- `npm run contract:check` 통과
- `npm run docs:check` 통과

# FE-027 검증

- `npm run typecheck` 통과
- `npm run test:run` 통과 (9 files, 47 tests)
- `npm run lint` 통과
- `npm run build` 통과

# FE-028 검증

- 사용자 `test` 봉사 controller 13개 endpoint를 source scan으로 확인
- 관리자 `test` 봉사 controller 20개 endpoint를 source scan으로 확인
- `npm run typecheck` 통과
- `npm run test:run` 통과 (9 files, 47 tests)
- `npm run lint` 통과
- `npm run build` 통과
- `npm run docs:check` 통과 (31 markdown files)
- `npm run contract:check` 통과

# FE-031 기반 검증

- 보안 헤더 설정은 Next.js build 설정에 반영했다.
- 외부 API URL 제거는 내부 API·DB 구현 전에는 실행하지 않도록 차단 조건을 기록했다.
- `npx prisma validate` 통과 (검증용 `DATABASE_URL` 사용)
- `npm audit --omit=dev` 통과 (0 vulnerabilities)
- 인증 primitive unit test 통과 (Argon2id hash/verify, 49 tests total)
- `npm run db:generate` 통과 (검증용 `DATABASE_URL` 사용)
- 전체 `npm audit`에는 개발 의존성의 high 3건이 남아 있으며, production 범위 `npm audit --omit=dev`는 0건이다. `npm audit fix`는 lockfile 대규모 변경 전 검토 대상으로 남긴다.
- 독립 인증 Route Handler가 Next.js build route 목록에 포함됨을 확인했다.
- 전체 Vitest 50개 통과.
- 사용자 독립 Route Handler가 Next.js typecheck를 통과했다.
- 사용자 신청·내 활동 Route Handler가 Next.js build route 목록에 포함됨을 확인했다.
- 관리자 일정 목록 Route Handler가 typecheck/build에 포함됨을 확인했다.
- 관리자 신청 Route Handler가 typecheck/build에 포함됨을 확인했다.
- 관리자 단원 목록·상세·상태 변경 Route Handler가 typecheck/build에 포함됨을 확인했다.
- 2026-08-17 회귀: `npm run typecheck` 통과, `npm run test:run` 10 files/50 tests 통과, `npm run build` 통과.
- 실제 PostgreSQL migration과 배포 런타임 통합 테스트는 운영 `DATABASE_URL` 및 시크릿이 없어 미실행.
- `npm run verify:independent` ✅ Netlify·API client·관리자 upload 경로에서 기존 외부 백엔드 도메인 0건.
- `npm audit --omit=dev` ✅ production dependency vulnerabilities 0건.
- `npm run docs:check` ✅ 34개 Markdown 문서 링크/라우터 검사.
- OAuth callback 비호출 전환 후 `npm run typecheck`, `npm run test:run`, `npm run build` 재통과.
- `npm run verify:deploy-config` ✅ 독립 플랫폼 필수 환경변수와 외부 백엔드 URL 부재 확인.
- CI workflow는 동일한 `verify:independent`, `verify:deploy-config`, DB validate/generate, lint, typecheck, Vitest, build, production audit를 실행하도록 구성했다.
- 최신 회귀 검증: `npm run lint` 오류·경고 0건, `npm run typecheck`, `npm run test:run`(50개), `npm run build` 모두 통과.
- 초기 migration SQL 생성 완료. `prisma migrate status`는 로컬 PostgreSQL 미기동으로 미실행 상태이며, 운영 `DATABASE_URL`에서 `npm run db:migrate:deploy`를 실행해야 한다.
- PostgreSQL compose 구성 파일 정적 검토 완료. Docker daemon 미기동으로 실제 container/migration 통합 실행은 미실행.
- 관리자 일정 mutation Route Handler 추가 후 `npm run typecheck`, `npm run lint`, `npm run test:run`(50개), `npm run build`, `npm run docs:check` 재통과.
- 관리자 이미지 업로드 Route Handler는 typecheck/build route 목록에 포함되며, 실제 파일 저장은 `FILE_STORAGE_MODE=local` 또는 운영 storage adapter 설정이 필요하다.
- 관리자 참여자·출석 Route Handler 추가 후 `npm run typecheck`, `npm run lint`, `npm run test:run`(50개), `npm run build` 재통과.
- 관리자 일정 상태 전이 Route Handler 추가 후 동일 회귀 검증을 재통과.
- `/api/health` Route Handler가 typecheck/build route 목록에 포함되며, 실제 200 응답은 운영 DB 연결 후 smoke test에서 확인한다.
- 운영 URL smoke check (2026-08-17): `https://volunteer.dshelper.kr/api/health`는 `404`를 반환했다. 현재 운영 배포가 최신 독립 플랫폼 빌드를 반영하지 않은 상태이며, 재배포 후 동일 URL을 재검증해야 한다.
- `main` push: commit `8aad054`를 `https://github.com/DS-Helper/volunteer-frontend.git`에 push 완료. push 후 운영 `/api/health`는 재조회했으나 여전히 `404`로, Netlify 자동 배포 연결 또는 환경변수 설정을 확인해야 한다.
- Netlify adapter 설정 변경 후 로컬 회귀: lint/typecheck/Vitest 50개/build/독립성/배포설정/문서 검사 모두 통과. Netlify 재배포 후 운영 API 404를 다시 확인해야 한다.
- CI audit 실패 원인 확인: Prisma CLI(`prisma`)가 `@prisma/client`의 devOptional peer로 설치되어 `--omit=dev`만으로는 audit 대상에 남는다. production dependency 검사는 `npm audit --omit=dev --omit=optional`로 변경했고 0 vulnerabilities를 확인했다. 전체 audit의 Prisma CLI high 3건은 별도 개발 의존성 이슈로 기록한다.
