# Visual Completeness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refine the visual hierarchy of statistics, calendar, splash, and dues screens without changing product scope.

**Architecture:** Keep the existing feature structure and screen flow intact, then tighten visual hierarchy inside the existing components. Focus on low-risk style and copy changes backed by targeted unit updates first, followed by a full regression pass.

**Tech Stack:** React Native, Expo Router/Navigation, Jest, React Native Testing Library, Playwright

---

### Task 1: Lock updated labels and focus states with tests

**Files:**
- Modify: `tests/unit/account-management-tabs.test.tsx`
- Modify: `tests/unit/app-router.test.tsx`

**Step 1: Write the failing test**

- Add assertions for the refined statistics labels and selected calendar date copy.
- Add assertions for the refined splash copy rendered during app bootstrap.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx tests/unit/app-router.test.tsx --runInBand`
Expected: FAIL because the old labels and bootstrap copy are still rendered.

**Step 3: Write minimal implementation**

- Update the relevant UI copy and state presentation in the screen components so the new expectations become true.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx tests/unit/app-router.test.tsx --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/unit/account-management-tabs.test.tsx tests/unit/app-router.test.tsx src/features/accounts/components/detail-tabs/StatisticsTab.tsx src/features/accounts/components/detail-tabs/CalendarTab.tsx src/shared/ui/primitives/SplashScreen.tsx
git commit -m "test: lock visual completeness labels"
```

### Task 2: Refine statistics and calendar hierarchy

**Files:**
- Modify: `src/features/accounts/components/detail-tabs/StatisticsTab.tsx`
- Modify: `src/features/accounts/components/detail-tabs/CalendarTab.tsx`
- Test: `tests/unit/account-management-tabs.test.tsx`

**Step 1: Write the failing test**

- Add or extend expectations around the new summary strip titles, category focus block, and selected-date heading.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx --runInBand`
Expected: FAIL with missing visible labels.

**Step 3: Write minimal implementation**

- Tighten card rhythm, selected state styling, and summary copy.
- Keep structure stable so existing navigation and e2e flows do not change.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/unit/account-management-tabs.test.tsx src/features/accounts/components/detail-tabs/StatisticsTab.tsx src/features/accounts/components/detail-tabs/CalendarTab.tsx
git commit -m "feat: refine stats and calendar hierarchy"
```

### Task 3: Refine splash and dues tone

**Files:**
- Modify: `src/shared/ui/primitives/SplashScreen.tsx`
- Modify: `src/features/accounts/components/detail-tabs/DuesTab.tsx`
- Test: `tests/unit/app-router.test.tsx`
- Test: `tests/unit/account-management-tabs.test.tsx`

**Step 1: Write the failing test**

- Add or update expectations for the shorter splash status copy and dues emphasis labels.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx tests/unit/app-router.test.tsx --runInBand`
Expected: FAIL because the current copy and emphasis blocks still use the previous wording.

**Step 3: Write minimal implementation**

- Reduce splash helper copy and refine the loading mark layout.
- Adjust dues summary, status pill, and reminder metadata tone to emphasize primary information first.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx tests/unit/app-router.test.tsx --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/unit/account-management-tabs.test.tsx tests/unit/app-router.test.tsx src/shared/ui/primitives/SplashScreen.tsx src/features/accounts/components/detail-tabs/DuesTab.tsx
git commit -m "feat: refine splash and dues tone"
```

### Task 4: Run full regression and integrate

**Files:**
- Verify: `src/features/accounts/components/detail-tabs/StatisticsTab.tsx`
- Verify: `src/features/accounts/components/detail-tabs/CalendarTab.tsx`
- Verify: `src/shared/ui/primitives/SplashScreen.tsx`
- Verify: `src/features/accounts/components/detail-tabs/DuesTab.tsx`

**Step 1: Run targeted tests**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx tests/unit/app-router.test.tsx --runInBand`
Expected: PASS

**Step 2: Run full verification**

Run: `pnpm test --runInBand`
Expected: PASS

Run: `pnpm run ci:web`
Expected: PASS

Run: `pnpm test:e2e`
Expected: PASS

**Step 3: Merge and push**

```bash
git checkout main
git merge --ff-only codex/visual-completeness
git push origin main
```
