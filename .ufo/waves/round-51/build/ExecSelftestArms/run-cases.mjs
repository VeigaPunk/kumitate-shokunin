#!/usr/bin/env node
/**
 * run-cases.mjs — ExecSelftestArms independent case harness (round 51 wave 1).
 *
 *   node run-cases.mjs <path-to-receipt-attest.mjs>
 *
 * Drives a candidate implementation of contract `kumitate-receipt-attest-v1` through the seat's
 * OWN case list (see selftest-plan.md) using only the documented CLI (`run`, `verify`,
 * `--selftest`). It does not import the candidate: every case is black-box, so the same
 * harness scores ExecInstrument's shipped script and the scratch reference.
 *
 * Output: one line per case `CASE <id> <name>: PASS|FAIL <detail>` and a final summary line
 * `CASES: <passed>/<total> <script>`; exit 0 iff every case passed.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';

const script = process.argv[2];
if (!script) { process.stderr.write('USAGE: node run-cases.mjs <receipt-attest.mjs>\n'); process.exit(64); }
if (!existsSync(script)) { process.stderr.write(`NOT FOUND: ${script}\n`); process.exit(64); }

const sha = (b) => createHash('sha256').update(b).digest('hex');
const results = [];
let work = null; // per-case temp dir

const R = (args, opts = {}) => spawnSync(process.execPath, [script, ...args], {
  encoding: 'utf8', timeout: 60_000, ...opts,
});
const verdictOf = (r) => {
  const out = `${r.stdout || ''}${r.stderr || ''}`;
  const m = /RECEIPT: (VALID|REPLAY|TAMPERED)/.exec(out);
  return m ? m[1] : `none(exit=${r.status})`;
};
const lastLine = (r) => `${r.stdout || ''}${r.stderr || ''}`.trim().split('\n').pop() || '';
const parseJsonLine = (txt) => {
  const l = txt.split('\n').find((x) => x.trimStart().startsWith('{'));
  return l ? JSON.parse(l) : null;
};
const canon = (v) => {
  if (Array.isArray(v)) return v.map(canon);
  if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v).sort()) o[k] = canon(v[k]); return o; }
  return v;
};
const canonLine = (o) => JSON.stringify(canon(o));
const digestOf = (o) => { const c = { ...o }; delete c.digest; return sha(Buffer.from(canonLine(c), 'utf8')); };
const sidecarFor = (txt) => `${sha(readFileSync(txt))}  ${basename(txt)}\n`;
const writeSidecar = (txt) => writeFileSync(`${txt}.sha256`, sidecarFor(txt));

/** Produce a genuine receipt by running the candidate's own `run` subcommand. */
function genuine(name, cmd = ['/bin/sh', '-c', 'printf hello']) {
  const base = join(work, name);
  const r = R(['run', '--out', base, '--', ...cmd]);
  const txt = `${base}.txt`;
  if (r.status !== 0 || !existsSync(txt)) throw new Error(`run failed: exit=${r.status} ${lastLine(r)}`);
  return { txt, side: `${txt}.sha256`, raw: readFileSync(txt, 'utf8'), obj: parseJsonLine(readFileSync(txt, 'utf8')) };
}

const CASES = [
  {
    id: 'C01', name: 'healthy-run-verifies-valid',
    desc: 'run --out B -- /bin/sh -c "printf hello"; verify B.txt',
    expect: 'RECEIPT: VALID, exit 0',
    run: () => {
      const g = genuine('c01');
      const v = R(['verify', g.txt]);
      return v.status === 0 && verdictOf(v) === 'VALID' ? null : `exit=${v.status} ${verdictOf(v)}`;
    },
  },
  {
    id: 'C02', name: 'sidecar-is-gnu-sha256sum-format',
    desc: 'sidecar <base>.txt.sha256 matches GNU `sha256sum` text format and `sha256sum -c` accepts it',
    expect: 'sidecar present, `sha256sum -c` exits 0',
    run: () => {
      const g = genuine('c02');
      if (!existsSync(g.side)) return 'sidecar absent';
      const body = readFileSync(g.side, 'utf8');
      if (!/^[0-9a-f]{64} [ *]\S+\n?$/.test(body)) return `format=${JSON.stringify(body)}`;
      const c = spawnSync('sha256sum', ['-c', g.side], { cwd: work, encoding: 'utf8' });
      return c.status === 0 ? null : `sha256sum -c exit=${c.status} ${(c.stdout || '').trim()}`;
    },
  },
  {
    id: 'C03', name: 'two-runs-distinct-nonces',
    desc: 'two independent runs yield pairwise-distinct nonce values',
    expect: 'n1 !== n2',
    run: () => {
      const a = genuine('c03a'); const b = genuine('c03b');
      return a.obj.nonce !== b.obj.nonce ? null : `same nonce ${a.obj.nonce}`;
    },
  },
  {
    id: 'C04', name: 'nonce-is-128-bit-hex',
    desc: 'nonce field is 32 lowercase hex chars (16 bytes of crypto.randomBytes)',
    expect: '/^[0-9a-f]{32}$/',
    run: () => {
      const g = genuine('c04');
      const n = String(g.obj.nonce || '');
      return /^[0-9a-f]{32}$/.test(n) ? null : `nonce=${JSON.stringify(n)}`;
    },
  },
  {
    id: 'C05', name: 'flake-injection-inner-digest-replay',
    desc: 'doctor one semantic field (nonce last byte) of a genuine receipt, RECOMPUTE the sidecar so the outer layer still matches; verify must reject the inner binding',
    expect: 'RECEIPT: REPLAY, exit 1 (CONTRACT ARM: flake injection)',
    run: () => {
      const g = genuine('c05');
      const d = { ...g.obj };
      d.nonce = d.nonce.slice(0, -1) + (d.nonce.slice(-1) === 'a' ? 'b' : 'a');
      writeFileSync(g.txt, g.raw.replace(canonLine(g.obj), canonLine(d)));
      writeSidecar(g.txt);
      const v = R(['verify', g.txt]);
      return v.status === 1 && verdictOf(v) === 'REPLAY' ? null : `exit=${v.status} ${verdictOf(v)}`;
    },
  },
  {
    id: 'C06', name: 'sidecar-mismatch-tampered',
    desc: 'genuine receipt, sidecar hash flipped by one hex nibble; receipt bytes untouched',
    expect: 'RECEIPT: TAMPERED, exit 1 (CONTRACT ARM: sidecar mismatch)',
    run: () => {
      const g = genuine('c06');
      const h = readFileSync(g.side, 'utf8').trim().split(/\s+/)[0];
      writeFileSync(g.side, `${h.slice(0, -1)}${h.slice(-1) === '0' ? '1' : '0'}  ${basename(g.txt)}\n`);
      const v = R(['verify', g.txt]);
      return v.status === 1 && verdictOf(v) === 'TAMPERED' ? null : `exit=${v.status} ${verdictOf(v)}`;
    },
  },
  {
    id: 'C07', name: 'prelude-only-rewrite-tampered',
    desc: 'EXACT lesson-M2 forgery: rewrite ONLY the `run-at:` prelude line, keep the JSON line and the ORIGINAL sidecar',
    expect: 'RECEIPT: TAMPERED, exit 1 (A3 shape)',
    run: () => {
      const g = genuine('c07');
      const lines = g.raw.split('\n');
      lines[0] = `run-at: ${new Date(Date.parse('2020-01-01T00:00:00Z') + 3_600_000).toISOString()}`;
      writeFileSync(g.txt, lines.join('\n')); // sidecar deliberately left stale
      const v = R(['verify', g.txt]);
      return v.status === 1 && verdictOf(v) === 'TAMPERED' ? null : `exit=${v.status} ${verdictOf(v)}`;
    },
  },
  {
    id: 'C08', name: 'ledger-rejects-nonce-reuse-on-a-byte-identical-copy',
    desc: 'copy a genuine receipt to a second filename (bytes identical: inner digest VALID, sidecar VALID) and verify --ledger <dir> the copy — the ONLY failing signal is nonce reuse',
    expect: 'RECEIPT: REPLAY, exit 1 (CONTRACT ARM: nonce reuse, ledger arm isolated)',
    run: () => {
      const a = genuine('c08a');
      const copy = join(work, 'c08-copy.txt');
      writeFileSync(copy, a.raw);
      writeSidecar(copy);
      const v = R(['verify', '--ledger', work, copy]);
      return v.status === 1 && verdictOf(v) === 'REPLAY' ? null : `exit=${v.status} ${verdictOf(v)}`;
    },
  },
  {
    id: 'C08b', name: 'ledger-rejects-nonce-reuse-in-a-forged-body',
    desc: 'forge a second receipt carrying the FIRST receipt nonce with a different argv (digest recomputed so it is internally consistent); verify --ledger <dir> on the forgery',
    expect: 'RECEIPT: REPLAY, exit 1',
    run: () => {
      const a = genuine('c08ba');
      const forged = { ...a.obj, argv: ['/bin/echo', 'forged'] };
      forged.digest = digestOf(forged);
      const ftxt = join(work, 'c08b-forged.txt');
      writeFileSync(ftxt, `run-at: ${forged.wall_start}\n${canonLine(forged)}\n`);
      writeSidecar(ftxt);
      const v = R(['verify', '--ledger', work, ftxt]);
      return v.status === 1 && verdictOf(v) === 'REPLAY' ? null : `exit=${v.status} ${verdictOf(v)}`;
    },
  },
  {
    id: 'C25', name: 'digest-field-equals-sha256-of-canonical-json-minus-digest',
    desc: 'the receipt `digest` field equals sha256 over the canonical (recursively key-sorted) JSON of the body with `digest` removed — the exact computation plan.md §C1 names',
    expect: 'digest == sha256(canonicalJSON(body \\ digest))',
    run: () => {
      const g = genuine('c25');
      const want = digestOf(g.obj);
      return g.obj.digest === want ? null : `digest=${String(g.obj.digest).slice(0, 16)} want=${want.slice(0, 16)}`;
    },
  },
  {
    id: 'C09', name: 'ledger-accepts-distinct-nonces',
    desc: 'two genuine receipts with distinct nonces in one dir; verify --ledger <dir> on each',
    expect: 'RECEIPT: VALID, exit 0 for both',
    run: () => {
      const a = genuine('c09a'); const b = genuine('c09b');
      for (const g of [a, b]) {
        const v = R(['verify', '--ledger', work, g.txt]);
        if (!(v.status === 0 && verdictOf(v) === 'VALID')) return `${basename(g.txt)} exit=${v.status} ${verdictOf(v)}`;
      }
      return null;
    },
  },
  {
    id: 'C10', name: 'ledger-does-not-flag-the-file-itself',
    desc: 'verify --ledger <dir> on a receipt that lives inside <dir> (the ledger must skip the subject file)',
    expect: 'RECEIPT: VALID, exit 0',
    run: () => {
      const a = genuine('c10a');
      const v = R(['verify', '--ledger', work, a.txt]);
      return v.status === 0 && verdictOf(v) === 'VALID' ? null : `exit=${v.status} ${verdictOf(v)}`;
    },
  },
  {
    id: 'C11', name: 'usage-error-exit-64',
    desc: 'invoke with no subcommand',
    expect: 'exit 64, usage text on stderr',
    run: () => {
      const r = R([]);
      if (r.status !== 64) return `exit=${r.status}`;
      const t = `${r.stdout || ''}${r.stderr || ''}`;
      return /USAGE/i.test(t) ? null : 'no USAGE text';
    },
  },
  {
    id: 'C12', name: 'unreadable-file-exit-2',
    desc: 'verify a path that does not exist',
    expect: 'exit 2 (never a verdict line, never a score)',
    run: () => {
      const v = R(['verify', join(work, 'does-not-exist.txt')]);
      if (v.status !== 2) return `exit=${v.status} ${verdictOf(v)}`;
      return /RECEIPT: (VALID|REPLAY|TAMPERED)/.test(`${v.stdout || ''}${v.stderr || ''}`) ? 'printed a verdict' : null;
    },
  },
  {
    id: 'C13', name: 'malformed-receipt-exit-2',
    desc: 'verify a file whose content is not a receipt at all (no JSON line)',
    expect: 'exit 2, no verdict line',
    run: () => {
      const p = join(work, 'c13-garbage.txt');
      writeFileSync(p, 'this is not a receipt\n');
      const v = R(['verify', p]);
      if (v.status !== 2) return `exit=${v.status} ${verdictOf(v)}`;
      return /RECEIPT: (VALID|REPLAY|TAMPERED)/.test(`${v.stdout || ''}${v.stderr || ''}`) ? 'printed a verdict' : null;
    },
  },
  {
    id: 'C14', name: 'no-environment-material-in-receipt',
    desc: 'run with a sentinel env var set; the receipt bytes must not contain it',
    expect: 'sentinel absent from receipt',
    run: () => {
      const base = join(work, 'c14');
      const r = R(['run', '--out', base, '--', '/bin/sh', '-c', 'printf ok'],
        { env: { ...process.env, KUMITATE_SENTINEL_SECRET: 'zSENTINEL42' } });
      if (r.status !== 0) return `run exit=${r.status}`;
      const raw = readFileSync(`${base}.txt`, 'utf8');
      return !raw.includes('zSENTINEL42') ? null : 'secret leaked into receipt';
    },
  },
  {
    id: 'C15', name: 'json-line-keys-sorted-canonical',
    desc: 'the receipt JSON line has recursively sorted keys (canonical JSON)',
    expect: 'keys in ascending order at every level',
    run: () => {
      const g = genuine('c15');
      const line = g.raw.split('\n').find((l) => l.trimStart().startsWith('{'));
      const keys = Object.keys(JSON.parse(line));
      const sorted = [...keys].sort();
      return JSON.stringify(keys) === JSON.stringify(sorted) ? null : `keys=${keys.join(',')}`;
    },
  },
  {
    id: 'C16', name: 'inner-digest-binds-every-semantic-field',
    desc: 'for each semantic field in turn (nonce, argv, exit, stdout_sha256, stderr_sha256, wall_start, wall_end, mono_ns) mutate it alone, recompute the sidecar, and require REPLAY each time',
    expect: 'REPLAY, exit 1 for all 8 field mutations',
    run: () => {
      const g = genuine('c16');
      const base = canonLine(g.obj);
      const mutants = {
        nonce: (o) => { o.nonce = `${o.nonce.slice(0, -1)}${o.nonce.slice(-1) === 'a' ? 'b' : 'a'}`; },
        argv: (o) => { o.argv = [...o.argv, 'extra-arg']; },
        exit: (o) => { o.exit = o.exit + 1; },
        stdout_sha256: (o) => { o.stdout_sha256 = `${o.stdout_sha256.slice(0, -1)}${o.stdout_sha256.slice(-1) === 'a' ? 'b' : 'a'}`; },
        stderr_sha256: (o) => { o.stderr_sha256 = `${o.stderr_sha256.slice(0, -1)}${o.stderr_sha256.slice(-1) === 'a' ? 'b' : 'a'}`; },
        wall_start: (o) => { o.wall_start = '2020-01-01T00:00:00.000Z'; },
        wall_end: (o) => { o.wall_end = '2020-01-01T00:00:01.000Z'; },
        mono_ns: (o) => { o.mono_ns = (Number(o.mono_ns) || 0) + 1; },
      };
      const bad = [];
      for (const [field, mut] of Object.entries(mutants)) {
        const d = { ...g.obj };
        mut(d);
        const p = join(work, `c16-${field}.txt`);
        writeFileSync(p, g.raw.replace(base, canonLine(d)));
        writeSidecar(p);
        const v = R(['verify', p]);
        if (!(v.status === 1 && verdictOf(v) === 'REPLAY')) bad.push(`${field}:exit=${v.status}/${verdictOf(v)}`);
      }
      return bad.length ? bad.join(' ') : null;
    },
  },
  {
    id: 'C17', name: 'missing-sidecar-tampered',
    desc: 'genuine receipt with its sidecar deleted',
    expect: 'RECEIPT: TAMPERED, exit 1 (a missing attestation is a tamper, not a pass)',
    run: () => {
      const g = genuine('c17');
      unlinkSync(g.side);
      const v = R(['verify', g.txt]);
      return v.status === 1 && verdictOf(v) === 'TAMPERED' ? null : `exit=${v.status} ${verdictOf(v)}`;
    },
  },
  {
    id: 'C18', name: 'nonzero-command-exit-recorded-and-still-valid',
    desc: 'run a command that exits 7; the receipt records exit=7 and still verifies VALID (the receipt attests the invocation, not its success)',
    expect: 'exit field 7; RECEIPT: VALID, exit 0',
    run: () => {
      const g = genuine('c18', ['/bin/sh', '-c', 'exit 7']);
      if (Number(g.obj.exit) !== 7) return `exit field=${g.obj.exit}`;
      const v = R(['verify', g.txt]);
      return v.status === 0 && verdictOf(v) === 'VALID' ? null : `exit=${v.status} ${verdictOf(v)}`;
    },
  },
  {
    id: 'C19', name: 'stdout-stderr-hashes-match-actual-bytes',
    desc: 'the recorded stdout_sha256/stderr_sha256 equal the sha256 of the command output actually produced',
    expect: 'both hashes match an independent capture',
    run: () => {
      const g = genuine('c19', ['/bin/sh', '-c', 'printf out; printf err >&2']);
      const out = spawnSync('/bin/sh', ['-c', 'printf out; printf err >&2'], { encoding: 'buffer' });
      const err = spawnSync('/bin/sh', ['-c', 'printf err >&2'], { encoding: 'buffer' });
      if (g.obj.stdout_sha256 !== sha(out.stdout)) return `stdout ${g.obj.stdout_sha256} != ${sha(out.stdout)}`;
      if (g.obj.stderr_sha256 !== sha(err.stderr)) return `stderr ${g.obj.stderr_sha256} != ${sha(err.stderr)}`;
      return null;
    },
  },
  {
    id: 'C20', name: 'selftest-arm-shape',
    desc: '--selftest exits 0, prints >=10 per-case PASS/FAIL lines, final line exactly ATTEST_SELFTEST: PASS',
    expect: 'exit 0; >=10 case lines; final line ATTEST_SELFTEST: PASS',
    run: () => {
      const r = R(['--selftest']);
      const all = `${r.stdout || ''}${r.stderr || ''}`;
      const lines = all.trim().split('\n').filter((l) => l.trim());
      const last = lines[lines.length - 1] || '';
      const caseLines = lines.filter((l) => /\b(PASS|FAIL)\b/.test(l) && !/ATTEST_SELFTEST/.test(l));
      const problems = [];
      if (r.status !== 0) problems.push(`exit=${r.status}`);
      if (last.trim() !== 'ATTEST_SELFTEST: PASS') problems.push(`last=${JSON.stringify(last.slice(0, 60))}`);
      if (caseLines.length < 10) problems.push(`case-lines=${caseLines.length}`);
      if (!caseLines.some((l) => /\bPASS\b/.test(l))) problems.push('no PASS line');
      return problems.length ? problems.join(' ') : null;
    },
  },
  {
    id: 'C21', name: 'stale-sidecar-plus-doctored-body-is-rejected',
    desc: 'doctor a semantic field and leave the sidecar stale (both layers mismatch) — the verdict must be a rejection, not VALID',
    expect: 'non-VALID, exit 1 (literal may be REPLAY or TAMPERED: see AMBIGUITY-1 in selftest-plan.md)',
    run: () => {
      const g = genuine('c21');
      const d = { ...g.obj };
      d.exit = Number(d.exit) + 1;
      writeFileSync(g.txt, g.raw.replace(canonLine(g.obj), canonLine(d))); // sidecar stale on purpose
      const v = R(['verify', g.txt]);
      if (v.status !== 1) return `exit=${v.status} ${verdictOf(v)}`;
      return verdictOf(v) === 'VALID' ? 'accepted a doctored receipt' : null;
    },
  },
  {
    id: 'C22', name: 'clock-contradiction-rejected',
    desc: 'forge a receipt whose wall_end precedes wall_start with digest and sidecar recomputed (internally consistent, temporally contradictory)',
    expect: 'non-VALID, exit 1 (contract assigns no literal verdict here — see AMBIGUITY-2)',
    run: () => {
      const g = genuine('c22');
      const d = { ...g.obj, wall_start: '2024-01-01T00:00:10.000Z', wall_end: '2024-01-01T00:00:00.000Z' };
      d.digest = digestOf(d);
      const p = join(work, 'c22.txt');
      writeFileSync(p, `run-at: ${d.wall_start}\n${canonLine(d)}\n`);
      writeSidecar(p);
      const v = R(['verify', p]);
      if (v.status === 0) return 'accepted a temporally contradictory receipt';
      return v.status === 1 ? null : `exit=${v.status} ${verdictOf(v)}`;
    },
  },
  {
    id: 'C23', name: 'verify-uses-last-line-verdict',
    desc: 'the verdict must be the LAST line of output (the frozen A2/A3 probe reads the last line)',
    expect: 'last line is exactly the verdict',
    run: () => {
      const g = genuine('c23');
      const v = R(['verify', g.txt]);
      const last = lastLine(v);
      return /^RECEIPT: VALID$/.test(last) ? null : `last=${JSON.stringify(last.slice(0, 60))}`;
    },
  },
  {
    id: 'C24', name: 'receipt-has-no-secret-or-env-field',
    desc: 'the JSON body carries no env/secret/token field and the prelude is a single `run-at:` line',
    expect: 'no env-ish key; exactly one prelude line',
    run: () => {
      const g = genuine('c24');
      const keys = Object.keys(g.obj);
      const bad = keys.filter((k) => /env|secret|token|password|key$/i.test(k));
      if (bad.length) return `keys=${bad.join(',')}`;
      const lines = g.raw.split('\n').filter((l) => l.trim());
      if (lines.length !== 2) return `lines=${lines.length}`;
      if (!lines[0].startsWith('run-at:')) return `prelude=${JSON.stringify(lines[0].slice(0, 40))}`;
      return null;
    },
  },
{
    id: 'C26', name: 'field-names-match-the-frozen-probe-contract',
    desc: 'the JSON body exposes the field names the frozen A51 probe reads (nonce, wall_start) plus the contract fields (argv, exit, digest, stdout_sha256, stderr_sha256, wall_end) and a monotonic span',
    expect: 'all required field names present; wall_start is ISO-parseable',
    run: () => {
      const g = genuine('c26');
      const need = ['argv', 'digest', 'exit', 'nonce', 'stderr_sha256', 'stdout_sha256', 'wall_end', 'wall_start'];
      const missing = need.filter((k) => !(k in g.obj));
      if (missing.length) return `missing=${missing.join(',')}`;
      if (!/^\d{4}-\d{2}-\d{2}T/.test(String(g.obj.wall_start))) return `wall_start=${g.obj.wall_start}`;
      if (!Number.isFinite(Number(g.obj.wall_end - g.obj.wall_start)) && Number.isNaN(Date.parse(g.obj.wall_end))) return `wall_end=${g.obj.wall_end}`;
      const mono = need.concat(['mono_ns', 'mono_span_ns', 'monotonic_ns', 'mono', 'span_ns', 'monotonic_span_ns'])
        .find((k) => k in g.obj);
      if (!mono) return 'no monotonic span field';
      return null;
    },
  },
  {
    id: 'C27', name: 'ledger-rejects-a-reused-nonce-from-a-different-receipt',
    desc: 'two receipts, the second forged to carry the first nonce but with a distinct wall clock and distinct argv — the ledger must reject on the nonce alone',
    expect: 'RECEIPT: REPLAY, exit 1',
    run: () => {
      const a = genuine('c27a');
      const forged = { ...a.obj, argv: ['/bin/echo', 'fresh-body'], wall_start: '2024-05-05T05:05:05.000Z', wall_end: '2024-05-05T05:05:06.000Z' };
      forged.digest = digestOf(forged);
      const ftxt = join(work, 'c27-forged.txt');
      writeFileSync(ftxt, `run-at: ${forged.wall_start}\n${canonLine(forged)}\n`);
      writeSidecar(ftxt);
      const v = R(['verify', '--ledger', work, ftxt]);
      return v.status === 1 && verdictOf(v) === 'REPLAY' ? null : `exit=${v.status} ${verdictOf(v)}`;
    },
  },
];

let passed = 0;
for (const c of CASES) {
  work = mkdtempSync(join(tmpdir(), `cases-${c.id}-`));
  let detail = null;
  try { detail = c.run(); } catch (e) { detail = `threw ${e.message}`; }
  const ok = detail === null;
  if (ok) passed++;
  results.push({ id: c.id, name: c.name, ok, detail });
  process.stdout.write(`CASE ${c.id} ${c.name}: ${ok ? 'PASS' : `FAIL ${detail}`}\n`);
}
process.stdout.write(`CASES: ${passed}/${CASES.length} ${script}\n`);
process.exit(passed === CASES.length ? 0 : 1);
