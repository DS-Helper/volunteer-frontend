# 독립 봉사 도메인 플랫폼 아키텍처

> 작업 ID: FE-030  
> 상태: 구현 진행 중 · FE-031
> 결정: 기존 `DSHelper(BE)`와 `DS-Helper-Admin`은 런타임에서 사용하지 않는다.
> 구현 가정: PostgreSQL + Prisma + `jose` + Argon2id + Node 실행형 Next.js

## 1. 제품 경계

현재 프로젝트는 외부 DSHelper 사용자·관리자 백엔드의 프론트가 아니라, 사용자·관리자 기능과 봉사 업무 규칙을 모두 소유하는 독립 플랫폼으로 전환한다.

```text
Browser → Next.js App Router → Route Handler/server service → 독립 PostgreSQL
```

기존 Spring Boot 프로젝트의 endpoint는 요구사항·상태·DTO 비교를 위한 참고 자료로만 보존한다.

## 2. 독립 소유권

플랫폼이 직접 소유한다.

- User, Role, RefreshSession
- VolunteerApplication, VolunteerMember
- VolunteerEvent, VolunteerParticipation
- VolunteerFile, presigned image metadata
- 상태 이력, 출석 결과, 알림 outbox
- API DTO, 오류 코드, pagination, audit log

런타임에서 제거한다.

- `NEXT_PUBLIC_API_BASE_URL`를 통한 DSHelper API 호출
- 관리자 별도 API base URL
- 기존 `/oauth/*` login-url 의존 (독립 OAuth provider 구현 전까지 UI에서 비활성)
- 외부 user UUID·admin token 발급 API
- 외부 ResponseVo 변환 가정

## 3. Next.js 모듈 경계

```text
src/app/api/auth/*
src/app/api/volunteer/*
src/app/api/admin/volunteer/*
src/server/auth/*
src/server/volunteer/*
src/server/db/*
src/features/volunteer/api/*
```

Route Handler는 validation·인증 경계·응답 매핑에 집중하고, 정원·상태 전이·출석 가능 여부는 `src/server/volunteer`에서 판단한다.

## 4. API 전략

기존 endpoint의 의미는 유지하되 최종 API 소유자를 이 프로젝트로 바꾼다.

- `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`
- `/api/volunteer/introduction`
- `/api/volunteer-events/**`
- `/api/volunteer-applications/**`
- `/api/volunteer-members/me/**`
- `/api/admin/volunteer/**`

초기 호환 계층에서 `/api/v1/...` 경로를 유지할 수 있지만, 내부는 독립 repository를 사용해야 한다. 외부 백엔드 proxy는 독립 플랫폼 완료로 간주하지 않는다.

## 5. 데이터·권한 기준

- 독립 PostgreSQL을 단일 source of truth로 사용한다.
- unique index로 username·관리자 식별자를 보장한다.
- 신청 생성·정원 확인·참여 생성은 transaction과 locking으로 처리한다.
- 상태 전이는 허용 transition service에서만 수행한다.
- 출석 저장은 참여 상태와 attendance timestamp를 원자적으로 갱신한다.
- `/api/admin/volunteer/**` mutation은 서버 guard와 audit log를 필수로 한다.
- 테스트 토큰 API는 개발 profile에서만 활성화한다.

## 6. 전환 단계

1. 독립 DB schema/migration 작성 (schema 완료, migration/DB 연결 검증 대기)
2. username/password + JWT 구현 (Route Handler 완료, rate limit 보강 대기)
3. 사용자 봉사 read·mutation 구현 (핵심 일정·참여·신청 완료)
4. 관리자 read·mutation 구현 (신청·일정 목록·단원 핵심 완료)
5. 이미지 저장·presigned URL 구현
6. 외부 API client와 mock fallback 제거
7. 독립 API 기준 contract/E2E 재작성
8. 외부 백엔드 환경변수·문서 제거

## 7. 완료 조건

- 네트워크 추적에서 DSHelper 외부 도메인 호출 0건
- 모든 봉사 API가 이 저장소의 Route Handler/server service를 통과
- 독립 DB에서 회원가입부터 출석까지 전체 use case 재현
- 외부 토큰 없이 사용자·관리자 권한 검증
- 기존 Spring Boot 프로젝트가 중단되어도 플랫폼 동작

## 8. 현재 상태

현재 코드는 기존 Spring Boot 계약을 소비하는 구조이므로 독립 플랫폼 완료 상태가 아니다. 다음 구현에서 외부 base URL 의존성을 제거하고 독립 server 경계를 실제 코드로 채워야 한다.
