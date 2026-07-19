# 라우트와 렌더링 맵

> 상태: 검증 중 · 작업 ID: FE-001  
> 요구사항: `volunteer_plan.md` §5-2, §5-3, §5-17  
> v1 API/Mock: 모든 route는 계약 기반 fixture를 표시하며 URL query는 실제 브라우저 주소에 보존한다.  
> 디자인 기준 DS-01: 화면 배경 `#F6F6F6`, 흰 surface, 초록 CTA, 12px card와 pill 상태 badge.

## 사용자 라우트

| `/login` | OAuth 로그인 시작 | Client | provider login-url 이동 |
| `/oauth/[provider]/callback` | OAuth code callback | Client | JWT 저장 후 봉사단으로 이동 |

| URL | 화면 | 초기 렌더링 | 경계 |
| --- | --- | --- | --- |
| `/volunteer` | 소개 | Server | `loading.tsx` 선택 |
| `/volunteer/application` | 가입 신청 | Server shell + Client form | 폼 오류·제출 pending |
| `/volunteer/application/edit` | 신청 수정 | Server data + Client form | 404/권한 상태 |
| `/volunteer/application-status` | 가입 상태 | Server | 상태별 empty/action |
| `/volunteer/events` | 일정 목록 | Server + Client filter | loading/error/empty |
| `/volunteer/events/[eventId]` | 일정 상세 | Server + Client actions | not-found/error |
| `/volunteer/my` | 내 봉사활동 | Server + Client tabs | loading/error/empty |

## 관리자 라우트

| URL | 화면 | 주요 Client 영역 |
| --- | --- | --- |
| `/admin/volunteer/applications` | 신청 목록 | 검색·필터·페이지 |
| `/admin/volunteer/applications/[id]` | 신청 상세 | 승인·반려 모달 |
| `/admin/volunteer/members` | 단원 목록 | 검색·필터 |
| `/admin/volunteer/members/[id]` | 단원 상세 | 상태 변경 모달 |
| `/admin/volunteer/events` | 일정 관리 | 필터·상태 액션 |
| `/admin/volunteer/events/new` | 일정 등록 | 입력 폼 |
| `/admin/volunteer/events/[id]` | 일정 상세 | 상태 액션 |
| `/admin/volunteer/events/[id]/edit` | 일정 수정 | 입력 폼·경고 |
| `/admin/volunteer/events/[id]/attendance` | 출석 | 체크·일괄 저장 |

## URL 상태

일정과 관리자 목록의 필터·페이지는 `searchParams`로 유지한다. 예: `/volunteer/events?status=OPEN&page=0`. Server page에서 데이터 로딩에 쓰는 값은 `await searchParams`로 읽고 허용값을 검증한다.

## 메타데이터

- root: `DSHelper 봉사단`
- 각 page: `화면명 | DSHelper 봉사단`
- `html lang="ko"`; 화면마다 고유한 `h1`

## 체크리스트

- [ ] §5-3 라우트와 표가 일치한다.
- [ ] 동적 ID가 유효하지 않거나 없으면 404를 표시한다.
- [ ] 목록 필터가 새로고침·공유 후 유지된다.
- [ ] 각 목록에 loading/error/empty가 있다.

## 미해결 질문

- 루트 `/`에서 `/volunteer`로 연결할지 기존 홈을 유지할지?
- 인증 실패 시 로그인 URL과 복귀 query 규칙은 무엇인지?
