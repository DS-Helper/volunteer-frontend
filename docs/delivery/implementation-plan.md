# 프론트엔드 구현 계획

> 상태: 검증 중 · 작업 ID: FE-001  
> 요구사항: `volunteer_plan.md` §10, §11, §13  
> v1 API/Mock: 계약 확정 전에는 MSW로 화면과 상호작용을 개발하고 feature API 경계는 유지한다.  
> 디자인 기준 DS-01: 모든 단계에서 `dshelper.kr` 토큰을 재사용하고 임의의 새 디자인 시스템을 만들지 않는다.

## 단계

### 0. 기반과 문서

- [x] 요구사항 원문을 root에 배치
- [x] AGENTS 절대 규칙과 문서 라우터 정의
- [x] Metadata, 한국어 root layout, 디자인 token 정리

### 1. 공통 계약과 UI

- [x] DTO·Enum·오류 타입
- [x] 공통 API Client와 Mock 기반
- [x] Button, Field, Badge, Card, Modal, Feedback, Skeleton
- [x] loading/error/not-found

### 2. 가입 신청

- [x] 사용자 신청·수정·상태
- [x] 사진 preview와 multipart
- [x] 관리자 신청 목록·상세·승인·반려

### 3. 일정과 참여

- [x] 사용자 일정 목록·상세·URL filter
- [x] 참여·취소·업무 오류 처리
- [x] 관리자 일정 등록·수정·상태

### 4. 단원·출석·통계

- [x] 내 예정·완료·요약
- [x] 관리자 단원 목록·상세·상태
- [x] 출석 일괄 저장

### 5. 품질 게이트

- [x] lint·typecheck·unit·component
- [x] 핵심 Playwright E2E 시나리오 작성·desktop/mobile 실행
- [ ] 모바일·데스크톱·키보드·접근성
- [x] build와 문서 동기화

## 의존 조건

공통 계약의 인증, 날짜, ID, 오류 코드, pagination을 확정하기 전 Mock 가정을 실 API 사실로 표현하지 않는다. TanStack Query/SWR 선택은 한 번만 결정한다.

## 미해결 질문

- 실 API가 없는 상태에서 v1 완료 판정은 어디까지인가?
- 기존 DSHelper 공통 header·auth·UI를 가져올 수 있는가?
- 테스트 runner와 script 추가 권한이 현재 범위에 포함되는가?
