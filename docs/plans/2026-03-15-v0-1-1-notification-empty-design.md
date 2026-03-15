# v0.1.1 Notification and Empty State Polish Design

## Goal

Make notification management feel more intentional, reduce dead-end empty states, and tighten density on smaller screens without introducing structural churn.

## Scope

- Refine notification actions so clearing, reading, restoring, and resetting filters are easier to understand.
- Distinguish between "no notifications at all" and "no results for this filter" in the notification screen.
- Tighten `EmptyStateCard` and the detail tab bar on narrow widths so screens feel less oversized on mobile.

## Approaches Considered

1. Copy-only pass
   - Low risk, but leaves empty states and notification actions feeling blunt.
2. Focused interaction polish
   - Keep current architecture, improve contextual actions and compact density in the existing components.
   - Best fit for this release pass.
3. Shared design-system refactor
   - More reusable, but too broad for the current product-hardening iteration.

Chosen approach: option 2.

## Component Design

### NotificationListScreen

- Keep filter chips.
- Add contextual empty states:
  - If there are no notifications at all, show restore action.
  - If notifications exist but the selected filter returns none, show a quick reset action back to `all`.
- Make the top action controls shorter on narrow widths and disable irrelevant actions where appropriate.

### EmptyStateCard

- Support an optional secondary action so screens can offer both "recover" and "reset filter" style actions.
- Slightly reduce title/description/button density on narrow widths.

### DetailTabBar

- Further reduce pill width and horizontal padding for very narrow devices.
- Preserve current visual language and avoid adding overflow affordances beyond the existing horizontal scroll.

## Error Handling

- All new actions remain local UI state or existing runtime callbacks.
- Filter reset is synchronous local state.
- Restore and clear continue using existing runtime functions.

## Testing

- Add unit tests for notification clear/restore and filtered-empty reset behavior.
- Add a unit test for `EmptyStateCard` secondary action rendering.
- Extend e2e to cover clearing notifications and restoring them from the empty state.
