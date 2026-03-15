# v0.1.1 Density and Calendar Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

## Overview

Polish dense interaction surfaces in account detail tabs and improve calendar navigation without introducing backend dependencies. Use TDD for behavior changes and keep the work local to the existing tab architecture.

## Tasks

1. Read the existing tab and notification implementations in:
   - `src/features/accounts/components/detail-tabs/TransactionsTab.tsx`
   - `src/features/accounts/components/detail-tabs/BoardTab.tsx`
   - `src/features/accounts/components/detail-tabs/CalendarTab.tsx`
   - `src/features/auth/screens/NotificationListScreen.tsx`
2. Write a failing unit test for calendar month navigation in `tests/unit/account-management-tabs.test.tsx`.
3. Run the targeted unit test and confirm it fails for the missing month navigation controls.
4. Write a failing unit expectation for shortened notification copy in `tests/unit/notification-list-screen.test.tsx`.
5. Run the notification unit test and confirm it fails.
6. Add an e2e assertion in `tests/e2e/navigation-auth-regression.spec.ts` for calendar month switching.
7. Implement calendar `visibleMonth` state and previous/next month controls in `src/features/accounts/components/detail-tabs/CalendarTab.tsx`.
8. Verify the new calendar unit and e2e selectors are satisfied locally.
9. Tighten composer density in `src/features/accounts/components/detail-tabs/TransactionsTab.tsx`.
10. Tighten board composer/comment density in `src/features/accounts/components/detail-tabs/BoardTab.tsx`.
11. Shorten notification header/empty-state copy in `src/features/auth/screens/NotificationListScreen.tsx`.
12. Run targeted unit tests for tabs and notifications.
13. Run the full verification suite:
    - `pnpm test --runInBand`
    - `pnpm run ci:web`
    - `pnpm test:e2e`
14. Merge the branch into `main`, rerun the same verification suite on `main`, and push.
