# v0.1 Release Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Demo/mock 기반 Getdon Mate 앱을 v0.1 릴리즈 가능한 프론트 품질로 끌어올린다.

**Architecture:** 앱 부트스트랩, 공통 로딩/프라이버시/공유 상태를 전역 provider와 shared UI primitive에 추가한다. 화면별 설명 문구를 줄이고 계좌 목록/상세, 로그인, 마이페이지, 설정 중심으로 시각 계층과 상호작용을 재정비한다.

**Tech Stack:** Expo 54, React Native, React Navigation 7, TypeScript, Jest, React Testing Library

---

### Task 1: Establish shared release-hardening primitives

**Files:**
- Create: `src/shared/ui/primitives/SplashScreen.tsx`
- Create: `src/shared/ui/primitives/SpinnerOverlay.tsx`
- Create: `src/shared/ui/primitives/AmountMask.tsx`
- Modify: `src/shared/ui/index.ts`
- Modify: `src/shared/ui/primitives/SkeletonBlock.tsx`
- Test: `tests/unit/app-provider.test.tsx`

**Step 1: Write the failing tests**

- Add tests for startup visibility, privacy toggle persistence, and masked amount rendering behavior.

**Step 2: Run tests to verify they fail**

Run: `pnpm test tests/unit/app-provider.test.tsx --runInBand`
Expected: FAIL because startup/privacy state and amount mask primitive do not exist yet.

**Step 3: Write minimal implementation**

- Add shared splash, spinner overlay, and amount mask primitives.
- Export them through `shared/ui`.
- Extend provider state for startup/privacy persistence only as needed for tests.

**Step 4: Run tests to verify they pass**

Run: `pnpm test tests/unit/app-provider.test.tsx --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add src/shared/ui src/core/providers/AppProvider.tsx tests/unit/app-provider.test.tsx
git commit -m "feat: add release hardening ui primitives"
```

### Task 2: Upgrade app bootstrap, loading, and error recovery flows

**Files:**
- Modify: `src/core/providers/AppProvider.tsx`
- Modify: `src/core/AppRouter.tsx`
- Modify: `src/core/errors/AppErrorBoundary.tsx`
- Modify: `src/features/accounts/screens/AccountListScreen.tsx`
- Modify: `src/features/accounts/screens/AccountDetailScreen.tsx`
- Test: `tests/unit/home-global-management.test.tsx`

**Step 1: Write the failing tests**

- Add tests for splash during bootstrap, loading overlay visibility during refresh/patch, and safer error boundary actions.

**Step 2: Run tests to verify they fail**

Run: `pnpm test tests/unit/home-global-management.test.tsx --runInBand`
Expected: FAIL because current screens do not expose the new loading/recovery behavior.

**Step 3: Write minimal implementation**

- Show splash while bootstrapping.
- Add overlay/skeleton hooks for refresh and mutation states.
- Refine error boundary copy and platform-safe actions.

**Step 4: Run tests to verify they pass**

Run: `pnpm test tests/unit/home-global-management.test.tsx --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add src/core src/features/accounts/screens tests/unit/home-global-management.test.tsx
git commit -m "feat: harden bootstrap and recovery flows"
```

### Task 3: Refresh auth and profile experience

**Files:**
- Modify: `src/features/auth/components/AuthFormCard.tsx`
- Modify: `src/features/auth/components/AuthHero.tsx`
- Modify: `src/features/auth/screens/LoginScreen.tsx`
- Modify: `src/features/auth/screens/MyPageScreen.tsx`
- Test: `tests/unit/my-page-screen.test.tsx`

**Step 1: Write the failing tests**

- Add tests for Google/Kakao CTA presence and MyPage save flow staying in-context.

**Step 2: Run tests to verify they fail**

Run: `pnpm test tests/unit/my-page-screen.test.tsx --runInBand`
Expected: FAIL because OAuth CTA and new save behavior are absent.

**Step 3: Write minimal implementation**

- Add OAuth buttons and demo bridge behavior.
- Reduce explanatory copy.
- Keep MyPage save flow on the expected screen with clearer feedback.

**Step 4: Run tests to verify they pass**

Run: `pnpm test tests/unit/my-page-screen.test.tsx --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/auth tests/unit/my-page-screen.test.tsx
git commit -m "feat: refresh auth and profile entry experience"
```

### Task 4: Rework account surfaces for privacy, invite, and cleaner information architecture

**Files:**
- Modify: `src/features/accounts/components/UserHeaderCard.tsx`
- Modify: `src/features/accounts/components/AccountSummaryCard.tsx`
- Modify: `src/features/accounts/components/detail/AccountDetailHeader.tsx`
- Modify: `src/features/accounts/components/detail/AccountDetailHero.tsx`
- Modify: `src/features/accounts/components/EmptyStateCard.tsx`
- Modify: `src/features/accounts/components/detail-tabs/SettingsTab.tsx`
- Modify: `src/shared/lib/feedback-presets.ts`
- Test: `tests/unit/account-management-tabs.test.tsx`

**Step 1: Write the failing tests**

- Add tests for invite copy/share actions, masked amount UI, and settings section restructuring.

**Step 2: Run tests to verify they fail**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx --runInBand`
Expected: FAIL because invite/share and privacy UI do not exist yet.

**Step 3: Write minimal implementation**

- Add invite actions to account surfaces.
- Replace masked amount text with skeleton-based display.
- Reorganize settings into summary/edit blocks and trim empty-state copy.

**Step 4: Run tests to verify they pass**

Run: `pnpm test tests/unit/account-management-tabs.test.tsx --runInBand`
Expected: PASS

**Step 5: Commit**

```bash
git add src/features/accounts src/shared/lib/feedback-presets.ts tests/unit/account-management-tabs.test.tsx
git commit -m "feat: refine account privacy and invite flows"
```

### Task 5: Add release regression coverage and final polish

**Files:**
- Modify: `tests/unit/notification-settings-screen.test.tsx`
- Modify: `tests/unit/home-global-management.test.tsx`
- Modify: `tests/e2e/smoke.spec.ts`
- Modify: `README.md`

**Step 1: Write the failing tests**

- Add coverage for notification/settings regressions, startup shell, and invite/auth smoke paths.

**Step 2: Run tests to verify they fail**

Run: `pnpm test --runInBand`
Expected: FAIL on newly added release coverage before implementation is complete.

**Step 3: Write minimal implementation**

- Fill any remaining UX gaps exposed by the tests.
- Update README only if user-visible startup/auth/share behavior changed materially.

**Step 4: Run tests to verify they pass**

Run: `pnpm test --runInBand && pnpm run ci:web`
Expected: PASS

**Step 5: Commit**

```bash
git add tests README.md
git commit -m "test: add release hardening regression coverage"
```
