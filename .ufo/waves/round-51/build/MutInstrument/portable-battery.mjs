#!/usr/bin/env node
/**
 * portable-battery.mjs — CONTRACT-ANCHORED literal-mutant battery for the C1 instrument
 * `scripts/receipt-attest.mjs` (contract kumitate-receipt-attest-v1).
 *
 *   node portable-battery.mjs <candidate.mjs> <outdir>
 *
 * Every mutant targets a CONTRACT SITE rather than one author's syntax, so the same battery
 * runs against the shipped build/ExecInstrument script, against a peer's scratch
 * implementation, and against a future rewrite. A mutant whose site is absent is
 * NOT-APPLICABLE — never counted as killed or survived.
 *
 * TWO DETECTOR ARMS (a mutant must defeat BOTH to be called a survivor):
 *
 *   ARM 1 — the candidate's own `--selftest` (the shipped hermetic suite).
 *   ARM 2 — the contract's own semantics, exercised through the CLI, re-implemented inline
 *           from plan.md §C1 and probe/attest51-probe.mjs:
 *             VALID   : a genuine receipt verifies -> exit 0, stdout /RECEIPT: VALID/
 *             TAMPERED: the doctored control (ONLY the run-at: prelude rewritten, sidecar
#                       copied untouched — the lesson-M2 forgery) -> exit 1, /RECEIPT: TAMPERED/
 *             REPLAY  : the flake-injection control (inner digest broken, sidecar
#                       regenerated) -> exit 1, /RECEIPT: REPLAY/
 *             LEDGER  : `verify --ledger <dir>` over genuine distinct receipts -> exit 0,
 *                       /RECEIPT: VALID/
 *           ARM 2 exists because a verdict-literal typo can leave the candidate's own
 *           selftest green when the selftest compares against the SAME literal the
 *           implementation emits. ARM 2 greps the contract's literals independently.
 *
 * Verdict vocabulary:
 *   KILLED    — at least one arm went red
 *   SURVIVED  — BOTH arms stayed green  (a selftest coverage finding)
 *   DRIFT     — the mutant crashed the candidate
 *   NOT-APPL  — the contract site was not found in this implementation
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const CAND = resolve(process.argv[2]);
const OUT = resolve(process.argv[3]);
if (!existsSync(CAND)) {
  process.stderr.write(`usage: node portable-battery.mjs <candidate.mjs> <outdir>\n(candidate ${CAND} absent)\n`);
  process.exit(64);
}
const sha = (b) => createHash('sha256').update(b).digest('hex');
const sha256hex = (b) => createHash('sha256').update(b).digest('hex');

/* --------------------------------------------------------------- appliers */
// Each applier takes the source text and returns the mutated text, or null if the
// contract site is absent.

const KNOWN_FIELDS = ['argv', 'exit', 'mono_ns', 'nonce', 'stderr_sha256', 'stdout_sha256', 'wall_end', 'wall_start'];

/** Remove one field from whatever binding mechanism the implementation uses. */
function unbindField(text, field) {
  // idiom A: an explicit `delete x.field` in the digest projection
  const delRe = new RegExp(`delete\\s+[\\w.$]+\\.${field}\\s*;?\\s*\\n?`, 'g');
  if (delRe.test(text)) return text.replace(delRe, '');
  // idiom D: the digest projects a spread copy with only `digest` removed — unbinding a
  // field means INSERTING a delete for it next to the existing one
  const spreadRe = /(delete\s+([\w.$]+)\.digest\s*;?)/g;
  if (spreadRe.test(text)) {
    return text.replace(spreadRe, (m, whole, varName) => `${whole}\n  delete ${varName}.${field};`);
  }
  // idiom B: a named allow-list array of field names
  let hit = false;
  let out = text.replace(/(\b[A-Za-z_]*FIELDS?[A-Za-z_]*\s*=\s*\[)([^\]]*)(\])/g, (m, a, body, c) => {
    if (!KNOWN_FIELDS.some((f) => body.includes(`'${f}'`) || body.includes(`"${f}"`))) return m;
    hit = true;
    return a + body.replace(new RegExp(`\\s*['"]${field}['"]\\s*,?`), '') + c;
  });
  if (hit) return out;
  // idiom C: a generic array literal listing several bound field names
  out = text.replace(/\[([^\]]*)\]/g, (m, body) => {
    const present = KNOWN_FIELDS.filter((f) => body.includes(`'${f}'`) || body.includes(`"${f}"`));
    if (present.length < 4) return m;
    hit = true;
    return `[${body.replace(new RegExp(`\\s*['"]${field}['"]\\s*,?`), '')}]`;
  });
  return hit ? out : null;
}

/** Replace the FIRST occurrence of `needle` with `repl`, if present. */
function sub(text, needle, repl) {
  if (!text.includes(needle)) return null;
  return text.replace(needle, repl);
}

const MUTANTS = [
  /* ---- digest computation ---- */
  { id: 'D01', site: 'digest', desc: 'the inner digest stops binding the nonce', demo: 'nonce rewritten, digest re-derived', apply: (t) => unbindField(t, 'nonce') },
  { id: 'D02', site: 'digest', desc: 'the inner digest stops binding the exit code', demo: 'exit rewritten, digest re-derived', apply: (t) => unbindField(t, 'exit') },
  { id: 'D03', site: 'digest', desc: 'the inner digest stops binding stdout_sha256', demo: 'stdout_sha256 rewritten, digest re-derived', apply: (t) => unbindField(t, 'stdout_sha256') },
  { id: 'D04', site: 'digest', desc: 'the inner digest stops binding stderr_sha256', demo: 'stderr_sha256 rewritten, digest re-derived', apply: (t) => unbindField(t, 'stderr_sha256') },
  { id: 'D05', site: 'digest', desc: 'the inner digest stops binding the wall clocks', demo: 'receipt re-dated, digest re-derived', apply: (t) => unbindField(t, 'wall_start') },
  { id: 'D06', site: 'digest', desc: 'the inner digest stops binding argv', demo: 'argv rewritten, digest re-derived', apply: (t) => unbindField(t, 'argv') },
  { id: 'D07', site: 'digest', desc: 'the inner digest stops binding the monotonic span', demo: 'mono_ns rewritten, digest re-derived', apply: (t) => unbindField(t, 'mono_ns') },
  { id: 'D08', site: 'digest', desc: 'the digest is computed over the object INCLUDING its own digest field', demo: 'the digest is self-referential', apply: (t) => {
      // idiom A: an explicit `delete x.digest` in the digest projection
      const delRe = /(delete\s+[\w.$]+\.digest\s*;?\s*\n?)/g;
      if (delRe.test(t)) return t.replace(delRe, '');
      // idiom B: ADD 'digest' to the bound allow-list (making the digest self-referential)
      const listRe = /(\b[A-Za-z_]*FIELDS?[A-Za-z_]*\s*=\s*\[)([^\]]*)(\])/g;
      let hit = false;
      const out = t.replace(listRe, (m, a, body, c) => {
        if (!KNOWN_FIELDS.some((f) => body.includes(`'${f}'`) || body.includes(`"${f}"`))) return m;
        if (body.includes("'digest'") || body.includes('"digest"')) return m;
        hit = true;
        return `${a}${'digest'}, ${body}${c}`;
      });
      return hit ? out : null;
    } },
  {
    id: 'D09', site: 'digest', desc: 'canonical JSON stops sorting keys',
    demo: 'the body line is no longer canonical',
    apply: (t) => {
      const r = /(Object\.keys\(\s*[\w.$]+\s*\))\s*\.sort\(\)/g;
      if (!r.test(t)) return null;
      return t.replace(r, '$1');
    },
  },
  {
    id: 'D10', site: 'digest', desc: 'the inner digest uses sha1 instead of sha256',
    demo: 'digest field is 40 hex chars, not 64',
    apply: (t) => {
      const r = /createHash\(\s*['"]sha256['"]\s*\)/g;
      if (!r.test(t)) return null;
      return t.replace(r, "createHash('sha1')");
    },
  },
  {
    id: 'D11', site: 'digest', desc: 'the digest comparison is inverted (mismatch never detected)',
    demo: 'any doctored body verifies',
    apply: (t) => {
      const r = /(\w*digest\w*\([^()]*\)\s*)!==(\s*[\w.$]+\.digest)/gi;
      if (!r.test(t)) return null;
      return t.replace(r, '$1==$2');
    },
  },

  /* ---- sidecar comparison ---- */
  {
    id: 'S01', site: 'sidecar', desc: 'the sidecar hash comparison is removed',
    demo: 'any sidecar content passes',
    apply: (t) => {
      const r = /if\s*\(\s*([\w.$]+\s*!==\s*(?:sha256|sha256hex)\s*\([^)]*\))\s*\)/g;
      if (!r.test(t)) return null;
      return t.replace(r, 'if (false)');
    },
  },
  {
    id: 'S02', site: 'sidecar', desc: 'the sidecar hash is compared on a truncated prefix',
    demo: 'a sidecar sharing only the prefix passes',
    apply: (t) => {
      const r = /([\w.$]+\s*!==\s*)((?:sha256|sha256hex)\s*\(\s*[\w.$]+\s*\))/g;
      if (!r.test(t)) return null;
      return t.replace(r, '$1$2.slice(0, 16) !== $2.slice(0, 16)');
    },
  },
  {
    id: 'S03', site: 'sidecar', desc: 'a missing sidecar is treated as VALID',
    demo: 'sidecar deleted -> VALID',
    apply: (t) => {
      const r = /(if\s*\(\s*!existsSync\(\s*[\w.$]+\s*\)\s*\)\s*\{)([\s\S]{0,700}?(?:RECEIPT: TAMPERED|VERDICT_TAMPERED)[\s\S]{0,300}?)(\})/g;
      if (!r.test(t)) return null;
      return t.replace(r, (m, a, body, c) => `${a}${body.replace(/RECEIPT: TAMPERED/g, 'RECEIPT: VALID').replace(/VERDICT_TAMPERED/g, 'VERDICT_VALID').replace(/exit\(1\)/g, 'exit(0)').replace(/EXIT_FINDING/g, '0')}${c}`);
    },
  },
  {
    id: 'S04', site: 'sidecar', desc: 'the sidecar covers the body line only, so the prelude is uncovered',
    demo: 'prelude rewritten + sidecar regenerated -> VALID',
    apply: (t) => {
      const r = /((?:sha256|sha256hex)\s*\(\s*)([\w.$]+)(\s*\))/g;
      if (!r.test(t)) return null;
      return t.replace(r, '$1$2.split(String.fromCharCode(10)).slice(1).join(String.fromCharCode(10))$3');
    },
  },

  /* ---- nonce comparison ---- */
  {
    id: 'N01', site: 'nonce', desc: 'the ledger nonce comparison is inverted',
    demo: 'every distinct nonce reads as reuse',
    apply: (t) => {
      const r = /(other\.nonce\s*(?:&&\s*other\.nonce\s*)?)===(\s*(?:obj|record|rec|other)\.nonce)/g;
      if (!r.test(t)) return null;
      return t.replace(r, '$1!==$2');
    },
  },
  {
    id: 'N02', site: 'nonce', desc: 'the ledger nonce comparison is truncated to a prefix',
    demo: 'distinct nonces sharing the prefix are falsely REPLAY',
    apply: (t) => {
      const r = /(other\.nonce\s*(?:&&\s*other\.nonce\s*)?)===(\s*(?:obj|record|rec|other)\.nonce)/g;
      if (!r.test(t)) return null;
      return t.replace(r, 'String(other.nonce).slice(0,8) === String($2.nonce).slice(0,8)');
    },
  },
  {
    id: 'N03', site: 'nonce', desc: 'the ledger compares the digest instead of the nonce',
    demo: 'a nonce-reuse forgery is ACCEPTED',
    apply: (t) => {
      const r = /(other\.)nonce(\s*(?:&&\s*other\.nonce)?\s*)===(\s*(?:obj|record|rec)\.)\w+/g;
      if (!r.test(t)) return null;
      return t.replace(r, '$1digest$2===${3}digest');
    },
  },
  {
    id: 'N04', site: 'nonce', desc: 'the ledger walk is skipped entirely',
    demo: 'nonce reuse is never detected',
    apply: (t) => {
      const r = /(if\s*\(\s*)(ledger|ledgerDir)(\s*\)\s*\{)/g;
      if (!r.test(t)) return null;
      return t.replace(r, '$1false && $2$3');
    },
  },
  {
    id: 'N05', site: 'nonce', desc: 'the nonce is a fixed constant',
    demo: 'every receipt carries the same nonce',
    apply: (t) => {
      const r = /randomBytes\(\s*16\s*\)\s*\.\s*toString\(\s*['"]hex['"]\s*\)/g;
      if (!r.test(t)) return null;
      return t.replace(r, "'0'.repeat(32)");
    },
  },
  {
    id: 'N06', site: 'nonce', desc: 'the nonce is truncated to 64 bits',
    demo: 'nonce field is 16 hex chars, not 32',
    apply: (t) => {
      const r = /randomBytes\(\s*16(\s*\)\s*\.\s*toString\(\s*['"]hex['"]\s*\))/g;
      if (!r.test(t)) return null;
      return t.replace(r, 'randomBytes(8$1');
    },
  },
  {
    id: 'N07', site: 'nonce', desc: 'the ledger compares only the last 8 hex chars of the nonce',
    demo: 'distinct nonces sharing the suffix are falsely REPLAY',
    apply: (t) => {
      const r = /(other\.nonce\s*(?:&&\s*other\.nonce\s*)?)===(\s*(?:obj|record|rec|other)\.nonce)/g;
      if (!r.test(t)) return null;
      return t.replace(r, 'String(other.nonce).slice(-8) === String($2.nonce).slice(-8)');
    },
  },

  {
    id: 'N08', site: 'nonce', desc: 'the ledger loses the same-digest exemption (the literal "reject a nonce already present" reading)',
    demo: 'a byte-identical duplicate (the A3 doctored control) trips the ledger on every genuine receipt',
    apply: (t) => {
      const r = /(other\.nonce\s*===\s*(?:record|obj|rec)\.nonce)\s*&&\s*other\.digest\s*!==\s*(?:record|obj|rec)\.digest/g;
      if (!r.test(t)) return null;
      return t.replace(r, '$1');
    },
  },
  {
    id: 'N09', site: 'nonce', desc: 'the ledger exempts every nonce match (the digest distinction is dropped from the other side)',
    demo: 'a same-nonce / different-digest twin is ACCEPTED (the A4c forgery)',
    apply: (t) => {
      const r = /(other\.nonce\s*===\s*(?:record|obj|rec)\.nonce\s*&&\s*other\.digest\s*)!==(\s*(?:record|obj|rec)\.digest)/g;
      if (!r.test(t)) return null;
      return t.replace(r, '$1===$2');
    },
  },

  /* ---- verdict emission ---- */
  {
    id: 'V01', site: 'verdict', desc: 'the TAMPERED verdict literal is misspelled',
    demo: 'the contract grep cannot match the TAMPERED verdict',
    apply: (t) => {
      const r = /(['"])RECEIPT: TAMPERED\1/g;
      if (!r.test(t)) return null;
      return t.replace(r, '$1RECEIPT: TAMPER$1');
    },
  },
  {
    id: 'V02', site: 'verdict', desc: 'the REPLAY verdict literal is misspelled',
    demo: 'the contract grep cannot match the REPLAY verdict',
    apply: (t) => {
      const r = /(['"])RECEIPT: REPLAY\1/g;
      if (!r.test(t)) return null;
      return t.replace(r, '$1RECEIPT: REPL$1');
    },
  },
  {
    id: 'V03', site: 'verdict', desc: 'the VALID verdict literal carries a trailing space',
    demo: 'the contract grep cannot match the VALID verdict',
    apply: (t) => {
      const r = /(['"])RECEIPT: VALID\1/g;
      if (!r.test(t)) return null;
      return t.replace(r, '$1RECEIPT: VALID $1');
    },
  },
  {
    id: 'V04', site: 'verdict', desc: 'a sidecar mismatch is reported as REPLAY instead of TAMPERED',
    demo: 'the TAMPERED verdict is unreachable on the sidecar path',
    apply: (t) => {
      const r = /(sidecar|side)[\w.$]*\s*!==[\s\S]{0,500}?(?:RECEIPT: TAMPERED|VERDICT_TAMPERED)/g;
      if (!r.test(t)) return null;
      return t.replace(r, (m) => m.replace('RECEIPT: TAMPERED', 'RECEIPT: REPLAY').replace('VERDICT_TAMPERED', 'VERDICT_REPLAY'));
    },
  },
  {
    id: 'V05', site: 'verdict', desc: 'a finding verdict exits 0 instead of 1',
    demo: 'a forgery is reported as success',
    apply: (t) => {
      const pats = [
        /(RECEIPT: (?:REPLAY|TAMPERED)[\s\S]{0,160}?process\.exit\()1(\))/g,
        /(RECEIPT: (?:REPLAY|TAMPERED)[\s\S]{0,160}?code:\s*)1(\s*[,}])/g,
        /(verdict:\s*VERDICT_(?:REPLAY|TAMPERED)[^\n]{0,160}?code:\s*)EXIT_FINDING(\s*[,}])/g,
      ];
      for (const r of pats) {
        if (!r.test(t)) continue;
        return t.replace(r, '$10$2');
      }
      return null;
    },
  },
  {
    id: 'V06', site: 'verdict', desc: 'a VALID receipt exits 1 instead of 0',
    demo: 'a genuine receipt is reported as a failure',
    apply: (t) => {
      const pats = [
        /(RECEIPT: VALID[\s\S]{0,160}?process\.exit\()0(\))/g,
        /(RECEIPT: VALID[\s\S]{0,160}?code:\s*)0(\s*[,}])/g,
        /(verdict:\s*VERDICT_VALID[^\n]{0,160}?code:\s*)0(\s*[,}])/g,
      ];
      for (const r of pats) {
        if (!r.test(t)) continue;
        return t.replace(r, '$11$2');
      }
      return null;
    },
  },

  /* ---- clock ordering ---- */
  {
    id: 'C01', site: 'clock', desc: 'the wall clock ordering test is inverted',
    demo: 'a backwards clock verifies',
    apply: (t) => {
      const r = /\b(we|end|wallEnd)\s*<\s*(ws|start|wallStart)\b/g;
      if (!r.test(t)) return null;
      return t.replace(r, '$1 > $2');
    },
  },
  {
    id: 'C02', site: 'clock', desc: 'the negative monotonic span is accepted',
    demo: 'mono_ns = -5 verifies',
    apply: (t) => {
      const r = /\|\|?\s*!?\(?\s*(?:Number|BigInt)\([^\)]*mono_ns[^\)]*\)\s*(?:>=\s*0|<\s*0n?)\s*\)?\s*/g;
      if (!r.test(t)) return null;
      return t.replace(r, '');
    },
  },
];

/* -------------------------------------------------------------- ARM 1: selftest */
function runSelftest(p) {
  const r = spawnSync(process.execPath, [p, '--selftest'], { encoding: 'utf8', timeout: 180_000, maxBuffer: 64 << 20 });
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  const lines = out.trim().split('\n');
  const last = (lines[lines.length - 1] || '').trim();
  const failed = [];
  for (const l of lines) {
    const m = /^(?:CASE|ATTEST_CASE)\s*[:\s]*([A-Za-z0-9_.-]+)\s*[:\s]*FAIL/.exec(l);
    if (m) failed.push(m[1]);
  }
  return {
    status: r.status, last, failedCases: failed, signal: r.signal,
    crashed: r.signal !== null || (r.status !== 0 && r.status !== 1),
    hasPass: /ATTEST_SELFTEST:\s*PASS/.test(last),
  };
}

/* ------------------------- ARM 2: the contract's semantics, through the CLI ------- */
function armContract(scriptPath, work) {
  const problems = [];
  rmSync(work, { recursive: true, force: true });
  mkdirSync(work, { recursive: true });
  const lastOf = (t) => { const l = `${t || ''}`.trim().split('\n').filter(Boolean); return l[l.length - 1] || ''; };

  const base = join(work, 'genuine');
  const run = spawnSync(process.execPath, [scriptPath, 'run', '--out', base, '--', '/bin/sh', '-c', 'printf hello; exit 0'], { encoding: 'utf8' });
  const receipt = `${base}.txt`;
  if (run.status !== 0 || !existsSync(receipt)) {
    return { ok: false, problems: [`run failed exit=${run.status}`], detail: 'no receipt produced' };
  }
  const text = readFileSync(receipt, 'utf8');
  const bodyLine = text.split('\n').find((l) => l.trimStart().startsWith('{'));
  let obj = null;
  try { obj = JSON.parse(bodyLine); } catch { /* handled below */ }

  // VALID: a genuine receipt verifies
  const v = spawnSync(process.execPath, [scriptPath, 'verify', receipt], { encoding: 'utf8' });
  if (!(v.status === 0 && /RECEIPT: VALID/.test(lastOf(v.stdout)))) {
    problems.push(`VALID exit=${v.status} last=${JSON.stringify(lastOf(v.stdout))}`);
  }

  // TAMPERED: the doctored control — ONLY the run-at: prelude rewritten, sidecar untouched
  const doctored = join(work, 'attest-run-2-replayed.txt');
  writeFileSync(doctored, text.replace(/^run-at: .*$/m, 'run-at: 2001-01-01T00:00:00.000Z'));
  writeFileSync(`${doctored}.sha256`, readFileSync(`${receipt}.sha256`));
  const vt = spawnSync(process.execPath, [scriptPath, 'verify', doctored], { encoding: 'utf8' });
  if (!(vt.status === 1 && /RECEIPT: TAMPERED/.test(lastOf(vt.stdout)))) {
    problems.push(`TAMPERED exit=${vt.status} last=${JSON.stringify(lastOf(vt.stdout))}`);
  }

  // REPLAY: the flake-injection control — inner digest broken, sidecar regenerated
  if (obj) {
    const flake = join(work, 'flake.txt');
    const o2 = { ...obj, wall_start: '1970-01-01T00:00:00.000Z' };
    const c2 = { ...o2 }; delete c2.digest;
    // re-derive the digest under the CANDIDATE's own rule by asking the candidate: simplest
    // is to break the digest field itself, which every conforming digest rejects
    o2.digest = 'f'.repeat(64);
    const fl = `run-at: ${o2.wall_start}\n${JSON.stringify(o2)}\n`;
    writeFileSync(flake, fl);
    writeFileSync(`${flake}.sha256`, `${sha256hex(fl)}  flake.txt\n`);
    const vr = spawnSync(process.execPath, [scriptPath, 'verify', flake], { encoding: 'utf8' });
    if (!(vr.status === 1 && /RECEIPT: REPLAY/.test(lastOf(vr.stdout)))) {
      problems.push(`REPLAY exit=${vr.status} last=${JSON.stringify(lastOf(vr.stdout))}`);
    }
  }

  // LEDGER (A4): the receipts dir holds the three genuine receipts AND the doctored
  // control (which carries run-2's exact nonce). Each genuine receipt must verify VALID
  // under --ledger over that dir — this is the clarified same-digest exemption.
  const led = join(work, 'ledger');
  mkdirSync(led, { recursive: true });
  for (const n of ['attest-run-1', 'attest-run-2', 'attest-run-3']) {
    spawnSync(process.execPath, [scriptPath, 'run', '--out', join(led, n), '--', '/bin/sh', '-c', 'printf x'], { encoding: 'utf8' });
  }
  for (const n of ['attest-run-1', 'attest-run-2', 'attest-run-3']) {
    const t = `${join(led, n)}.txt`;
    if (!existsSync(t)) { problems.push(`LEDGER ${n}:absent`); continue; }
    const doct = join(led, `${n}-replayed.txt`);
    writeFileSync(doct, readFileSync(t, 'utf8').replace(/^run-at: .*$/m, 'run-at: 2001-01-01T00:00:00.000Z'));
    writeFileSync(`${doct}.sha256`, readFileSync(`${t}.sha256`));
    const vl = spawnSync(process.execPath, [scriptPath, 'verify', '--ledger', led, t], { encoding: 'utf8' });
    if (!(vl.status === 0 && /RECEIPT: VALID/.test(lastOf(vl.stdout)))) {
      problems.push(`LEDGER ${n} exit=${vl.status} last=${JSON.stringify(lastOf(vl.stdout))}`);
    }
    rmSync(doct, { force: true }); rmSync(`${doct}.sha256`, { force: true });
  }

  // A4c: a same-nonce / DIFFERENT-digest twin (digest recomputed, sidecar recomputed) is
  // VALID alone, but the ledger over {original, twin} must answer REPLAY for BOTH.
  {
    const base2 = join(work, 'twinrun');
    spawnSync(process.execPath, [scriptPath, 'run', '--out', base2, '--', '/usr/bin/printf', '%s', 'a4c-original'], { encoding: 'utf8' });
    const orig = `${base2}.txt`;
    if (!existsSync(orig)) { problems.push('A4c: no receipt'); }
    else {
      const body = JSON.parse(readFileSync(orig, 'utf8').split('\n').find((l) => l.trimStart().startsWith('{')));
      const twinBody = { ...body, argv: [...(body.argv || []), 'a4c-evil-append'] };
      const { digest: _d, ...rest } = twinBody;
      const canonTw = JSON.stringify(Object.fromEntries(Object.keys(rest).sort().map((k) => [k, rest[k]])));
      twinBody.digest = sha256hex(canonTw);
      const tl = join(work, 'a4c-ledger');
      mkdirSync(tl, { recursive: true });
      const o2 = join(tl, 'orig.txt');
      writeFileSync(o2, readFileSync(orig, 'utf8'));
      writeFileSync(`${o2}.sha256`, readFileSync(`${orig}.sha256`));
      const tw = join(tl, 'twin.txt');
      const twText = `run-at: ${body.wall_start}\n${JSON.stringify(twinBody)}\n`;
      writeFileSync(tw, twText);
      writeFileSync(`${tw}.sha256`, `${sha256hex(twText)}  twin.txt\n`);
      const vTw = spawnSync(process.execPath, [scriptPath, 'verify', tw], { encoding: 'utf8' });
      if (!(vTw.status === 0 && /RECEIPT: VALID/.test(lastOf(vTw.stdout)))) {
        problems.push(`A4c twin-alone exit=${vTw.status} last=${JSON.stringify(lastOf(vTw.stdout))}`);
      }
      const vO = spawnSync(process.execPath, [scriptPath, 'verify', '--ledger', tl, o2], { encoding: 'utf8' });
      const vT = spawnSync(process.execPath, [scriptPath, 'verify', '--ledger', tl, tw], { encoding: 'utf8' });
      if (!(vO.status === 1 && /RECEIPT: REPLAY/.test(lastOf(vO.stdout)))) {
        problems.push(`A4c ledger(orig) exit=${vO.status} last=${JSON.stringify(lastOf(vO.stdout))}`);
      }
      if (!(vT.status === 1 && /RECEIPT: REPLAY/.test(lastOf(vT.stdout)))) {
        problems.push(`A4c ledger(twin) exit=${vT.status} last=${JSON.stringify(lastOf(vT.stdout))}`);
      }
    }
  }

  return { ok: problems.length === 0, problems, detail: problems.length ? problems.join('; ') : 'VALID/TAMPERED/REPLAY/LEDGER/A4c semantics hold' };
}

/* --------------------------------------------------------------------- runner */
mkdirSync(OUT, { recursive: true });
const pristineBytes = readFileSync(CAND);
const pristineSha = sha(pristineBytes);
process.stdout.write(`CANDIDATE ${CAND}\nsha256 ${pristineSha}\n`);

let BASELINE = null;
{
  const base = join(OUT, 'baseline');
  rmSync(base, { recursive: true, force: true });
  mkdirSync(base, { recursive: true });
  const p = join(base, 'receipt-attest.mjs');
  writeFileSync(p, pristineBytes);
  const a1 = runSelftest(p);
  const a2 = armContract(p, join(base, 'arm2'));
  BASELINE = { arm1: { status: a1.status, last: a1.last, ok: !a1.crashed && a1.status === 0 && a1.hasPass }, arm2: a2 };
  process.stdout.write(`BASELINE arm1(selftest) exit=${a1.status} last=${JSON.stringify(a1.last)}\n`);
  process.stdout.write(`BASELINE arm2(contract) ok=${a2.ok} ${a2.detail}\n`);
  if (a1.crashed || a1.status !== 0 || !a1.hasPass || !a2.ok) {
    process.stdout.write('BASELINE-RED: at least one arm is not green; readings for that arm are INCONCLUSIVE.\n');
  }
}

const rows = [];
for (const m of MUTANTS) {
  const text = pristineBytes.toString('utf8');
  let mutated = null;
  try { mutated = m.apply(text); } catch (e) { mutated = null; }
  if (mutated === null || mutated === text) {
    rows.push({ ...m, verdict: 'NOT-APPL', detail: 'contract site not found (or substitution was a no-op) in this implementation' });
    continue;
  }
  const dir = join(OUT, m.id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const p = join(dir, 'receipt-attest.mjs');
  writeFileSync(p, mutated, 'utf8');
  // keep the mutant bytes under a distinct name so the restore below cannot destroy them
  writeFileSync(join(dir, 'mutant.mjs'), mutated, 'utf8');
  const a1 = runSelftest(p);
  const a2 = armContract(p, join(dir, 'arm2'));
  const arm1Dead = a1.crashed || a1.status !== 0 || !a1.hasPass;
  const arm2Dead = !a2.ok;
  let verdict; let detail;
  if (a1.crashed) {
    verdict = 'DRIFT';
    detail = `selftest crashed (signal=${a1.signal ?? 'none'} exit=${a1.status}); arm2=${a2.detail}`;
  } else if (arm1Dead && arm2Dead) {
    verdict = 'KILLED';
    detail = `arm1: ${a1.failedCases.length ? a1.failedCases.join(', ') : `exit=${a1.status}`} | arm2: ${a2.detail}`;
  } else if (arm1Dead || arm2Dead) {
    verdict = 'KILLED';
    detail = `arm1: ${arm1Dead ? (a1.failedCases.length ? a1.failedCases.join(', ') : `exit=${a1.status}`) : 'green'} | arm2: ${arm2Dead ? a2.detail : 'green'}`;
  } else {
    verdict = 'SURVIVED';
    detail = 'both arms green';
  }
  writeFileSync(p, pristineBytes);
  const restoredOk = sha(readFileSync(p)) === pristineSha;
  rows.push({ ...m, verdict, detail, restoredOk, mutatedSha: sha(mutated) });
}

process.stdout.write('\n=== PORTABLE MUTANT TABLE ===\nid\tsite\tverdict\tdetail\n');
for (const r of rows) process.stdout.write(`${r.id}\t${r.site}\t${r.verdict}\t${r.detail}\n`);
const counts = rows.reduce((a, r) => { a[r.verdict] = (a[r.verdict] || 0) + 1; return a; }, {});
process.stdout.write(`\ntotal=${rows.length} killed=${counts.KILLED || 0} survived=${counts.SURVIVED || 0} drift=${counts.DRIFT || 0} not-applicable=${counts['NOT-APPL'] || 0}\n`);
const applied = rows.filter((r) => r.restoredOk !== undefined);
process.stdout.write(`restore_check: ${applied.filter((r) => r.restoredOk).length}/${applied.length} mutants restored to the pristine sha256\n`);
writeFileSync(join(OUT, 'portable-results.json'), JSON.stringify({ candidate: CAND, pristineSha, baseline: BASELINE, rows }, null, 2));
process.stdout.write(`results written to ${join(OUT, 'portable-results.json')}\n`);
