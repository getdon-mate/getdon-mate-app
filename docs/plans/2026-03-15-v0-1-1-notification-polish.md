# v0.1.1 Notification And Density Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 알림센터와 캘린더의 운영 가독성을 높이고 모바일 밀도를 더 정리한다.

**Architecture:** 기존 notification state와 calendar selector를 유지한 채, 화면 쪽 필터/분류 로직을 추가한다. 새 전역 상태는 만들지 않고 로컬 필터 상태와 selector helper만 추가한다.

**Tech Stack:** Expo 54, React Native, TypeScript, Jest, Playwright

---

### Task 1: Add failing coverage for notification filtering and calendar tone

**Files:**
- Modify: `tests/unit/notification-settings-screen.test.tsx`
- Create or Modify: `tests/unit/notification-list-screen.test.tsx`
- Modify: `tests/e2e/navigation-auth-regression.spec.ts`

**Step 1: Write the failing tests**

- Add unit coverage for notification filter chips and e2e coverage for viewing filtered reminder notifications.

**Step 2: Run tests to verify they fail**

Run: `pnpm test tests/unit/notification-list-screen.test.tsx --runInBand`
Expected: FAIL because filters do not exist.

**Step 3: Write minimal implementation**

- Add the smallest filter state and derived lists needed for tests.

**Step 4: Run tests to verify they pass**

Run: `pnpm test tests/unit/notification-list-screen.test.tsx --runInBand`
Expected: PASS

### Task 2: Polish notification list density and category cues

**Files:**
- Modify: `src/features/auth/screens/NotificationListScreen.tsx`
- Modify: `src/shared/lib/notification-state.ts`

### Task 3: Polish calendar tone and selected date header

**Files:**
- Modify: `src/features/accounts/components/detail-tabs/CalendarTab.tsx`
- Modify: `src/features/accounts/model/selectors.ts`

### Task 4: Tighten tab bar density and verify full suite

**Files:**
- Modify: `src/features/accounts/components/detail/DetailTabBar.tsx`
- Run: `pnpm test --runInBand && pnpm run ci:web && pnpm test:e2e`
