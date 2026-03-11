# GET-10 AI Generated Source Intake Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorganize the current Expo-generated Getdon FE app into an app/features/shared structure, remove obvious hardcoding and stale package-manager artifacts, and keep the app typecheckable with pnpm as the current package manager.

**Architecture:** Keep the runtime as a single Expo React Native app. Move view routing and provider code into `src/app`, split feature-specific screens and mock domain data under `src/features`, and leave only generic reusable utilities in `src/shared`. Remove stale assumptions from the previous Next.js source intake where they still affect package-management or code organization.

**Tech Stack:** Expo 52, React Native 0.76, TypeScript, pnpm

---

### Task 1: Normalize project structure

**Files:**
- Create: `src/app/AppRouter.tsx`
- Create: `src/app/providers/AppProvider.tsx`
- Create: `src/features/auth/screens/LoginScreen.tsx`
- Create: `src/features/accounts/screens/AccountListScreen.tsx`
- Create: `src/features/accounts/screens/AccountDetailScreen.tsx`
- Create: `src/features/accounts/model/types.ts`
- Create: `src/features/accounts/model/mock-data.ts`
- Create: `src/shared/lib/date.ts`
- Modify: `App.tsx`

**Step 1:** Move provider and routing concerns out of `App.tsx` and `src/lib/app-context.tsx` into `src/app`.

**Step 2:** Move feature screens into `src/features/auth` and `src/features/accounts`.

**Step 3:** Split account domain types and mock data so screen code no longer imports from a generic `src/lib` bucket.

**Step 4:** Add a shared date helper for current month keys instead of hardcoded month strings in screens.

**Step 5:** Run `pnpm run typecheck` and confirm the structure still compiles.

### Task 2: Remove first-pass hardcoding and duplication

**Files:**
- Modify: `src/app/providers/AppProvider.tsx`
- Modify: `src/features/accounts/screens/AccountListScreen.tsx`
- Modify: `src/features/accounts/screens/AccountDetailScreen.tsx`
- Modify: `src/features/accounts/model/mock-data.ts`

**Step 1:** Replace hardcoded current-month references with a shared helper.

**Step 2:** Keep mock-only defaults inside the feature model layer so UI components depend on data contracts instead of monolithic utility files.

**Step 3:** Preserve current behavior while reducing cross-file coupling and duplicated formatting access patterns.

**Step 4:** Run `pnpm run typecheck` and confirm green status.

### Task 3: Clean package-manager artifacts for current pnpm baseline

**Files:**
- Modify: `.gitignore`
- Modify: `README.md`
- Modify: `pnpm-lock.yaml`

**Step 1:** Ignore local pnpm cache/store directories generated in this workspace.

**Step 2:** Update README to state the current tool baseline explicitly: Expo single FE app, pnpm as package manager.

**Step 3:** Regenerate `pnpm-lock.yaml` so it reflects the current Expo app instead of stale Next.js dependencies.

**Step 4:** Run `pnpm run typecheck` after lockfile refresh and confirm it still passes.
