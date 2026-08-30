# Memento

Memento is a mobile-first task organizer focused on noticing what was done during the day, not only on what remains unfinished. The first release will be a dark, English-language PWA with local persistence and a calm, minimal interface.

## Quick path

1. Build the local task loop: create, schedule, complete, undo, and delete.
2. Validate the experience on iOS and Android-sized viewports.
3. Add deferred capabilities in phases without coupling the domain to a backend or provider.

## Phase 1: MVP local

- React, TypeScript, Vite, and Tailwind CSS.
- Dark theme only; English UI.
- Mobile-first layout with a bottom navigation bar.
- Inbox, Today, and Upcoming views.
- Floating action button and bottom-sheet task composer.
- Tasks with action title, description, and optional date.
- Optional priority: no priority, low, medium, or high.
- Optional effort: no effort, low, medium, or high.
- Quick rescheduling: Tomorrow, Later this week, Weekend, and Next week.
- Complete, undo, and a collapsible Done today section.
- Deletion with confirmation.
- Local persistence with IndexedDB through Dexie.
- Installable PWA and offline startup.
- Basic verification harness with controllable time, deterministic scenarios, and mobile Playwright coverage.

The MVP does not include subtasks, projects or lists, natural-language input, calendar search, reminders, gestures, custom recurrence, light theme, reports, accounts, or Todoist synchronization.

## Phase 2: Refinement

- Simple recurrence: Daily, Weekdays, Weekly, Monthly, and Yearly.
- Motion for React for purposeful transitions and micro-interactions.
- Progressive vibration feedback on Android.
- Accessibility, empty states, error recovery, and device testing.

## Phase 3: Todoist integration

Todoist is a temporary synchronization provider, not part of the Memento domain model.

- Choose the backend framework from Fastify, NestJS with FastifyAdapter, AdonisJS, and Hono.
- Add OAuth through the Memento backend.
- Import all supported Todoist resources: tasks, completed tasks, projects, lists, labels, and other supported entities.
- Make full import repeatable and idempotent through `(provider, remoteId)` upserts.
- Use `sync_token=*` for full import and incremental tokens for normal synchronization.
- Import all completed history permitted by the API, paginating completion windows of up to three months.
- Add an outbox for offline writes and UUID-based idempotent commands.
- Use webhooks only as synchronization hints; incremental sync remains the source of truth.
- Preserve remote payloads for Todoist features not yet represented in the Memento UI.
- Add conflict detection before enabling full bidirectional writes.

The Memento model keeps provider references separate from domain entities:

```text
localTaskId -> provider: "todoist" -> remoteTaskId
```

Memento-specific fields such as effort remain Memento metadata because Todoist does not provide arbitrary custom fields for this use case.

## Phase 4: Daily reflection

- Manual Close day action.
- Automatic daily report at 20:00.
- Postpone report.
- Prompt to add anything remembered before generating the report.
- Completed task and effort statistics.
- Re-scheduled pending tasks.
- Guided reflection.
- Weekly report.

## Phase 5: Expansion

- Calendar and date search.
- Natural-language task capture.
- Custom recurrence.
- Light theme.
- Mobile gestures.
- Hours and reminders.
- Memento accounts and first-party synchronization.
- Alexa, Home Assistant, and Google Assistant integrations through a stable Memento command/query API.

## Architecture direction

```text
apps/web       React PWA
apps/api       replaceable HTTP backend
packages/core  domain types and rules
packages/test-support
e2e/            browser scenarios
```

The core package must not import React, Dexie, Todoist, or a backend framework. The web app and API depend on the core through ports and adapters. This keeps the frontend replaceable by Svelte and the backend replaceable by Rails, Phoenix, or another implementation.

## UI direction

- Minimal dark interface inspired by Todoist's mobile information hierarchy.
- Bottom navigation for Inbox, Today, and Upcoming.
- Floating add button above the navigation bar.
- Bottom-sheet composer that receives focus and closes after saving.
- Clear touch targets, safe-area handling, visible focus states, and reduced-motion support.
- Use Base UI for accessible unstyled primitives, Tailwind for visual design, and Motion for React for selected animations.

## Verification harness

- Controllable clock and timezone.
- In-memory repositories for core behavior.
- Deterministic ID generation.
- Seed scenarios for empty, today, overdue, completed, recurring, and offline states.
- Resettable IndexedDB between browser scenarios.
- Fake Todoist provider for full sync, incremental sync, retries, deleted resources, and conflicts.
- Playwright coverage for mobile Safari and Android-sized Chromium viewports.
- Checks for keyboard focus, safe areas, bottom-sheet behavior, accessibility, reduced motion, PWA manifest, service worker, installability, and offline startup.

## Initial work units

1. Initialize the repository and monorepo.
2. Create the verification harness foundation.
3. Design and approve the mobile dark UI flow.
4. Implement the domain and local persistence.
5. Implement the application shell, navigation, and task composer.
6. Implement task views, completion, deletion, and rescheduling.
7. Add PWA behavior and mobile browser verification.
8. Evaluate backend candidates with a small API spike.
9. Implement Todoist integration as a separate workstream.
