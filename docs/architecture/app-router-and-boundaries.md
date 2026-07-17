# App Router 구조와 Server/Client 경계

> 상태: 검증 중 · 작업 ID: FE-001  
> 요구사항: `volunteer_plan.md` §2-1, §5-2, §5-4, §5-17  
> 공식 기준: `node_modules/next/dist/docs/01-app/01-getting-started/02-project-structure.md`, `03-layouts-and-pages.md`, `05-server-and-client-components.md`  
> v1 API/Mock: Server 페이지는 feature API를 호출하고, Client 상호작용은 동일 API 계층의 MSW 응답을 사용한다.  
> 디자인 기준 DS-01: 공통 shell은 Pretendard와 지정 토큰을 사용하고 interactive leaf만 Client Component로 둔다.

## 목표 구조

```text
src/app                 # 라우트와 Next.js 특수 파일
src/features/volunteer  # 기능 API·타입·스키마·UI·훅
src/components          # 실제 공용 UI
src/lib                 # API·auth·date·error 인프라
```

Route Group `(public)`, `(user)`는 URL을 바꾸지 않는다. `admin`은 명시적인 URL segment다.

## Server Component 기본 대상

- 소개, 일정 최초 목록·상세, 내 봉사활동 최초 데이터
- 관리자 신청·단원·일정 최초 목록·상세
- Metadata 생성과 서버 전용 API 호출

## Client Component 최소 대상

- React Hook Form, 파일 미리보기, 필터·검색 상호작용
- 참여·취소·승인·반려 버튼, 확인 모달, 토스트
- 출석 체크와 일괄 저장, Query Provider

Client props는 JSON 직렬화 가능한 최소 View Model만 전달한다. 서버 전용 환경변수와 관리자 내부 데이터가 Client module graph에 들어가지 않게 한다.

## Next.js 16 규칙

- `params`, `searchParams`, `cookies()`, `headers()`는 비동기 접근한다.
- 내부 이동은 `next/link`를 우선한다.
- `error.tsx`는 Client Component이며 `unstable_retry()`를 우선한다.
- `middleware.ts` 대신 필요 시 `proxy.ts`를 사용하되 최종 인증 수단으로 보지 않는다.
- Server Component는 내부 Route Handler가 아니라 Spring API 원본을 직접 호출한다.

## 체크리스트

- [ ] `page.tsx`에 반복 fetch·대형 상호작용 로직이 없다.
- [ ] `'use client'` 경계가 leaf에 가깝다.
- [ ] 동적 라우트 props가 Promise로 타입화된다.
- [ ] loading/error/not-found 경계가 의도한 segment에 배치된다.

## 미해결 질문

- Query Provider를 전체 앱에 둘지 봉사단 route group에만 둘지?
- 관리자·사용자 공통 header/layout의 기존 프로젝트 컴포넌트 재사용 범위는?
