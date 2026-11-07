#!/usr/bin/env node
/**
 * mutate.mjs — build mutated copies of the real kumitate corpus in scratch and
 * measure the lane gate (BASE / control or candidate) against the fleet census.
 *
 *   node mutate.mjs --lane <lane> --scratch <dir> --base <sources-check.mjs>
 *                    --tools <name>=<path>[,<name>=<path>...] [--census <path>]
 *
 * Each case replaces one exact heading line in corpus/SOURCES.md (bytes given as
 * JS escapes) and prints a JSON row: tool verdict/exit/rows/outside/sectionMissing
 * plus census E12 ids/count and census rows.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const LANE = resolve(opt('--lane', '/home/vgpnk/Projects/shokunin/kumitate-shokunin'));
const SCRATCH = resolve(opt('--scratch', '/fast/scratch/hyaku/kumitate-r97/K97CriticB/mutate'));
const BASE = resolve(opt('--base', join(LANE, 'scripts', 'sources-check.mjs')));
const CENSUS = resolve(opt('--census', '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'));
const TODAY = opt('--today', '2026-11-07');
const TOOLS = (opt('--tools', '') || '').split(',').filter(Boolean).map((s) => {
  const i = s.indexOf('=');
  return { name: s.slice(0, i), path: resolve(s.slice(i + 1)) };
});
const SRC = join(LANE, 'corpus', 'SOURCES.md');
const sourceText = readFileSync(SRC, 'utf8');

const cases = [
  // [id, search string (must occur exactly once), replacement]
  ['unmutated', null, null],
  ['registry-cr', '## Registry\n', '## Registry\r\n'],
  ['registry-tab', '## Registry\n', '##\tRegistry\n'],
  ['registry-2sp', '## Registry\n', '##  Registry\n'],
  ['registry-vt', '## Registry\n', '## Registry\v\n'],
  ['registry-nbsp', '## Registry\n', '## Registry\u00a0\n'],
  ['paths-cr', '## Paths\n', '## Paths\r\n'],
  ['paths-tab', '## Paths\n', '##\tPaths\n'],
  ['paths-2sp', '## Paths\n', '##  Paths\n'],
  ['paths-vt', '## Paths\n', '## Paths\v\n'],
  ['paths-nbsp', '## Paths\n', '## Paths\u00a0\n'],
  ['paths-closeseq', '## Paths\n', '## Paths ##\n'],
  ['h1-bare-inside', '## Registry\n', '## Registry\n#\n'],
  ['h1-vt-inside', '## Registry\n', '## Registry\n#\vIntro\n'],
  ['all-crlf', null, 'ALL_CRLF'],
  ['registry-indent1', '## Registry\n', ' ## Registry\n'],
  ['registry-indent4', '## Registry\n', '    ## Registry\n'],
  ['registry-tabindent', '## Registry\n', '\t## Registry\n'],
];

function run(cmd, argv, opts = {}) {
  try {
    const stdout = execFileSync(cmd, argv, { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'], ...opts });
    return { status: 0, stdout };
  } catch (e) {
    return { status: e.status ?? -1, stdout: e.stdout ? e.stdout.toString() : '', stderr: e.stderr ? e.stderr.toString() : '' };
  }
}

rmSync(SCRATCH, { recursive: true, force: true });
mkdirSync(SCRATCH, { recursive: true });

for (const [id, search, replacement] of cases) {
  const dir = join(SCRATCH, id);
  mkdirSync(dir, { recursive: true });
  // mirror the lane root by symlink (so used-by paths resolve) except corpus, which we copy and mutate
  for (const entry of readdirSync(LANE)) {
    if (entry === 'corpus') continue;
    symlinkSync(join(LANE, entry), join(dir, entry));
  }
  cpSync(join(LANE, 'corpus'), join(dir, 'corpus'), { recursive: true });
  let text = sourceText;
  if (replacement === 'ALL_CRLF') text = text.replace(/\n/g, '\r\n');
  else if (search !== null) {
    const count = text.split(search).length - 1;
    if (count !== 1) { console.log(JSON.stringify({ case: id, error: `anchor count=${count}` })); continue; }
    text = text.replace(search, replacement);
  }
  writeFileSync(join(dir, 'corpus', 'SOURCES.md'), text);
  const row = { case: id, corpus: dir };
  // census evaluate (live)
  const cval = run(CENSUS, ['validate', '--file', join(dir, 'corpus', 'SOURCES.md'), '--today', TODAY]);
  const e12 = cval.stdout.split('\n').map((l) => l.split('\t')).filter((p) => p[1] === 'E12').map((p) => p[2].split(' ')[0]);
  const ccensus = run(CENSUS, ['census', '--file', join(dir, 'corpus', 'SOURCES.md'), '--today', TODAY]);
  const rm = /^file\trows\t(\d+)$/m.exec(ccensus.stdout);
  row.census = { e12: e12.length, rows: rm ? Number(rm[1]) : null, exit: cval.status };
  for (const t of [{ name: 'base', path: BASE }, ...TOOLS]) {
    if (!t.path) continue;
    const r = run(process.execPath, [t.path, '--self', dir, '--json', '--today', TODAY]);
    let j = null;
    try { j = JSON.parse(r.stdout); } catch { /* ignore */ }
    const outside = j ? j.findings.filter((f) => f.kind === 'ROW_OUTSIDE_REGISTRY').map((f) => f.detail.match(/id=(\S+)/)?.[1] ?? f.line) : null;
    const sectionMissing = j ? j.findings.filter((f) => f.kind === 'SECTION_MISSING').map((f) => f.detail) : null;
    row[t.name] = {
      exit: r.status,
      verdict: j ? `${j.verdict}(exitCode=${j.exitCode})` : `NO-JSON ${r.stderr.slice(0, 200)}`,
      rows: j ? j.counts?.rows ?? null : null,
      outside: outside ? outside.length : null,
      outsideIds: outside ? (outside.length > 3 ? `${outside.slice(0, 3).join(',')}…` : outside.join(',')) : null,
      sectionMissing: sectionMissing ?? null,
    };
  }
  console.log(JSON.stringify(row));
}
