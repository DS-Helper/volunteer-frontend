# 환경변수와 실행 안내

> 상태: 진행 중 · 작업 ID: FE-401, FE-011, FE-012
> 요구사항: `volunteer_plan.md` §2-3, §5-18  
> 독립 플랫폼: 브라우저·서버 모두 Next.js 내부 `/api` Route Handler를 사용하며 기존 Spring API URL은 사용하지 않는다.
> 디자인 기준 DS-01: 환경에 관계없이 `#0DBA53`, `#3C3B3B`, `#F6F6F6`, Pretendard, 12px/pill radius가 동일해야 한다.

## 환경

| 환경 | Frontend | Backend 가정 |
| --- | --- | --- |
| local | `http://localhost:3000` | 동일 Next.js Route Handler + PostgreSQL |
| production | `https://volunteer.dshelper.kr` | 동일 Next.js Route Handler + PostgreSQL |

## 환경변수

```text
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_USE_VOLUNTEER_MOCKS=false
DATABASE_URL=postgresql://...
AUTH_JWT_SECRET=32자 이상의 운영 비밀키
FILE_STORAGE_MODE=s3
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

로컬 PostgreSQL 통합 검증은 다음 순서로 실행한다.

```text
docker compose -f docker-compose.postgres.yml up -d
DATABASE_URL=postgresql://volunteer:volunteer@localhost:5432/volunteer npm run db:migrate:deploy
DATABASE_URL=postgresql://volunteer:volunteer@localhost:5432/volunteer npm run dev
```

`docker-compose.postgres.yml`에는 개발용 자격 증명만 포함하며 운영 환경변수로 재사용하지 않는다.

배포 후 `GET /api/health`가 `200`과 `data.status=ok`, `data.database=ok`를 반환하는지 확인한다. 데이터베이스 연결 실패는 개인정보나 연결 문자열을 노출하지 않고 `503`으로 반환한다.

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

## 독립 API 실행 점검

`NEXT_PUBLIC_USE_VOLUNTEER_MOCKS=true`는 명시적인 로컬 UI 테스트에서만 사용한다. 기본 요청은 같은 Next.js 애플리케이션의 `/api/v1` Route Handler로 전달된다. `NEXT_PUBLIC_SITE_URL`은 서버 컴포넌트가 내부 API를 절대 URL로 호출할 때만 사용하며, 외부 백엔드 URL을 지정하지 않는다.

## OAuth 로그인·회원가입

FE-013은 BE의 웹 OAuth 계약을 사용한다. 로그인 URL은 `GET /oauth/{provider}/login-url`, callback 완료는 `POST /oauth/{provider}/login`이다. 성공 응답의 `data.accessToken`과 `data.refreshToken`을 브라우저 `localStorage`에 저장하고 이후 API 요청에 `Authorization: Bearer <accessToken>`을 자동 첨부한다.

프론트 callback URI는 다음과 같다.

```text
https://volunteer.dshelper.kr/kakao/callback
https://volunteer.dshelper.kr/oauth/naver/callback
https://volunteer.dshelper.kr/google/callback
```

BE 테스트 환경에는 다음 provider 설정이 필요하다.

```text
KAKAO_CLIENT_ID
KAKAO_CLIENT_SECRET
KAKAO_REDIRECT_URI=https://volunteer.dshelper.kr/kakao/callback
NAVER_CLIENT_ID
NAVER_CLIENT_SECRET
NAVER_CLIENT_URI=https://volunteer.dshelper.kr
NAVER_REDIRECT_URI=https://volunteer.dshelper.kr/oauth/naver/callback
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
GOOGLE_REDIRECT_URI=https://volunteer.dshelper.kr/google/callback
```

Provider 콘솔에도 동일한 redirect URI를 등록하고, BE CORS 허용 origin에 `https://volunteer.dshelper.kr`을 추가해야 한다. OAuth client secret은 프론트나 `NEXT_PUBLIC_*`에 저장하지 않는다.

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

