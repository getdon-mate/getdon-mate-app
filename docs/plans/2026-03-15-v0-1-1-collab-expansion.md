# v0.1.1 Collaboration Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 미납 리마인드, 통계, 캘린더, 게시판, 거래 필터 개선, 잔액 가리기 UX 개선을 상세 화면에 추가해 다음 릴리즈 범위를 완성한다.

**Architecture:** 기존 `AppProvider`와 계좌 fixture를 확장해 새 상태를 로컬에서 유지하고, 상세 화면 탭을 늘려 각 기능을 독립 탭 컴포넌트로 렌더링한다. 통계와 캘린더는 selector 기반 파생 데이터로 계산하고, 게시판/리마인드는 provider mutation으로 갱신한다.

**Tech Stack:** Expo 54, React Native, React Navigation 7, TypeScript, Jest, Playwright

---

### Task 1: Lock failing coverage for the new collaboration surfaces

**Files:**
- Modify: `tests/unit/account-detail-hero.test.tsx`
- Modify: `tests/unit/account-management-tabs.test.tsx`
- Modify: `tests/unit/app-provider.test.tsx`
- Modify: `tests/e2e/navigation-auth-regression.spec.ts`

**Step 1: Write the failing tests**

- Add tests for blurred/skeleton balance masking, hidden transaction filters, new detail tabs, reminder actions, and board/calendar/statistics entry points.

**Step 2: Run tests to verify they fail**

Run: `pnpm test tests/unit/account-detail-hero.test.tsx tests/unit/account-management-tabs.test.tsx tests/unit/app-provider.test.tsx --runInBand`
Expected: FAIL because the new tabs and actions do not exist yet.

**Step 3: Write minimal implementation**

- Only add the minimum selectors, props, and placeholders required for tests to compile and fail for the right reasons.

**Step 4: Run tests to verify they pass**

Run: `pnpm test tests/unit/account-detail-hero.test.tsx tests/unit/account-management-tabs.test.tsx tests/unit/app-provider.test.tsx --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add tests
git commit -m "test: cover collaboration detail surfaces"
```

### Task 2: Extend account state and demo data for reminders, board, and calendar

**Files:**
- Modify: `src/features/accounts/model/types.ts`
- Modify: `src/features/accounts/model/fixtures.ts`
- Modify: `src/core/providers/AppProvider.tsx`
- Modify: `src/features/accounts/model/selectors.ts`
- Test: `tests/unit/app-provider.test.tsx`

**Step 1: Write the failing test**

- Add provider tests for sending payment reminders, sending transfer requests, creating board posts, and creating comments.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/app-provider.test.tsx --runInBand`
Expected: FAIL because provider mutations and data types are missing.

**Step 3: Write minimal implementation**

- Add types, fixture records, provider mutations, and selectors required to keep the new data consistent.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/app-provider.test.tsx --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/accounts/model src/core/providers/AppProvider.tsx tests/unit/app-provider.test.tsx
git commit -m "feat: add collaboration account state"
```

### Task 3: Rework privacy masking and transaction filter disclosure

**Files:**
- Modify: `src/shared/ui/primitives/AmountMask.tsx`
- Modify: `src/features/accounts/components/detail/AccountDetailHero.tsx`
- Modify: `src/features/accounts/components/detail-tabs/TransactionsTab.tsx`
- Test: `tests/unit/account-detail-hero.test.tsx`

**Step 1: Write the failing tests**

- Add assertions for softened masked balance treatment and collapsed transaction filters that expand from an icon button.

**Step 2: Run tests to verify they fail**

Run: `pnpm test tests/unit/account-detail-hero.test.tsx tests/unit/account-management-tabs.test.tsx --runInBand`
Expected: FAIL because current mask and filter UI are always visible.

**Step 3: Write minimal implementation**

- Update the hero masking visuals and move filter controls behind a toggle button with accessible labels.

**Step 4: Run tests to verify they pass**

Run: `pnpm test tests/unit/account-detail-hero.test.tsx tests/unit/account-management-tabs.test.tsx --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shared/ui/primitives/AmountMask.tsx src/features/accounts/components/detail src/features/accounts/components/detail-tabs tests/unit/account-detail-hero.test.tsx tests/unit/account-management-tabs.test.tsx
git commit -m "feat: refine balance privacy and transaction filters"
```

### Task 4: Add statistics, calendar, and board detail tabs

**Files:**
- Modify: `src/features/accounts/components/detail/DetailTabBar.tsx`
- Modify: `src/features/accounts/screens/AccountDetailScreen.tsx`
- Create: `src/features/accounts/components/detail-tabs/StatisticsTab.tsx`
- Create: `src/features/accounts/components/detail-tabs/CalendarTab.tsx`
- Create: `src/features/accounts/components/detail-tabs/BoardTab.tsx`
- Test: `tests/unit/account-management-tabs.test.tsx`

**Step 1: Write the failing tests**

- Add tab rendering tests for statistics, calendar, and board.

**Step 2: Run tests to verify they fail**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx --runInBand`
Expected: FAIL because the new detail tabs do not exist.

**Step 3: Write minimal implementation**

- Extend the detail tab type/meta and render the three new tab components using selector-driven data.

**Step 4: Run tests to verify they pass**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/accounts/components/detail src/features/accounts/components/detail-tabs src/features/accounts/screens/AccountDetailScreen.tsx tests/unit/account-management-tabs.test.tsx
git commit -m "feat: add statistics calendar and board tabs"
```

### Task 5: Add reminder UX and release verification

**Files:**
- Modify: `src/features/accounts/components/detail-tabs/DuesTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/MembersTab.tsx`
- Modify: `src/shared/constants/copy.ts`
- Modify: `tests/e2e/navigation-auth-regression.spec.ts`
- Modify: `tests/e2e/smoke.spec.ts`

**Step 1: Write the failing tests**

- Add e2e and unit assertions for reminder buttons, request wording, board posting, comment creation, and transaction filter open/close behavior.

**Step 2: Run tests to verify they fail**

Run: `pnpm test:e2e`
Expected: FAIL because the new flows are not present yet.

**Step 3: Write minimal implementation**

- Add unpaid reminder buttons and friendly copy.
- Ensure new tabs and filters are reachable in e2e.
- Register the long-press reveal idea as a Linear task.

**Step 4: Run tests to verify they pass**

Run: `pnpm test --runInBand && pnpm run ci:web && pnpm test:e2e`
Expected: PASS

**Step 5: Commit**

```bash
git add src tests docs/plans
git commit -m "feat: expand collaboration surfaces for v0.1.1"
```
