#!/usr/bin/env node
// K70ProbeTransformCount — isolated executable probe.
// Axis: zero / multiple occurrence of an exact replacement needle MUST REJECT
// against the round-70 replay implementation contract (plan.md "Implementation
// contract": "substitute LANE/PROBE/W/S assignments exactly once ... remove the
// known unused fixed temporary write ... Refuse unexpected frozen source bytes").
//
// Status: MECHANISM-ONLY. No candidate scripts/control-replay.mjs exists in the
// lane and build/K70ExecRunner/ is absent, so candidate verification is impossible.
// The probe therefore (a) encodes the contract transform stage as a fail-closed
// REFERENCE implementation and executes a per-case matrix as real subprocesses
// against the REAL frozen bytes (read-only via `git -C LANE show`), and
// (b) exercises the needle-count guard inside two AVAILABLE sibling drafts
// (K70ExecTransform/transform.mjs via digests-patched private copies;
//  K70ExecFixtureTests/mock via pins-patched private copies on synthetic fixtures).
//
// Hard rules honoured here: the frozen originals c1/c2-controls.sh are NEVER
// executed (not even copies — this probe performs text transforms only and, for
// the mock check, executes only the sibling's SYNTHETIC pinned fixtures, never
// the frozen r69 scripts). No writes outside --build and --scratch.
//
// Usage:
//   node probe-transform-count.mjs ref-xform --family c1|c2 --src FILE --out FILE
//       reference transform; exit 0 accept / 65 ZERO|MULTI|REPL refusal / 64 usage.
//   node probe-transform-count.mjs run --lane LANE --build BUILD --scratch SCR
//       [--draft-dir DIR] [--mock-dir DIR --mockfx-dir DIR]
//       full matrix; receipts written under BUILD; exit 0 iff every case passes.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const count = (s, n) => s.split(n).length - 1;
const SEAT = 'K70ProbeTransformCount';

// ---------- needle derivation (exact observed line + '\n') ----------
const DERIVERS = {
  LANE: (fam) => [/^LANE=\/.+$/],
  PROBE: (fam) => [new RegExp(`^PROBE="\\$LANE/\\.ufo/waves/round-69/probe/${fam === 'c1' ? 'ledger69' : 'deprec69'}-probe\\.mjs"$`)],
  W: () => [/^W="\$LANE\/\.ufo\/waves\/round-69\/controls"$/],
  S: (fam) => [new RegExp(`^S="\\$\\{HYAKU_SCRATCH:-/fast/scratch/hyaku\\}/kumitate-r69/${fam}-controls-\\$MODE"$`)],
  TMP: () => [/^ {4}printf '%s\\n' '.*' > \/tmp\/forge-sed\.txt$/],
};
const NEEDLE_IDS = ['LANE', 'PROBE', 'W', 'S'];

function deriveNeedles(src, family) {
  const lines = src.split('\n');
  const subs = [];
  for (const id of NEEDLE_IDS) {
    const res = DERIVERS[id](family);
    const hits = lines.filter((l) => res.some((re) => re.test(l)));
    if (hits.length !== 1) return { error: `anchor ${family}:${id} derived ${hits.length} lines (probe mis-anchored)` };
    subs.push({ id, needle: hits[0] + '\n', line: hits[0] });
  }
  if (family === 'c2') {
    const res = DERIVERS.TMP()[0];
    const hits = lines.filter((l) => res.test(l));
    if (hits.length !== 1) return { error: `anchor c2:TMP derived ${hits.length} lines` };
    subs.push({ id: 'TMP', needle: hits[0] + '\n', line: hits[0] });
  }
  return { subs };
}

function subsRef(subs, family, priv) {
  return subs.map((s) => {
    let repl;
    if (s.id === 'LANE') repl = `LANE=${priv}/private-lane\n`;
    else if (s.id === 'PROBE') repl = `PROBE=${priv}/private-probe/${family}-probe.mjs\n`;
    else if (s.id === 'W') repl = `W=${priv}/private-w-${family}\n`;
    else if (s.id === 'S') repl = `S=${priv}/private-s-${family}-$MODE\n`;
    else repl = ''; // TMP removal
    return { ...s, repl };
  });
}

// ---------- reference transform (fail-closed) ----------
// subs: needles derived from the PRISTINE frozen bytes; src: the input under test.
function refTransformWith(subs, src, family) {
  let t = src;
  for (const { id, needle, repl } of subs) {
    const n = count(t, needle);
    if (n === 0) return { ok: false, code: 'ZERO', msg: `ZERO ${family}:${id} exact needle count 0 != 1: ${JSON.stringify(needle.slice(0, 64))}` };
    if (n > 1) return { ok: false, code: 'MULTI', msg: `MULTI ${family}:${id} exact needle count ${n} != 1: ${JSON.stringify(needle.slice(0, 64))}` };
    t = t.replace(needle, repl);
  }
  for (const { id, needle, repl } of subs) {
    if (t.includes(needle)) return { ok: false, code: 'REPL', msg: `REPL ${family}:${id} needle survives substitution` };
    if (repl !== '' && count(t, repl) !== 1) return { ok: false, code: 'REPL', msg: `REPL ${family}:${id} replacement count ${count(t, repl)} != 1` };
    if (repl === '' && count(t, needle) !== 0) return { ok: false, code: 'REPL', msg: `REPL ${family}:${id} removal incomplete` };
  }
  if (family === 'c2' && t.includes('/tmp/forge-sed.txt')) return { ok: false, code: 'REPL', msg: 'REPL c2:TMP /tmp/forge-sed.txt remnant' };
  return { ok: true, text: t };
}

// ---------- CLI: reference transform ----------
// Needles are ALWAYS derived from the pristine frozen bytes (--frozen); the exact
// needle count is then computed against --src (which may be a drifted variant).
function cliRefXform(argv) {
  let family, src, out, frozenFile, priv;
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i], v = argv[i + 1];
    if (k === '--family') family = v;
    else if (k === '--src') src = v;
    else if (k === '--out') out = v;
    else if (k === '--frozen') frozenFile = v;
    else if (k === '--priv') priv = v;
    else { process.stderr.write('usage: ref-xform --family c1|c2 --frozen FILE --src FILE --out FILE --priv DIR\n'); process.exit(64); }
  }
  if (!family || !src || !out || !frozenFile || !priv || !['c1', 'c2'].includes(family)) {
    process.stderr.write('usage: ref-xform --family c1|c2 --frozen FILE --src FILE --out FILE --priv DIR\n'); process.exit(64);
  }
  let frozenBytes, bytes;
  try { frozenBytes = fs.readFileSync(frozenFile, 'utf8'); } catch (e) {
    process.stderr.write(`ANCHOR ${family}:FROZEN unreadable: ${e.message}\n`); process.exit(2);
  }
  const d = deriveNeedles(frozenBytes, family);
  if (d.error) { process.stderr.write(`ANCHOR ${d.error}\n`); process.exit(2); }
  try { bytes = fs.readFileSync(src, 'utf8'); } catch (e) {
    process.stderr.write(`ZERO ${family}:SRC unreadable: ${e.message}\n`); process.exit(65);
  }
  const r = refTransformWith(subsRef(d.subs, family, priv), bytes, family);
  if (!r.ok) { process.stderr.write(r.msg + '\n'); process.exit(r.code === 'ANCHOR' ? 2 : 65); }
  fs.writeFileSync(out, r.text, { mode: 0o700 });
  process.exit(0);
}

// ---------- variant builders (all text-level; never executed) ----------
function buildVariant(src, sub, kind) {
  const { needle, line, id } = sub;
  if (kind === 'zero') return src.replace(needle, '');
  if (kind === 'multi') return src.replace(needle, `# drift duplicate injected by ${SEAT}: ${line}\n${needle}`);
  if (kind === 'multi3') return src.replace(needle, `# drift dup A: ${line}\n# drift dup B: ${line}\n${needle}`);
  if (kind === 'nearspace') return src.replace(needle, line + ' \n');
  if (kind === 'nearunquoted') return src.replace(needle, line.replace('W="$LANE', 'W=$LANE').replace('controls"$', 'controls') + '\n');
  if (kind === 'idempotent') return src; // src is already a generated output
  throw new Error('unknown kind ' + kind);
}

// naive first-match baseline: no count, no pin, silent no-op on miss (the defended-against mode)
function naiveTransform(src, family, priv) {
  const d = deriveNeedles(src, family);
  if (d.error) return { ok: false, reason: d.error };
  let t = src;
  for (const s of subsRef(d.subs, family, priv)) t = t.replace(s.needle, s.repl); // first match only, no count
  return { ok: true, text: t };
}

// ---------- driver ----------
function run(argv) {
  const opts = {};
  for (let i = 0; i < argv.length; i += 2) opts[argv[i].slice(2)] = argv[i + 1];
  const { lane, build, scratch } = opts;
  if (!lane || !build || !scratch) { process.stderr.write('usage: run --lane LANE --build BUILD --scratch SCR [--draft-dir D] [--mock-dir M --mockfx-dir F]\n'); process.exit(64); }
  fs.mkdirSync(build, { recursive: true });
  fs.mkdirSync(scratch, { recursive: true });
  const env = { ...process.env, TMPDIR: scratch };
  const REV = '78b98d762ccf3e3a0961f94c4042eaabd2bcb706';
  const rows = [];
  const cmdlog = [];
  const logcmd = (c) => cmdlog.push(c);

  const frozen = {};
  for (const fam of ['c1', 'c2']) {
    const p = `.ufo/waves/round-69/probe/${fam}-controls.sh`;
    const g = spawnSync('git', ['-C', lane, 'show', `${REV}:${p}`], { encoding: 'utf8' });
    if (g.status !== 0) { process.stderr.write('frozen read failed: ' + g.stderr); process.exit(2); }
    frozen[fam] = g.stdout;
  }
  const deriv = {};
  for (const fam of ['c1', 'c2']) {
    deriv[fam] = deriveNeedles(frozen[fam], fam);
    if (deriv[fam].error) { process.stderr.write(deriv[fam].error + '\n'); process.exit(2); }
  }

  const self = new URL(import.meta.url).pathname;
  // pristine frozen fixtures on disk (needles are always derived from THESE)
  const frozenF = {};
  for (const fam of ['c1', 'c2']) {
    frozenF[fam] = path.join(scratch, `frozen-${fam}-controls.sh`);
    fs.writeFileSync(frozenF[fam], frozen[fam]);
  }
  const privRoot = path.join(scratch, 'priv-root');
  const subsOf = (fam) => subsRef(deriv[fam].subs, fam, privRoot);

  const cases = [];
  for (const fam of ['c1', 'c2']) {
    cases.push({ fam, name: 'ACCEPT-frozen', kind: 'accept' });
    for (const id of NEEDLE_IDS) cases.push({ fam, name: `ZERO-${id}`, kind: 'refuse', expect: 'ZERO', vkind: 'zero', id });
    for (const id of NEEDLE_IDS) cases.push({ fam, name: `MULTI-${id}`, kind: 'refuse', expect: 'MULTI', vkind: 'multi', id });
    cases.push({ fam, name: 'MULTI3-S', kind: 'refuse', expect: 'MULTI', vkind: 'multi3', id: 'S' });
    cases.push({ fam, name: 'NEARSPACE-W', kind: 'refuse', expect: 'ZERO', vkind: 'nearspace', id: 'W' });
    cases.push({ fam, name: 'NEARUNQUOTED-W', kind: 'refuse', expect: 'ZERO', vkind: 'nearunquoted', id: 'W' });
    cases.push({ fam, name: 'IDEMPOTENT-regen', kind: 'refuse', expect: 'ZERO', vkind: 'idempotent', id: 'LANE', fromAccept: fam });
  }

  for (const c of cases) {
    const dir = path.join(scratch, 'cases', `${c.fam}-${c.name}`);
    fs.mkdirSync(dir, { recursive: true });
    let src = frozen[c.fam];
    if (c.fromAccept) {
      src = fs.readFileSync(path.join(scratch, 'cases', `${c.fam}-ACCEPT-frozen`, 'out.txt'), 'utf8');
    } else if (c.vkind) {
      const sub = subsOf(c.fam).find((s) => s.id === c.id);
      src = buildVariant(src, sub, c.vkind);
    }
    const srcF = path.join(dir, 'src.sh');
    fs.writeFileSync(srcF, src);
    const outF = path.join(dir, 'out.txt');
    const xargs = [self, 'ref-xform', '--family', c.fam, '--frozen', frozenF[c.fam], '--src', srcF, '--out', outF, '--priv', privRoot];
    logcmd('node ' + xargs.join(' '));
    const r = spawnSync(process.execPath, xargs, { encoding: 'utf8', env });
    const outCreated = fs.existsSync(outF);
    let invariants = '-';
    if (c.kind === 'accept') {
      const text = outCreated ? fs.readFileSync(outF, 'utf8') : '';
      const bad = [];
      for (const s of subsOf(c.fam)) {
        if (text.includes(s.needle)) bad.push(`${s.id}-survives`);
        if (s.repl !== '' && count(text, s.repl) !== 1) bad.push(`${s.id}-replcount-${count(text, s.repl)}`);
      }
      if (c.fam === 'c2' && text.includes('/tmp/forge-sed.txt')) bad.push('tmp-survives');
      invariants = bad.length ? 'BROKEN:' + bad.join(',') : 'ok';
      const pass = r.status === 0 && outCreated && invariants === 'ok';
      rows.push({ case: `${c.fam}/${c.name}`, expected: 'accept exit=0', observed: `exit=${r.status} out=${outCreated} inv=${invariants}`, verdict: pass ? 'PASS' : 'FAIL', stderr: r.stderr.trim() });
    } else {
      const idOk = r.stderr.trim().startsWith(c.expect + ' ');
      const pass = r.status === 65 && r.status !== 64 && !outCreated && idOk;
      rows.push({ case: `${c.fam}/${c.name}`, expected: `refuse exit=65 id=${c.expect} no-out`, observed: `exit=${r.status} out=${outCreated} id=${r.stderr.trim().slice(0, 72)}`, verdict: pass ? 'PASS' : 'FAIL', stderr: '' });
    }
  }

  // naive baseline (informational): defended-against failure mode
  for (const fam of ['c1', 'c2']) {
    const sub = subsOf(fam).find((s) => s.id === 'W');
    const variant = buildVariant(frozen[fam], sub, 'multi');
    const n = naiveTransform(variant, fam, privRoot);
    if (n.ok) {
      const realLineFrozen = n.text.includes(sub.needle); // real assignment line untouched (first match was the comment)
      rows.push({ case: `${fam}/NAIVE-BASELINE-MULTI-W`, expected: 'informational', observed: `naive accepts exit=0 real-W-line-frozen=${realLineFrozen}`, verdict: 'INFO', stderr: 'defended-against mode: count-guard refusal prevents this frozen-write acceptance' });
    } else {
      rows.push({ case: `${fam}/NAIVE-BASELINE-MULTI-W`, expected: 'informational', observed: `naive error ${n.reason}`, verdict: 'INFO', stderr: '' });
    }
  }

  // ---------- sibling draft check: K70ExecTransform/transform.mjs ----------
  const draftDir = opts['draft-dir'];
  if (draftDir) {
    const d = (name) => path.join(draftDir, name);
    if (fs.existsSync(d('transform.mjs')) && fs.existsSync(d('frozen-digests.json'))) {
      const wd = path.join(scratch, 'draft'); fs.mkdirSync(wd, { recursive: true });
      fs.copyFileSync(d('transform.mjs'), path.join(wd, 'transform.mjs'));
      fs.copyFileSync(d('frozen-digests.json'), path.join(wd, 'frozen-digests.json'));
      logcmd(`node ${path.join(wd, 'transform.mjs')} generate  (cwd=${wd}, digests unpatched)`);
      const r1 = spawnSync(process.execPath, [path.join(wd, 'transform.mjs'), 'generate'], { encoding: 'utf8', env: { ...env, cwd: wd }, cwd: wd });
      const privDir = path.join(wd, 'private');
      // Draft-specific invariants: PROBE is an intentional identitySub (probe stays in the lane,
      // executed read-only); W/S move private; no frozen-output-dir or /tmp remnant.
      const draftBad = [];
      if (fs.existsSync(privDir)) {
        for (const f of fs.readdirSync(privDir)) {
          const text = fs.readFileSync(path.join(privDir, f), 'utf8');
          if (text.includes('.ufo/waves/round-69/controls')) draftBad.push(`${f}:frozen-outdir-remnant`);
          if (f.startsWith('c2') && (text.includes('/tmp/') || text.includes('forge-sed'))) draftBad.push(`${f}:tmp-remnant`);
          if (!text.includes('W="$S/w"')) draftBad.push(`${f}:W-not-private`);
          if (!text.includes('PROBE="$LANE/.ufo/waves/round-69/probe/')) draftBad.push(`${f}:PROBE-identity-lost`);
        }
      }
      rows.push({ case: 'DRAFT/D1-frozen-generate', expected: 'accept exit=0 + draft verify PASS + private scripts clean (PROBE identity intentional)', observed: `exit=${r1.status} privateDir=${fs.existsSync(privDir)} problems=${draftBad.length ? draftBad.join(',') : 'none'}`, verdict: r1.status === 0 && fs.existsSync(privDir) && draftBad.length === 0 ? 'PASS' : 'FAIL', stderr: r1.stderr.trim().slice(0, 160) });

      // D2/D2b/D3/D4: digests-patched private copy, exercise the REAL sub1 count guard.
      // Draft design fact (code-read): W and S are ONE combined two-line needle
      //   W="$LANE/.ufo/waves/round-69/controls"\nS="${HYAKU_SCRATCH:-...}/c2-controls-$MODE"\n
      const c2W = subsOf('c2').find((s) => s.id === 'W');
      const c2S = subsOf('c2').find((s) => s.id === 'S');
      const block = c2W.needle + c2S.needle; // exact two-line combined needle the draft counts
      const mutMultiBlock = (t2) => {
        if (!t2.includes(block)) throw new Error('draft W-S block not adjacent in frozen c2');
        return t2.replace(block, block + block); // count 2 of the combined needle
      };
      const mutCommentDup = (t2) => buildVariant(t2, c2W, 'multi'); // single-line dup inside a comment
      const mutZero = (t2) => buildVariant(t2, c2W, 'zero');        // W line removed -> combined count 0
      const mkMut = (label, mutate) => {
        const md = path.join(scratch, `draft-mut-${label}`);
        fs.mkdirSync(md, { recursive: true });
        fs.writeFileSync(path.join(md, 'c1-controls.sh'), frozen.c1);
        fs.writeFileSync(path.join(md, 'c2-controls.sh'), mutate(frozen.c2));
        const dg = JSON.parse(fs.readFileSync(d('frozen-digests.json'), 'utf8'));
        dg.sourceDir = md;
        const mb = fs.readFileSync(path.join(md, 'c2-controls.sh'));
        dg.frozen['c2-controls.sh'].sha256 = sha(mb);
        dg.frozen['c2-controls.sh'].bytes = mb.length;
        const wdm = path.join(scratch, `draft-${label}`);
        fs.mkdirSync(wdm, { recursive: true });
        fs.copyFileSync(d('transform.mjs'), path.join(wdm, 'transform.mjs'));
        fs.writeFileSync(path.join(wdm, 'frozen-digests.json'), JSON.stringify(dg, null, 2));
        return wdm;
      };
      // D2: duplicated combined block -> the draft's own count guard must refuse with count 2
      {
        const wdm = mkMut('D2-multi-block', mutMultiBlock);
        logcmd(`node ${path.join(wdm, 'transform.mjs')} generate  (cwd=${wdm}, digests patched: combined W-S block duplicated)`);
        const r = spawnSync(process.execPath, [path.join(wdm, 'transform.mjs'), 'generate'], { encoding: 'utf8', env, cwd: wdm });
        const ok = r.status === 65 && /needle count 2 != 1/.test(r.stderr);
        rows.push({ case: 'DRAFT/D2-multi-W-S-block', expected: 'refuse exit=65 needle count 2 != 1', observed: `exit=${r.status} stderr=${r.stderr.trim().slice(0, 110)}`, verdict: ok ? 'PASS' : 'FAIL', stderr: '' });
      }
      // D2b: single-line duplicate inside a comment -> combined needle still counts 1, transform
      // proceeds; the draft's verify() backstop must still refuse (exit 65) on the frozen-path remnant.
      {
        const wdm = mkMut('D2b-comment-dup', mutCommentDup);
        logcmd(`node ${path.join(wdm, 'transform.mjs')} generate  (cwd=${wdm}, digests patched: comment dup of W line)`);
        const r = spawnSync(process.execPath, [path.join(wdm, 'transform.mjs'), 'generate'], { encoding: 'utf8', env, cwd: wdm });
        const backstop = r.status === 65 && /forbidden remnant frozen output dir/.test(r.stderr);
        rows.push({ case: 'DRAFT/D2b-comment-dup-backstop', expected: 'count guard passes (combined needle==1); verify() backstop refuses exit=65', observed: `exit=${r.status} stderr=${r.stderr.trim().slice(0, 110)}`, verdict: backstop ? 'PASS' : 'FAIL', stderr: 'design note: single-line comment dup slips past the combined W-S needle count; caught only by post-transform verify' });
      }
      // D3: W line removed -> combined needle count 0 -> refuse
      {
        const wdm = mkMut('D3-zero-W', mutZero);
        logcmd(`node ${path.join(wdm, 'transform.mjs')} generate  (cwd=${wdm}, digests patched: W line removed)`);
        const r = spawnSync(process.execPath, [path.join(wdm, 'transform.mjs'), 'generate'], { encoding: 'utf8', env, cwd: wdm });
        const ok = r.status === 65 && /needle count 0 != 1/.test(r.stderr);
        rows.push({ case: 'DRAFT/D3-zero-W', expected: 'refuse exit=65 needle count 0 != 1', observed: `exit=${r.status} stderr=${r.stderr.trim().slice(0, 110)}`, verdict: ok ? 'PASS' : 'FAIL', stderr: '' });
      }
      // D4: idempotence — feed the draft's own generated c2 output back as source
      if (fs.existsSync(path.join(wd, 'private', 'c2-controls.private.sh'))) {
        const gen = fs.readFileSync(path.join(wd, 'private', 'c2-controls.private.sh'), 'utf8');
        const wdm = mkMut('D4-idempotent', () => gen);
        logcmd(`node ${path.join(wdm, 'transform.mjs')} generate  (cwd=${wdm}, source=draft's own generated c2 output)`);
        const r = spawnSync(process.execPath, [path.join(wdm, 'transform.mjs'), 'generate'], { encoding: 'utf8', env, cwd: wdm });
        const ok = r.status === 65 && /needle count 0 != 1/.test(r.stderr);
        rows.push({ case: 'DRAFT/D4-idempotent-regen', expected: 'refuse exit=65 needle count 0 != 1', observed: `exit=${r.status} stderr=${r.stderr.trim().slice(0, 110)}`, verdict: ok ? 'PASS' : 'FAIL', stderr: '' });
      }
    } else rows.push({ case: 'DRAFT/availability', expected: 'draft present', observed: 'draft missing', verdict: 'SKIP', stderr: '' });
  }

  // ---------- sibling mock check: K70ExecFixtureTests/mock on synthetic fixtures ----------
  const mockDir = opts['mock-dir'], mockfxDir = opts['mockfx-dir'];
  if (mockDir && mockfxDir) {
    const m = (n) => path.join(mockDir, n);
    const fx = (n) => path.join(mockfxDir, n);
    if (fs.existsSync(m('control-replay.mjs')) && fs.existsSync(fx('c1-controls.sh'))) {
      const wmock = path.join(scratch, 'mock.mjs');
      const src = fs.readFileSync(m('control-replay.mjs'), 'utf8');
      fs.writeFileSync(wmock, src); // unpatched private copy for the baseline
      // baseline
      const fxBase = path.join(scratch, 'mockfx-base', '.ufo', 'waves', 'round-69', 'probe');
      fs.mkdirSync(fxBase, { recursive: true });
      fs.copyFileSync(fx('c1-controls.sh'), path.join(fxBase, 'c1-controls.sh'));
      fs.copyFileSync(fx('c2-controls.sh'), path.join(fxBase, 'c2-controls.sh'));
      const baseArgs = ['--family', 'c1', '--mode', 'donothing'];
      const outB = path.join(scratch, 'mock-out-base.txt'), workB = path.join(scratch, 'mock-work-base');
      logcmd(`node ${wmock} --lane ${path.join(scratch, 'mockfx-base')} ${baseArgs.join(' ')} --out ${outB} --work ${workB}`);
      const rb = spawnSync(process.execPath, [wmock, '--lane', path.join(scratch, 'mockfx-base'), ...baseArgs, '--out', outB, '--work', workB], { encoding: 'utf8', env });
      const outTxt = fs.existsSync(outB) ? fs.readFileSync(outB, 'utf8') : '';
      rows.push({ case: 'MOCK/B1-synthetic-baseline', expected: 'accept exit=0 CONTROL-PASS in out', observed: `exit=${rb.status} pass=${outTxt.includes('CONTROL-PASS donothing')}`, verdict: rb.status === 0 && outTxt.includes('CONTROL-PASS donothing') ? 'PASS' : 'FAIL', stderr: rb.stderr.trim().slice(0, 160) });

      // mutated fixtures with pins patched in the PRIVATE mock copy (synthetic fixtures only)
      const mutCases = [
        ['M1-multi-W', (t) => t.replace(/^W="\$LANE\/\.ufo\/waves\/round-69\/controls"$/m, (l) => `${l}\n${l}`), /CONTROL_REPLAY_TRANSFORM assignment W matched 2 times/],
        ['M2-zero-W', (t) => t.replace(/^W="\$LANE\/\.ufo\/waves\/round-69\/controls"$\n/m, ''), /CONTROL_REPLAY_TRANSFORM assignment W matched 0 times/],
      ];
      for (const [label, mutate, expectRe] of mutCases) {
        const fxd = path.join(scratch, `mockfx-${label}`, '.ufo', 'waves', 'round-69', 'probe');
        fs.mkdirSync(fxd, { recursive: true });
        const c1m = mutate(fs.readFileSync(fx('c1-controls.sh'), 'utf8'));
        fs.writeFileSync(path.join(fxd, 'c1-controls.sh'), c1m);
        fs.copyFileSync(fx('c2-controls.sh'), path.join(fxd, 'c2-controls.sh'));
        const patched = src.replace(/c1: '[a-f0-9]{64}'/, `c1: '${sha(c1m)}'`);
        fs.writeFileSync(wmock, patched);
        const outM = path.join(scratch, `mock-out-${label}.txt`), workM = path.join(scratch, `mock-work-${label}`);
        logcmd(`node ${wmock} --lane ${path.join(scratch, `mockfx-${label}`)} --family c1 --mode donothing --out ${outM} --work ${workM}  (pins patched to ${label} fixture)`);
        const rm = spawnSync(process.execPath, [wmock, '--lane', path.join(scratch, `mockfx-${label}`), '--family', 'c1', '--mode', 'donothing', '--out', outM, '--work', workM], { encoding: 'utf8', env });
        const stickyOut = fs.existsSync(outM) ? fs.statSync(outM).size : 'absent';
        const ok = rm.status === 70 && expectRe.test(rm.stderr);
        rows.push({ case: `MOCK/${label}`, expected: `refuse exit=70 stderr~${expectRe} (sticky out noted)`, observed: `exit=${rm.status} stickyOutBytes=${stickyOut} stderr=${rm.stderr.trim().slice(0, 110)}`, verdict: ok ? 'PASS' : 'FAIL', stderr: '' });
      }
      fs.writeFileSync(wmock, src); // restore unpatched copy in scratch
      // code-read verdict of the mock's guard semantics
      const guardLine = src.split('\n').find((l) => l.includes('seen[k] !== 1')) || '';
      rows.push({ case: 'MOCK/CR-guard-semantics', expected: 'code-read: count != 1 refuse', observed: `guard="${guardLine.trim().slice(0, 96)}"; line-name anchored ^(LANE|PROBE|W|S)=, NOT exact-needle; refuses after --out created (sticky empty out)`, verdict: 'INFO', stderr: '' });
    } else rows.push({ case: 'MOCK/availability', expected: 'mock+fixtures present', observed: 'missing', verdict: 'SKIP', stderr: '' });
  }

  const pass = rows.filter((r) => r.verdict === 'PASS').length;
  const fail = rows.filter((r) => r.verdict === 'FAIL').length;
  const info = rows.filter((r) => r.verdict === 'INFO').length;
  const skip = rows.filter((r) => r.verdict === 'SKIP').length;

  const receipt = [];
  receipt.push(`${SEAT} probe receipt (mechanism-only: no lane candidate scripts/control-replay.mjs exists)`);
  receipt.push(`lane=${lane}`);
  receipt.push(`frozen c1 sha256=${sha(frozen.c1)} bytes=${Buffer.byteLength(frozen.c1)}`);
  receipt.push(`frozen c2 sha256=${sha(frozen.c2)} bytes=${Buffer.byteLength(frozen.c2)}`);
  receipt.push('');
  for (const r of rows) receipt.push(`${r.verdict.padEnd(4)} ${r.case.padEnd(30)} expected=${r.expected} observed=${r.observed}${r.stderr ? ' note=' + r.stderr : ''}`);
  receipt.push('');
  receipt.push(`result: PASS=${pass} FAIL=${fail} INFO=${info} SKIP=${skip}`);
  receipt.push(`PROBE_TRANSFORM_COUNT: ${fail === 0 ? 'PASS' : 'FAIL'}`);
  fs.writeFileSync(path.join(build, 'probe-transform-count.receipt.txt'), receipt.join('\n') + '\n');
  fs.writeFileSync(path.join(build, 'probe-transform-count.summary.json'), JSON.stringify({ seat: SEAT, mechanismOnly: true, pass, fail, info, skip, rows, commands: cmdlog }, null, 2) + '\n');
  console.log(receipt.join('\n'));
  process.exit(fail === 0 ? 0 : 1);
}

const [, , cmd, ...rest] = process.argv;
if (cmd === 'ref-xform') cliRefXform(rest);
else if (cmd === 'run') run(rest);
else { process.stderr.write('usage: probe-transform-count.mjs ref-xform|run ...\n'); process.exit(64); }
