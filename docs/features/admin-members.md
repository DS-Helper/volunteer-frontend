# 관리자 봉사단원 관리

> 상태: 검증 중 · 작업 ID: FE-202  
> 요구사항: `volunteer_plan.md` §5-14  
> v1 API/Mock: members 목록·상세와 suspend/activate/withdraw endpoint, 영향도 안내용 예정 건수 fixture를 사용한다.  
> 디자인 기준 DS-01: 흰 12px table/card, `#0DBA53` active/primary, 상태 pill, 위험 액션은 텍스트·아이콘을 병기하고 `#3C3B3B` 정보 계층을 유지한다.

## 목록·상세

목록은 이름, 성별, 연락처, 가입일, 상태, 서버 통계를 표시한다. 상세는 기본·신청 정보, 예정 일정, 출석/불참/취소, 통계, 관리자 메모, 상태 변경 이력을 표시한다.

## FE-010 — 단원 상세 실계약

Admin은 목록용 최소 DTO와 별도로 상세 DTO를 반환한다. 상세 DTO에는 서버가 집계한 누적 통계, 가입 신청, 참여 상태별 이력, 상태 변경 이력, capability를 포함한다. 상태 변경 endpoint도 같은 상세 DTO를 반환한다.

## 상태 변경

`ACTIVE`, `SUSPENDED`, `WITHDRAWN` 전환은 서버 capability와 endpoint를 따른다. 활동정지·탈퇴 modal에는 예정 일정 등 영향도를 표시하되 프론트가 변경 가능성을 최종 판단하지 않는다.

## 개인정보

목록에는 필요한 최소 필드만 두고 상세 개인정보와 관리자 메모를 Client 범위에 과도하게 전달하지 않는다. 전화번호 등은 로그하지 않는다.

## 체크리스트

- [ ] 목록·상세·empty/error/loading이 있다.
- [ ] 상태 label과 API Enum을 분리한다.
- [ ] 상태 변경 modal에 영향도가 있다.
- [ ] mutation 뒤 목록·상세를 갱신한다.
- [ ] 통계를 프론트에서 재계산하지 않는다.

## 미해결 질문

- 목록 검색·filter endpoint parameter는?
- 탈퇴가 비가역 상태인지 재활성화 가능한지?
- 상태 변경 영향도 필드의 최종 DTO는?
