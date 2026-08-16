# OAuth·백엔드 연동 검증 계획

> 작업 ID: FE-022  
> 상태: 진행 중  
> 요구사항 출처: 사용자 요청 및 DSHelper(BE) `test` 브랜치·DS-Helper-Admin 소스 대조

## 목표

사용자 프론트가 DSHelper(BE) 사용자 API 및 OAuth를 사용하고, 관리자 기능이 DS-Helper-Admin API와 연결되는지 코드 계약과 실제 Test 환경 호출로 분리 검증한다.

## 범위

- 카카오·구글·네이버 OAuth login-url, callback, code/state login 교환
- 사용자 봉사 소개·일정·신청·참여·내 활동 API
- 관리자 신청·단원·일정·출석 API
- 사용자 BE와 관리자 BE의 배포 Base URL·JWT·CORS 연동

## 비범위

- provider Console의 client secret 변경
- 운영 DB 데이터 임의 생성·삭제
- 사용자 동의 없이 실제 OAuth 계정 연결

## 코드로 확인된 계약

### 사용자 BE `test` 브랜치

- OAuth: `GET/POST /oauth/{kakao|google|naver}/{login-url|login}`
- 임시 관리자 토큰: `POST /test/temp-token`
- 사용자 봉사 API: `/api/v1/volunteer*`, `/api/v1/volunteer-events*`, `/api/v1/volunteer-applications*`, `/api/v1/volunteer-members/me*`

### 관리자 BE

- Base path: `/api/v1/admin/volunteer`
- 신청 승인·반려, 일정 CRUD·상태, 참여자, 출석, 이미지 업로드 API 존재
- 관리자 OAuth Controller도 별도 존재하나 프론트 사용자 OAuth와 어느 배포 서버를 사용할지는 환경 확인이 필요하다.

## 현재 불일치·위험

- 네이버 callback: 프론트 로그인 시작 URI와 문서/라우트 URI가 `/naver/callback`과 `/oauth/naver/callback`으로 불일치한다.
- 사용자 token과 관리자 임시 token은 서로 다른 테스트 목적이다. 관리자 임시 token으로 사용자 봉사단원 API를 검증할 수 없다.
- 두 백엔드의 JWT signing secret 공유 여부는 소스만으로 확정하지 않는다.
- provider redirect URI, client 설정, CORS, DB/Redis/S3 상태는 소스만으로 확정하지 않는다.

## 확인이 필요한 외부 입력

| 항목 | 담당 | 증거 |
|---|---|---|
| 사용자 BE Test Base URL | 사용자 | URL 및 HTTP 응답 |
| 관리자 BE Test Base URL | 사용자 | URL 및 HTTP 응답 |
| Kakao/Naver/Google redirect URI | 사용자 | provider Console 값 |
| CORS 허용 origin | 백엔드 담당 | 환경 설정 또는 응답 |
| JWT secret 공유 여부 | 백엔드 담당 | 배포 환경 설정 |
| 실제 사용자 access token | 사용자 | 일회성 환경변수 주입 |
| 테스트 일정 ID/생성 권한 | 사용자 | API 응답 |

## 실행 계획

1. 네이버 callback URI를 한 경로로 확정하고 프론트·문서·provider Console을 동일하게 맞춘다.
2. 사용자 access token으로 사용자 조회 API를 실행한다.
3. 테스트 일정 조회 후 참여 신청·취소를 검증한다.
4. 가입 신청 생성·조회·수정·취소를 검증한다.
5. 관리자 Base URL과 관리자 token 발급 API를 확인한다.
6. 관리자 신청·일정 목록 조회가 정상화된 뒤 승인·반려·출석을 실행한다.
7. 각 실행 결과를 `docs/records/verification-log.md`에 상태 코드와 업무 코드로 기록한다.

## 완료 조건

- 세 provider callback URI가 코드·문서·Console에서 동일하다.
- 사용자 조회·신청·참여 API의 실제 응답이 확인된다.
- 관리자 조회·승인·반려·출석 API의 실제 응답이 확인된다.
- 미확인 외부 설정이 0개이거나 담당자와 차단 사유가 기록된다.
- `docs/README.md`, change-log, verification-log가 동기화된다.
