# 독립 봉사 플랫폼 구현 작업 계획

> 작업 ID: FE-031  
> 상태: 예정  
> 요구사항 출처: 독립 플랫폼 전환 결정(ADR-016), username/password·JWT 설계안  
> 범위: 현재 Next.js 프로젝트가 사용자·관리자·인증·봉사 API를 직접 소유하도록 전환

## 1. 작업 원칙

- 모든 구현은 `docs/README.md`에 연결된 문서와 작업 ID를 먼저 가진다.
- Route, feature, server, database, test의 책임을 섞지 않는다.
- 백엔드 업무 규칙을 Client Component나 UI 표시 조건에 구현하지 않는다.
- 기존 Spring Boot 프로젝트는 참고 자료일 뿐 런타임 의존성이 아니다.
- 각 단계는 코드·문서·검증 로그가 함께 완료되어야 한다.

## 2. 목표 구조

```text
src/
├─ app/
│  ├─ api/auth/*
│  ├─ api/volunteer/*
│  └─ api/admin/volunteer/*
├─ features/
│  ├─ auth/
│  └─ volunteer/
├─ server/
│  ├─ auth/
│  ├─ volunteer/
│  ├─ db/
│  └─ files/
└─ lib/
```

`app`는 HTTP 조합, `features`는 브라우저 UI/client API, `server`는 인증·업무 규칙·영속성으로 책임을 고정한다.

## 3. 단계별 작업

### FE-031-A 기반·환경

- [x] 독립 DB와 ORM/driver 선택 가정: PostgreSQL + Prisma
- [ ] migration 실행 체계와 seed 분리
- [ ] server-only 모듈 경계 설정
- [ ] 환경변수 schema와 production 누락 검증
- 완료 조건: 외부 백엔드 URL 없이 앱이 기동되고 DB health check가 통과한다.

### FE-031-B 인증·사용자

- [ ] User/RefreshSession schema
- [ ] username 정규화·unique 정책
- [ ] Argon2id hash/verify
- [ ] register/login/refresh/logout Route Handler
- [ ] JWT guard와 401/403 오류
- [ ] refresh rotation·reuse 탐지·rate limit
- 완료 조건: 회원가입→로그인→갱신→로그아웃과 위조/만료 토큰 거부 테스트가 통과한다.

### FE-031-C 사용자 봉사 API

- [ ] introduction
- [ ] event list/detail/participants
- [ ] application create/latest/update/cancel
- [ ] participation apply/cancel
- [ ] member upcoming/completed/summary
- [ ] 정원·시간·상태 전이 transaction
- 완료 조건: 사용자 use case E2E가 독립 DB만으로 통과한다.

### FE-031-D 관리자 봉사 API

- [ ] admin role guard와 audit log
- [ ] application list/detail/approve/reject/photo
- [ ] member list/detail/suspend/activate/withdraw
- [ ] event CRUD/open/close/cancel
- [ ] event image upload
- [ ] participation list/attendance
- 완료 조건: 관리자 mutation과 권한 거부 E2E가 통과한다.

### FE-031-E 파일·알림

- [ ] private application photo와 public event image 분리
- [ ] WebP 변환·MIME/크기 검증
- [ ] presigned URL 만료 처리
- [ ] orphan cleanup
- [ ] notification outbox·retry·idempotency
- 완료 조건: 파일 보안 및 재시도 테스트가 통과한다.

### FE-031-F 프론트 전환·제거

- [ ] feature API를 내부 `/api` 경로로 변경
- [ ] 외부 API base URL 제거
- [ ] 기존 Spring ResponseVo adapter 제거 또는 내부 DTO로 교체
- [ ] Mock은 독립 API contract fixture로 격리
- [ ] OAuth와 local auth의 store/redirect 분리
- 완료 조건: 브라우저 Network에서 외부 DSHelper 도메인 호출이 0건이다.

### FE-031-G 품질·배포

- [ ] unit/contract/integration/E2E test matrix
- [ ] migration rollback 및 backup 정책
- [ ] secret rotation·로그 마스킹
- [ ] staging seed와 운영 seed 분리
- [ ] 배포 후 smoke·observability
- 완료 조건: lint, typecheck, test, build, E2E, docs check가 모두 통과한다.

## 4. 문서 라우팅

- 아키텍처: `docs/architecture/independent-platform-architecture.md`
- 인증: `docs/architecture/local-user-auth-design.md`
- 기능 계약: `docs/features/*`
- 작업 상태: `docs/delivery/current-status.md`
- 결정: `docs/records/decisions.md`
- 변경: `docs/records/change-log.md`
- 검증: `docs/records/verification-log.md`

## 5. 현재 차단 항목

- DB/ORM 선택
- 파일 저장소 선택
- 독립 배포 런타임과 secret 관리 방식
- 기존 OAuth를 유지할지 local auth만 우선할지

현재 외부 API base URL을 즉시 삭제하지 않는다. 독립 Route Handler와 영속 DB가 준비되기 전에 삭제하면 배포 앱의 모든 API 요청이 실패한다. 내부 API 전환과 외부 URL 제거는 FE-031-F에서 같은 변경으로 수행한다.
