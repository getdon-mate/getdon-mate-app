# FE Screen Backlog Closure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish and verify all remaining screen-related `FE`, `Design`, `QA`, and `Content` backlog items, excluding backend and infra work.

**Architecture:** Work in three domain batches so related screens, copy, and tests ship together. Each batch should start from the current mock-data-first architecture, add only the minimum state needed, and keep behavior consistent across native and web. Close Linear issues only after code and verification are complete.

**Tech Stack:** Expo React Native, TypeScript, Jest, existing e2e harness, Linear MCP

---

### Task 1: Freeze scope and map backlog items to batches

**Files:**
- Modify: `docs/plans/2026-03-15-fe-screen-backlog-closure-design.md`
- Modify: `docs/plans/2026-03-15-fe-screen-backlog-closure.md`

**Step 1: Review current open screen issues**

Run: `node -e "console.log('Use Linear MCP issue list already captured in session')"`
Expected: The batch mapping below stays aligned with current open issues.

**Step 2: Finalize batch mapping in plan notes**

Group issues into:

- Batch 1: `GET-146`, `GET-147`, `GET-149`, `GET-150`, `GET-151`
- Batch 2: `GET-155`, `GET-159`, `GET-166`, `GET-168`, `GET-175`, `GET-176`, `GET-177`, `GET-178`, `GET-184`, `GET-186`, `GET-187`, `GET-194`, `GET-195`, `GET-196`, `GET-197`, `GET-199`, `GET-204`
- Batch 3: `GET-205`, `GET-206`, `GET-208`, `GET-214`, `GET-215`, `GET-216`, `GET-217`, `GET-218`, `GET-224`, `GET-225`, `GET-226`, `GET-227`, `GET-228`, `GET-234`, `GET-235`, `GET-236`, `GET-237`, `GET-238`, `GET-242`, `GET-244`

**Step 3: Commit plan docs**

```bash
git add docs/plans/2026-03-15-fe-screen-backlog-closure-design.md docs/plans/2026-03-15-fe-screen-backlog-closure.md
git commit -m "docs: add screen backlog closure plan"
```

### Task 2: Batch 1 test inventory and failing assertions

**Files:**
- Modify: `tests/unit/login-screen.test.tsx`
- Modify: `tests/unit/app-router.test.tsx`
- Modify: `tests/e2e/*` relevant auth specs

**Step 1: Add tests for auth copy, fallback, and unauthenticated routing**

Cover:

- login failure copy and retry affordance
- signup/login validation tone
- session restore fallback state
- guest or logged-out access path messaging
- first-entry loading shell presence

**Step 2: Run targeted tests and verify failures**

Run: `pnpm test tests/unit/login-screen.test.tsx tests/unit/app-router.test.tsx --runInBand`
Expected: Failing assertions for new copy/states before implementation.

**Step 3: Commit test scaffolding**

```bash
git add tests/unit/login-screen.test.tsx tests/unit/app-router.test.tsx tests/e2e
git commit -m "test: add auth backlog coverage"
```

### Task 3: Implement Batch 1 auth and onboarding polish

**Files:**
- Modify: `src/features/auth/screens/LoginScreen.tsx`
- Modify: `src/features/auth/components/AuthFormCard.tsx`
- Modify: `src/features/auth/components/AuthHero.tsx`
- Modify: `src/features/auth/hooks/useAuthForm.ts`
- Modify: app entry/router files as needed for initial shell and fallback
- Modify: `src/shared/ui/primitives/SplashScreen.tsx`
- Modify: `src/shared/ui/primitives/SpinnerOverlay.tsx`

**Step 1: Implement clearer validation and failure states**

Use short, human copy. Remove vague or AI-sounding explanation text.

**Step 2: Add first-entry shell and session fallback behavior**

Ensure users see a stable loading or recovery shell instead of abrupt screen swaps.

**Step 3: Verify targeted tests**

Run: `pnpm test tests/unit/login-screen.test.tsx tests/unit/app-router.test.tsx --runInBand`
Expected: PASS.

**Step 4: Run batch verification**

Run:

- `pnpm test --runInBand`
- `pnpm run ci:web`
- `pnpm test:e2e`

Expected: All pass.

**Step 5: Commit batch**

```bash
git add src/features/auth src/shared/ui tests
git commit -m "feat: polish auth and onboarding flows"
```

### Task 4: Batch 2 failing tests for core operating screens

**Files:**
- Modify: `tests/unit/home-global-management.test.tsx`
- Modify: `tests/unit/account-detail-hero.test.tsx`
- Modify: `tests/unit/account-management-tabs.test.tsx`
- Modify: `tests/unit/selectors.test.ts`
- Modify: relevant e2e files for dues, transactions, members

**Step 1: Add assertions for density, summaries, and action feedback**

Cover:

- home/list ordering and priority display
- summary emphasis rules
- dues month selection and reminder text
- transaction filter chip state and edit/delete feedback
- member role/payment ratio/delegation/deletion restriction messaging

**Step 2: Run targeted tests and confirm failures**

Run: `pnpm test tests/unit/home-global-management.test.tsx tests/unit/account-detail-hero.test.tsx tests/unit/account-management-tabs.test.tsx tests/unit/selectors.test.ts --runInBand`
Expected: FAIL on new assertions.

**Step 3: Commit test scaffolding**

```bash
git add tests/unit tests/e2e
git commit -m "test: add coverage for core operating screen backlog"
```

### Task 5: Implement Batch 2 core operating screen polish

**Files:**
- Modify: `src/features/accounts/screens/AccountListScreen.tsx`
- Modify: `src/features/accounts/components/UserHeaderCard.tsx`
- Modify: `src/features/accounts/components/AccountSummaryCard.tsx`
- Modify: `src/features/accounts/components/detail/AccountDetailHero.tsx`
- Modify: `src/features/accounts/components/detail-tabs/DuesTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/TransactionsTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/MembersTab.tsx`
- Modify: `src/features/accounts/components/MemberRow.tsx`
- Modify: `src/features/accounts/model/selectors.ts`
- Modify: fixtures/mock-data files if required

**Step 1: Tighten layout and summary hierarchy**

Make mobile density improvements without reducing clarity.

**Step 2: Finish dues, transaction, and member interaction polish**

Implement month selection, clearer reminder/request language, better filter state, friendlier edit/delete feedback, member restrictions, and role/ratio visualization.

**Step 3: Run targeted tests**

Run: `pnpm test tests/unit/home-global-management.test.tsx tests/unit/account-detail-hero.test.tsx tests/unit/account-management-tabs.test.tsx tests/unit/selectors.test.ts --runInBand`
Expected: PASS.

**Step 4: Run batch verification**

Run:

- `pnpm test --runInBand`
- `pnpm run ci:web`
- `pnpm test:e2e`

Expected: All pass.

**Step 5: Commit batch**

```bash
git add src/features/accounts tests
git commit -m "feat: finish core operating screen backlog"
```

### Task 6: Batch 3 failing tests for extended tabs and settings

**Files:**
- Modify: `tests/unit/notification-list-screen.test.tsx`
- Modify: `tests/unit/notification-settings-screen.test.tsx`
- Modify: `tests/unit/account-management-tabs.test.tsx`
- Modify: e2e specs covering statistics, calendar, board, notifications, settings

**Step 1: Add assertions for chart readability, calendar badges, board states, and notification actions**

Cover:

- statistics legend and period selector
- calendar event badge rules and selected-day density
- board notice/general distinction and composer/comment feedback
- notification filter chips, action affordances, and settings hierarchy

**Step 2: Run targeted tests and confirm failures**

Run: `pnpm test tests/unit/notification-list-screen.test.tsx tests/unit/notification-settings-screen.test.tsx tests/unit/account-management-tabs.test.tsx --runInBand`
Expected: FAIL on new assertions.

**Step 3: Commit test scaffolding**

```bash
git add tests/unit tests/e2e
git commit -m "test: add coverage for extended tab backlog"
```

### Task 7: Implement Batch 3 extended tab and settings polish

**Files:**
- Modify: `src/features/accounts/components/detail-tabs/StatisticsTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/CalendarTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/BoardTab.tsx`
- Modify: `src/features/auth/screens/NotificationListScreen.tsx`
- Modify: `src/features/auth/screens/NotificationSettingsScreen.tsx`
- Modify: `src/features/auth/screens/AppSettingsScreen.tsx`
- Modify: shared primitives if reused across these screens

**Step 1: Improve readability and interaction clarity**

Implement missing selectors, chips, badges, composer states, and information grouping.

**Step 2: Keep copy short and operational**

Resolve linked content issues while changing the screens.

**Step 3: Run targeted tests**

Run: `pnpm test tests/unit/notification-list-screen.test.tsx tests/unit/notification-settings-screen.test.tsx tests/unit/account-management-tabs.test.tsx --runInBand`
Expected: PASS.

**Step 4: Run full verification**

Run:

- `pnpm test --runInBand`
- `pnpm run ci:web`
- `pnpm test:e2e`

Expected: All pass.

**Step 5: Commit batch**

```bash
git add src/features src/shared/ui tests
git commit -m "feat: finish extended tab and settings backlog"
```

### Task 8: Close completed Linear issues and merge back

**Files:**
- No code files. Linear status only.

**Step 1: Move completed screen issues to `Done`**

Use Linear MCP only for issues verified by shipped code and tests.

**Step 2: Re-run verification on the worktree one last time**

Run:

- `pnpm test --runInBand`
- `pnpm run ci:web`
- `pnpm test:e2e`

Expected: All pass.

**Step 3: Merge to `main`**

Run non-interactive git merge commands and push.

**Step 4: Re-run verification on `main`**

Run:

- `pnpm test --runInBand`
- `pnpm run ci:web`
- `pnpm test:e2e`

Expected: All pass on merged `main`.

**Step 5: Final status update**

Report:

- merged commit
- commands run
- Linear issues closed
