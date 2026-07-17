# 봉사단 가입 신청·수정·상태

> 상태: 검증 중 · 작업 ID: FE-006  
> 요구사항: `volunteer_plan.md` §5-7, §5-8, §7-2, §9-1  
> v1 API/Mock: 신청 POST, latest GET, PATCH, DELETE endpoint와 `PENDING|APPROVED|REJECTED|CANCELED`, `canEdit/canCancel/canReapply` fixture를 사용한다.  
> 디자인 기준 DS-01: Pretendard form, `#3C3B3B` label, `#0DBA53` primary, `#F6F6F6` section, 12px field/card와 pill status.

## 라우트

- `/volunteer/application`: 새 신청
- `/volunteer/application/edit`: 수정
- `/volunteer/application-status`: 최신 상태

## 입력과 전송

이름, 연락처, 생년월일, 성별, 동네, 희망 활동, 지원동기, 사진을 받는다. React Hook Form과 Zod로 필수값·길이를 사전 검사하며, 실제 유효성은 서버가 재검증한다.

사진은 존재, 브라우저 MIME/확장자, 20MB 이하, preview 가능 여부만 확인한다. 전송은 `multipart/form-data`, `application` JSON Blob과 `photo` File을 가정한다.

실제 BE 계약에서 신청 ID는 UUID 문자열 `applicationId`이며 숫자로 변환하지 않는다. 취소 성공 응답은 `204 No Content`다.

## 상태별 UI

| 상태 | 내용·액션 |
| --- | --- |
| `PENDING` | 승인 대기, 수정·취소 capability |
| `APPROVED` | 승인, 일정 보기 |
| `REJECTED` | 공개 반려 사유, 재신청 capability |
| `CANCELED` | 취소, 다시 신청 capability |

중복 제출을 막고 field error를 label/description과 연결한다. 공개 반려 사유와 관리자 메모를 혼동하지 않는다.

## 체크리스트

- [ ] create/edit schema와 제출 DTO가 구분된다.
- [ ] 파일 object URL을 교체·unmount 시 해제한다.
- [ ] pending 동안 제출 버튼을 비활성화한다.
- [ ] 성공 후 최신 신청 query를 갱신한다.
- [ ] 네 상태와 오류·빈 상태를 테스트한다.

## 미해결 질문

- 생년월일·성별의 실제 DTO 형식과 허용값은?
- 수정 시 기존 사진을 유지하는 multipart 규칙은?
- 반려 후 재신청이 새 POST인지 기존 신청 갱신인지?
