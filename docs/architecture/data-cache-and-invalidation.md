# 데이터 조회, 캐시, 무효화

> 상태: 검증 중 · 작업 ID: FE-001  
> 요구사항: `volunteer_plan.md` §5-6, §5-10~§5-12, §5-17  
> 공식 기준: Next.js 16.2 `fetching-data.md`, `caching-without-cache-components.md`  
> v1 API/Mock: fixture도 실시간 데이터는 매 요청 현재 scenario를 반환하고 mutation 뒤 관련 query를 갱신한다.  
> 디자인 기준 DS-01: 재조회 중 기존 레이아웃을 유지하고 초록 progress/disabled CTA와 `#F6F6F6` skeleton surface를 사용한다.

## 현재 캐시 모델

`next.config.ts`에 `cacheComponents`가 없으므로 Cache Components는 비활성이다. `fetch`는 기본 cache를 가정하지 않는다.

| 데이터 | 정책 |
| --- | --- |
| 소개·봉사 유형·지역 | 합의된 짧은 revalidate만 허용 |
| 현재 인원·모집 상태 | `cache: 'no-store'` |
| 내 참여·가입·출석 상태 | `cache: 'no-store'` |
| 관리자 목록·상세 | 기본 fresh, 명시적 합의 전 장기 cache 금지 |

`use cache`, `cacheLife`, `cacheTag`는 `cacheComponents: true` 결정 전 사용하지 않는다.

## v1 Query key 초안

```text
['volunteer', 'introduction']
['volunteer', 'events', filters]
['volunteer', 'event', eventId]
['volunteer', 'application', 'latest']
['volunteer', 'my', 'upcoming']
['volunteer', 'my', 'completed']
['volunteer', 'my', 'summary']
['volunteer', 'admin', resource, filters]
```

## mutation 뒤 갱신

| mutation | 무효화 대상 |
| --- | --- |
| 참여·취소 | 이벤트 목록·상세, 내 예정, 내 요약 |
| 가입 신청·수정·취소 | 최신 신청 상태 |
| 승인·반려 | 관리자 신청 목록·상세, 관련 단원 |
| 일정 생성·수정·상태 | 사용자·관리자 일정 목록·상세 |
| 출석 저장 | 참석 목록, 단원 상세, 내 완료·요약 |

## 로딩 전략

라우트 단위는 `loading.tsx`, 부분 데이터는 가까운 `Suspense`, Client mutation은 기존 화면을 유지한 pending 상태를 사용한다. 동일 요청에 불필요한 waterfall이 없도록 독립 조회를 병렬 시작한다.

## 체크리스트

- [ ] cache 정책이 각 feature API에 명시된다.
- [ ] mutation별 query 무효화 테스트가 있다.
- [ ] stale 데이터로 업무 버튼을 최종 판단하지 않는다.
- [ ] 빈 상태와 로딩 상태가 혼동되지 않는다.

## 미해결 질문

- Client 데이터 라이브러리는 TanStack Query와 SWR 중 무엇인가?
- 소개·분류 데이터의 허용 revalidate 시간은 얼마인가?
- Spring 응답에 ETag/Last-Modified를 사용할 계획이 있는가?
