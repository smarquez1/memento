---
name: google-stitch
description: >
  Generate, browse, and manage AI-designed UI screens and design systems through the Google Stitch MCP server. Use this skill whenever the user wants to create an app or website design with Stitch, generate screens from a written brief (DESIGN.md), list or inspect existing Stitch projects / screens / design systems, extract a design system from a screen, or iterate on a Stitch project. Also use it when the user references an existing Stitch project ID (e.g. `projects/5695159224896516385`), asks "make me an app design for…", "generate screens for…", "what screens are in this project?", "create a design system from this screen", or "upload a DESIGN.md". Stitch is a cloud service: projects, screens, and design systems live on Google's side — there is no local .pen file and no desktop app to keep open. Do NOT use this skill to edit a local .pen document (that's `openpencil`) or to generate designs from a CLI prompt with no Stitch backing (that's `pen-design`).
---

# Google Stitch (stitch MCP)

Stitch is Google's AI design service. The `stitch` MCP server talks to it as a cloud backend: there is no local file, no desktop app, no auth prompt at runtime beyond what the MCP was configured with. The data model is resource-manager style: `projects/{id}` contains `screens/{id}` and `designSystems/{id}`. Screens have **instances** — concrete renderings of a source screen — which are what design systems are derived from.

Unlike `pen-design` (prompt-driven CLI) or `openpencil` (edit a live local document), Stitch is **brief-driven cloud generation**: you upload a `DESIGN.md` describing the product, Stitch generates screens, and you optionally extract a design system from a selected screen instance.

## Setup

Stitch MCP requires only one thing: a registered MCP server with credentials.

```bash
opencode mcp list
```

The `stitch` entry must report `connected`. If it doesn't:

```bash
opencode mcp add stitch --command "npx -y @google/stitch-mcp" --global
# then authenticate in the OpenCode TUI: /mcps → stitch → sign in
```

OAuth is the default auth flow. Do not request or store an API key when OAuth is available — credentials are kept outside the OpenCode config. If `mcp list` reports that stitch needs authentication, tell the user to run `/mcps`, select `stitch`, and complete sign-in. Do not run `opencode mcp auth stitch` from the shell — it starts an interactive flow whose auth link is hidden in background output.

After auth, this should return a non-empty list:

```bash
list_projects()
```

## Staying up to date

This skill mirrors the `@google/stitch-mcp` package and the Stitch REST API surface.

**Check current versions**
```bash
npm view @google/stitch-mcp version   # latest published
```

**If a tool name stops existing**
Stitch's API surface evolves. If a tool listed here returns "Unknown tool", check the package's `CHANGELOG` or Google's Stitch docs for renames. Probe cautiously with empty args — the validation error usually names the missing required field.

## Data model

```
projects/{projectId}                    # a Stitch project
  └── screens/{screenId}                # a source screen
        └── screenInstances/{instanceId} # a concrete rendering of that screen
designSystems/{designSystemId}          # extracted from a selected screen instance
```

Resource names use Google AIP-style paths. When a tool asks for `name` it means the full path (e.g. `projects/5695159224896516385`); when it asks for `projectId` it means just the numeric ID (e.g. `5695159224896516385`). Confusing these is the most common error — read the tool's error message; it usually says which one is expected.

## Tool surface

Confirmed tools on this MCP. Anything not in this list may exist (the catalog advertises 15 tools; 10 are confirmed) — probe before assuming.

### Read

```bash
list_projects()                                # all projects you own
get_project(name="projects/{id}")              # one project, full metadata
list_screens(projectId="{id}")                 # screens in a project
get_screen(...)                                # one screen, instance list, preview URL
list_design_systems(...)                       # design systems (likely scoped)
```

### Write

```bash
create_project()                               # new empty project
delete_project(name="projects/{id}")           # delete a project (irreversible)
upload_design_md(projectId="{id}", designMdBase64="<base64>")  # upload DESIGN.md
create_design_system(...)                      # create a design system
create_design_system_from_design_md(projectId="{id}", selectedScreenInstance={id, sourceScreen})  # extract design system from a screen instance
```

### Important — what the MCP does NOT expose

The catalog advertises 15 tools but only the above 10 are confirmed by probing. There is no `update_project`, `update_screen`, `delete_screen`, `duplicate_screen`, `export_png`, `export_svg`, or `set_theme` exposed via MCP. For those operations, use the Stitch web UI at `https://stitch.withgoogle.com`.

This means the **MCP workflow is generation-and-extract**, not free editing. Once Stitch generates screens from a `DESIGN.md`, the MCP can extract design systems but cannot rearrange individual frames or change colors. For per-node edits, take the output into `openpencil` or `pen-design`.

## Standard workflow

### Step 1 — Survey

```bash
list_projects()                                # what projects exist
```

Pick an existing project (skip to Step 3) or continue to Step 2 to create one.

### Step 2 — Create a project (only if needed)

```bash
create_project()                               # returns { name: "projects/{id}", ... }
```

Note the returned `name`. The numeric ID inside is what most other tools need as `projectId`.

### Step 3 — Upload DESIGN.md

`DESIGN.md` is a structured markdown brief Stitch consumes. It describes product, screens, and design intent. Encode it as base64 and upload:

```bash
# locally:
base64 -i DESIGN.md -o design.md.b64

# via MCP:
upload_design_md(projectId="{id}", designMdBase64=$(cat design.md.b64))
```

The upload returns a screen instance, which becomes the entry point for subsequent steps.

### Step 4 — Browse the generated screens

```bash
list_screens(projectId="{id}")                 # all screens in the project
get_screen(...)                                # preview URLs + instance list per screen
```

For each screen Stitch produces one or more **instances** (different layouts / themes / device sizes of the same source screen).

### Step 5 — Extract a design system (optional but recommended for Memento)

Pick one screen instance whose look you want to canonicalize:

```bash
create_design_system_from_design_md(
  projectId="{id}",
  selectedScreenInstance={ id: "{instanceId}", sourceScreen: "projects/{id}/screens/{screenId}" }
)
```

The returned asset ID is the design system resource (`assets/{designSystemId}` or similar — read the response carefully).

### Step 6 — Verify

```bash
get_project(name="projects/{id}")              # confirm design system is attached
list_design_systems(...)                       # confirm the design system appears
```

For visual verification, Stitch returns preview URLs inside the screen / design-system responses. The agent cannot render these directly — tell the user the URL so they can review in a browser.

## Iterating

There is no in-place screen edit via MCP. To iterate:

1. **Tweak the `DESIGN.md`** locally (token values, screen descriptions, copy, layout intent).
2. Re-upload with `upload_design_md` to the same project (creates new screens / instances alongside the old ones).
3. Re-run `list_screens` to see the new artifacts.
4. If you want to abandon old attempts, the Stitch web UI lets you delete screens — the MCP does not expose `delete_screen`.

Treat each `upload_design_md` as appending to the project's history. Naming conventions help: `DESIGN.md`, `DESIGN-v2.md`, `DESIGN-v3.md` — upload each, compare via `list_screens`, keep what works.

## DESIGN.md shape (Memento-flavored)

Stitch accepts a freeform markdown brief but works better with a consistent structure. For Memento, use:

```markdown
# Memento — Mobile Daily Task Organizer

## Product
Mobile-first dark PWA. English only. No accounts, no backend. Calmer alternative
to Todoist.

## Visual language
- Dark only. Background `#101012`, surface `#19191d`, dialog `#18181b`.
- Text `#f4f1eb` (primary), `#85858c` (muted). Border `#303037`. Accent `#f4f1eb`.
- Font: Inter. h1 30px bold tracking-tight. Subtitle 14px muted. Body 14px.
- Mobile-first. Frames 390×844. Safe-area insets honored.

## Navigation
Bottom nav with three tabs: Inbox (▦), Today (○), Upcoming (▤). FAB `+` bottom-right.

## Screens
1. **Today** — heading + date, list of tasks due today, collapsible "Done today" section.
2. **Inbox** — heading + count of unscheduled tasks, list.
3. **Upcoming** — heading + count of future tasks, sorted ascending by date.

## Components
- **Task row**: 64px tall, bottom border, 44px circular toggle on the left, title + meta, 44px × delete on the right.
- **FAB**: 64×64 round, bottom-right above the nav.
- **Composer sheet**: bottom-anchored rounded sheet, fields: Title, Description, When (YYYY-MM-DD), Priority, Effort.

## States
- Empty: "A calm day. Nothing scheduled." (muted text)
- Completed: line-through title, muted color, filled toggle.
- Delete confirm: inline alert dialog over the row.

## Accessibility
Visible focus on all interactive elements. Touch targets ≥ 44×44. Respect `prefers-reduced-motion`.
```

Keep it concise. Stitch's own model handles creative judgment (typography pairing, illustration, exact spacing tuning) — do not over-specify what Stitch can decide.

## Memento alignment (optional but recommended)

When the goal is to produce Memento-aligned output:

1. **Treat Memento tokens as the spec.** Copy the palette, type scale, and component dimensions from `apps/web/src/` into the `DESIGN.md` Visual language section. Don't invent new colors or sizes.
2. **Use one of the three existing screens as the canonical layout** and reference it in `DESIGN.md` so Stitch's output stays close to the shipped product.
3. **After generating**, extract a design system with `create_design_system_from_design_md` so downstream tools (`pen-design`, `openpencil`) have authoritative tokens to align against.
4. **Version the brief**, not the output. Re-uploading a tweaked `DESIGN.md` is the iteration loop; the project accumulates history.

If a `memento-design` shared skill exists in the workspace, load it and reference it from the brief — that skill covers the visual language, this skill covers the Stitch mechanics.

## Common patterns

### Pick the most recent Memento project

```bash
projects = list_projects().projects
memento = next(p for p in projects if "Memento" in (p.title or ""))
```

### Upload a brief and capture the returned screen instance id

```bash
b64 = base64(read("DESIGN.md"))
result = upload_design_md(projectId="{id}", designMdBase64=b64)
# result includes screen instance ids
```

### Extract a design system from the first instance of the first screen

```bash
screens = list_screens(projectId="{id}").screens
first = screens[0]
create_design_system_from_design_md(
  projectId="{id}",
  selectedScreenInstance={ id: first.instances[0].id, sourceScreen: first.name }
)
```

### Delete a project (irreversible)

```bash
delete_project(name="projects/{id}")
```

Always confirm with the user before calling `delete_project` — there is no undo.

## Working directory

Stitch artifacts live in Google's cloud, not in your repo. The only file you keep locally is `DESIGN.md` (and versioned variants). Recommended layout:

```
docs/
  DESIGN.md                  # current brief, source of truth
  DESIGN-v2.md               # iteration drafts (optional)
  ui.pen                     # local OpenPencil file (separate tool)
```

`DESIGN.md` is the input to Stitch. Treat it as code: reviewable diffs, conventional commits, tied to GitHub issues.

## When to ask the user

- You need a project but the user has multiple Memento projects — pick the right one with their input.
- `upload_design_md` failed with a validation error you can't decode — show them the error verbatim.
- The user wants to delete a project — confirm the project ID and warn that it's irreversible.
- The user wants to edit a generated screen — explain that MCP can't edit individual screens; offer to re-upload a tweaked `DESIGN.md`, move the screen into `openpencil` for per-node edits, or use the Stitch web UI.
