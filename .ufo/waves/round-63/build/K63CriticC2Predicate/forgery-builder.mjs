#!/usr/bin/env node
// K63CriticC2Predicate — attack C2 (rule T63) with forgeries the eleven committed controls do not cover.
// Fixture only: repo under /tmp, built from `git archive b38a2065` of the lane. The frozen counter is run unmodified.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const REV = 'b38a2065ab8ac5b198f6569b9013d04411c3d40d';
const S = '/tmp/kumitate-r63/K63CriticC2Predicate';
const D = join(S, 'fix');
const PG = join(S, 'pages');
const PROBE = join(LANE, '.ufo/waves/round-63/probe/topology63-probe.mjs');
const ENTRY = 'corpus/knowledge/multi-agent-coordinator-topologies.md';
const OPENED = '2026-10-25';
const CAPDIR = '.ufo/waves/round-63/build/K63CriticC2Predicate/captures';

const sh = (a, o = {}) => spawnSync(a[0], a.slice(1), { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024, ...o });
const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '').replace(/\s+/g, ' ').trim();

const P = (n) => join(PG, n);
const ARX_V3 = 'arxiv.org_abs_2503.13657v3';
const ARX_V1 = 'arxiv.org_abs_2503.13657v1';
const ARX_HTML = 'arxiv.org_html_2503.13657v3';
const ANT = 'www.anthropic.com_engineering_multi-agent-research-system';

// ---------------- fixture repo
rmSync(D, { recursive: true, force: true });
mkdirSync(D, { recursive: true });
sh(['git', '-C', D, 'init', '-q']);
const top = sh(['git', '-C', D, 'rev-parse', '--show-toplevel']).stdout.trim();
if (top !== D) { console.error(`fixture toplevel ${top} != ${D}`); process.exit(2); }
sh(['bash', '-c', `git -C "${LANE}" archive "${REV}" | tar -x -C "${D}"`]);
const ID = ['-c', 'user.name=topology63-critic', '-c', 'user.email=critic@invalid'];
const commit = (m) => {
  sh(['git', '-C', D, 'add', '-A']);
  sh(['git', '-C', D, ...ID, 'commit', '-q', '--allow-empty', '-m', m]);
  return sh(['git', '-C', D, 'rev-parse', 'HEAD']).stdout.trim();
};
const reset = (r) => sh(['git', '-C', D, 'reset', '-q', '--hard', r]);
const edit = (rel, fn) => { const p = join(D, rel); writeFileSync(p, fn(readFileSync(p, 'utf8'))); };
const put = (rel, buf) => { const p = join(D, rel); mkdirSync(join(p, '..'), { recursive: true }); writeFileSync(p, buf); };
commit('base');

// ---------------- captures (bytes == the live fetch the counter will redo)
const capBytes = {
  'arxiv-v3.html': readFileSync(P(ARX_V3)),
  'arxiv-v1.html': readFileSync(P(ARX_V1)),
  'arxiv-html-v3.html': readFileSync(P(ARX_HTML)),
  'anthropic-research-system.html': readFileSync(P(ANT)),
};
const capPath = (n) => `${CAPDIR}/${n}`;
const capSha = (n) => createHash('sha256').update(capBytes[n]).digest('hex');
for (const [n, b] of Object.entries(capBytes)) put(capPath(n), b);

// ---------------- quotes (asserted present in the normalised capture)
const N = {
  v3: norm(capBytes['arxiv-v3.html']),
  v1: norm(capBytes['arxiv-v1.html']),
  html: norm(capBytes['arxiv-html-v3.html']),
  ant: norm(capBytes['anthropic-research-system.html']),
};
const need = (txt, hay, label) => {
  const n = norm(txt);
  if (!hay.includes(n)) { console.error(`QUOTE-NOT-IN-CAPTURE ${label}: ${JSON.stringify(txt)}`); process.exit(2); }
  const w = n.split(/\s+/).length;
  if (w > 25) { console.error(`QUOTE-OVER-25 ${label} words=${w}: ${JSON.stringify(txt)}`); process.exit(2); }
  return txt;
};
const Q196 = [
  need('We introduce MAST-Data, a comprehensive dataset of 1600+ annotated traces collected across 7 popular MAS frameworks.', N.v3, 'S196/1'),
  need('MAST-Data is the first multi-agent system dataset to outline the failure dynamics in MAS for guiding the development of better future systems.', N.v3, 'S196/2'),
  need('This process identifies 14 unique modes, clustered into 3 categories: (i) system design issues, (ii) inter-agent misalignment, and (iii) task verification.', N.v3, 'S196/3'),
];
const Q197 = [
  need('A multi-agent system consists of multiple agents (LLMs autonomously using tools in a loop) working together.', N.ant, 'S197/1'),
  need('In our data, agents typically use about 4× more tokens than chat interactions, and multi-agent systems use about 15× more tokens than chats.', N.ant, 'S197/2'),
  need('Currently, our lead agents execute subagents synchronously, waiting for each set of subagents to complete before proceeding.', N.ant, 'S197/3'),
];
// v1-only sentences (prove a v1 capture under a v3 claim)
const QV1 = [
  need('In this paper, we present the first comprehensive study of MAS challenges.', N.v1, 'v1/1'),
  need('We analyze five popular MAS frameworks across over 150 tasks, involving six expert human annotators.', N.v1, 'v1/2'),
  need('We identify 14 unique failure modes and propose a comprehensive taxonomy applicable to various MAS frameworks.', N.v1, 'v1/3'),
];
for (const q of QV1) if (N.v3.includes(norm(q))) { console.error(`V1 QUOTE ALSO IN V3: ${q}`); process.exit(2); }

// ---------------- entry
const entryText = (opts) => {
  const rows = opts.rows;
  const bullets = opts.bullets.map(([id, q]) => `- ${id} — "${q}"`).join('\n');
  return `source: S196 — ${rows[0].label}, ${rows[0].url}; S197 — ${rows[1].label}, ${rows[1].url}
verified-at: ${OPENED} (arXiv page served ${OPENED}; vendor post served ${OPENED})
recheck: node .ufo/waves/round-63/probe/topology63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>

# Multi-agent coordinator topologies

A coordinator topology is the shape a lead agent imposes on its subagents: how work is decomposed, how
subagents are spawned and awaited, and where their outputs re-enter the coordinator's context. This is the
first entry of the frontier band *multi-agent coordinator topology*.

## What the sources ground

${opts.body}

## Located quotes

${bullets}
`;
};

const mkRow = (id, label, url, kind, tier, scope, anchor, teaches, usedBy) =>
  `| ${id} | ${label} — ${url} | ${kind} | ${tier} | ${scope} | ${anchor} | ${teaches} | mined | ${OPENED} | 180d | ${usedBy} |`;

const HONEST_ROWS = [
  { id: 'S196', label: 'Why Do Multi-Agent LLM Systems Fail? (arXiv 2503.13657v3)', url: 'https://arxiv.org/abs/2503.13657v3', kind: 'paper', tier: 'A', cap: 'arxiv-v3.html',
    scope: 'the measured failure-and-scaling study of multi-agent LLM systems, version-pinned to arXiv v3; the coordinator-topology band measurement row',
    anchor: `§ Abstract, v3 page; fetched ${OPENED}, HTTP 200, ${capBytes['arxiv-v3.html'].length} bytes, sha256 ${capSha('arxiv-v3.html')}`,
    teaches: 'MAST-Data holds 1600+ annotated traces across 7 frameworks and MAST clusters 14 failure modes into 3 categories' },
  { id: 'S197', label: 'How we built our multi-agent research system — Anthropic Engineering', url: 'https://www.anthropic.com/engineering/multi-agent-research-system', kind: 'docs', tier: 'A', cap: 'anthropic-research-system.html',
    scope: "the vendor's own account of a lead-agent/subagent coordinator: spawn, synchronous fan-out, token economics",
    anchor: `§ Benefits of a multi-agent system + § Production reliability; fetched ${OPENED}, HTTP 200, ${capBytes['anthropic-research-system.html'].length} bytes, sha256 ${capSha('anthropic-research-system.html')}`,
    teaches: 'a lead agent decomposes a query and spawns subagents in parallel; the vendor reports about 15x the token use of chat' },
];

const HONEST_BODY = `- **The measured row is a failure taxonomy, not a scaling win.** The v3 abstract reports MAST-Data (1600+ annotated traces, 7 frameworks) and MAST (14 failure modes, 3 categories), and states that gains on popular benchmarks are often minimal (S196).
- **The vendor's row is the coordinator contract in practice.** A lead agent decomposes the query, spawns subagents for independent directions, and waits for each set synchronously before proceeding — the synchronous-fan-out shape, stated as a current limitation (S197).
- **Both rows are opened this round and version-pinned.** S196 is pinned to arXiv v3 (2503.13657v3) and S197 is the vendor's own published post; the entry claims nothing outside those two documents.`;

const entryHonest = entryText({
  rows: HONEST_ROWS,
  bullets: [...Q196.map((q) => ['S196', q]), ...Q197.map((q) => ['S197', q])],
  body: HONEST_BODY,
});

// ---------------- lane-file edits (registry / pins / README / PROVINCE / base readme repair)
const registryRows = (rows) => rows.map((r) => mkRow(r.id, r.label, r.url, r.kind, r.tier, r.scope, r.anchor, r.teaches, ENTRY)).join('\n');
const applyRows = (rows) => edit('corpus/SOURCES.md', (t) => t
  .split('\n').filter((l) => !/^\| S19[67] \|/.test(l)).join('\n')
  .replace(/^(\| S195 \|.*)$/m, `$1\n${registryRows(rows)}`));
const applyPins = (rows) => edit('.ufo/pins/source-captures.json', (t) => {
  const j = JSON.parse(t);
  j.captures = j.captures.filter((c) => !rows.some((r) => r.id === c.sourceId));
  for (const r of rows) {
    const b = readFileSync(join(D, capPath(r.cap)));
    j.captures.push({ sourceId: r.id, path: capPath(r.cap), sha256: createHash('sha256').update(b).digest('hex'), bytes: b.length, captured: OPENED });
  }
  return `${JSON.stringify(j, null, 1)}\n`;
});
const applyReadme = (desc) => {
  edit('corpus/README.md', (t) => t.replace(/^(\| `knowledge\/temporal-worker-versioning-pinning\.md` \|.*)$/m, `$1\n| \`knowledge/multi-agent-coordinator-topologies.md\` | ${desc} |`));
  edit('.ufo/pins/readme-map.json', (t) => { const j = JSON.parse(t); j.covered.push('knowledge/multi-agent-coordinator-topologies.md'); return `${JSON.stringify(j, null, 1)}\n`; });
};
const applyProvince = () => edit('PROVINCE.md', (t) => t.replace(/^(- Multi-agent coordinator topology.*)$/m, '$1').replace(/^(- Durable-execution and multi-agent failure research.*)$/m, '$1\n- Multi-agent coordinator topology — first entry `corpus/knowledge/multi-agent-coordinator-topologies.md` (round 63, S196/S197): the coordinator contract (vendor lead-agent/subagent account) and the measured failure study, version-pinned to arXiv v3.'));
const repairReadme62 = () => {
  edit('corpus/README.md', (t) => t.replace(/^(\| `lessons\/round-62\.md` \|.*)$/m, '$1\n| `lessons/round-62-verifier-spotcheck.md` | Round-62 non-author verification (fixture row, repairs the base DRIFT) | `corpus/lessons/round-62-verifier-spotcheck.md` |'));
  edit('.ufo/pins/readme-map.json', (t) => { const j = JSON.parse(t); j.covered.push('lessons/round-62-verifier-spotcheck.md'); return `${JSON.stringify(j, null, 1)}\n`; });
};

const honest = (() => {
  put(ENTRY, entryHonest);
  applyRows(HONEST_ROWS);
  applyPins(HONEST_ROWS);
  applyReadme('Multi-agent coordinator topology band, first entry (round 63): the vendor lead-agent/subagent coordinator account (S197) and the measured multi-agent failure study pinned to arXiv v3 (S196)');
  applyProvince();
  repairReadme62();
  return commit('honest');
})();

// ---------------- run the frozen counter
const run = (label) => {
  const r = sh(['node', PROBE, D, 'HEAD']);
  const line = (r.stdout || '').trim().split('\n').pop();
  return { label, exit: r.status, line };
};
const cases = [];
const variant = (label, mutate) => {
  reset(honest);
  mutate();
  const rev = commit(label);
  const out = run(label);
  cases.push({ ...out, rev });
  console.error(`${out.exit === 0 ? 'HELD ' : 'UNMET'} ${label} rev=${rev.slice(0, 8)} :: ${out.line}`);
};

// honest baseline
{
  reset(honest);
  const out = run('c-honest-c2');
  cases.push({ ...out, rev: honest });
  console.error(`${out.exit === 0 ? 'HELD ' : 'UNMET'} c-honest-c2 rev=${honest.slice(0, 8)} :: ${out.line}`);
}

// (a) real quotes, invented claims — no arm reads the body
variant('a-invented-claims', () => {
  edit(ENTRY, (t) => t.replace('## What the sources ground\n', `## What the sources ground

- **The vendor caps coordinator fan-out at nine subagents.** The vendor contract states a hard cap of nine subagents per session and a 99.99% coordinator availability SLA (S197).
- **Cost is flat in agent count.** A 2026 measurement across 64 agents reports 1.02x per-agent cost, so coordinator fan-out is effectively free beyond 8 agents (S196).
- **The taxonomy was validated on 12,400 traces.** MAST was validated on 12,400 traces with kappa 0.94 (S196).
`));
});

// (b) row URL pointed at a host whose content the attacker chooses (query-echo endpoint)
const BQS = [
  'The managed coordinator enforces a hard cap of nine subagents per session.',
  'It reports a 99.99% coordinator availability target.',
  'Fan-out above the cap is rejected at dispatch.',
];
const BQ = BQS.join(' ');
const BURL = `https://httpbin.org/anything?q=${encodeURIComponent(BQ)}`;
variant('b-attacker-hosted-copy', () => {
  const body = sh(['curl', '-fsSL', '--max-time', '90', '--retry', '2', '-A', 'Mozilla/5.0 (kumitate-topology63)', BURL]).stdout;
  put(capPath('attacker-echo.json'), Buffer.from(body, 'utf8'));
  const rows = [HONEST_ROWS[0], { ...HONEST_ROWS[1], label: 'How we built our multi-agent research system — Anthropic Engineering', url: BURL, kind: 'docs', tier: 'A', cap: 'attacker-echo.json',
    scope: "the vendor's own account of the lead-agent/subagent coordinator: the fan-out cap and availability target", anchor: `fetched ${OPENED}, HTTP 200, ${Buffer.byteLength(body)} bytes, sha256 ${createHash('sha256').update(body).digest('hex')}`,
    teaches: 'the coordinator enforces a hard cap of nine subagents per session and reports a 99.99% availability target' }];
  applyRows(rows);
  applyPins(rows);
  put(ENTRY, entryText({ rows, body: HONEST_BODY, bullets: [...Q196.map((q) => ['S196', q]), ...BQS.map((q) => ['S197', q])] }));
});

// (c) a quote that matches only through the normaliser (heading glued to the next block)
const C_BLOCK = 'Why Do Multi-Agent LLM Systems Fail? Authors: Mert Cemri';
const C_CITE = 'Comments: ArXiv v3 Subjects: Artificial Intelligence';
variant('c-normaliser-only-quote', () => {
  const rawArx = capBytes['arxiv-v3.html'].toString('utf8');
  if (rawArx.includes(C_BLOCK)) { console.error('C_BLOCK unexpectedly contiguous in raw'); process.exit(2); }
  if (rawArx.includes(C_CITE)) { console.error('C_CITE unexpectedly contiguous in raw'); process.exit(2); }
  if (!N.v3.includes(norm(C_BLOCK))) { console.error('C_BLOCK not contiguous after norm'); process.exit(2); }
  if (!N.v3.includes(norm(C_CITE))) { console.error('C_CITE not contiguous after norm'); process.exit(2); }
  edit(ENTRY, (t) => t
    .replace(`- S196 — "${Q196[0]}"`, `- S196 — "${C_BLOCK}"`)
    .replace(`- S196 — "${Q196[1]}"`, `- S196 — "${C_CITE}"`));
});

// (d) two rows, one document (arXiv abs v3 + arXiv HTML v3)
variant('d-duplicate-document', () => {
  const rows = [HONEST_ROWS[0], { ...HONEST_ROWS[1], label: 'MAST-Data trace appendix and taxonomy tables', url: 'https://arxiv.org/html/2503.13657v3', kind: 'paper', tier: 'A', cap: 'arxiv-html-v3.html',
    scope: 'the trace appendix and taxonomy tables of the failure study, opened as its own document',
    anchor: `§ Abstract in the HTML rendering; fetched ${OPENED}, HTTP 200, ${capBytes['arxiv-html-v3.html'].length} bytes, sha256 ${capSha('arxiv-html-v3.html')}`,
    teaches: 'the appendix tables list the failure modes and their trace counts' }];
  applyRows(rows);
  applyPins(rows);
  const q2 = [
    need('This gap highlights a critical need for a principled understanding of why MAS fail.', N.html, 'D/1'),
    need('MAST-Data is the first multi-agent system dataset to outline the failure dynamics in MAS for guiding the development of better future systems.', N.html, 'D/2'),
    need('To enable scalable annotation, we develop an LLM-as-a-Judge pipeline with high agreement with human annotations.', N.html, 'D/3'),
  ];
  put(ENTRY, entryText({ rows, body: HONEST_BODY, bullets: [...Q196.map((q) => ['S196', q]), ...q2.map((q) => ['S197', q])] }));
});

// (e) capture of v1 under a v3 claim, with matching pin
variant('e-wrong-version', () => {
  const rows = [{ ...HONEST_ROWS[0], url: 'https://arxiv.org/abs/2503.13657v1', cap: 'arxiv-v1.html',
      anchor: `§ Abstract, v1 page; fetched ${OPENED}, HTTP 200, ${capBytes['arxiv-v1.html'].length} bytes, sha256 ${capSha('arxiv-v1.html')}` }, HONEST_ROWS[1]];
  applyRows(rows);
  applyPins(rows);
  put(ENTRY, entryText({ rows, body: HONEST_BODY, bullets: [...QV1.map((q) => ['S196', q]), ...Q197.map((q) => ['S197', q])] }));
});

// (f) phantom second row: cited, one decorative bullet, entry really uses one row
variant('f-phantom-row', () => {
  const CHROME = 'AI will have a vast impact on the world. Anthropic is a public benefit corporation dedicated to securing its benefits and mitigating its risks.';
  const Q196X = [
    need('This gap highlights a critical need for a principled understanding of why MAS fail.', N.v3, 'F/1'),
    need('Addressing this question requires systematic identification and analysis of failure patterns.', N.v3, 'F/2'),
  ];
  if (!N.ant.includes(norm(CHROME))) { console.error('F chrome string not in capture'); process.exit(2); }
  put(ENTRY, entryText({ rows: HONEST_ROWS, body: `- **The measured row carries the whole entry.** The v3 abstract reports MAST-Data (1600+ annotated traces, 7 frameworks) and MAST (14 failure modes, 3 categories) (S196).
- **The taxonomy is the band's measurement.** Failure modes cluster into system design, inter-agent misalignment, and task verification (S196).
- **The band is framed as a public-benefit obligation.** The vendor closes its account on mission framing rather than on a performance number (S197).`,
    bullets: [...Q196.map((q) => ['S196', q]), ...Q196X.map((q) => ['S196', q]), ['S197', CHROME]] }));
});

const out = { rev: REV, honest, cases };
writeFileSync(join(S, 'results.json'), `${JSON.stringify(out, null, 1)}\n`);
writeFileSync(join(S, 'summary.txt'), cases.map((c) => `${c.exit === 0 ? 'HELD ' : 'UNMET'} ${c.label} exit=${c.exit} rev=${c.rev} :: ${c.line}`).join('\n') + `\nhonest=${honest}\nfixture-base=${REV}\n`);
process.stdout.write(`${cases.map((c) => `${c.exit === 0 ? 'HELD ' : 'UNMET'} ${c.label} exit=${c.exit} rev=${c.rev} :: ${c.line}`).join('\n')}\nhonest=${honest}\n`);
