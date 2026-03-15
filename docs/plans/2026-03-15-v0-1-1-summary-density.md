# v0.1.1 Summary Density and CTA State Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

## Overview

Polish the highest-frequency summary surfaces and align empty-state/CTA messaging. Keep the work local to the current home and detail components.

## Tasks

1. Inspect:
   - `src/features/accounts/screens/AccountListScreen.tsx`
   - `src/features/accounts/components/AccountSummaryCard.tsx`
   - `src/features/accounts/components/UserHeaderCard.tsx`
   - `src/features/accounts/components/detail/AccountDetailHero.tsx`
   - `src/features/accounts/components/detail-tabs/MembersTab.tsx`
   - `tests/unit/home-global-management.test.tsx`
   - `tests/unit/account-management-tabs.test.tsx`
2. Add failing tests for:
   - the shorter account-list empty-state copy
   - the shorter member filtered-empty copy
3. Run the targeted unit tests and confirm they fail.
4. Implement compact spacing rules in the summary/header/hero cards and update the empty-state copy.
5. Run targeted unit tests until green.
6. Run:
   - `pnpm test --runInBand`
   - `pnpm run ci:web`
   - `pnpm test:e2e`
7. Merge into `main`, rerun the same verification suite on `main`, push, and clean up the worktree.
