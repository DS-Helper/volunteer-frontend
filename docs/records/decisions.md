# 기술 결정 기록

> 상태: 진행 중 · 작업 ID: FE-501  
> 요구사항: `volunteer_plan.md` §2-1, §5-2, §5-4~§5-6, §10  
> v1 API/Mock: 확정되지 않은 backend 계약은 결정이 아니라 `가정`으로 표시한다.  
> 디자인 기준 DS-01: 기존 `dshelper.kr` 토큰 `#0DBA53`, `#3C3B3B`, `#F6F6F6`, Pretendard, 12px/pill radius를 기준으로 한다.

## 결정 목록

| ID | 상태 | 결정 | 근거·영향 |
| --- | --- | --- | --- |
| ADR-001 | 승인 | Next.js 16.2 App Router와 TypeScript strict | 요구사항 §2-1, 설치 버전 공식 문서 |
| ADR-002 | 승인 | Server Component 기본, interactive leaf만 Client | §5-4, client bundle 최소화 |
| ADR-003 | 승인 | `docs/README.md`만 문서 라우터 | 모든 작업을 분리 문서로 추적 |
| ADR-004 | 승인 | Cache Components는 현재 비활성 | `next.config.ts` 현 상태, previous cache model 사용 |
| ADR-005 | 임시 | Spring 미연결 시 계약 기반 MSW | UI 개발과 오류 scenario 재현 |
| ADR-006 | 승인 | DS-01 기존 브랜드 token 재사용 | 새 디자인 체계 임의 도입 방지 |
| ADR-007 | 대기 | TanStack Query 또는 SWR 단일 선택 | 복잡한 mutation 무효화 요구 |
| ADR-008 | 승인 | 사용자 API는 현재 `backend-test` BE DTO를 변환 없이 소비 가능한 경계 타입으로 맞춘다 | UUID 문자열 ID, `ResponseVo`, 204 DELETE, member page를 실제 controller/DTO로 확인. 관리자 API는 별도 결정 전 보류 |
| ADR-009 | 승인 | 관리자 일정 이미지는 2단계 업로드 후 JSON `imageFileId` 참조 | 이미지 검증·변환·저장을 일정 저장과 분리해 재시도와 이미지 재사용을 안전하게 처리한다. 업로드 응답의 `volunteerFileId`를 생성·수정 DTO에 사용한다. |
| ADR-010 | 승인 | Admin 서버 DTO를 feature API 경계에서 명시적으로 정규화 | UUID·중첩 페이지·presigned URL·문자열 목록을 화면 View Model과 분리해 서버 DTO 변경이 UI에 직접 전파되지 않게 한다. |
| ADR-011 | 승인 | 출석 상태는 DSHelper(BE) `VolunteerParticipationStatus`만 사용 | `APPLIED`를 UI의 미처리로 파생하고 `CANCELED`는 출석 대상에서 제외한다. 별도 attendance Enum·필드를 두지 않는다. |
| ADR-012 | 승인 | Netlify 최신 Next.js Runtime을 명시적 Build plugin으로 등록 | 자동 어댑터 감지가 실행되지 않아 `@netlify/plugin-nextjs` 최신 버전을 devDependency와 `netlify.toml`에 등록한다. `npm run build`, `.next`도 함께 명시해 UI 설정 누락과 정적 파일 전용 배포를 방지한다. |

## 결정 추가 형식

```text
ID / 날짜 / 상태 / 배경 / 결정 / 대안 / 영향 / 재검토 조건
```

## 체크리스트

- [ ] 코드에 영향을 주는 새 선택은 이 표에 기록한다.
- [ ] 임시 가정과 승인 결정을 구분한다.
- [ ] 폐기 시 대체 결정 ID를 연결한다.

## 미해결 질문

- ADR-007에서 어떤 Client 데이터 라이브러리를 채택할 것인가?
- 기존 DSHelper auth·UI library를 의존성으로 볼 것인가?
