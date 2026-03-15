# Inputs And UX Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build shared numeric/day inputs and finish the approved notification/settings/balance UX cleanup.

**Architecture:** Upgrade the shared form primitives first so consuming screens can be updated with minimal local logic. Then tighten the notification/settings/detail UI with focused behavior and copy changes backed by unit tests before running the full regression suite.

**Tech Stack:** React Native, Expo, Jest, React Native Testing Library, Playwright

---

### Task 1: Lock shared input behavior with failing tests

**Files:**
- Create: `tests/unit/form-primitives.test.tsx`
- Modify: `src/shared/ui/primitives/NumericInputField.tsx`
- Create: `src/shared/ui/primitives/DayOfMonthSelectField.tsx`

**Step 1: Write the failing test**

- Assert that numeric input displays `12,500` while returning raw `12500`.
- Assert that the day select opens and applies `1~28일` values.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/form-primitives.test.tsx --runInBand`
Expected: FAIL because formatting and day select do not exist yet.

**Step 3: Write minimal implementation**

- Update `NumericInputField` to format visible value.
- Add `DayOfMonthSelectField`.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/form-primitives.test.tsx --runInBand`
Expected: PASS

### Task 2: Apply shared inputs to create/settings/transaction flows

**Files:**
- Modify: `src/features/accounts/components/AccountCreatePanel.tsx`
- Modify: `src/features/accounts/screens/AccountCreateScreen.tsx`
- Modify: `src/features/accounts/components/detail-tabs/SettingsTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/TransactionsTab.tsx`
- Test: `tests/unit/account-management-tabs.test.tsx`

**Step 1: Write the failing test**

- Extend tests around transaction value suggestions and settings/account create day fields.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx --runInBand`
Expected: FAIL with old placeholders/behavior.

**Step 3: Write minimal implementation**

- Replace raw day number inputs with `DayOfMonthSelectField`.
- Keep money fields on the upgraded numeric input.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx --runInBand`
Expected: PASS

### Task 3: Refine notification and settings screens

**Files:**
- Modify: `src/features/auth/screens/NotificationListScreen.tsx`
- Modify: `src/features/auth/screens/AppSettingsScreen.tsx`
- Test: `tests/unit/notification-list-screen.test.tsx`
- Test: `tests/unit/home-global-management.test.tsx`

**Step 1: Write the failing test**

- Assert that summary cards are gone and chip badges are visible.
- Assert that over-explanatory settings copy is gone.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/notification-list-screen.test.tsx tests/unit/home-global-management.test.tsx --runInBand`
Expected: FAIL

**Step 3: Write minimal implementation**

- Replace summary cards with badge chips.
- Simplify settings copy and normalize row sizing.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/notification-list-screen.test.tsx tests/unit/home-global-management.test.tsx --runInBand`
Expected: PASS

### Task 4: Refine hero balance reveal and account-number copy affordances

**Files:**
- Modify: `src/features/accounts/components/detail/AccountDetailHero.tsx`
- Modify: `src/features/accounts/components/detail-tabs/DashboardTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/SettingsTab.tsx`
- Test: `tests/unit/account-detail-hero.test.tsx`

**Step 1: Write the failing test**

- Assert that hold-to-reveal text is left aligned and the amount appears only during press in.
- Assert that account number copy actions remain visible next to the number.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/account-detail-hero.test.tsx --runInBand`
Expected: FAIL

**Step 3: Write minimal implementation**

- Add transient hold-to-reveal state.
- Add copy icon affordances beside visible account numbers.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/account-detail-hero.test.tsx --runInBand`
Expected: PASS

### Task 5: Full verification and integration

**Files:**
- Verify: `src/shared/ui/primitives/NumericInputField.tsx`
- Verify: `src/shared/ui/primitives/DayOfMonthSelectField.tsx`
- Verify: `src/features/auth/screens/NotificationListScreen.tsx`
- Verify: `src/features/auth/screens/AppSettingsScreen.tsx`
- Verify: `src/features/accounts/components/detail/AccountDetailHero.tsx`
- Verify: `src/features/accounts/components/detail-tabs/SettingsTab.tsx`
- Verify: `src/features/accounts/components/detail-tabs/TransactionsTab.tsx`

**Step 1: Run targeted tests**

Run: `pnpm test tests/unit/form-primitives.test.tsx tests/unit/account-detail-hero.test.tsx tests/unit/notification-list-screen.test.tsx tests/unit/home-global-management.test.tsx tests/unit/account-management-tabs.test.tsx --runInBand`
Expected: PASS

**Step 2: Run full verification**

Run: `pnpm test --runInBand`
Expected: PASS

Run: `pnpm run ci:web`
Expected: PASS

Run: `pnpm test:e2e`
Expected: PASS

**Step 3: Merge and push**

Use a fast-forward-safe integration flow and preserve any unrelated local workspace changes.
