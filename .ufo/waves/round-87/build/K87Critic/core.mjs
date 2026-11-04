#!/usr/bin/env node
/**
 * core.mjs — critic-side reference implementation of `kumitate-receipt-bind-v1`.
 *
 * This is NOT an integration candidate for `scripts/receipt-bind.mjs` (the executor
 * seats own that). It exists so every adversarial construction in this directory can
 * be a 30-line diff against a tool that does the claimed work: each candidate imports
 * this core and overrides exactly one hook.
 *
 * Honest behaviour (no hooks):
 *   - `--dir <dir> --rev <40-hex> [--lane <dir>] [--json]`, `--selftest [--work <dir>]`
 *   - instrument = second whitespace token of the receipt's `cmd=`
 *   - lane-relative / lane-absolute instrument hashed from `git show <rev>:<path>`
 *   - absolute instrument outside the lane hashed from disk and counted `external=`
 *   - exit map 0 CLEAN / 1 DRIFT / 2 fail-closed / 64 usage
 *   - CLEAN requires mismatched==0 AND unchecked==0 over >= 1 receipt
 */
import { readFileSync, readdirSync, existsSync, statSync, lstatSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve, relative, isAbsolute } from 'node:path';
import { tmpdir } from 'node:os';

export const CONTRACT = 'kumitate-receipt-bind-v1';

export const USAGE = `USAGE: receipt-bind (${CONTRACT})
  node receipt-bind.mjs --dir <dir> --rev <40-hex> [--lane <dir>] [--json]
  node receipt-bind.mjs --selftest [--work <dir>]
  exit: 0 CLEAN | 1 DRIFT | 2 fail-closed | 64 usage`;

export function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function git(lane, args) {
  return spawnSync('git', ['-C', lane, ...args], { maxBuffer: 256 << 20 });
}

export function gitToplevel(cwd) {
  const r = git(cwd, ['rev-parse', '--show-toplevel']);
  return r.status === 0 ? r.stdout.toString('utf8').trim() : null;
}

export function revResolves(lane, rev) {
  if (!/^[a-f0-9]{40}$/.test(String(rev || ''))) return false;
  const r = git(lane, ['rev-parse', '--verify', '--quiet', `${rev}^{commit}`]);
  return r.status === 0;
}

export function revOf(lane, ref) {
  const r = git(lane, ['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]);
  return r.status === 0 ? r.stdout.toString('utf8').trim() : null;
}

/** Honest instrument bytes: lane content comes from the judged revision, not the worktree. */
export function gitShow(lane, rev, rel) {
  const r = git(lane, ['show', `${rev}:${rel}`]);
  return r.status === 0 ? r.stdout : null;
}

function fieldOf(text, key) {
  const m = text.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return m ? m[1] : null;
}

export function parseArgs(argv) {
  const o = { extra: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--selftest') o.selftest = true;
    else if (a === '--json') o.json = true;
    else if (a === '--dir' || a === '--rev' || a === '--lane' || a === '--work') {
      const v = argv[i + 1];
      if (v === undefined) return { error: `missing value for ${a}` };
      o[a.slice(2)] = v;
      i++;
    } else o.extra.push(a);
  }
  return o;
}

function classify(lane, inst) {
  if (isAbsolute(inst)) {
    const abs = resolve(inst);
    const rel = relative(lane, abs);
    if (rel && !rel.startsWith('..') && !isAbsolute(rel)) return { rel, external: false };
    return { abs, external: true };
  }
  return { rel: inst.replace(/^\.\//, ''), external: false };
}

/**
 * Bind one receipt directory. Hooks (all optional) let a construction deviate from the
 * honest contract in exactly one place:
 *   hash({lane, rev, rel, abs, external, receipt}) -> Buffer|null   (null = UNRESOLVED)
 *   digestOf({receipt, bytes}) -> digest string compared to tool_sha256
 *   revFor({receiptRev, judgedRev}) -> rev used to fetch lane bytes
 *   verdictOverride({dir, receipts}) -> {status, line}|null         (short-circuits hashing)
 */
export function bind(dir, rev, lane, hooks = {}) {
  const hash = hooks.hash || (({ lane, rev, rel, abs, external, receipt }) => {
    if (external) {
      try { return readFileSync(abs); } catch { return null; }
    }
    const r = hooks.revFor ? hooks.revFor({ receiptRev: receipt.rev, judgedRev: rev }) : rev;
    return gitShow(lane, r, rel);
  });

  const abs = resolve(dir);
  let st;
  try { st = statSync(abs); } catch { st = null; }
  if (!st || !st.isDirectory()) {
    return { status: 2, line: `RECEIPT_BIND: FAIL-CLOSED DIR_UNREADABLE ${abs}` };
  }
  let files;
  try {
    files = readdirSync(abs).filter((f) => f.endsWith('.txt')).sort();
  } catch {
    return { status: 2, line: `RECEIPT_BIND: FAIL-CLOSED DIR_UNREADABLE ${abs}` };
  }
  if (!files.length) {
    return { status: 2, line: `RECEIPT_BIND: FAIL-CLOSED NO_RECEIPTS ${abs}` };
  }
  for (const f of files) {
    if (lstatSync(join(abs, f)).isSymbolicLink()) {
      return { status: 2, line: `RECEIPT_BIND: FAIL-CLOSED SYMLINK_RECEIPT ${f}` };
    }
  }

  const receipts = files.map((f) => {
    const text = readFileSync(join(abs, f), 'utf8');
    return {
      file: f,
      text,
      rev: fieldOf(text, 'rev'),
      tool_sha256: fieldOf(text, 'tool_sha256'),
      cmd: fieldOf(text, 'cmd'),
    };
  });

  const ov = hooks.verdictOverride ? hooks.verdictOverride({ dir: abs, receipts }) : null;
  if (ov) return ov;

  if (!revResolves(lane, rev)) {
    return { status: 2, line: `RECEIPT_BIND: FAIL-CLOSED REV_UNRESOLVED ${rev}` };
  }

  let matched = 0;
  let mismatched = 0;
  let unchecked = 0;
  let external = 0;
  let first = '';
  for (const rec of receipts) {
    if (rec.cmd === null || rec.cmd.trim() === '') { unchecked++; continue; }
    const toks = rec.cmd.trim().split(/\s+/);
    const inst = toks[1];
    if (!inst) { unchecked++; continue; }
    const c = classify(lane, inst);
    if (c.external) external++;
    const bytes = hash({ lane, rev, rel: c.rel, abs: c.abs, external: c.external, receipt: rec });
    if (!bytes) {
      return { status: 2, line: `RECEIPT_BIND: FAIL-CLOSED UNRESOLVED ${inst}` };
    }
    const digest = hooks.digestOf ? hooks.digestOf({ receipt: rec, bytes, lane, rev }) : sha256(bytes);
    if (digest === String(rec.tool_sha256 || '').toLowerCase()) matched++;
    else { mismatched++; if (!first) first = rec.file; }
  }

  if (mismatched === 0 && unchecked === 0) {
    return { status: 0, line: `RECEIPT_BIND: CLEAN matched=${matched} mismatched=0 unchecked=0 external=${external}` };
  }
  return {
    status: 1,
    line: `RECEIPT_BIND: DRIFT matched=${matched} mismatched=${mismatched} unchecked=${unchecked} external=${external}${first ? ` first=${first}` : ''}`,
  };
}

function writeReceipt(dir, body) {
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'gen.txt'), body);
  return dir;
}

/** Hermetic selftest: writes only beneath --work, exercises CLEAN/DRIFT/unchecked/dir-missing. */
export function selftest(workArg, lane) {
  const base = join(resolve(workArg || tmpdir()), `receipt-bind-selftest-${process.pid}`);
  rmSync(base, { recursive: true, force: true });
  mkdirSync(base, { recursive: true });
  const checks = [];
  const push = (name, ok, detail) => checks.push({ name, ok: !!ok, detail: detail || '' });
  try {
    const rev = revOf(lane, 'HEAD');
    if (!rev) { push('rev', false, 'HEAD unresolvable'); }
    else {
      const scripts = readdirSync(join(lane, 'scripts')).filter((f) => f.endsWith('.mjs')).sort();
      const rel = `scripts/${scripts[0]}`;
      const bytes = gitShow(lane, rev, rel);
      if (!bytes) push('bytes', false, rel);
      else {
        const good = writeReceipt(join(base, 'clean'),
          `rev=${rev}\ntool_sha256=${sha256(bytes)}\ncmd=node ${rel} --selftest\nexit=0\nsignal=none\n`);
        const drift = writeReceipt(join(base, 'drift'),
          `rev=${rev}\ntool_sha256=${'0'.repeat(64)}\ncmd=node ${rel} --selftest\nexit=0\nsignal=none\n`);
        const un = writeReceipt(join(base, 'unchecked'),
          `rev=${rev}\ntool_sha256=${sha256(bytes)}\nexit=0\nsignal=none\n`);
        const r1 = bind(good, rev, lane);
        push('clean', r1.status === 0 && /^RECEIPT_BIND: CLEAN/.test(r1.line) && /matched=1\b/.test(r1.line), r1.line);
        const r2 = bind(drift, rev, lane);
        push('drift', r2.status === 1 && /mismatched=1\b/.test(r2.line), r2.line);
        const r3 = bind(un, rev, lane);
        push('unchecked', r3.status === 1 && /unchecked=1\b/.test(r3.line) && /mismatched=0\b/.test(r3.line), r3.line);
        const r4 = bind(join(base, 'absent'), rev, lane);
        push('dir-missing', r4.status === 2 && /FAIL-CLOSED DIR_UNREADABLE/.test(r4.line), r4.line);
      }
    }
  } catch (e) {
    push('throw', false, String(e && e.message ? e.message : e));
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
  const held = checks.filter((c) => c.ok).length;
  const total = checks.length || 1;
  const ok = held === total && held > 0;
  return { ok, line: `RECEIPT_BIND_SELFTEST: ${ok ? 'PASS' : 'FAIL'} held=${held}/${total}` };
}

/** Standard CLI driver: usage/selftest/bind, shared by every construction in this dir. */
export function main(hooks = {}) {
  const o = parseArgs(process.argv.slice(2));
  if (o.error) { console.log(USAGE); process.exit(64); }
  if (o.extra.length) { console.log(USAGE); process.exit(64); }
  const lane = o.lane ? resolve(o.lane) : gitToplevel(process.cwd());
  if (!lane || !existsSync(lane)) {
    console.log(`RECEIPT_BIND: FAIL-CLOSED LANE_UNREADABLE ${o.lane || process.cwd()}`);
    process.exit(2);
  }
  if (o.selftest) {
    const r = selftest(o.work, lane);
    console.log(r.line);
    process.exit(r.ok ? 0 : 1);
  }
  if (!o.dir || !o.rev) { console.log(USAGE); process.exit(64); }
  const r = bind(o.dir, o.rev, lane, hooks);
  if (o.json) console.log(JSON.stringify({ contract: CONTRACT, dir: resolve(o.dir), rev: o.rev, status: r.status, line: r.line }));
  console.log(r.line);
  process.exit(r.status);
}
