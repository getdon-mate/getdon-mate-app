# Home Header Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Align the home list refresh icon horizontally with the filter chips.

**Architecture:** Keep the current AccountListScreen behavior intact and only consolidate the filter chips and refresh button into a shared action row. Lock the layout contract with a focused unit assertion before updating the screen styles.

**Tech Stack:** React Native, Jest, React Native Testing Library

---

### Task 1: Lock the shared action row with a failing test

**Files:**
- Modify: `tests/unit/home-global-management.test.tsx`

**Step 1: Write the failing test**

- Assert that the home list renders a shared action row test id.
- Assert that the row uses horizontal layout and contains the refresh button alongside filter chips.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/home-global-management.test.tsx --runInBand`
Expected: FAIL because the shared row test id and layout are not present yet.

**Step 3: Write minimal implementation**

- Add the shared row wrapper and move the refresh button into it.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/home-global-management.test.tsx --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/unit/home-global-management.test.tsx src/features/accounts/screens/AccountListScreen.tsx
git commit -m "fix: align home refresh control"
```

### Task 2: Run regression and integrate

**Files:**
- Verify: `src/features/accounts/screens/AccountListScreen.tsx`
- Verify: `tests/unit/home-global-management.test.tsx`

**Step 1: Run targeted verification**

Run: `pnpm test tests/unit/home-global-management.test.tsx --runInBand`
Expected: PASS

**Step 2: Run full verification**

Run: `pnpm test --runInBand`
Expected: PASS

Run: `pnpm run ci:web`
Expected: PASS

**Step 3: Merge and push**

```bash
git checkout main
git merge --ff-only codex/home-header-alignment
git push origin main
```
