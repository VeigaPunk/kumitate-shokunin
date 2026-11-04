#!/usr/bin/env node
/**
 * emit-close-receipts.mjs — REHEARSAL HARNESS for kumitate round 87. NOT an integrated lane tool.
 *
 *   node emit-close-receipts.mjs --lane <dir> --rev <40-hex> --out <receipt-dir> --work <dir> [--only <file>]
 *
 * Writes one `*.txt` close receipt per case in the shape `kumitate-receipt-bind-v1` binds:
 *   rev=<40-hex>            the revision the instrument is read at
 *   tool_sha256=<64-hex>    sha256 of THE INSTRUMENT ITS OWN cmd= RUNS (second token of cmd=)
 *   cmd=<the command>       the command actually executed here
 *   <the command's own output>
 *   exit=<n>
 *   signal=none
 *
 * Every command is really run (cwd = --lane) and its real exit code and output are recorded; the
 * digest is taken from git at --rev for a lane-relative/lane-absolute instrument and from disk for
 * an absolute instrument outside the lane (the `census` case). A red body is recorded red: the
 * binding gate reads the cmd=/tool_sha256= pair, never the exit code.
 *
 * Purpose: rehearse the round-87 close directory in a scratch clone so the frozen probe's arms
 * 4-11 (which read `<lane>/.ufo/waves/round-87/close`) can be exercised before the L1 emits the
 * real one. `--only c1-probe` writes just that receipt from a captured probe transcript.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve, sep } from 'node:path';

const opt = (name, dflt) => {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : dflt;
};
const lane = resolve(opt('--lane', '.'));
const rev = opt('--rev', '');
const outDir = resolve(opt('--out', ''));
const work = resolve(opt('--work', ''));
const only = opt('--only', '');
const FLEET = '/home/vgpnk/Projects/shokunin';

if (!/^[a-f0-9]{40}$/.test(rev)) { console.error('emit-close-receipts: --rev must be 40 hex'); process.exit(64); }
if (!outDir || !work) { console.error('emit-close-receipts: --out and --work are required'); process.exit(64); }
mkdirSync(outDir, { recursive: true });
mkdirSync(work, { recursive: true });

const sha = (b) => createHash('sha256').update(b).digest('hex');
const gitEnv = () => {
  const e = { ...process.env, TMPDIR: work };
  for (const k of ['GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_COMMON_DIR', 'GIT_NAMESPACE', 'GIT_PREFIX', 'GIT_CEILING_DIRECTORIES']) delete e[k];
  return e;
};
const laneRel = (abs) => {
  const rel = relative(lane, abs);
  if (rel === '') return null;
  if (rel === '..' || rel.startsWith(`..${sep}`) || isAbsolute(rel)) return null;
  return rel;
};
function digestOf(instrument) {
  const abs = isAbsolute(instrument) ? resolve(instrument) : resolve(lane, instrument);
  const rel = laneRel(abs);
  if (rel === null) return { digest: sha(readFileSync(abs)), source: 'disk' };
  const r = spawnSync('git', ['-C', lane, 'cat-file', 'blob', `${rev}:${rel}`], { maxBuffer: 64 << 20, env: gitEnv() });
  if (r.status !== 0) throw new Error(`instrument absent at ${rev}: ${rel}`);
  return { digest: sha(r.stdout), source: 'git' };
}

const policy = join(FLEET, 'scripts', 'hyaku', 'ufo-wave-policy.json');
const cases = [
  ['bind.txt', ['node', 'scripts/receipt-bind.mjs', '--selftest', '--work', join(work, 'bind-selftest')]],
  ['map-selftest.txt', ['node', 'scripts/readme-map.mjs', '--selftest']],
  ['map.txt', ['node', 'scripts/readme-map.mjs']],
  ['plan.txt', ['bash', 'scripts/plan-before-ready.sh', '--round', '87', '--rev', rev]],
  ['proxy-selftest.txt', ['node', 'scripts/proxy-check.mjs', '--selftest']],
  ['proxy.txt', ['node', 'scripts/proxy-check.mjs', '--strict']],
  ['ready.txt', ['node', 'scripts/ready-handoff.mjs', '--round', '87', '--wave', 'w1', '--policy', policy]],
  ['selftest.txt', ['node', 'scripts/counter-receipt.mjs', '--selftest', '--work', join(work, 'counter-selftest')]],
  ['spotcheck.txt', ['node', 'scripts/spotcheck-adopt.mjs', '--check']],
  ['census.txt', ['bash', join(FLEET, 'scripts', 'sources-census.sh'), 'validate', '--root', FLEET, 'kumitate']],
  ['c1-probe.txt', ['node', '.ufo/waves/round-87/probe/probe87-c1.mjs', '--lane', lane, '--work', join(work, 'probe'), '--rev', rev]],
];

for (const [file, argv] of cases) {
  if (only && file !== only) continue;
  const cmdline = argv.join(' ');
  const instrument = argv[1];
  const { digest, source } = digestOf(instrument);
  const r = spawnSync(argv[0], argv.slice(1), {
    cwd: lane, encoding: 'utf8', env: gitEnv(), timeout: 600000, maxBuffer: 64 << 20,
  });
  const body = `${r.stdout || ''}${r.stderr || ''}`;
  const text = `rev=${rev}\ntool_sha256=${digest}\ncmd=${cmdline}\n${body}exit=${r.status === null ? 127 : r.status}\nsignal=none\n`;
  writeFileSync(join(outDir, file), text);
  console.log(`EMIT ${file} instrument=${instrument} source=${source} exit=${r.status}`);
}
