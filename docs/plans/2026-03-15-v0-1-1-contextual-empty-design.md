# v0.1.1 Contextual Empty State and Compact Card Polish Design

## Goal

Reduce the last "placeholder" feeling in secondary tabs by tightening empty-state copy, making notification card actions lighter on mobile, and shaving a little more bulk from small-screen cards.

## Scope

- Shorten and productize empty-state copy in statistics, calendar, and board tabs.
- Make unread notification actions feel lighter on narrow screens.
- Reduce excess spacing in chart and event cards for small widths without changing the information architecture.

## Options Considered

1. Copy-only pass
   - Fastest, but leaves compact layout issues visible on mobile.
2. Focused polish pass
   - Adjust copy and spacing in the current components only.
   - Best fit for this release hardening loop.
3. New layout primitives
   - More reusable, but too broad for the current stage.

Chosen approach: option 2.

## UI Decisions

### StatisticsTab

- Keep the existing summary and bar charts.
- Replace explanatory empty states with shorter, action-oriented copy.
- Tighten chart spacing on smaller screens.

### CalendarTab

- Keep month navigation and selected-day focus.
- Shorten the no-events copy so it reads like a state, not guidance text.
- Slightly reduce event card padding on narrow widths.

### BoardTab

- Keep the composer and inline comments.
- Shorten the board empty state and make it read like an invitation to post, not a feature explanation.

### NotificationListScreen

- Keep the contextual restore/reset behavior from the previous pass.
- Shorten unread button text to `읽음` on narrow widths and reduce CTA footprint.
- Tighten card spacing for narrow screens.

## Testing

- Add failing unit tests for the new empty-state copy in board/statistics tabs.
- Add a unit test covering the compact notification read label on narrow screens.
- Re-run the full unit, web, and e2e suites after the layout polish.
