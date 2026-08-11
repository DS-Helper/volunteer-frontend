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

## 고정 계약

- 날짜·시간: ISO-8601 문자열, 서버 저장 기준은 Asia/Seoul 정책을 백엔드와 일치시킨다.
- 페이지 응답: `content`, `page`, `size`, `totalElements`, `totalPages`.
- ID: 리소스 응답의 기본 식별자는 `id`; 중첩 요청 경로만 `eventId`, `applicationId`, `memberId`를 사용한다.
- 이미지: 먼저 `POST /api/v1/admin/volunteer/event-images`로 업로드하고 응답의 `volunteerFileId`를 일정 생성·수정 JSON에서 참조한다.
- 오류: HTTP 상태와 업무 코드(`VOLUNTEER_EVENT_INVALID_STATE`, `VOLUNTEER_CAPACITY_BELOW_CURRENT_PARTICIPANTS`, `VOLUNTEER_APPLICATION_ALREADY_EXISTS`, `VOLUNTEER_PARTICIPATION_CONFLICT`, `VOLUNTEER_ADMIN_FORBIDDEN`)를 함께 제공한다.
- 출석 결과: `eventId`, 처리 인원, 처리 시각, 참여 상태를 반환한다.

`OPENAPI_URL`을 설정하면 CI가 사용자·관리자 필수 path와 HTTP method를 실제 OpenAPI 문서와 비교한다.

## 실제 백엔드 인증 E2E

실서버 호출은 기본적으로 건너뛴다. 만료되지 않은 사용자·관리자 access token을 환경변수로 주입하고 다음처럼 명시적으로 활성화한다.

```bash
E2E_RUN_REAL_BACKEND=true E2E_USER_ACCESS_TOKEN=... E2E_ADMIN_ACCESS_TOKEN=... npm run test:e2e:backend
```

승인·반려·출석처럼 상태를 변경하는 테스트는 `E2E_ADMIN_MUTATE=true`와 `E2E_ADMIN_MUTATION=approve|reject|attendance`를 함께 지정해야 한다. 대상 ID와 출석 참여 ID도 별도로 주입해야 하며, 기본 CI와 일반 E2E에는 mutation이 실행되지 않는다.

GitHub Actions의 `Backend volunteer authenticated E2E` 수동 workflow에서도 동일한 테스트를 실행할 수 있다. 토큰은 repository secret으로만 등록하고, mutation 실행 시 테스트용 신청·일정 ID를 workflow input으로 지정한다.

테스트용 데이터가 별도로 고정되지 않은 환경에서는 `E2E_AUTO_SELECT_TARGET=true`를 사용해 관리자 목록에서 대상을 선택할 수 있다. mutation 자체는 여전히 `E2E_ADMIN_MUTATE=true`일 때만 실행된다.

OAuth redirect URI와 환경변수는 `docs/README.md` 및 프로젝트 `.env.example`을 함께 갱신한다.
