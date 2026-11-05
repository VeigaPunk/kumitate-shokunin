#!/usr/bin/env node
/**
 * kumitate-spotcheck-adopt-v3 — journaled non-author spotcheck adoption, two readings.
 * v3.1 (round 80 integration): recovery applies the same delta test as `--adopt` (the manifest's
 * target resolving, never a globally clean map), a zero-file spotcheck set reads `NONE` and exits 1,
 * `--predict` reads the oracle first (a green answer is never returned from an unevaluable map),
 * `--adopt` refuses (`REFUSED_NO_MAP_SECTION`) when the README has no `## Coverage map` heading,
 * and the delta filter strips only the target's own `uncovered:`/`unpinned:` findings.
 * The unchanged readme-map child owns all map verdicts. `--check` reports the spotcheck set
 * (`SPOTCHECK_COVERAGE:`) and the map (`MAP:`) as separate readings, so a green spotcheck set
 * on an unrelated red map is readable; `--adopt` validates its own delta (the target key
 * resolves, every other finding is unchanged) instead of demanding a globally clean map.
 * Before either rename, publish both pre-images in .ufo/pins/adopt-journal; the next
 * invocation completes or rolls back interrupted adoption. Assumes one writer per lane.
 * Test-only seam: SPOTCHECK_ADOPT_TEST_CRASH=journal|row|pin sends SIGKILL
 * after journal publication, README replacement, or pin replacement respectively.
 * Unset in normal use. Recovery protects process crashes, not power loss.
 */
import { spawnSync } from 'node:child_process';
import { copyFileSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
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
  const first = /^README_MAP: DRIFT .*?first=([^\r\n ]+)/m.exec(text)?.[1] ?? null;
  return { clean: r.status === 0 && !!clean, line: text.trim(), findings, first,
    valid: r.status === 0 ? !!clean : r.status === 1 && /^README_MAP: DRIFT /m.test(text) };
}
function missing(result, key) {
  return { row: result.findings.includes(`uncovered:${key}`), pin: result.findings.includes(`unpinned:${key}`) };
}
/** Findings that do not name the adopted key: the map's other defects, order-free and deduped.
 * Subject-exact: only the two findings adoption exists to clear are stripped, so a near-identical
 * path (`<key> ` with a trailing space) or another class about the key stays in the comparison. */
function otherFindings(result, key) {
  const own = new Set([`uncovered:${key}`, `unpinned:${key}`]);
  return [...new Set(result.findings.filter((f) => !own.has(f)))].sort();
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
  // Match the file's own entry indentation (first existing entry), not a fixed two spaces.
  const indent = /\n([ \t]+)"/.exec(body)?.[1] ?? '  ';
  const addition = `${body.trim() ? ',' : ''}\n${indent}${JSON.stringify(key)}`;
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
const JOURNAL = '.ufo/pins/adopt-journal';
const PRE = [
  { path: 'corpus/README.md', file: 'README.pre' },
  { path: '.ufo/pins/readme-map.json', file: 'readme-map.pre' },
];
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
/** A destination's real parent must be the lane's own directory (no symlinked parent). */
function canonicalParent(file, want, lane) {
  const parent = realpathSync(dirname(file));
  const expected = join(realpathSync(lane), want);
  if (parent !== expected) {
    const error = new Error('path escape');
    error.token = 'REFUSED_PATH_ESCAPE';
    throw error;
  }
}
/** Retire a journal atomically before recursive deletion: a kill cannot leave a half-journal. */
function retire(dir) {
  const done = `${dir}.done`;
  try { renameSync(dir, done); } catch { /* already retired */ }
  rmSync(done, { recursive: true, force: true });
}
function stageJournal(lane, target, key, originals) {
  const root = join(lane, JOURNAL), id = randomUUID();
  mkdirSync(root, { recursive: true });
  const temp = join(root, `${id}.tmp`), ready = join(root, id);
  mkdirSync(temp);
  const pre = PRE.map(entry => {
    const bytes = originals.get(join(lane, entry.path));
    writeFileSync(join(temp, entry.file), bytes, { flag: 'wx' });
    return { ...entry, sha256: sha256(bytes) };
  });
  writeFileSync(join(temp, 'manifest.json'), JSON.stringify({
    contract: 'kumitate-adopt-journal-v1', lane, target, key, pre,
  }) + '\n', { flag: 'wx' });
  renameSync(temp, ready);
  return ready;
}
function recover(lane, lines) {
  const root = join(lane, JOURNAL);
  canonicalParent(root, '.ufo/pins', lane);
  let entries;
  try { entries = readdirSync(root).sort(); }
  catch (e) { if (e.code === 'ENOENT') return; throw e; }
  for (const name of entries) {
    const dir = join(root, name);
    if (!lstatSync(dir).isDirectory()) throw new Error('invalid journal entry');
    if (name.endsWith('.tmp') || name.endsWith('.done')) {
      retire(dir);
      lines.push('RECOVERED - stale');
      continue;
    }
    const manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
    if (manifest.lane !== lane) {
      const error = new Error('foreign journal');
      error.token = 'REFUSED_JOURNAL_FOREIGN';
      throw error;
    }
    if (manifest.contract !== 'kumitate-adopt-journal-v1'
      || typeof manifest.target !== 'string'
      || !manifest.target.startsWith('corpus/lessons/')
      || !NAME.test(manifest.target.slice('corpus/lessons/'.length))
      || manifest.key !== manifest.target.slice(7)
      || !Array.isArray(manifest.pre) || manifest.pre.length !== PRE.length
      || manifest.pre.some((entry, i) => entry.path !== PRE[i].path
        || entry.file !== PRE[i].file || !/^[0-9a-f]{64}$/.test(entry.sha256)))
      throw new Error('invalid journal manifest');
    const result = oracle(lane);
    const target = missing(result, manifest.key);
    let outcome = 'complete';
    // v3.1: the same delta test as `--adopt` — the manifest's target resolving is what "complete"
    // means; an unrelated red map no longer undoes an adoption that already landed both halves.
    if (!result.valid || target.row || target.pin) {
      // Validate both images before restoring either destination.
      const images = manifest.pre.map(entry => {
        const bytes = readFileSync(join(dir, entry.file));
        if (sha256(bytes) !== entry.sha256) throw new Error('invalid pre-image');
        return [join(lane, entry.path), bytes];
      });
      for (const [path, bytes] of images) replaceAtomic(path, bytes);
      outcome = 'rolled-back';
    }
    retire(dir);
    lines.push(`RECOVERED ${manifest.target} ${outcome}`);
  }
}
function crashAt(stage) {
  if (process.env.SPOTCHECK_ADOPT_TEST_CRASH === stage) process.kill(process.pid, 'SIGKILL');
}
function insertRow(raw, row) {
  const heading = /^## Coverage map[^\r\n]*(?:\r?\n|$)/m.exec(raw);
  const start = heading ? heading.index + heading[0].length : 0;
  const remainder = raw.slice(start);
  const nextHeading = remainder.search(/^## /m);
  const table = nextHeading < 0 ? remainder : remainder.slice(0, nextHeading);
  const lessons = [...table.matchAll(/^\| `lessons\/[^`\r\n]+` \|[^\r\n]*(?:\r?\n|$)/gm)];
  const rows = lessons.length ? lessons : [...table.matchAll(/^\| `[^`\r\n]+` \|[^\r\n]*(?:\r?\n|$)/gm)];
  const last = rows.at(-1);
  const boundary = start + (last ? last.index + last[0].length : table.length);
  const prefix = raw.slice(0, boundary);
  return prefix + (prefix && !prefix.endsWith('\n') ? '\n' : '') + row + raw.slice(boundary);
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
  let predicts = false;
  if (arm === '--predict') {
    path = `corpus/lessons/round-${value}-verifier-spotcheck.md`; key = path.slice('corpus/'.length);
    try { predicts = lstatSync(join(lane, path)).isFile(); }
    catch (e) { if (e.code !== 'ENOENT') return refuse(); predicts = false; }
  }
  const result = oracle(lane);
  if (!result.valid || result.findings.some(f => /^(format-unmapped|duplicate-row):/.test(f))) return refuse();
  if (arm === '--predict' && !predicts) return { exit: 0, lines: [`SPOTCHECK_PREDICT: PENDING ${path}`] };
  if (arm === '--check') {
    const paths = readdirSync(join(lane, 'corpus/lessons')).filter(n => NAME.test(n)).sort().map(n => `corpus/lessons/${n}`);
    const uncovered = paths.filter(p => { const m = missing(result, p.slice(7)); return m.row || m.pin; });
    const irregular = uncovered.length > 0 && !(() => { try { return lstatSync(join(lane, uncovered[0])).isFile(); } catch { return false; } })();
    const coverage = paths.length === 0
      ? 'SPOTCHECK_COVERAGE: NONE spotchecks=0 (an empty spotcheck set is not a pass)'
      : uncovered.length === 0
        ? `SPOTCHECK_COVERAGE: CLEAN spotchecks=${paths.length} uncovered=0`
        : `SPOTCHECK_COVERAGE: DRIFT spotchecks=${paths.length} uncovered=${uncovered.length} first=${uncovered[0]}${irregular ? ' (first is not a regular file; --adopt cannot adopt it)' : ''}`;
    const map = result.clean ? 'MAP: CLEAN' : `MAP: DRIFT first=${result.first ?? 'oracle'}`;
    return { exit: paths.length === 0 || uncovered.length > 0 ? 1 : 0, lines: [coverage, map] };
  }
  const m = missing(result, key);
  try {
    canonicalParent(join(lane, 'corpus/README.md'), 'corpus', lane);
    canonicalParent(join(lane, '.ufo/pins/readme-map.json'), '.ufo/pins', lane);
  } catch { return { exit: 2, lines: ['REFUSED_PATH_ESCAPE'] }; }
  if (arm === '--predict') {
    const covered = !m.row && !m.pin && lstatSync(join(lane, path)).isFile();
    return { exit: covered ? 0 : 1, lines: [`SPOTCHECK_PREDICT: ${covered ? 'COVERED' : 'UNCOVERED'} ${path}`] };
  }
  if (!m.row && !m.pin) return { exit: 0, lines: [`SPOTCHECK_ADOPT: ALREADY_ADOPTED ${path}`] };
  const readme = join(lane, 'corpus/README.md'), pin = join(lane, '.ufo/pins/readme-map.json');
  // v3.1: a row written above the first heading is structurally wrong though the map parses it.
  if (m.row && !/^## Coverage map/m.test(readFileSync(readme, 'utf8'))) {
    return { exit: 2, lines: ['REFUSED_NO_MAP_SECTION'] };
  }
  const originals = new Map([[readme, readFileSync(readme)], [pin, readFileSync(pin)]]);
  let journal;
  try {
    const writes = [];
    if (m.row) {
      const raw = originals.get(readme).toString('utf8');
      writes.push([readme, insertRow(raw, `| \`${key}\` | Non-author round-${value.match(/round-([0-9]+)/)[1]} verifier spotcheck | Closure artifact; adopted by spotcheck-adopt |\n`)]);
    }
    if (m.pin) writes.push([pin, appendPin(originals.get(pin).toString('utf8'), key)]);
    journal = stageJournal(lane, path, key, originals);
    crashAt('journal');
    for (const [file, bytes] of writes) {
      replaceAtomic(file, bytes);
      crashAt(file === readme ? 'row' : 'pin');
    }
    const after = oracle(lane);
    const target = missing(after, key);
    const sameOther = JSON.stringify(otherFindings(after, key)) === JSON.stringify(otherFindings(result, key));
    if (!after.valid || target.row || target.pin || !sameOther) throw new Error('oracle refused');
    retire(journal);
    return { exit: 0, lines: [`SPOTCHECK_ADOPT: ADOPTED ${path} wrote=${m.row && m.pin ? 'both' : m.row ? 'row' : 'pin'}`, after.line] };
  } catch {
    if (journal) {
      for (const [file, bytes] of originals) replaceAtomic(file, bytes);
      retire(journal);
    }
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
    writeFileSync(join(dir, 'corpus/README.md'), `# Corpus\n\n## Coverage map\n\n${!artifact ? '| `knowledge/base.md` | Base | fixture |\n' : row ? `| \`${key}\` | Spotcheck | fixture |\n` : ''}\n## Known gaps\n\n- none\n`);
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
    test('check-clean', () => exact(run(d, '--check'), 1, `SPOTCHECK_COVERAGE: DRIFT spotchecks=1 uncovered=1 first=${target}\nMAP: DRIFT first=uncovered:${key}`), () => {
      if (run(d, '--adopt', target).exit !== 0) return false;
      return exact(run(d, '--check'), 0, 'SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0\nMAP: CLEAN');
    });
    d = fixture('check-drift', true, true);
    test('check-drift', () => exact(run(d, '--check'), 0, 'SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0\nMAP: CLEAN'), () => {
      writeFileSync(join(d, 'corpus/README.md'), '# Corpus\n');
      return exact(run(d, '--check'), 1, `SPOTCHECK_COVERAGE: DRIFT spotchecks=1 uncovered=1 first=${target}\nMAP: DRIFT first=uncovered:${key}`);
    });
    // The split: a green spotcheck set stays readable on a map red for another reason.
    d = fixture('check-map-only-drift');
    writeFileSync(join(d, 'corpus/knowledge/late.md'), '# Late\n');
    test('check-map-only-drift', () => exact(run(d, '--check'), 1, `SPOTCHECK_COVERAGE: DRIFT spotchecks=1 uncovered=1 first=${target}\nMAP: DRIFT first=uncovered:knowledge/late.md`), () => {
      if (run(d, '--adopt', target).exit !== 0) return false;
      return exact(run(d, '--check'), 0, 'SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0\nMAP: DRIFT first=uncovered:knowledge/late.md');
    });
    d = fixture('check-map-orphan', true, true);
    // Insert the ghost row INSIDE the map section: readme-map v3 (round 86) reads a row after
    // `## Known gaps` as outside-map, not orphan-row; this case proves the orphan class.
    writeFileSync(join(d, 'corpus/README.md'), readFileSync(join(d, 'corpus/README.md'), 'utf8').replace('\n## Known gaps', '| `knowledge/ghost.md` | Ghost | fixture |\n## Known gaps'));
    test('check-map-orphan', () => !oracle(d).clean, () => {
      const r = run(d, '--check');
      return r.exit === 0 && r.text === 'SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0\nMAP: DRIFT first=orphan-row:knowledge/ghost.md';
    });
    d = fixture('check-none');
    rmSync(join(d, 'corpus/lessons/round-75-verifier-spotcheck.md'));
    writeFileSync(join(d, 'corpus/knowledge/base.md'), '# Base\n');
    test('check-none', () => !oracle(d).clean, () => {
      const r = run(d, '--check');
      return r.exit === 1
        && r.text.split('\n')[0] === 'SPOTCHECK_COVERAGE: NONE spotchecks=0 (an empty spotcheck set is not a pass)'
        && r.text.split('\n')[1] === 'MAP: DRIFT first=uncovered:knowledge/base.md';
    });
    d = fixture('no-map-section');
    writeFileSync(join(d, 'corpus/README.md'), `# Corpus\n\n| \`knowledge/base.md\` | Base | fixture |\n`);
    test('no-map-section', () => !oracle(d).clean, () => {
      const before = hash(d);
      return exact(run(d, '--adopt', target), 2, 'REFUSED_NO_MAP_SECTION') && hash(d) === before;
    });
    d = fixture('predict-invalid-oracle');
    writeFileSync(join(d, '.ufo/pins/readme-map.json'), '{"version":1,"covered":[]}');
    test('predict-invalid-oracle', () => !oracle(d).valid, () => exact(run(d, '--predict', '99'), 2, 'REFUSED_ORACLE'));
    d = fixture('path-escape');
    renameSync(join(d, '.ufo/pins'), join(d, '.ufo/pins-real'));
    symlinkSync('pins-real', join(d, '.ufo/pins'));
    test('path-escape', () => !oracle(d).clean, () => {
      const before = hash(d);
      return exact(run(d, '--adopt', target), 2, 'REFUSED_PATH_ESCAPE') && hash(d) === before;
    });
    d = fixture('recovery-red-map');
    writeFileSync(join(d, 'corpus/knowledge/late.md'), '# Late\n');
    test('recovery-red-map', () => !oracle(d).clean, () => {
      const child = spawnSync(process.execPath, [SELF, '--lane', d, '--adopt', target], {
        encoding: 'utf8', env: { ...process.env, SPOTCHECK_ADOPT_TEST_CRASH: 'pin' },
      });
      if (child.signal !== 'SIGKILL') return false;
      const recovered = run(d, '--check');
      return recovered.exit === 0
        && recovered.text.startsWith(`RECOVERED ${target} complete\n`)
        && recovered.text.includes('SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0')
        && recovered.text.includes('MAP: DRIFT first=uncovered:knowledge/late.md');
    });
    d = fixture('check-symlink');
    writeFileSync(join(d, 'corpus/lessons/round-80-real.md'), '# Real\n');
    rmSync(join(d, target));
    symlinkSync('round-80-real.md', join(d, target));
    test('check-symlink', () => !oracle(d).clean, () => {
      const r = run(d, '--check');
      return r.exit === 1
        && r.text.split('\n')[0] === `SPOTCHECK_COVERAGE: DRIFT spotchecks=1 uncovered=1 first=${target} (first is not a regular file; --adopt cannot adopt it)`
        && exact(run(d, '--adopt', target), 2, 'REFUSED_OUT_OF_SCOPE');
    });
    d = fixture('adopt-unrelated-drift');
    writeFileSync(join(d, 'corpus/knowledge/unrelated.md'), '# Unrelated\n');
    test('adopt-unrelated-drift', () => !oracle(d).clean, () => {
      const r = run(d, '--adopt', target);
      const after = oracle(d);
      return r.exit === 0 && r.text.startsWith(`SPOTCHECK_ADOPT: ADOPTED ${target} wrote=both\n`)
        && after.findings.includes('uncovered:knowledge/unrelated.md');
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
    for (const name of ['malformed-pin', 'malformed-readme']) {
      d = fixture(name);
      test(name, () => !oracle(d).clean, () => {
        if (name === 'malformed-pin') writeFileSync(join(d, '.ufo/pins/readme-map.json'), '{');
        if (name === 'malformed-readme') writeFileSync(join(d, 'corpus/README.md'), '| lessons/broken.md | broken |\n');
        const before = hash(d);
        return exact(run(d, '--adopt', target), 2, 'REFUSED_ORACLE') && hash(d) === before;
      });
    }
    d = fixture('predict-pending', true, true);
    test('predict-pending', () => exact(run(d, '--predict', '75'), 0, `SPOTCHECK_PREDICT: COVERED ${target}`), () => {
      rmSync(join(d, target));
      writeFileSync(join(d, 'corpus/lessons/round-70.md'), '# Other\n');
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
    const journalNames = dir => {
      try { return readdirSync(join(dir, JOURNAL)); }
      catch (e) { if (e.code === 'ENOENT') return []; throw e; }
    };
    for (const stage of ['journal', 'row', 'pin']) {
      d = fixture(`crash-${stage}`);
      test(`crash-${stage}`, () => !oracle(d).clean, () => {
        const before = hash(d);
        const child = spawnSync(process.execPath, [SELF, '--lane', d, '--adopt', target], {
          encoding: 'utf8', env: { ...process.env, SPOTCHECK_ADOPT_TEST_CRASH: stage },
        });
        console.log(`CRASH ${stage} status=${child.status} signal=${child.signal}`);
        if (child.signal !== 'SIGKILL' || journalNames(d).length !== 1) return false;
        const post = hash(d);
        const row = readFileSync(join(d, 'corpus/README.md'), 'utf8').includes(`| \`${key}\` |`);
        const pin = JSON.parse(readFileSync(join(d, '.ufo/pins/readme-map.json'), 'utf8')).covered.includes(key);
        if (row !== (stage !== 'journal') || pin !== (stage === 'pin')) return false;
        const recovered = run(d, '--check');
        const outcome = stage === 'pin' ? 'complete' : 'rolled-back';
        return recovered.exit === (stage === 'pin' ? 0 : 1)
          && recovered.text.startsWith(`RECOVERED ${target} ${outcome}\n`)
          && hash(d) === (stage === 'pin' ? post : before) && journalNames(d).length === 0;
      });
    }
    d = fixture('stale-tmp');
    test('stale-tmp', () => !oracle(d).clean, () => {
      const before = hash(d), temp = join(d, JOURNAL, `${randomUUID()}.tmp`);
      mkdirSync(temp, { recursive: true });
      writeFileSync(join(temp, 'manifest.json'), '{');
      const recovered = run(d, '--predict', '76');
      return recovered.exit === 0 && recovered.text.startsWith('RECOVERED - stale\n')
        && hash(d) === before && journalNames(d).length === 0;
    });
    d = fixture('foreign-journal');
    test('foreign-journal', () => !oracle(d).clean, () => {
      const before = hash(d);
      const images = new Map(PRE.map(entry => [join(d, entry.path), readFileSync(join(d, entry.path))]));
      const journal = stageJournal(d, target, key, images);
      const manifestPath = join(journal, 'manifest.json');
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
      manifest.lane = `${d}-foreign`;
      const bytes = JSON.stringify(manifest);
      writeFileSync(manifestPath, bytes);
      return exact(run(d, '--check'), 2, 'REFUSED_JOURNAL_FOREIGN')
        && hash(d) === before && readFileSync(manifestPath, 'utf8') === bytes
        && journalNames(d).length === 1;
    });
    d = fixture('placement');
    test('placement', () => !oracle(d).clean, () => {
      writeFileSync(join(d, 'corpus/README.md'), '# Corpus\n\n## Coverage map\n\n## Known gaps\n\n- none\n');
      if (run(d, '--adopt', target).exit !== 0) return false;
      const raw = readFileSync(join(d, 'corpus/README.md'), 'utf8');
      return raw.indexOf(`| \`${key}\` |`) < raw.indexOf('## Known gaps') && oracle(d).clean;
    });
    d = fixture('recovery-idempotence', true, true);
    test('recovery-idempotence', () => oracle(d).clean, () => {
      const before = hash(d);
      stageJournal(d, target, key, new Map(PRE.map(entry => [join(d, entry.path), readFileSync(join(d, entry.path))])));
      if (!run(d, '--check').text.startsWith(`RECOVERED ${target} complete\n`)) return false;
      return exact(run(d, '--check'), 0, 'SPOTCHECK_COVERAGE: CLEAN spotchecks=1 uncovered=0\nMAP: CLEAN') && hash(d) === before;
    });
    for (const newline of [false, true]) {
      d = fixture(`pin-final-newline-${newline}`);
      test(`pin-final-newline-${newline}`, () => !oracle(d).clean, () => {
        const pinPath = join(d, '.ufo/pins/readme-map.json');
        writeFileSync(pinPath, readFileSync(pinPath, 'utf8').trimEnd() + (newline ? '\n' : ''));
        return run(d, '--adopt', target).exit === 0
          && readFileSync(pinPath, 'utf8').endsWith('\n') === newline;
      });
    }
    d = fixture('corrupt-pre-image');
    test('corrupt-pre-image', () => !oracle(d).clean, () => {
      const before = hash(d);
      const journal = stageJournal(d, target, key, new Map(PRE.map(entry => [join(d, entry.path), readFileSync(join(d, entry.path))])));
      writeFileSync(join(journal, 'readme-map.pre'), 'corrupt');
      return exact(run(d, '--check'), 2, 'REFUSED_ORACLE')
        && hash(d) === before && journalNames(d).length === 1;
    });
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
  const lines = [];
  let result;
  try {
    recover(lane, lines);
    result = evaluate(lane, arm, args[1]);
  } catch (e) { result = e.token ? { exit: 2, lines: [e.token] } : refuse(); }
  result.lines.unshift(...lines);
  console.log(result.lines.join('\n'));
  return result.exit;
}
process.exitCode = main(process.argv.slice(2));
