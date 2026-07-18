# 봉사단 소개

> 상태: 검증 중 · 작업 ID: FE-006  
> 요구사항: `volunteer_plan.md` §5-3, §7-1  
> v1 API/Mock: `GET /api/v1/volunteer/introduction`은 제목, 소개 문단, 활동 항목, CTA 가능 여부를 `{ data }`로 반환한다고 가정한다.  
> 디자인 기준 DS-01: 밝은 `#F6F6F6` 배경, `#3C3B3B` 본문, `#0DBA53` 핵심 CTA, Pretendard, 12px card와 pill CTA.

## 목표와 범위

`/volunteer`에서 봉사단 목적, 주요 활동, 가입 절차와 다음 행동을 이해시킨다. 콘텐츠 최종 편집 기능과 CMS는 v1 범위가 아니다.

현재 BE의 `VolunteerIntroductionResponse`에서 title, description, activities, regions, eligibilityRequirements, loggedIn, applicationStatus, capabilities를 소비한다.

## 화면 구성

1. 봉사단 hero와 설명
2. 주요 활동 카드
3. 가입 절차 안내
4. `가입 신청하기` 또는 상태 확인 CTA
5. API 실패 시 재시도, 콘텐츠 없음 시 안전한 안내

페이지와 콘텐츠 조회는 Server Component로 두고 상호작용이 없는 영역은 Client로 전환하지 않는다.

## 상태

| 시나리오 | 표시 |
| --- | --- |
| 정상 | 소개 콘텐츠와 CTA |
| loading | hero·card skeleton |
| empty | 준비 중 안내 |
| error | 일반 오류와 재시도 |

## 체크리스트

- [ ] 고유 Metadata와 `h1`이 있다.
- [ ] 소개 데이터의 cache 시간을 명시한다.
- [ ] CTA는 가입 상태 또는 capability 계약을 따른다.
- [ ] 모바일 1열, 넓은 화면 card grid를 확인한다.

## 미해결 질문

- 실제 소개 문구와 이미지 자산은 누가 제공하는가?
- 비로그인 사용자의 CTA 목적지는 로그인인가 신청 화면인가?
