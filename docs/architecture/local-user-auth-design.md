# 로컬 사용자 도메인 설계안

> 작업 ID: FE-029  
> 상태: 설계 제안 · 구현 대기  
> 범위: `username/password` 기반 사용자 회원가입·로그인·토큰 갱신·로그아웃  
> 비범위: OAuth provider 연동 변경, 관리자 인증 변경, 기존 봉사 업무 규칙 변경

## 1. 목표와 원칙

- OAuth와 독립된 로컬 계정 인증을 제공한다.
- 사용자 식별자는 `username`으로 고정하고 중복을 서버에서 원자적으로 방지한다.
- 비밀번호 원문은 저장·로그·응답에 절대 포함하지 않는다.
- 연속 5회 로그인 실패 시 15분 잠금하고, 실패 응답은 계정 존재 여부를 노출하지 않는다.
- JWT 검증은 서버에서 수행하며, 프론트의 메뉴 숨김을 인가로 간주하지 않는다.
- 기존 봉사 API는 인증 방식이 바뀌어도 `Authorization: Bearer <accessToken>` 계약을 유지한다.

## 2. 권장 구성

```text
Next.js Client
  ├─ POST /api/auth/register
  ├─ POST /api/auth/login
  ├─ POST /api/auth/refresh
  ├─ POST /api/auth/logout
  └─ 기존 봉사 API → Authorization: Bearer <accessToken>

Auth Service
  ├─ User aggregate / unique username
  ├─ Argon2id password hash
  ├─ short-lived access JWT
  └─ rotating refresh-token session
```

현재 Spring Boot 사용자 백엔드에 계정을 저장할지, Next.js가 별도 DB를 소유할지는 배포 전에 결정해야 한다. 운영에서 두 사용자 저장소를 동시에 권위 원장으로 사용하지 않는다.

## 3. 도메인 모델

### User

| 필드 | 타입 | 규칙 |
| --- | --- | --- |
| `id` | UUID | 서버 생성, 외부 식별자 |
| `username` | string | trim·NFKC 정규화, case-insensitive unique |
| `passwordHash` | string | Argon2id 결과만 저장 |
| `status` | `ACTIVE\|LOCKED\|WITHDRAWN` | 인증·업무 접근에 사용 |
| `roles` | `USER[]` | 서버 인가용 |
| `createdAt`, `updatedAt` | Instant | 서버 생성 |
| `lastLoginAt` | Instant nullable | 성공 로그인 시 갱신 |
| `failedLoginCount` | integer | rate limit/잠금 판단 |
| `lockedUntil` | Instant nullable | 임시 잠금 |

### RefreshSession

| 필드 | 타입 | 규칙 |
| --- | --- | --- |
| `id` | UUID | 세션 식별자 |
| `userId` | UUID | User FK |
| `tokenHash` | string | 원문 refresh token 저장 금지 |
| `expiresAt` | Instant | 절대 만료 |
| `revokedAt` | Instant nullable | rotation/logout/reuse 탐지 |
| `replacedBy` | UUID nullable | rotation 연결 |
| `createdAt`, `lastUsedAt` | Instant | 감사용 |

## 4. HTTP 계약

### 회원가입

`POST /api/auth/register`

```json
{
  "username": "alice_01",
  "password": "strong-password",
  "passwordConfirmation": "strong-password"
}
```

응답: `201`

```json
{
  "data": {
    "user": { "id": "uuid", "username": "alice_01", "roles": ["USER"] },
    "accessToken": "jwt",
    "expiresIn": 900
  }
}
```

refresh token은 응답 JSON에 포함하지 않고 `HttpOnly; Secure; SameSite=Lax; Path=/api/auth` 쿠키로 설정한다.

### 로그인

`POST /api/auth/login`

```json
{ "username": "alice_01", "password": "strong-password" }
```

성공 응답은 회원가입과 같은 `user`, `accessToken`, `expiresIn` 구조를 사용한다. 실패는 username 존재 여부를 노출하지 않는 동일한 인증 오류로 반환한다.

### 갱신

`POST /api/auth/refresh`

- refresh cookie 검증
- 기존 세션 revoke
- 새 refresh cookie 발급
- 새 access token 반환
- 재사용된 revoked token이면 해당 사용자 세션을 모두 revoke하고 `AUTH_REFRESH_REUSE_DETECTED` 반환

### 로그아웃

`POST /api/auth/logout`

- 현재 refresh session revoke
- refresh cookie 만료
- 응답 `204`

## 5. JWT 설계

Access JWT payload 최소 필드:

```json
{
  "sub": "user-uuid",
  "role": "USER",
  "type": "PERSONAL",
  "tokenType": "accessToken",
  "iat": 0,
  "exp": 0,
  "jti": "uuid"
}
```

- 만료 시간: 15분 권장
- 서명 키: 환경변수/Secret Manager에서 주입하고 저장소 커밋 금지
- 알고리즘: 서버에서 고정하고 토큰 header의 `alg`를 신뢰하지 않는다.
- refresh JWT를 업무 API의 Bearer 토큰으로 사용하지 않는다.
- `sub`는 username이 아니라 변경 불가능한 user UUID를 사용한다.

현재 프론트 API Client는 `localStorage.accessToken`을 읽어 Bearer 헤더를 붙인다. 1차 호환 구현에서는 access token만 저장할 수 있지만, 보안 권장안은 access token을 메모리 저장하고 refresh token은 HttpOnly cookie로 제한하는 방식이다. 저장 전략을 바꾸면 API Client와 401 재시도 정책을 함께 변경해야 한다.

## 6. 보안·검증 규칙

- 비밀번호는 Argon2id를 우선 사용하고, 라이브러리의 권장 cost를 운영 환경에서 벤치마크한다.
- 최소 길이 12자, 최대 길이 128자. 조합 강제보다 유출 비밀번호 차단을 우선한다.
- username은 Unicode 정규화 후 허용 문자·길이를 검증하고 DB unique index를 최종 기준으로 삼는다.
- 로그인 실패 rate limit, IP/user 기준 throttling, 임시 잠금을 적용한다.
- CORS는 허용 origin을 명시하고 credentials 정책을 일관되게 설정한다.
- CSRF 방어는 refresh cookie를 사용하는 mutation에 Origin 검증 또는 CSRF token을 적용한다.
- 응답·로그·오류에 password, token, passwordHash를 포함하지 않는다.
- 회원 탈퇴는 즉시 인증 불가 처리하고 refresh session을 전체 revoke한다.

## 7. 봉사 도메인 연결

1. 로컬 로그인 성공 → access JWT 발급
2. 프론트가 `Authorization: Bearer`로 사용자 봉사 API 호출
3. 백엔드의 `sub`를 기존 User UUID와 매핑
4. 기존 봉사단원·신청 데이터의 user FK와 동일한 식별자를 사용
5. OAuth 계정과 로컬 계정을 병합할 경우 별도 `AuthIdentity` 테이블을 두고 User를 공유한다.

OAuth 계정과 username 계정을 username/email 문자열로 자동 병합하지 않는다. 명시적인 계정 연결 절차가 필요하다.

## 8. Next.js 구현 경계

- Route Handler 또는 별도 Auth Service가 인증 mutation을 담당한다.
- DB 접근 모듈은 `server-only` 경계로 제한한다.
- Client Component는 password를 상태에 오래 보관하지 않고 제출 후 즉시 폐기한다.
- 로그인 성공 후 `hydrateUserStore`를 호출하고 보호 페이지 접근 시 서버 인증을 다시 확인한다.
- 401은 무조건 즉시 무한 재시도하지 말고, 한 번의 refresh 시도 후 실패하면 로그아웃·로그인 화면으로 이동한다.
- 기존 `/oauth/{provider}/login` 흐름과 로컬 `/api/auth/login` 흐름을 별도 함수로 유지한다.

## 9. 구현 순서와 완료 조건

1. 저장소 선택 및 기존 User UUID 매핑 결정
2. migration과 unique index 작성
3. password hash/verify 단위 테스트
4. register/login/refresh/logout Route Handler 및 contract test
5. refresh rotation·reuse 탐지·rate limit 통합 테스트
6. 프론트 로그인 폼과 API Client 연동
7. 기존 봉사 API smoke 및 OAuth regression 실행

완료 조건:

- password 원문/refresh 원문이 DB·로그·응답에 없음
- duplicate username race test 통과
- 만료·위조·재사용 JWT가 거부됨
- refresh rotation과 logout 이후 access/refresh 정책이 문서와 일치함
- 사용자 봉사 API에서 기존 UUID와 권한이 유지됨

## 10. 결정이 필요한 항목

- 인증 DB를 Next.js가 소유할지 기존 DSHelper(BE)가 소유할지
- access token 저장 위치를 기존 localStorage로 유지할지 메모리로 전환할지
- username 규칙과 password 정책의 최종 값
- 기존 OAuth User와 로컬 User의 계정 연결을 v1에 포함할지
- 관리자 계정 도메인을 동일 Auth Service에 포함할지 분리할지
