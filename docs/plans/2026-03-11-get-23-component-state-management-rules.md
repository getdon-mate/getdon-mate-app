# GET-23 [FE][Spec] 컴포넌트/상태관리 규칙 초안

## 목적

- 화면 단위 개발에서 컴포넌트 분리 기준과 상태 소유권을 명확히 한다.
- 신규 기능 추가 시 `local/server/global` 상태 경계를 일관되게 적용한다.
- 현재 저장소 구조를 기준으로 확장 가능한 폴더 구조 초안을 고정한다.

## 1) 컴포넌트 분리 기준

### A. Screen

- 위치: `src/features/**/screens/*Screen.tsx`
- 책임:
  - 라우팅/뷰 진입 제어
  - 화면 단위 사용자 플로우 조합
  - 탭/필터 같은 화면 레벨 UI 상태 소유
- 금지:
  - 비즈니스 계산 로직 직접 구현
  - 반복되는 카드/행 UI의 상세 렌더링 구현

### B. Section/Panel 컴포넌트

- 위치: `src/features/**/components/**`
- 책임:
  - 특정 화면 영역의 UI 조합
  - 상위에서 주입된 데이터 표시와 이벤트 전달
  - 빈 상태/오류 상태 메시지 렌더링
- 규칙:
  - 도메인 계산 로직은 selector/model로 위임
  - 네트워크/스토리지 접근 금지

### C. Presentational Row/Item 컴포넌트

- 예: `TransactionRow`, `MemberRow`
- 책임:
  - 단일 엔티티/레코드 단위 렌더링
  - 포맷팅된 최종 텍스트/색상 표현
- 규칙:
  - 부수효과 없는 순수 렌더링 우선
  - 상태 변경 액션이 필요하면 콜백만 받는다

### D. Model/Selector

- 위치:
  - `src/features/**/model/types.ts`
  - `src/features/**/model/selectors.ts`
  - `src/features/**/model/mock-data.ts` (현재 mock 소스)
- 책임:
  - 파생 데이터 계산
  - 타입 계약 제공
  - 화면 공통 계산 로직 재사용

## 2) 상태관리 범위 규칙 (local/server/global)

### Local state

- 소유 주체: 화면/섹션 컴포넌트
- 대상:
  - 입력값(`TextInput` 값)
  - 탭/필터 선택값
  - 열림/닫힘 토글
  - 임시 에러 메시지
- 기준:
  - 해당 화면을 벗어나면 보존할 필요가 없는 상태

### Global state

- 소유 주체: `AppProvider`
- 대상:
  - 인증 사용자
  - 계좌 목록/선택 계좌
  - 앱 현재 뷰(`login`, `account-list`, `account-detail`)
- 기준:
  - 여러 화면에서 동시에 참조/수정되는 도메인 상태

### Server state (향후 API 연동)

- 현재: mock 기반으로 별도 계층 없음
- 전환 원칙:
  - API 응답 원본은 server state로 취급
  - selector에서 화면 파생값 계산
  - 낙관적 업데이트 여부는 액션 단위로 명시

## 3) 폴더 구조 초안

```text
src/
  core/
    providers/
    AppRouter.tsx
  features/
    auth/
      screens/
      components/
      model/
    accounts/
      screens/
      components/
      model/
  shared/
    lib/
```

### 확장 규칙

- 공통 비즈니스 유틸:
  - 도메인 종속이면 `features/<domain>/model`
  - 도메인 비종속이면 `shared/lib`
- 컴포넌트 재사용 범위:
  - 하나의 feature에서만 쓰면 feature 내부 유지
  - 2개 이상 feature에서 반복되면 `shared` 승격 검토

## 4) 이벤트/액션 경계

- 사용자 이벤트는 화면/섹션에서 수집하고 `AppProvider` 액션으로 위임한다.
- 계산/필터링은 selector 함수 호출로 일관화한다.
- 컴포넌트 내부에서 직접 `accounts` 원본을 mutate하지 않는다.

## 5) 합의 체크리스트 (초안)

- [x] Screen / Section / Row 레벨 책임 분리 기준 정의
- [x] local/global 상태 경계 정의
- [x] server state 전환 원칙 정의
- [x] 폴더 구조 초안 정의
- [x] API 연동 시 상태 라이브러리 채택 여부 확정 (1차: React Query + Context 조합)
- [x] 에러/로딩 공통 컴포넌트 승격 기준 확정 (2개 이상 화면 재사용 시 shared 승격)

## 6) 합의 로그 (2026-03-11)

- 합의 방식: FE 스펙 문서 비동기 리뷰
- 기준 문서:
  - `docs/plans/2026-03-11-get-21-screen-ia-user-flow.md`
  - `docs/plans/2026-03-11-get-22-screen-data-requirements.md`
  - 본 문서(`GET-23`)
- 합의 결과:
  - 컴포넌트 분리 기준을 `Screen/Section/Row` 3계층으로 고정
  - 상태관리 범위를 `local/global/server`로 분리해 개발 기준으로 채택
  - 초기 폴더 구조(`core/features/shared`)를 다음 구현 이슈 기본 구조로 채택

## 7) GET-23 산출물 요약

- 본 문서로 `컴포넌트 분리 기준`, `상태관리 규칙`, `초기 폴더 구조` 초안을 기록했다.
- 구현 작업은 본 규칙을 우선 적용하고, API 연동 단계에서 server state 세부 정책을 보완한다.
