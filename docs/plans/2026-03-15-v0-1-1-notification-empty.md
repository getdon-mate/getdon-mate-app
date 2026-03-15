# v0.1.1 Notification and Empty State Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

## Overview

Polish notification operations and empty states with minimal surface-area changes. Use TDD to lock the new contextual empty-state behavior before touching the implementation.

## Tasks

1. Inspect:
   - `src/features/auth/screens/NotificationListScreen.tsx`
   - `src/features/accounts/components/EmptyStateCard.tsx`
   - `src/features/accounts/components/detail/DetailTabBar.tsx`
   - `tests/unit/notification-list-screen.test.tsx`
   - `tests/e2e/navigation-auth-regression.spec.ts`
2. Write a failing unit test in `tests/unit/notification-list-screen.test.tsx` for:
   - clear action callback
   - filter-empty state showing `전체 보기`
3. Run the notification unit test and confirm it fails for the new expectations.
4. Add a failing unit test file or test case for `EmptyStateCard` secondary action rendering.
5. Run the targeted empty-state unit test and confirm it fails.
6. Add an e2e assertion in `tests/e2e/navigation-auth-regression.spec.ts` for clearing notifications and restoring them.
7. Implement contextual notification empty states and narrow-width action labels in `src/features/auth/screens/NotificationListScreen.tsx`.
8. Implement optional secondary action and compact spacing in `src/features/accounts/components/EmptyStateCard.tsx`.
9. Tighten small-width tab density in `src/features/accounts/components/detail/DetailTabBar.tsx`.
10. Run targeted unit tests until green.
11. Run:
    - `pnpm test --runInBand`
    - `pnpm run ci:web`
    - `pnpm test:e2e`
12. Merge validated work into `main`, rerun the same three commands on `main`, push, and clean up the worktree.
