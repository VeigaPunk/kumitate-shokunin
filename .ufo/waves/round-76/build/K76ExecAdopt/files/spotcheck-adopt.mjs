#!/usr/bin/env node
/**
 * kumitate-spotcheck-adopt-v1 — append-only non-author spotcheck adoption.
 * The unchanged readme-map child owns all map verdicts; its findings select
 * the missing sides. Stage complete files beside their destinations, rename,
 * and restore original bytes on any caught failure, including oracle refusal.
 * Each rename is atomic, NOT a cross-file transaction: SIGKILL between renames
 * can leave a repairable half-state (neither individual file is ever partial).
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';

const SELF = fileURLToPath(import.meta.url);
const DEFAULT_LANE = resolve(dirname(SELF), '..');
const NAME = /^round-[0-9]+-verifier-spotcheck\.md$/;
const refuse = () => ({ exit: 2, lines: ['REFUSED_ORACLE'] });
function oracle(lane) {
  const r = spawnSync(process.execPath, [join(lane, 'scripts/readme-map.mjs'),
    '--registry', join(lane, '.ufo/pins/readme-map.json'), '--readme', join(lane, 'corpus/README.md'),
    '--corpus', join(lane, 'corpus/knowledge'), '--corpus', join(lane, 'corpus/lessons')], { encoding: 'utf8', cwd: lane });
  const text = r.stdout || '';
  const clean = text.trim().match(/^README_MAP: CLEAN files=\d+ rows=\d+ covered=\d+$/);
  const findings = [...text.matchAll(/(?:README_MAP: note |first=)([^\r\n]+)/g)].map(m => m[1]);
  return { clean: r.status === 0 && !!clean, line: text.trim(), findings,
    valid: r.status === 0 ? !!clean : r.status === 1 && /^README_MAP: DRIFT /m.test(text) };
}
function missing(result, key) {
  return { row: result.findings.includes(`uncovered:${key}`), pin: result.findings.includes(`unpinned:${key}`) };
}
function appendPin(raw, key) {
  // Preserve every existing byte, including existing entries and indentation.
  // Refuse ambiguous property spellings rather than guessing an insertion site.
  const matches = [...raw.matchAll(/"covered"\s*:\s*\[/g)];
  if (matches.length !== 1) throw new Error('ambiguous covered array');
  const start = matches[0].index + matches[0][0].length;
  let string = false, escaped = false, end = start;
  for (; end < raw.length; end++) {
    const c = raw[end];
    if (escaped) { escaped = false; continue; }
    if (string && c === '\\') { escaped = true; continue; }
    if (c === '"') { string = !string; continue; }
    if (!string && c === ']') break;
  }
  const body = raw.slice(start, end);
  const boundary = start + body.trimEnd().length;
  const addition = `${body.trim() ? ',' : ''}\n  ${JSON.stringify(key)}`;
  const next = raw.slice(0, boundary) + addition + raw.slice(boundary);
  const doc = JSON.parse(next);
  if (!doc.covered.includes(key)) throw new Error('insertion failed');
  return next;
}
function replaceAtomic(path, bytes) {
  const temp = `${path}.spotcheck-${randomUUID()}`;
  try {
    writeFileSync(temp, bytes, { flag: 'wx', mode: lstatSync(path).mode & 0o777 });
    renameSync(temp, path);
  } finally { rmSync(temp, { force: true }); }
}
function evaluate(lane, arm, value) {
  let path, key;
  if (arm === '--adopt') {
    if (!value.startsWith('corpus/lessons/') || value.slice('corpus/lessons/'.length).includes('/'))
      return { exit: 2, lines: ['REFUSED_OUT_OF_SCOPE'] };
    if (!NAME.test(value.slice('corpus/lessons/'.length)))
      return { exit: 2, lines: ['REFUSED_NOT_SPOTCHECK'] };
    path = value; key = path.slice('corpus/'.length);
    try {
      const full = join(lane, path);
      if (!lstatSync(full).isFile() || realpathSync(dirname(full)) !== join(realpathSync(lane), 'corpus/lessons'))
        return { exit: 2, lines: ['REFUSED_OUT_OF_SCOPE'] };
    } catch (e) {
      return { exit: 2, lines: [e.code === 'ENOENT' ? 'REFUSED_ABSENT' : 'REFUSED_ORACLE'] };
    }
  }
  if (arm === '--predict') {
    path = `corpus/lessons/round-${value}-verifier-spotcheck.md`; key = path.slice('corpus/'.length);
    try { lstatSync(join(lane, path)); }
    catch (e) { return e.code === 'ENOENT' ? { exit: 0, lines: [`SPOTCHECK_PREDICT: PENDING ${path}`] } : refuse(); }
  }
  const result = oracle(lane);
  if (!result.valid || result.findings.some(f => /^(format-unmapped|duplicate-row):/.test(f))) return refuse();
  if (arm === '--check') {
    const paths = readdirSync(join(lane, 'corpus/lessons')).filter(n => NAME.test(n)).sort().map(n => `corpus/lessons/${n}`);
    const uncovered = paths.filter(p => { const m = missing(result, p.slice(7)); return m.row || m.pin; });
    return { exit: result.clean ? 0 : 1, lines: [result.clean
      ? `SPOTCHECK_MAP: CLEAN spotchecks=${paths.length} uncovered=0`
      : `SPOTCHECK_MAP: DRIFT spotchecks=${paths.length} uncovered=${uncovered.length} first=${uncovered[0] || 'oracle'}`] };
  }
  const m = missing(result, key);
  if (arm === '--predict') {
    const covered = !m.row && !m.pin && lstatSync(join(lane, path)).isFile();
    return { exit: covered ? 0 : 1, lines: [`SPOTCHECK_PREDICT: ${covered ? 'COVERED' : 'UNCOVERED'} ${path}`] };
  }
  if (!m.row && !m.pin) return { exit: 0, lines: [`SPOTCHECK_ADOPT: ALREADY_ADOPTED ${path}`] };
  const readme = join(lane, 'corpus/README.md'), pin = join(lane, '.ufo/pins/readme-map.json');
  const originals = new Map([[readme, readFileSync(readme)], [pin, readFileSync(pin)]]);
  const changed = [];
  try {
    const writes = [];
    if (m.row) {
      const raw = originals.get(readme).toString('utf8');
      writes.push([readme, `${raw}${raw.endsWith('\n') ? '' : '\n'}| \`${key}\` | Non-author round-${value.match(/round-([0-9]+)/)[1]} verifier spotcheck | Closure artifact; adopted by spotcheck-adopt |\n`]);
    }
    if (m.pin) writes.push([pin, appendPin(originals.get(pin).toString('utf8'), key)]);
    for (const [file, bytes] of writes) { replaceAtomic(file, bytes); changed.push(file); }
    const after = oracle(lane);
    if (!after.clean) throw new Error('oracle refused');
    return { exit: 0, lines: [`SPOTCHECK_ADOPT: ADOPTED ${path} wrote=${m.row && m.pin ? 'both' : m.row ? 'row' : 'pin'}`, after.line] };
  } catch {
    for (const file of changed.reverse()) replaceAtomic(file, originals.get(file));
    return refuse();
  }
}

function selftest(lane) {
  const root = mkdtempSync(join(tmpdir(), 'spotcheck-adopt-st-'));
  let passed = 0, total = 0;
  const target = 'corpus/lessons/round-75-verifier-spotcheck.md';
  const key = target.slice(7);
  const clean = 'README_MAP: CLEAN files=1 rows=1 covered=1';
  function fixture(name, row = false, pin = false, artifact = true) {
    const dir = join(root, name);
    for (const child of ['scripts', 'corpus/knowledge', 'corpus/lessons', '.ufo/pins']) mkdirSync(join(dir, child), { recursive: true });
    copyFileSync(join(lane, 'scripts/readme-map.mjs'), join(dir, 'scripts/readme-map.mjs'));
    // A baseline file keeps pending/absent fixtures within the oracle's nonempty contract.
    if (!artifact) writeFileSync(join(dir, 'corpus/knowledge/base.md'), '# Base\n');
    else writeFileSync(join(dir, target), '# Spotcheck\n');
    writeFileSync(join(dir, 'corpus/README.md'), '# Corpus\n' + (!artifact ? '| `knowledge/base.md` | Base | fixture |\n' : row ? `| \`${key}\` | Spotcheck | fixture |\n` : ''));
    writeFileSync(join(dir, '.ufo/pins/readme-map.json'), JSON.stringify({ version: 2, covered: !artifact ? ['knowledge/base.md'] : pin ? [key] : [] }, null, 2) + '\n');
    return dir;
  }
  const hash = dir => ['corpus/README.md', '.ufo/pins/readme-map.json'].map(p => createHash('sha256').update(readFileSync(join(dir, p))).digest('hex')).join(':');
  const run = (dir, ...args) => {
    const r = spawnSync(process.execPath, [SELF, '--lane', dir, ...args], { encoding: 'utf8' });
    console.log(`CLI ${args.join(' ')} exit=${r.status} stdout=${JSON.stringify((r.stdout || '').trim())}`);
    return { exit: r.status, text: (r.stdout || '').trim() };
  };
  function exact(r, exit, text) { return r.exit === exit && r.text === text; }
  function test(name, before, action) {
    total++;
    let red = false, ok = false;
    try { red = before(); ok = red && action(); } catch { ok = false; }
    if (ok) passed++;
    console.log(`CASE ${name}: red-before=${red ? 'PASS' : 'FAIL'} ${ok ? 'PASS' : 'FAIL'}`);
  }
  try {
    let d = fixture('check-clean');
    test('check-clean', () => exact(run(d, '--check'), 1, `SPOTCHECK_MAP: DRIFT spotchecks=1 uncovered=1 first=${target}`), () => {
      if (run(d, '--adopt', target).exit !== 0) return false;
      return exact(run(d, '--check'), 0, 'SPOTCHECK_MAP: CLEAN spotchecks=1 uncovered=0');
    });
    d = fixture('check-drift', true, true);
    test('check-drift', () => exact(run(d, '--check'), 0, 'SPOTCHECK_MAP: CLEAN spotchecks=1 uncovered=0'), () => {
      writeFileSync(join(d, 'corpus/README.md'), '# Corpus\n');
      return exact(run(d, '--check'), 1, `SPOTCHECK_MAP: DRIFT spotchecks=1 uncovered=1 first=${target}`);
    });
    for (const [name, row, pin, wrote] of [['adopt-both', false, false, 'both'], ['adopt-row', false, true, 'row'], ['adopt-pin', true, false, 'pin']]) {
      d = fixture(name, row, pin);
      test(name, () => !oracle(d).clean, () => exact(run(d, '--adopt', target), 0, `SPOTCHECK_ADOPT: ADOPTED ${target} wrote=${wrote}\n${clean}`) && oracle(d).clean);
    }
    d = fixture('idempotence');
    test('idempotence', () => !oracle(d).clean, () => {
      if (run(d, '--adopt', target).exit !== 0) return false;
      const before = hash(d);
      return exact(run(d, '--adopt', target), 0, `SPOTCHECK_ADOPT: ALREADY_ADOPTED ${target}`) && before === hash(d);
    });
    for (const [name, path, token] of [['out-of-scope', 'SCORECARD.md', 'REFUSED_OUT_OF_SCOPE'], ['not-spotcheck', 'corpus/lessons/round-75.md', 'REFUSED_NOT_SPOTCHECK'], ['absent', 'corpus/lessons/round-99-verifier-spotcheck.md', 'REFUSED_ABSENT']]) {
      d = fixture(name);
      test(name, () => !oracle(d).clean, () => { const before = hash(d); return exact(run(d, '--adopt', path), 2, token) && hash(d) === before; });
    }
    for (const name of ['malformed-pin', 'malformed-readme', 'rollback']) {
      d = fixture(name);
      test(name, () => !oracle(d).clean, () => {
        if (name === 'malformed-pin') writeFileSync(join(d, '.ufo/pins/readme-map.json'), '{');
        if (name === 'malformed-readme') writeFileSync(join(d, 'corpus/README.md'), '| lessons/broken.md | broken |\n');
        if (name === 'rollback') writeFileSync(join(d, 'corpus/knowledge/unrelated.md'), '# Unmapped\n');
        const before = hash(d);
        return exact(run(d, '--adopt', target), 2, 'REFUSED_ORACLE') && hash(d) === before;
      });
    }
    d = fixture('predict-pending', true, true);
    test('predict-pending', () => exact(run(d, '--predict', '75'), 0, `SPOTCHECK_PREDICT: COVERED ${target}`), () => {
      rmSync(join(d, target));
      return exact(run(d, '--predict', '75'), 0, `SPOTCHECK_PREDICT: PENDING ${target}`);
    });
    d = fixture('predict-covered');
    test('predict-covered', () => exact(run(d, '--predict', '75'), 1, `SPOTCHECK_PREDICT: UNCOVERED ${target}`), () => run(d, '--adopt', target).exit === 0 && exact(run(d, '--predict', '75'), 0, `SPOTCHECK_PREDICT: COVERED ${target}`));
    d = fixture('predict-uncovered', true, true);
    test('predict-uncovered', () => exact(run(d, '--predict', '75'), 0, `SPOTCHECK_PREDICT: COVERED ${target}`), () => {
      writeFileSync(join(d, 'corpus/README.md'), '# Corpus\n');
      return exact(run(d, '--predict', '75'), 1, `SPOTCHECK_PREDICT: UNCOVERED ${target}`);
    });
    d = fixture('usage');
    test('usage', () => !oracle(d).clean, () => exact(run(d, '--predict', 'bad'), 64, 'SPOTCHECK_ADOPT: USAGE'));
  } finally { rmSync(root, { recursive: true, force: true }); }
  console.log(`SPOTCHECK_ADOPT_SELFTEST: ${passed === total ? 'PASS' : 'FAIL'} (${passed}/${total})`);
  console.log(`VERDICT: ${passed === total ? 'PASS' : 'FAIL'}`);
  return passed === total ? 0 : 1;
}
function main(argv) {
  let lane = DEFAULT_LANE;
  const args = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--lane' && argv[i + 1]) lane = resolve(argv[++i]);
    else args.push(argv[i]);
  }
  const arm = args[0];
  const single = ['--check', '--selftest'].includes(arm) && args.length === 1;
  const pair = ['--adopt', '--predict'].includes(arm) && args.length === 2;
  if ((!single && !pair) || (arm === '--predict' && !/^[0-9]+$/.test(args[1]))) {
    console.log('SPOTCHECK_ADOPT: USAGE'); return 64;
  }
  if (arm === '--selftest') return selftest(lane);
  let result;
  try { result = evaluate(lane, arm, args[1]); } catch { result = refuse(); }
  console.log(result.lines.join('\n'));
  return result.exit;
}
process.exitCode = main(process.argv.slice(2));
