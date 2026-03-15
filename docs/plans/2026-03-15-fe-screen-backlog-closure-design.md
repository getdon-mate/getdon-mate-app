# FE Screen Backlog Closure Design

**Date:** 2026-03-15
**Scope:** Close remaining screen-related `FE`, `Design`, `QA`, and `Content` backlog issues in the Getdon Linear workspace. Excludes backend and infra work.

## Goal

Bring the current frontend from partial v0.1 polish to a state where all remaining screen-facing backlog items have an implemented, verified, and consistent UI path. Each closed issue must map to shipped code or explicit validation coverage.

## Current Context

The app already has:

- Auth, list, detail, dues, transactions, members, statistics, calendar, board, notifications, and settings screens
- Mock-data-first local state with product-style empty, loading, and reminder flows
- Repeated `unit`, `ci:web`, and `e2e` verification on `main`

The remaining backlog is mostly refinement work:

- auth error and fallback flows
- density and hierarchy fixes on small screens
- interaction polish for transactions, members, board, notifications, and settings
- chart, calendar, and summary readability
- content and QA issues that should close together with screen changes

## Recommended Approach

Use domain-based closure batches instead of issue-by-issue edits.

### Option 1: Domain batches

- Batch 1: auth and onboarding
- Batch 2: home, detail, dues, transactions, members
- Batch 3: statistics, calendar, board, notifications, settings

Pros:

- keeps changes coherent
- makes regression testing practical
- lets Linear status updates follow real shipped batches

Cons:

- individual issue closure happens later inside each batch

### Option 2: Fast micro-fixes

- close small FE issues first, then come back for QA/content/design cleanup

Pros:

- issue count drops quickly

Cons:

- poor verification discipline
- likely to reopen QA/design gaps

### Option 3: Test-first backlog closure

- expand automated coverage first, then touch screens

Pros:

- strong regression safety

Cons:

- delays visible product improvements

## Decision

Choose **Option 1**. The codebase already has decent coverage and stable structure. The remaining work is mostly product-fit polish, so grouped delivery is the fastest way to close issues without producing fragmented UX.

## Architecture and Change Shape

### Batch 1: Auth and onboarding

Primary files:

- `src/features/auth/screens/LoginScreen.tsx`
- `src/features/auth/components/AuthFormCard.tsx`
- `src/features/auth/components/AuthHero.tsx`
- `src/features/auth/hooks/useAuthForm.ts`
- `src/features/auth/screens/MyPageScreen.tsx`
- `src/features/accounts/screens/AccountCreateScreen.tsx`
- `src/shared/ui/primitives/SplashScreen.tsx`
- `src/shared/ui/primitives/SpinnerOverlay.tsx`
- `src/AppRouter.tsx` or equivalent app entry routing file if needed

Focus:

- login/signup language cleanup
- failure and recovery states
- guest/unauthed route messaging
- session restore fallback
- first-entry shell and loading experience

### Batch 2: Core operating screens

Primary files:

- `src/features/accounts/screens/AccountListScreen.tsx`
- `src/features/accounts/components/UserHeaderCard.tsx`
- `src/features/accounts/components/AccountSummaryCard.tsx`
- `src/features/accounts/components/detail/AccountDetailHero.tsx`
- `src/features/accounts/components/detail-tabs/DuesTab.tsx`
- `src/features/accounts/components/detail-tabs/TransactionsTab.tsx`
- `src/features/accounts/components/detail-tabs/MembersTab.tsx`
- `src/features/accounts/components/MemberRow.tsx`
- selectors and fixture files under `src/features/accounts/model`

Focus:

- hierarchy and density on small screens
- summary emphasis rules
- dues month selection and reminder language
- transaction edit/delete feedback and filter state clarity
- member role, payment ratio, delegation, and deletion restriction messaging

### Batch 3: Extended tabs and account settings

Primary files:

- `src/features/accounts/components/detail-tabs/StatisticsTab.tsx`
- `src/features/accounts/components/detail-tabs/CalendarTab.tsx`
- `src/features/accounts/components/detail-tabs/BoardTab.tsx`
- `src/features/auth/screens/NotificationListScreen.tsx`
- `src/features/auth/screens/NotificationSettingsScreen.tsx`
- `src/features/auth/screens/AppSettingsScreen.tsx`
- shared UI primitives used by these screens

Focus:

- chart readability and period controls
- calendar badges, colors, and selected-day list density
- board post type distinction and composer/comment feedback
- notification filter/action clarity
- settings information hierarchy

## Testing Strategy

Every batch must end with:

- targeted unit tests for changed behavior
- `pnpm test --runInBand`
- `pnpm run ci:web`
- `pnpm test:e2e`

Additional e2e coverage will be added only where the backlog item represents a meaningful interaction gap, for example:

- auth error and fallback flows
- dues month selection
- transaction feedback flows
- board posting/commenting
- notification filtering and action handling

## Linear Closure Rules

Only mark an issue `Done` when one of the following is true:

- the exact screen behavior is implemented and verified
- the related content/design issue is resolved by shipped copy/layout changes
- the QA issue is satisfied by added or validated automated coverage

Do not close:

- backend issues
- infra issues
- anything blocked by workspace limitations outside frontend scope

## Risks

- Some FE issues are broad and overlap. Closing too aggressively without feature parity would create false completion.
- Existing tests are strong but mostly route/state oriented; interaction polish may require extra assertions.
- Visual density changes can regress web layout while fixing mobile layout.

## Mitigations

- Close issues in domain batches, not one by one while coding
- Add targeted tests before or alongside behavior changes
- Re-run full verification after each batch and once more before merge
