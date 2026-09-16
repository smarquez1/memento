# Memento — Mobile Daily Task Organizer

## Product

Mobile-first dark PWA. English only. No accounts, no backend. A calmer alternative to Todoist focused on noticing what was completed during the day.

Three primary screens: **Inbox** (tasks without a date), **Today** (tasks due today + a "Done today" disclosure), **Upcoming** (future tasks sorted ascending). The default view on load is **Today**.

Allowed user actions: add a task, mark complete, delete. Nothing else.

## Visual language

- **Dark only.** No light theme. `color-scheme: dark`.
- Canvas `#101012` (app shell) / `#0a0a0a` (HTML background).
- Surfaces: `#19191d` (sheet, inputs), `#18181b` (inline confirm dialog).
- Text: `#f4f1eb` primary (warm ivory, not pure white), `#85858c` muted.
- Border: `#303037` hairline (1px). Used instead of shadows everywhere except the FAB and the confirm dialog overlay.
- The **only** accent is `#f4f1eb` — it plays three roles: primary text, primary button fill, and FAB fill. No blue/green/red brand color.
- Error state: Tailwind `red-300` for form validation only.
- Scrim behind sheet: `rgba(0,0,0,0.6)`.

## Typography

- **Inter** (declare explicitly; load in Stitch). Fallback `ui-sans-serif, system-ui, sans-serif`.
- H1 screen titles: 30px / 700 / `-0.02em` tracking-tight.
- Sheet title: 18px / 600. Dialog title: 14px / 600.
- Body / task titles / buttons / inputs: 14px (regular for tasks, 500 for primary buttons).
- Form labels, nav labels, meta lines, empty states: 12px.
- FAB glyph `"+"`: 30px / 300. Nav glyphs: 16px / 400, `leading-none`.
- Completed task titles drop to `#85858c` and gain `line-through`.

## Spacing & sizing

- Mobile shell: 100% width up to `max-w-xl` (576px), horizontally centered.
- Side gutters: 24px. Top padding: 32px. Bottom padding: 160px (clears fixed nav + FAB).
- Form grid: 2-column for short paired fields (Priority / Effort), 16px gap.
- Radius: 4px ghost, 8px inputs/buttons/dialogs, 16px top-only for the sheet, full for the FAB and the circular task toggle.
- **Touch targets ≥ 44px** everywhere. Task row 64px. Bottom-nav item 56px. FAB 64px (with `shadow-lg shadow-black/40`, the one floating element).
- Bottom nav and bottom sheet respect `env(safe-area-inset-bottom)`.

## Components

### Bottom navigation
Fixed to the bottom edge, full width, 1px top hairline in `#303037`. Three equally weighted items: **Inbox**, **Today**, **Upcoming**. Background `bg-[#101012]/95` with `backdrop-blur` (graceful fallback `bg-[#101012]/85`). Selected: `text-[#f4f1eb]` + `aria-current="page"`. Unselected: `text-[#85858c]`. Icon glyphs (Unicode, thin): `▦` Inbox, `○` Today, `▤` Upcoming. Label: 12px / 500. Sole animation: `transition-colors`.

### FAB
The only floating element on the screen. 64×64 circle, `bg-[#f4f1eb]`, `text-[#101012]`, `shadow-lg shadow-black/40`. Glyph `"+"` at 30px `font-light`. Positioned bottom-right above the nav. On close, focus returns to the FAB.

### Task row
`<li>`: 64px tall, bottom hairline in `#303037`, flex row. **Toggle** (44×44 tap target wrapping a 22px circle, `border-2`): unchecked = `border-[#303037]` empty, checked = `bg-[#f4f1eb] border-[#f4f1eb] text-[#101012]` with `✓`. **Title** 14px; completed = `#85858c line-through`. **Subline** 12px `#85858c truncate`, format `"{dueDate}  ·  {description}"` (description omitted when empty). **Delete** affordance: 44×44 ghost `×` glyph. **Delete confirm**: inline alert `rounded-lg border border-[#303037] bg-[#18181b] p-4 shadow-xl` with right-aligned Cancel (ghost) + Delete (outline) buttons.

### Composer (bottom sheet)
Scrim `bg-black/60`. Panel: `fixed inset-x-0 bottom-0 max-w-xl mx-auto rounded-t-2xl border-t border-[#303037] bg-[#19191d] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]`. Sheet title `text-lg font-semibold`. Field labels 12px `#85858c mb-1`. Fields: `w-full rounded-lg border border-[#303037] bg-[#19191d] px-4 py-3 text-sm text-[#f4f1eb] placeholder:text-[#85858c] focus:border-[#f4f1eb] focus:outline-none`. Fields: Title, Description, When (YYYY-MM-DD), Priority (select), Effort (select). Footer `flex gap-3` with Cancel (outline) and Save (primary, `disabled:opacity-60` when title empty). Closes on Escape; focus returns to FAB.

### Empty states
One line of 12px `#85858c` text, no illustrations:
- Today: `"A calm day. Nothing scheduled."`
- Inbox: `"Nothing here yet."`
- Upcoming: `"Nothing scheduled ahead."`
- Today's "Done" group empty: `"Nothing completed yet."`

### "Done today" disclosure (Today view only)
Native `<details>`/`<summary>` at the bottom of the list. Wrapper `mt-8 border-t border-[#303037] pt-4`. Summary: full-width tap target, label `"Done today (N)"` in 14px `#85858c`. Marker hidden via `[&::-webkit-details-marker]:hidden`. Inside, render completed tasks for today using the same `TaskRow` style.

### Focus
- Buttons and tap targets: `focus-visible:outline-2 focus-visible:outline-[#f4f1eb] focus-visible:outline-offset-2`.
- Form inputs: `focus:border-[#f4f1eb] focus:outline-none`.
- Visible focus is mandatory on every interactive element. Never remove outlines globally.

## Screens

All three screens share the same shell: `<section>` with H1 + subtitle, followed by either a list of `TaskRow`s or a one-line empty state.

1. **Today** — H1 `"Today"`, subtitle = today's ISO date `YYYY-MM-DD` (UTC). Body: active tasks for today, then the `Done today (N)` disclosure.
2. **Inbox** — H1 `"Inbox"`, subtitle `"{N} task(s) without a date"` (singular "task" when N=1). Body: all tasks with no due date, sorted by insertion order.
3. **Upcoming** — H1 `"Upcoming"`, subtitle `"{N} task(s) ahead"` (singular when N=1). Body: tasks with a future due date, sorted ascending by date.

## Motion

Memento is intentionally still. The only transition in the app is `transition-colors` on the bottom-nav buttons. No keyframes, no sheet slide-ups, no celebration effects on task completion. Composer mounts and unmounts instantly. Always respect `prefers-reduced-motion`.

## Iconography

No icon library. Every glyph is a single Unicode character: `▦` Inbox, `○` Today, `▤` Upcoming, `✓` checked, `×` delete, `+` FAB.

## Brand mark

`/public/icon.svg` is the app icon: a 512×512 rounded square (`rx=112`) filled `#101012`, with a centered ivory (`#f4f1eb`) capital **M** in Inter 600 at 260px.

## Accessibility

- Visible focus on all interactive elements.
- Touch targets ≥ 44×44.
- Honor `prefers-reduced-motion`.
- Focus restoration: closing the composer returns focus to the FAB; activating the delete confirm returns focus to the row.
- Escape closes the composer.
