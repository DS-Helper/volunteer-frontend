# 접근성·반응형 기준

> 상태: 검증 중 · 작업 ID: FE-302  
> 요구사항: `volunteer_plan.md` §5-1, §5-17, §13  
> 공식 기준: `node_modules/next/dist/docs/03-architecture/accessibility.md`  
> v1 API/Mock: loading/error/empty와 모든 status fixture를 사용해 보조기술에 전달되는 문구를 검증한다.  
> 디자인 기준 DS-01: Pretendard, `#3C3B3B` 읽기 색, `#0DBA53` focus/CTA, `#F6F6F6` 배경, 12px/pill radius를 쓰되 대비와 상태 의미를 색에만 의존하지 않는다.

## 문서 구조

- route마다 고유한 Metadata title과 `h1`
- header, nav, main, section, form, table 등 의미 있는 요소
- heading level을 시각 크기가 아니라 정보 계층에 맞춤

## 입력과 상태

- 모든 input에 명시적 label과 오류 설명 연결
- 오류·성공 메시지는 필요한 경우 `aria-live`
- disabled와 pending을 시각·텍스트로 함께 표현
- loading, empty, error를 서로 다른 문구로 제공

## 키보드와 focus

- 모든 동작은 keyboard로 가능
- modal open 시 focus 이동, Tab 순환, Escape 닫기, trigger 복귀
- route/filter 변경 후 focus 위치가 예측 가능
- focus outline을 제거하지 않고 `#0DBA53` 기반 고대비 스타일 제공

## 반응형

- mobile-first 1열, 넓은 화면에서 grid/table 확장
- 표는 작은 화면에서 의미를 잃지 않는 card 또는 안전한 수평 스크롤
- touch target 최소 크기와 긴 한글 줄바꿈 확인
- animation은 `prefers-reduced-motion` 존중

## 체크리스트

- [ ] 360px와 desktop viewport를 확인한다.
- [ ] keyboard-only 핵심 흐름을 완료한다.
- [ ] 이미지 alt와 form label을 확인한다.
- [ ] status badge가 텍스트를 포함한다.
- [ ] 자동 ESLint a11y 오류가 없다.

## 미해결 질문

- 목표 WCAG 수준은 2.2 AA인가?
- 기존 DSHelper header의 mobile navigation 접근성 기준은 충족되는가?
