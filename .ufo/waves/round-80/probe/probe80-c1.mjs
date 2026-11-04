#!/usr/bin/env node
/**
 * probe80-c1.mjs — frozen counter C1 for kumitate round 80.
 *
 * Usage:
 *   node .ufo/waves/round-80/probe/probe80-c1.mjs [--set c1] [--tool DIR] [--work DIR] [--keep-work]
 *
 * C1 — operability: `spotcheck-adopt` v3 reads the spotcheck set and the README map as two
 * readings, and `--adopt` validates its own delta instead of demanding a globally clean map.
 * Frozen predicate and arms: `.ufo/waves/round-80/plan.md` §C1.
 *
 * Every fixture lives under --work (mkdtemp under $TMPDIR); the lane is read-only except arm 13,
 * which reads the lane's own `--check` (no writes). Exit 0 iff every arm passes; 1 otherwise; 64 usage.
 */
import { spawnSync } from 'node:child_process';
import {
  copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SELF = fileURLToPath(import.meta.url);
const DEFAULT_LANE = resolve(dirname(SELF), '..', '..', '..', '..');
const TARGET = 'corpus/lessons/round-75-verifier-spotcheck.md';
const KEY = TARGET.slice('corpus/'.length);

function parseArgs(argv) {
  const o = { set: 'c1', tool: null, lane: DEFAULT_LANE, work: null, keep: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--set') o.set = argv[++i];
    else if (a === '--tool') o.tool = resolve(argv[++i]);
    else if (a === '--lane') o.lane = resolve(argv[++i]);
    else if (a === '--work') o.work = resolve(argv[++i]);
    else if (a === '--keep-work') o.keep = true;
    else if (a === '--help') { o.help = true; return o; }
    else return { error: `unknown argument ${a}` };
  }
  if (o.set !== 'c1') return { error: `unknown set ${o.set}` };
  o.tool = o.tool ?? o.lane;
  return o;
}

const read = (p) => { try { return readFileSync(p, 'utf8'); } catch { return null; } };
const sha = (p) => { try { return readFileSync(p); } catch { return null; } };

function run(work, tool, lane, args) {
  const r = spawnSync(process.execPath, [join(tool, 'scripts/spotcheck-adopt.mjs'), '--lane', lane, ...args], {
    encoding: 'utf8', timeout: 600000, maxBuffer: 16 * 1024 * 1024, env: { ...process.env, TMPDIR: work },
  });
  return { code: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

/* ------------------------------------------------------------------ fixtures */

/**
 * A minimal lane-shaped fixture: the readme-map oracle, a corpus root, a README whose rows are
 * given verbatim, and a pin set. `files` are corpus-relative file names (created empty).
 */
function fixture(work, tool, name, { rows = [], covered = [], files = [], spotcheck = true }) {
  const dir = join(work, name);
  for (const child of ['scripts', 'corpus/knowledge', 'corpus/lessons', '.ufo/pins']) {
    mkdirSync(join(dir, child), { recursive: true });
  }
  copyFileSync(join(tool, 'scripts/readme-map.mjs'), join(dir, 'scripts/readme-map.mjs'));
  // A baseline knowledge file keeps every fixture inside the oracle's nonempty contract.
  writeFileSync(join(dir, 'corpus/knowledge/base.md'), '# Base\n');
  if (spotcheck) writeFileSync(join(dir, TARGET), '# Spotcheck\n');
  for (const f of files) writeFileSync(join(dir, f), '# File\n');
  const allRows = ['| `knowledge/base.md` | Base | fixture |', ...rows];
  writeFileSync(join(dir, 'corpus/README.md'), `# Corpus\n\n## Coverage map\n\n${allRows.join('\n')}\n\n## Known gaps\n\n- none\n`);
  writeFileSync(join(dir, '.ufo/pins/readme-map.json'),
    `${JSON.stringify({ version: 2, covered: ['knowledge/base.md', ...covered] }, null, 2)}\n`);
  return dir;
}

const coveredSpotcheck = {
  rows: [`| \`${KEY}\` | Spotcheck | fixture |`], covered: [KEY],
};

function oracleLine(tool, dir) {
  const r = spawnSync(process.execPath, [join(tool, 'scripts/readme-map.mjs'),
    '--registry', join(dir, '.ufo/pins/readme-map.json'), '--readme', join(dir, 'corpus/README.md'),
    '--corpus', join(dir, 'corpus/knowledge'), '--corpus', join(dir, 'corpus/lessons')], { encoding: 'utf8' });
  return (r.stdout || '').trim();
}

const lines = (out) => out.split('\n').map((l) => l.trim()).filter(Boolean);
const has = (out, re) => re.test(out);
const exitIs = (r, code) => r.code === code;

/* ---------------------------------------------------------------------- arms */

function arms(work, tool, lane) {
  const list = [];
  const add = (name, fn) => list.push({ name, fn });

  add('coverage-clean', () => {
    const d = fixture(work, tool, 'a1', coveredSpotcheck);
    const r = run(work, tool, d, ['--check']);
    return {
      ok: exitIs(r, 0)
        && lines(r.out).includes('SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0')
        && lines(r.out).includes('MAP: CLEAN'),
      detail: `exit=${r.code} out=${JSON.stringify(r.out)}`,
    };
  });

  add('coverage-uncovered', () => {
    const d = fixture(work, tool, 'a2', { spotcheck: true });
    const r = run(work, tool, d, ['--check']);
    return {
      ok: exitIs(r, 1)
        && lines(r.out).includes(`SPOTCHECK_COVERAGE: DRIFT spotchecks=1 uncovered=1 first=${TARGET}`)
        && lines(r.out).some((l) => l.startsWith('MAP: DRIFT first=')),
      detail: `exit=${r.code} out=${JSON.stringify(r.out)}`,
    };
  });

  // Discriminating: green spotcheck set, map red for a non-spotcheck uncovered file.
  add('map-only-drift-green-coverage', () => {
    const d = fixture(work, tool, 'a3', { ...coveredSpotcheck, files: ['corpus/knowledge/late.md'] });
    const r = run(work, tool, d, ['--check']);
    return {
      ok: exitIs(r, 0)
        && lines(r.out).includes('SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0')
        && lines(r.out).includes('MAP: DRIFT first=uncovered:knowledge/late.md'),
      detail: `exit=${r.code} out=${JSON.stringify(r.out)}`,
    };
  });

  add('map-orphan-row-green-coverage', () => {
    const d = fixture(work, tool, 'a4', {
      ...coveredSpotcheck, rows: [...coveredSpotcheck.rows, '| `knowledge/ghost.md` | Ghost | fixture |'],
    });
    const r = run(work, tool, d, ['--check']);
    return {
      ok: exitIs(r, 0)
        && lines(r.out).includes('SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0')
        && lines(r.out).includes('MAP: DRIFT first=orphan-row:knowledge/ghost.md'),
      detail: `exit=${r.code} out=${JSON.stringify(r.out)}`,
    };
  });

  add('both-drift', () => {
    const d = fixture(work, tool, 'a5', {
      spotcheck: true, rows: ['| `knowledge/ghost.md` | Ghost | fixture |'],
    });
    const r = run(work, tool, d, ['--check']);
    return {
      ok: exitIs(r, 1)
        && lines(r.out).includes(`SPOTCHECK_COVERAGE: DRIFT spotchecks=1 uncovered=1 first=${TARGET}`)
        && lines(r.out).some((l) => l.startsWith('MAP: DRIFT first=')),
      detail: `exit=${r.code} out=${JSON.stringify(r.out)}`,
    };
  });

  add('oracle-refusal-preserved', () => {
    const d = fixture(work, tool, 'a6', coveredSpotcheck);
    writeFileSync(join(d, 'corpus/README.md'), '# Corpus\n| lessons/not-a-row | broken |\n');
    const r = run(work, tool, d, ['--check']);
    return {
      ok: exitIs(r, 2) && r.out === 'REFUSED_ORACLE',
      detail: `exit=${r.code} out=${JSON.stringify(r.out)}`,
    };
  });

  add('usage-64', () => {
    const d = fixture(work, tool, 'a7', coveredSpotcheck);
    const r = run(work, tool, d, ['--bogus']);
    return { ok: exitIs(r, 64) && r.out === 'SPOTCHECK_ADOPT: USAGE', detail: `exit=${r.code} out=${JSON.stringify(r.out)}` };
  });

  // Adopt must not be blocked by an unrelated red map; it validates its own delta.
  add('adopt-on-red-map', () => {
    const d = fixture(work, tool, 'a8', { spotcheck: true });
    writeFileSync(join(d, 'corpus/knowledge/late.md'), '# Late\n');
    const before = read(join(d, 'corpus/README.md'));
    const r = run(work, tool, d, ['--adopt', TARGET]);
    const raw = read(join(d, 'corpus/README.md')) || '';
    const pin = JSON.parse(read(join(d, '.ufo/pins/readme-map.json')) || '{"covered":[]}');
    return {
      ok: exitIs(r, 0)
        && lines(r.out)[0] === `SPOTCHECK_ADOPT: ADOPTED ${TARGET} wrote=both`
        && lines(r.out).some((l) => l === 'README_MAP: DRIFT' || l.startsWith('README_MAP: DRIFT '))
        && lines(r.out).some((l) => l.includes('first=uncovered:knowledge/late.md'))
        && raw.includes(`| \`${KEY}\` |`)
        && pin.covered.includes(KEY),
      detail: `exit=${r.code} out=${JSON.stringify(r.out)}`,
    };
  });

  add('adopt-duplicate-refused', () => {
    const d = fixture(work, tool, 'a9', { spotcheck: true, rows: [
      `| \`${KEY}\` | Spotcheck | fixture |`, `| \`${KEY}\` | Spotcheck again | fixture |`,
    ] });
    const before = sha(join(d, 'corpus/README.md'))?.toString('base64');
    const r = run(work, tool, d, ['--adopt', TARGET]);
    const after = sha(join(d, 'corpus/README.md'))?.toString('base64');
    return { ok: exitIs(r, 2) && r.out === 'REFUSED_ORACLE' && before === after, detail: `exit=${r.code} out=${JSON.stringify(r.out)} unchanged=${before === after}` };
  });

  add('adopt-idempotent', () => {
    const d = fixture(work, tool, 'a10', { spotcheck: true });
    if (run(work, tool, d, ['--adopt', TARGET]).code !== 0) return { ok: false, detail: 'first adopt failed' };
    const before = `${sha(join(d, 'corpus/README.md'))?.toString('base64')}:${sha(join(d, '.ufo/pins/readme-map.json'))?.toString('base64')}`;
    const r = run(work, tool, d, ['--adopt', TARGET]);
    const after = `${sha(join(d, 'corpus/README.md'))?.toString('base64')}:${sha(join(d, '.ufo/pins/readme-map.json'))?.toString('base64')}`;
    return {
      ok: exitIs(r, 0) && r.out === `SPOTCHECK_ADOPT: ALREADY_ADOPTED ${TARGET}` && before === after,
      detail: `exit=${r.code} out=${JSON.stringify(r.out)} unchanged=${before === after}`,
    };
  });

  add('rollback-clean', () => {
    const d = fixture(work, tool, 'a11', { spotcheck: true });
    const journal = join(d, '.ufo/pins/adopt-journal', 'manual');
    mkdirSync(journal, { recursive: true });
    writeFileSync(join(journal, 'manifest.json'), JSON.stringify({
      contract: 'kumitate-adopt-journal-v1', lane: d, target: TARGET, key: KEY,
      pre: [
        { path: 'corpus/README.md', file: 'README.pre', sha256: 'deadbeef' },
        { path: '.ufo/pins/readme-map.json', file: 'readme-map.pre', sha256: 'deadbeef' },
      ],
    }));
    writeFileSync(join(journal, 'README.pre'), 'corrupt');
    writeFileSync(join(journal, 'readme-map.pre'), 'corrupt');
    const before = `${sha(join(d, 'corpus/README.md'))?.toString('base64')}:${sha(join(d, '.ufo/pins/readme-map.json'))?.toString('base64')}`;
    const r = run(work, tool, d, ['--check']);
    const after = `${sha(join(d, 'corpus/README.md'))?.toString('base64')}:${sha(join(d, '.ufo/pins/readme-map.json'))?.toString('base64')}`;
    return { ok: exitIs(r, 2) && r.out === 'REFUSED_ORACLE' && before === after, detail: `exit=${r.code} out=${JSON.stringify(r.out)} unchanged=${before === after}` };
  });

  add('selftest', () => {
    const r = spawnSync(process.execPath, [join(tool, 'scripts/spotcheck-adopt.mjs'), '--selftest'], {
      encoding: 'utf8', timeout: 900000, maxBuffer: 16 * 1024 * 1024, env: { ...process.env, TMPDIR: work },
    });
    const m = /SPOTCHECK_ADOPT_SELFTEST: PASS \((\d+)\/(\d+)\)/.exec(r.stdout || '');
    return { ok: r.status === 0 && !!m && Number(m[1]) === Number(m[2]) && Number(m[2]) >= 26, detail: `exit=${r.status} tail=${JSON.stringify(lines(r.stdout || '').slice(-2))}` };
  });

  add('live-lane-clean', () => {
    const r = run(work, tool, lane, ['--check']);
    return {
      ok: exitIs(r, 0)
        && lines(r.out).some((l) => /^SPOTCHECK_COVERAGE: CLEAN spotchecks=\d+ uncovered=0$/.test(l)),
      detail: `exit=${r.code} out=${JSON.stringify(r.out.split('\n').slice(-2))}`,
    };
  });

  return list;
}

/* ---------------------------------------------------------------------- main */

function main(argv) {
  const o = parseArgs(argv);
  if (o.error) { console.log(`probe80-c1: ${o.error}`); return 64; }
  if (o.help) { console.log('usage: node probe80-c1.mjs [--set c1] [--tool DIR] [--lane DIR] [--work DIR] [--keep-work]'); return 0; }
  const work = o.work ?? mkdtempSync(join(process.env.TMPDIR || tmpdir(), 'probe80-c1-'));
  mkdirSync(work, { recursive: true });
  let passed = 0;
  const all = arms(work, o.tool, o.lane);
  try {
    all.forEach((arm, i) => {
      let r;
      try { r = arm.fn(); } catch (e) { r = { ok: false, detail: `threw ${e && e.message}` }; }
      if (r.ok) passed++;
      console.log(`C80_C1 arm ${String(i + 1).padStart(2, '0')} ${arm.name}: ${r.ok ? 'PASS' : 'FAIL'} ${r.detail}`);
    });
  } finally {
    if (!o.keep) rmSync(work, { recursive: true, force: true });
  }
  console.log(`C80_C1: HELD held=${passed}/${all.length}`);
  return passed === all.length ? 0 : 1;
}

process.exitCode = main(process.argv.slice(2));
