# DSHelper Volunteer Frontend

DSHelper 봉사단의 사용자·관리자 기능을 제공하는 Next.js 16.2 App Router 프로젝트입니다.

요구사항 원문은 [`volunteer_plan.md`](./volunteer_plan.md), 모든 작업·설계·검증 문서는 [`docs/README.md`](./docs/README.md)에서 라우팅합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

백엔드 없이 확인하려면 `.env.example`을 참고해 Mock 환경변수를 설정합니다. 상세 실행 및 검증 절차는 `docs/operations/environment-and-runbook.md`를 따릅니다.

구조 규칙은 [`AGENTS.md`](./AGENTS.md), 문서 라우팅은 [`docs/README.md`](./docs/README.md)를 기준으로 합니다. 문서 고립 여부는 `npm run docs:check`로 검증합니다.
