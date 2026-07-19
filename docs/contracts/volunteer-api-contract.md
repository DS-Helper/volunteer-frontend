# Volunteer API contract

프론트의 봉사 API 경로는 `src/features/volunteer/api`에 정의한다. 계약 smoke check는 다음 명령으로 실행한다.

```bash
npm run contract:check
```

검증 대상:

- 관리자 신청 목록·상세
- 관리자 단원 목록·상세
- 관리자 일정 목록·상세·상태 변경
- 일정 이미지 2단계 업로드

OAuth redirect URI와 환경변수는 `docs/README.md` 및 프로젝트 `.env.example`을 함께 갱신한다.
