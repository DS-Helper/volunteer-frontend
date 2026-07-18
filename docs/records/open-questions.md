# 미해결 질문과 가정

> 상태: 진행 중 · 작업 ID: FE-504  
> 요구사항: `volunteer_plan.md` §4, §5, §8, §10  
> v1 API/Mock: 아래 미확정 항목은 Mock 가정이며 실 계약으로 주장하지 않는다.  
> 디자인 기준 DS-01: 디자인 미확정 동안 `#0DBA53`, `#3C3B3B`, `#F6F6F6`, Pretendard, 12px/pill radius를 사용한다.

## 차단 가능 질문

| ID | 분야 | 질문 | 현재 가정 | 영향 | 상태 |
| --- | --- | --- | --- | --- | --- |
| Q-001 | 인증 | cookie인가 bearer token인가? | 기존 로그인 사용자 fixture | 모든 API | 미확정 |
| Q-002 | 권한 | 관리자 role/capability 조회 방법은? | 관리자 scenario fixture | admin route | 미확정 |
| Q-003 | 데이터 | 날짜 timezone·ISO 형식은? | Asia/Seoul ISO 문자열 | 폼·표시 | 미확정 |
| Q-004 | 응답 | DELETE 성공이 204인가 Envelope인가? | `{ data: null }` | API Client | 미확정 |
| Q-005 | 이미지 | event/photo host와 인증 방식은? | local placeholder | Image config | 미확정 |
| Q-006 | 상태 | TanStack Query 또는 SWR? | TanStack Query 단일 사용 | Client data | 해소 · D-002 |
| Q-007 | 범위 | v1 완료가 Mock UI인지 실 API인지? | 실 API client + 계약 기반 Mock fallback | 완료 판정 | v1 결정 |
| Q-008 | 디자인 | 기존 header·asset·정확한 Pretendard source는? | 기존 logo와 실제 계산 style 기반 DS-01 | 전 화면 | v1 해소 |

## 가정 처리 규칙

1. 가정은 feature 문서와 Mock에 같은 ID로 표시한다.
2. 사용자 또는 backend 확인 전 영구 계약으로 고정하지 않는다.
3. 답변이 오면 관련 architecture, feature, decision 문서를 함께 갱신한다.

## 체크리스트

- [ ] 질문마다 영향 범위와 임시 가정이 있다.
- [ ] 해소된 질문은 결정 ID와 날짜를 남긴다.
- [ ] 차단 질문을 숨긴 채 완료 처리하지 않는다.

## 추가 확인 필요

- API schema/OpenAPI 문서를 제공받을 수 있는가?
- `dshelper.kr` 기존 component/token source를 프로젝트에서 재사용할 수 있는가?
