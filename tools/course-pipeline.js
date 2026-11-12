export const meta = {
  name: 'learn-course-pipeline',
  description: 'LEARN.md Phases 3+5: write each topic, review accuracy + clarity, fix, re-verify (max 2 rounds)',
  whenToUse: 'LEARN.md Phase 3-5 after Gate 2. args: {slug, version, topics: [topic slugs to verify], author?: [subset to write first; default = topics]}',
  phases: [
    { title: 'Author', detail: 'learn-author (sonnet), one per topic' },
    { title: 'Review', detail: 'learn-accuracy (sonnet, ≤3 topics) + learn-clarity (haiku, ≤6 topics)' },
    { title: 'Fix', detail: 'learn-fixer (sonnet), one per failing topic' },
    { title: 'Re-verify', detail: 'only the reported issues, max 2 rounds' },
  ],
}

// Run via Workflow({scriptPath: "tools/course-pipeline.js", args: {...}}). Agent rules live in .claude/agents/learn-*.md.
const { slug, version } = args
const topics = args.topics
const author = new Set(args.author || topics)
if (!slug || !version || !Array.isArray(topics) || !topics.length) throw new Error('args: {slug, version, topics: [...]} required')

// LEARN.md: max 4 agents running at once.
let active = 0
const waiting = []
const limit = async (fn) => {
  while (active >= 4) await new Promise((r) => waiting.push(r))
  active++
  try { return await fn() } finally { active--; const next = waiting.shift(); if (next) next() }
}
const run = (type, model, phase, task, body, schema) => limit(() => agent(
  `LEDGER: ${phase} | ${task}\nSLUG=${slug}\nVERSION=${version}\n${body}\nFollow your agent instructions.`,
  { agentType: type, model, phase: phase.replace(/^Phase \d /, ''), label: `${type}:${task}`, schema }))

const AUTHOR = { type: 'object', properties: { ok: { type: 'boolean' }, note: { type: 'string' } }, required: ['ok'] }
const REVIEW = {
  type: 'object',
  properties: { topics: { type: 'array', items: { type: 'object', properties: {
    slug: { type: 'string' }, pass: { type: 'boolean' }, issues: { type: 'array', items: { type: 'string' } },
  }, required: ['slug', 'pass', 'issues'] } } },
  required: ['topics'],
}
const FIX = { type: 'object', properties: { fixed: { type: 'array', items: { type: 'string' } }, skipped: { type: 'array', items: { type: 'string' } } }, required: ['fixed', 'skipped'] }

const chunk = (a, n) => Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n))
const range = (g) => g.length > 1 ? `${g[0].slice(0, 2)}–${g[g.length - 1].slice(0, 2)}` : g[0]

// One review pass over a group of topics. Issues are tagged ACC (accuracy), CLR (clarity), CHK (scripted check).
// prior = {slug: [tagged issues]} → re-verify mode: each reviewer gets only its own tags (accuracy also re-checks CHK).
const REVIEWERS = [
  { tag: 'ACC', own: ['ACC', 'CHK'], type: 'learn-accuracy', model: 'sonnet', size: 3, name: 'accuracy' },
  { tag: 'CLR', own: ['CLR'], type: 'learn-clarity', model: 'haiku', size: 6, name: 'clarity' },
]
const review = async (group, prior) => {
  const issues = Object.fromEntries(group.map((t) => [t, []]))
  const jobs = []
  for (const R of REVIEWERS) {
    const mine = (t) => (prior?.[t] || []).filter((x) => R.own.includes(x.slice(0, 3)))
    const todo = prior ? group.filter((t) => mine(t).length) : group
    for (const g of chunk(todo, R.size)) {
      const ctx = prior ? `\nRe-verify mode. Prior issues:\n${g.map((t) => `${t}:\n- ${mine(t).map((x) => x.slice(5)).join('\n- ')}`).join('\n')}` : ''
      const phase = prior ? 'Phase 5 re-verify' : `Phase 5 ${R.name}`
      jobs.push(() => run(R.type, R.model, phase, `${R.name} ${range(g)}`, `Topics: ${g.join(', ')}${ctx}`, REVIEW).then((r) => ({ R, g, r })))
    }
  }
  for (const { R, g, r } of (await parallel(jobs)).filter(Boolean)) {
    if (!r) { g.forEach((t) => issues[t].push(`${R.tag}: ${R.name} review agent failed; re-run review`)); continue }
    for (const x of r.topics || []) if (issues[x.slug] && !x.pass) issues[x.slug].push(...(x.issues.length ? x.issues : ['marked fail without detail']).map((i) => `${R.tag}: ${i}`))
  }
  return issues
}

const result = {}
await pipeline(
  chunk(topics, 6),
  // Phase 3: write (topics already written are skipped). Author runs check-topic.mjs itself.
  async (group) => {
    const out = await parallel(group.filter((t) => author.has(t)).map((t) => () => run('learn-author', 'sonnet', 'Phase 3 content', t, `Topic=${t}`, AUTHOR).then((r) => [t, r])))
    const pre = {}
    for (const [t, r] of out.filter(Boolean)) if (!r || !r.ok) pre[t] = [`CHK: node tools/check-topic.mjs ${slug} ${t} fails: ${r ? r.note || 'see output' : 'author agent failed; file may be missing'}`]
    return pre
  },
  // Phase 5: review, then up to 2 fix → re-verify rounds per failing topic.
  async (pre, group) => {
    const first = await review(group)
    let open = {}
    for (const t of group) { const all = [...(pre[t] || []), ...first[t]]; if (all.length) open[t] = all; else result[t] = { status: 'done' } }
    for (let round = 1; round <= 2 && Object.keys(open).length; round++) {
      const failing = Object.keys(open)
      const fixes = await parallel(failing.map((t) => () => run('learn-fixer', 'sonnet', 'Phase 5 fix', `${t} r${round}`, `Topic=${t}\nIssues:\n- ${open[t].join('\n- ')}`, FIX)))
      failing.forEach((t, i) => { const s = fixes[i]?.skipped || []; if (s.length) log(`${t} r${round} skipped: ${s.join(' | ')}`) })
      const again = await review(failing, open)
      const next = {}
      for (const t of failing) if (again[t].length) next[t] = again[t]; else result[t] = { status: 'done', rounds: round }
      open = next
    }
    for (const t of Object.keys(open)) result[t] = { status: 'flagged', issues: open[t] }
    log(`${range(group)}: ${group.map((t) => `${t.slice(0, 2)}=${result[t]?.status}`).join(' ')}`)
  },
)
return result
