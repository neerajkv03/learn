# App template spec (rebuild only)

`tools/app-template/` holds `index.html`, `style.css` and `app.js`: a generic renderer for the topic schema, used unchanged by every course. A course provides only `data/manifest.js` and `data/<slug>.js`.

**Rebuild only** if `DESIGN.md` changes, the topic schema changes, or the user asks for it. Rebuild with one Sonnet subagent. It must read `./DESIGN.md` in full first and follow it exactly (tokens verbatim, `<head>` order, Rubik + Prism.js 1.29.0 from cdnjs as the only external dependencies, class names, layout, breakpoints, behaviors, checklist). Use no visual styles outside DESIGN.md. Then run the DESIGN.md checklist review once (Haiku). On fail, Sonnet fixes and Haiku re-checks, max 2 rounds. The template was last verified with `python-uv` (2026-11-11).

The app has no frameworks and no build step, and must work by double-clicking `index.html` (`file://`, no `fetch`).

- `data/manifest.js` (written per course):
  ```js
  window.LANG = "<LANG>";
  window.SLUG = "<SLUG>";
  window.MANIFEST = ["01-variables-types", "..."]; // all slugs, in order
  ```
- `index.html`: the DESIGN.md shell.
  - `.progress`.
  - Sticky `.header` with `.menu-btn`, the logo (`.logo__mark` letter set by `app.js` from LANG), the crumb and `.theme-btn`.
  - `.layout` with `.sidebar--left` (`ul.topics`), `.content`, and `.sidebar--right` (`ul.subtopics` + `.toc-progress`).
  - `<head>` follows the DESIGN.md Theme section.
  - Body end loads, in order: Prism scripts (core, autoloader, line-numbers, line-highlight; no diff) → `data/manifest.js` → `app.js`.
- `style.css`: DESIGN.md tokens + components + Prism plugin CSS.
- `app.js`:
  - Load every `data/<slug>.js` from `MANIFEST` by injecting `<script>` tags. Show a visible `.note--warning` for any that fail.
  - Sort topics by `order`. Use hash routing (`#<slug>`). The home page has a "Start" link. Sub-topic anchors use `#<slug>--<subtopic-id>` so they don't collide with routes.
  - Map schema fields to DESIGN.md components:

    | Schema field | Component |
    |---|---|
    | topic `order` + `version` | `span.eyebrow` ("Topic 3 · Python 3.13") |
    | `title` / `summary` | `h1` / `p.lead` |
    | `prerequisites` | `ul.meta` chips with links |
    | sub-topic | `h2[id]` + entry in `ul.subtopics` |
    | `explanation` | body `p` (split on blank lines) |
    | `analogy` | `.note.note--tip`, label "Real-life analogy" |
    | `code[]` | `.example` (label "Example N", title = `filename`) → `.codeblock` (tab = `filename`; lang label = display name of `code.language`, e.g. `python`→Python, `bash`→Bash, `toml`→TOML, unknown → the id; `language-<language>` on `<code>`; `line-numbers` if ≥ 5 lines) → `.example__output` if `output` is non-empty → `explanation` in `.example__body` |
    | `productionNote` | `.note.note--important`, label "In production" |
    | `commonMistakes` | `.note.note--warning`, label "Common mistakes", `ul` inside |
    | `sources` | last block of the sub-topic: `ul.meta` with first chip `<strong>Sources</strong>`, then one chip per source holding `a[href][target=_blank][rel=noopener]` (text = `title`). Only `https:` URLs are rendered. |
    | `quiz` | `h2` "Quiz". Options are buttons styled from existing tokens (hairline, `--r`, hover `--surface`). Correct answer = inverted (`--fg` bg) + "✓"; wrong = `--line-strong` border + "✗". Explanation in a `.note` after answering. Monochrome only. |
    | prev / next | `nav.pager` |
    | "Mark as complete" | button below the quiz; completed topics show "✓" after the title in `ul.topics` |

  - Set all data text via `textContent` / DOM nodes, never `innerHTML` with data. Code goes into `<code>` via `textContent`, so escaping is automatic.
  - After each route render:
    - run `Prism.highlightAllUnder(content)`;
    - re-bind the content-dependent behaviors (copy buttons, heading anchors, active sub-topic, reading progress);
    - set `aria-current="page"` on the current topic;
    - close the mobile drawer;
    - scroll to top.

    Theme toggle and drawer bind once.
  - **Learner state** lives in `localStorage` key `learn:<SLUG>` as one JSON object. Wrap every read and write in try/catch; on failure the app still works, just without resume. The theme key stays `theme`.
    ```json
    { "done": ["01-variables-types"], "last": "02-operators", "scroll": { "02-operators": 1240 } }
    ```
    - `done`: completed topic slugs. Clicking pager **Next** marks the current topic done; "Mark as complete" toggles it.
    - `last`: updated on every topic render.
    - `scroll`: per-topic scroll position, saved on scroll (debounced ~300ms) and on `pagehide`.
  - **Resume on revisit:**
    - URL has no hash → redirect to `#<last>` and restore its saved scroll after Prism highlighting finishes.
    - No `last` → first topic.
    - An explicit hash in the URL always wins.
    - Unknown slug in `last` (topic removed) → first topic not yet done.
  - The home page lives at `#home` (the logo links there) and shows "Continue: <last topic title>" plus a `done/total` count.
- Known limit: Prism grammars load from cdnjs via the autoloader, so syntax highlighting needs internet. Offline, code still renders as plain monospace text.
