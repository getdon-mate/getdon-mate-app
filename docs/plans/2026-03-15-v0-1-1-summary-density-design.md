# v0.1.1 Summary Density and CTA State Polish Design

## Goal

Tighten the home and detail summary surfaces so they feel lighter on mobile, and make empty-state/CTA messaging more consistent across the account list and member management flows.

## Scope

- Reduce padding and visual bulk in the list header, summary cards, and detail hero on narrow screens.
- Shorten empty-state copy in the account list and member tab.
- Make "working" button states feel more intentional without changing behavior.

## Approaches Considered

1. Copy-only pass
   - Low risk, but leaves the densest home/detail cards oversized on mobile.
2. Focused density pass
   - Update the existing cards and empty states in place.
   - Best fit for the current polish loop.
3. Shared layout primitive refactor
   - More reusable, but unnecessary for the current release cadence.

Chosen approach: option 2.

## UI Decisions

### AccountListScreen

- Keep the current structure.
- Shorten the empty-state description to a concise action-oriented line.
- Keep the creation CTA, but make the empty state feel less tutorial-like.

### AccountSummaryCard and UserHeaderCard

- Add compact spacing and typography rules for narrow widths.
- Keep the existing visual direction and interaction model.

### AccountDetailHero

- Reduce outer padding and action spacing on narrow widths.
- Keep the balance masking behavior unchanged.

### MembersTab

- Shorten the filtered-empty state copy.
- Keep the form and reminder actions unchanged.

## Testing

- Add failing tests for the updated account-list empty-state copy and member filtered-empty copy.
- Keep layout changes lightweight and verified by the existing e2e regression suite plus the full unit/web run.
