# learn — course generator kit

Portable kit: `LEARN.md`, `DESIGN.md`, `CLAUDE.md`, `.claude/`, `tools/`, `programming_language/`. Copy it into a fresh folder to start new courses.

- `@LEARN.md <language>` runs the course generator. LEARN.md is the process; follow it exactly. Each phase group runs in its own session (`/clear` between gates).
- After any plan (LEARN.md gates, task plans, design proposals): stop and wait for the user's explicit approval before implementing.
- `DESIGN.md` is the user's portable design spec: propose edits, apply only on approval. `programming_language/` is reference only: never read it as a template, never write to it.
- Claude Code setup stays project-level (`.claude/`, this file). Never edit global `~/.claude` config.
- Self-improvement: you may edit `LEARN.md`, `.claude/agents/learn-*.md` and `tools/*` from session lessons without asking. Log each change in LEARN.md's Changelog and report it.
- Subagents launched by LEARN.md use `.claude/agents/learn-*.md`; their rules live there, not in prompts.
- `.claude/skills/` holds 5 skills copied from superpowers 7.0.0 (MIT): verification-before-completion, systematic-debugging, dispatching-parallel-agents, writing-skills (use it when editing agent files), diagnosing-superpowers. The plugin itself stays off here, because its other skills (brainstorming, writing-plans…) clash with LEARN.md's gates and phases.
- Tools (Node, no deps):
  - `tools/check-topic.mjs`: validate course data.
  - `tools/course-pipeline.js`: Workflow script for Phases 3+5.
  - `tools/token-usage.mjs`: token report.
  - `tools/app-template/`: verified app, copied into each course; `SPEC.md` for rebuilds.
- Generated courses live in `<slug>/`. Never regenerate finished work unless the user asks.
