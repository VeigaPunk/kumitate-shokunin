import { readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const S = '/tmp/kumitate-r63/K63MutateProbes';
const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const FREEZE = 'b38a2065ab8ac5b198f6569b9013d04411c3d40d';
const BASE = 'dfa6fca8f362e9c962f5b940025a2619380b759b';
const GEN = S + '/orig/make-topology-controls.mjs';
const SANDBOX_PROBE = S + '/sandbox/.ufo/waves/round-63/probe/topology63-probe.mjs';
const PRISTINE_TOPO = S + '/orig/topology63-probe.mjs';
const PRISTINE_INL = S + '/orig/inline63-probe.mjs';
const mask = (s) => String(s).replace(/[0-9a-f]{40}/g, 'X');
const envShim = { PATH: S + '/bin:' + process.env.PATH };
const runN = (file, args, env) => {
  const r = spawnSync('node', [file, ...args], { encoding: 'utf8', env: env ? { ...process.env, ...env } : process.env });
  return { line: (r.stdout || '').trim(), exit: r.status };
};
const word = (l) => (/(INLINE63|TOPOLOGY63)_(HELD|UNMET)/.exec(l) || [''])[0];
const heldTok = (l) => (/\bheld=\d+\/\d+/.exec(l) || [''])[0];
const missIds = (l) => (l.match(/\b(I[1-6]|T[1-7]) MISS/g) || []).join(',');
const receiptOf = (p) => { const t = readFileSync(p, 'utf8').split('\n'); return { line: t[0], exit: Number(/exit=(\d+)/.exec(t[1] || '')[1]) }; };

const apply = (m, src, dst) => {
  const t = readFileSync(src, 'utf8');
  const n = t.split(m.find).length - 1;
  if (n !== 1) { console.log(`${m.id} APPLY-FAIL occurrences=${n}`); return false; }
  writeFileSync(dst, t.replace(m.find, m.rep));
  return true;
};

// ---------------- topology probe mutants (check logic, one edit each) ----------------
const TOPO = [
  { id: 'T01-live-skip', find: "const LIVE = !argv.includes('--no-live');", rep: 'const LIVE = false;' },
  { id: 'T02-t5-floor-zero', find: "check('T5', bullets.length > 0 && bad.length === 0,", rep: "check('T5', bullets.length >= 0 && bad.length === 0," },
  { id: 'T03-accept-stale-opened', find: "    if (opened !== OPENED) bad.push(`${id}:opened=${opened}`);\n", rep: '' },
  { id: 'T04-drop-used-by', find: "    if (!usedBy.includes(ENTRY)) bad.push(`${id}:used-by-lacks-entry`);\n", rep: '' },
  { id: 'T05-drop-registry-guard', find: "    if (!line) { bad.push(`${id}:not-in-registry`); continue; }\n", rep: '' },
  { id: 'T06-nf-999', find: 'if (c.length !== 13) {', rep: 'if (c.length !== 999) {' },
  { id: 'T07-wordcap-2500', find: 'split(/\\s+/).length > 25)', rep: 'split(/\\s+/).length > 2500)' },
  { id: 'T08-t4-floor-zero', find: 'if (bullets.length < 6) bad.push(`bullets=${bullets.length}`);', rep: 'if (bullets.length < 0) bad.push(`bullets=${bullets.length}`);' },
  { id: 'T09-drop-row-bullet-cover', find: "  for (const id of ids) if (!bullets.some((b) => b.id === id)) bad.push(`${id}:no-bullet`);\n", rep: '' },
  { id: 'T10-t3-sha-only', find: " !== c.sha256 || b.length !== c.bytes)", rep: ' !== c.sha256)' },
  { id: 'T11-t3-always-pass', find: "check('T3', ids.length > 0 && bad.length === 0,", rep: "check('T3', true," },
  { id: 'T12-any-verified-at', find: "const hasVer = new RegExp(`^verified-at:\\\\s*${OPENED}`, 'm').test(head);", rep: "const hasVer = /^verified-at:\\s*\\S+/m.test(head);" },
  { id: 'T13-head-1-line', find: "const head = text.split('\\n').slice(0, 14).join('\\n');", rep: "const head = text.split('\\n').slice(0, 1).join('\\n');" },
  { id: 'T14-province-any-line', find: " && /frontier|band|ground|first entry/i.test(l)", rep: '' },
  { id: 'T15-t6-always-pass', find: "check('T6', r.status === 0,", rep: "check('T6', true," },
  { id: 'T16-skip-readme-map', find: 'clean = r.status === 0 && /README_MAP: CLEAN/.test(r.stdout);', rep: 'clean = true;' },
  { id: 'T17-drop-live-quote-check', find: "    if (!t.includes(norm(b.q))) bad.push(`${b.id}:quote-not-live(${b.q.slice(0, 30)})`);\n", rep: '' },
  { id: 'T18-held-gte-6', find: 'const ok = held === 7;', rep: 'const ok = held >= 6;' },
  { id: 'T19-single-row-ok', find: 'if (ids.length < 2) bad.push(`cites-${ids.length}-rows`);', rep: 'if (ids.length < 0) bad.push(`cites-${ids.length}-rows`);' },
];

// ---------------- inline probe mutants (check logic, one edit each) ----------------
const INL = [
  { id: 'I01-selftest-floor-zero', find: 'Number(m[1]) >= 25', rep: 'Number(m[1]) >= 0' },
  { id: 'I02-drop-nn-equality', find: 'm[1] === m[2] && ', rep: '' },
  { id: 'I03-ignore-exit-code', find: "check('I1', r.status === 0 && !!m &&", rep: "check('I1', !!m &&" },
  { id: 'I04-accept-fail-line', find: '/INLINE_DISPATCH_SELFTEST: PASS \\((\\d+)\\/(\\d+)\\)/', rep: '/INLINE_DISPATCH_SELFTEST: PASS|FAIL \\((\\d+)\\/(\\d+)\\)/' },
  { id: 'I05-wave-floor-zero', find: 'if (Number(m[1]) < 32) bad.push(', rep: 'if (Number(m[1]) < 0) bad.push(' },
  { id: 'I06-total-floor-zero', find: 'if (total < 64 || total > 100) bad.push(', rep: 'if (total < 0 || total > 100) bad.push(' },
  { id: 'I07-drop-spawnlog-arm', find: ' && b.status === 1 && /\\bSPAWN_LOG_ABSENT\\b/.test(b.stdout)', rep: '' },
  { id: 'I08-cases-floor-zero', find: 'if (cases.length < 10) bad.push(', rep: 'if (cases.length < 0) bad.push(' },
  { id: 'I09-exit-only-cases', find: "const good = r.status === want && (id === 'CLEAN' ? /INLINE_DISPATCH: CLEAN/.test(r.stdout) : r.stdout.split('\\n').some((l) => l.startsWith(`FINDING ${id}`)));", rep: 'const good = r.status === want;' },
  { id: 'I10-honest-unconditional', find: "if (id === 'CLEAN' && good) honest = true;", rep: 'honest = true;' },
  { id: 'I11-want-always-zero', find: 'const want = Number(exp[0]);', rep: 'const want = 0;' },
  { id: 'I12-row-64', find: "cells[cells.length - 2] === '63'", rep: "cells[cells.length - 2] === '64'" },
  { id: 'I13-tip-rev-prefix-only', find: 'lines[0] === `rev=${rev}`', rep: "lines[0].startsWith('rev=')" },
  { id: 'I14-missing-cap-999', find: 'missing.length === 0', rep: 'missing.length <= 999' },
  { id: 'I15-clean-no-seats', find: '/INLINE_DISPATCH: CLEAN \\(seats=(\\d+) /', rep: '/INLINE_DISPATCH: CLEAN/' },
  { id: 'I16-i3-host-sessions', find: "'--sessions-root', join(d, 'sessions'), ", rep: '' },
];

const inline = () => {
  const receipt = receiptOf(LANE + '/.ufo/waves/round-63/base/inline63-base.txt');
  const base = runN(PRISTINE_INL, [LANE, FREEZE]);
  const rows = [];
  for (const m of INL) {
    const dst = `${S}/mut/${m.id}.mjs`;
    if (!apply(m, PRISTINE_INL, dst)) continue;
    const f = runN(dst, [LANE, FREEZE]);
    const b = runN(dst, [LANE, BASE]);
    const fSame = f.line === base.line && f.exit === base.exit;
    const bSame = b.line === receipt.line && b.exit === receipt.exit;
    let verdict = 'SURVIVED';
    if (!fSame || !bSame) {
      const strong = f.exit !== base.exit || b.exit !== receipt.exit
        || word(f.line) !== word(base.line) || word(b.line) !== word(receipt.line)
        || heldTok(f.line) !== heldTok(base.line) || heldTok(b.line) !== heldTok(receipt.line)
        || missIds(f.line) !== missIds(base.line) || missIds(b.line) !== missIds(receipt.line);
      verdict = strong ? 'KILLED-strong' : 'KILLED-text';
    }
    rows.push([m.id, verdict, fSame ? '-' : 'freeze-line-diff', bSame ? '-' : 'receipt-diff'].join('\t'));
    writeFileSync(`${S}/out/inline-${m.id}.txt`,
      `BASELINE freeze: ${base.line}\nexit=${base.exit}\nMUTANT freeze : ${f.line}\nexit=${f.exit}\nBASELINE receipt: ${receipt.line}\nMUTANT receipt : ${b.line}\nexit=${b.exit}\n`);
  }
  writeFileSync(`${S}/out/inline-results.tsv`, `mutant\tverdict\tfreeze\treceipt\n${rows.join('\n')}\n`);
  console.log(rows.join('\n'));
};

const topo = () => {
  const receipt = receiptOf(LANE + '/.ufo/waves/round-63/base/topology63-base.txt');
  copyFileSync(PRISTINE_TOPO, SANDBOX_PROBE);
  const genRun = (outdir) => {
    const r = spawnSync('node', [GEN, S + '/sandbox', BASE, outdir], { encoding: 'utf8', env: { ...process.env, ...envShim } });
    const lines = (readFileSync(outdir + '/summary.txt', 'utf8')).split('\n').filter((l) => /^(AS-EXPECTED|UNEXPECTED)/.test(l));
    return { exit: r.status, lines: lines.map(mask) };
  };
  const baseline = genRun(S + '/out/topo-base');
  const base = runN(PRISTINE_TOPO, [LANE, BASE]);
  const baseOk = base.line === receipt.line && base.exit === receipt.exit;
  console.log(`baseline generator exit=${baseline.exit} cases=${baseline.lines.length} base-receipt-match=${baseOk}`);
  if (!baseOk) console.log(`BASE RUN DIFFERS:\n  got      ${base.line}\n  expected ${receipt.line}`);
  const caseSig = (l) => { const m = /^(\S+) (\S+) exit=(\d+) expect=(\S+) :: ([^|]*)/.exec(l); return m ? `${m[1]}|${m[3]}|${m[4]}` : l.slice(0, 40); };
  const rows = [];
  for (const m of TOPO) {
    const dst = `${S}/mut/${m.id}.mjs`;
    if (!apply(m, PRISTINE_TOPO, dst)) continue;
    copyFileSync(dst, SANDBOX_PROBE);
    const g = genRun(`${S}/out/topo-${m.id}`);
    const b = runN(dst, [LANE, BASE]);
    const bSame = b.line === receipt.line && b.exit === receipt.exit;
    const deltas = [];
    let strong = g.exit !== baseline.exit || !bSame || (b.exit !== receipt.exit);
    for (let i = 0; i < baseline.lines.length; i += 1) {
      if (baseline.lines[i] === g.lines[i]) continue;
      deltas.push(`case${i}: ${baseline.lines[i]} ==> ${g.lines[i] || '(empty)'}`);
      if (caseSig(baseline.lines[i]) !== caseSig(g.lines[i] || '')) strong = true;
    }
    if (baseline.lines.length !== g.lines.length) strong = true;
    const verdict = deltas.length === 0 && bSame && g.exit === baseline.exit ? 'SURVIVED' : strong ? 'KILLED-strong' : 'KILLED-text';
    rows.push([m.id, verdict, `genexit=${g.exit}`, bSame ? '-' : 'receipt-diff', deltas.length ? deltas.join(' ;; ').slice(0, 400) : '-'].join('\t'));
    writeFileSync(`${S}/out/topo-${m.id}.txt`, `generator-exit=${g.exit} (baseline ${baseline.exit})\n${deltas.join('\n') || 'all-case-lines-identical'}\nreceipt: got exit=${b.exit} ${b.line}\n`);
  }
  copyFileSync(PRISTINE_TOPO, SANDBOX_PROBE);
  writeFileSync(`${S}/out/topo-results.tsv`, `mutant\tverdict\tgenexit\treceipt\tdeltas\n${rows.join('\n')}\n`);
  console.log(rows.map((r) => r.split('\t').slice(0, 2).join('\t')).join('\n'));
};

const mode = process.argv[2] || 'all';
if (mode === 'inline' || mode === 'all') inline();
if (mode === 'topo' || mode === 'all') topo();
