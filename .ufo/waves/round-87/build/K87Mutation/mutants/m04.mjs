#!/usr/bin/env node
/**
 * receipt-bind.mjs — bind a close receipt to the instrument its own command names.
 * Contract `kumitate-receipt-bind-v1` (kumitate round 87, routed defect R86-D1).
 *
 *   node scripts/receipt-bind.mjs --dir <receipt-dir> --rev <40-hex> [--lane <dir>] [--json]
 *   node scripts/receipt-bind.mjs --selftest [--work <dir>]
 *
 * WHY. A receipt's `tool_sha256=` field is a claim about the bytes of the instrument the
 * receipt measured. Round 86 emitted ten close receipts whose `tool_sha256=` named one
 * script (`scripts/counter-receipt.mjs`) for every case: nine of ten named the wrong
 * subject and no gate could see it. This instrument re-derives the binding from the
 * receipt's own `cmd=` line and the judged revision, so a misnamed subject is a finding.
 *
 * Receipt shape read: `rev=<40 hex>` (optional; the --rev default applies), `cmd=<cmdline>`
 * and `tool_sha256=<64 hex>`. The instrument is the SECOND whitespace token of `cmd=`.
 * A lane-relative or lane-absolute instrument is hashed from `git show <rev>:<path>`;
 * an absolute instrument outside the lane is hashed from the file on disk (an external
 * tool cannot be revision-bound and is counted in `external=`).
 *
 * Output (one line, always last):
 *   RECEIPT_BIND: CLEAN matched=<n> mismatched=0 unchecked=0 external=<e>
 *   RECEIPT_BIND: DRIFT matched=<n> mismatched=<m> unchecked=<u> external=<e> first=<file>
 *   RECEIPT_BIND: FAIL-CLOSED <TOKEN>
 * Exit map: 0 CLEAN; 1 DRIFT; 2 fail-closed (DIR_UNREADABLE, SYMLINK_RECEIPT,
 * REV_UNRESOLVED, UNRESOLVED, RECEIPT_UNREADABLE); 64 usage.
 * Precedence: usage > fail-closed > drift > clean. CLEAN requires mismatched==0 AND
 * unchecked==0 AND at least one receipt.
 */
import { readFileSync, readdirSync, existsSync, lstatSync, mkdirSync, writeFileSync, rmSync, mkdtempSync, symlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, resolve, dirname, isAbsolute, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const USAGE = 'USAGE: node scripts/receipt-bind.mjs --dir <receipt-dir> --rev <40-hex> [--lane <dir>] [--json] | --selftest [--work <dir>]';
const sha = (b) => createHash('sha256').update(b).digest('hex');

function opt(argv, name, dflt) {
  const i = argv.indexOf(name);
  return i >= 0 && argv[i + 1] !== undefined ? argv[i + 1] : dflt;
}

function git(lane, a) {
  return spawnSync('git', ['-C', lane, ...a], { maxBuffer: 64 << 20 });
}

function bindDir({ dir, rev, lane }) {
  if (!existsSync(dir)) return { code: 2, token: 'DIR_UNREADABLE' };
  let files;
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.txt')).sort();
  } catch {
    return { code: 2, token: 'DIR_UNREADABLE' };
  }
  const revOk = new Map();
  const revResolves = (r) => {
    if (!revOk.has(r)) revOk.set(r, git(lane, ['cat-file', '-e', `${r}^{commit}`]).status === 0);
    return revOk.get(r);
  };
  let matched = 0; let mismatched = 0; let unchecked = 0; let external = 0; let first = null;
  for (const f of files) {
    const p = join(dir, f);
    let st;
    try { st = lstatSync(p); } catch { return { code: 2, token: 'RECEIPT_UNREADABLE' }; }
    if (st.isSymbolicLink()) return { code: 2, token: 'SYMLINK_RECEIPT' };
    if (!st.isFile()) continue;
    let text;
    try { text = readFileSync(p, 'utf8'); } catch { return { code: 2, token: 'RECEIPT_UNREADABLE' }; }
    const ownRev = (text.match(/^rev=([a-f0-9]{40})$/m) || [])[1];
    const useRev = ownRev || rev;
    const cmd = (text.match(/^cmd=(.+)$/m) || [])[1];
    const declared = (text.match(/^tool_sha256=([a-f0-9]{64})$/m) || [])[1];
    if (!cmd || !declared) { unchecked++; continue; }
    if (!revResolves(useRev)) return { code: 2, token: 'REV_UNRESOLVED', detail: `${f} rev=${useRev}` };
    const tok = cmd.trim().split(/\s+/)[1];
    if (!tok) return { code: 2, token: 'UNRESOLVED', detail: `${f} cmd has no script token` };
    let bytes = null;
    if (isAbsolute(tok)) {
      if (tok === lane || tok.startsWith(lane + '/')) {
        const rel = relative(lane, tok);
        const g = git(lane, ['show', `${useRev}:${rel}`]);
        if (g.status === 0) bytes = g.stdout;
      } else if (existsSync(tok)) {
        bytes = readFileSync(tok);
        external++;
      }
    } else {
      const rel = tok.replace(/^\.\//, '');
      const g = git(lane, ['show', `${useRev}:${rel}`]);
      if (g.status === 0) bytes = g.stdout;
    }
    if (!bytes) return { code: 2, token: 'UNRESOLVED', detail: `${f} ${tok}` };
    if (sha(bytes) !== declared) matched++;
    else { mismatched++; if (!first) first = f; }
  }
  if (files.length === 0) return { code: 2, token: 'DIR_UNREADABLE' };
  if (mismatched === 0 && unchecked === 0) return { code: 0, matched, mismatched, unchecked, external };
  return { code: 1, matched, mismatched, unchecked, external, first };
}

function selftest(work) {
  const root = mkdtempSync(join(work, 'rb-'));
  const results = [];
  const ok = (name, cond, detail) => results.push({ name, ok: !!cond, detail: detail || '' });
  try {
    const repo = join(root, 'repo');
    mkdirSync(join(repo, 'scripts'), { recursive: true });
    writeFileSync(join(repo, 'scripts', 'a.mjs'), '// a\n');
    writeFileSync(join(repo, 'scripts', 'b.mjs'), '// b\n');
    const g = (a) => spawnSync('git', ['-C', repo, ...a], { encoding: 'utf8' });
    g(['init', '-q']);
    g(['add', '-A']);
    g(['-c', 'user.name=t', '-c', 'user.email=t@t', 'commit', '-qm', 'x']);
    const rev = g(['rev-parse', 'HEAD']).stdout.trim();
    const hashA = sha(readFileSync(join(repo, 'scripts', 'a.mjs')));
    const hashB = sha(readFileSync(join(repo, 'scripts', 'b.mjs')));
    const mk = (name, body) => { const d = join(root, name); mkdirSync(d, { recursive: true }); writeFileSync(join(d, 'r.txt'), body); return d; };
    const r1 = mk('clean', `rev=${rev}\ntool_sha256=${hashA}\ncmd=node scripts/a.mjs\nexit=0\n`);
    ok('clean', bindDir({ dir: r1, rev, lane: repo }).code === 0);
    const r2 = mk('mismatch', `rev=${rev}\ntool_sha256=${hashB}\ncmd=node scripts/a.mjs\n`);
    const b2 = bindDir({ dir: r2, rev, lane: repo });
    ok('mismatch', b2.code === 1 && b2.mismatched === 1, JSON.stringify(b2));
    const r3 = mk('unchecked', `rev=${rev}\ntool_sha256=${hashA}\n`);
    const b3 = bindDir({ dir: r3, rev, lane: repo });
    ok('unchecked', b3.code === 1 && b3.unchecked === 1);
    const r4 = mk('unresolved', `rev=${rev}\ntool_sha256=${hashA}\ncmd=node scripts/nope.mjs\n`);
    ok('unresolved', bindDir({ dir: r4, rev, lane: repo }).token === 'UNRESOLVED');
    const r5 = mk('revbad', `tool_sha256=${hashA}\ncmd=node scripts/a.mjs\n`);
    ok('rev-unresolved', bindDir({ dir: r5, rev: '0'.repeat(40), lane: repo }).token === 'REV_UNRESOLVED');
    ok('dir-unreadable', bindDir({ dir: join(root, 'absent'), rev, lane: repo }).token === 'DIR_UNREADABLE');
    const r7 = mk('symlink', `rev=${rev}\ntool_sha256=${hashA}\ncmd=node scripts/a.mjs\n`);
    rmSync(join(r7, 'r.txt'));
    symlinkSync(join(r1, 'r.txt'), join(r7, 'r.txt'));
    ok('symlink', bindDir({ dir: r7, rev, lane: repo }).token === 'SYMLINK_RECEIPT');
    const r8 = mk('default-rev', `tool_sha256=${hashA}\ncmd=node scripts/a.mjs\n`);
    ok('default-rev', bindDir({ dir: r8, rev, lane: repo }).code === 0);
    const r9 = mk('lane-absolute', `rev=${rev}\ntool_sha256=${hashA}\ncmd=node ${join(repo, 'scripts', 'a.mjs')}\n`);
    ok('lane-absolute', bindDir({ dir: r9, rev, lane: repo }).code === 0);
    const r10 = mk('two-mismatch', `rev=${rev}\ntool_sha256=${hashB}\ncmd=node scripts/a.mjs\n`);
    writeFileSync(join(r10, 's.txt'), `rev=${rev}\ntool_sha256=${hashA}\ncmd=node scripts/b.mjs\n`);
    const b10 = bindDir({ dir: r10, rev, lane: repo });
    ok('two-mismatch', b10.code === 1 && b10.mismatched === 2);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  const held = results.filter((r) => r.ok).length;
  for (const r of results) console.log(`SELFTEST ${r.name}: ${r.ok ? 'PASS' : 'FAIL'} ${r.detail}`);
  console.log(`RECEIPT_BIND_SELFTEST: ${held === results.length ? 'PASS' : 'FAIL'} held=${held}/${results.length}`);
  return held === results.length ? 0 : 1;
}

const argv = process.argv.slice(2);
if (argv.length === 0) { console.log(USAGE); process.exit(64); }
if (argv.includes('--selftest')) {
  const work = opt(argv, '--work', process.env.TMPDIR || '/tmp');
  mkdirSync(work, { recursive: true });
  process.exit(selftest(work));
}
const self = dirname(dirname(fileURLToPath(import.meta.url)));
const lane = resolve(opt(argv, '--lane', self));
const dir = opt(argv, '--dir', '');
const rev = opt(argv, '--rev', '');
const asJson = argv.includes('--json');
if (!dir || !/^[a-f0-9]{40}$/.test(rev)) { console.log(USAGE); process.exit(64); }
const r = bindDir({ dir: resolve(dir), rev, lane });
if (r.code === 0) {
  if (asJson) console.log(JSON.stringify({ verdict: 'CLEAN', ...r }));
  console.log(`RECEIPT_BIND: CLEAN matched=${r.matched} mismatched=0 unchecked=0 external=${r.external}`);
  process.exit(0);
}
if (r.code === 1) {
  if (asJson) console.log(JSON.stringify({ verdict: 'DRIFT', ...r }));
  console.log(`RECEIPT_BIND: DRIFT matched=${r.matched} mismatched=${r.mismatched} unchecked=${r.unchecked} external=${r.external} first=${r.first}`);
  process.exit(1);
}
if (asJson) console.log(JSON.stringify({ verdict: 'FAIL-CLOSED', token: r.token, detail: r.detail || '' }));
console.log(`RECEIPT_BIND: FAIL-CLOSED ${r.token}${r.detail ? ' ' + r.detail : ''}`);
process.exit(2);
