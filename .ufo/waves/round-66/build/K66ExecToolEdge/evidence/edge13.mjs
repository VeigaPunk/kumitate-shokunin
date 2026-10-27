#!/usr/bin/env node
/* Harness 13: validate the corrected v2 candidate against the FROZEN counter.
 * Constraint: L2 requires the tool's `items=` to equal the counter's OWN item count, and L3
 * requires the counter's own re-verification to pass. So the candidate must (a) keep the counter
 * at 6/6 on a passing lane, and (b) never report MORE items than the counter's parser finds. */
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync, rmSync, copyFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const PROBE = join(LANE, '.ufo/waves/round-66/probe/ledger66-probe.mjs');
const V1 = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/tool-v1.mjs';
const V2 = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ExecToolEdge/routed-ledger-v2.candidate.mjs';
const ROOT = '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge/lanes13';

const v1 = await import(`file://${V1}`);
const v2 = await import(`file://${V2}`);
// the frozen counter's own parser, copied verbatim from the probe
function items66(text) {
  const lines = String(text).split('\n');
  let h = -1; let lvl = 0;
  for (let i = 0; i < lines.length && h < 0; i += 1) {
    const m = lines[i].match(/^(#+)\s+(.*)$/);
    if (m && m[1].length <= 6 && /\brouted\s+(defect|defects|item|items)\b/i.test(m[2])) { h = i; lvl = m[1].length; }
  }
  if (h < 0) return null;
  const sec = [];
  for (let i = h + 1; i < lines.length; i += 1) {
    const m = lines[i].match(/^(#+)\s/);
    if (m && m[1].length <= Math.min(lvl, 6)) break;
    sec.push(lines[i]);
  }
  const isSep = (l) => l.startsWith('|') && /-/.test(l) && /^[|\s:-]+$/.test(l.trim());
  const out = [];
  for (let i = 0; i < sec.length; i += 1) {
    const l = sec[i];
    const list = /^([-*+]|[0-9]+[.)])\s+\S/.test(l);
    const row = l.startsWith('|') && !isSep(l) && !(i + 1 < sec.length && isSep(sec[i + 1]));
    if (row) { out.push(l); continue; }
    if (!list) continue;
    let body = l;
    for (let j = i + 1; j < sec.length; j += 1) {
      const n = sec[j];
      if (/^([-*+]|[0-9]+[.)])\s+\S/.test(n) || (n.startsWith('|') && !isSep(n))) break;
      if (/^\S/.test(n) && sec[j - 1].trim() === '') break;
      body += `\n${n}`;
    }
    out.push(body);
  }
  return out;
}
const clsOf = (n, i) => (i === 0 ? 'class-recurrent' : `class-${((n + i) % 5) + 2}`);
const safeQuote = (it) => {
  const toks = v1.norm(it).split(' ').filter(Boolean);
  const run = [];
  for (const t of toks) {
    if (t.includes('|') || t.includes('"')) { if (run.length >= 5) break; run.length = 0; continue; }
    run.push(t); if (run.length === 5) break;
  }
  return run.join(' ');
};
function spotText(n, o = {}) {
  const L = [`# Round ${n} — non-author verification and spot-check`, '', '## 4. Verdicts', '', `- verdict bullet for round ${n}`, '',
    '## 5. Routed defects the lane must fix next round', ''];
  if (o.comment) { L.push('<!--', `- commented-out line in round ${n}`, '-->', ''); }
  if (o.fence) { L.push('```text', `- fenced example line in round ${n}`, '```', ''); }
  L.push(`- **D1 — the readme row is missing in round ${n}.**`, `  - nested note for round ${n}`,
    `1. **D2 — tier counts are wrong in round ${n}.**`, '', '| id | what |', '|---|---|', `| D3 | the capability row is absent in round ${n} |`, '',
    '## 7. Non-author statement', '', `- not routed in round ${n}`, '');
  let t = L.join('\n');
  if (o.crlf) t = t.replace(/\n/g, '\r\n');
  return t;
}
function buildLane(dir, toolPath, o = {}) {
  rmSync(dir, { recursive: true, force: true });
  for (const d of ['scripts', 'corpus/lessons', 'notes']) mkdirSync(join(dir, d), { recursive: true });
  copyFileSync(toolPath, join(dir, 'scripts', 'routed-ledger.mjs'));
  const rows = [];
  for (let n = 55; n <= 65; n += 1) {
    const txt = spotText(n, o);
    writeFileSync(join(dir, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`), txt);
    v1.routedItems(txt).items.forEach((it, i) => {
      const q = safeQuote(it);
      const last = n === 65;
      rows.push(`| R${n}-I${i + 1} | ${n} | ${i + 1} | "${q}" | ${clsOf(n, i)} | ${last ? 'closed' : 'open'} | ${last ? `\`notes/answers.md:${i + 1}\` — "the answer for round 65 item ${i + 1}"` : '-'} |`);
    });
  }
  writeFileSync(join(dir, 'notes', 'answers.md'), ['# answers', ...Array.from({ length: 12 }, (_, i) => `the answer for round 65 item ${i + 1}`)].join('\n'));
  writeFileSync(join(dir, 'corpus', 'routed-ledger.md'), ['# ledger', '', '## Ledger', '', '| id | round | item | quote | class | status | answer |', '|---|---|---|---|---|---|---|', ...rows, ''].join('\n'));
  writeFileSync(join(dir, 'SKILL.md'), '| capability | script |\n|---|---|\n| routed-ledger | scripts/routed-ledger.mjs |\n');
  writeFileSync(join(dir, 'corpus', 'QUALITY.md'), 'routed-ledger is checked by scripts/routed-ledger.mjs\n');
  writeFileSync(join(dir, 'SCORECARD.md'), '## Capabilities\n| capability | script |\n|---|---|\n| routed-ledger | scripts/routed-ledger.mjs |\n');
  const g = (...a) => spawnSync('git', ['-C', dir, ...a], { encoding: 'utf8' });
  g('init', '-q');
  const top = g('rev-parse', '--show-toplevel').stdout.trim();
  if (top !== dir) throw new Error(`toplevel mismatch ${top} != ${dir}`);
  g('add', '-A');
  if (g('-c', 'user.name=h', '-c', 'user.email=h@invalid', '-c', 'commit.gpgsign=false', 'commit', '-q', '--no-verify', '-m', 'fixture').status !== 0) throw new Error('commit failed');
  return g('rev-parse', 'HEAD').stdout.trim();
}

const out = [];
for (const [label, toolPath] of [['v1 (committed)', V1], ['v2 (candidate)', V2]]) {
  for (const [variant, o] of [['plain', {}], ['crlf-spotcheck', { crlf: true }], ['fence-in-section', { fence: true }], ['comment-in-section', { comment: true }]]) {
    const dir = join(ROOT, `${label.split(' ')[0]}-${variant}`);
    const rev = buildLane(dir, toolPath, o);
    const r = spawnSync('node', [PROBE, dir, rev], { encoding: 'utf8', env: { ...process.env, TMPDIR: '/fast/scratch/hyaku/kumitate-r66/K66ExecToolEdge' } });
    const t = spawnSync('node', [toolPath, '--root', dir, '--rev', rev, '--from', '55', '--to', '65'], { encoding: 'utf8' });
    out.push({
      tool: label, variant, counter_exit: r.status, counter: (r.stdout || '').trim(),
      tool_exit: t.status, tool: (t.stdout || '').trim().split('\n').pop(),
    });
  }
}

/* item-count parity: v2 must never report more items than the counter's own parser */
{
  const rows = [];
  for (let n = 34; n <= 65; n += 1) {
    const p = join(LANE, 'corpus', 'lessons', `round-${n}-verifier-spotcheck.md`);
    let txt; try { txt = readFileSync(p, 'utf8'); } catch { continue; }
    const c = items66(txt);
    const a = v1.routedItems(txt);
    const b = v2.routedItems(txt);
    rows.push({ n, counter: c === null ? null : c.length, v1: a.items.length, v2: b.items.length, v2_le_counter: c === null ? b.items.length <= 0 : b.items.length <= c.length });
  }
  const bad = rows.filter((r) => !r.v2_le_counter);
  out.push({ check: 'v2 items <= counter items on every real round 34..65', violations: bad, total_rounds: rows.length, changed: rows.filter((r) => r.v1 !== r.v2) });
}
console.log(JSON.stringify(out, null, 1));
