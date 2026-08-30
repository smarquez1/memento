# Memento Agent Guide

## Product

Memento is a mobile-first, dark-only task organizer focused on noticing what
was completed during the day. The MVP is an English-language PWA with local
storage and no account or backend dependency.

Keep the MVP scope explicit. Do not add subtasks, projects, reminders,
gestures, natural-language capture, reports, accounts, Todoist sync, or a light
theme unless an issue changes the scope.

## Repository Map

- `apps/web`: React, TypeScript, Vite, Tailwind, PWA, and browser adapters.
- `packages/core`: framework-independent task types and domain rules.
- `e2e`: Playwright scenarios for mobile browser behavior.
- `docs/plan.md`: product scope, architecture direction, and deferred phases.
- `.opencode/skills`: reusable instructions for AI-assisted work in this repo.

## Architecture Rules

- Keep business rules in `packages/core`.
- `packages/core` must not import React, Dexie, browser APIs, Todoist, or a
  backend framework.
- Keep persistence and browser concerns in `apps/web` adapters.
- Prefer pure functions and immutable state transitions in the domain.
- Use explicit ports when a boundary will have more than one implementation.
- Do not introduce a backend until the local MVP behavior is validated.

## Working Agreement

- Before changing code, identify the GitHub issue being implemented.
- Search existing issues before creating a new one.
- Keep one coherent behavior per commit.
- Use conventional commit messages and reference the issue when appropriate.
- Do not open a PR for an issue without `status:approved`.
- Keep tests and documentation with the behavior they verify or explain.
- Do not commit secrets, generated output, `node_modules`, or build metadata.
- Do not rewrite history or discard unrelated user changes.

## Verification

Run the smallest relevant checks during iteration, then run the full set before
reporting completion:

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
```

The AI harness is the combination of this guide, the local skills, issue
tracking, deterministic test support, and the verification commands. Treat
tests as evidence, not as a substitute for understanding the behavior.

For time-dependent scenarios, use fixed timestamps and UTC unless the behavior
under test is specifically about another timezone. For browser scenarios,
reset state between tests and prefer accessible locators over CSS structure.

## UI Direction

- Preserve the mobile-first dark visual language.
- Support Inbox, Today, and Upcoming as the primary navigation.
- Keep touch targets usable and account for safe areas.
- Preserve visible focus states and reduced-motion behavior.
- Use English UI copy unless the product decision changes.

## Useful Commands

```sh
pnpm dev
pnpm test:e2e
pnpm test:e2e:ui
gh issue list --repo smarquez1/memento --state open
gh project item-list 5 --owner smarquez1
```

## Definition Of Done

A change is complete when its issue acceptance criteria are met, the relevant
tests pass, the full verification set passes when practical, the diff is
reviewable, and the issue or commit records the evidence.
