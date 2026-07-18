# 봉사 일정 목록·상세

> 상태: 검증 중 · 작업 ID: FE-006  
> 요구사항: `volunteer_plan.md` §5-9, §7-4  
> v1 API/Mock: events GET과 event detail GET이 페이지 데이터, 현재 인원, 내 참여, `canApply/canCancel/canViewParticipants`를 반환한다.  
> 디자인 기준 DS-01: `#F6F6F6` page, 흰 12px event card, `#0DBA53` CTA·OPEN badge, `#3C3B3B` text, filter pill.

## 목표

사용자가 상태·페이지 filter를 URL에 유지하면서 일정을 탐색하고 상세 정보와 현재 가능한 행동을 확인한다.

현재 BE의 `eventId`는 UUID 문자열이다. 목록은 `content`·`page`를, 상세는 문자열 `supplies`·`precautions`를 반환한다. UI 경계는 표시에 필요한 최소 변환만 수행하고 capability와 상태는 원문 값을 사용한다.

## 목록

- filter: 전체, `OPEN`, `CLOSED`, `COMPLETED`
- 카드: 이미지, 제목, 일시, 장소, 현재/모집 인원, 일정 상태, 내 참여 상태
- query 예: `/volunteer/events?status=OPEN&page=0`
- loading skeleton, 빈 목록, API 오류와 재시도

## 상세

`eventId`를 검증해 조회한다. 제목, 이미지, 일시, 장소, 내용, 준비물, 유의사항, 인원, 상태, 참여자 보기와 참여/취소 action 영역을 표시한다. 없는 일정은 404다.

현재 인원이나 브라우저 시간만으로 CTA를 최종 결정하지 않고 서버 `capabilities`를 사용한다. 이미지 endpoint가 원격이면 최소 `remotePatterns`를 확정한다.

## 체크리스트

- [ ] search param 허용값과 page를 검증한다.
- [ ] filter 변경 후 URL·목록·focus가 일치한다.
- [ ] card와 상세 이미지에 적절한 alt·sizes가 있다.
- [ ] 목록·상세를 `no-store` 정책으로 조회한다.
- [ ] 상세 404와 목록 empty를 구분한다.

## 미해결 질문

- pagination은 0-based로 최종 확정되었는가?
- 참여자 popup의 사용자 공개 DTO와 마스킹 형식은?
- event image URL host와 인증 필요 여부는?
