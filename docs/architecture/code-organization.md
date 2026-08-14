# 코드·문서 구조

## 목적

봉사 도메인의 라우트 조합, 기능 로직, 공통 인프라, 테스트와 문서를 서로 다른 책임으로 유지한다.

## 코드 경계

```text
src/app                         라우트·layout·metadata·loading·error
  → src/features/volunteer      봉사 API·DTO·스키마·feature component
    → src/lib/api                공통 fetch·Envelope·인증·오류
src/components                  둘 이상의 feature가 공유하는 UI
tests/mocks                      실제 API 계약을 복제하는 MSW fixture
tests/e2e                        브라우저·실백엔드 시나리오
scripts                          계약·문서 구조 검증
```

## 배치 규칙

- `src/app` 페이지에는 데이터 조합과 라우트 경계만 둔다. API base URL, 반복 fetch, 도메인 상태 전이는 feature API로 이동한다.
- `src/features/volunteer/api`는 사용자와 관리자 API를 파일 단위로 분리하고, 타입은 `types`, 입력 검증은 `schemas`에 둔다.
- `src/features/volunteer/data`는 개발용 fixture와 mock adapter만 보관한다. Mock은 실 API client를 대체하는 별도 경계이며 화면 컴포넌트에서 직접 호출하지 않는다.
- 공통 UI는 실제로 둘 이상의 기능에서 사용될 때만 `src/components`에 둔다.
- `tests/integration`은 공통 client·컴포넌트, `tests/unit`은 순수 함수·스키마, `tests/e2e`는 라우트·실 API 경계를 검증한다.
- 문서는 `docs/README.md`에서만 라우팅한다. 새 문서는 반드시 라우터에 연결하고 작업 ID·완료 조건·검증 결과를 기록한다.

## 구조 검증

```bash
npm run docs:check
npm run contract:check
```
