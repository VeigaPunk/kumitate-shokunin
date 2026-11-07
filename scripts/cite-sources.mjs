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
 *
 * A SOURCES row id is read as the census `row_pass` reads it (rule R100): one
 * LF-delimited record per line, 0-3 leading ASCII SP before the `|`, the id cell
 * padded with ASCII SP/TAB only, and the id is `S` + 3+ ASCII digits closed by `|`.
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
    const m = line.match(/^ {0,3}\|[ \t]*(S[0-9]{3,})[ \t]*\|/);
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

    // --- rule R100 (round 100): SOURCES row ids read as the census row_pass reads
    // them — one LF record per line, 0-3 leading ASCII SP, id cell padded with
    // ASCII SP/TAB only, id = `S` + 3+ ASCII digits closed by `|`. Each case
    // asserts the exact verdict line.
    const r100cite = (name, sourcesText, readmeText, wantCode, wantLine) => {
      writeFileSync(sources, sourcesText);
      writeFileSync(readme, readmeText);
      const r = evaluate(readFileSync(readme, 'utf8'), readFileSync(sources, 'utf8'));
      check(name, r.code === wantCode && r.line === wantLine, r.line);
    };

    // Non-blank JS-\s pads on the id are NOT rows (census: E02) — a cited id drifts.
    r100cite('r100-pad-nbsp-not-row', '|\u00A0S901\u00A0| x |\n', '| `k.md` | cites S901 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S901');
    r100cite('r100-pad-u2003-not-row', '|\u2003S902\u2003| x |\n', '| `k.md` | cites S902 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S902');
    r100cite('r100-pad-vt-not-row', '|\u000BS903\u000B| x |\n', '| `k.md` | cites S903 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S903');
    r100cite('r100-pad-cr-not-row', '|\rS904\r| x |\n', '| `k.md` | cites S904 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S904');
    r100cite('r100-pad-feff-not-row', '|\uFEFFS905\uFEFF| x |\n', '| `k.md` | cites S905 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S905');
    r100cite('r100-pad-u2028-not-row', '|\u2028S906\u2028| x |\n', '| `k.md` | cites S906 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S906');

    // A single-sided JS-\s pad is enough to leave the census's row class.
    r100cite('r100-leadpad-not-row', '|\u2003S907| x |\n', '| `k.md` | cites S907 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S907');
    r100cite('r100-trailpad-not-row', '|S908\u2003| x |\n', '| `k.md` | cites S908 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S908');

    // SP/TAB pads of length 1, 4 and 8 ARE rows.
    r100cite('r100-blankpad-rows',
      '|\tS911\t| x |\n|\t\t\t\tS912\t\t\t\t| x |\n|\t\t\t\t\t\t\t\tS913\t\t\t\t\t\t\t\t| x |\n'
      + '| S914 | x |\n|    S915    | x |\n|        S916        | x |\n',
      '| `k.md` | cites S911 S912 S913 S914 S915 S916 |\n',
      0, 'CITE_SOURCES: CLEAN cited=6');

    // Indents of 0-3 SP are rows; 4 SP / TAB / NBSP are not.
    r100cite('r100-indent-rows',
      '| S921 | x |\n | S922 | x |\n  | S923 | x |\n   | S924 | x |\n',
      '| `k.md` | cites S921 S922 S923 S924 |\n',
      0, 'CITE_SOURCES: CLEAN cited=4');
    r100cite('r100-indent4-not-row', '    | S925 | x |\n', '| `k.md` | cites S925 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S925');
    r100cite('r100-indent-tab-not-row', '\t| S926 | x |\n', '| `k.md` | cites S926 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S926');
    r100cite('r100-indent-nbsp-not-row', '\u00A0| S927 | x |\n', '| `k.md` | cites S927 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S927');

    // The id is `S` + 3+ ASCII digits closed by `|`: S928x and a two-id cell are not rows.
    r100cite('r100-s123x-not-row', '| S928x | junk |\n| S929 S930 | two |\n',
      '| `k.md` | cites S928 and S929 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=2 first=S928');

    // A CRLF row is still one LF record ending in CR — a row.
    r100cite('r100-crlf-row', '| S931 | x |\r\n', '| `k.md` | cites S931 |\n',
      0, 'CITE_SOURCES: CLEAN cited=1');

    // Lowercase `s` and non-ASCII digits are not rows (the ASCII id stays readable).
    r100cite('r100-lowercase-not-row', '| S933 | ok |\n| s932 | lower |\n', '| `k.md` | cites S933 |\n',
      0, 'CITE_SOURCES: CLEAN cited=1');
    r100cite('r100-fullwidth-not-row', '| S935 | ok |\n| S９３４ | fw |\n', '| `k.md` | cites S935 |\n',
      0, 'CITE_SOURCES: CLEAN cited=1');

    // M2 (round 100, K100CriticA h01-h08/h12/h14, K100Mutation): classes the frozen counter
    // never draws. Every other JS-\s / Zs / Cf / NUL pad is not a row; neither is an
    // U+2000 indent or a digit-group U+2009; ids of 9 and 10 digits and a row after
    // 1000 records are rows; an indented README map row is still read.
    const m2pads = [['u2000', '\u2000'], ['u2001', '\u2001'], ['u2004', '\u2004'], ['u2005', '\u2005'],
      ['u2006', '\u2006'], ['u2007', '\u2007'], ['u2008', '\u2008'], ['u200a', '\u200A'], ['nul', '\u0000'],
      ['zwnj', '\u200C'], ['zwj', '\u200D'], ['nel', '\u0085'], ['ff', '\f']];
    m2pads.forEach(([tag, ch], i) => {
      const id = `S94${i}`;
      r100cite(`m2-pad-${tag}-not-row`, `|${ch}${id}${ch}| x |\n`, `| \`k.md\` | cites ${id} |\n`,
        1, `CITE_SOURCES: DRIFT ghosts=1 first=${id}`);
    });
    r100cite('m2-indent-u2000-not-row', '\u2000| S960 | x |\n', '| `k.md` | cites S960 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S960');
    r100cite('m2-digit-thinsp-not-row', '| S9\u200961 | x |\n', '| `k.md` | cites S961 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S961');
    r100cite('m2-samerecord-nel-vt-ff-not-row',
      'a\u0085| S962 | x |\nb\u000B| S963 | x |\nc\f| S964 | x |\n', '| `k.md` | cites S962 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S962');
    r100cite('m2-long-ids-rows', '| S123456789 | x |\n| S1234567890 | x |\n',
      '| `k.md` | cites S123456789 and S1234567890 |\n', 0, 'CITE_SOURCES: CLEAN cited=2');
    r100cite('m2-row-after-1000-records', `${'prose\n'.repeat(1000)}| S965 | x |\n`,
      '| `k.md` | cites S965 |\n', 0, 'CITE_SOURCES: CLEAN cited=1');
    // K100Mutation M32: a row after CR / U+2028 / U+2029 on the same LF record is not a row.
    r100cite('m2-samerecord-cr-ls-ps-not-row',
      'a\r| S968 | x |\nb\u2028| S969 | x |\nc\u2029| S970 | x |\n', '| `k.md` | cites S968 S969 S970 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=3 first=S968');
    r100cite('m2-readme-indented-map-row', '| S966 | x |\n', '  | `k.md` | cites S967 |\n',
      1, 'CITE_SOURCES: DRIFT ghosts=1 first=S967');

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
