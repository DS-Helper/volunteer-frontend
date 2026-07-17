# DSHelper 봉사단 프론트엔드 절대 규칙

## 적용 범위와 기준

이 문서는 저장소 전체에 적용한다. 명시적인 사용자 요청, 루트의 `volunteer_plan.md`, 현재 프로젝트 코드와 설정을 순서대로 확인해 작업한다.

1. 모든 답변과 구현 판단은 공식 문서를 기준으로 한다.
2. Next.js 작업 전 설치된 버전과 일치하는 `node_modules/next/dist/docs/`의 관련 문서를 먼저 읽는다.
3. 외부 확인이 필요하면 Next.js, React, TypeScript 및 사용 라이브러리의 공식 문서만 사용한다.
4. 현재 코드, 설정, 작업 트리 상태를 먼저 조사하고 기존 사용자 변경을 보존한다.
5. 요청하지 않은 기능, 리팩터링, 의존성, 디자인, 설정은 임의로 변경하지 않는다.
6. 요구사항이나 API 계약이 불분명하면 확정될 때까지 질문한다. 추측한 계약을 영구 코드에 고정하지 않는다.
7. 모든 텍스트 파일은 UTF-8로 유지한다. 한글 파일을 다른 인코딩으로 전체 재작성하지 않는다.
8. `volunteer_plan.md`는 요구사항 원문이다. 사용자가 요청하지 않는 한 수정하지 않는다.

## 프로젝트 고정 기준

- Next.js `16.2.x`, React `19.2.x`, TypeScript 5 strict mode
- App Router와 `src/app`
- Tailwind CSS 4, ESLint flat config, React Compiler
- npm과 `package-lock.json`
- 경로 별칭 `@/*` → `./src/*`
- 사용자 화면 기준 언어 한국어, 기본 디자인 기준 `#0DBA53`, `#3C3B3B`, `#F6F6F6`, Pretendard, 12px 및 pill radius

버전이나 프레임워크 방식을 변경하려면 명시적인 요구사항과 결정 기록이 있어야 한다. 새 애플리케이션 소스는 `.ts` 또는 `.tsx`로 작성한다.

## 문서 주도 작업

1. `docs/README.md`를 유일한 문서 라우터로 사용한다. 하위 폴더에 추가 라우터를 만들지 않는다.
2. 구현 전 관련 `docs/features/*.md` 또는 아키텍처 문서에 범위와 완료 조건을 기록한다.
3. 새 문서를 만들면 같은 변경에서 `docs/README.md`에 연결한다. 연결되지 않은 고립 문서를 금지한다.
4. 하나의 거대한 문서에 모든 기능을 합치지 않는다.
5. 각 작업은 작업 ID, 상태, 요구사항 출처, 범위, 비범위, 완료 조건, 검증, 미해결 사항을 기록한다.
6. 기술 선택과 계약 변경은 `docs/records/decisions.md`, 코드 변경은 `change-log.md`, 실제 검증은 `verification-log.md`에 기록한다.
7. 코드와 문서가 일치하지 않으면 작업은 완료가 아니다.

## 소스 구조와 의존 방향

- `src/app`: 라우트, 레이아웃, 메타데이터, `loading`, `error`, `not-found` 등 App Router 진입점
- `src/features/volunteer`: 봉사단 기능의 API, 컴포넌트, 훅, 스키마, 타입, 유틸리티
- `src/components`: 둘 이상의 기능이 실제로 공유하는 UI
- `src/lib`: API Client, 인증 경계, 날짜, 오류 등 인프라
- `public`: 정적 공개 자산

`page.tsx`와 `layout.tsx`는 조합과 데이터 전달에 집중한다. 기능 로직과 반복 API 코드를 라우트 파일에 누적하지 않는다. Next.js 특수 파일의 default export를 제외한 재사용 모듈은 named export를 기본으로 한다. Server/Client 경계를 섞는 wildcard barrel export를 만들지 않는다.

## App Router 절대 규칙

1. Pages Router와 `src/pages`를 새로 만들지 않는다.
2. 페이지와 레이아웃은 기본적으로 Server Component로 유지한다.
3. 상태, 이벤트, Effect, 커스텀 훅, 브라우저 API가 필요한 가장 작은 leaf component에만 `'use client'`를 선언한다.
4. `'use client'`는 import보다 위의 첫 지시문이어야 한다.
5. Client Component에 전달하는 props는 React가 직렬화할 수 있는 최소 DTO여야 한다.
6. Client Component를 async component로 선언하지 않는다.
7. `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()`는 반드시 `await`한다. Next.js 16에서 동기 접근은 금지한다.
8. 라우트 props는 가능하면 생성된 `PageProps<'/...'>`, `LayoutProps<'/...'>`, `RouteContext<'/...'>`를 사용한다.
9. 내부 이동은 `next/link`가 기본이며, 명령형 이동이 필요한 경우에만 `useRouter`를 사용한다.
10. Route Group 이름은 URL에 포함되지 않는다는 전제에서 `(public)`, `(user)` 등을 사용한다.
11. 루트 레이아웃은 `html`, `body`를 포함하고 `lang="ko"`를 사용한다.
12. 페이지마다 고유하고 설명적인 Metadata title을 제공한다.
13. `loading.tsx`는 의미 있는 스켈레톤을 제공한다.
14. `error.tsx`는 Client Component로 만들고 Next.js 16.2 문서에 따라 `unstable_retry()`를 우선 사용한다.
15. 존재하지 않는 리소스는 `notFound()`와 `not-found.tsx`로 처리한다.
16. `middleware.ts`를 새로 만들지 않는다. 필요한 경우 공식 문서를 확인한 뒤 `proxy.ts`를 사용한다.
17. Proxy에서 느린 데이터 조회나 최종 인증·인가를 수행하지 않는다.
18. 불안정 API는 요구사항과 버전 일치 공식 문서 근거가 없는 한 사용하지 않는다.

## API와 데이터 흐름

다음 의존 방향을 지킨다.

```text
Route 또는 Component
→ Feature Hook
→ Feature API 함수
→ 공통 API Client
→ Spring Boot API 또는 개발용 MSW
```

- 컴포넌트에서 API base URL과 공통 fetch 옵션을 반복 작성하지 않는다.
- Server Component는 Spring Boot API를 직접 호출한다. 같은 Next.js 애플리케이션의 Route Handler를 HTTP로 다시 호출하지 않는다.
- Route Handler는 공개 HTTP 엔드포인트라는 전제로 설계한다.
- 공통 API Client는 `response.ok`, 공통 응답 Envelope, 빈 응답, 네트워크 오류를 일관되게 처리한다.
- 예상 가능한 API 오류는 typed result 또는 `ApiError` 코드로 UI에 전달한다. 메시지 문자열 비교로 분기하지 않는다.
- Spring Boot Enum 문자열과 프론트 타입 이름을 정확히 일치시키고 한글 라벨은 별도 `as const` 매핑으로 관리한다.
- React Hook Form과 Zod를 사용할 때 폼 입력 타입과 제출 DTO를 구분한다.
- TanStack Query와 SWR를 동시에 도입하지 않는다. 선택이 확정되지 않았으면 구현 전에 결정한다.
- Mock은 실제 계약을 대체하지 않는다. 현재 mock 가정은 문서화하고 실 API 확정 시 한 곳에서 교체 가능하게 격리한다.

## 업무 규칙의 신뢰 경계

프론트엔드는 사용자 경험을 위한 사전 검증만 수행한다. 다음 항목을 최종 판단하지 않는다.

- 모집 정원, 가입 승인 가능 여부, 참여 시간 중복, 취소 가능 시간
- 출석 처리 가능 여부, 사용자·관리자 권한, 상태 전이
- 누적 참여 횟수와 총 참여 시간

버튼 노출과 활성화는 서버의 `capabilities`를 우선한다. 브라우저 시간, 현재 인원, 숨겨진 메뉴만으로 업무 또는 권한을 확정하지 않는다.

## 캐시와 무효화

현재 `next.config.ts`에는 `cacheComponents`가 활성화되어 있지 않다.

- `fetch`가 자동으로 캐시된다고 가정하지 않는다.
- 현재 인원, 모집 상태, 내 참여 상태, 가입 상태, 출석 상태는 `cache: 'no-store'`를 명시한다.
- 안정적인 데이터만 문서화된 revalidate 정책으로 캐시한다.
- `use cache`, `cacheLife`, `cacheTag`는 `cacheComponents: true`를 명시적으로 결정하기 전 사용하지 않는다.
- 참여·취소·승인·반려·상태 변경 후 영향받는 목록, 상세, 요약 Query를 모두 무효화한다.
- 독립 요청은 가능한 경우 병렬로 시작해 불필요한 waterfall을 만들지 않는다.
- 느리거나 uncached인 Server Component 데이터는 적절한 `loading.tsx` 또는 가까운 `Suspense` 경계로 스트리밍한다.

## TypeScript 절대 규칙

1. `strict`를 낮추거나 `ignoreBuildErrors`를 활성화하지 않는다.
2. 명시적 `any`, `@ts-ignore`, 근거 없는 type assertion을 금지한다.
3. 불명확한 외부 값은 `unknown`으로 받고 런타임 검증 후 좁힌다.
4. `@ts-expect-error`가 불가피하면 이유와 추적 가능한 작업 ID를 바로 옆에 기록한다.
5. API DTO, 도메인 타입, UI View Model을 필요에 따라 분리한다.
6. 동일한 상태 union과 DTO를 중복 선언하지 않는다.
7. Client Component props는 필요한 필드만 명시한다.
8. `next-env.d.ts`를 직접 편집하지 않는다. custom declaration은 별도 `.d.ts` 파일에 둔다.

## React와 컴포넌트

- Hooks 규칙을 지키고 Effect를 렌더링 중 파생 가능한 상태 계산에 사용하지 않는다.
- React Compiler가 활성화되어 있으므로 근거 없는 `useMemo`, `useCallback`, `memo`를 추가하지 않는다.
- Provider는 필요한 범위의 가장 깊은 위치에 둔다.
- form, button, label 등 의미 있는 네이티브 요소를 우선한다.
- 중복 제출을 막고 pending 상태를 사용자에게 표시한다.
- 예상 오류는 렌더링 가능한 상태로 다루고 예상하지 못한 오류만 Error Boundary로 보낸다.
- 개인정보나 내부 오류 상세를 `console` 또는 사용자 화면에 노출하지 않는다.

## 스타일, 이미지, 접근성

- Tailwind CSS 4를 기본 스타일 방식으로 사용한다.
- `globals.css`에는 reset, token, base 등 전역 규칙만 둔다.
- Tailwind로 표현하기 어려운 컴포넌트 한정 스타일만 CSS Module을 사용한다.
- 구현 화면은 기존 `dshelper.kr`의 시각 언어를 우선한다. 기본 토큰은 초록 `#0DBA53`, 본문 `#3C3B3B`, 배경 `#F6F6F6`, Pretendard, 12px 및 pill radius다.
- 임의의 새 브랜드 컬러, 폰트, 그림자 체계는 추가하지 않는다.
- 내부 이미지와 원격 이미지는 원칙적으로 `next/image`를 사용한다.
- 원격 이미지는 최소 범위의 `remotePatterns`만 허용한다. deprecated `images.domains`와 Image의 `priority` prop을 사용하지 않는다.
- 의미 있는 이미지는 대체 텍스트를 제공하고 장식 이미지는 `alt=""`를 사용한다.
- 모든 입력은 연결된 label, 오류 설명, 키보드 접근성을 제공한다.
- 모달은 초점 이동, Escape, 초점 복귀를 처리한다.
- 동적 완료·오류 메시지는 필요한 경우 `aria-live`를 사용한다.
- 모바일과 데스크톱을 모두 검증하고 애니메이션은 `prefers-reduced-motion`을 존중한다.

## 보안과 개인정보

1. `.env*` 비밀 파일을 커밋하지 않는다.
2. `NEXT_PUBLIC_`에는 브라우저 공개가 안전한 값만 둔다. 이 값은 build 시점에 번들에 고정됨을 고려한다.
3. 서버 전용 모듈은 필요 시 `import 'server-only'`로 경계를 표시한다.
4. Client Component에 전체 사용자·관리자 객체를 전달하지 않는다.
5. 관리자 메모와 비공개 개인정보를 받은 뒤 화면에서만 숨기는 구현을 금지한다.
6. route param, search param, FormData, API 응답은 신뢰하지 않고 검증한다.
7. 메뉴 숨김, 레이아웃 redirect, Proxy 검사만으로 권한 처리가 완료되었다고 판단하지 않는다.
8. 파일 확장자·MIME·크기 브라우저 검사는 사용자 편의일 뿐 서버 검증을 대체하지 않는다.
9. 토큰, 쿠키, 개인정보, 원본 사진 경로를 로그에 남기지 않는다.

## 의존성, 생성 파일, 인코딩

- npm만 사용하고 의존성 변경 시 `package.json`과 `package-lock.json`을 함께 갱신한다.
- 요구사항에 필요하지 않은 패키지를 추가하거나 버전을 올리지 않는다.
- 동일 목적의 라이브러리를 중복 도입하지 않는다.
- `node_modules`, `.next`, 빌드 결과물을 직접 수정하거나 커밋하지 않는다.
- `next.config.ts`는 `NextConfig` 타입을 유지한다.
- Next.js 16에서는 제거된 `next lint`를 사용하지 않는다.
- Markdown과 소스의 한글을 UTF-8로 저장하고 변경 후 깨짐 여부를 확인한다.

## 테스트와 검증

변경 범위와 존재하는 스크립트에 따라 다음을 독립적으로 실행한다.

```text
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run test:e2e
```

- 존재하지 않는 스크립트는 통과 처리하지 않고 문서에 미실행 사유를 기록한다.
- Next.js 16의 `next build`는 lint를 실행하지 않으므로 lint를 별도로 실행한다.
- Vitest는 순수 함수, Zod 스키마, 동기·Client Component에 사용한다.
- async Server Component는 Playwright E2E로 검증한다.
- MSW handler는 실제 API Envelope, Enum, 오류 코드를 그대로 모방한다.
- 테스트 쿼리는 role, label, accessible name을 우선한다.
- 실행하지 않은 검증을 통과했다고 보고하지 않는다.

## 완료 보고

완료 보고에는 구현 범위, 변경 파일, 갱신 문서, 실제 통과한 검증, 남은 미해결 사항만 정확히 포함한다. 요청 범위 밖 개선은 구현하지 않고 제안으로만 남긴다.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
