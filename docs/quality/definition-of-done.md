# 완료 정의

> 상태: 진행 중 · 작업 ID: FE-303  
> 요구사항: `volunteer_plan.md` §13  
> v1 API/Mock: Mock 완료는 실 API 완료와 다르며, 문서와 완료 보고에 연결 상태를 명시한다.  
> 디자인 기준 DS-01: `dshelper.kr` 토큰 `#0DBA53`, `#3C3B3B`, `#F6F6F6`, Pretendard, 12px/pill radius의 일관성도 완료 조건이다.

## 기능 완료

- [ ] 요구사항 절과 feature 문서가 연결된다.
- [ ] 정상·loading·error·empty·권한 상태가 있다.
- [ ] 폼 사전 검증과 중복 제출 방지가 있다.
- [ ] 서버 error code와 `capabilities`를 사용한다.
- [ ] 개인정보와 관리자 내부 데이터가 최소화된다.

## 기술 완료

- [ ] Server/Client 경계와 async request API가 Next.js 16.2에 맞다.
- [ ] cache·query invalidation 정책이 기록된다.
- [ ] TypeScript strict 오류와 lint 오류가 없다.
- [ ] deprecated API를 사용하지 않는다.
- [ ] 관련 단위·컴포넌트·E2E가 통과한다.

## UX 완료

- [ ] DS-01 token과 responsive layout이 일관된다.
- [ ] keyboard, focus, label, alt, live message를 확인한다.
- [ ] 모바일·데스크톱에서 주요 흐름이 동작한다.

## 문서 완료

- [ ] `current-status`, feature 문서, change log가 코드와 일치한다.
- [ ] 실제 명령과 결과가 verification log에 있다.
- [ ] 남은 가정은 open questions에 있다.

## 미해결 질문

- Mock 기반 화면을 `완료`로 표시할지 `실 API 대기`로 표시할지?
- 접근성 수동 검증 담당자와 지원 browser 범위는?

