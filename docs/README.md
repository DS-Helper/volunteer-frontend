# DSHelper 봉사단 프론트엔드 문서 라우터

> 상태: 검증 중 · 작업 ID: FE-001 · 마지막 기준일: 2026-07-12  
> 요구사항: `volunteer_plan.md` 전체, 특히 §5, §10, §13  
> v1 API/Mock: Spring Boot 미연결 단계에는 동일 계약의 MSW fixture를 사용하며, 실 API 확정 전 가정은 각 기능 문서에 표시한다.  
> 디자인 기준 DS-01: `dshelper.kr` 시각 언어, `#0DBA53`, `#3C3B3B`, `#F6F6F6`, Pretendard, 기본 12px·상태/CTA pill radius.

이 파일은 프로젝트 문서의 **유일한 오케스트레이션 라우터**다. 모든 작업 문서는 아래 표에서 연결하며 하위 폴더에 별도 `README.md`를 만들지 않는다.

## 기준과 우선순위

1. `volunteer_plan.md`: 제품·업무 요구사항 원문
2. `AGENTS.md`: 구현·검증 절대 규칙
3. 현재 코드와 설치 버전 일치 공식 문서: `node_modules/next/dist/docs/`
4. `docs/architecture/*`: 확정된 프론트 구조와 계약
5. `docs/features/*`: 기능별 구현·검증 기록
6. `docs/records/*`: 결정, 변경, 검증, 미해결 사항

## 상태 정의

| 상태 | 의미 |
| --- | --- |
| 예정 | 범위만 등록됨 |
| 진행 중 | 코드 또는 문서 작업 중 |
| 차단 | 사용자·백엔드·외부 계약 결정이 필요함 |
| 검증 중 | 구현 후 자동·수동 검증 중 |
| 완료 | 코드, 문서, 검증이 모두 완료됨 |

## 문서 라우팅

### 아키텍처

| 문서 | 상태 | 갱신 시점 |
| --- | --- | --- |
| [프로젝트 범위](architecture/project-scope.md) | 검증 중 | 책임·비책임·범위 변경 |
| [App Router와 경계](architecture/app-router-and-boundaries.md) | 검증 중 | 디렉터리·Server/Client 경계 변경 |
| [라우트 맵](architecture/routes.md) | 검증 중 | URL·특수 파일·메타데이터 변경 |
| [API 계약과 오류](architecture/api-contract-and-errors.md) | 진행 중 | DTO·Enum·오류·endpoint 변경 |
| [데이터·캐시·무효화](architecture/data-cache-and-invalidation.md) | 검증 중 | 캐시·Query key·재조회 변경 |
| [보안과 개인정보](architecture/security-and-privacy.md) | 검증 중 | 인증·권한·개인정보 변경 |

### 전달 계획

| 문서 | 상태 | 갱신 시점 |
| --- | --- | --- |
| [구현 계획](delivery/implementation-plan.md) | 검증 중 | 단계·의존성·완료 게이트 변경 |
| [현재 상태](delivery/current-status.md) | 검증 중 | 작업 시작·완료·차단 발생 |

### 기능

| 문서 | 라우트 | 상태 |
| --- | --- | --- |
| [봉사단 소개](features/volunteer-introduction.md) | `/volunteer` | 진행 중 |
| [가입 신청](features/volunteer-application.md) | `/volunteer/application*` | 진행 중 |
| [봉사 일정](features/volunteer-events.md) | `/volunteer/events*` | 진행 중 |
| [참여 신청·취소](features/volunteer-participation.md) | 일정 목록·상세 내 액션 | 진행 중 |
| [내 봉사활동](features/my-volunteering.md) | `/volunteer/my` | 진행 중 |
| [관리자 가입 신청](features/admin-applications.md) | `/admin/volunteer/applications*` | 검증 중 |
| [관리자 단원](features/admin-members.md) | `/admin/volunteer/members*` | 검증 중 |
| [관리자 일정](features/admin-events.md) | `/admin/volunteer/events*` | 검증 중 |
| [관리자 출석](features/admin-attendance.md) | `/admin/volunteer/events/[id]/attendance` | 검증 중 |

### 품질·운영·기록

| 문서 | 상태 | 목적 |
| --- | --- | --- |
| [테스트 전략](quality/testing-strategy.md) | 진행 중 | Vitest·MSW·Playwright 범위 |
| [접근성·반응형](quality/accessibility-and-responsive.md) | 예정 | WCAG·키보드·viewport 기준 |
| [완료 정의](quality/definition-of-done.md) | 진행 중 | 공통 완료 게이트 |
| [환경·실행 안내](operations/environment-and-runbook.md) | 진행 중 | 환경변수·명령·배포 가정 |
| [결정 기록](records/decisions.md) | 진행 중 | ADR-lite 기술 결정 |
| [변경 기록](records/change-log.md) | 진행 중 | 작업별 변경 요약 |
| [검증 기록](records/verification-log.md) | 진행 중 | 실제 명령과 결과 |
| [미해결 질문](records/open-questions.md) | 진행 중 | 사용자·백엔드 확인 필요 항목 |

## 현재 작업

| 작업 ID | 범위 | 상태 | 문서 | 차단 사항 |
| --- | --- | --- | --- | --- |
| FE-001 | 프로젝트 기반·문서·v1 화면 | 검증 중 | 구현 계획 및 각 기능 문서 | 실 Spring 계약, 실제 Playwright 브라우저 |
| FE-006 | BE volunteer 사용자 API 계약 정합화 | 진행 중 | API 계약 및 사용자 기능 문서 | 관리자 API는 사용자 요청으로 보류 |
| FE-007 | 관리자 일정 이미지 2단계 업로드 계약 | 완료 | 관리자 일정 및 API 계약 문서 | 임시 업로드 정리 정책 |
| FE-008 | Admin API 실계약 정합화 | 진행 중 | API 계약 및 관리자 기능 문서 | 기존 이력 모델 범위 |
| FE-009 | 출석 Enum 단일화 | 완료 | 관리자 출석 문서 | 없음 |
| FE-010 | 단원 상세 및 검색 계약 정합화 | 완료 | 관리자 단원 및 API 계약 문서 | 없음 |

## 작업 기록 절차

- [ ] 작업 ID와 관련 문서를 정한다.
- [ ] 구현 전에 요구사항 절, 범위, 비범위, 완료 조건을 기록한다.
- [ ] Mock은 실제 응답 Envelope·Enum·오류 코드를 따라 격리한다.
- [ ] 구현 후 `current-status`, `change-log`, `verification-log`를 갱신한다.
- [ ] 실행하지 않은 검증을 통과로 기록하지 않는다.
- [ ] 새 문서는 이 라우터에 연결한다.

## 미해결 질문

- 인증 쿠키/토큰 전달 방식과 관리자 권한 조회 API가 확정되었는가?
- TanStack Query를 v1 표준으로 확정했으며 SWR는 도입하지 않았다.
- v1은 계약 기반 Mock fallback과 실 API client를 함께 제공하며, Spring Boot 실제 계약 검증은 후속 연동 작업이다.
