#!/usr/bin/env node
/**
 * control-replay.mjs — round-70 C1 control-replay runner (candidate, seat K70ExecRunner).
 *
 * Replays the two frozen round-69 capability controls (c1-controls.sh / c2-controls.sh)
 * in isolation: the originals are read-only, never executed, never written. Each run
 * generates a versioned private script copy under a unique mkdtemp child of the caller's
 * work root, with LANE/PROBE/W/S substituted exactly once, the known unused fixed
 * temporary write removed, explicit fixture-root git arguments, and a scrubbed
 * repository environment. The counter probe output is captured to a private receipt,
 * copied to --out with exclusive creation, and the child is reclaimed (work root left
 * empty). Frozen source bytes are sha256-pinned and refused on mismatch.
 *
 * Modes (bound to the five frozen controls only, not an arbitrary command runner):
 *   --lane DIR --family c1 --mode donothing|autoledger --out NEWFILE --work DIR
 *   --lane DIR --family c2 --mode donothing|autoorigin|forgecapture --out NEWFILE --work DIR
 *   --selftest   hermetic self-check with stable finding ids and an expected exit map
 *
 * Exit map: 0 control pass; 1 control fail (predicate behaved or live arm unreachable —
 *           failure is reported, never waived); 64 usage; 65 frozen-source/transform
 *           refusal; 70 internal; 73 output already exists (exclusive creation).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const VERSION = 'control-replay 1.0.0 (round-70 candidate, seat K70ExecRunner)';
const SELF = fileURLToPath(import.meta.url);
const EXIT = { OK: 0, CONTROL_FAIL: 1, USAGE: 64, SOURCE: 65, INTERNAL: 70, CANTCREAT: 73 };
const PROBE_DIR = '.ufo/waves/round-69/probe';
const CHILD_TAG = 'control-replay-';
const RUN_TIMEOUT_MS = 299000;

// Frozen round-69 control sources (read-only; pinned full-source sha256, plan §C1).
const FROZEN = {
  c1: { file: 'c1-controls.sh', sha256: '01efd6dde4c987b676b1930f647cc283768e1ae8113fd076b313e54b56aeda12', probe: 'ledger69-probe.mjs', receipt: 'c1' },
  c2: { file: 'c2-controls.sh', sha256: '679b7d9619ab8d79139cfe8e956e425f7ccbbf7e58b6eaee5cb72c3deb3a66f4', probe: 'deprec69-probe.mjs', receipt: 'c2' },
};
const FAMILIES = { c1: ['donothing', 'autoledger'], c2: ['donothing', 'autoorigin', 'forgecapture'] };

// Repository/tooling environment scrubbed before the private bash child runs: the
// counter probes refuse a poisoned env, and inherited git state must not redirect the
// fixture's fresh git repository.
const SCRUB = [
  'GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_OBJECT_DIRECTORY', 'GIT_COMMON_DIR',
  'GIT_ALTERNATE_OBJECT_DIRECTORIES', 'GIT_NAMESPACE', 'GIT_QUARANTINE_PATH', 'GIT_PREFIX',
  'GIT_CEILING_DIRECTORIES', 'GIT_AUTHOR_NAME', 'GIT_AUTHOR_EMAIL', 'GIT_AUTHOR_DATE',
  'GIT_COMMITTER_NAME', 'GIT_COMMITTER_EMAIL', 'GIT_COMMITTER_DATE',
  'GIT_CONFIG_GLOBAL', 'GIT_CONFIG_SYSTEM', 'GIT_CONFIG_COUNT',
  'TAR_OPTIONS', 'NODE_OPTIONS', 'LD_PRELOAD',
];

const sha256 = (b) => crypto.createHash('sha256').update(b).digest('hex');
const count = (text, pat) => text.split(pat).length - 1;
const lines = (...ls) => ls.join('\n');

/** substitute `pat` -> `rep` exactly once; refuse otherwise (pinned transform) */
function subOnce(text, pat, rep, id) {
  const n = count(text, pat);
  if (n !== 1) throw Object.assign(new Error(`${id}: pattern occurrence=${n} (want 1)`), { code: EXIT.SOURCE });
  return text.replace(pat, rep);
}
/** remove `pat` exactly once */
function cutOnce(text, pat, id) {
  const n = count(text, pat);
  if (n !== 1) throw Object.assign(new Error(`${id}: cut occurrence=${n} (want 1)`), { code: EXIT.SOURCE });
  return text.replace(pat, '');
}
/** bash single-quote */
const shQ = (s) => `'${String(s).replace(/'/g, `'\"'\"'`)}'`;
/** bash double-quote */
const shDQ = (s) => `"${String(s).replace(/[\\`"$]/g, (c) => '\\' + c)}"`;

function usage() {
  return [
    'usage:',
    '  control-replay.mjs --lane DIR --family c1|c2 --mode MODE --out NEWFILE --work DIR',
    '  control-replay.mjs --selftest',
    `modes: c1: ${FAMILIES.c1.join('|')}; c2: ${FAMILIES.c2.join('|')}`,
  ].join('\n');
}

function parseArgs(argv) {
  if (argv.length === 1 && argv[0] === '--selftest') return { selftest: true };
  if (argv.includes('--selftest')) return { error: EXIT.USAGE, why: '--selftest takes no other flags' };
  const out = {};
  const bad = [];
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    let m = /^--(lane|family|mode|out|work)$/.exec(a);
    if (m) { const v = argv[i + 1]; if (v === undefined || v.startsWith('--')) { bad.push(a); break; } out[m[1]] = v; i += 1; continue; }
    m = /^--(lane|family|mode|out|work)=(.*)$/.exec(a);
    if (m) { out[m[1]] = m[2]; continue; }
    bad.push(a);
  }
  for (const f of ['lane', 'family', 'mode', 'out', 'work']) {
    if (out[f] === undefined || out[f] === '') return { error: EXIT.USAGE, why: `missing --${f}` };
  }
  if (bad.length) return { error: EXIT.USAGE, why: `unexpected argument: ${bad[0]}` };
  if (!Object.hasOwn(FAMILIES, out.family)) return { error: EXIT.USAGE, why: `unknown family: ${out.family}` };
  if (!FAMILIES[out.family].includes(out.mode)) return { error: EXIT.USAGE, why: `unknown mode for ${out.family}: ${out.mode}` };
  return out;
}

/** read and pin-check the frozen control sources under the lane */
function loadFrozen(lane, family) {
  const meta = FROZEN[family];
  const file = path.join(lane, PROBE_DIR, meta.file);
  let bytes;
  try { bytes = fs.readFileSync(file); } catch { throw Object.assign(new Error(`frozen-source-unreadable: ${file}`), { code: EXIT.SOURCE }); }
  const got = sha256(bytes);
  if (got !== meta.sha256) throw Object.assign(new Error(`frozen-source-sha-mismatch: ${meta.file} got=${got} want=${meta.sha256}`), { code: EXIT.SOURCE });
  return { meta, text: bytes.toString('utf8') };
}

/** pinned source transforms: versioned private copy of one frozen control */
function buildPrivate(family, lane, child, sourceText) {
  const meta = FROZEN[family];
  const shebang = '#!/usr/bin/env bash\n';
  let t = cutOnce(sourceText, shebang, `${family}:shebang`);
  const header = lines(
    shebang.trimEnd(),
    `# control-replay private copy v1 — ${VERSION}`,
    `# generated from ${meta.file} (sha256 ${meta.sha256}); do not edit`,
    `CHILD=${shQ(child)}`,
    'export CHILD',
    '',
  );
  t = subOnce(t, `LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin`, `LANE=${shQ(lane)}`, `${family}:lane`);
  t = subOnce(t, `PROBE="$LANE/.ufo/waves/round-69/probe/${meta.probe}"`, `PROBE=${shDQ(`${lane}/${PROBE_DIR}/${meta.probe}`)}`, `${family}:probe`);
  t = subOnce(t, 'W="$LANE/.ufo/waves/round-69/controls"', 'W="$CHILD/receipts"', `${family}:work`);
  t = subOnce(t, `S="\${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69/${family}-controls-$MODE"`, `S="$CHILD/scratch/${family}-$MODE"`, `${family}:scratch`);
  for (const [pat, rep, id] of [
    ['git init -q', 'git -C "$S/fx" init -q', `${family}:git-init`],
    ['git add -A', 'git -C "$S/fx" add -A', `${family}:git-add`],
    ['git -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify',
      'git -C "$S/fx" -c user.name=ctl -c user.email=ctl@invalid -c commit.gpgsign=false commit -q --no-verify', `${family}:git-commit`],
    ['REV=$(git rev-parse HEAD)', 'REV=$(git -C "$S/fx" rev-parse HEAD)', `${family}:git-rev`],
    ['TMPDIR="${HYAKU_SCRATCH:-/fast/scratch/hyaku}/kumitate-r69" node ', 'TMPDIR="$CHILD/tmp" node ', `${family}:tmpdir`],
  ]) t = subOnce(t, pat, rep, id);

  if (family === 'c2') {
    // the known unused fixed temporary write (r69 c2 line 80) — removed, not relocated
    t = cutOnce(t, `    printf '%s\\n' '- S207 — capture 2026-10-30 — pinned' > /tmp/forge-sed.txt\n`, 'c2:tmp-write');
    t = subOnce(t, lines(
      'cat "$W/c2-$MODE.txt"',
      'case "$(head -1 "$W/c2-$MODE.txt")" in',
      '  DEPREC69_UNMET*)',
      '    [ "$RC" = 1 ] || { echo "CONTROL-FAIL $MODE (exit $RC)"; exit 1; }',
      `    if [ "$MODE" = forgecapture ] && ! grep -q 'S210:origin-sha-mismatch' "$W/c2-$MODE.txt"; then`,
      '      echo "CONTROL-FAIL $MODE (the digest arm did not bite)"; exit 1',
      '    fi',
      '    echo "CONTROL-PASS $MODE"; exit 0 ;;',
      'esac',
      'echo "CONTROL-FAIL $MODE"',
      'exit 1',
    ), lines(
      'cat "$W/c2-$MODE.txt"',
      'case "$(head -1 "$W/c2-$MODE.txt")" in',
      '  DEPREC69_UNMET*)',
      '    [ "$RC" = 1 ] || { echo "CONTROL-FAIL $MODE (exit $RC)" | tee -a "$W/c2-$MODE.txt"; exit 1; }',
      `    if [ "$MODE" = forgecapture ] && ! grep -q 'S210:origin-sha-mismatch' "$W/c2-$MODE.txt"; then`,
      '      echo "CONTROL-FAIL $MODE (the digest arm did not bite)" | tee -a "$W/c2-$MODE.txt"; exit 1',
      '    fi',
      '    echo "CONTROL-PASS $MODE" | tee -a "$W/c2-$MODE.txt"; exit 0 ;;',
      'esac',
      'echo "CONTROL-FAIL $MODE" | tee -a "$W/c2-$MODE.txt"',
      'exit 1',
    ), 'c2:tail');
  } else {
    t = subOnce(t, lines(
      'cat "$W/c1-$MODE.txt"',
      'case "$(head -1 "$W/c1-$MODE.txt")" in',
      '  LEDGER69_UNMET*) [ "$RC" = 1 ] && { echo "CONTROL-PASS $MODE"; exit 0; } ;;',
      'esac',
      'echo "CONTROL-FAIL $MODE"',
      'exit 1',
    ), lines(
      'cat "$W/c1-$MODE.txt"',
      'case "$(head -1 "$W/c1-$MODE.txt")" in',
      '  LEDGER69_UNMET*) [ "$RC" = 1 ] && { echo "CONTROL-PASS $MODE" | tee -a "$W/c1-$MODE.txt"; exit 0; } ;;',
      'esac',
      'echo "CONTROL-FAIL $MODE" | tee -a "$W/c1-$MODE.txt"',
      'exit 1',
    ), 'c1:tail');
  }
  return header + t;
}

function scrubbedEnv(extra = {}) {
  const env = { ...process.env };
  for (const k of SCRUB) {
    delete env[k];
  }
  for (const [k, v] of Object.entries(process.env)) {
    if (/^GIT_CONFIG_(KEY|VALUE)_/.test(k)) delete env[k];
  }
  return Object.assign(env, extra);
}

/**
 * Run the private control copy in its own process group (detached). On timeout the
 * whole group is SIGKILLed — the frozen probes spawn long-lived grandchildren that
 * would otherwise be orphaned and keep recreating files inside the reclaimed child.
 */
function runBashGroup(script, mode, child, timeoutMs) {
  return new Promise((resolve) => {
    const p = spawn('bash', [script, mode], {
      cwd: child,
      env: scrubbedEnv({ TMPDIR: path.join(child, 'tmp') }),
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = ''; let stderr = ''; let timedOut = false; let settled = false;
    const timer = setTimeout(() => {
      timedOut = true;
      try { process.kill(-p.pid, 'SIGKILL'); } catch { /* already gone */ }
    }, timeoutMs);
    const finish = (r) => { if (!settled) { settled = true; clearTimeout(timer); resolve(r); } };
    p.stdout.on('data', (d) => { stdout += d; if (stdout.length > 16 * 1024 * 1024) p.stdout.destroy(); });
    p.stderr.on('data', (d) => { stderr += d; if (stderr.length > 16 * 1024 * 1024) p.stderr.destroy(); });
    p.on('error', (e) => finish({ error: e, stdout, stderr, status: null, timedOut }));
    p.on('close', (code, signal) => finish({ status: timedOut ? null : code, signal, stdout, stderr, timedOut }));
  });
}

/** one isolated replay run; returns the process exit code (writes --out, reclaims child) */
async function runControl({ lane, family, mode, out, work }) {
  let source;
  try { source = loadFrozen(lane, family); } catch (e) { process.stderr.write(`${e.message}\n${usage()}\n`); return e.code ?? EXIT.SOURCE; }
  let script;
  try { script = buildPrivate(family, lane, path.join(work, CHILD_TAG + 'pending'), source.text); }
  catch (e) { process.stderr.write(`${e.message}\n`); return e.code ?? EXIT.SOURCE; }
  if (!fs.existsSync(work) || !fs.statSync(work).isDirectory()) {
    process.stderr.write(`work root is not an existing directory: ${work}\n`); return EXIT.USAGE;
  }
  let fd;
  try { fd = fs.openSync(out, 'wx'); }
  catch { process.stderr.write(`refusing to overwrite existing output: ${out}\n`); return EXIT.CANTCREAT; }
  const child = fs.mkdtempSync(path.join(work, CHILD_TAG));
  try {
    script = buildPrivate(family, lane, child, source.text);
    const priv = path.join(child, `private-${family}-${mode}.sh`);
    fs.writeFileSync(priv, script, { mode: 0o700 });
    fs.mkdirSync(path.join(child, 'receipts'));
    fs.mkdirSync(path.join(child, 'tmp'));
    fs.mkdirSync(path.join(child, 'scratch'));
    const r = await runBashGroup(priv, mode, child, RUN_TIMEOUT_MS);
    const receiptPath = path.join(child, 'receipts', `${FROZEN[family].receipt}-${mode}.txt`);
    let receipt;
    if (fs.existsSync(receiptPath) && fs.statSync(receiptPath).size > 0) receipt = fs.readFileSync(receiptPath);
    else {
      const why = r.error ? `spawn=${r.error.message}` : `status=${r.status === null ? 'timeout' : r.status}`;
      receipt = Buffer.from([
        `CONTROL-REPLAY-ERROR family=${family} mode=${mode} ${why}`,
        '--- private stdout ---', r.stdout ?? '', '--- private stderr ---', r.stderr ?? '',
      ].join('\n'));
    }
    fs.writeSync(fd, receipt);
    fs.fsyncSync(fd);
    fs.closeSync(fd); fd = null;
    if (r.error || r.status === null) return EXIT.INTERNAL;
    return r.status;
  } catch (e) {
    try { if (fd !== null) { fs.writeSync(fd, `CONTROL-REPLAY-ERROR ${e.message}\n`); fs.closeSync(fd); fd = null; } } catch { /* best effort */ }
    process.stderr.write(`control-replay internal: ${e.message}\n`);
    return EXIT.INTERNAL;
  } finally {
    try { if (fd !== null) fs.closeSync(fd); } catch { /* ignore */ }
    fs.rmSync(child, { recursive: true, force: true });
  }
}

// ---------------- selftest (hermetic: private TMPDIR child, no network, no lane writes) ----------------

function findLaneRoot() {
  const cands = [];
  if (process.env.REPLAY70_LANE) cands.push(process.env.REPLAY70_LANE);
  cands.push(process.cwd(), path.dirname(SELF), path.dirname(path.dirname(SELF)));
  for (const c of cands) {
    try {
      const p = path.join(c, PROBE_DIR, 'c1-controls.sh');
      if (fs.existsSync(p) && sha256(fs.readFileSync(p)) === FROZEN.c1.sha256) return c;
    } catch { /* try next */ }
  }
  return null;
}

function selftest() {
  const root = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'control-replay-selftest-'));
  const results = [];
  const caseDir = (id) => { const d = path.join(root, id); fs.mkdirSync(d, { recursive: true }); return d; };
  const sub = (args, opts = {}) => spawnSync(process.execPath, [SELF, ...args], { encoding: 'utf8', timeout: RUN_TIMEOUT_MS, ...opts });
  const record = (id, expect, obs, note = '') => { results.push({ id, expect, obs, ok: obs === expect, note }); };

  try {
    // ST01–ST04: argument contract (no lane needed)
    {
      const d = caseDir('ST01'); const r = sub([]);
      record('ST01-no-args', EXIT.USAGE, r.status === null ? -1 : r.status);
    }
    {
      const lane = findLaneRoot() || process.cwd();
      const d = caseDir('ST02');
      const r = sub(['--lane', lane, '--family', 'junk', '--mode', 'donothing', '--out', path.join(d, 'o'), '--work', d]);
      record('ST02-bad-family', EXIT.USAGE, r.status === null ? -1 : r.status);
    }
    {
      const lane = findLaneRoot() || process.cwd();
      const d = caseDir('ST03');
      const r = sub(['--lane', lane, '--family', 'c1', '--mode', 'bogus', '--out', path.join(d, 'o'), '--work', d]);
      record('ST03-bad-mode', EXIT.USAGE, r.status === null ? -1 : r.status);
    }
    {
      const r = sub(['--selftest', '--family', 'c1']);
      record('ST04-selftest-mixed', EXIT.USAGE, r.status === null ? -1 : r.status);
    }

    const lane = findLaneRoot();
    if (!lane) {
      for (const id of ['ST05-tamper-refused', 'ST06-transform-once', 'ST07-out-exclusive', 'ST08-private-syntax', 'ST09-c2-transform-static']) {
        results.push({ id, expect: null, obs: null, ok: true, note: 'SKIP: frozen sources not resolvable' });
      }
    } else {
      // ST05: tampered frozen source is refused
      {
        const d = caseDir('ST05/fake-lane');
        fs.mkdirSync(path.join(d, PROBE_DIR), { recursive: true });
        const b = fs.readFileSync(path.join(lane, PROBE_DIR, 'c1-controls.sh'));
        b[b.length - 3] = b[b.length - 3] === 0x61 ? 0x62 : 0x61;
        fs.writeFileSync(path.join(d, PROBE_DIR, 'c1-controls.sh'), b);
        const w = caseDir('ST05/work'); const r = sub(['--lane', d, '--family', 'c1', '--mode', 'donothing', '--out', path.join(caseDir('ST05'), 'o'), '--work', w]);
        record('ST05-tamper-refused', EXIT.SOURCE, r.status === null ? -1 : r.status);
      }
      // ST06: transforms are exactly-once (second application refuses)
      {
        const { text } = loadFrozen(lane, 'c1');
        const once = buildPrivate('c1', lane, path.join(root, 'ST06-child'), text);
        let threw = false;
        try { buildPrivate('c1', lane, path.join(root, 'ST06-child'), once); } catch (e) { threw = e.code === EXIT.SOURCE; }
        record('ST06-transform-once', true, threw);
      }
      // ST07: existing output refused, bytes unchanged
      {
        const d = caseDir('ST07'); const outF = path.join(d, 'existing.txt');
        fs.writeFileSync(outF, 'do-not-overwrite\n');
        const w = path.join(d, 'work'); fs.mkdirSync(w);
        const r = sub(['--lane', lane, '--family', 'c1', '--mode', 'donothing', '--out', outF, '--work', w]);
        const intact = fs.readFileSync(outF, 'utf8') === 'do-not-overwrite\n';
        record('ST07-out-exclusive', EXIT.CANTCREAT, r.status === null ? -1 : r.status, intact ? 'out intact' : 'OUT MODIFIED');
        results[results.length - 1].ok = results[results.length - 1].ok && intact;
      }
      // ST08: every (family, mode) private copy generates and passes `bash -n` (offline)
      {
        let allOk = true; const det = [];
        for (const fam of Object.keys(FAMILIES)) {
          const { text } = loadFrozen(lane, fam);
          for (const m of FAMILIES[fam]) {
            const priv = path.join(root, `ST08-${fam}-${m}.sh`);
            fs.writeFileSync(priv, buildPrivate(fam, lane, path.join(root, `ST08-${fam}-${m}-child`), text), { mode: 0o700 });
            const n = spawnSync('bash', ['-n', priv], { encoding: 'utf8' });
            const marker = `"$W/${FROZEN[fam].receipt}-$MODE.txt"`;
            const sane = n.status === 0 && fs.readFileSync(priv, 'utf8').includes(marker);
            allOk = allOk && sane; det.push(`${fam}/${m}:${sane ? 'ok' : `BAD(status=${n.status},${(n.stderr || '').slice(0, 80)})`}`);
          }
        }
        record('ST08-private-syntax', true, allOk, det.join(' '));
      }
      // ST09: c2 pinned transforms applied exactly (static, offline)
      {
        const { text } = loadFrozen(lane, 'c2');
        const priv = buildPrivate('c2', lane, path.join(root, 'ST09-child'), text);
        const okStatic = !priv.includes('/tmp/forge-sed.txt')
          && !priv.includes('HYAKU_SCRATCH')
          && count(priv, 'git -C "$S/fx"') === 4
          && count(priv, 'git -C "$LANE" archive 14057f3e3899180c95713bace088fb9c0d0046e3') === 1
          && count(priv, 'TMPDIR="$CHILD/tmp" node ') === 1
          && count(priv, 'tee -a "$W/c2-$MODE.txt"') === 4
          && priv.includes('probe/deprec69-probe.mjs');
        record('ST09-c2-transform-static', true, okStatic);
      }
    }

    const map = results.map((r) => `${r.id} expect=${r.expect === null ? 'SKIP' : r.expect} observed=${r.obs === null ? 'SKIP' : r.obs} ${r.ok ? 'ok' : 'FAIL'}${r.note ? ` ${r.note}` : ''}`);
    const allOk = results.every((r) => r.ok);
    console.log(`CONTROL_REPLAY_SELFTEST: ${allOk ? 'PASS' : 'FAIL'} cases=${results.length} ok=${results.filter((r) => r.ok).length}`);
    for (const l of map) console.log(l);
    return allOk ? EXIT.OK : EXIT.CONTROL_FAIL;
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

// ---------------- entry ----------------
const parsed = parseArgs(process.argv.slice(2));
if (parsed.selftest) process.exitCode = selftest();
else if (parsed.error !== undefined) { process.stderr.write(`${parsed.why}\n${usage()}\n`); process.exitCode = parsed.error; }
else runControl(parsed).then((code) => { process.exitCode = code; });
