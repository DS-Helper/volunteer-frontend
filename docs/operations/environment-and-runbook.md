# 환경변수와 실행 안내

> 상태: 진행 중 · 작업 ID: FE-401, FE-011, FE-012
> 요구사항: `volunteer_plan.md` §2-3, §5-18  
> v1 API/Mock: 개발 기본은 MSW 사용을 가정하되, 환경 flag 이름은 구현 시 결정하고 실 API는 `NEXT_PUBLIC_API_BASE_URL`로 전환한다.  
> 디자인 기준 DS-01: 환경에 관계없이 `#0DBA53`, `#3C3B3B`, `#F6F6F6`, Pretendard, 12px/pill radius가 동일해야 한다.

## 환경

| 환경 | Frontend | Backend 가정 |
| --- | --- | --- |
| local | `http://localhost:3000` | MSW 또는 별도 local Spring |
| production | `https://dshelper.kr` | `https://server.dshelper.kr` |

## 환경변수

```text
NEXT_PUBLIC_API_BASE_URL=https://be-test.dshelper.kr
NEXT_PUBLIC_USE_VOLUNTEER_MOCKS=false
```

이 값은 브라우저에 공개되고 build 시점에 고정된다. `.env*`는 프로젝트 root에 두고 커밋하지 않는다. 비밀키에 `NEXT_PUBLIC_`를 붙이지 않는다.

## 기본 명령

```text
npm ci
npm run dev
npm run lint
npm run typecheck
npm run test:run
npm run build
npm run start
npm run test:e2e
```

존재하지 않는 script는 현재 지원되지 않는 것으로 기록하며 임의로 성공 처리하지 않는다. Next.js 16은 Turbopack이 dev/build 기본이고 `next lint`는 제거되었다.

## Netlify 배포

> 작업 ID: FE-011 · 상태: 검증 중
> 요구사항 출처: Netlify Next.js 공식 배포 설정, 배포 사이트의 루트 404 제보

- 범위: Netlify가 Next.js 산출물을 배포 대상으로 식별하도록 build 명령과 publish 디렉터리를 저장소 설정으로 고정한다.
- 비범위: API URL, CORS, 인증 방식, Next.js 런타임 어댑터 버전 고정, 정적 export 전환.
- 완료 조건: 배포 로그가 `npm run build`와 `.next` publish 디렉터리를 사용하며, Netlify의 Next.js 자동 어댑터가 SSR/App Router 지원을 구성한다.

`netlify.toml`은 다음 설정만 보유한다.

```toml
[build]
  command = "npm run build"
  publish = ".next"
```

Next.js 16.2는 Netlify의 최신 Next.js Runtime(OpenNext 기반)이 처리한다. 이 사이트에서는 자동 감지가 실행되지 않아 공식 수동 설치 방식으로 `@netlify/plugin-nextjs`를 devDependency와 `netlify.toml` plugin으로 등록했다. 최신 버전을 사용하므로 Netlify Runtime의 App Router·SSR 처리를 활성화할 수 있다.

배포 후 Netlify의 build log에서 build command와 publish directory가 위 값으로 표시되는지 확인하고, 사이트 루트(`/`)와 App Router 경로를 각각 요청한다.

## 실 API 전환 점검

FE-012부터 실 API가 기본이다. Mock은 `NEXT_PUBLIC_USE_VOLUNTEER_MOCKS=true`를 명시한 로컬 개발·테스트에서만 사용한다. 현재 Netlify 배포는 `https://be-test.dshelper.kr`을 사용하며, 운영 전환 시 `https://server.dshelper.kr`로 변경한다.

- [ ] backend URL과 CORS allowed origin 확인
- [ ] credentials/header 인증 방식 확인
- [ ] Mock flag를 production에서 비활성화
- [ ] remote image pattern 최소 허용
- [ ] 오류 Envelope, timezone, 204 응답 확인
- [ ] production build/start와 E2E 실행

## 운영 체크리스트

- [ ] `.env*`와 개인정보 fixture가 추적되지 않는다.
- [ ] health/error 로그가 개인정보를 포함하지 않는다.
- [ ] DS-01 font·token이 production build에서 동일하다.

## 미해결 질문

- 개발·staging backend URL과 CORS origin은?
- Mock 활성화 환경변수의 최종 이름은?
- 배포 플랫폼과 runtime(Node.js 최소 20.9+)은?

