#!/usr/bin/env node
/**
 * cite-sources.mjs — gate `cite-sources` (contract `kumitate-cite-sources-v1`).
 *
 *   node scripts/cite-sources.mjs [--readme PATH] [--sources PATH]
 *   node scripts/cite-sources.mjs --selftest
 *
 * A README map row (a line whose first non-space characters are `| `) may cite
 * a source id `S` + 3 or more digits. Each such id must be a row id in
 * corpus/SOURCES.md. One- and two-digit tokens (registry family ids S1–S11)
 * are not source ids and are ignored. This is the class routed as R58-V3:
 * corpus/README.md cited S121, which is not a row.
 *
 *   CITE_SOURCES: CLEAN cited=<n>                         exit 0
 *   CITE_SOURCES: DRIFT ghosts=<k> first=<id>             exit 1
 *   CITE_SOURCES: FAIL-CLOSED reason=<why>                exit 2
 *   CITE_SOURCES: USAGE ...                               exit 64
 *
 * The gate reads the two files and writes nothing.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const ID_RE = /\bS[0-9]{3,}\b/g;

function usage() {
  process.stdout.write('CITE_SOURCES: USAGE node scripts/cite-sources.mjs [--readme PATH] [--sources PATH] | --selftest\n');
  process.exit(64);
}

function registryIds(text) {
  const ids = new Set();
  for (const line of text.split('\n')) {
    const m = line.match(/^ {0,3}\|\s*(S[0-9]{3,})\s*\|/);
    if (m) ids.add(m[1]);
  }
  return ids;
}

function citedIds(readme) {
  const cited = [];
  for (const line of readme.split('\n')) {
    if (!/^\s*\| /.test(line)) continue;
    const found = line.match(ID_RE);
    if (found) cited.push(...found);
  }
  return cited;
}

function evaluate(readmeText, sourcesText) {
  const ids = registryIds(sourcesText);
  const cited = citedIds(readmeText);
  const ghosts = [];
  const seen = new Set();
  for (const id of cited) {
    if (ids.has(id) || seen.has(id)) continue;
    seen.add(id);
    ghosts.push(id);
  }
  if (ghosts.length) {
    return { code: 1, line: `CITE_SOURCES: DRIFT ghosts=${ghosts.length} first=${ghosts[0]}` };
  }
  return { code: 0, line: `CITE_SOURCES: CLEAN cited=${cited.length}` };
}

function readOrFail(path, why) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    process.stdout.write(`CITE_SOURCES: FAIL-CLOSED reason=${why}\n`);
    process.exit(2);
  }
}

function run(argv) {
  let readme = 'corpus/README.md';
  let sources = 'corpus/SOURCES.md';
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-h' || a === '--help') usage();
    else if (a === '--readme') { readme = argv[++i]; if (!readme) usage(); }
    else if (a === '--sources') { sources = argv[++i]; if (!sources) usage(); }
    else usage();
  }
  const readmeText = readOrFail(resolve(readme), 'README_UNREADABLE');
  const sourcesText = readOrFail(resolve(sources), 'SOURCES_UNREADABLE');
  const result = evaluate(readmeText, sourcesText);
  process.stdout.write(result.line + '\n');
  process.exit(result.code);
}

function selftest() {
  const root = mkdtempSync(join(tmpdir(), 'cite-sources.'));
  const cases = [];
  const check = (name, ok, detail) => cases.push({ name, ok, detail });
  try {
    const rd = join(root, 'corpus');
    mkdirSync(rd, { recursive: true });
    const readme = join(rd, 'README.md');
    const sources = join(rd, 'SOURCES.md');
    const sourcesBody = '| id | source |\n|---|---|\n| S112 | example |\n| S122 | example |\n';
    writeFileSync(sources, sourcesBody);
    writeFileSync(readme, '| `knowledge/a.md` | cites S112 and S122 |\n');
    let r = evaluate(readFileSync(readme, 'utf8'), readFileSync(sources, 'utf8'));
    check('clean-known-ids', r.code === 0 && r.line.includes('CLEAN'), r.line);

    writeFileSync(readme, '| `knowledge/failure-recovery-replay.md` | Temporal replay (S121) |\n');
    r = evaluate(readFileSync(readme, 'utf8'), readFileSync(sources, 'utf8'));
    check('ghost-s121', r.code === 1 && r.line.includes('first=S121'), r.line);

    writeFileSync(readme, '| `knowledge/ops-watchers.md` | family S6 and S7 and S8 |\n');
    r = evaluate(readFileSync(readme, 'utf8'), readFileSync(sources, 'utf8'));
    check('family-ids-ignored', r.code === 0 && r.line.includes('CLEAN'), r.line);

    writeFileSync(readme, '| `knowledge/a.md` | S121 and S999 |\n');
    r = evaluate(readFileSync(readme, 'utf8'), readFileSync(sources, 'utf8'));
    check('two-ghosts-first-named', r.code === 1 && r.line.includes('ghosts=2') && r.line.includes('first=S121'), r.line);

    writeFileSync(readme, 'prose mentions S121 but is not a map row\n| `knowledge/a.md` | S112 |\n');
    r = evaluate(readFileSync(readme, 'utf8'), readFileSync(sources, 'utf8'));
    check('prose-outside-rows-ignored', r.code === 0, r.line);

    writeFileSync(sources, 'not a table\n');
    writeFileSync(readme, '| `knowledge/a.md` | S112 |\n');
    r = evaluate(readFileSync(readme, 'utf8'), readFileSync(sources, 'utf8'));
    check('unparsed-registry-is-drift', r.code === 1 && r.line.includes('first=S112'), r.line);

    writeFileSync(readme, 'no map rows\n');
    writeFileSync(sources, sourcesBody);
    r = evaluate(readFileSync(readme, 'utf8'), readFileSync(sources, 'utf8'));
    check('no-citations-clean', r.code === 0 && r.line.includes('cited=0'), r.line);

    const help = awaitChild(['--help']);
    check('usage-64', help.status === 64 && help.stdout.includes('USAGE'), `status=${help.status}`);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
  const passed = cases.filter((c) => c.ok).length;
  const failed = cases.filter((c) => !c.ok);
  for (const c of cases) {
    process.stdout.write(`${c.ok ? 'PASS' : 'FAIL'} ${c.name}${c.ok ? '' : ' — ' + c.detail}\n`);
  }
  const line = `CITE_SOURCES_SELFTEST: ${failed.length ? 'FAIL' : 'PASS'} (${passed}/${cases.length})`;
  process.stdout.write(line + '\n');
  process.stdout.write(`VERDICT: ${failed.length ? 'FAIL' : 'PASS'}\n`);
  process.exit(failed.length ? 1 : 0);
}

function awaitChild(args) {
  return spawnSync(process.execPath, [process.argv[1], ...args], { encoding: 'utf8' });
}

const argv = process.argv.slice(2);
if (argv.includes('--selftest')) {
  selftest();
} else {
  run(argv);
}
