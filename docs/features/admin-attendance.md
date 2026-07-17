# 관리자 출석 관리

> 상태: 검증 중 · 작업 ID: FE-204  
> 요구사항: `volunteer_plan.md` §5-16, §7-9, §9-5  
> v1 API/Mock: participation 목록 GET과 attendance 일괄 POST가 participation ID 배열을 받고 성공 결과를 반환한다.  
> 디자인 기준 DS-01: 흰 12px table, `#0DBA53` 선택·저장 CTA, 참석/불참 pill, `#F6F6F6` row state, Pretendard.

## 목표

`/admin/volunteer/events/[id]/attendance`에서 참여자 목록을 확인하고 참석·불참을 ID 기반으로 일괄 저장한다.

## 입력 모델

```json
{
  "attendedParticipationIds": [1, 2, 3],
  "absentParticipationIds": [4, 5]
}
```

이름이 아니라 서버 발급 participation ID를 사용한다. 미처리, 출석, 불참 상태를 명확히 구분하고 양쪽 배열에 같은 ID가 들어가지 않게 한다.

## 출석 상태 계약 (FE-009)

출석의 단일 API Enum은 DSHelper(BE)의 `VolunteerParticipationStatus`다. Admin은 `participationStatus`만 반환하며 별도 `attendanceStatus`를 반환하지 않는다. 화면의 `미처리` 표시는 `participationStatus === 'APPLIED'`에서만 파생한다. `CANCELED`는 출석 처리 대상에서 제외한다.

## UX·안전

전체 선택은 현재 표시된 대상 범위를 명시한다. 저장 전 변경 건수를 확인하고 pending 동안 입력·저장을 잠근다. 서버 실패 시 어떤 항목도 성공으로 추정하지 않고 결과 계약에 따라 다시 조회한다.

## 체크리스트

- [ ] checkbox/radio에 이름과 상태가 접근 가능하게 연결된다.
- [ ] 중복 ID와 빈 제출을 검증한다.
- [ ] 저장 후 참여 목록·단원·내 완료·summary를 갱신한다.
- [ ] 전화번호는 서버가 반환한 마스킹 값만 표시한다.
- [ ] 일부 실패 계약을 확인한다.

## 미해결 질문

- 출석 처리가 허용되는 일정 상태와 capability 필드는?
- 일괄 저장이 원자적인지 부분 성공이 가능한지?
- 이미 처리된 출석의 재수정 권한과 감사 안내는?
