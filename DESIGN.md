# Monochrome Learning Design System

Black and white interface with soft depth: rounded corners, layered surfaces, gentle shadows. Hierarchy comes from weight, size, spacing, surface tone, and inversion. **Color appears only inside code editors** (syntax highlighting), which makes code the one vivid element on the page.

## How to apply this spec

This file is a portable spec. It is applied to whatever HTML/CSS/JS files are named alongside it. File names are not fixed.

1. **Restyle, don't restructure content.** Keep the target files' text and meaning; map their elements onto the components below.
2. **Tokens first.** Paste the token block (below) into the target stylesheet verbatim. Components use only `var(--*)`; no raw hex or rgba outside the token block.
3. **Use the class names and markup given here** so pages stay consistent across files. If a file has its own class names, rename or map them; do not invent new visual styles.
4. **Behaviors** (theme, progress, copy, anchors, active sub-topic, mobile drawer) go in the page's script file, or an inline `<script>` at the end of `<body>` if no script file is given. Add only behaviors whose elements exist on the page.
5. **Theme restore** always goes inline in `<head>` (see Theme). The one exception to the script-file rule.
6. **Allowed dependencies only:** Rubik (Google Fonts) and Prism.js 1.29.0 from cdnjs (see Code highlighting). No CSS frameworks, icon fonts, other web fonts, or other libraries. Icons are inline SVG.
7. Run the checklist at the end before calling it done.

## Principles

1. **Monochrome UI, colored code.** Interface uses ink, paper, and grays only. Syntax colors live only inside `.codeblock`.
2. **Inversion is the accent.** Strongest emphasis = swap foreground/background (active topic, important note, example label).
3. **Soft depth.** Rounded corners, tonal surfaces (`--bg-soft`, `--surface`), and shadows separate layers. Hairlines (`--line`) for quiet separation.
4. **Reading first.** Body measure ~74ch; line height 1.6.
5. **Light + dark parity.** Every UI token is redefined for dark. Code editor stays dark in both themes.

## Tokens

Copy into the stylesheet verbatim:

```css
:root {
  --bg: #ffffff;
  --bg-soft: #f7f7f7;
  --fg: #0a0a0a;
  --fg-2: #404040;
  --fg-3: #666666;
  --line: #e5e5e5;
  --line-strong: #0a0a0a;
  --surface: #f4f4f4;
  --surface-2: #e9e9e9;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 6px 20px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 2px 4px rgba(0, 0, 0, 0.05), 0 12px 32px rgba(0, 0, 0, 0.1);
  --scrim: rgba(0, 0, 0, 0.35);

  /* Code editor: dark in both themes. Only place color is allowed. */
  --code-bg: #0d0e11;
  --code-bar: #17181c;
  --code-line: rgba(255, 255, 255, 0.08);
  --code-fg: #e4e4e7;
  --code-dim: #6b6f78;
  --code-hl: rgba(255, 255, 255, 0.06);
  --c-comment: #6a737d;
  --c-keyword: #f97583;
  --c-string: #9ecbff;
  --c-function: #b392f0;
  --c-number: #79b8ff;
  --c-class: #ffab70;
  --c-property: #85e89d;
  --c-punct: #a1a1aa;
  --c-inserted: rgba(46, 160, 67, 0.18);
  --c-deleted: rgba(248, 81, 73, 0.18);

  --sans: "Rubik", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --mono: ui-monospace, "Cascadia Code", "SF Mono", Consolas, monospace;
  --r-sm: 6px;
  --r: 10px;
  --r-lg: 14px;
  --r-pill: 999px;
  --header-h: 60px;
  --left-w: 272px;
  --right-w: 232px;
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #0a0a0a;
    --bg-soft: #101010;
    --fg: #fafafa;
    --fg-2: #c7c7c7;
    --fg-3: #8a8a8a;
    --line: #242424;
    --line-strong: #fafafa;
    --surface: #161616;
    --surface-2: #222222;
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
    --shadow: 0 1px 2px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.45);
    --shadow-lg: 0 2px 4px rgba(0, 0, 0, 0.5), 0 16px 40px rgba(0, 0, 0, 0.55);
    --scrim: rgba(0, 0, 0, 0.6);
    color-scheme: dark;
  }
}
:root[data-theme="dark"] {
  --bg: #0a0a0a;
  --bg-soft: #101010;
  --fg: #fafafa;
  --fg-2: #c7c7c7;
  --fg-3: #8a8a8a;
  --line: #242424;
  --line-strong: #fafafa;
  --surface: #161616;
  --surface-2: #222222;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  --shadow: 0 1px 2px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(0, 0, 0, 0.45);
  --shadow-lg: 0 2px 4px rgba(0, 0, 0, 0.5), 0 16px 40px rgba(0, 0, 0, 0.55);
  --scrim: rgba(0, 0, 0, 0.6);
  color-scheme: dark;
}
```

| Token                              | Use                                                                           |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| `--bg`                             | Page, cards                                                                   |
| `--bg-soft`                        | Left sidebar, card headers, table header, output panels                       |
| `--surface` / `--surface-2`        | Notes, inline code, hovers / pills, badges                                    |
| `--fg` / `--fg-2` / `--fg-3`       | Headings & inverted fills / body / meta & inactive                            |
| `--line` / `--line-strong`         | Hairlines / emphasis borders                                                  |
| `--shadow-sm/--shadow/--shadow-lg` | Active pill / cards & hover / code editor, important note, drawer             |
| `--scrim`                          | Mobile drawer backdrop                                                        |
| `--r-sm/--r/--r-lg/--r-pill`       | Buttons, inline code / nav items, notes / cards, code, tables / chips, labels |

## Theme

- Default follows `prefers-color-scheme`. Manual override sets `html[data-theme="light|dark"]`, saved to `localStorage` key `theme`.
- **No flash on load.** Required `<head>` order:

```html
<script>
  try {
    const t = localStorage.getItem("theme");
    if (t) document.documentElement.dataset.theme = t;
  } catch {}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,400..800;1,400..800&display=swap"
/>
<link rel="stylesheet" href="STYLESHEET" />
```

- The page script only toggles and saves; never restores.
- Toggle `.theme-btn` shows an inline SVG sun in dark, moon in light (set by script), with matching `aria-label`.

## Typography

- **Sans: Rubik** via the `<link>` above (never `@import`). **Mono:** system stack, no web font.

| Role  | Size                      | Weight | Notes                                                           |
| ----- | ------------------------- | ------ | --------------------------------------------------------------- |
| h1    | 2.75rem (2.125rem mobile) | 800    | Tracking `-0.03em`                                              |
| h2    | 1.75rem                   | 700    | 72px above; 32×4px pill rule (`--fg`) above text via `::before` |
| h3    | 1.25rem                   | 700    | 40px above                                                      |
| Lead  | 1.1875rem / 1.6           | 400    | `--fg-2`                                                        |
| Body  | 1rem / 1.6                | 400    | `--fg-2`                                                        |
| Label | 0.6875–0.75rem            | 700    | Uppercase, `0.08em` tracking                                    |
| Code  | 0.875rem / 1.7            | 400    | `--mono`                                                        |

## Layout

```
┌──────────────────────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓░░░░░░░░░░ .progress (3px, fixed)                 │
│ .header (sticky, translucent blur): ☰ [L]Learn  crumb  ☾  │
├─────────────┬──────────────────────────┬─────────────────┤
│ .sidebar    │ .content (≤ 74ch)        │ .sidebar--right │
│ --left      │                          │ .subtopics      │
│ --bg-soft   │                          │ .toc-progress   │
│ 272px       │                          │ 232px           │
└─────────────┴──────────────────────────┴─────────────────┘
```

- `.layout` grid: `var(--left-w) minmax(0,1fr) var(--right-w)`, max-width 1480px, centered.
- Sidebars sticky below header, own scroll. Height `calc(100vh - var(--header-h))` then `calc(100dvh - …)` override, so mobile browser bars don't clip it. Left sidebar `--bg-soft` + right hairline.
- Header: `color-mix(in srgb, var(--bg) 82%, transparent)` + `backdrop-filter: blur(10px)`, hairline bottom. Logo = 28px rounded `--fg` square with letter + wordmark. Crumb: `--fg-3`, current page in `<b>` `--fg`.
- **≥ 1200px:** three columns. **< 1200px:** right sidebar hidden. **< 860px:** single column; left sidebar becomes fixed drawer (`translateX(-100%)`, `--shadow-lg`) toggled by `.menu-btn` via `body.nav-open`. Closed drawer is `visibility: hidden` so its links are not tabbable. Open: `body` gets `overflow: hidden` and a `--scrim` backdrop (`body.nav-open::after`, fixed below header, z-index under drawer); backdrop click or Esc closes and returns focus to `.menu-btn`; crumb and editor dots hidden; content padding 16px.

## Components

### Navigation

| Component       | Markup                                                                                           | Spec                                                                                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Progress bar    | `.progress[role=progressbar] > .progress__bar`                                                   | Fixed top, 3px, `--fg`, `transform: scaleX(p)` from left.                                                                                                                                                  |
| Topics          | `ul.topics > li > a`                                                                             | Rounded `--r` rows. CSS counter number in a pill badge (`--surface-2`, mono 0.6875rem). Hover `--surface-2`. Current `aria-current="page"` → inverted pill + `--shadow`; badge becomes translucent `--bg`. |
| Sub-topics      | `ul.subtopics > li[.sub] > a[href="#id"]`                                                        | 2px `--line` track. Active `.is-active`: 2px `--fg` left border, `--surface` bg, right-rounded, 600 weight. `.sub` = h3, extra indent, smaller.                                                            |
| Reading card    | `.toc-progress > strong.toc-progress__pct + "read" + .toc-progress__track > .toc-progress__fill` | Under sub-topics. Rounded `--r-lg` card, `--bg-soft`. Big % number + 4px pill track, fill mirrors top bar.                                                                                                 |
| Sidebar label   | `.sidebar__label`                                                                                | 0.6875rem uppercase `--fg-3`.                                                                                                                                                                              |
| Icon button     | `.icon-btn > svg`                                                                                | 38px, `--r`, hairline; hover `--surface`. Icon 18px inline SVG, stroked like note icons. Never text glyphs (☰ ☾ ☀). Used by `.menu-btn`, `.theme-btn`.                                                    |
| Menu button     | `.menu-btn > svg.i-open + svg.i-close`                                                           | Hamburger `<path d="M4 6h16M4 12h16M4 18h16"/>`; close `<path d="M6 6l12 12M18 6 6 18"/>`. CSS shows `.i-close` only under `body.nav-open`. `aria-label` switches Open/Close topics.                       |
| Skip link       | `a.skip-link[href="#main"]` first in `<body>`; `main.content#main[tabindex=-1]`                  | Off-screen until focused, then inverted pill top-left. `.content:focus` has no outline.                                                                                                                    |
| Heading anchors | auto-added `a.anchor`                                                                            | `#` after every `h2/h3[id]` in `.content`, hidden until heading hover/focus. Added by script, not markup.                                                                                                  |

### Content

| Component    | Markup                                            | Spec                                                                                                                                            |
| ------------ | ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Eyebrow      | `span.eyebrow`                                    | Pill, `--surface` + hairline, 6px `--fg` dot before text.                                                                                       |
| Lead         | `p.lead`                                          | Description under h1.                                                                                                                           |
| Meta chips   | `ul.meta > li` (value in `<strong>`)              | Pill chips, `--bg-soft` + hairline.                                                                                                             |
| Key points   | `ul.points > li`                                  | 18px rounded `--fg` box with `--bg` check (CSS borders on `::after`, not an image).                                                             |
| Inline code  | `code` not in `pre`                               | `--surface`, hairline, `--r-sm`.                                                                                                                |
| Keyboard key | `kbd`                                             | Mono 600, `--bg`, hairline with 2px bottom border, `--r-sm`.                                                                                    |
| Plain lists  | `ul`/`ol` without class in `.content`             | 1.5em indent, 6px between items, `--fg-3` markers.                                                                                              |
| Table        | `.table-wrap > table`                             | Wrapper rounded `--r-lg` with hairline, scrolls horizontally. Row hairlines only; `th` `--bg-soft`, uppercase 0.8125rem. Row hover `--bg-soft`. |
| Pager        | `nav.pager > a > small + strong`, second `a.next` | Rounded `--r-lg` cards; hover lifts 2px + `--shadow`. Stacks on mobile.                                                                         |

### Notes / callouts

Markup (icon is inline SVG, `viewBox="0 0 24 24"`, stroked via CSS, `aria-hidden="true"`):

```html
<div class="note note--tip">
  <svg class="note__icon" viewBox="0 0 24 24" aria-hidden="true">…</svg>
  <div class="note__body">
    <span class="note__label">Tip</span>
    <p>…</p>
  </div>
</div>
```

| Variant            | Look                                                                                                                   | Icon paths                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `.note` (info)     | `--surface`, hairline, 4px `--fg-3` left bar, `--r`                                                                    | `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>`                                                         |
| `.note--tip`       | `--bg-soft`, 4px `--fg` left bar                                                                                       | `<path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>`                                            |
| `.note--warning`   | `--surface`, diagonal-striped 5px left bar (`repeating-linear-gradient(-45deg, var(--fg) 0 4px, transparent 4px 8px)`) | `<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>` |
| `.note--important` | Inverted (`--fg` bg, `--bg` text), no border, `--shadow-lg`                                                            | `<path d="M12 2l3 6.5 7 .9-5.1 4.8 1.3 7L12 17.8 5.8 21.2l1.3-7L2 9.4l7-.9z"/>`                                          |

Icon CSS: 20px, `fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round`.

### Example card

```html
<div class="example">
  <div class="example__head">
    <span class="example__label">Example 1</span
    ><span class="example__title">Private state</span>
  </div>
  <div class="example__body">
    <p>…</p>
    <!-- optional .codeblock -->
  </div>
  <div class="example__output">…</div>
  <!-- optional -->
</div>
```

Rounded `--r-lg`, hairline, `--shadow`. Head `--bg-soft` with inverted pill label + bold title. Nested codeblock: no shadow, 14px top margin. Output: dashed top border, `--bg-soft`, mono, "Output" caption via `::before`.

## Code highlighting (editor-style code blocks)

### Markup

```html
<figure class="codeblock">
  <div class="codeblock__bar">
    <span class="codeblock__dots" aria-hidden="true"
      ><i></i><i></i><i></i
    ></span>
    <span class="codeblock__tab">counter.js</span>
    <span class="codeblock__lang">JavaScript</span>
    <button class="copy-btn" type="button">Copy</button>
  </div>
  <pre
    class="line-numbers"
    data-line="2,4"
  ><code class="language-javascript">…escaped source…</code></pre>
</figure>
```

- Source inside `<code>` is **raw, HTML-escaped text** (`&lt;` `&gt;` `&amp;`). No hand-written token spans; Prism tokenizes.
- `<pre>` starts at column 0 so no stray indentation enters the code.
- Language: `class="language-xxx"` on `<code>` (any Prism language id; autoloader fetches it).
- **Line numbers:** add `class="line-numbers"` to `<pre>`. Use for blocks ≥ 5 lines.
- **Highlighted lines:** `data-line="2,4-6"` on `<pre>`. Rendered as `--code-hl` row with 3px `--c-function` inset bar.
- **Diff:** `<code class="language-diff-javascript diff-highlight">`, lines prefixed `+ `, `- `, or two spaces. Added rows `--c-inserted`, removed `--c-deleted`.
- `.codeblock__lang` text: human name (JavaScript, Python, Diff…).

### Look

- Editor is dark in both themes: `--code-bg`, `--r-lg`, `--code-line` border, `--shadow-lg`, `overflow: hidden`.
- Bar (42px, `--code-bar`): three 11px dots (`--code-dim`, 55% opacity), file tab (`--code-bg`, top-rounded, overlaps bar's bottom border by 1px so it merges with the editor), language label pushed right, copy button.
- `pre`: `padding: 1em 1.25em` (**top padding must stay 1em**, line-highlight offsets assume it), `overflow: auto`, `font: .875rem/1.7 var(--mono)`, `tab-size: 2`. Line-numbers: `padding-left: 3.8em`, gutter right hairline `--code-line`, numbers `--code-dim`.
- Copy button: hairline `--code-line`, `--r-sm`, copy icon + "Copy"; hover `--code-hl`; `.is-copied` inverts (`--code-fg` bg) with check icon + "Copied" for 1.5s.

### Token colors

| Prism tokens                                       | Token var              |
| -------------------------------------------------- | ---------------------- |
| `comment prolog doctype cdata`                     | `--c-comment` + italic |
| `keyword important atrule rule selector`           | `--c-keyword`          |
| `string char template-string attr-value regex url` | `--c-string`           |
| `function method`                                  | `--c-function`         |
| `number boolean constant symbol`                   | `--c-number`           |
| `class-name builtin tag namespace`                 | `--c-class`            |
| `property attr-name parameter variable`            | `--c-property`         |
| `punctuation operator`                             | `--c-punct`            |
| `interpolation-punctuation`                        | `--c-keyword`          |

### Prism setup

Load at end of `<body>`, before the page script. Do **not** load a Prism theme CSS or plugin CSS; the spec's CSS replaces them (line-numbers, line-highlight, diff-highlight rules are written with tokens).

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-highlight/prism-line-highlight.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/diff-highlight/prism-diff-highlight.min.js"></script>
```

Omit plugin scripts the page doesn't use.

Plugin CSS (tokenized replacements, include when the plugin is used):

```css
.codeblock pre.line-numbers {
  padding-left: 3.8em;
  counter-reset: linenumber;
}
.codeblock pre.line-numbers > code {
  position: relative;
  white-space: inherit;
}
.line-numbers .line-numbers-rows {
  position: absolute;
  top: 0;
  left: -3.8em;
  width: 3em;
  font-size: 100%;
  letter-spacing: -1px;
  border-right: 1px solid var(--code-line);
  pointer-events: none;
  user-select: none;
}
.line-numbers-rows > span {
  display: block;
  counter-increment: linenumber;
}
.line-numbers-rows > span::before {
  content: counter(linenumber);
  display: block;
  padding-right: 0.8em;
  text-align: right;
  color: var(--code-dim);
}

.line-highlight {
  position: absolute;
  left: 0;
  right: 0;
  margin-top: 1em;
  background: var(--code-hl);
  box-shadow: inset 3px 0 var(--c-function);
  pointer-events: none;
  line-height: inherit;
  white-space: pre;
}

pre.diff-highlight > code .token.inserted:not(.prefix),
pre > code.diff-highlight .token.inserted:not(.prefix) {
  display: block;
  background: var(--c-inserted);
}
pre.diff-highlight > code .token.deleted:not(.prefix),
pre > code.diff-highlight .token.deleted:not(.prefix) {
  display: block;
  background: var(--c-deleted);
}
.token.prefix.inserted {
  color: var(--c-property);
}
.token.prefix.deleted {
  color: var(--c-keyword);
}
```

## Behaviors (page script)

Include only parts whose elements exist. Reference implementation:

```js
// Theme toggle (restore is inline in <head>)
const root = document.documentElement;
const themeBtn = document.querySelector(".theme-btn");
const isDark = () =>
  root.dataset.theme
    ? root.dataset.theme === "dark"
    : matchMedia("(prefers-color-scheme: dark)").matches;
const SUN =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const syncThemeBtn = () => {
  themeBtn.innerHTML = isDark() ? SUN : MOON;
  themeBtn.setAttribute(
    "aria-label",
    isDark() ? "Switch to light theme" : "Switch to dark theme",
  );
};
syncThemeBtn();
themeBtn.addEventListener("click", () => {
  root.dataset.theme = isDark() ? "light" : "dark";
  try {
    localStorage.setItem("theme", root.dataset.theme);
  } catch {}
  syncThemeBtn();
});

// Reading progress: default vertical page scroll. Drives top bar + sidebar card.
const bars = document.querySelectorAll(".progress__bar, .toc-progress__fill");
const pctText = document.querySelector(".toc-progress__pct");
const progress = document.querySelector(".progress");
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  const pct = max > 0 ? Math.min(scrollY / max, 1) : 0;
  bars.forEach((b) => {
    b.style.transform = `scaleX(${pct})`;
  });
  const n = Math.round(pct * 100);
  progress.setAttribute("aria-valuenow", n);
  if (pctText) pctText.textContent = `${n}%`;
};
addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", updateProgress);
updateProgress();

// Copy buttons: copy source only (strip Prism line-number/highlight nodes).
const COPY =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>Copy';
const DONE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>Copied';
document.querySelectorAll(".copy-btn").forEach((btn) => {
  btn.innerHTML = COPY;
  btn.addEventListener("click", async () => {
    const code = btn
      .closest(".codeblock")
      .querySelector("code")
      .cloneNode(true);
    code
      .querySelectorAll(".line-numbers-rows, .line-highlight")
      .forEach((n) => n.remove());
    try {
      await navigator.clipboard.writeText(code.textContent.replace(/\n$/, ""));
      btn.innerHTML = DONE;
    } catch {
      btn.textContent = "Failed";
    }
    btn.classList.add("is-copied");
    setTimeout(() => {
      btn.innerHTML = COPY;
      btn.classList.remove("is-copied");
    }, 1500);
  });
});

// Heading anchor links
document.querySelectorAll(".content :is(h2, h3)[id]").forEach((h) => {
  const a = document.createElement("a");
  a.className = "anchor";
  a.href = `#${h.id}`;
  a.textContent = "#";
  a.setAttribute("aria-label", `Link to ${h.textContent}`);
  h.append(a);
});

// Active sub-topic: last heading above the top third of the viewport
const links = [...document.querySelectorAll(".subtopics a")];
const headings = links.map((a) =>
  document.querySelector(a.getAttribute("href")),
);
const updateActive = () => {
  let i = 0;
  headings.forEach((h, idx) => {
    if (h && h.getBoundingClientRect().top < innerHeight / 3) i = idx;
  });
  links.forEach((a, idx) => a.classList.toggle("is-active", idx === i));
};
addEventListener("scroll", updateActive, { passive: true });
updateActive();

// Mobile drawer
const menuBtn = document.querySelector(".menu-btn");
const isNavOpen = () => document.body.classList.contains("nav-open");
const setNav = (open) => {
  document.body.classList.toggle("nav-open", open);
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.setAttribute("aria-label", open ? "Close topics" : "Open topics");
};
menuBtn.addEventListener("click", () => setNav(!isNavOpen()));
document
  .querySelectorAll(".topics a")
  .forEach((a) => a.addEventListener("click", () => setNav(false)));
// Close on backdrop click or Escape.
document.addEventListener("click", (e) => {
  if (isNavOpen() && !e.target.closest(".sidebar--left, .menu-btn"))
    setNav(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isNavOpen()) {
    setNav(false);
    menuBtn.focus();
  }
});
```

## Interaction

- Focus ring: 2px solid `--fg`, 2px offset, `--r-sm` radius, on `:focus-visible`.
- Transitions ≤ 150ms (color, background, border, shadow, small 2px lifts). `scroll-behavior: smooth` only under `prefers-reduced-motion: no-preference`; all transitions off under `reduce`.
- `html { scroll-padding-top: calc(var(--header-h) + 24px) }` so anchor jumps clear the sticky header.

## Checklist

- [ ] Token block verbatim (dark override block written out in full); no raw colors outside it.
- [ ] `<head>` order: theme restore → font preconnect/link → stylesheet. No flash in either theme.
- [ ] Body renders in Rubik; code in system mono.
- [ ] Only code editors contain color; rest of UI is grayscale in both themes.
- [ ] Prism scripts load before page script; every `<code>` in `.codeblock` has `language-*` and escaped source; highlighting renders.
- [ ] Line numbers align with code lines; `data-line` highlights sit on the right rows.
- [ ] Copy button copies clean source (no line numbers), shows "Copied".
- [ ] Progress bar and reading card fill 0→100% over vertical page scroll.
- [ ] Every `.subtopics` link targets an existing `h2/h3[id]`; active state follows scroll; `#` anchors appear on hover.
- [ ] Current topic has `aria-current="page"`.
- [ ] No horizontal page scroll at 360px; code and tables scroll inside themselves.
- [ ] Drawer works below 860px (backdrop click + Esc close, page doesn't scroll behind, closed drawer not tabbable); right sidebar hidden below 1200px.
- [ ] Skip link appears on first Tab and jumps to `#main`.
- [ ] All icons are inline SVG; no text glyphs.
- [ ] Keyboard focus visible on all links and buttons.
