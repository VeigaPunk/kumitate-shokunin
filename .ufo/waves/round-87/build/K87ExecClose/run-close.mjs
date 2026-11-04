#!/usr/bin/env node
/**
 * run-close.mjs — kumitate round 87 close runner, v2 (routed defect R86-D1 repair).
 *
 *   node run-close.mjs --lane <DIR> --rev <40-hex> --out <DIR> [--work <DIR>]
 *
 * WHY v2. Round 86's runner (`.ufo/waves/round-86/run-close.mjs:20`) hashed
 * `scripts/counter-receipt.mjs` for EVERY case, so nine of its ten committed close
 * receipts named an instrument they did not measure and no gate in this lane could see
 * it (R86-D1, detected by the non-author spot-check). v2 derives the subject per case:
 * the instrument is the SECOND whitespace token of the case's own command line, and
 * `tool_sha256=` is the sha256 of those bytes read from the worktree immediately before
 * the case runs. That digest is a claim about the bytes the case actually executed;
 * `scripts/receipt-bind.mjs --dir <out> --rev <rev>` re-derives it from the judged
 * revision, so a receipt whose subject drifted reads DRIFT instead of silence.
 *
 * Each case writes `<out>/<case>.txt` with the round-86 receipt shape:
 *   rev=<40-hex>
 *   tool_sha256=<sha256 of the case's own instrument>
 *   cmd=<command line as executed>
 *   <stdout+stderr>
 *   exit=<status>
 *   signal=<signal|none>
 *
 * Cases (round-86 set, round number advanced to 87, plus `bind`/`bind-selftest`):
 * selftest, proxy, proxy-selftest, map, map-selftest, spotcheck, ready, plan, census,
 * bind-selftest, bind, c1-probe. `bind` runs after the ten measurement receipts exist and
 * scores `<out>` itself; `c1-probe` runs last so the frozen scorer sees this round's own
 * receipts (its arm 4 requires >= 8 of them in `<lane>/.ufo/waves/round-87/close`).
 *
 * Refusals (exit 3, nothing written — no directory is created, no receipt emitted):
 * OUT_EXISTS (--out already exists), REV_NOT_FULL (--rev is not 40 lowercase hex),
 * LANE_UNREADABLE, INSTRUMENT_UNREADABLE (a case names an instrument the worktree lacks).
 * Missing arguments are a usage error (exit 64).
 *
 * Exit map: 0 the emitted receipts bind CLEAN at --rev; 1 DRIFT/fail-closed at bind;
 * 3 refused; 64 usage.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve, isAbsolute, dirname } from 'node:path';

const USAGE = 'USAGE: node run-close.mjs --lane <DIR> --rev <40-hex> --out <DIR> [--work <DIR>]';
const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : undefined;
};
const usage = (detail) => {
  console.log(`RUN_CLOSE: USAGE ${detail}`);
  console.log(USAGE);
  process.exit(64);
};
const refuse = (token, detail) => {
  console.log(`RUN_CLOSE: REFUSED ${token}${detail ? ' ' + detail : ''}`);
  process.exit(3);
};

const laneArg = opt('--lane');
const rev = opt('--rev');
const outArg = opt('--out');
if (!laneArg || !rev || !outArg) usage('--lane, --rev and --out are required');

const lane = resolve(laneArg);
const out = resolve(outArg);
const scratch = process.env.HYAKU_SCRATCH || '/fast/scratch/hyaku';
const work = resolve(opt('--work') || join(scratch, 'kumitate-r87', 'close-work'));

if (!/^[a-f0-9]{40}$/.test(rev)) refuse('REV_NOT_FULL', rev);
if (existsSync(out)) refuse('OUT_EXISTS', out);
if (!existsSync(lane) || !statSync(lane).isDirectory()) refuse('LANE_UNREADABLE', lane);

// The instrument a receipt names is the second whitespace token of its own command line,
// hashed from the worktree (a lane-internal path resolves beneath --lane; an absolute
// path outside the lane is an external tool and is hashed from disk).
function instrumentBytes(tok) {
  let p;
  if (isAbsolute(tok)) {
    if (tok === lane || tok.startsWith(lane + '/')) p = tok;
    else return existsSync(tok) ? readFileSync(tok) : null;
  } else {
    p = join(lane, tok.replace(/^\.\//, ''));
  }
  try {
    return readFileSync(p);
  } catch {
    return null;
  }
}
const sha = (b) => createHash('sha256').update(b).digest('hex');

const cases = [
  ['selftest', 'node', ['scripts/counter-receipt.mjs', '--selftest', '--work', work]],
  ['proxy', 'node', ['scripts/proxy-check.mjs', '--strict']],
  ['proxy-selftest', 'node', ['scripts/proxy-check.mjs', '--selftest']],
  ['map', 'node', ['scripts/readme-map.mjs']],
  ['map-selftest', 'node', ['scripts/readme-map.mjs', '--selftest']],
  ['spotcheck', 'node', ['scripts/spotcheck-adopt.mjs', '--check']],
  ['ready', 'node', ['scripts/ready-handoff.mjs', '--round', '87', '--wave', 'w1',
    '--policy', '/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json']],
  ['plan', 'bash', ['scripts/plan-before-ready.sh', '--round', '87', '--rev', rev]],
  ['census', 'bash', ['/home/vgpnk/Projects/shokunin/scripts/sources-census.sh', 'validate',
    '--root', '/home/vgpnk/Projects/shokunin', 'kumitate']],
  ['bind-selftest', 'node', ['scripts/receipt-bind.mjs', '--selftest', '--work', work]],
  ['bind', 'node', ['scripts/receipt-bind.mjs', '--dir', out, '--rev', rev]],
  ['c1-probe', 'node', [join(lane, '.ufo', 'waves', 'round-87', 'probe', 'probe87-c1.mjs'),
    '--lane', lane, '--work', work, '--rev', rev]],
];

// Pre-flight: every case must name an instrument the worktree carries. A receipt for a
// subject that does not exist would be exactly the R86-D1 class, so refuse instead.
for (const [name, , args] of cases) {
  if (instrumentBytes(args[0]) === null) refuse('INSTRUMENT_UNREADABLE', `${name} ${args[0]}`);
}

mkdirSync(work, { recursive: true });
mkdirSync(out, { recursive: true });
if (out !== join(lane, '.ufo', 'waves', 'round-87', 'close')) {
  console.log(`RUN_CLOSE: NOTE out is not the probe's receipt dir ${join(lane, '.ufo', 'waves', 'round-87', 'close')}`);
}

const env = { ...process.env, TMPDIR: work, HYAKU_SCRATCH: scratch };
for (const [name, cmd, args] of cases) {
  const digest = sha(instrumentBytes(args[0]));
  const r = spawnSync(cmd, args, {
    cwd: lane, encoding: 'utf8', timeout: 300000, maxBuffer: 16 << 20, env,
  });
  const body = `${r.stdout || ''}${r.stderr || ''}`;
  const tail = body && !body.endsWith('\n') ? `${body}\n` : body;
  writeFileSync(join(out, `${name}.txt`),
    `rev=${rev}\ntool_sha256=${digest}\ncmd=${cmd} ${args.join(' ')}\n${tail}exit=${r.status}\nsignal=${r.signal || 'none'}\n`);
  const last = (r.stdout || '').trim().split('\n').filter(Boolean).at(-1) || '';
  console.log(`${name}: exit=${r.status} ${last}`);
}

const b = spawnSync('node', [join(lane, 'scripts', 'receipt-bind.mjs'), '--dir', out, '--rev', rev], {
  cwd: lane, encoding: 'utf8', timeout: 300000, maxBuffer: 16 << 20, env,
});
const bindOut = `${b.stdout || ''}${b.stderr || ''}`;
const line = (bindOut.match(/^RECEIPT_BIND: .*$/m) || [''])[0];
console.log(`RUN_CLOSE: BIND ${line} exit=${b.status}`);
console.log(`RUN_CLOSE: DONE cases=${cases.length} rev=${rev} out=${out} bind_exit=${b.status}`);
process.exit(b.status === 0 ? 0 : 1);
