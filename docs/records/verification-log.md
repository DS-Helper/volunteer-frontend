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
