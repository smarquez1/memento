---
name: memento-ui
description: Build Memento's mobile-first dark UI while preserving accessibility and product scope.
---

# Memento UI

Use this skill for the React application shell, navigation, task composer,
task rows, empty states, and responsive visual behavior.

## Rules

- Start from the approved mobile flow in the design issue.
- Keep Inbox, Today, and Upcoming as the primary navigation model.
- Prefer semantic HTML and accessible names over styling-driven selectors.
- Keep keyboard focus visible and restore focus after dialogs or sheets close.
- Respect `prefers-reduced-motion` and mobile safe-area insets.
- Keep the dark theme and English copy consistent with the MVP.
- Do not place domain rules or persistence calls directly in presentational
  components when an application boundary is appropriate.

## Workflow

1. Confirm the target issue and its acceptance criteria.
2. Identify the user state transitions and the smallest UI surface for them.
3. Implement the mobile layout first, then check the desktop width.
4. Add accessible interaction tests for the changed behavior.
5. Verify with Playwright at Android and iPhone-sized viewports.

## Evidence

Use role- and label-based Playwright locators. Verify visible focus, sheet
open/close behavior, safe-area spacing, and reduced-motion behavior where the
change affects them.
