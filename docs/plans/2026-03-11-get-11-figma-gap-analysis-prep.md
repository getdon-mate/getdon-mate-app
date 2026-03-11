# GET-11 Figma 갭 분석 준비 메모

## 현재 확인된 구현 화면

- `login`
  - 로그인 / 회원가입 모드 전환
- `account-list`
  - 사용자 헤더
  - 모임통장 목록
  - 모임통장 생성 패널
- `account-detail`
  - `dashboard`
  - `dues`
  - `transactions`
  - `members`
  - `settings`

## 현재 비교 가능한 범위

- 화면 구조와 플로우는 `GET-21` 기준으로 정리됨
- 화면별 데이터 요구사항은 `GET-22` 기준으로 정리됨
- 즉, 현재 앱이 어떤 화면/탭/액션을 갖는지는 비교 가능한 상태임

## 기준 소스 확보 상태

- `figma-sample-design/` 폴더가 추가되어 실제 화면 구조/스타일 기준을 확인할 수 있음
- 참조 대상:
  - `figma-sample-design/src/app/pages/Login.tsx`
  - `figma-sample-design/src/app/pages/Home.tsx`
  - `figma-sample-design/src/app/pages/AccountDetail.tsx`
  - `figma-sample-design/src/app/pages/Members.tsx`
  - `figma-sample-design/src/app/pages/Settings.tsx`
- `GET-21`, `GET-22`, `GET-23`, `GET-24`는 2026-03-11 기준 모두 완료됨

## Figma 확보 후 바로 확인할 항목

### 로그인

- 히어로 카드 비주얼
- 입력 필드 개수와 배치
- CTA 버튼 문구/스타일
- 보조 문구 위치

### 계좌 목록

- 사용자 헤더 레이아웃
- 계좌 카드 정보 밀도
- 개설 패널 입력 구조
- 빈 상태/오류 상태 표현

### 계좌 상세

- 상단 헤더 레이아웃
- 하단 탭 내비게이션 구성
- 대시보드 요약 카드 배치
- 회비/거래/멤버/설정 탭별 카드 구조

## 반영 결과 (하이브리드)

- Login 화면: 아이콘/타이포/입력 폼 톤 정합화
- 목록 화면: 상단 헤더 카드/계좌 카드 밀도 및 정보 구조 정합화
- 상세 화면: 상단 Hero 카드(잔액/액션) + 하단 거래영역 계층 정합화
- 멤버/설정 탭: 카드 톤/간격/타이포 정합화
- 공통 카드 표면(`SectionCard`)을 기준 톤으로 통일
- `tsconfig`에 `figma-sample-design` 제외를 추가해 앱 타입체크 범위 고정

## 다음 액션

1. 실제 Figma 픽셀 매칭이 필요한 항목(P1/P2)만 추가 미세조정
2. `GET-11` 완료 판정 후 PR 정리

## 2026-03-11 기준 상태 요약

- 완료:
  - `GET-21`, `GET-22`, `GET-23`, `GET-24`
  - mock 플로우 안정화(`GET-14`) 및 README 정리(`GET-17`)
- 진행 중:
  - `GET-11` (Figma 원본 참조 확보 대기)
