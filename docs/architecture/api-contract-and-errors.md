# API 계약과 오류 처리

> 상태: 진행 중 · 작업 ID: FE-006  
> 요구사항: `volunteer_plan.md` §4, §5-5, §6-22, §8, §9  
> v1 API/Mock: `NEXT_PUBLIC_API_BASE_URL` 아래 `/api/v1` endpoint를 가정하고 MSW가 같은 Envelope와 오류를 반환한다.  
> 디자인 기준 DS-01: 성공은 초록, 경고·오류는 의미가 색에만 의존하지 않도록 아이콘·텍스트를 병기하며 12px/pill radius를 사용한다.

## 실제 BE 기준 공통 응답

```ts
type ApiSuccess<T> = {
  success: boolean
  code: { code: string; message: string; httpStatus: string }
  message: string
  data: T
}
type PageData<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}
type ApiFieldError = { field: string; message: string }
type ApiErrorBody = {
  success: false
  code: { code: string; message: string; httpStatus: string }
  message: string
  data: null
}
```

## 핵심 endpoint

- 사용자: introduction, applications, events, participations, member upcoming/completed/summary
- 관리자: applications 승인·반려·사진, members 상태, events CRUD·상태, attendance
- 사용자 endpoint의 method/path는 `volunteer_plan.md` §6-22와 현재 BE controller를 함께 기준으로 한다.
- BE의 식별자는 UUID 문자열이다. 사용자 API의 `applicationId`, `eventId`, `participationId`를 숫자로 변환하지 않는다.
- `DELETE` 가입 신청 및 참여 취소는 `204 No Content`다.
- upcoming/completed는 `{ content, page }` 페이지 객체이고 query `page`, `size`를 받는다.

## 상태 타입

- 신청: `PENDING | APPROVED | REJECTED | CANCELED`
- 단원: `ACTIVE | SUSPENDED | WITHDRAWN`
- 일정: `DRAFT | OPEN | CLOSED | COMPLETED | CANCELED`
- 참여: `APPLIED | CANCELED | ATTENDED | ABSENT`

한글 문구는 API에 보내지 않고 프론트 label map으로 변환한다.

## 오류 동작

| 코드 | UI 동작 |
| --- | --- |
| `VOLUNTEER_EVENT_CAPACITY_FULL` | 참여 비활성화 후 일정 목록·상세 재조회 |
| `VOLUNTEER_TIME_CONFLICT` | 겹치는 일정 안내 |
| `VOLUNTEER_CANCEL_DEADLINE_EXPIRED` | 취소 비활성화와 관리자 문의 안내 |
| `VALIDATION_ERROR` | 현재 BE가 필드별 오류 배열을 반환하지 않으므로 공통 오류로 표시 |

문자열 메시지 비교는 금지하고 알 수 없는 코드는 일반 오류 UI와 추적 가능한 로그 식별자로 처리한다. 개인정보·응답 body 전체는 로그하지 않는다.

## v1 Mock 원칙

- 정상, 빈 목록, 네트워크 오류, 각 업무 오류 시나리오를 제공한다.
- `capabilities`가 버튼 노출의 기준이며 mock 내부에서도 동일 규칙을 반환한다.
- Mock도 실제 BE DTO와 envelope로 순차 정합화한다. 관리자 mock/API는 이번 작업 범위에서 제외한다.

## 체크리스트

- [ ] 공통 Client가 현재 BE 성공·오류 Envelope를 구분한다.
- [ ] 모든 endpoint가 feature API 함수로 격리된다.
- [ ] field error가 폼 접근성 설명과 연결된다.
- [ ] Mock과 실 API가 동일 타입을 사용한다.

## 미해결 질문

- 인증은 cookie credentials인지 Authorization header인지?
- 날짜·시간 timezone과 ISO 문자열 형식은 무엇인지? (BE 응답은 `Instant` UTC)
- 관리자 사진 응답이 blob인지 제한된 URL인지?

## FE-008 — Admin API 실계약 정합화

- 상태: 진행 중
- 출처: Admin API 호환성 평가 후 사용자 승인
- 범위: UUID 식별자, 중첩 페이지, presigned 사진 URL, 관리자 capability, 일정 참여자 DTO를 Admin 서버와 프론트 경계 타입에서 통일한다.
- 완료 조건: 관리자 화면이 숫자 ID 변환 없이 UUID를 path에 사용하고, Admin 서버가 안정 DTO로 capability와 참여자 출석 정보를 반환한다.
- 비범위: 기존 봉사 이력의 데이터 모델·권한 체계 재설계와 OpenAPI 코드 생성 도입
