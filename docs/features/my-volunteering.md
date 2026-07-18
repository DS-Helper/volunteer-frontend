# 내 봉사활동

> 상태: 검증 중 · 작업 ID: FE-006  
> 요구사항: `volunteer_plan.md` §5-12, §7-7  
> v1 API/Mock: upcoming, completed, summary 세 GET endpoint가 독립 `{ data }` 응답을 반환한다. 통계는 fixture 값 그대로 표시한다.  
> 디자인 기준 DS-01: `#F6F6F6` 배경, 흰 12px summary/card, `#0DBA53` active tab·강조, pill 상태, Pretendard.

## 화면 구성

- 요약: 누적 참여 횟수, 총 참여 시간
- 탭: 참여 예정, 참여 완료
- 예정: 이미지, 제목, 일시, 장소, 취소 capability
- 완료: 이미지, 제목, 일시, 장소, 서버 인정 참여 시간

예정 배열을 이용해 통계를 다시 계산하지 않는다. 서버가 계산한 summary를 표시한다.

## 데이터·상태

세 조회는 독립적이므로 가능한 경우 병렬 시작한다. 각 영역은 loading/error/empty를 구분하고 한 영역 실패가 전체 정보를 불필요하게 숨기지 않게 한다.

현재 BE의 예정·완료 조회는 `{ content, page }`와 `page`, `size` query를 사용한다. summary는 `participationCount`, `totalMinutes`를 반환하며, 화면은 분을 시간 형식으로만 변환한다.

## 체크리스트

- [ ] 예정·완료 empty 문구가 구분된다.
- [ ] 취소 성공 시 예정과 summary가 갱신된다.
- [ ] tab은 keyboard로 탐색 가능하다.
- [ ] 날짜·시간·인정 시간 format을 공통 유틸로 표시한다.

## 미해결 질문

- 탭 상태를 URL query에 유지할 것인가?
- 총 참여 시간의 단위·소수점·분 단위 표기 규칙은?
- 완료 목록 pagination 계약은?
