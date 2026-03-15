# v0.1.1 Density and Calendar Polish Design

## Goal

Reduce visual bulk in high-frequency input areas, make the calendar usable across months, and tighten notification copy so day-to-day 운영 flows feel lighter without introducing backend dependencies.

## Scope

- Compress the transaction composer and board composer so they read as intentional inline tools instead of full-page forms.
- Add previous/next month navigation to the calendar tab while preserving the selected-date focus list.
- Shorten notification header and empty-state copy so the screen reads faster on mobile.

## Approach Options

1. Minimal copy-only pass
   - Fastest, but leaves the calendar locked to a single month and does not address dense input layouts.
2. Focused polish pass
   - Adjust local layout, copy, and calendar navigation without changing app structure.
   - Best balance for current release hardening.
3. Structural refactor
   - Split tab sections into new primitives before polishing.
   - Higher cleanup value, but unnecessary for this iteration.

Chosen approach: option 2.

## UI and Data Flow

### Transactions

- Keep the existing transaction form behavior and validation.
- Tighten vertical spacing and move type chips into a compact row.
- Make the filter card read as a collapsed utility tray rather than a standalone section.

### Board

- Turn the writer into a denser composer with shorter helper copy and a smaller pinned toggle row.
- Keep inline comments, but make the comment composer less tall and easier to scan.

### Calendar

- Replace the fixed month view with a local `visibleMonth` state initialized from the latest event month.
- Add previous and next month controls and a visible month label.
- When switching months, keep the selected date inside the visible month; if the previous selection falls outside the new month, snap to the first date in that month that has events, otherwise the first day.

### Notifications

- Keep the existing filter chips.
- Reduce explanatory copy in the header and empty states to avoid a verbose settings feel.

## Error Handling

- Existing input validation remains unchanged.
- Calendar month navigation is purely local state; no new async or failure path is introduced.

## Testing

- Add unit coverage for calendar month navigation behavior.
- Extend notification screen tests to assert the shortened copy and filter behavior still work.
- Extend e2e with a month navigation assertion in the calendar tab.
