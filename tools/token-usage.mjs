// Token usage report for one course run.
// Usage: node tools/token-usage.mjs <SLUG> [sessionId ...]
//   sessionId: Claude Code session(s) of the run; default = ids in <SLUG>/plans/sessions.txt, else newest transcript.
//   Labels: "LEDGER: <phase> | <task>" first line of each subagent prompt, or <SLUG>/plans/agents.tsv (agentId<TAB>phase<TAB>task).
//   Subagents found anywhere under <session>/ (Agent tool and Workflow runs).
// Writes <SLUG>/TOKEN_USAGE.md. Reads ~/.claude/projects/<project-dir>/<session>.jsonl and <session>/subagents/*.jsonl.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const [slug, ...sessionArgs] = process.argv.slice(2);
if (!slug) { console.error("usage: node tools/token-usage.mjs <SLUG> [sessionId ...]"); process.exit(1); }
const repo = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1")), "..");
// Claude Code names the transcript dir after the cwd with every non-alphanumeric char → "-"
const tdir = path.join(os.homedir(), ".claude", "projects", repo.replace(/[^A-Za-z0-9]/g, "-"));
const sfile = path.join(repo, slug, "plans", "sessions.txt");
const listed = fs.existsSync(sfile) ? [...new Set(fs.readFileSync(sfile, "utf8").split(/\s+/).filter(Boolean))] : [];
const sessions = sessionArgs.length ? sessionArgs : listed.length ? listed : [fs.readdirSync(tdir).filter(f => f.endsWith(".jsonl"))
  .map(f => [f, fs.statSync(path.join(tdir, f)).mtimeMs]).sort((a, b) => b[1] - a[1])[0][0].slice(0, -6)];

const labels = {};
const tsv = path.join(repo, slug, "plans", "agents.tsv");
if (fs.existsSync(tsv)) for (const l of fs.readFileSync(tsv, "utf8").split(/\r?\n/)) {
  const [id, phase, task] = l.split("\t"); if (id && phase) labels[id] = [phase, task || ""];
}

const K = ["input", "cacheWrite", "cacheRead", "output", "total", "weighted"];
const read = (id, file) => {
  const seen = new Map(); let model = "", prompt = "";
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    let j; try { j = JSON.parse(line); } catch { continue; }
    if (!prompt && j.type === "user") { const c = j.message?.content; prompt = typeof c === "string" ? c : Array.isArray(c) ? c.map(b => b.text || "").join("\n") : ""; }
    if (j.type === "assistant" && j.message?.usage) { model = j.message.model || model; seen.set(j.message.id || j.uuid, j.message.usage); }
  }
  const r = { id, model, calls: seen.size, input: 0, cacheWrite: 0, cacheRead: 0, output: 0 };
  for (const u of seen.values()) {
    r.input += u.input_tokens || 0; r.cacheWrite += u.cache_creation_input_tokens || 0;
    r.cacheRead += u.cache_read_input_tokens || 0; r.output += u.output_tokens || 0;
  }
  r.total = r.input + r.cacheWrite + r.cacheRead + r.output;
  // approx. cost in input-token units (same model): cache write 1.25x, cache read 0.1x, output 5x
  r.weighted = Math.round(r.input + 1.25 * r.cacheWrite + 0.1 * r.cacheRead + 5 * r.output);
  const led = prompt.match(/LEDGER:\s*([^|\n]+?)\s*\|\s*([^\n]*)/);
  if (led && !labels[id]) labels[id] = [led[1], led[2].trim()];
  [r.phase, r.task] = labels[id] ?? (id.startsWith("main") ? ["Orchestrator (main session)", "Planning + coordination"] : ["Unlabelled", prompt.replace(/\s+/g, " ").slice(0, 60)]);
  return r;
};
const rows = [];
for (const s of sessions) {
  rows.push(read(`main ${s.slice(0, 8)}`, path.join(tdir, s + ".jsonl")));
  const sdir = path.join(tdir, s);
  if (fs.existsSync(sdir)) for (const f of fs.readdirSync(sdir, { recursive: true }).map(String))
    if (f.endsWith(".jsonl") && !f.includes("tool-results")) { const r = read(path.basename(f).replace(/^agent-/, "").slice(0, -6), path.join(sdir, f)); if (r.calls) rows.push(r); }
}

const n = x => x.toLocaleString("en-US");
const short = m => m.replace("claude-", "").replace(/-(\d+)-(\d+)$/, " $1.$2");
const sum = (rs, k) => rs.reduce((a, r) => a + r[k], 0);
const cols = rs => K.map(k => n(sum(rs, k))).join(" | ");
const H = "Input | Cache write | Cache read | Output | Total | Weighted* |", S = "---:|---:|---:|---:|---:|---:|";
const isMain = r => r.id.startsWith("main");
const group = (key, label) => {
  let t = `| ${label} | Agents | ${H}\n|---|---:|${S}\n`;
  const order = key === "phase" ? ["Orchestrator (main session)", ...Object.values(labels).map(l => l[0]), "Unlabelled"] : rows.map(r => r[key]);
  for (const v of [...new Set(order)].filter(v => rows.some(r => r[key] === v))) { const rs = rows.filter(r => r[key] === v); t += `| ${key === "model" ? short(v) : v} | ${rs.filter(r => !isMain(r)).length} | ${cols(rs)} |\n`; }
  return t + `| **All** | **${rows.filter(r => !isMain(r)).length}** | ${K.map(k => `**${n(sum(rows, k))}**`).join(" | ")} |\n`;
};
const subs = rows.filter(r => !isMain(r)), mains = rows.filter(isMain);
let md = `# Token usage — ${slug}

Sessions: ${sessions.map(s => "`" + s + "`").join(", ")} · generated ${new Date().toISOString().slice(0, 10)}
Source: Claude Code transcripts, API \`usage\` per assistant message (de-duplicated by message id). Main-session rows cover the whole conversation.
Input = uncached input · Cache write = prompt cached on that call · Cache read = cached prompt re-read (billed far lower) · Total = all four.
Weighted* = approx. cost in input-token units: input + 1.25×cache write + 0.1×cache read + 5×output (compare within one model; models differ in price).

## By model
${group("model", "Model")}
## By phase
${group("phase", "Phase")}
## Per agent
| Phase | Task | Model | API calls | ${H}
|---|---|---|---:|${S}
${[...rows].sort((a, b) => b.weighted - a.weighted).map(r => `| ${r.phase} | ${r.task} | ${short(r.model)} | ${r.calls} | ${K.map(k => n(r[k])).join(" | ")} |`).join("\n")}

## Notes
- Subagents: ${subs.length}, ${n(sum(subs, "total"))} tokens (weighted ${n(sum(subs, "weighted"))}). Main session: ${n(sum(mains, "total"))} tokens (weighted ${n(sum(mains, "weighted"))}), ${(100 * sum(mains, "cacheRead") / (sum(mains, "total") || 1)).toFixed(1)}% cache reads.
- Dollar cost not computed; run \`/cost\` in Claude Code.
`;
fs.writeFileSync(path.join(repo, slug, "TOKEN_USAGE.md"), md);
console.log(md.split("## Per agent")[0]);
