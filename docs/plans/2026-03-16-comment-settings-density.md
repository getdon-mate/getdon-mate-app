# Comment And Settings Density Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 댓글 액션과 설정/알림 보조 카피를 간결하게 정리한다.

**Architecture:** `BoardTab`의 댓글 액션을 게시글과 같은 메뉴 패턴으로 바꾸고, `AppSettingsScreen`, `NotificationListScreen`의 설명성 텍스트를 걷어낸다. 테스트를 먼저 갱신해 회귀를 막는다.

**Tech Stack:** React Native, Testing Library, Expo Web

---

### Task 1: Lock the UI density expectations in tests

**Files:**
- Modify: `tests/unit/account-management-tabs.test.tsx`
- Modify: `tests/unit/home-global-management.test.tsx`
- Modify: `tests/unit/notification-list-screen.test.tsx`

**Step 1: Write the failing test**

- 댓글 수정/삭제가 기본 숨김이고 메뉴에서만 보이는지 검증한다.
- 설정 캡션과 알림 힌트가 사라졌는지 검증한다.

**Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx tests/unit/home-global-management.test.tsx tests/unit/notification-list-screen.test.tsx --runInBand`

**Step 3: Write minimal implementation**

- 댓글 메뉴, 설정 캡션 제거, 알림 힌트 제거를 반영한다.

**Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx tests/unit/home-global-management.test.tsx tests/unit/notification-list-screen.test.tsx --runInBand`

### Task 2: Full verification and integration

**Files:**
- Modify: `src/features/accounts/components/detail-tabs/BoardTab.tsx`
- Modify: `src/features/auth/screens/AppSettingsScreen.tsx`
- Modify: `src/features/auth/screens/NotificationListScreen.tsx`

**Step 1: Run full verification**

Run: `pnpm test --runInBand`
Run: `pnpm run ci:web`
Run: `pnpm test:e2e`

**Step 2: Clean artifacts**

Run: `find test-results -type f -delete 2>/dev/null; find test-results -depth -type d -empty -delete 2>/dev/null`

**Step 3: Commit**

```bash
git add docs/plans/2026-03-16-comment-settings-density-design.md docs/plans/2026-03-16-comment-settings-density.md tests/unit/account-management-tabs.test.tsx tests/unit/home-global-management.test.tsx tests/unit/notification-list-screen.test.tsx src/features/accounts/components/detail-tabs/BoardTab.tsx src/features/auth/screens/AppSettingsScreen.tsx src/features/auth/screens/NotificationListScreen.tsx
git commit -m "feat: reduce comment and settings action density"
```
