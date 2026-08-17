# 백엔드 브랜치 기준 소스 조회 설계안

> 작업 ID: FE-025  
> 상태: 설계 완료 · 구현 대기  
> 사용자 백엔드 기준: `test`  
> 관리자 백엔드 기준: `test` (사용자 승인으로 전환)  
> 본 작업은 소스 조회와 설계만 수행하며 백엔드·프론트 소스는 수정하지 않는다.

## 1. 브랜치 확인 결과

- 사용자 `dshelper/backend-test/ds-helper`: 현재 checkout branch는 `test`, 최신 커밋은 봉사 도메인 통합 테스트를 포함한다.
- 관리자 `dshelper-admin/admin`: `main`은 초기 커밋만 포함하며 `domain/volunteer` 소스가 없다.
- 관리자 `test`에는 봉사 controller, request/response DTO, enum, service, repository, 테스트가 존재한다.

사용자 승인에 따라 관리자 봉사 도메인의 기준 브랜치를 `test`로 확정한다. 이후 관리자 API 설계와 프론트 계약 검증은 `dshelper-admin/admin`의 `test` 소스를 기준으로 진행한다.

## 2. 사용자 백엔드(`test`)에서 확인한 설계

### API 경계

| 책임 | 경로 |
| --- | --- |
| 소개 | `GET /api/v1/volunteer/introduction` |
| 일정 | `GET /api/v1/volunteer-events`, `/{eventId}`, `/{eventId}/participants` |
| 가입 신청 | `POST /api/v1/volunteer-applications` (multipart) |
| 내 신청 | `GET /api/v1/volunteer-applications/me/latest` |
| 신청 수정/취소 | `PATCH /api/v1/volunteer-applications/{id}`, `DELETE .../{id}` |
| 참여 신청/취소 | `POST /api/v1/volunteer-events/{eventId}/participations`, `DELETE .../me` |
| 내 활동 | `GET /api/v1/volunteer-members/me/upcoming-events`, `completed-events`, `summary` |

### 프론트 책임

- DTO·Enum을 런타임 검증하고 `ResponseVo` envelope를 한 곳에서 해석한다.
- multipart 필드는 백엔드 request DTO와 정확히 매핑한다.
- 정원, 신청 가능 여부, 상태 전이는 프론트에서 결정하지 않고 서버 `capabilities`와 오류 코드를 사용한다.
- `VolunteerParticipationStatus`를 단일 상태로 사용하며 별도 `attendanceStatus`를 만들지 않는다.

## 3. 관리자 백엔드(`test`) 기준 설계

관리자 `test`의 `VolunteerAdminController` 기준 prefix는 `/api/v1/admin/volunteer`이며 다음 API가 확인된다.

- 신청 목록·상세·승인·반려·사진 presigned URL
- 단원 목록·상세·정지·활성화·탈퇴
- 일정 CRUD·open/close/cancel·2단계 이미지 업로드
- 일정 참여자 조회·출석 처리

관리자 프론트는 위 `test` 계약을 기준으로 연결하고, 배포 전 관리자 `test` 서버의 실제 응답과 권한을 smoke 검증한다.

## 4. OAuth 설계

사용자 `test` 소스의 세 controller는 다음 계약을 제공한다.

```text
GET  /oauth/{provider}/login-url?redirectUri={frontendCallback}
POST /oauth/{provider}/login { code, state }
```

프론트 callback은 카카오 `/kakao/callback`, 네이버 `/oauth/naver/callback`, 구글 `/google/callback`이다. callback은 백엔드 API가 아니라 Next.js route이며, Provider 콘솔과 사용자 BE redirect URI 정책을 동일하게 맞춰야 한다.

## 5. 구현·검증 순서

1. 사용자 `test` 기준 DTO·Enum·오류 계약을 프론트 스키마로 고정한다.
2. 정상적인 활성 사용자 fixture로 사용자 read/mutation smoke를 수행한다.
3. 관리자 `test` API의 read 계약을 먼저 검증한 뒤 승인·반려·출석 mutation E2E를 실행한다.
4. OAuth 세 provider의 redirect URI와 state 왕복을 실제 설정으로 검증한다.

## 6. 확인이 필요한 외부 사실

- 관리자 봉사 도메인의 최종 운영 승격 브랜치가 `main`으로 언제 병합되는지
- 관리자 API의 최종 base URL과 인증 claim
- 운영 profile의 CORS·redirect URI·presigned image 정책
- 사용자 `test` 환경에 활성 봉사단원 및 테스트 일정 fixture가 존재하는지
