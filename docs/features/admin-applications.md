# 관리자 가입 신청 관리

> 상태: 검증 중 · 작업 ID: FE-201  
> 요구사항: `volunteer_plan.md` §5-13, §7-3, §9-2  
> v1 API/Mock: admin applications 목록·상세, approve/reject, photo endpoint와 PENDING 중심 fixture를 제공한다.  
> 디자인 기준 DS-01: `#F6F6F6` admin canvas, 흰 12px table/card, `#0DBA53` 승인 CTA, pill status, `#3C3B3B` text.

## 목록

이름·연락처 검색, 상태·신청일 filter, pagination, 상세 이동, 승인·반려 가능 여부를 표시한다. filter는 URL query에 유지한다.

## 상세와 액션

기본정보, 희망 활동, 지원동기, 사진, 상태, 신청·처리일, 공개 반려 사유, 관리자 메모를 역할에 맞게 구분한다. 승인에는 확인 modal, 반려에는 공개 사유와 내부 메모의 명시적으로 다른 입력을 제공한다.

## 보안

이 화면을 숨기는 것만으로 관리자 권한을 보장하지 않는다. 일반 사용자 feature와 관리자 DTO를 공유해 내부 필드가 유출되지 않게 한다. 사진은 보호된 endpoint 계약을 따른다.

## 체크리스트

- [ ] 검색·filter·pagination이 URL에 유지된다.
- [ ] 공개 사유와 내부 메모 label·DTO가 다르다.
- [ ] pending/disabled로 중복 승인·반려를 막는다.
- [ ] 성공 후 목록·상세를 갱신한다.
- [ ] 비관리자 시나리오를 E2E로 검증한다.

## 미해결 질문

- 관리자 메모 길이·필수 여부는?
- 상세 응답의 사진은 별도 인증 blob만 사용하는가?
- 승인·반려 후 이동은 목록인가 현재 상세인가?
