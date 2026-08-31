---
name: memento-verification
description: Plan and execute deterministic evidence for Memento changes, including GitHub issue tracking.
---

# Memento Verification

Use this skill before non-trivial changes and when closing an issue.

## Evidence Path

1. Name the behavior that must become true.
2. Identify the state transition, boundary, and failure mode that matter.
3. Choose the narrowest direct evidence: domain test, repository test, or
   Playwright scenario.
4. Make time, IDs, storage, and network state controllable.
5. Run the evidence and record the result in the issue.

## Determinism

- Use explicit ISO timestamps and `UTC`.
- Use fixed IDs in unit tests.
- Reset IndexedDB between browser scenarios once persistence exists.
- Use Playwright `page.clock` for browser time-dependent behavior.
- Avoid real network calls in tests.

## Issue Workflow

- Use an existing issue when the work is already tracked.
- Create a feature issue with the repository template when scope is new.
- Add `status:approved` before opening a PR.
- Set the Project `Priority` and `Phase` fields.
- Close an issue only after implementation and verification evidence are
  published in a comment.

## Required Checks

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm test:e2e
```

If a check cannot run, report the exact command and the blocker instead of
claiming completion.
