# FE Phase 2 Batch Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 남은 FE backlog를 한 브랜치에서 순차 처리해 `main`으로 MR 가능한 상태까지 끌어올린다.

**Architecture:** 먼저 디자인/폼/피드백 구조를 정리해 UI 기준선을 안정화한 뒤, 상태 복원과 위험 액션 흐름을 정리한다. 그 다음 테스트 환경과 핵심 회귀 테스트를 도입하고, 마지막에 문서와 성능 보강을 더해 제품화 트랙의 남은 작업을 마무리한다.

**Tech Stack:** Expo 54, React Native, React Navigation, TypeScript, pnpm, Jest, React Native Testing Library, Playwright

---

### Task 1: 디자인 토큰 2차 적용과 공통 상태 컴포넌트 정리

**Files:**
- Modify: `src/shared/ui/tokens.ts`
- Modify: `src/shared/ui/index.ts`
- Modify: `src/features/auth/components/AuthHero.tsx`
- Modify: `src/features/auth/components/AuthFormCard.tsx`
- Modify: `src/features/accounts/components/AccountCreatePanel.tsx`
- Modify: `src/features/accounts/components/AccountSummaryCard.tsx`
- Modify: `src/features/accounts/components/EmptyStateCard.tsx`
- Modify: `src/features/accounts/components/MemberRow.tsx`
- Modify: `src/features/accounts/components/SectionCard.tsx`
- Modify: `src/features/accounts/components/TransactionRow.tsx`
- Modify: `src/features/accounts/components/UserHeaderCard.tsx`
- Modify: `src/features/accounts/components/detail-tabs/*.tsx`
- Modify: `src/features/accounts/screens/AccountDetailScreen.tsx`
- Modify: `src/features/accounts/screens/AccountListScreen.tsx`

**Step 1:** `uiColors`, `uiRadius`, `uiSpacing`, `uiTypography`에 화면에서 반복되는 색상/간격/배지 변형을 추가한다.

**Step 2:** 하드코딩된 style 값을 공통 토큰 참조로 치환하고, 반복 배경/테두리/텍스트 톤을 정리한다.

**Step 3:** 빈 상태/로딩 상태 공통 패턴을 `EmptyStateCard` 중심으로 통일하고 상세 탭과 목록 화면에 적용한다.

**Step 4:** `pnpm run typecheck`

**Step 5:** `pnpm run export:web`

**Step 6:** Linear `GET-58`, `GET-51`을 `Done` 처리하고 로컬 커밋을 생성한다.

### Task 2: 폼 입력 UX와 검증 유틸 표준화

**Files:**
- Create: `src/shared/lib/validation.ts`
- Create: `src/shared/ui/primitives/NumericInputField.tsx`
- Modify: `src/shared/ui/index.ts`
- Modify: `src/features/auth/screens/LoginScreen.tsx`
- Modify: `src/features/auth/components/AuthFormCard.tsx`
- Modify: `src/features/accounts/components/AccountCreatePanel.tsx`
- Modify: `src/features/accounts/components/detail-tabs/SettingsTab.tsx`

**Step 1:** 로그인/회원가입/계좌생성/자동이체/1회성 회비에 쓰는 검증 규칙을 `validation.ts`로 뽑는다.

**Step 2:** 숫자 입력 전용 필드 또는 헬퍼를 만들어 금액/일자 입력 포맷을 통일한다.

**Step 3:** 각 폼이 검증 유틸을 사용하도록 바꾸고 에러 메시지 톤을 공통화한다.

**Step 4:** `pnpm run typecheck`

**Step 5:** `pnpm run export:web`

**Step 6:** Linear `GET-59`, `GET-52`를 `Done` 처리하고 로컬 커밋을 생성한다.

### Task 3: 전역 피드백 Provider와 위험 액션 UX 일관화

**Files:**
- Create: `src/core/providers/FeedbackProvider.tsx`
- Modify: `src/core/providers/AppProvider.tsx`
- Modify: `App.tsx`
- Modify: `src/shared/ui/primitives/AlertModal.tsx`
- Modify: `src/shared/ui/primitives/ConfirmDialog.tsx`
- Modify: `src/shared/ui/primitives/Toast.tsx`
- Modify: `src/features/auth/screens/LoginScreen.tsx`
- Modify: `src/features/accounts/screens/AccountListScreen.tsx`
- Modify: `src/features/accounts/components/detail-tabs/SettingsTab.tsx`

**Step 1:** Alert/Confirm/Toast 호출 훅과 Provider를 만든다.

**Step 2:** 로그아웃, 탈퇴, 계좌 삭제, 데모 초기화 등 위험 액션을 전역 confirm 규칙으로 통일한다.

**Step 3:** 성공/실패 메시지와 destructive tone을 화면별로 맞춘다.

**Step 4:** `pnpm run typecheck`

**Step 5:** `pnpm run export:web`

**Step 6:** Linear `GET-61`, `GET-65`를 `Done` 처리하고 로컬 커밋을 생성한다.

### Task 4: AccountDetail 탭 상태 복원과 로컬 영속화

**Files:**
- Modify: `src/core/navigation/types.ts`
- Modify: `src/core/AppRouter.tsx`
- Modify: `src/core/providers/AppProvider.tsx`
- Modify: `src/features/accounts/screens/AccountDetailScreen.tsx`
- Modify: `src/features/accounts/screens/AccountListScreen.tsx`
- Modify: `src/features/accounts/model/types.ts`
- Create: `src/shared/lib/storage.ts`

**Step 1:** 탭 진입/복귀 규칙을 정하고 `AccountDetailScreen`의 탭 상태가 CTA 이동과 뒤로가기에 맞게 복원되도록 만든다.

**Step 2:** 선택 계좌/사용자/계좌 데이터의 데모 저장소를 도입한다.

**Step 3:** 초기 hydration, 로그아웃/초기화/탈퇴 시 저장소 동기화를 맞춘다.

**Step 4:** `pnpm run typecheck`

**Step 5:** `pnpm run export:web`

**Step 6:** Linear `GET-64`, `GET-60`을 `Done` 처리하고 로컬 커밋을 생성한다.

### Task 5: Error Boundary와 접근성 기본선 추가

**Files:**
- Create: `src/core/ErrorBoundary.tsx`
- Modify: `App.tsx`
- Modify: `src/shared/ui/primitives/Button.tsx`
- Modify: `src/shared/ui/primitives/InputField.tsx`
- Modify: `src/shared/ui/primitives/ToggleSwitch.tsx`
- Modify: `src/shared/ui/primitives/RadioButton.tsx`
- Modify: `src/features/auth/components/AuthFormCard.tsx`
- Modify: `src/features/accounts/screens/AccountListScreen.tsx`
- Modify: `src/features/accounts/screens/AccountDetailScreen.tsx`
- Modify: `src/features/accounts/components/detail-tabs/SettingsTab.tsx`

**Step 1:** 앱 루트 fallback 화면과 재시도 흐름이 있는 Error Boundary를 추가한다.

**Step 2:** 핵심 버튼/입력/토글/탭에 accessibility label/role/state를 부여한다.

**Step 3:** destructive/disabled/selected 상태의 대비와 터치 영역을 보강한다.

**Step 4:** `pnpm run typecheck`

**Step 5:** `pnpm run export:web`

**Step 6:** Linear `GET-56`, `GET-54`를 `Done` 처리하고 로컬 커밋을 생성한다.

### Task 6: 테스트 환경 구축과 도메인 테스트 추가

**Files:**
- Modify: `package.json`
- Create: `jest.config.ts`
- Create: `jest.setup.ts`
- Create: `src/features/accounts/model/selectors.test.ts`
- Create: `src/core/providers/AppProvider.test.tsx`
- Create: `src/features/auth/screens/LoginScreen.test.tsx`

**Step 1:** Jest + React Native Testing Library 기반 테스트 환경을 설정한다.

**Step 2:** selectors와 provider 액션, 로그인 fallback 흐름 테스트를 추가한다.

**Step 3:** `pnpm test`가 동작하도록 스크립트를 정리한다.

**Step 4:** `pnpm test`

**Step 5:** `pnpm run typecheck`

**Step 6:** `pnpm run export:web`

**Step 7:** Linear `GET-62`, `GET-63`를 `Done` 처리하고 로컬 커밋을 생성한다.

### Task 7: Web E2E smoke, 디자인 가이드, 리스트 성능 보강

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`
- Create: `tests/e2e/smoke.spec.ts`
- Modify: `README.md`
- Create: `docs/plans/2026-03-12-design-system-usage-guide.md`
- Modify: `src/features/accounts/screens/AccountListScreen.tsx`
- Modify: `src/features/accounts/components/AccountSummaryCard.tsx`
- Modify: `src/features/accounts/components/TransactionRow.tsx`
- Modify: `src/features/accounts/components/MemberRow.tsx`

**Step 1:** Playwright smoke 시나리오로 로그인/목록/상세 접근을 검증한다.

**Step 2:** 디자인 시스템 사용 가이드를 문서화한다.

**Step 3:** 리스트 렌더링 병목 구간을 점검하고 필요한 메모화 또는 리스트 컴포넌트 전환을 반영한다.

**Step 4:** `pnpm test`

**Step 5:** `pnpm run typecheck`

**Step 6:** `pnpm run export:web`

**Step 7:** Linear `GET-55`, `GET-53`, `GET-57`을 `Done` 처리하고 로컬 커밋을 생성한다.

### Task 8: 최종 정리와 MR 준비

**Files:**
- Modify: 필요 시 문서/설정 파일 전반

**Step 1:** `git status`로 변경 범위를 점검한다.

**Step 2:** `pnpm test`

**Step 3:** `pnpm run typecheck`

**Step 4:** `pnpm run export:web`

**Step 5:** 남은 FE 하위 이슈 상태를 확인하고 완료 가능한 이슈를 `Done`으로 맞춘다.

**Step 6:** 브랜치 diff와 변경 요약을 정리해 `main`으로 MR 가능한 상태를 만든다.
