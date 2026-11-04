#!/usr/bin/env node
/**
 * probe87-c1.mjs — FROZEN scorer for claim C1 of kumitate round 87
 * (`receipt-bind`, contract `kumitate-receipt-bind-v1`).
 *
 *   node .ufo/waves/round-87/probe/probe87-c1.mjs --lane <LANE> --work <SCRATCH> --rev <40-hex> [--tool <candidate>]
 *
 * Scores a candidate `receipt-bind` tool over TWELVE arms and prints one line per arm,
 * then `C87_C1: HELD held=<k>/12` with exit 0 iff every arm holds, else exit 1.
 * `--tool` defaults to `<LANE>/scripts/receipt-bind.mjs` (the integrated instrument).
 * Fail-closed (exit 2) when --lane or --work is unusable or --rev is not 40 hex.
 *
 * The arms are the claim's predicate; they are byte-frozen with the plan at the freeze
 * commit and are never rewritten after data. Arm 3 scores the committed round-86 close
 * receipts (the class the tool must detect); arm 4 scores the round-87 close receipts;
 * arms 5–8 and 11 are same-directory fixtures derived from the round-87 receipts, so a
 * tool that keys its verdict on the directory name or file name cannot pass them; arm 12
 * generates a receipt at run time from lane bytes, so no canned table survives.
 *
 * Fixtures live under <SCRATCH>/probe87/<arm>/ and are removed before the probe exits.
 */
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync, symlinkSync, rmSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';

function opt(name, dflt) {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : dflt;
}
const lane = resolve(opt('--lane', '.'));
const work = resolve(opt('--work', ''));
const rev = opt('--rev', '');
const tool = resolve(opt('--tool', join(lane, 'scripts', 'receipt-bind.mjs')));

function failClosed(token, detail) {
  console.log(`C87_C1: FAIL-CLOSED ${token}${detail ? ' ' + detail : ''}`);
  process.exit(2);
}
if (!existsSync(lane)) failClosed('LANE_UNREADABLE', lane);
if (!work) failClosed('WORK_REQUIRED');
if (!/^[a-f0-9]{40}$/.test(rev)) failClosed('REV_NOT_FULL', rev || 'absent');
mkdirSync(work, { recursive: true });
const fixRoot = join(work, 'probe87');
rmSync(fixRoot, { recursive: true, force: true });
mkdirSync(fixRoot, { recursive: true });

const sha = (b) => createHash('sha256').update(b).digest('hex');
const R86 = join(lane, '.ufo', 'waves', 'round-86', 'close');
const R87 = join(lane, '.ufo', 'waves', 'round-87', 'close');

function runTool(extra) {
  const r = spawnSync('node', [tool, ...extra], {
    cwd: lane, encoding: 'utf8', timeout: 300000, maxBuffer: 32 << 20,
    env: { ...process.env, TMPDIR: work },
  });
  return { status: r.status, out: `${r.stdout || ''}${r.stderr || ''}` };
}
function bindLine(out) {
  return (out.match(/^RECEIPT_BIND: .*$/m) || [''])[0];
}
function field(line, key) {
  const m = line.match(new RegExp(`${key}=(\\d+)`));
  return m ? Number(m[1]) : NaN;
}
function gitShow(rel) {
  const g = spawnSync('git', ['-C', lane, 'show', `${rev}:${rel}`], { maxBuffer: 64 << 20 });
  return g.status === 0 ? g.stdout : null;
}
function receiptsOf(dir) {
  if (!existsSync(dir)) return null;
  return readdirSync(dir).filter((f) => f.endsWith('.txt')).sort();
}
function copyDir(src, name) {
  const dst = join(fixRoot, name);
  mkdirSync(dst, { recursive: true });
  for (const f of receiptsOf(src) || []) writeFileSync(join(dst, f), readFileSync(join(src, f)));
  return dst;
}
function editFirst(dir, fn) {
  const files = receiptsOf(dir);
  const f = files[0];
  const p = join(dir, f);
  writeFileSync(p, fn(readFileSync(p, 'utf8')));
  return f;
}

const arms = [];
function arm(name, ok, detail) { arms.push({ name, ok: !!ok, detail: detail || '' }); }

// A1 — bare invocation is a usage error.
{
  const r = runTool([]);
  arm('usage', r.status === 64 && /USAGE/.test(r.out), `exit=${r.status}`);
}
// A2 — the tool's own hermetic selftest.
{
  const r = runTool(['--selftest', '--work', work]);
  arm('selftest', r.status === 0 && /RECEIPT_BIND_SELFTEST: PASS/.test(r.out),
    `exit=${r.status} ${(r.out.match(/RECEIPT_BIND_SELFTEST: .*/) || [''])[0]}`);
}
// A3 — detection on the committed round-86 receipts: 9 of 10 misname their subject.
{
  const r = runTool(['--dir', R86, '--rev', rev]);
  const line = bindLine(r.out);
  arm('detect-r86', r.status === 1 && /^RECEIPT_BIND: DRIFT/.test(line) &&
    field(line, 'matched') === 1 && field(line, 'mismatched') === 9 && field(line, 'unchecked') === 0,
    `exit=${r.status} ${line}`);
}
// A4 — the round-87 receipts bind clean at the measured revision.
{
  const present = (receiptsOf(R87) || []).length >= 8;
  const r = present ? runTool(['--dir', R87, '--rev', rev]) : { status: -1, out: '' };
  const line = bindLine(r.out);
  arm('clean-r87', present && r.status === 0 && /^RECEIPT_BIND: CLEAN/.test(line) &&
    field(line, 'mismatched') === 0 && field(line, 'unchecked') === 0 && field(line, 'matched') >= 8,
    present ? `exit=${r.status} ${line}` : 'no-r87-close');
}
// A5 — same filename, different `cmd=`: the verdict must follow the content.
{
  let ok = false; let detail = 'no-r87-close';
  if (receiptsOf(R87)) {
    const d = copyDir(R87, 'flip-cmd');
    // pick the first receipt whose command already names a different script
    const target = receiptsOf(d).find((f) => {
      const c = (readFileSync(join(d, f), 'utf8').match(/^cmd=(.+)$/m) || [, ''])[1].trim().split(/\s+/)[1];
      return c && c !== 'scripts/proxy-check.mjs';
    }) || receiptsOf(d)[0];
    const p = join(d, target);
    writeFileSync(p, readFileSync(p, 'utf8').replace(/^cmd=(.+)$/m, (m, c) => {
      const toks = c.trim().split(/\s+/);
      toks[1] = 'scripts/proxy-check.mjs';
      return 'cmd=' + toks.join(' ');
    }));
    const changed = target;
    const r = runTool(['--dir', d, '--rev', rev]);
    const line = bindLine(r.out);
    ok = r.status === 1 && field(line, 'mismatched') === 1;
    detail = `exit=${r.status} ${line} edited=${changed}`;
  }
  arm('flip-cmd', ok, detail);
}
// A6 — same filename, one digest zeroed.
{
  let ok = false; let detail = 'no-r87-close';
  if (receiptsOf(R87)) {
    const d = copyDir(R87, 'flip-hash');
    const changed = editFirst(d, (t) => t.replace(/^tool_sha256=[a-f0-9]{64}$/m, `tool_sha256=${'0'.repeat(64)}`));
    const r = runTool(['--dir', d, '--rev', rev]);
    const line = bindLine(r.out);
    ok = r.status === 1 && field(line, 'mismatched') === 1;
    detail = `exit=${r.status} ${line} edited=${changed}`;
  }
  arm('flip-hash', ok, detail);
}
// A7 — a receipt that carries no command is counted unchecked, never silently clean.
{
  let ok = false; let detail = 'no-r87-close';
  if (receiptsOf(R87)) {
    const d = copyDir(R87, 'unchecked');
    const changed = editFirst(d, (t) => t.replace(/^cmd=.+$/m, ''));
    const r = runTool(['--dir', d, '--rev', rev]);
    const line = bindLine(r.out);
    ok = r.status === 1 && field(line, 'unchecked') === 1 && field(line, 'mismatched') === 0;
    detail = `exit=${r.status} ${line} edited=${changed}`;
  }
  arm('unchecked', ok, detail);
}
// A8 — a command naming a script the revision does not carry is fail-closed.
{
  let ok = false; let detail = 'no-r87-close';
  if (receiptsOf(R87)) {
    const d = copyDir(R87, 'unresolved');
    const changed = editFirst(d, (t) => t.replace(/^cmd=(.+)$/m, (m, c) => {
      const toks = c.trim().split(/\s+/);
      toks[1] = 'scripts/absent-87-probe.mjs';
      return 'cmd=' + toks.join(' ');
    }));
    const r = runTool(['--dir', d, '--rev', rev]);
    const line = bindLine(r.out);
    ok = r.status === 2 && /FAIL-CLOSED UNRESOLVED/.test(line);
    detail = `exit=${r.status} ${line} edited=${changed}`;
  }
  arm('unresolved', ok, detail);
}
// A9 — a missing receipt directory is fail-closed, not clean.
{
  const r = runTool(['--dir', join(work, 'absent-87-dir'), '--rev', rev]);
  const line = bindLine(r.out);
  arm('dir-missing', r.status === 2 && /FAIL-CLOSED DIR_UNREADABLE/.test(line), `exit=${r.status} ${line}`);
}
// A10 — a default revision the repo cannot resolve is fail-closed.
{
  let ok = false; let detail = 'no-r87-close';
  if (receiptsOf(R87)) {
    const d = copyDir(R87, 'rev-bad');
    for (const f of receiptsOf(d)) {
      const p = join(d, f);
      writeFileSync(p, readFileSync(p, 'utf8').replace(/^rev=[a-f0-9]{40}$/m, ''));
    }
    const r = runTool(['--dir', d, '--rev', '0'.repeat(40)]);
    const line = bindLine(r.out);
    ok = r.status === 2 && /FAIL-CLOSED REV_UNRESOLVED/.test(line);
    detail = `exit=${r.status} ${line}`;
  }
  arm('rev-bad', ok, detail);
}
// A11 — a symlinked receipt is not a receipt.
{
  let ok = false; let detail = 'no-r87-close';
  if (receiptsOf(R87)) {
    const d = copyDir(R87, 'symlink');
    const files = receiptsOf(d);
    if (files.length >= 2) {
      rmSync(join(d, files[0]));
      symlinkSync(join(d, files[1]), join(d, files[0]));
    }
    const r = runTool(['--dir', d, '--rev', rev]);
    const line = bindLine(r.out);
    ok = r.status === 2 && /FAIL-CLOSED SYMLINK_RECEIPT/.test(line) &&
      lstatSync(join(d, files[0])).isSymbolicLink();
    detail = `exit=${r.status} ${line}`;
  }
  arm('symlink', ok, detail);
}
// A12 — a receipt generated at run time from lane bytes: clean, then one flipped digest.
{
  const scripts = existsSync(join(lane, 'scripts'))
    ? readdirSync(join(lane, 'scripts')).filter((f) => f.endsWith('.mjs')).sort()
    : [];
  let ok = false; let detail = 'no-scripts';
  if (scripts.length) {
    const pick = scripts[(Date.now() + process.pid) % scripts.length];
    const rel = `scripts/${pick}`;
    const bytes = gitShow(rel);
    if (bytes) {
      const d = join(fixRoot, 'random-fixture');
      mkdirSync(d, { recursive: true });
      const body = `rev=${rev}\ntool_sha256=${sha(bytes)}\ncmd=node ${rel} --selftest\nexit=0\nsignal=none\n`;
      writeFileSync(join(d, 'gen.txt'), body);
      const a = runTool(['--dir', d, '--rev', rev]);
      const la = bindLine(a.out);
      writeFileSync(join(d, 'gen.txt'), body.replace(/^tool_sha256=.*$/m, `tool_sha256=${'1'.repeat(64)}`));
      const b = runTool(['--dir', d, '--rev', rev]);
      const lb = bindLine(b.out);
      ok = a.status === 0 && /^RECEIPT_BIND: CLEAN/.test(la) && field(la, 'matched') === 1 &&
        b.status === 1 && field(lb, 'mismatched') === 1;
      detail = `pick=${rel} clean_exit=${a.status} ${la} | flip_exit=${b.status} ${lb}`;
    }
  }
  arm('random-fixture', ok, detail);
}

const held = arms.filter((a) => a.ok).length;
for (const a of arms) console.log(`ARM ${a.name}: ${a.ok ? 'PASS' : 'FAIL'} ${a.detail}`);
rmSync(fixRoot, { recursive: true, force: true });
console.log(`C87_C1: ${held === arms.length ? 'HELD' : 'UNMET'} held=${held}/${arms.length}`);
process.exit(held === arms.length ? 0 : 1);
