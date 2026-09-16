---
name: openpencil
description: >
  Edit and inspect existing OpenPencil design documents (.pen) through the openpencil MCP server — websites, app screens, dashboards, slides, marketing materials, social media graphics, or any Figma-style design file. Use this skill whenever the user wants to open, inspect, modify, extend, or audit an OpenPencil / .pen document — including reading frames, listing pages, analyzing design tokens (variables/collections), updating fills/text/layout, creating pages/components/variables, importing SVGs, deleting nodes, or exporting vector assets. Also use it when the user references an existing .pen file (e.g. `docs/ui.pen`), wants to align a design with the Memento design system, or asks "what's in this .pen file?", "add a frame for…", "change this node's color", "create a token for…", or "export this icon as SVG". Do NOT use this skill to generate new designs from a natural-language prompt — OpenPencil MCP edits existing documents; for prompt-driven design generation, use the pen-design skill instead.
---

# OpenPencil (openpencil MCP)

OpenPencil is a headless design tool with a desktop app that holds live `.pen` documents. The `openpencil` MCP server exposes a read/write surface against the currently open document. Unlike prompt-driven tools (see `pen-design`), OpenPencil MCP works **on an existing document**: you observe its current state, then mutate specific nodes, properties, pages, components, or variables. The desktop app stays the source of truth — changes you make through MCP are visible immediately in the app and vice versa.

> **Namespace warning**: in this workspace `openpencil.*` is the OpenPencil desktop MCP (109 tools). The pen.dev MCP is exposed separately under `pencil.*` (5 tools). Do not confuse the two — they are different products with different APIs.

## Setup

OpenPencil MCP requires three things to be true before any tool call will succeed:

### 1. Desktop app running

The OpenPencil desktop app must be running and reachable. Verify:

```bash
ps aux | grep -i OpenPencil | grep -v grep | awk '{print "PID:", $2, "  binary:", $NF}'
```

On macOS the canonical install path is `/Applications/OpenPencil.app`. If absent, download from the project's site and install it manually — OpenPencil is not distributed through Homebrew or `npm`.

### 2. A document is open

The MCP only operates on a document the app currently has loaded. An empty window titled just `OpenPencil` (no filename in the title bar) does **not** count as open.

Inside the app:
- **File → Open…** (`⌘O`) and pick the `.pen` file, or
- **File → New** to start fresh, then **File → Save As…** to write it to a path.

The window title must change to include the file name (e.g. `docs/ui.pen — OpenPencil`). Verify before continuing:

```bash
osascript -e 'tell application "System Events" to tell process "OpenPencil" to get title of window 1'
```

### 3. MCP server registered

```bash
opencode mcp list
```

The `openpencil` entry must report `connected`. If it doesn't:

```bash
opencode mcp add openpencil --command "npx -y @open-pencil/mcp" --global
```

Restart the OpenCode session after adding the server.

### Quick health check

Once all three are true, this should return a non-empty `documents` array instead of the "not connected" error:

```bash
# via the agent itself — run once at the start of the session
list_documents()
```

If `list_documents()` returns `{"error": "OpenPencil app is not connected..."}`, **stop and tell the user**: app is not running or no document is open. Do not retry the tool automatically — the user must fix the desktop state first.

## Staying up to date

This skill mirrors the `@open-pencil/mcp` npm package. The published package is the source of truth for tool names and signatures.

**Check current versions**
```bash
npm view @open-pencil/mcp version        # latest published
ls /Applications/OpenPencil.app          # confirm desktop app present
```

**Upgrade**
```bash
npm install -g @open-pencil/mcp
```

Restart the OpenPencil desktop app after upgrading the MCP so it picks up the new protocol.

**If a tool name stops existing**
OpenPencil MCP evolves fast. If a tool listed in this skill returns "Unknown tool", check `@open-pencil/mcp`'s `CHANGELOG` or `README` on npm/GitHub for renames. Do **not** invent replacement names — probe cautiously with minimal arguments and report the actual error to the user.

## Tool surface

The MCP exposes two surfaces: **read** (no input required, returns live document state) and **write** (requires args, mutates the open document).

### Read — observe the document

```bash
list_documents()                  # open .pen tabs / file paths
list_pages(document_id?, page_id?) # pages within a document
get_page_tree()                   # top-level frames, structure
get_components()                  # reusable COMPONENT / COMPONENT_SET nodes
list_variables()                  # all design tokens (color, number, string, boolean)
list_collections()                # variable collections and modes
analyze_colors()                  # palette, frequencies, token usage
analyze_typography()              # font stacks, sizes, weights
analyze_spacing()                 # gaps, padding, grid compliance
analyze_clusters()                # repeated patterns that should be components
describe(id)                      # semantic role + layout analysis of one node
get_jsx(id)                       # structural JSX for a node
export_svg(ids)                   # export vector assets by node id
```

`get_codegen_prompt()` is special: it returns the full design-to-code workflow guide for converting OpenPencil designs into frontend code. Call it once before doing code-generation work; it documents the canonical read sequence.

### Write — mutate the document

```bash
create_page(...)                   # add a page to the document
create_component(...)              # define a reusable component
create_variable(...)               # define a design token
set_variable(...)                  # update / rewire an existing variable
bind_variable(...)                 # bind a node property to a variable
unbind_variable(...)               # detach a node from its variable
import_svg(...)                    # import an SVG into the document
update_node(...)                   # generic property update on any node
set_fill(...)                      # set fill (color, gradient, image) on a node
set_text(...)                      # set text content + formatting on a text node
set_layout(...)                    # set layout mode, padding, gap, sizing
delete_node(...)                   # remove a node and its descendants
```

**Important — what the MCP does NOT expose**:
- No `create_frame`, `add_text`, `add_rectangle`, `add_node`, `move_node`, `resize_node`, or `snapshot`. If the user wants primitive shapes or new frames, those are created **in the OpenPencil desktop app**, not by prompt.
- No `export_png` or `export_node` for raster. SVG export is available (`export_svg`); for PNG/PDF, use the desktop app's File → Export.
- No `save` / `save_document`. Persistence is handled by the desktop app.

This means the workflow is **observe-and-edit**, not **prompt-and-generate**. Adapt your mental model accordingly.

## Standard workflow

### Step 1 — Survey

Before touching anything, understand the current state. Run this sequence in order:

```bash
list_documents()                  # which .pen file is open
get_page_tree()                   # what frames/pages exist
list_variables()                  # what tokens are defined
list_collections()                # token grouping + modes
analyze_colors()                  # actual palette in use
analyze_typography()              # type system in use
analyze_spacing()                 # gap/padding/grid compliance
get_components()                  # reusable components defined
```

You should now know: how many screens/pages, what the token system looks like, the type scale, the spacing grid, and which components exist.

### Step 2 — Decompose (only for code generation)

If the goal is to generate code from the design, call `get_codegen_prompt()` and follow its five-step workflow (Survey → Decompose → Extract tokens → Generate code → Verify). `describe(id)` and `get_jsx(id)` per node give you the structural and semantic data.

### Step 3 — Plan the edit

For each change the user wants:
1. Identify the target node by id (use `get_page_tree()` and `describe(id)` to navigate).
2. Decide which write tool fits: a single property → `set_fill` / `set_text` / `set_layout`; a generic update → `update_node`; removal → `delete_node`; new token → `create_variable` then `bind_variable`.
3. Confirm the change won't break existing variable bindings (e.g. changing a fill from a token-bound value to a literal hex detaches the binding).

### Step 4 — Apply

Call the write tool with the minimal args required. Verify after each call by re-running the appropriate read tool:

```bash
update_node(id="…", …)            # apply change
describe(id="…")                  # inspect resulting state
```

If a tool returns a validation error about required args, fix the args and retry — do not guess argument shapes.

### Step 5 — Verify

After all changes:
```bash
get_page_tree()                   # structure still makes sense
analyze_colors()                  # tokens still consistent
analyze_spacing()                 # grid compliance preserved
export_svg(ids=[…])               # capture vector assets if needed
```

For visual verification, tell the user to look at the OpenPencil desktop app — the document updates live. There is no headless preview.

## Iterating

Each edit cycle is **observe → plan → apply → verify**, repeating. The desktop app stays the canonical view; do not assume state across MCP calls without re-reading.

For multi-step edits, prefer many small `update_node` / `set_*` calls over a single large restructuring. The MCP has no `move_node` or `resize_node`, so size/position changes go through `update_node` with the corresponding property names.

If you need new primitive shapes (rectangles, text, ellipses), tell the user to add them in the OpenPencil desktop app and resume MCP work after they exist.

## Memento alignment (optional)

If the document is part of the Memento project (`docs/ui.pen`, or any file under `apps/web/...`):

1. **Reuse the existing Memento tokens** (`list_variables()`) instead of inventing new ones. The Memento dark palette is `#101012` (bg), `#19191d` (surface), `#18181b` (dialog), `#f4f1eb` (text), `#85858c` (muted), `#303037` (border).
2. **Match the Memento type scale**: h1 = 3xl bold tracking-tight, subtitle = xs/sm muted, body = sm.
3. **Match Memento component shapes**: mobile frames ~390×844, bottom nav 56px + safe area, FAB 64×64 round at `right-24 bottom-[calc(5rem+env(safe-area-inset-bottom))]`, task row min-h-16 with 44×44 touch targets.
4. When creating tokens via `create_variable(...)`, name them after Memento roles (e.g. `memento/bg`, `memento/text`, `memento/border`) so the token tree stays consistent across documents.

If a `memento-design` shared skill exists in the workspace, load it and apply its rules verbatim — this skill covers the tool mechanics, that skill covers the visual language.

## Common patterns

### Update a single fill on a specific node

```bash
set_fill(id="bi8Au", fill="#101012")
```

### Update text content

```bash
set_text(id="text_node_id", content="Today")
```

### Change layout mode and gap

```bash
set_layout(id="row_id", mode="HORIZONTAL", itemSpacing=8, paddingTop=24, paddingBottom=24)
```

### Create a design token and bind it

```bash
create_variable(collection="memento", name="bg", type="color", value="#101012")
bind_variable(nodeId="bi8Au", property="fill", variableId="<returned id>")
```

### Delete a node and its children

```bash
delete_node(id="frame_to_remove")
```

### Export an icon

```bash
export_svg(ids=["icon_id"])
```

## Working directory

OpenPencil documents are `.pen` files at specific paths in the workspace. The MCP doesn't read or write the file system directly — the desktop app does. After MCP edits:

1. Tell the user the document has been modified.
2. The user saves in the desktop app (`⌘S`), or the app's auto-save kicks in if enabled.

Don't try to write or copy `.pen` files from the shell — they are JSON but the format is owned by the desktop app, and an out-of-band edit will desync the live state. If you need a snapshot, ask the user to use **File → Save As…** with a versioned name (`docs/ui-v2.pen`).

## When to ask the user

You don't have a connected app, or `list_documents()` returns the "not connected" error, or the user references a file the desktop app doesn't have open.
