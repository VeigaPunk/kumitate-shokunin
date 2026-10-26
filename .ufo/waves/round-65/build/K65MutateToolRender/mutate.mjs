// mutate.mjs — K65MutateToolRender: one-at-a-time single-literal mutants of a pristine copy of
// scripts/harm-matrix.mjs, each judged by `node mutant --selftest` (kill = non-zero exit with
// HARM_MATRIX_SELFTEST: FAIL). Never touches the lane: reads pristine bytes from work/, writes
// mutant-<name>.mjs files in work/. usage: node mutate.mjs [casesFile] [onlyName,Name]
import { readFileSync, writeFileSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';

const WORK = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/build/K65MutateToolRender/work';
const src = readFileSync(`${WORK}/harm-matrix.mjs`, 'utf8');
const casesFile = process.argv[2] || `${WORK}/harm-cases.json`;
const only = process.argv[3] ? new Set(process.argv[3].split(',')) : null;

const M = [
  // ---- render(): counted-gates arithmetic, bad sum, counter names, exit mapping
  { name: 'counted-absent-include', find: `(r) => r.id !== 'ABSENT_BOTH'`, rep: `(r) => r.id !== 'XX'` },
  { name: 'no-gates-cond-lt', find: `if (counted === 0) failClosed('NO_GATES'`, rep: `if (counted < 0) failClosed('NO_GATES'` },
  { name: 'harm-counter-gone', find: `const harm = n('HARM'), harmAbsent = n('HARM_ABSENT'), newRed = n('NEW_RED');`, rep: `const harm = n('GONE'), harmAbsent = n('HARM_ABSENT'), newRed = n('NEW_RED');` },
  { name: 'harmabsent-counter-gone', find: `const harm = n('HARM'), harmAbsent = n('HARM_ABSENT'), newRed = n('NEW_RED');`, rep: `const harm = n('HARM'), harmAbsent = n('GONE'), newRed = n('NEW_RED');` },
  { name: 'newred-counter-gone', find: `const harm = n('HARM'), harmAbsent = n('HARM_ABSENT'), newRed = n('NEW_RED');`, rep: `const harm = n('HARM'), harmAbsent = n('HARM_ABSENT'), newRed = n('GONE');` },
  { name: 'bad-drop-newred', find: `const bad = harm + harmAbsent + newRed;`, rep: `const bad = harm + harmAbsent;` },
  { name: 'bad-sign-flip', find: `const bad = harm + harmAbsent + newRed;`, rep: `const bad = harm + harmAbsent - newRed;` },
  { name: 'clean-harm-word-swap', find: `bad === 0 ? 'CLEAN' : 'HARM'`, rep: `bad === 0 ? 'HARM' : 'CLEAN'` },
  { name: 'held-counter', find: 'held=${n(\'HELD\')}', rep: 'held=${n(\'REPAIRED\')}' },
  { name: 'repaired-counter', find: 'repaired=${n(\'REPAIRED\')}', rep: 'repaired=${n(\'HELD\')}' },
  { name: 'carried-counter', find: `carried=\${n('CARRIED')} moved=`, rep: `carried=\${n('CARRIED_MOVED')} moved=` },
  { name: 'moved-counter', find: `moved=\${n('CARRIED_MOVED')}`, rep: `moved=\${n('CARRIED')}` },
  { name: 'new-counter', find: `new=\${n('NEW_OK')}`, rep: `new=\${n('NEW_RED')}` },
  { name: 'gone-counter', find: `gone=\${n('GONE')}`, rep: `gone=\${n('HELD')}` },
  { name: 'harm-print-counter', find: 'harm=${harm} harm_absent=', rep: 'harm=${newRed} harm_absent=' },
  { name: 'gates-print-rows', find: 'gates=${counted}', rep: 'gates=${res.rows.length}' },
  { name: 'exit-map-invert', find: 'return bad === 0 ? 0 : 1;', rep: 'return bad === 0 ? 1 : 0;' },
  { name: 'exit-always-0', find: 'process.exit(render(res));', rep: 'process.exit(0);' },
  { name: 'summary-to-stderr', find: 'out(`HARM_MATRIX: ${bad === 0 ? \'CLEAN\' : \'HARM\'}`,', rep: null },
  // ---- failClosed / usage exit codes and words
  { name: 'failclosed-exit-1', find: 'process.exit(2); };', rep: 'process.exit(1); };' },
  { name: 'failclosed-word-why', find: 'FAIL_CLOSED reason=${reason}', rep: 'FAIL_CLOSED why=${reason}' },
  { name: 'usage-exit-2', find: 'process.exit(64); };', rep: 'process.exit(2); };' },
  // ---- main argument handling
  { name: 'usage-cond-drop-tip', find: 'if (!base || !tip) usage();', rep: 'if (!base) usage();' },
  { name: 'only-split-semi', find: "opt('--only').split(',').filter(Boolean)", rep: "opt('--only').split(';').filter(Boolean)" },
  { name: 'only-filter-invert', find: 'gates.filter((g) => only.includes(g.id))', rep: 'gates.filter((g) => !only.includes(g.id))' },
  { name: 'timeout-regex-zero', find: '/^[1-9][0-9]*$/.test(tmo)', rep: '/^[0-9]*$/.test(tmo)' },
  { name: 'timeout-regex-digit', find: '/^[1-9][0-9]*$/.test(tmo)', rep: '/^\\d+$/.test(tmo)' },
  // ---- buildFixture / selftest
  { name: 'add-u-tip', find: "  g(['add', '-A']);", rep: "  g(['add', '-u']);" },
  { name: 'allow-empty-drop', find: "g(['commit', '-q', '--allow-empty', '-m', 'tip'])", rep: "g(['commit', '-q', '-m', 'tip'])" },
  { name: 'same-rev-branch-off', find: 'if (c.same_rev) return', rep: 'if (false) return' },
  { name: 'toplevel-check-off', find: 'if (realpathSync(top) !== D) throw', rep: 'if (false) throw' },
  { name: 'selftest-label-swap', find: `pass === cases.length ? 'PASS' : 'FAIL'`, rep: `pass === cases.length ? 'FAIL' : 'PASS'` },
  { name: 'selftest-exit-0', find: 'process.exit(pass === cases.length ? 0 : 1);', rep: 'process.exit(0);' },
  { name: 'ok-compare-invert', find: 'const ok = r.status === c.expect.exit &&', rep: 'const ok = r.status !== c.expect.exit &&' },
  { name: 'row-regex-tip-text', find: '/gate=(\\S+) .* id=(\\S+) base_text/.exec(l)', rep: '/gate=(\\S+) .* id=(\\S+) tip_text/.exec(l)' },
  { name: 'gates-default-path', find: "resolve(opt('--gates', join(HERE, 'harm-matrix-gates.json')))", rep: "resolve(opt('--gates', join(HERE, 'gates-matrix.json')))" },
];
// summary-to-stderr: concrete find on the template literal opening
{
  const e = M.find((m) => m.name === 'summary-to-stderr');
  e.find = 'out(`HARM_MATRIX: ${bad === 0';
  e.rep = 'process.stderr.write(`HARM_MATRIX: ${bad === 0';
}

const list = only ? M.filter((m) => only.has(m.name)) : M;
for (const m of list) {
  const n = src.split(m.find).length - 1;
  m.occ = n;
}

async function runSelftest(file) {
  return new Promise((res) => {
    const p = spawn('node', [file, '--selftest', '--cases', casesFile], { cwd: WORK, encoding: 'utf8', timeout: 300000, killSignal: 'SIGKILL' });
    let so = '', se = '';
    p.stdout.on('data', (d) => { so += d; });
    p.stderr.on('data', (d) => { se += d; });
    p.on('close', (code, sig) => {
      const line = (so + se).split('\n').find((l) => l.includes('HARM_MATRIX_SELFTEST:')) || '';
      const fails = (so + se).split('\n').filter((l) => l.startsWith('CASE FAIL')).map((l) => l.split(' ')[2]);
      res({ exit: code, sig, line: line.trim(), fails });
    });
    p.on('error', (e) => res({ exit: -1, sig: null, line: `spawn-error ${e.message}`, fails: [] }));
  });
}

const results = [];
const queue = [...list];
const workers = Array.from({ length: 4 }, async () => {
  for (;;) {
    const m = queue.shift();
    if (!m) return;
    if (m.occ !== 1) {
      results.push({ name: m.name, occ: m.occ, verdict: 'NOFIND', exit: null, line: '', fails: [] });
      continue;
    }
    const mut = src.replace(m.find, m.rep);
    const f = `${WORK}/mutant-${m.name}.mjs`;
    writeFileSync(f, mut);
    const r = await runSelftest(f);
    const killed = r.exit !== 0 && r.line.includes('FAIL');
    results.push({ name: m.name, occ: 1, verdict: killed ? 'KILLED' : 'SURVIVED', exit: r.exit, line: r.line, fails: r.fails });
    rmSync(f, { force: true });
  }
});
await Promise.all(workers);
results.sort((a, b) => list.findIndex((m) => m.name === a.name) - list.findIndex((m) => m.name === b.name));
for (const r of results) console.log(`MUTANT ${r.name} occ=${r.occ} verdict=${r.verdict} exit=${r.exit} line=${JSON.stringify(r.line)}${r.fails.length ? ` fails=${r.fails.slice(0, 4).join(',')}` : ''}`);
writeFileSync(`${WORK}/../mutants-results${casesFile.includes('plus') ? '-plus' : ''}.json`, `${JSON.stringify(results, null, 1)}\n`);
const k = results.filter((r) => r.verdict === 'KILLED').length, s = results.filter((r) => r.verdict === 'SURVIVED').length, nf = results.filter((r) => r.verdict === 'NOFIND').length;
console.log(`SUMMARY cases=${casesFile.split('/').pop()} mutants=${results.length} killed=${k} survived=${s} nofind=${nf}`);
