# 관리자 봉사 일정 관리

> 상태: 검증 중 · 작업 ID: FE-007, FE-203  
> 요구사항: `volunteer_plan.md` §5-15, §7-8  
> v1 API/Mock: admin events 목록·상세·POST·PATCH와 open/close/cancel endpoint를 동일 DTO fixture로 모방한다.  
> 디자인 기준 DS-01: `#F6F6F6` page, 흰 12px form/card, `#0DBA53` 저장·공개 CTA, pill event status, Pretendard.

## 라우트

- `/admin/volunteer/events`: 목록
- `/admin/volunteer/events/new`: 등록
- `/admin/volunteer/events/[id]`: 상세
- `/admin/volunteer/events/[id]/edit`: 수정

## 폼

이미지, 제목, 유형, 시작·종료·마감 일시, 장소, 정원, 내용, 준비물, 유의사항, 상태, 공개 여부를 입력한다.

클라이언트는 종료 > 시작, 마감 ≤ 시작, 정원 ≥ 1, 필수값, 이미지 선택을 사전 확인한다. 서버가 동일 규칙과 현재 참여 인원 제약을 최종 검사한다.

시간·장소 변경 시 알림 영향도를 안내하고 정원을 현재 인원보다 작게 입력한 경우 경고하되 저장 차단의 최종 책임은 서버에 둔다.

## 이벤트 이미지 계약 (FE-007)

일정 이미지는 두 단계로 처리한다. 먼저 `POST /api/v1/admin/volunteer/event-images`에 `multipart/form-data`의 `image` 파일 하나를 전송한다. 응답의 `volunteerFileId`를 받은 뒤, 일정 생성·수정 요청은 `imageFileId`를 포함한 JSON DTO로 각각 `POST /api/v1/admin/volunteer/events`, `PATCH /api/v1/admin/volunteer/events/{id}`에 전송한다.

- 범위: 관리자 일정 등록·수정 화면, feature API, 계약 기반 Mock을 동일한 2단계 계약으로 정렬한다.
- 비범위: 임시 업로드 정리와 고아 이미지 삭제 정책은 Admin 서버의 저장소 수명주기 책임으로 보류한다.
- 완료 조건: 신규 이미지는 업로드 응답의 식별자를 JSON 일정 요청에 사용하고, 수정 시 이미지를 교체하지 않으면 기존 식별자를 그대로 전송한다.

## 체크리스트

- [ ] create/edit schema와 API DTO가 구분된다.
- [x] 이미지 업로드 응답의 `volunteerFileId`가 생성·수정 JSON 요청의 `imageFileId`로 전달된다.
- [ ] datetime timezone이 명시된다.
- [ ] 상태 transition action이 capability를 따른다.
- [ ] 저장·공개·마감·취소 중복 요청을 막는다.
- [ ] 변경 후 사용자·관리자 일정 query를 갱신한다.

## 미해결 질문

- 상태와 공개 여부를 생성 DTO에 직접 보내는가?
- 변경 알림 영향도 preview API가 별도로 있는가?
