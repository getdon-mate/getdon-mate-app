# v0.1.1 Contextual Empty State and Compact Card Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

## Overview

Polish the remaining secondary tab empty states and reduce compact-card bulk on mobile. Keep changes local to the tab components and notification list.

## Tasks

1. Inspect:
   - `src/features/accounts/components/detail-tabs/StatisticsTab.tsx`
   - `src/features/accounts/components/detail-tabs/CalendarTab.tsx`
   - `src/features/accounts/components/detail-tabs/BoardTab.tsx`
   - `src/features/auth/screens/NotificationListScreen.tsx`
   - `tests/unit/account-management-tabs.test.tsx`
   - `tests/unit/notification-list-screen.test.tsx`
2. Add failing unit tests for:
   - statistics empty-state copy
   - board empty-state copy
   - compact notification read button label
3. Run the targeted unit tests and confirm the new expectations fail.
4. Implement the copy and compact-layout adjustments in the tab and notification components.
5. Run targeted unit tests until green.
6. Run:
   - `pnpm test --runInBand`
   - `pnpm run ci:web`
   - `pnpm test:e2e`
7. Merge the branch into `main`, rerun the same verification suite on `main`, push, and clean up the worktree.
