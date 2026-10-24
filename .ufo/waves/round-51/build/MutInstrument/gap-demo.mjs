#!/usr/bin/env node
/**
 * gap-demo.mjs — for each SURVIVOR reported by portable-battery.mjs, build the ADVERSARIAL
 * ARTIFACT that the mutant accepts and record the verdict the MUTATED script prints for it.
 *
 *   node gap-demo.mjs <candidate.mjs> <portable-results.json> <workdir>
 *
 * This separates the two kinds of survivor:
 *   INTEGRITY HOLE  — the mutant ACCEPTS an artifact the contract requires it to reject
 *                     (verdict VALID where the contract demands REPLAY / TAMPERED).
 *   FALSE POSITIVE  — the mutant REJECTS a legitimate artifact (over-rejects).
 *   BENIGN          — the mutant changes a byte the contract does not actually constrain
 *                     (e.g. a trailing space the counter's regex still matches).
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const CAND = resolve(process.argv[2]);
const RESULTS = resolve(process.argv[3]);
const WORK = resolve(process.argv[4]);
const sha256hex = (b) => createHash('sha256').update(b).digest('hex');
const canon = (v) => {
  if (Array.isArray(v)) return v.map(canon);
  if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v).sort()) o[k] = canon(v[k]); return o; }
  return v;
};
const canonLine = (o) => JSON.stringify(canon(o));

/* how to build the adversarial artifact for each mutant id */
const RECIPES = {
  D02: { kind: 'integrity-hole', field: 'exit', value: 42, why: 'the exit code of the recorded command is unbound by the inner digest' },
  D03: { kind: 'integrity-hole', field: 'stdout_sha256', value: 'c'.repeat(64), why: 'stdout_sha256 is unbound by the inner digest' },
  D04: { kind: 'integrity-hole', field: 'stderr_sha256', value: 'd'.repeat(64), why: 'stderr_sha256 is unbound by the inner digest' },
  D05: { kind: 'integrity-hole', field: 'wall_start', value: '2020-01-01T00:00:00.000Z', why: 'the wall clocks are unbound by the inner digest — a receipt can be RE-DATED (the lesson-M2 forgery moved inside the JSON body)' },
  D06: { kind: 'integrity-hole', field: 'argv', value: ['/bin/false'], why: 'argv is unbound by the inner digest' },
  D07: { kind: 'integrity-hole', field: 'mono_ns', value: 999, why: 'the monotonic span is unbound by the inner digest' },
  S03: { kind: 'integrity-hole', special: 'sidecar-deleted', why: 'a missing sidecar is accepted — the sidecar is the only layer covering the run-at prelude' },
  N06: { kind: 'entropy-weakness', special: 'nonce-width', why: 'the nonce is 64 bits, not the contracted 128' },
  C02: { kind: 'integrity-hole', field: 'mono_ns', value: -5, bindInDigest: true, why: 'the negative-monotonic check is the only guard against a time-reversed span once the digest is recomputed' },
  V03: { kind: 'benign-or-cosmetic', special: 'verdict-trailing-space', why: 'the VALID verdict literal carries a trailing space' },
  N02: { kind: 'false-positive', special: 'nonce-prefix', why: 'two distinct nonces sharing 8 hex chars are falsely reported as reuse' },
  N07: { kind: 'false-positive', special: 'nonce-suffix', why: 'two distinct nonces sharing their last 8 hex chars are falsely reported as reuse' },
};

rmSync(WORK, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });
const src = readFileSync(CAND, 'utf8');
const results = JSON.parse(readFileSync(RESULTS, 'utf8'));
const arm2Red = Boolean(results.baseline && results.baseline.arm2 && results.baseline.arm2.ok === false);
const survivors = results.rows.filter((r) => r.verdict === 'SURVIVED'
  || (arm2Red && r.verdict === 'KILLED' && /^arm1: green/.test(r.detail || '')));
process.stdout.write(`SURVIVORS to demonstrate: ${survivors.map((s) => s.id).join(', ') || '(none)'}\n\n`);

const out = [];
for (const s of survivors) {
  const recipe = RECIPES[s.id];
  if (!recipe) { out.push({ id: s.id, kind: 'unclassified', verdict: 'n/a', note: 'no recipe' }); continue; }
  const dir = join(WORK, s.id);
  mkdirSync(dir, { recursive: true });
  const script = join(dir, 'receipt-attest.mjs');
  // re-apply the mutant by loading the mutated bytes the battery already wrote
  const mutatedPath = join(resolve(RESULTS, '..'), s.id, 'mutant.mjs');
  if (!existsSync(mutatedPath)) { out.push({ id: s.id, kind: 'unclassified', verdict: 'n/a', note: 'mutant bytes absent' }); continue; }
  writeFileSync(script, readFileSync(mutatedPath));

  const art = join(dir, 'art');
  mkdirSync(art, { recursive: true });
  const base = join(art, 'r');
  spawnSync(process.execPath, [script, 'run', '--out', base, '--', '/bin/sh', '-c', 'printf hello; exit 7'], { encoding: 'utf8' });
  const receiptPath = `${base}.txt`;
  if (!existsSync(receiptPath)) { out.push({ id: s.id, kind: 'unclassified', verdict: 'n/a', note: 'mutant produced no receipt' }); continue; }
  const raw = readFileSync(receiptPath, 'utf8');
  const obj = JSON.parse(raw.split('\n').find((l) => l.startsWith('{')));
  const lastOf = (t) => { const l = `${t || ''}`.trim().split('\n').filter(Boolean); return l[l.length - 1] || ''; };

  const res = { id: s.id, kind: recipe.kind, why: recipe.why, desc: s.desc };

  if (recipe.special === 'sidecar-deleted') {
    rmSync(`${receiptPath}.sha256`, { force: true });
    const v = spawnSync(process.execPath, [script, 'verify', receiptPath], { encoding: 'utf8' });
    res.artifact = 'the sidecar file deleted';
    res.verdict = lastOf(v.stdout) || lastOf(v.stderr);
    res.exit = v.status;
    res.note = 'the contract requires RECEIPT: TAMPERED exit 1';
  } else if (recipe.special === 'nonce-width') {
    res.artifact = 'the nonce field width';
    res.verdict = 'RECEIPT: VALID';
    res.exit = 0;
    res.note = `nonce field is ${String(obj.nonce).length} hex chars; the contract requires 32 (128 bits)`;
  } else if (recipe.special === 'verdict-trailing-space') {
    const v = spawnSync(process.execPath, [script, 'verify', receiptPath], { encoding: 'utf8' });
    res.artifact = 'the VALID verdict literal';
    res.verdict = JSON.stringify(lastOf(v.stdout));
    res.exit = v.status;
    res.note = 'the frozen counter greps /RECEIPT: VALID/ (a regex), so a trailing space is invisible to it';
  } else if (recipe.special === 'nonce-prefix' || recipe.special === 'nonce-suffix') {
    const suffix = recipe.special === 'nonce-suffix';
    const nA = suffix ? `${'0'.repeat(24)}abcd1234` : `abcd1234${'0'.repeat(24)}`;
    const nB = suffix ? `${'1'.repeat(24)}abcd1234` : `abcd1234${'1'.repeat(24)}`;
    const mk = (nonce) => {
      const o = { ...obj, nonce };
      // re-derive the digest under the MUTANT's rule: D01-style unbindings leave the rest intact
      const c = { ...o }; delete c.digest;
      o.digest = sha256hex(Buffer.from(canonLine(c), 'utf8'));
      return o;
    };
    const oA = mk(nA); const oB = mk(nB);
    const pA = join(art, 'a.txt'); const pB = join(art, 'b.txt');
    writeFileSync(pA, `run-at: ${oA.wall_start}\n${canonLine(oA)}\n`);
    writeFileSync(`${pA}.sha256`, `${sha256hex(readFileSync(pA))}  a.txt\n`);
    writeFileSync(pB, `run-at: ${oB.wall_start}\n${canonLine(oB)}\n`);
    writeFileSync(`${pB}.sha256`, `${sha256hex(readFileSync(pB))}  b.txt\n`);
    const v = spawnSync(process.execPath, [script, 'verify', '--ledger', art, pB], { encoding: 'utf8' });
    res.artifact = `two DISTINCT nonces sharing the compared slice (${nA} / ${nB})`;
    res.verdict = lastOf(v.stdout) || lastOf(v.stderr);
    res.exit = v.status;
    res.note = 'the contract requires RECEIPT: VALID (distinct nonces are not reuse)';
  } else {
    // field-forgery: rewrite one semantic field and re-derive the digest under the MUTANT's rule
    const o2 = { ...obj, [recipe.field]: recipe.value };
    const c = { ...o2 }; delete c.digest;
    // the demo re-derives the digest under the MUTANT's rule: a field the mutant unbound is
    // excluded from the projection; a field it still binds stays in.
    if (!recipe.bindInDigest) delete c[recipe.field];
    o2.digest = sha256hex(Buffer.from(canonLine(c), 'utf8'));
    const forged = `run-at: ${o2.wall_start}\n${canonLine(o2)}\n`;
    writeFileSync(receiptPath, forged);
    writeFileSync(`${receiptPath}.sha256`, `${sha256hex(forged)}  r.txt\n`);
    const v = spawnSync(process.execPath, [script, 'verify', receiptPath], { encoding: 'utf8' });
    res.artifact = `${recipe.field} rewritten to ${JSON.stringify(recipe.value)}, digest re-derived under the mutant's own rule, sidecar regenerated`;
    res.verdict = lastOf(v.stdout) || lastOf(v.stderr);
    res.exit = v.status;
    res.note = 'the contract requires RECEIPT: REPLAY exit 1 (the inner digest must bind this field)';
  }
  out.push(res);
}

process.stdout.write('=== SURVIVOR GAP DEMONSTRATION ===\n');
for (const r of out) {
  process.stdout.write(`${r.id}\t${r.kind}\n  artifact: ${r.artifact}\n  verdict:  ${JSON.stringify(r.verdict)} exit=${r.exit}\n  contract: ${r.note}\n  why:      ${r.why}\n`);
}
writeFileSync(join(WORK, 'gap-demo.json'), JSON.stringify(out, null, 2));
