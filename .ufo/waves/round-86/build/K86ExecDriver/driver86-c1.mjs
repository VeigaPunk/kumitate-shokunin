#!/usr/bin/env node
/*
 * K86ExecDriver — independent driver for counter-receipt v3 (round 86, C1).
 * Contract source: .ufo/waves/round-86/plan.md, "Frozen target contract".
 * Receipt grammar and finding order follow the shipped v2 header of
 * scripts/counter-receipt.mjs, which plan.md says stays as shipped.
 * This file does not read or reuse the frozen probe's code.
 *
 *   node driver86-c1.mjs --lane DIR --work DIR
 *
 * Each arm writes its fixtures, derives the expected exit code and stdout from
 * the bytes it wrote (read back from disk), runs the lane tool as a child
 * process and compares exactly.
 */
import { spawnSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

// ---------------------------------------------------------------- CLI
function parseCli(args) {
  if (args.length % 2 !== 0) return null;
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i];
    if ((key !== '--lane' && key !== '--work') || out[key] !== undefined) return null;
    out[key] = args[i + 1];
  }
  return out['--lane'] && out['--work'] ? out : null;
}
const cli = parseCli(process.argv.slice(2));
if (!cli) {
  console.log('K86_EXEC_DRIVER: USAGE --lane DIR --work DIR');
  process.exit(64);
}

const LANE = resolve(cli['--lane']);
const TOOL = join(LANE, 'scripts', 'counter-receipt.mjs');
const WORK_PARENT = resolve(cli['--work']);
mkdirSync(WORK_PARENT, { recursive: true });
const WORK = mkdtempSync(join(WORK_PARENT, 'k86-driver-'));

// ---------------------------------------------------------------- randomness (seed printed)
const SEED = randomBytes(4).readUInt32LE(0);
let rngState = SEED;
function rnd() { // mulberry32
  rngState = (rngState + 0x6d2b79f5) >>> 0;
  let t = rngState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const randInt = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));
const pick = (xs) => xs[randInt(0, xs.length - 1)];
const hexOf = (n) => Array.from({ length: n }, () => pick('0123456789abcdef')).join('');
const ALNUM = 'abcdefghijklmnopqrstuvwxyz0123456789';
const ALNUM_DASH = `${ALNUM}-`;

// ---------------------------------------------------------------- expectation model (from contract)
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const readSafe = (path) => { try { return readFileSync(path); } catch { return null; } };
const show = (value) => JSON.stringify(value);
const isSafe = Number.isSafeInteger;

// Fail-closed tokens (exit 2). Everything else in the finding vocabulary is drift (exit 1).
const FAIL_CLOSED = new Set([
  'SUMMARY_COUNT', 'ARM_MALFORMED', 'ARMS_EMPTY', 'SUMMARY_ORDER', 'RECEIPT_UNREADABLE',
  'SOURCE_UNREADABLE', 'SOURCE_ARMS_EMPTY',
]);

// Receipt grammar: metadata lines are skipped; transcript-shaped lines must match exactly.
const META_KEY = /^[A-Za-z_][A-Za-z0-9_-]*=/;
const META_PREFIX = /^(command|rev|exit):/;
const SUMMARY_SHAPE = /^\S+:[ \t]+(HELD\b|UNMET\b|\S+[ \t]+held=)/;
const SUMMARY = /^([A-Z][A-Z0-9_]*): (HELD|UNMET) held=(\d+)\/(\d+)$/;
const ARM_SHAPE = /^\S+[ \t]+arm([ \t]|$)/;
const ARM = /^([A-Z][A-Z0-9_]*) arm ([a-z0-9][a-z0-9-]*) (ok|FAIL)([ \t].*)?$/;

function parseReceipt(buf) {
  if (buf === null) {
    return { bytes: 0, rows: 0, held: '-/-', sha: '-', names: [], finding: 'RECEIPT_UNREADABLE' };
  }
  const lines = buf.toString('utf8').split('\n').map((line) => (line.endsWith('\r') ? line.slice(0, -1) : line));
  const summaries = [];
  const arms = [];
  let malformed = false;
  lines.forEach((line, index) => {
    if (META_KEY.test(line) || META_PREFIX.test(line)) return;
    if (SUMMARY_SHAPE.test(line)) {
      const m = SUMMARY.exec(line);
      summaries.push(m ? { index, prefix: m[1], verdict: m[2], held: Number(m[3]), total: Number(m[4]) } : null);
    }
    if (ARM_SHAPE.test(line)) {
      const m = ARM.exec(line);
      if (m) arms.push({ index, prefix: m[1], name: m[2], ok: m[3] === 'ok' });
      else malformed = true;
    }
  });
  // RECEIPT held= label: first well-formed, safe summary; otherwise -/-.
  const firstGood = summaries.find((s) => s && isSafe(s.held) && isSafe(s.total));
  const held = firstGood ? `${firstGood.held}/${firstGood.total}` : '-/-';
  const rows = arms.length;
  const summary = summaries.length === 1 ? summaries[0] : null;

  let finding = null;
  if (!summary || !isSafe(summary.held) || !isSafe(summary.total)) finding = 'SUMMARY_COUNT';
  else if (malformed) finding = 'ARM_MALFORMED';
  else if (rows === 0) finding = 'ARMS_EMPTY';
  else if (summary.index < arms[rows - 1].index) finding = 'SUMMARY_ORDER';
  else if (summary.total !== rows) finding = 'ARMS_TOTAL';
  else if (new Set(arms.map((a) => a.name)).size !== rows) finding = 'ARM_DUPLICATE';
  else if (arms.some((a) => a.prefix !== summary.prefix)) finding = 'ARM_PREFIX';
  else if (summary.held !== arms.filter((a) => a.ok).length) finding = 'HELD_COUNT';
  else if (arms.some((a) => !a.ok)) finding = 'ARM_FAILED';
  else if (summary.verdict !== 'HELD') finding = 'VERDICT';

  return { bytes: buf.length, rows, held, sha: sha256(buf), names: arms.map((a) => a.name), finding };
}

// Source binding: literal arm('<name>' call sites (not preceded by an identifier char);
// last const|let|var ARMS = <int> declaration.
function parseSource(buf) {
  const text = buf.toString('utf8');
  const names = [];
  for (let at = text.indexOf("arm('"); at !== -1; at = text.indexOf("arm('", at + 1)) {
    const prev = at === 0 ? '' : text[at - 1];
    if (/[A-Za-z0-9_$]/.test(prev)) continue;
    const start = at + 5;
    const end = text.indexOf("'", start);
    if (end === -1) break;
    const name = text.slice(start, end);
    if (/[\r\n]/.test(name)) continue;
    names.push(name);
  }
  let declared = null;
  for (const m of text.matchAll(/(?<![A-Za-z0-9_$])(?:const|let|var)[ \t]+ARMS[ \t]*=[ \t]*(\d+)(?![0-9A-Za-z_.])/g)) {
    declared = Number(m[1]);
  }
  return { sites: names.length, declared, names, sha: sha256(buf) };
}

function expectSource(sBuf, receipt) {
  if (sBuf === null) return { token: 'SOURCE_UNREADABLE', sites: 0, declared: 'absent', sha: '-' };
  const s = parseSource(sBuf);
  let token = null;
  if (s.sites === 0) token = 'SOURCE_ARMS_EMPTY';
  else if (receipt.names.some((name) => !s.names.includes(name))) token = 'ARM_UNBOUND';
  else if (s.sites !== receipt.rows) token = 'SOURCE_ARITY';
  else if (s.declared !== null && s.declared !== s.sites) token = 'SOURCE_DECLARED';
  return { token, sites: s.sites, declared: s.declared === null ? 'absent' : String(s.declared), sha: s.sha };
}

// sBuf: undefined = no --src; null = --src unreadable; Buffer = source bytes.
function expectation(rBuf, sBuf) {
  const r = parseReceipt(rBuf);
  const src = sBuf === undefined ? undefined : expectSource(sBuf, r);
  const srcToken = src === undefined ? undefined : src.token;
  // Receipt finding outranks source finding; first finding wins.
  const overall = r.finding ?? srcToken ?? null;
  const code = overall === null ? 0 : FAIL_CLOSED.has(overall) ? 2 : 1;
  const head = code === 0
    ? 'COUNTER_RECEIPT: CLEAN'
    : `COUNTER_RECEIPT: ${code === 1 ? 'DRIFT' : 'FAIL-CLOSED'} ${overall}`;
  const lines = [
    head,
    `RECEIPT: bytes=${r.bytes} rows=${r.rows} held=${r.held} findings=${overall ?? 'none'} sha256=${r.sha}`,
  ];
  if (src !== undefined) {
    lines.push(`SOURCE: sites=${src.sites} declared=${src.declared} receipt=${r.rows} sha256=${src.sha}`);
  }
  return { code, lines, rFinding: r.finding, sFinding: srcToken };
}

// ---------------------------------------------------------------- arm runner
const outcomes = [];
let armNo = 0;

// Write fixture bytes to disk; returns the absolute path, or undefined when not given.
// Values: string | Buffer | { missing: true } | { dir: true } | undefined.
function materialize(id, slot, value) {
  if (value === undefined) return undefined;
  if (value.missing) return join(WORK, `${id}-${slot}-missing`);
  if (value.dir) {
    const dir = join(WORK, `${id}-${slot}-dir`);
    mkdirSync(dir);
    return dir;
  }
  const path = join(WORK, `${id}-${slot}`);
  writeFileSync(path, value);
  return path;
}

function arm(spec) {
  armNo += 1;
  const id = `A${String(armNo).padStart(2, '0')}`;
  const rPath = materialize(id, 'receipt', spec.receipt);
  const sPath = materialize(id, 'src', spec.src);
  const args = spec.argv
    ? spec.argv({ rPath, sPath })
    : [...(rPath === undefined ? [] : ['--receipt', rPath]), ...(sPath === undefined ? [] : ['--src', sPath])];

  let expect;
  let selfOk = true;
  if (spec.usage) {
    expect = { code: 64, lines: ['COUNTER_RECEIPT: USAGE'] };
  } else {
    expect = expectation(readSafe(rPath), sPath === undefined ? undefined : readSafe(sPath));
    // Pinned intent must agree with this driver's own derivation; otherwise the driver is wrong.
    selfOk = expect.rFinding === spec.want.rcpt && expect.sFinding === spec.want.src;
  }

  const run = spawnSync(process.execPath, [TOOL, ...args], { encoding: 'utf8', timeout: 30000 });
  const gotOut = run.stdout ?? '';
  const wantOut = `${expect.lines.join('\n')}\n`;
  const pass = selfOk && run.status === expect.code && gotOut === wantOut && !run.error;
  outcomes.push({ id, name: spec.name, pass });

  console.log(`${id} ${pass ? 'ok  ' : 'FAIL'} ${spec.name} (exit ${run.status}, want ${expect.code})`);
  if (pass) {
    for (const line of gotOut.split('\n').filter(Boolean)) console.log(`      | ${line}`);
  } else {
    if (!selfOk) {
      console.log(`      DRIVER_SELF pinned rcpt=${show(spec.want?.rcpt)} src=${show(spec.want?.src)} derived rcpt=${show(expect.rFinding)} src=${show(expect.sFinding)}`);
    }
    console.log(`      want ${show(wantOut)}`);
    console.log(`      got  ${show(gotOut)}`);
  }
  if (run.error) console.log(`      spawn error: ${run.error.message}`);
  if (run.stderr) console.log(`      stderr ${show(run.stderr)}`);
}

// ---------------------------------------------------------------- fixed arms (H01–H43)
const GOOD = 'X arm a ok detail\nX arm b ok detail\nX: HELD held=2/2\n';
const THREE_OK = 'X arm a ok\nX arm b ok\nX arm c ok\nX: HELD held=3/3\n';
const SRC2 = "const ARMS = 2;\narm('a', () => {});\narm('b', () => {});\n";
const SRC2_UNDECLARED = "arm('a', () => {});\narm('b', () => {});\n";
const SRC3 = "const ARMS = 3;\narm('a', () => {});\narm('b', () => {});\narm('c', () => {});\n";
const META_REV = 'rev=9f2c1a\ncommand: node scripts/counter-receipt.mjs --receipt FILE\nexit=0\n';

console.log('=== fixed arms (contract pins, shipped grammar) ===');
// Receipt only: clean and grammar-tolerance arms.
arm({ name: 'H01 clean', receipt: GOOD, want: { rcpt: null } });
arm({ name: 'H02 clean-crlf', receipt: GOOD.replace(/\n/g, '\r\n'), want: { rcpt: null } });
arm({ name: 'H03 metadata-ignored', receipt: `${META_REV}${GOOD}elapsed=3ms\n`, want: { rcpt: null } });
arm({ name: 'H04 metadata-arm-decoy', receipt: `command=X arm red FAIL\n${GOOD}`, want: { rcpt: null } });
arm({ name: 'H05 detail-not-reparsed', receipt: 'X arm a ok note arm b FAIL\nX arm b ok\nX: HELD held=2/2\n', want: { rcpt: null } });
arm({ name: 'H22 leading-zero-counts', receipt: GOOD.replace('2/2', '02/002'), want: { rcpt: null } });
arm({ name: 'H44 mutation-detail-byte', receipt: GOOD.replace('detail', 'detaiL'), want: { rcpt: null } });
// Receipt drift and fail-closed.
arm({ name: 'H06 honest-red', receipt: 'X arm a FAIL\nX: UNMET held=0/1\n', want: { rcpt: 'ARM_FAILED' } });
arm({ name: 'H07 hidden-red', receipt: 'X arm a ok\nX arm b FAIL\nX: HELD held=1/1\n', want: { rcpt: 'ARMS_TOTAL' } });
arm({ name: 'H08 total-drift', receipt: GOOD.replace('2/2', '2/3'), want: { rcpt: 'ARMS_TOTAL' } });
arm({ name: 'H09 held-drift', receipt: GOOD.replace('2/2', '1/2'), want: { rcpt: 'HELD_COUNT' } });
arm({ name: 'H10 duplicate', receipt: GOOD.replace('arm b', 'arm a'), want: { rcpt: 'ARM_DUPLICATE' } });
arm({ name: 'H11 foreign-prefix', receipt: GOOD.replace('X arm b', 'Y arm b'), want: { rcpt: 'ARM_PREFIX' } });
arm({ name: 'H12 wrong-verdict', receipt: GOOD.replace('HELD', 'UNMET'), want: { rcpt: 'VERDICT' } });
arm({ name: 'H13 two-summaries', receipt: `${GOOD}X: HELD held=2/2\n`, want: { rcpt: 'SUMMARY_COUNT' } });
arm({ name: 'H14 no-summary', receipt: 'X arm a ok\n', want: { rcpt: 'SUMMARY_COUNT' } });
arm({ name: 'H15 malformed-summary', receipt: GOOD.replace('2/2', '2/2 trailing'), want: { rcpt: 'SUMMARY_COUNT' } });
arm({ name: 'H16 unsafe-held', receipt: GOOD.replace('2/2', '9007199254740992/2'), want: { rcpt: 'SUMMARY_COUNT' } });
arm({ name: 'H17 negative-held', receipt: GOOD.replace('2/2', '-1/2'), want: { rcpt: 'SUMMARY_COUNT' } });
arm({ name: 'H18 malformed-arm', receipt: GOOD.replace('b ok', 'b MAYBE'), want: { rcpt: 'ARM_MALFORMED' } });
arm({ name: 'H19 zero-arms', receipt: 'X: HELD held=0/0\n', want: { rcpt: 'ARMS_EMPTY' } });
arm({ name: 'H20 summary-before-arms', receipt: 'X: HELD held=2/2\nX arm a ok\nX arm b ok\n', want: { rcpt: 'SUMMARY_ORDER' } });
arm({ name: 'H21 empty-before-drift', receipt: 'X: UNMET held=2/3\n', want: { rcpt: 'ARMS_EMPTY' } });
arm({ name: 'H23 receipt-missing', receipt: { missing: true }, want: { rcpt: 'RECEIPT_UNREADABLE' } });
arm({ name: 'H24 receipt-is-directory', receipt: { dir: true }, want: { rcpt: 'RECEIPT_UNREADABLE' } });
// Usage (exit 64, single line).
arm({ name: 'H25 usage-no-args', usage: true, argv: () => [] });
arm({ name: 'H26 usage-unknown-flag', usage: true, argv: () => ['--unknown'] });
arm({ name: 'H27 usage-missing-value', usage: true, argv: () => ['--receipt'] });
arm({ name: 'H28 usage-duplicate-receipt', usage: true, argv: () => ['--receipt', 'a', '--receipt', 'b'] });
arm({ name: 'H29 usage-src-without-receipt', usage: true, argv: ({ sPath }) => ['--src', sPath], src: 'const ARMS = 1;\n' });
// Source half: binding, digest, fail-closed and drift.
arm({ name: 'H30 src-clean', receipt: GOOD, src: SRC2, want: { rcpt: null, src: null } });
arm({ name: 'H31 src-undeclared', receipt: GOOD, src: SRC2_UNDECLARED, want: { rcpt: null, src: null } });
arm({ name: 'H32 src-last-declaration-wins', receipt: GOOD, src: "const ARMS = 3;\narm('a', () => {});\narm('b', () => {});\nconst ARMS = 2;\n", want: { rcpt: null, src: null } });
arm({ name: 'H33 src-missing', receipt: GOOD, src: { missing: true }, want: { rcpt: null, src: 'SOURCE_UNREADABLE' } });
arm({ name: 'H34 src-no-arm-sites', receipt: GOOD, src: 'const ARMS = 3;\n// no arm sites here\n', want: { rcpt: null, src: 'SOURCE_ARMS_EMPTY' } });
arm({ name: 'H35 src-unbound-name', receipt: 'X arm a ok\nX arm b ok\nX arm zz ok\nX: HELD held=3/3\n', src: SRC3, want: { rcpt: null, src: 'ARM_UNBOUND' } });
arm({ name: 'H36 src-arity', receipt: GOOD, src: SRC3, want: { rcpt: null, src: 'SOURCE_ARITY' } });
arm({ name: 'H37 src-declared-drift', receipt: GOOD, src: "const ARMS = 3;\narm('a', () => {});\narm('b', () => {});\n", want: { rcpt: null, src: 'SOURCE_DECLARED' } });
arm({ name: 'H38 src-decoys-not-sites', receipt: GOOD, src: "const ARMS = 2;\nwarm('a', () => {});\narm('a', () => {});\nxarm('z', () => {});\narm('b', () => {});\n", want: { rcpt: null, src: null } });
arm({ name: 'H39 receipt-outranks-source', receipt: 'X arm a ok\nX arm b FAIL\nX: HELD held=1/1\n', src: { missing: true }, want: { rcpt: 'ARMS_TOTAL', src: 'SOURCE_UNREADABLE' } });
arm({ name: 'H40 src-digest-a', receipt: GOOD, src: SRC2, want: { rcpt: null, src: null } });
arm({ name: 'H41 src-digest-b-same-counts', receipt: GOOD, src: `// nonce ${hexOf(8)}\n${SRC2}`, want: { rcpt: null, src: null } });
// Mutations on copies of the same receipt/source bytes.
arm({ name: 'H42 mutation-base-clean', receipt: THREE_OK, src: SRC3, want: { rcpt: null, src: null } });
arm({ name: 'H43 mutation-status-flip', receipt: THREE_OK.replace('arm b ok', 'arm b FAIL'), src: SRC3, want: { rcpt: 'HELD_COUNT', src: null } });

// ---------------------------------------------------------------- generated fixtures (10, run-time random)
const KINDS = {
  clean: { rcpt: null, src: null },
  'arm-failed': { rcpt: 'ARM_FAILED', src: null },
  verdict: { rcpt: 'VERDICT', src: null },
  'arms-total': { rcpt: 'ARMS_TOTAL', src: null },
  'held-count': { rcpt: 'HELD_COUNT', src: null },
  duplicate: { rcpt: 'ARM_DUPLICATE', src: null },
  prefix: { rcpt: 'ARM_PREFIX', src: null },
  unbound: { rcpt: null, src: 'ARM_UNBOUND' },
  arity: { rcpt: null, src: 'SOURCE_ARITY' },
  declared: { rcpt: null, src: 'SOURCE_DECLARED' },
};
const META_POOL = [
  () => `rev=${hexOf(8)}`,
  () => `exit=${randInt(0, 2)}`,
  () => `command: node scripts/counter-receipt.mjs --receipt ${hexOf(4)}`,
  () => `elapsed=${randInt(1, 999)}ms`,
  () => `# nonce ${hexOf(6)}`,
];

function generate(kind) {
  const n = randInt(3, 12);
  const prefix = `R${hexOf(6).toUpperCase()}`;
  const names = [];
  while (names.length < n) {
    const name = pick(ALNUM) + Array.from({ length: randInt(2, 9) }, () => pick(ALNUM_DASH)).join('');
    if (!names.includes(name)) names.push(name);
  }
  const armPrefixes = names.map(() => prefix);
  let oks = Array.from({ length: n }, () => rnd() < 0.7);
  if (['clean', 'verdict', 'held-count', 'unbound', 'arity', 'declared'].includes(kind)) oks = oks.map(() => true);
  if (kind === 'arm-failed') oks[randInt(0, n - 1)] = false;
  if (kind === 'prefix') armPrefixes[randInt(1, n - 1)] = `Q${hexOf(6).toUpperCase()}`;
  const armNames = [...names];
  if (kind === 'duplicate') armNames[randInt(1, n - 1)] = armNames[0];

  const okCount = oks.filter(Boolean).length;
  let verdict = oks.every(Boolean) ? 'HELD' : 'UNMET';
  let held = okCount;
  let total = n;
  if (kind === 'verdict') verdict = 'UNMET';
  if (kind === 'arms-total') total = n + 1;
  if (kind === 'held-count') held = n - 1;

  const lines = armNames.map((name, i) => `${armPrefixes[i]} arm ${name} ${oks[i] ? 'ok' : 'FAIL'}${rnd() < 0.5 ? ` detail-${hexOf(4)}` : ''}`);
  for (let k = randInt(0, 3); k > 0; k -= 1) lines.splice(randInt(0, lines.length), 0, pick(META_POOL)());
  lines.push(`${prefix}: ${verdict} held=${held}/${total}`);
  if (rnd() < 0.5) lines.push(pick(META_POOL)());
  let receipt = `${lines.join('\n')}\n`;
  if (rnd() < 0.3) receipt = receipt.replace(/\n/g, '\r\n');

  const siteNames = [...armNames];
  if (kind === 'unbound') siteNames[randInt(0, n - 1)] = `NOT-BOUND-${hexOf(4).toUpperCase()}`;
  if (kind === 'arity') siteNames.push(`EXTRA-${hexOf(4).toUpperCase()}`);
  let decl = rnd() < 0.5 ? n : null;
  if (kind === 'declared') decl = n + 2;
  if (kind === 'arity') decl = null;
  const srcLines = [];
  if (decl !== null) srcLines.push(`const ARMS = ${decl};`);
  srcLines.push(`warm('${hexOf(4)}', () => {});`);
  siteNames.forEach((name, i) => srcLines.push(`arm('${name}', () => check(${i}));`));
  const source = `${srcLines.join('\n')}\n`;

  return { n, prefix, receipt, source };
}

console.log('=== generated fixtures (run-time random; arm counts, names, statuses, metadata, CRLF) ===');
for (const kind of Object.keys(KINDS)) {
  const fx = generate(kind);
  arm({ name: `G gen-${kind} n=${fx.n} prefix=${fx.prefix}`, receipt: fx.receipt, src: fx.source, want: KINDS[kind] });
}

// ---------------------------------------------------------------- report
const toolBytes = readSafe(TOOL);
console.log(`SEED=${SEED.toString(16).padStart(8, '0')}`);
console.log(`TOOL=${TOOL}`);
console.log(`TOOL_SHA256=${toolBytes === null ? 'UNREADABLE' : sha256(toolBytes)}`);
console.log(`TOOL_HEADER=${toolBytes === null ? '-' : (toolBytes.toString('utf8').split('\n')[1] ?? '')}`);

const passed = outcomes.filter((o) => o.pass).length;
const total = outcomes.length;
console.log(`K86_EXEC_DRIVER: ${passed === total ? 'HELD' : 'UNMET'} held=${passed}/${total}`);

try {
  rmSync(WORK, { recursive: true, force: true });
} finally {
  process.exitCode = passed === total ? 0 : 1;
}
