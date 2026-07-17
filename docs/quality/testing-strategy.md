# 테스트 전략

> 상태: 검증 중 · 작업 ID: FE-301  
> 요구사항: `volunteer_plan.md` §5-19, §11, §13  
> 공식 기준: Next.js 16.2 `testing/vitest.md`, `testing/playwright.md`  
> v1 API/Mock: MSW가 정상·빈 상태·권한·업무 오류·네트워크 오류를 같은 계약으로 제공한다.  
> 디자인 기준 DS-01: 테스트는 `#0DBA53` CTA 색보다 role·label·accessible name과 12px/pill UI의 상태 의미를 우선 검증한다.

## 도구별 책임

| 도구 | 대상 |
| --- | --- |
| Vitest | Zod schema, status/error mapping, date utility, query invalidation |
| Testing Library | 동기·Client Component, form, modal, filter, attendance interaction |
| MSW | Spring API 계약, field error, 업무 오류, empty/network scenario |
| Playwright | async Server Component와 실제 route 기반 핵심 사용자 흐름 |

Vitest는 async Server Component를 직접 지원하지 않으므로 해당 화면은 Playwright로 검증한다.

## 필수 단위·컴포넌트 시나리오

- 상태별 버튼과 `capabilities`
- 오류 코드별 UI와 field error 연결
- Zod 신청·일정 검증, 사진 preview 정리
- 일정 filter URL 유지, modal focus, 출석 선택
- query mutation 뒤 무효화 대상

## 핵심 E2E

1. 로그인 상태 → 가입 신청 → 상태 확인
2. 일정 filter → 상세 → 참여 → 취소
3. 관리자 신청 승인·반려
4. 관리자 일정 등록·수정
5. 출석 저장 → 사용자 완료·요약 확인

## 실행 게이트

```text
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
```

Next.js 16의 build는 lint를 실행하지 않으므로 별도 결과가 필요하다.

## 체크리스트

- [ ] Mock handler와 DTO가 한 타입을 공유한다.
- [ ] 테스트는 실제 role·label 중심으로 조회한다.
- [ ] async Server route는 E2E가 있다.
- [ ] 미실행 검증과 이유를 기록한다.

## 미해결 질문

- 테스트 script 이름과 coverage 최소 기준은?
- Playwright browser matrix를 Chromium만 사용할지 3종 모두 사용할지?
- 인증 상태 fixture를 기존 로그인과 어떻게 통합할지?
