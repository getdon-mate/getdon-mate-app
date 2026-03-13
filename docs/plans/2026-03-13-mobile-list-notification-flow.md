# Mobile List Notification Flow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Simplify the mobile account list screen by removing demo status banners, moving account actions into settings only, and adding notification list access plus native-feeling refresh interactions.

**Architecture:** Keep the existing stack navigator and provider model. Update the list/header composition so the user card only presents profile context and notification entry, add a dedicated notifications screen, and use `RefreshControl` for mobile pull-to-refresh while preserving the explicit refresh action near the account list heading.

**Tech Stack:** Expo React Native, React Navigation Native Stack, existing shared UI primitives, AppProvider runtime refresh flow.

---

### Task 1: Remove banner-driven account list noise

**Files:**
- Modify: `src/features/accounts/screens/AccountListScreen.tsx`
- Modify: `src/features/auth/screens/LoginScreen.tsx`
- Modify: `src/features/accounts/screens/AccountCreateScreen.tsx`

### Task 2: Rebuild the account list header actions for mobile

**Files:**
- Modify: `src/features/accounts/components/UserHeaderCard.tsx`
- Modify: `src/features/accounts/screens/AccountListScreen.tsx`
- Modify: `src/shared/ui/primitives/PageHeader.tsx` or list screen-local header wrapper if needed

### Task 3: Add dedicated notification list navigation

**Files:**
- Create: `src/features/auth/screens/NotificationListScreen.tsx`
- Modify: `src/core/navigation/routes.ts`
- Modify: `src/core/navigation/types.ts`
- Modify: `src/core/AppRouter.tsx`

### Task 4: Verify mobile-facing interactions still build

**Files:**
- Verify only

