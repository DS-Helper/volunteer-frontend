# 봉사 도메인 Next.js 완전 이식 가능성 감사

> 작업 ID: FE-028  
> 기준 소스: 사용자 `DSHelper(BE)` `test`, 관리자 `DS-Helper-Admin` `test`  
> 대상: 현재 `volunteer-frontend` Next.js 16.2 App Router  
> 판정: **기존 Spring Boot는 사용하지 않고, 현재 프로젝트가 독립 플랫폼의 API·DB·인증을 소유하도록 재구축한다.**

## 1. 판정 기준

“현재 프로젝트의 Next.js 코드로 구현”을 두 의미로 나눴다.

1. **클라이언트 계약 구현**: 기존 Spring Boot 소스에서 확인한 봉사 요구사항을 Next.js API client가 모두 표현하는가?
2. **독립 플랫폼 구현**: 인증, DB, 업무 규칙, 파일 처리, 알림을 Next.js 서버가 직접 소유하는가?

첫 번째는 현재 코드와 소스 대조로 검증한다. 두 번째는 현재 저장소에 독립 DB·server service가 없으므로 아직 구현되지 않은 범위로 판정한다.

## 2. endpoint 커버리지

### 사용자 `test` 백엔드

| API 그룹 | 백엔드 endpoint 수 | Next.js API 함수 | 판정 |
| --- | ---: | --- | --- |
| 소개 | 1 | `getVolunteerIntroduction` | 일치 |
| 일정 조회 | 3 | `getVolunteerEvents`, `getVolunteerEvent`, `getVolunteerEventParticipants` | 일치 |
| 가입 신청 | 4 | create/latest/update/cancel 함수 | 일치 |
| 참여 | 2 | apply/cancel 함수 | 일치 |
| 내 활동 | 3 | upcoming/completed/summary 함수 | 일치 |
| 합계 | 13 | 13 | 100% 경로 커버 |

### 관리자 `test` 백엔드

| API 그룹 | 백엔드 endpoint 수 | Next.js API 함수 | 판정 |
| --- | ---: | --- | --- |
| 신청 | 5 | 목록/상세/승인/반려/사진 | 일치 |
| 단원 | 5 | 목록/상세/정지/활성화/탈퇴 | 일치 |
| 일정·이미지 | 8 | 생성/이미지/목록/상세/수정/open/close/cancel | 일치 |
| 참여·출석 | 2 | 참여자/출석 | 일치 |
| 합계 | 20 | 20 | 100% 경로 커버 |

## 3. DTO·상태 정합화 결과

- 사용자 소개 capabilities를 실제 BE 필드(`canApply`, `canEdit`, `canCancel`, `canReapply`, `requiresLogin`)로 통일했다.
- 사용자 일정/신청/참여 응답의 `*Id`를 프론트 `id`로 API 경계에서 변환한다.
- 사용자 일정 상세의 문자열 `supplies`, `precautions`를 화면 배열로 변환한다.
- 참여자 응답의 `participantCount`를 유지한다.
- 관리자 pagination의 `{ content, page }`를 공통 `PageResponse`로 변환한다.
- 관리자 이벤트 capability와 사용자 이벤트 capability를 분리하고, 관리자 이벤트 nested response도 동일하게 정규화한다.
- 관리자 출석은 `VolunteerParticipationStatus`만 사용하며 `CANCELED`를 제외한다.
- 관리자 이미지 업로드는 multipart 선 업로드 후 `volunteerFileId`를 JSON 일정 요청에 전달한다.
- 개인화 소개 응답은 `no-store`로 처리해 로그인 사용자 간 capability 캐시 오염을 방지한다.

## 4. 현재 코드로 증명된 범위

- API path/method/body/multipart 계약: 구현됨
- TypeScript DTO와 응답 정규화: 구현됨
- OAuth callback·state·Bearer token: 구현됨
- 단위·타입·lint·build·계약 검사: 통과

## 5. Next.js 백엔드로 이식할 때 추가 구현해야 할 범위

현재 프론트 저장소에는 다음 백엔드 책임이 없으므로, “백엔드까지 Next.js” 목표에는 별도 구현이 필요하다.

- PostgreSQL schema, migration, transaction, repository/query
- JWT 발급·검증 및 관리자 권한 guard
- OAuth 세 provider의 server-side token 교환·state 저장
- 신청 정원/상태 전이/시간 중복/출석 업무 규칙
- S3 업로드, WebP 변환, private/presigned URL
- 알림 outbox, retry, scheduler
- 공통 `ResponseVo`, 오류 코드, validation, pagination 서버 계약
- 사용자 BE와 관리자 BE 데이터 공유 또는 통합 전략

## 6. 최종 판정

현재 Next.js 프로젝트는 두 백엔드의 **봉사 API 소비 계약을 100% 구현할 수 있는 구조와 endpoint 커버리지**를 갖췄다. 그러나 Spring Boot 백엔드의 내부 업무·데이터·인증 구현까지 Next.js로 옮긴 상태는 아니므로, “프론트와 백엔드 모두 Next.js로 완성”은 아직 달성되지 않았다.
