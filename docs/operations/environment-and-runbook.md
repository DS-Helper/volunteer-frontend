# 환경변수와 실행 안내

> 상태: 진행 중 · 작업 ID: FE-401  
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
NEXT_PUBLIC_API_BASE_URL=https://server.dshelper.kr
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

## 실 API 전환 점검

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

