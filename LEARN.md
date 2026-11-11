# LEARN — Programming Language Course Generator

**Invocation:** user sends `@LEARN.md <language>` (e.g. `@LEARN.md python`).

- `LANG` = language named in the message. None named → ask once, then proceed.
- `SLUG` = lowercase kebab of LANG, symbols spelled out (`C#` → `csharp`, `C++` → `cpp`, `Node.js` → `nodejs`).
- `VERSION` = latest stable LANG release, **verified at run time** (Phase 1 step 0) — never from memory alone. State it in every output.
- LANG may name a toolchain too (e.g. "python with uv"): verify each tool's version, VERSION = all of them (e.g. `Python 3.15.2 + uv 0.13.7`).
- **Never inspect or depend on the local machine's toolchain.** Content states the VERSION it needs; the learner installs it manually. Code is not executed (see Phase 5).

`./programming_language/` is a **structure reference only**. Never read its file contents as templates, never modify it. Generate the full structure fresh for every new language (Phase 0).

`./DESIGN.md` is the **design spec** for all output UI (Phase 4). Follow it exactly.

---

## Approval gates (mandatory)

After every planning step, **stop and wait for the user's response**. Do not continue on silence or assumption.
- Gate 1: after Phase 1 (topic list).
- Gate 2: after Phase 2 (all plans).
- On RESUME: if the next phase follows a gate not yet approved, show what is ready and wait.
- Record approval in the `Approved:` header line of `TOPIC_SUBTOPIC_LIST.md` (see Phase 1 template): flip `✗` → `✓` per gate.

---

## Model routing (mandatory)

| Work | Model | How |
|---|---|---|
| Planning, orchestration (topic list, per-topic plans, coordination) | Opus | Main session. If main session is not Opus → tell user to run `/model opus` and stop. |
| Content generation (topic JSON, app files) | Sonnet | Agent tool with `model: "sonnet"` |
| Factual accuracy review (content correct for VERSION) | Sonnet | Agent tool with `model: "sonnet"`, only after scripted checks pass. Must not be the same subagent that wrote the content. |
| Clarity + checklist review (beginner clarity, analogies, jargon, DESIGN.md checklist) | Haiku | Agent tool with `model: "haiku"`, only after scripted checks pass |

- Run independent subagents in parallel, max 4 per batch (count every running agent, including reviews and fixes).
- After each launch, append one line to `SLUG/plans/agents.tsv`: `<agentId>\t<phase>\t<task>` (e.g. `a1b2…\tPhase 3 content\t01-variables-types`). Used by the token report (Finish).
- Each subagent prompt must be self-contained: pass file paths, schema, VERSION, rules below. Subagents have no conversation context.

---

## Optional skills (use if installed)

At start, check the session's skill list for `caveman` and `ponytail`. Missing → skip; nothing else changes.

- **caveman** — orchestrator chat, progress updates, and subagent reports back (review issue lists, fix receipts). **Never** in learner-facing text (topic JSON, quiz, app UI copy): global rule 2 wins. Gate summaries stay terse but list every topic/sub-topic/goal in full.
- **ponytail** — Phase 4 app code and Phase 5 check scripts: fewest files, stdlib/native first, no deps beyond DESIGN.md's. Never cuts a Phase 4 feature, DESIGN.md checklist item, `textContent` safety, or try/catch on storage. Content code examples: minimal, but must still fully show the concept.
- Subagents don't inherit modes. When a skill applies, put its rule in the prompt as one line (e.g. "Report terse: one line per issue, no preamble." / "Shortest working code; no extra files or deps.").
- Neither skill overrides approval gates, model routing, or accuracy rules.

---

## Global content rules (apply to every phase)

1. **Production-relevant only.** Include topics, sub-topics, features commonly used in production-grade LANG code. Skip trivia, deprecated, rarely-used, or legacy-only features.
2. **Zero-knowledge learner.** Assume no prior programming knowledge. Define every term on first use. Order beginner → production-level.
3. **Real-life analogies** for every non-trivial concept, sub-topic, or term.
4. **Accuracy over volume.** Only syntax/APIs valid for VERSION. If unsure about a fact, leave it out.
5. **All learning content is JSON** (schema in Phase 3).

---

## Phase 0 — Scaffold (idempotent)

1. If `./SLUG/` exists → **RESUME**: read the header lines (`Approved:`, `App:`) and status columns in `SLUG/TOPIC_SUBTOPIC_LIST.md`, continue from first non-`done` item in the correct phase. Do not regenerate finished work.
2. Else create this structure (mirrors `./programming_language/`):

```
SLUG/
├── TOPIC_SUBTOPIC_LIST.md
├── TOKEN_USAGE.md          (written at Finish)
├── plans/                  (+ agents.tsv ledger)
└── output/
    ├── index.html
    ├── style.css
    ├── app.js
    └── data/
        └── manifest.js
```

---

## Phase 1 — Topic list (Opus) → `SLUG/TOPIC_SUBTOPIC_LIST.md`

0. **Verify VERSION:** WebSearch/fetch the official LANG release page (e.g. python.org/downloads, nodejs.org, go.dev/dl). Use the latest stable (non-beta, non-RC) release. Record version, date checked, and source URL in the header. If lookup fails → tell user, ask them to confirm VERSION before continuing.

- 15–25 topics, 3–8 sub-topics each.
- Ordered by dependency: each topic needs only earlier topics.
- Slug format: `NN-kebab-title` (e.g. `01-variables-types`).

Exact format:

```markdown
# <LANG> Learning Path (v<VERSION>)

Version checked: <VERSION> on <YYYY-MM-DD> via <official source URL>
Approved: list ✗ | plans ✗
App: todo | App verified: todo

| # | Topic | Slug | Sub-topics | Plan | Content | Verified |
|---|-------|------|------------|------|---------|----------|
| 01 | Variables & Types | 01-variables-types | Declaring variables; Primitive types; Type conversion | todo | todo | todo |
```

**STOP. Show the list to the user and wait for approval or edits before Phase 2.**

---

## Phase 2 — Plans (Opus) → `SLUG/plans/<slug>.md`

One file per topic, this structure:

```markdown
# <NN>. <Topic title>
Version: <VERSION>
Prerequisites: <slugs or "none">

## Learning goals
- After this topic, learner can ...

## Sub-topics
### <Sub-topic title>
- Concept: <what to explain, in plain words>
- Analogy: <real-life analogy idea>
- Code example: <what the minimal runnable example shows + expected output>
- Production use: <where this appears in real production code>
- Common mistakes: <1-3 beginner mistakes>
- Sources: <1-3 official doc URLs backing this sub-topic (language/tool docs, PEPs); deep link to the exact section>

## Quiz
1. <question idea> — tests <concept>
(3-5 questions)
```

Update `Plan` column → `done` after each file.

**STOP. Show the user a summary of all plans (topic, sub-topics, learning goals) and wait for approval or edits before Phase 3. Never start content generation without explicit approval.**

---

## Phase 3 — Content (Sonnet subagents) → `SLUG/output/data/<slug>.js`

- One subagent per topic. Give it: its plan file path, schema below, VERSION, global content rules.
- File format (works when opening `index.html` directly via `file://`, no `fetch`):

```js
window.TOPICS = window.TOPICS || [];
window.TOPICS.push({ ...JSON... });
```

- Payload inside `push(...)` must be **strict valid JSON**: double quotes, no trailing commas, no comments. File ends with `});` — authors must run a Node parse check on the wrapper before reporting (closing `);` was dropped repeatedly).
- Every code example must be runnable as-is and include its expected output (`""` if none). Code is **not executed**: the author traces it by hand and writes the output it would print on VERSION.
- Terminal commands (e.g. `uv add`, `docker build`): `code.language` = `bash` (or `powershell`), output = short representative output or `""` (tool output varies by version/OS).
- **Sources:** every sub-topic gets 1-3 `sources` from the plan — official docs only (language/tool docs, PEPs, official repos). Only URLs you are confident exist; never invent a deep link — fall back to the parent page.
- Code examples must be **predictable**: single file, no stdin input, no network, no external packages beyond the standard library (unless the plan names one), and **deterministic output** — no current time/date, random values, memory addresses, unordered set/hash iteration, or thread-timing in printed output. If a concept needs non-determinism (e.g. random), seed it or print only stable facts (e.g. `len(...)`, type).
- File naming must satisfy the toolchain (e.g. Java: filename = public class name; Go: `package main` + `func main`; Rust: `fn main`).
- Terms from later topics (error names like `TypeError`, `import`, `list`…) and jargon in `productionNote`/`commonMistakes`: gloss in a short clause at first use in the topic, or use a taught alternative. Those fields are learner text too. Shell commands in prose follow the course toolchain (e.g. `uv run`, not bare `python`).
- Quiz: vary `answerIndex` across questions — correct answer must not sit at the same index in every question.
- `code.language` = Prism.js language id (e.g. `python`, `javascript`, `csharp`, `cpp`). `code.filename` = realistic file name shown in editor tab (e.g. `greet.py`).
- Update `Content` column → `done` after each file.

Schema:

```json
{
  "id": "01-variables-types",
  "order": 1,
  "title": "string",
  "version": "string",
  "summary": "string (2-3 sentences)",
  "prerequisites": ["slug of earlier topic"],
  "subtopics": [
    {
      "id": "kebab-string",
      "title": "string",
      "explanation": "string",
      "analogy": "string",
      "code": [
        { "language": "prism-language-id", "filename": "string", "source": "string", "output": "string", "explanation": "string" }
      ],
      "productionNote": "string",
      "commonMistakes": ["string"],
      "sources": [{ "title": "string", "url": "https://..." }]
    }
  ],
  "quiz": [
    { "question": "string", "options": ["string"], "answerIndex": 0, "explanation": "string" }
  ]
}
```

---

## Phase 4 — Output app (one Sonnet subagent, runs in parallel with Phase 3)

Generic renderer for the schema. No frameworks, no build step. Must work by double-clicking `index.html`.

**Design: subagent must read `./DESIGN.md` in full first and follow it exactly** (tokens verbatim, `<head>` order, DESIGN.md's web font + Prism.js 1.29.0 from cdnjs as the only external dependencies, class names, layout, breakpoints, behaviors, checklist). No visual styles outside DESIGN.md.

- `data/manifest.js`:
  ```js
  window.LANG = "<LANG>";
  window.MANIFEST = ["01-variables-types", "..."]; // all slugs, in order
  ```
- `index.html`: DESIGN.md shell — `.progress`, sticky `.header` (`.menu-btn`, logo with first letter of LANG, crumb, `.theme-btn`), `.layout` with `.sidebar--left` (`ul.topics`), `.content`, `.sidebar--right` (`ul.subtopics` + `.toc-progress`). Head per DESIGN.md Theme section. Body end: Prism scripts (core, autoloader, line-numbers, line-highlight; skip diff) → `data/manifest.js` → `app.js`.
- `style.css`: DESIGN.md tokens + components + Prism plugin CSS.
- `app.js`:
  - Load every `data/<slug>.js` from `MANIFEST` by injecting `<script>` tags; show a visible `.note--warning` for any that fail.
  - Sort topics by `order`. Hash routing (`#<slug>`); home page with "Start" link. Sub-topic anchors use `#<slug>--<subtopic-id>` so they don't collide with routes.
  - Map schema → DESIGN.md components:

    | Schema field | Component |
    |---|---|
    | topic `order` + `version` | `span.eyebrow` ("Topic 3 · Python 3.13") |
    | `title` / `summary` | `h1` / `p.lead` |
    | `prerequisites` | `ul.meta` chips with links |
    | sub-topic | `h2[id]` + entry in `ul.subtopics` |
    | `explanation` | body `p` (split on blank lines) |
    | `analogy` | `.note.note--tip`, label "Real-life analogy" |
    | `code[]` | `.example` (label "Example N", title = `filename`) → `.codeblock` (tab = `filename`, lang = display name of `code.language` (e.g. `python`→Python, `bash`→Bash, `toml`→TOML; unknown → the id), not LANG — content mixes languages, `language-<language>` on `<code>`, `line-numbers` if ≥ 5 lines) → `.example__output` if `output` non-empty → `explanation` in `.example__body` |
    | `productionNote` | `.note.note--important`, label "In production" |
    | `commonMistakes` | `.note.note--warning`, label "Common mistakes", `ul` inside |
    | `sources` | last block of the sub-topic: `ul.meta` with first chip `<strong>Sources</strong>`, then one chip per source holding `a[href][target=_blank][rel=noopener]` (text = `title`). Only `https:` URLs rendered. |
    | `quiz` | `h2` "Quiz"; options as buttons styled from existing tokens (hairline, `--r`, hover `--surface`); correct answer = inverted (`--fg` bg) + "✓", wrong = `--line-strong` border + "✗"; explanation in `.note` after answer. Monochrome only. |
    | prev / next | `nav.pager` |
    | "Mark as complete" | button below quiz; completed topics show "✓" after the title in `ul.topics` |

  - Set all data text via `textContent` / DOM nodes, never `innerHTML` with data. Code goes into `<code>` via `textContent` (escaping is automatic).
  - After each route render: run `Prism.highlightAllUnder(content)`, re-bind DESIGN.md behaviors that depend on content (copy buttons, heading anchors, active sub-topic, reading progress), set `aria-current="page"` on current topic, close mobile drawer, scroll to top. Theme toggle + drawer bind once.
  - **Learner state** in `localStorage` key `learn:<SLUG>` (one JSON object, every read/write wrapped in try/catch; on failure app still works, just without resume). Theme key stays `theme` per DESIGN.md.
    ```json
    { "done": ["01-variables-types"], "last": "02-operators", "scroll": { "02-operators": 1240 } }
    ```
    - `done`: completed topic slugs. Clicking pager **Next** marks current topic done; "Mark as complete" toggles it.
    - `last`: updated on every topic render.
    - `scroll`: per-topic scroll position, saved on scroll (debounced ~300ms) and on `pagehide`.
  - **Resume on revisit:** if URL has no hash → redirect to `#<last>` and restore its saved scroll (after Prism highlighting finishes). No `last` → first topic. Explicit hash in URL always wins. Unknown slug in `last` (topic removed) → first not-done topic.
  - Home page lives at `#home` (logo links there) and shows "Continue: <last topic title>" plus `done/total` count.
- Before finishing: run the DESIGN.md checklist and report each item pass/fail.
- Orchestrator sets header `App:` → `done` when subagent finishes.
- Known limit: Prism language grammars load from cdnjs via autoloader, so syntax highlighting needs internet; offline, code still renders as plain monospace text.

---

## Phase 5 — Verify (per topic, after its content is done)

1. **Scripted (orchestrator runs Node):** for each data file:
   - payload inside `push(...)` passes `JSON.parse`
   - matches schema: required fields present and non-empty, `answerIndex` within `options` range, `options.length >= 2`
   - `id` equals filename, `order` unique, `prerequisites` reference only earlier topics
   - slug present in `manifest.js`; every manifest slug has a file
   - quiz answer spread: if topic has ≥3 questions, not all `answerIndex` values equal
   - every sub-topic has ≥1 `sources` entry with an `https:` URL; each unique URL answers 2xx/3xx to a Node `fetch` (GET, redirects followed, 10 s timeout, 4 at a time). Dead link → issue.
2. **No code execution.** Do not run examples or check local toolchains; output correctness is covered by step 3.
3. **Accuracy review (Sonnet subagent, not the author):** syntax/APIs valid for VERSION, no deprecated features, claims correct, production note realistic; trace every code example and confirm `output` is what it prints on VERSION; each source actually covers its sub-topic. Returns `pass` / `fail` + issue list.
4. **Clarity review (Haiku subagent):** beginner clarity, analogy present and fitting, no undefined jargon, ordering beginner → production. Returns `pass` / `fail` + issue list.
   - Steps 3–4 may batch topics in one subagent (accuracy ≤3 topics, clarity ≤6), one report block per topic.
5. **Fail (any of steps 1, 3, 4)** → send combined issues to a Sonnet subagent to fix, re-verify. Max 2 rounds; then mark `Verified` = `flagged` and report to user.
6. **Pass** → `Verified` column → `done`.

**Once, after Phase 4:** Haiku subagent reviews `output/index.html`, `style.css`, `app.js` against the DESIGN.md checklist (tokens verbatim, no raw colors outside token block, head order, class names, `textContent` for data). Fail → Sonnet fix → re-check, max 2 rounds. Pass → header `App verified:` → `done`; still failing → `flagged`.

---

## Finish

**Token usage (always, last step):** run `node tools/token-usage.mjs SLUG [sessionId ...]` from the repo root (no session ids = newest session; pass every session the run spanned, e.g. after a RESUME). It reads the Claude Code transcripts, labels agents from `SLUG/plans/agents.tsv`, and writes `SLUG/TOKEN_USAGE.md` (by model, by phase, per agent). Unlabelled rows → fix the ledger and re-run. Don't edit the script per language.

Report to user:
- LANG, VERSION, topic count
- files created
- VERSION source URL + date checked
- flagged topics + reasons; dead source links removed
- versions the learner must install manually (VERSION), with official install links
- app status (`App verified`)
- token usage: total, main session vs subagents, top phase (from `SLUG/TOKEN_USAGE.md`)
- how to open: `SLUG/output/index.html`
- LEARN.md changes made this run (from Self-improvement below)

---

## Self-improvement (standing authorization from user)

The orchestrator may edit this file whenever a session reveals a better rule. No need to ask first; always report it.

- **When:** a failure repeats (same verify issue in 2+ topics), a rule is ambiguous or contradicts another, a step wastes time or tokens, a toolchain quirk appears, or the user corrects the process.
- **How:** smallest edit that prevents recurrence. Put the rule in the phase it governs (not a list of tips at the end). Keep the rule general; LANG-specific facts go in that language's `SLUG/plans/` notes, not here.
- **Never:** loosen approval gates, model routing, accuracy rules, or `textContent` safety without explicit user approval. Do not regenerate finished work just because a rule changed; new rules apply to work not yet started unless the user says otherwise.
- **DESIGN.md:** it is the user's portable design spec, also used outside this project. Propose changes to it; apply only after approval.
- **Log:** add one line per change to the Changelog below, then mention it in the Finish report.

## Changelog

- 2026-11-11 — VERSION verified online at run time; accuracy review moved to Sonnet (Haiku keeps clarity/checklist); `App:` / `App verified:` header status; deterministic single-file code rule + `RUN_RECIPE.md` + 10 s timeout + normalized compare; quiz answer-index spread check; `Approved:` line added to template; offline Prism limit documented; Self-improvement section added.
- 2026-11-11 — Optional skills section: caveman (orchestrator/subagent reports only, never learner content) and ponytail (app + script code), used only if installed; subagents get the rule as one prompt line.
- 2026-11-11 — (user request) Code no longer executed: author writes expected output by hand, accuracy reviewer traces it; RUN_RECIPE + local toolchain checks removed, learner installs VERSION manually. Per-sub-topic `sources` (official docs) added to plan template, schema, app mapping (`ul.meta` link chips) and scripted link check. Multi-tool LANG (e.g. "python with uv") → VERSION lists each tool. Phase 4 font reference fixed (DESIGN.md now uses Rubik, not Open Sans).
- 2026-11-11 — Content authors must parse-check the `push(...)` wrapper (closing `);` dropped in 2 topics). Phase 5 reviews may batch topics per subagent (accuracy ≤3, clarity ≤6) to save tokens; reviewer still never the author.
- 2026-11-11 — (user request) Token usage step: agent ledger `SLUG/plans/agents.tsv` + `tools/token-usage.mjs` → `SLUG/TOKEN_USAGE.md`, summarised in Finish report. Max-4 limit counts all running agents.
- 2026-11-11 — Phase 3: gloss later-topic terms (error names, import, list) and jargon in productionNote/commonMistakes at first use; prose commands use the course toolchain (clarity review flagged this in 10+ topics).
- 2026-11-11 — Codeblock lang label = display name of `code.language`, not LANG (bash/TOML blocks were labelled with the course language).
