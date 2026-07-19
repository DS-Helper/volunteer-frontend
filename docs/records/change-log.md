# 변경 기록

> 상태: 진행 중 · 작업 ID: FE-502  
> 요구사항: `volunteer_plan.md` §10, §13  
> v1 API/Mock: 실제 API 연결 여부를 각 변경에서 `Mock`, `실 API`, `혼합`으로 표시한다.  
> 디자인 기준 DS-01: UI 변경에는 `#0DBA53`, `#3C3B3B`, `#F6F6F6`, Pretendard, 12px/pill radius 영향 여부를 기록한다.

## 2026-07-12

### FE-011 — Netlify Next.js 배포 대상 설정

- 상태: 검증 중
- API 단계: 해당 없음
- 변경: `netlify.toml`에 Next.js build 명령과 `.next` publish 디렉터리를 명시했다.
- 변경: 자동 어댑터가 실행되지 않는 운영 배포를 보완하기 위해 최신 `@netlify/plugin-nextjs` Runtime을 devDependency와 Build plugin으로 등록했다.
- 비범위: legacy Runtime v4, API 계약 및 화면 변경.

### FE-012 — 실 API 기본 전환

- 상태: 검증 중
- API 단계: 실 API 기본, Mock 명시적 opt-in
- 변경: `NEXT_PUBLIC_USE_VOLUNTEER_MOCKS=true`일 때만 Mock handler를 주입하도록 API request 경계를 변경했다.
- 변경: 현재 Netlify 배포에 `https://be-test.dshelper.kr`와 Mock 비활성 설정을 명시했다. 운영 전환 시 API base URL을 변경한다.
- 변경: 루트 layout을 request-time dynamic으로 지정해 API 데이터를 build 결과에 고정하지 않도록 했다.
- 비범위: backend CORS·인증 서버 설정 변경.

### FE-013 — OAuth 로그인·회원가입과 JWT 저장

- 상태: 검증 중
- API 단계: BE 웹 OAuth 실 API
- 변경: 카카오·네이버·구글 login-url/callback 화면과 `localStorage` JWT 저장을 추가했다.
- 변경: 공통 API Client가 브라우저 저장 access token을 `Authorization: Bearer` 헤더로 첨부한다.
- 비범위: provider console·BE secret/CORS 설정 변경.
- 변경: 로그인 성공 후 `/user/my-identifier`, `/user/my-info`를 병렬 호출해 전역 user-store에 저장하고 로그아웃 시 초기화한다.
- 변경: 배포 도메인을 `https://volunteer.dshelper.kr`로 전환해 OAuth callback·CORS 문서를 갱신했다.

### FE-009 — 출석 Enum 단일화

- 상태: 완료
- API 단계: DSHelper(BE) `VolunteerParticipationStatus` 계약 반영
- 변경: Admin의 별도 `attendanceStatus` 응답을 제거하고, 취소 참여자를 출석 목록에서 제외했다.
- 변경: 프론트는 `APPLIED`를 미처리 UI 상태로 파생하고 출석 상태 전용 Enum을 제거했다.

### FE-010 — 단원 상세 및 검색 계약 정합화

- 상태: 완료
- 변경: Admin 단원 상세·상태 변경 응답이 실제 참여 이력·통계·상태 이력을 반환한다.
- 변경: 가입 신청 `name`, `phone` 검색과 FE 사진 optional 타입을 Admin 계약에 맞췄다.
- 변경: 단원 성별 검색·UUID 관리자 ID 타입을 정렬하고 일정 유형 한글 라벨을 FE에서 파생한다.

### FE-008 — Admin API 실계약 정합화

- 상태: 검증 중
- API 단계: Admin 실 API DTO 확장 및 프론트 UUID·페이지 경계 정렬
- 변경: 관리자 일정·신청·단원 capability와 일정 참여자 안정 DTO를 Admin 서버에서 반환한다.
- 변경: 프론트는 관리자 UUID path와 중첩 `AdminPageResponse`를 수용한다.

### FE-007 — 관리자 일정 이미지 2단계 업로드 계약

- 상태: 완료
- API 단계: Admin 실 API 계약 반영 및 계약 기반 Mock 동기화
- 범위: 이미지 업로드 응답의 `volunteerFileId`를 일정 생성·수정 JSON DTO의 `imageFileId`로 전달
- 비범위: 관리자 일정의 UUID·페이지 DTO 등 별도 계약 정합화와 임시 이미지 정리 정책
- 변경: 관리자 일정 폼은 이미지 파일을 먼저 업로드하고, 반환된 식별자로 JSON 생성·수정 요청을 전송한다.
- 변경: 계약 기반 Mock도 `event-images` multipart 업로드와 JSON 일정 요청을 분리해 재현한다.

### FE-006 — BE volunteer 사용자 API 계약 정합화

- 상태: 검증 중
- API 단계: 실 API 계약 반영, 관리자 보류
- 범위: 현재 BE 사용자 controller·DTO·공통 오류 envelope에 맞춘 식별자, 응답, 페이지네이션, 204 취소, 오류 코드 처리
- 비범위: `/api/v1/admin/volunteer/**` 구현·목업·관리자 화면 변경
- 변경: `ResponseVo`의 중첩 오류 code와 204 빈 응답을 공통 API client에 반영
- 변경: UUID ID, application/event/participation 응답, member page·분 단위 summary를 사용자 API 경계에서 정규화
- 변경: 소개 화면이 introduction API의 description을 조회해 표시

### FE-006 — BE volunteer 사용자 API 계약 정합화

- 상태: 진행 중
- API 단계: 실 API 계약 반영, 관리자 보류
- 범위: `backend-test/ds-helper`의 사용자 controller·DTO·공통 오류 envelope에 맞춘 식별자, 응답, 페이지네이션, 204 취소, 오류 코드 처리
- 비범위: `/api/v1/admin/volunteer/**` 구현·목업·관리자 화면 변경

### FE-001 — 프로젝트 문서 체계와 절대 규칙

- 상태: 검증 중
- API 단계: Mock/계약 가정
- 변경: `AGENTS.md`에 Next.js 16.2·TypeScript·보안·문서·검증 규칙 추가
- 변경: `docs/README.md` 단일 라우터와 아키텍처·기능·품질·운영·기록 문서 생성
- 디자인: DS-01 token을 전 문서의 v1 기준으로 고정
- 검증: `verification-log.md` 참조

### FE-002 — Next.js 봉사단 사용자·관리자 v1

- 상태: 검증 중
- API 단계: 실 API client + 계약 기반 메모리 Mock fallback
- 변경: Next.js 16.2 App Router, React 19, TypeScript strict, Tailwind CSS 4, React Compiler 기반 구성
- 변경: 사용자 7개 및 관리자 9개 명세 라우트 구현
- 변경: React Hook Form·Zod 폼, TanStack Query mutation/cache invalidation, 공통 API client, 전체 endpoint 함수 구현
- 변경: 5개 persona fixture, MSW 테스트 계층, Vitest 33개, Playwright smoke 4개 작성
- 디자인: `dshelper.kr`의 로고, Pretendard 계열, 브랜드 green·gray, 12px CTA와 pill 패턴을 공통 UI에 반영
- 보안: 일반 사용자 DTO와 관리자 DTO 분리, 마스킹 참여자, 비공개 메모·사진 경계 명시
- 검증: lint, Next typegen + tsc, Vitest, production build, Playwright desktop/mobile 8개 통과

## 기록 형식

```text
날짜 / 작업 ID / 상태 / API 단계 / 변경 파일·요약 / 디자인 영향 / 검증 링크
```

## 체크리스트

- [ ] 사용자에게 의미 있는 변경만 기록한다.
- [ ] 코드와 문서 변경을 함께 연결한다.
- [ ] 검증하지 않은 내용을 완료로 쓰지 않는다.

## 미해결 질문

- 릴리스 버전 또는 Git commit 기준 changelog가 필요한가?
