---
name: pen-design
description: >
  Create high-quality visual designs — websites, app screens, dashboards, slides, marketing materials, social media graphics — on the pen.dev canvas. Use this skill whenever the user wants to create, generate, or visualize any kind of UI design, mockup, wireframe, layout, webpage, app screen, presentation slide, poster, banner, or marketing asset. Also use it when the user says things like "design me a...", "make a visual for...", "create a mockup of...", "what would X look like?", or wants to turn an idea into a visual. Even if the user doesn't mention "pen.dev" or "design tool" explicitly — if they want something visual created, this is the skill to use.
---

# pen.dev

pen.dev is an infinite-canvas design tool with a nested object hierarchy. Two access paths exist:

1. **MCP (`pencil.*` namespace)** — preferred when the pen.dev desktop app is connected. Tools: `get_app_state`, `read_skill`, `execute`. This is what you use to mutate a live canvas incrementally, see what changed, and react.
2. **CLI (`pen` binary)** — preferred for one-shot generation from a prompt. Install with `npm i -g @pen.dev/cli`. Useful for batch jobs or when no desktop session is open.

The MCP and CLI write to the same `.pen` format, so output from one can be edited by the other.

> **Namespace warning**: in this workspace the `pencil` MCP namespace refers to pen.dev (5 tools). The OpenPencil desktop MCP is exposed under `openpencil.*` (109 tools). Do not confuse the two — they are different products with different APIs.

## MCP path (primary)

### Tool surface

```bash
get_app_state()                              # live canvas: active file, selection, top-level nodes, components
read_skill(path?)                            # read embedded pen.dev docs (default: SKILL.md)
execute(snippet, edits?, editId?)            # run JS to mutate the canvas (Insert/Copy/Update/Replace/Get/...)
```

Only three tools, but `execute` is the workhorse — it runs JavaScript against the live document and the canvas updates in real time as the user watches.

### Read first, write second

Before any mutation:

```js
// get_app_state returns the active file path, selection, top-level frames, components
// read_skill returns a comprehensive reference — call it when you need schema or domain rules
read_skill({ path: "SKILL.md" })                  // overview + quick reference table
read_skill({ path: "execute.md" })                // execute() tool reference, error recovery
read_skill({ path: "pen-schema.md" })             // .pen node schema (Layout, Fill, Stroke, Effect, ...)
read_skill({ path: "guide/mobile-app.md" })       // mobile screen composition rules
read_skill({ path: "guide/components.md" })       // reusable components and instances
read_skill({ path: "guide/design-system.md" })    // composing screens with design system components
read_skill({ path: "guide/landing-page.md" })     // landing page patterns
read_skill({ path: "guide/web-app.md" })          // web app patterns
read_skill({ path: "guide/table.md" })            // tables and dashboards
read_skill({ path: "guide/slides.md" })           // presentation slides
read_skill({ path: "guide/tailwind.md" })         // Tailwind v4 export
read_skill({ path: "guide/code.md" })             // generating code from .pen files
```

`get_app_state()` first to know the active file and current node ids, then `read_skill` for the rules, then `execute` to act.

### execute() API

Inside an `execute` snippet, the following globals are available:

```ts
const document: string;                            // predefined root node id

// Mutations — return the new id
Insert(parent: string, nodeData: Child): string;
Copy(path: string, parent: string, copyNodeData?: Child): string;
Update(path: string, updateData: Child): void;
Replace(path: string, nodeData: Child): string;
Move(path: string, newParent: string, index?: number): void;
Delete(path: string): void;

// Reads
Get<T>(path: string, visit: (node: Child, ctx: Ctx) => T | undefined, options?: GetOptions): T[];
Get<T>(visit: (node: Child, ctx: Ctx) => T | undefined, options?: GetOptions): T[];
GetVariables(): { variables, themes? };

// Layout helpers
FindEmptySpace({ width, height, direction?, padding?, nodeId? }): { x, y, parentId? };

// Output
Print(...values): void;
TakeScreenshot(nodeIds: string[]): void;
Export(nodeIds: string[], format: "png" | "jpeg" | "webp" | "pdf" | "html-tailwind" | "html-css", outputPath: string, options?): void;
```

### Critical execute() rules

- **Each `execute` runs in its own scope.** Local `const`/`let` do not survive between calls. To persist ids, use plain assignment: `myNodeId = Insert(...)` (no `const`).
- **Never set `id`** when creating/copying/replacing nodes — pen.dev generates random ids and overrides the input. Use the returned `ref` from component inserts.
- **Always set `name`** on every node you add. A mapping of created names → ids is returned at the end of each call.
- **Split work into many small `execute` calls** focused on one section each. Easier to recover from errors, easier to read.
- **Errors come back with an `editId`** — patch with the `edits` parameter under that `editId`. Never resend the failing snippet. If the patched snippet fails again, keep editing under the same `editId`; the next `find` must match the already-patched snippet.
- **Warnings come back in the response** — fix them in the next `execute` call.

### Layout model (don't think CSS)

pen.dev is not CSS. The schema is in `read_skill({ path: "pen-schema.md" })`. Core types:

```ts
Layout = {
  layout: "none" | "vertical" | "horizontal";
  gap?: number | "$variable";
  padding?: number | [v, h] | [t, r, b, l];
  justifyContent?: "start" | "center" | "end" | "space_between" | "space_around";
  alignItems?: "start" | "center" | "end";
};

Size =
  | { type: "fixed",     width: number, height: number }
  | { type: "fit_content" }     // combined size of children
  | { type: "fill_container" }; // parent size

Fill = "#RGB" | "#RRGGBB" | "#RRGGBBAA"
     | { type: "color", color, opacity?, blendMode? }
     | { type: "gradient", gradientType?, colors?, rotation?, ... }
     | { type: "image", url: "./relative.jpg", mode?: "stretch"|"fill"|"fit" }
     | { type: "shader", url: "./effect.glsl", uniforms?: {...} };
```

Hex with alpha sets opacity. Variables are referenced as `"$name"`. Use `GetVariables()` to inspect or `create_variable` via the `execute` runtime if available.

### Mobile app composition (read in full from `guide/mobile-app.md`)

Quick rules:

- Screen height: `fit_content(844)` — vertically resized to fit content, not real device height.
- Status bar first (62 px, Inter, vertically centered), then content, then tab bar last.
- Content wrapper: consistent `padding: [16–20, 16–20]` applied once; sections separated by `gap` (24–32 major, 12–16 related).
- Tab bar: capsule-ended, ~56 px tall, floats inset ~16 px from sides and ~12 px above the bottom. Frosted glass (fill at 70% opacity, soft shadow). Items: ~22 px icon + 10 px label, selected = accent tint on a soft capsule.
- One primary intent per screen. The first 1–2 elements answer "where am I" and "what can I do here". Key actions in the lower half (one-handed reach).
- Use the wrapper's `gap` for spacing and bottom padding (same value as gap). Never add spacer elements.

### Variables and design systems

```js
// read all variables
GetVariables()

// bind a property to a variable — use the "$name" form
Update("bg-frame-id", { fill: "$bg" })
```

For design-system patterns, read `guide/design-system.md` and `guide/components.md` via `read_skill`. Reusable components are nodes with `reusable: true`; insert instances with `Insert(parent, { ref: componentId, descendants: {...} })`.

### Showing the result

`execute` returns a response that includes the node-id mapping and any warnings. To get a visual:

```js
TakeScreenshot(["frame-id"])
Export(["frame-id"], "png", "/tmp/preview.png", { scale: 2 })
Export(["frame-id"], "html-tailwind", "/tmp/preview.html")
```

`TakeScreenshot` adds an image to the response. `Export` writes to disk; use `Read` on the PNG to see it (the agent is multimodal).

### Collaborative live state

The document can change while you work — another user (or another session) may edit it. Re-read with `Get` or `get_app_state()` before assuming state. Don't undo changes the user made in the meantime.

### .pen files are encrypted

**Never use `Read` or `Grep` on `.pen` files.** They are encrypted on disk; the only way to interact is through MCP tools. If you need to inspect a `.pen` file, open it in the pen.dev desktop app or use `execute` with `Get`.

## CLI path (alternative)

For one-shot generation without a desktop session, use the CLI:

### Setup

```bash
which pen || npx pen version
npm install -g @pen.dev/cli
```

### Authentication

```bash
pen status                       # current user
pen login --email you@example.com
# or
pen signup --email ... --username ... --name "..."
# or set PEN_CLI_KEY
```

The CLI also needs an authenticated Claude Code user for its AI agent.

### Generating a design

```bash
pen --out design.pen --prompt "Mobile dark task app: bottom nav, FAB, task rows" --export design.png --export-scale 2
```

Key flags:

- `--out, -o` — `.pen` output path (required)
- `--prompt, -p` — design brief (required)
- `--prompt-file, -f` — attach reference file (repeatable)
- `--export, -e` — export image
- `--export-scale` — resolution multiplier (use 2)
- `--export-type` — `png` (default), `jpeg`, `webp`, `pdf`
- `--in, -i` — start from an existing `.pen` (for iteration)
- `--model, -m` — Claude model (defaults to Opus)

### Prompt discipline

Pass the user's request **verbatim** — do not expand or add design specifics. The pen.dev CLI has its own AI designer that handles layout, color, typography, and content. Adding your own design opinions on top produces worse results.

### Timing

Generation is not instant — the CLI runs an AI agent that plans, builds, and validates:

- Simple (a card, one component): 1–2 minutes
- Medium (an app screen, a landing section): 2–3 minutes
- Complex (full landing page, detailed dashboard): 3–5+ minutes

Use a timeout of at least 600000 ms (10 minutes).

### Iteration

```bash
pen --in design.pen --out design-v2.pen --prompt "Make the header larger, change accent to green" --export design-v2.png --export-scale 2
```

Naming pattern: `design.pen` → `design-v2.pen` → `design-v3.pen`, or overwrite with `--in design.pen --out design.pen`.

### Staying up to date

```bash
npm view @pen.dev/cli version        # latest published
pen version                          # installed
npm install -g @pen.dev/cli          # upgrade
```

After upgrading, refresh this skill from the published package — agents don't auto-update SKILL.md files in your config:

- `node_modules/@pen.dev/cli/SKILL.md`
- `https://unpkg.com/@pen.dev/cli@latest/SKILL.md`
- `https://cdn.jsdelivr.net/npm/@pen.dev/cli@latest/SKILL.md`

## MCP vs CLI — when to use which

| Situation | Use |
|---|---|
| Desktop app open with a live canvas, incremental edits | MCP (`pencil.execute`) |
| Visualizing live state, listing components, reading tokens | MCP (`pencil.get_app_state`) |
| Following pen.dev domain rules (mobile app, components, design system) | MCP (`pencil.read_skill`) |
| One-shot generation from a prompt, no desktop session | CLI (`pen --prompt`) |
| Batch / scripted design generation | CLI |
| Iterating on a file in batch (`--in`) | CLI |

## Memento alignment (optional)

If the design is for Memento (`apps/web/`, `docs/ui*.pen`):

1. **Match Memento tokens** — dark palette `#101012` (bg), `#19191d` (surface), `#18181b` (dialog), `#f4f1eb` (text), `#85858c` (muted), `#303037` (border). Set them as variables in the document so other screens bind to them.
2. **Match the type scale** — h1 = 30 px bold tracking-tight, subtitle 14 px muted, body 14 px. Use Inter throughout.
3. **Match the component shapes**:
   - BottomNav: fixed bottom, border-top `#303037`, 56 px + safe-area-inset-bottom, three labels (Inbox/Today/Upcoming) with icon above. The pen.dev mobile-app guide's "Tab Bar" section maps to this — adjust the capsule styling to match Memento's flat bar look (no capsule, no glass) so it stays true to the shipped product.
   - FAB: 64×64 round, bottom-right above the nav, off-white fill.
   - TaskRow: 64 px tall, bottom border, 44 px circular toggle left, 44 px × delete right, title + meta.
   - TaskComposer: bottom sheet, rounded top, fields Title / Description / When (YYYY-MM-DD) / Priority / Effort.
4. **Load Memento as variables** before generating — when calling `execute`, create variables for the palette and bind frames/components to them rather than hard-coding hex.
5. **Don't redesign what Memento already shipped.** The app code in `apps/web/src/` is the source of truth; the design file mirrors it. Changes to the app should drive changes to the design, not the other way around.

If a `memento-design` shared skill exists, load it first — that skill covers the visual language, this skill covers the pen.dev mechanics.

## Common MCP patterns

### Create an empty mobile screen frame

```js
screenId = Insert(document, {
  type: "frame",
  name: "Today",
  layout: "vertical",
  gap: 24,
  padding: [16, 20],
  fill: "$bg",
  size: { type: "fit_content", height: 844 },
  clip: true,
});
```

### Add a status bar

```js
Insert(screenId, {
  type: "frame",
  name: "Status Bar",
  layout: "horizontal",
  alignItems: "center",
  justifyContent: "end",
  padding: [0, 20],
  height: 62,
  width: "fill_container",
});
```

### Build a tab bar (Memento flat style, not the guide's capsule)

```js
navId = Insert(screenId, {
  type: "frame",
  name: "BottomNav",
  layout: "horizontal",
  justifyContent: "space_around",
  alignItems: "center",
  borderTop: "1px $border",
  fill: "$bg",
  height: 56,
  width: "fill_container",
});
// then Insert three nav items into navId
```

### Create a reusable component and instance it

```js
// define component
rowCompId = Insert(document, {
  type: "frame", name: "TaskRow",
  layout: "horizontal", gap: 12, alignItems: "center",
  padding: [12, 16], height: 64, width: 350,
  borderBottom: "1px $border",
  reusable: true,
});

// instance it on a screen
Insert(screenId, { ref: rowCompId, descendants: { "title": { content: "Buy milk" } } });
```

### Snapshot the result

```js
Export(["screen-id"], "png", "/tmp/preview.png", { scale: 2 });
// then Read("/tmp/preview.png")
```

## Working directory

`.pen` files are encrypted — interact only via MCP tools or the pen.dev desktop app. Save outputs in the user's working directory or a subdirectory like `designs/`. Don't write `.pen` files from the shell; the format is owned by the desktop app and an out-of-band write will desync the live state.

When iterating, prefer versioned names: `docs/ui.pen` → `docs/ui-v2.pen` → `docs/ui-v3.pen`. The currently active file (per `get_app_state()`) takes precedence — mutate it in place unless the user asks for a new file.
