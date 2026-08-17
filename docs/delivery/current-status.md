# 현재 작업 상태

> 상태: 검증 중 · 작업 ID: FE-021
> 기준: 실제 코드·문서·검증 로그를 우선한다.
> 디자인 기준 DS-01: `#0DBA53`, `#3C3B3B`, `#F6F6F6`, Pretendard, 12px/pill radius.

## 현황

| 영역 | 상태 | 완료 | 다음 작업 | 차단 |
| --- | --- | --- | --- | --- |
| 프로젝트 scaffold | 완료 | Next 16.3.1 TS App Router·Prisma 7 설정 | 설정 보존 | 없음 |
| 요구사항·문서 | 완료 | 원문·규칙·라우터·기능 문서 | 실 계약 시 갱신 | 없음 |
| 공통 API/Mock | 검증 중 | 사용자 ResponseVo·UUID·page·204 경계 반영 | 실 API별 장애 원인 확인 | 백엔드 환경 |
| 사용자 기능 | 검증 중 | 소개·신청·상태·일정·참여·내 활동 사용자 계약 정합화 | 실제 API 연동 | Spring API |
| 관리자 기능 | 검증 중 | 일정 이미지 2단계 업로드·관리자 E2E 하네스 | 실제 관리자 API 응답 검증 | 관리자 BE 500/토큰 발급 API |
| 품질 | 완료 | lint·typecheck·Vitest·build, Playwright desktop/mobile 8개 통과 | 실 Spring contract smoke | Spring API |
| 독립 플랫폼 전환 | 진행 중 | 독립 DB schema·JWT auth·사용자/관리자 핵심 Route Handler·동일 origin 전환 | 파일 영구 storage·운영 DB 통합·운영 재배포 | FE-031 |
| 독립 인증 | 진행 중 | register/login/refresh/logout Route Handler·Prisma schema·JWT primitive·초기 migration | 운영 DB 적용·통합 테스트 | DATABASE_URL/배포 런타임 |

## 이번 작업 체크리스트

- [x] `volunteer_plan.md` root 존재 확인
- [x] `AGENTS.md` Next.js 관리 블록 보존
- [x] 단일 문서 라우터 구성
- [x] 코드 구현 상태를 실제 파일 기준으로 재동기화
- [x] lint·typecheck·build·Vitest 결과 기록
- [x] Playwright 실제 Chromium 실행과 모바일·데스크톱 핵심 경로 확인
- [x] 문서 라우터 고립 문서 검사(`npm run docs:check`) 추가

## 상태 갱신 규칙

완료 표시 전 관련 feature 문서 체크리스트와 `records/verification-log.md`에 실제 결과가 있어야 한다. 다른 작업자가 작성 중인 코드를 추측해 완료 처리하지 않는다.

## 미해결 질문

- 관리자 백엔드 목록 API가 정상화되면 실제 mutation E2E를 실행한다.
- 임시 관리자 토큰 API(`/test/temp-token`)의 배포 500 원인을 백엔드에서 확인한다.
- 독립 플랫폼 전환은 [구현 작업 계획](independent-platform-implementation-plan.md)의 FE-031 단계로 관리한다.
