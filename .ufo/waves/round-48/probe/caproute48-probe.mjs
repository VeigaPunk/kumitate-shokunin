#!/usr/bin/env node
// caproute48-probe.mjs — frozen counter for kumitate round 48, claim C1 (operability).
// Usage: node caproute48-probe.mjs <lane-repo> <rev> [--set r48|r47]
//
// Predicate (label ROUTED_HELD; the same sentence as plan.md § C1):
//   Site s is ROUTED_HELD at rev r when, in each of 3 runs of the owning gate's `--selftest` from its
//   own `git archive` of r under `strace -f` with a planted canary variable, the trace parses
//   completely, the gate exits 0, the line before its final `VERDICT: PASS` is that gate's own suite
//   summary with n = m and m no lower than the base run's, no FAIL line and no successful execveat
//   occur, no direct child of the gate is an uncapped launch outside the set's named allowances, the
//   site's child is exec'd exactly as many times as in the base run (at least once), and every such
//   exec is preceded, in its own ancestry, by the ordered chain r's `scripts/cap-run.mjs` (node) →
//   `/usr/bin/systemd-run --scope` whose own options set `-p MemorySwapMax=0`, `-p MemoryMax=<= 1024M`
//   and `-p TasksMax=<= 256` → `/usr/bin/bwrap` carrying --unshare-pid, --clearenv and
//   --die-with-parent, with no canary variable in the child's environment.
// Output: per run `RUN <gate> <tag> …` lines, one `SITE <id> label=ROUTED_HELD|ROUTED_MISS …` line per
//   site, then `CAPROUTE48 rev=<rev> base=<base> set=<set> held=<h>/<n> runs=3 rule=F48`.
//   Exit 0 iff every site of the set is ROUTED_HELD, 1 otherwise, 2 when the probe cannot evaluate
//   (archive, strace, an unparsed or unresumed trace record, or an invalid base run). Exit 2 is never a score.
//
// Round-48 changes against round 47's A2 counter (`.ufo/waves/round-47/probe/caproute-probe.mjs`):
// - R47-5 root cause (measured at f00cf278, three AT802 runs: capped 106/105/103 of n=106): strace
//   aligns a short record's return value to a column (`-a`, default 40), so a resumed execve reads
//   `<... execve resumed>)           = 0`; A2's `\) = ` return pattern missed it and the record was
//   skipped silently. Resumed records occur when another tracee's event interleaves, so the loss grew
//   with load. The return is now matched as `\)\s+= `, and every traced record (complete or resumed)
//   whose return does not parse, every resumed record with no pending entry and every entry still
//   pending at the end of the log is exit 2.
// - Second R47-5 cause (pre-freeze stability runs, 11:21-11:43Z): strace pads the PID prefix to five
//   columns, so after the host's PID counter wraps (pid_max 4194304; observed 4193822 → 4745 inside
//   one run) a record reads `9879  clone(…)`; A2's `^(\d+) (.*)$` left a leading space in the body and
//   the record was skipped (a runner's execve lost, its child's chain broken). The prefix is now
//   `^(\d+) +`, every non-empty line that does not parse is exit 2, and a PID created twice in one
//   log (reuse, or an untranslated PID-namespace return) is exit 2.
// - Mistake 3 / R47-5: a site whose exec count differs from the base run's is ROUTED_MISS
//   (`exec_count_ne_base`), and the label needs all 3 runs.
// - CritChronology objection 2: the summary must be the owning gate's own label, on the line before
//   the final `VERDICT: PASS`.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { basename, join } from 'node:path';
import { randomBytes } from 'node:crypto';

const RUNS = 3;
const SCRATCH = '/fast/scratch/hyaku/kumitate-r48/probe-runs';
const MAX_LOG = 1 << 30;
const MACHINE = new Set(['/usr/bin/systemd-run', '/usr/bin/env', '/usr/bin/bwrap', '/usr/bin/systemctl']);
const FIXTURE_TOOLS = new Set(['/usr/bin/git', '/usr/bin/mkfifo']);
const TRACED = new Set(['execve', 'execveat', 'clone', 'clone3', 'fork', 'vfork']);
const isNode = (x) => basename(x.path) === 'node';
const isShell = (x) => ['sh', 'bash', 'dash'].includes(basename(x.path));
const selfOf = (gate) => (a) => typeof a[1] === 'string' && a[1].endsWith(`/scripts/${gate}.mjs`);
const SUMMARY = {
  'kimi-census': /^KIMI_CENSUS_SELFTEST: (\d+)\/(\d+) pass$/,
  'sources-check': /^SOURCES_SELFTEST: (\d+)\/(\d+) pass$/,
  'claims-check': /^CLAIMS_SELFTEST: (\d+)\/(\d+) pass$/,
  'anchor-truth': /^ANCHOR_TRUTH_SELFTEST: (\d+)\/(\d+) pass$/,
  'round-gate': /^ROUND_GATE_SELFTEST: (\d+)\/(\d+) pass$/,
  'surface-probe': /^(\d+)\/(\d+) cases passed$/,
};
const SETS = {
  // Round 48's claim: four sites in two gates, none routed at the base.
  r48: {
    base: 'f00cf278a5ab57e87b18418fc972be9f893f65da',
    sites: [
      { id: 'RG742', gate: 'round-gate', kind: isNode, match: (a) => selfOf('round-gate')(a) && !a.includes('--selftest') },
      { id: 'SP491', gate: 'surface-probe', kind: isShell, match: (a) => basename(a[1] || '') === 'ufo-sighting' && a[2] === 'surface' && a[3] === '--json' },
      { id: 'SP519', gate: 'surface-probe', kind: isNode, match: (a) => (a[1] || '').endsWith('/scripts/fleet-dispatcher.mjs') && a[2] === 'status' },
      { id: 'SP1592', gate: 'surface-probe', kind: isNode, match: (a) => selfOf('surface-probe')(a) && !a.includes('--selftest') },
    ],
    // Named out-of-scope direct children (plan § C1 "not routed"): each gate's nested `--selftest`
    // (RG1409, SP1766) and surface-probe's checklist runner `bash -c <command>` (SP1049).
    allowDirect: (gate, ex) => ex.length >= 1 && ((isNode(ex[0]) && selfOf(gate)(ex[0].argv) && ex[0].argv.includes('--selftest'))
      || (gate === 'surface-probe' && isShell(ex[0]) && ex[0].argv[1] === '-c')),
  },
  // Round 47's five sites (quality re-measurement under this counter; not a claim of round 48).
  r47: {
    base: '0bd8be60d9150030a2eee8344a2e70b65f6eb4f4',
    sites: [
      { id: 'K488', gate: 'kimi-census', kind: isNode, match: selfOf('kimi-census') },
      { id: 'SC549', gate: 'sources-check', kind: isNode, match: selfOf('sources-check') },
      { id: 'SC859', gate: 'sources-check', kind: isShell, match: (a) => a.includes('sources-check-parity') },
      { id: 'CC879', gate: 'claims-check', kind: isNode, match: selfOf('claims-check') },
      { id: 'AT802', gate: 'anchor-truth', kind: isNode, match: (a) => selfOf('anchor-truth')(a) && a.includes('--self') },
    ],
    allowDirect: () => false,
  },
};

const die = (m) => { process.stdout.write(`CAPROUTE48: ERROR ${m}\n`); process.exit(2); };
const argv = process.argv.slice(2);
let setName = 'r48';
const si = argv.indexOf('--set');
if (si >= 0) { setName = argv[si + 1]; argv.splice(si, 2); }
const SET = SETS[setName];
const [lane, revArg] = argv;
if (!lane || !revArg || !SET || argv.length !== 2) die('usage: caproute48-probe.mjs <lane-repo> <rev> [--set r48|r47]');
const git = (args) => spawnSync('git', ['-C', lane, ...args], { encoding: 'buffer', maxBuffer: 1 << 28,
  env: { PATH: process.env.PATH, HOME: process.env.HOME } });
const rp = git(['rev-parse', '--verify', `${revArg}^{commit}`]);
if (rp.status !== 0) die(`rev-parse ${revArg}`);
const rev = rp.stdout.toString().trim();

// Parse one strace C value list: "str", [..], numbers, /* comments */, NULL.
function parseStrings(s, i) {
  // expects s[i] === '['; returns [array of strings, index after ']']
  const out = [];
  i++;
  while (i < s.length) {
    while (s[i] === ' ' || s[i] === ',') i++;
    if (s[i] === ']') return [out, i + 1];
    if (s[i] === '"') {
      let v = '';
      i++;
      while (i < s.length && s[i] !== '"') {
        if (s[i] === '\\') {
          const c = s[i + 1];
          if (c === 'x') { v += String.fromCharCode(parseInt(s.slice(i + 2, i + 4), 16)); i += 4; continue; }
          if (/[0-7]/.test(c)) { let j = i + 1; let o = ''; while (j < i + 4 && /[0-7]/.test(s[j])) o += s[j++]; v += String.fromCharCode(parseInt(o, 8)); i = j; continue; }
          v += { n: '\n', t: '\t', r: '\r', v: '\v', f: '\f', '"': '"', '\\': '\\' }[c] ?? c;
          i += 2;
          continue;
        }
        v += s[i++];
      }
      i++;
      if (s.startsWith('...', i)) i += 3;
      out.push(v);
      continue;
    }
    if (s.startsWith('/*', i)) { const j = s.indexOf('*/', i); i = j < 0 ? s.length : j + 2; continue; }
    if (s.startsWith('...', i)) { i += 3; continue; }
    const j = s.slice(i).search(/[,\]]/);
    if (j < 0) return [out, s.length];
    i += j;
  }
  return [out, i];
}

function parseLog(text) {
  const parent = new Map();
  const execs = []; // {pid, seq, path, argv, envp}
  const pending = new Map();
  let seq = 0;
  let rootPid = null;
  let execveat = 0;
  let resumed = 0;
  for (const line of text.split('\n')) {
    const m = /^(\d+) +(.*)$/.exec(line);
    if (!m) { if (line !== '') die(`unparsed trace line: ${JSON.stringify(line.slice(0, 120))}`); continue; }
    const pid = Number(m[1]);
    let body = m[2];
    if (body.endsWith('<unfinished ...>')) {
      const c = /^(\w+)\(/.exec(body);
      if (!c || !TRACED.has(c[1])) continue;
      if (pending.has(pid)) die(`second unfinished record for pid ${pid}: ${body.slice(0, 120)}`);
      pending.set(pid, { call: c[1], body: body.slice(0, -'<unfinished ...>'.length) });
      continue;
    }
    const res = /^<\.\.\. (\w+) resumed>(.*)$/.exec(body);
    if (res) {
      if (!TRACED.has(res[1])) continue;
      const pe = pending.get(pid);
      if (!pe || pe.call !== res[1]) die(`resumed ${res[1]} record with no pending entry for pid ${pid}`);
      pending.delete(pid);
      body = pe.body + res[2];
      resumed++;
    }
    const call = /^(\w+)\(/.exec(body);
    if (!call || !TRACED.has(call[1])) continue;
    // strace aligns short records' return values to a column, so the gap before `=` is any run of
    // spaces; the return is read only from the END of the record.
    const ret = /\)\s+= (-?\d+)(?: \/\* (\d+) in strace's PID NS \*\/)?(?: E[A-Z0-9]+ \([^()]*\))?$/.exec(body);
    if (!ret) die(`unparsed return in ${call[1]} record of pid ${pid}: ${JSON.stringify(body.slice(0, 80))}…${JSON.stringify(body.slice(-80))}`);
    const rv = Number(ret[2] ?? ret[1]);
    if (call[1] === 'execveat') { if (rv === 0) execveat++; continue; }
    if (call[1] === 'execve') {
      if (rv !== 0) continue;
      const pm = /^execve\("((?:[^"\\]|\\.)*)"/.exec(body);
      if (!pm) die(`unparsed execve line: ${body.slice(0, 120)}`);
      const [path] = parseStrings(`["${pm[1]}"]`, 0)[0];
      let k = body.indexOf('[', pm[0].length);
      const [args, k2] = parseStrings(body, k);
      k = body.indexOf('[', k2);
      const [envp] = k >= 0 ? parseStrings(body, k) : [[]];
      if (rootPid === null) rootPid = pid;
      execs.push({ pid, seq: seq++, path, argv: args, envp });
    } else if (rv > 0) {
      if (parent.has(rv)) die(`pid ${rv} created twice in one log (reuse or an untranslated PID-namespace return)`);
      parent.set(rv, pid);
    }
  }
  if (pending.size > 0) {
    const [pid, pe] = [...pending][0];
    die(`${pending.size} traced record(s) never resumed (first: pid ${pid} ${pe.call})`);
  }
  return { parent, execs, rootPid, execveat, resumed };
}

function runGate(dir, gate, canaryKey, canaryVal, label) {
  const tree = join(dir, 'tree');
  const log = join(dir, `${gate}.strace`);
  return new Promise((done) => {
    const ch = spawn('prlimit', [`--fsize=${MAX_LOG * 4}`, '--', 'timeout', '-k', '10', '1200',
      'strace', '-f', '-qq', '-v', '-s', '8192', '--decode-pids=pidns', '-e', 'trace=execve,execveat,clone,clone3,fork,vfork', '-e', 'signal=none',
      '-o', log, '--', process.execPath, join(tree, 'scripts', `${gate}.mjs`), '--selftest'],
    { cwd: tree, env: { ...process.env, [canaryKey]: canaryVal }, stdio: ['ignore', 'pipe', 'pipe'] });
    const out = []; const err = [];
    let outLen = 0;
    ch.stdout.on('data', (b) => { outLen += b.length; if (outLen < (1 << 26)) out.push(b); });
    ch.stderr.on('data', (b) => { if (err.length < 64) err.push(b); });
    ch.on('close', (status) => {
      const stdout = Buffer.concat(out).toString('utf8');
      const stderr = Buffer.concat(err).toString('utf8');
      let size = 0;
      try { size = statSync(log).size; } catch { die(`no strace log for ${gate} (${label}); status=${status} ${stderr.slice(-300)}`); }
      if (size > MAX_LOG) die(`strace log for ${gate} too large (${size})`);
      const parsed = parseLog(readFileSync(log, 'utf8'));
      if (parsed.rootPid === null) die(`no execve recorded for ${gate} (${label}); status=${status} log_bytes=${size} stderr=${JSON.stringify(stderr.slice(-300))}`);
      rmSync(log, { force: true });
      const lines = stdout.split('\n').filter((l) => l.trim() !== '');
      const verdictPass = lines.at(-1) === 'VERDICT: PASS';
      const sum = SUMMARY[gate].exec(lines.at(-2) || '');
      const failLines = stdout.split('\n').filter((l) => /^FAIL\b/.test(l)).length;
      done({ status, tail: lines.at(-1) || '', pass: sum ? Number(sum[1]) : -1, total: sum ? Number(sum[2]) : -1,
        verdictPass, failLines, tree, ...parsed });
    });
  });
}

function ancestorsOrSelf(p, pid) {
  const out = [pid];
  const seen = new Set(out);
  let q = p.parent.get(pid);
  while (q !== undefined && !seen.has(q)) { seen.add(q); out.push(q); q = p.parent.get(q); }
  return out;
}

// systemd-run's own options, before its `--`, as `-p K=V` / `--property=K=V`.
function scopeProps(x) {
  const props = new Map();
  let scope = false;
  for (let i = 1; i < x.argv.length && x.argv[i] !== '--'; i++) {
    const a = x.argv[i];
    if (a === '--scope') scope = true;
    let kv = null;
    if ((a === '-p' || a === '--property') && i + 1 < x.argv.length) kv = x.argv[++i];
    else if (a.startsWith('--property=')) kv = a.slice('--property='.length);
    else if (a.startsWith('-p') && a.length > 2) kv = a.slice(2);
    if (kv && kv.includes('=')) props.set(kv.slice(0, kv.indexOf('=')), kv.slice(kv.indexOf('=') + 1));
  }
  return { scope, props };
}
const isScope = (x) => {
  if (x.path !== '/usr/bin/systemd-run') return false;
  const { scope, props } = scopeProps(x);
  const mm = /^(\d+)M$/.exec(props.get('MemoryMax') || '');
  const tm = /^(\d+)$/.exec(props.get('TasksMax') || '');
  return scope && props.get('MemorySwapMax') === '0' && mm && Number(mm[1]) <= 1024 && tm && Number(tm[1]) <= 256;
};
const isBwrap = (x) => x.path === '/usr/bin/bwrap' && ['--unshare-pid', '--clearenv', '--die-with-parent'].every((f) => x.argv.includes(f));

// Every direct child of the gate's root is exactly one node exec of the rev's own cap-run.mjs, only
// fixture-tool execs, or a named allowance of the set; anything else is an uncapped launch.
function uncappedDirect(p, gate) {
  const runner = join(p.tree, 'scripts', 'cap-run.mjs');
  let n = 0;
  for (const [kid, par] of p.parent) {
    if (par !== p.rootPid) continue;
    const ex = p.execs.filter((x) => x.pid === kid);
    if (ex.length === 0) continue;
    if (ex.length === 1 && isNode(ex[0]) && ex[0].argv[1] === runner) continue;
    if (ex.every((x) => FIXTURE_TOOLS.has(x.path))) continue;
    if (SET.allowDirect(gate, ex)) continue;
    n++;
  }
  return n;
}

function judge(p, site, canaryKey) {
  const runnerFile = join(p.tree, 'scripts', 'cap-run.mjs');
  const cands = p.execs.filter((e) => e.pid !== p.rootPid && !MACHINE.has(e.path)
    && e.argv[1] !== runnerFile && site.match(e.argv) && site.kind(e));
  let capped = 0;
  const why = new Set();
  for (const e of cands) {
    const anc = ancestorsOrSelf(p, e.pid);
    const before = (pid, seqMax) => p.execs.filter((x) => x.pid === pid && x.seq < seqMax);
    let haveR = false; let haveS = false; let haveB = false;
    for (const bp of anc) {
      for (const B of before(bp, e.seq).filter(isBwrap)) {
        haveB = true;
        for (const sp of ancestorsOrSelf(p, B.pid)) {
          for (const S of before(sp, B.seq).filter(isScope)) {
            haveS = true;
            for (const rq of ancestorsOrSelf(p, S.pid)) {
              if (before(rq, S.seq).some((R) => isNode(R) && R.argv[1] === runnerFile)) haveR = true;
            }
          }
        }
      }
    }
    const leak = e.envp.some((v) => v.startsWith(`${canaryKey}=`));
    if (!haveB) why.add('no_bwrap_ancestor');
    if (!haveS) why.add('no_capped_scope_ancestor');
    if (!haveR) why.add('no_cap_run_ancestor');
    if (leak) why.add('canary_in_env');
    if (haveR && !leak) capped++;
  }
  return { n: cands.length, capped, why: [...why] };
}

async function measure(r, tag, runs) {
  const gates = [...new Set(SET.sites.map((s) => s.gate))];
  const out = [];
  const dirs = [];
  try {
    const ar = git(['archive', '--format=tar', r]);
    if (ar.status !== 0) die(`git archive ${r}`);
    for (let k = 0; k < runs; k++) {
      const dir = join(SCRATCH, `${r.slice(0, 12)}-${tag}${k}-${randomBytes(4).toString('hex')}`);
      mkdirSync(join(dir, 'tree'), { recursive: true });
      dirs.push(dir);
      const tx = spawnSync('tar', ['-x', '-C', join(dir, 'tree')], { input: ar.stdout });
      if (tx.status !== 0) die(`tar -x for ${r}`);
    }
    const canaryKey = `KUMITATE_CAPROUTE_CANARY_${randomBytes(4).toString('hex').toUpperCase()}`;
    const canaryVal = randomBytes(8).toString('hex');
    for (const gate of gates) {
      // The runs of one gate run concurrently, each in its own tree; gates run one after another.
      const rs = await Promise.all(dirs.map((d, k) => runGate(d, gate, canaryKey, canaryVal, `${tag}${k}`)));
      rs.forEach((g, k) => {
        out[k] ??= {};
        process.stdout.write(`RUN ${gate} ${tag}${k} exit=${g.status} cases=${g.pass}/${g.total} execs=${g.execs.length} resumed=${g.resumed} verdict_pass=${g.verdictPass} fail_lines=${g.failLines}\n`);
        for (const s of SET.sites.filter((x) => x.gate === gate)) {
          out[k][s.id] = { ...judge(g, s, canaryKey), dodge: uncappedDirect(g, gate), execveat: g.execveat, status: g.status,
            pass: g.pass, total: g.total, verdictPass: g.verdictPass, failLines: g.failLines };
        }
      });
    }
    return out;
  } finally {
    for (const d of dirs) rmSync(d, { recursive: true, force: true });
  }
}

const [base] = await measure(SET.base, 'base', 1);
for (const s of SET.sites) {
  const b = base[s.id];
  if (b.status !== 0 || b.total < 1 || b.pass !== b.total || !b.verdictPass || b.n < 1) {
    die(`base run invalid for ${s.id}: status=${b.status} cases=${b.pass}/${b.total} verdict_pass=${b.verdictPass} n=${b.n}`);
  }
}
const tips = await measure(rev, 'rev', RUNS);
let held = 0;
for (const s of SET.sites) {
  const b = base[s.id];
  const why = new Set();
  const per = [];
  for (const t of tips.map((x) => x[s.id])) {
    for (const w of t.why) why.add(w);
    if (t.status !== 0) why.add(`gate_exit=${t.status}`);
    if (t.n < 1) why.add('no_child_exec');
    if (t.n !== b.n) why.add('exec_count_ne_base');
    if (t.capped !== t.n) why.add('uncapped_exec');
    if (t.dodge > 0) why.add(`uncapped_direct_children=${t.dodge}`);
    if (t.execveat > 0) why.add(`execveat=${t.execveat}`);
    if (!t.verdictPass) why.add('no_final_verdict_pass');
    if (t.failLines > 0) why.add(`fail_lines=${t.failLines}`);
    if (t.total < 1 || t.pass !== t.total || t.total < b.total) why.add('selftest_cases_below_base');
    per.push(`${t.capped}/${t.n}`);
  }
  const ok = why.size === 0;
  if (ok) held++;
  process.stdout.write(`SITE ${s.id} gate=${s.gate} label=${ok ? 'ROUTED_HELD' : 'ROUTED_MISS'} capped/n=${per.join(',')} base_n=${b.n} cases=${tips.map((x) => `${x[s.id].pass}/${x[s.id].total}`).join(',')} base_cases=${b.pass}/${b.total} uncapped_direct=${tips.map((x) => x[s.id].dodge).join(',')}${ok ? '' : ` reason=${[...why].join(',')}`}\n`);
}
process.stdout.write(`CAPROUTE48 rev=${rev} base=${SET.base.slice(0, 8)} set=${setName} held=${held}/${SET.sites.length} runs=${RUNS} rule=F48\n`);
process.exit(held === SET.sites.length ? 0 : 1);
