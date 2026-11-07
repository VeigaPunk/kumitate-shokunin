#!/usr/bin/env node
/**
 * harm.mjs — BASE vs reference/candidate `--json` on the real lane and sibling lanes.
 *   node harm.mjs --base <sources-check.mjs> --tools name=path[,..] --selfs lane1,lane2,... [--today D]
 * Prints one JSON line per (self, tool) and a diff summary line per (self, tool-vs-base).
 */
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const BASE = resolve(opt('--base', '/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/sources-check.mjs'));
const TODAY = opt('--today', '2026-11-07');
const TOOLS = (opt('--tools', '') || '').split(',').filter(Boolean).map((s) => {
  const i = s.indexOf('=');
  return { name: s.slice(0, i), path: resolve(s.slice(i + 1)) };
});
const SELFS = (opt('--selfs', '') || '').split(',').filter(Boolean).map((s) => resolve(s));

function run(tool, self) {
  try {
    const stdout = execFileSync(process.execPath, [tool, '--self', self, '--json', '--today', TODAY], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
    return { exit: 0, stdout };
  } catch (e) {
    return { exit: e.status ?? -1, stdout: e.stdout ? e.stdout.toString() : '', stderr: e.stderr ? e.stderr.toString() : '' };
  }
}
const byKind = (j) => {
  const m = {};
  for (const f of j?.findings ?? []) m[f.kind] = (m[f.kind] ?? 0) + 1;
  return m;
};
const canon = (s) => {
  try { return JSON.stringify(JSON.parse(s)); } catch { return s; }
};

for (const self of SELFS) {
  const b = run(BASE, self);
  let bj = null;
  try { bj = JSON.parse(b.stdout); } catch { /* ignore */ }
  console.log(JSON.stringify({ self, tool: 'base', exit: b.exit, verdict: bj?.verdict ?? null, rows: bj?.counts?.rows ?? null, findings: byKind(bj), findingsN: bj?.findings?.length ?? null }));
  for (const t of TOOLS) {
    if (!t.path) continue;
    const r = run(t.path, self);
    let rj = null;
    try { rj = JSON.parse(r.stdout); } catch { /* ignore */ }
    console.log(JSON.stringify({
      self, tool: t.name, exit: r.exit, verdict: rj?.verdict ?? null, rows: rj?.counts?.rows ?? null,
      findings: byKind(rj), findingsN: rj?.findings?.length ?? null,
      jsonEqualBase: canon(r.stdout) === canon(b.stdout), exitEqualBase: r.exit === b.exit,
    }));
  }
}
