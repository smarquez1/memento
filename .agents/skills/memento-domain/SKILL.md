---
name: memento-domain
description: Implement or review Memento task rules in packages/core without leaking framework concerns.
---

# Memento Domain

Use this skill for task creation, completion, undo, deletion, rescheduling,
view predicates, validation, or domain model changes.

## Rules

- Keep code in `packages/core` unless an adapter is required.
- Use pure functions and return new values instead of mutating tasks.
- Represent calendar dates as `YYYY-MM-DD` and timestamps as ISO strings.
- Keep optional priority and effort values explicit.
- Do not import React, Dexie, browser APIs, Todoist, or backend frameworks.
- Define invalid-input behavior before implementing it.

## Workflow

1. Read the relevant issue and current task model.
2. State the invariant or transition that must become true.
3. Add focused tests for valid, invalid, and unchanged-input cases.
4. Implement the smallest pure operation that satisfies the tests.
5. Run `pnpm --filter @memento/core test` and typecheck.
6. Run the root checks before closing the issue.

## Evidence

Tests should make timestamps, IDs, dates, and input values explicit. Avoid
assertions that depend on the current clock or machine timezone.
