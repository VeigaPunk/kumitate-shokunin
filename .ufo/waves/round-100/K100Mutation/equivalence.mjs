#!/usr/bin/env node
// equivalence.mjs — K2 (kumitate r100): per-row behaviour fingerprint of one (cite, capture) pair
// against a fixed 26-row battery, for mutant/reference diffing and equivalence classification.
// Not the frozen counter: no census, no seed; each row's probe id is fixed and printed.
//
// usage: node equivalence.mjs --cite <cite-sources.mjs> --capture <source-capture.mjs> --work <dir>
// stdout: JSON {cite:{S###:"row"|"ghost"|"err..."}, capture:{S###:true}, capState, errors}
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

const argv = process.argv.slice(2);
const opt = {};
for (let i = 0; i < argv.length; i += 2) {
  if (!['--cite', '--capture', '--work'].includes(argv[i])) { console.error('usage'); process.exit(64); }
  opt[argv[i].slice(2)] = argv[i + 1];
}
if (!opt.cite || !opt.capture || !opt.work) { console.error('usage'); process.exit(64); }
const sha = (b) => createHash('sha256').update(b).digest('hex');
const row = (idCell) => `|${idCell}| Fixture | docs | A | scope | anchor | teaches | mined | 2026-01-01 | 90d | p |`;

// 26 drawn rows: [probe id the row "means", physical line]
const ROWS = [
  ['S101', row(' S101 ')],                                  // clean
  ['S102', row('\tS102\t')],                                // TAB pads
  ['S103', row('    S103    ')],                            // 4-SP pads
  ['S104', row('\t \t \t \t S104 \t \t \t \t')],            // 8-char pads
  ['S105', row('\u00a0S105\u00a0')],                        // NBSP pad
  ['S106', row('\vS106\v')],                                // VT pad
  ['S107', row(' S107\f')],                                 // FF trail
  ['S108', row('\u2028S108')],                              // LS lead pad
  ['S109', row('\rS109')],                                  // CR lead pad (same LF record)
  ['S110', row(' S110 ') + '\r'],                           // CRLF row
  ['S111', '    ' + row(' S111 ')],                         // 4-SP indent
  ['S112', '\t' + row(' S112 ')],                           // TAB indent
  ['S113', '\u00a0' + row(' S113 ')],                       // NBSP indent
  ['S114', row(' S114x ')],                                 // trailing letter
  ['S115', row(' s115 ')],                                  // lowercase
  ['S116', row(' S116 ').replace('| S116 |', '| S116  ')],  // id cell not closed by a pipe
  ['S117', row(' S117 S118 ')],                             // two ids
  ['S119', row('\u3000S119\u3000')],                        // U+3000 pad
  ['S120', row('\ufeffS120\ufeff')],                        // U+FEFF pad
  ['S121', row(' S121x')],                                  // trailing letter, no pad
  ['S122', 'note | S122 | prose'],                          // mid-line row (gate not at start)
  ['S123', row(' S 123 ')],                                 // inner space
  ['S124', 'note:\u2028' + row(' S124 ')],                  // LS break, text before row
  ['S125', row(' S\uff11\uff12\uff15 ')],                   // fullwidth digits
  ['S126', row(' S126 ') + '\u2029'],                       // PS after the row, same record
  ['S127', '\u3000' + row(' S127 ')],                       // U+3000 indent
  ['S99', row(' S99 ')],                                    // 2-digit id cell (census: E02)
  ['S7', row(' S7 ')],                                      // 1-digit id cell (census: E02)
];

const work = opt.work;
rmSync(work, { recursive: true, force: true });
mkdirSync(join(work, 'fx'), { recursive: true });
const fx = join(work, 'fx');
const citePath = join(work, 'cite.mjs');
const capPath = join(work, 'capture.mjs');
writeFileSync(citePath, readFileSync(opt.cite));
writeFileSync(capPath, readFileSync(opt.capture));
const srcPath = join(fx, 'SOURCES.md');
writeFileSync(srcPath, '# Sources — equivalence battery\n\n## Registry\n\n'
  + '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'
  + '|---|---|---|---|---|---|---|---|---|---|---|\n'
  + ROWS.map((r) => r[1]).join('\n')
  + '\n\n## Search log\n\n- fixed\n');
const env = { ...process.env, TMPDIR: work, SHOKUNIN_ROOT: join(work, 'no-root') };
mkdirSync(join(work, 'no-root'), { recursive: true });

const cite = {};
const errors = [];
for (const [probe] of ROWS) {
  const readme = join(fx, `README-${probe}.md`);
  writeFileSync(readme, `| \`knowledge/k.md\` | cites ${probe} |\n`);
  const r = spawnSync(process.execPath, [citePath, '--readme', readme, '--sources', srcPath],
    { encoding: 'utf8', env, cwd: fx });
  const out = r.stdout.trim();
  if (r.status === 0 && out === 'CITE_SOURCES: CLEAN cited=1') cite[probe] = 'row';
  else if (r.status === 1 && out === `CITE_SOURCES: DRIFT ghosts=1 first=${probe}`) cite[probe] = 'ghost';
  else cite[probe] = `err(exit=${r.status} ${JSON.stringify(out.slice(0, 60))})`;
}

// capture: bind every S### probe id (anchor captured, the rest exempted). 1-2 digit ids cannot be
// bound (the registry's SID rule is unchanged by R100), so a reader that recognises them reports
// them `uncaptured` — the observable difference for a {2,} reader.
const capBuf = Buffer.from(`equivalence ${ROWS.length}\n`);
writeFileSync(join(fx, 'cap.txt'), capBuf);
const toks = ROWS.map((r) => r[0]);
const boundIds = toks.filter((id) => /^S[0-9]{3,}$/.test(id));
writeFileSync(join(fx, 'reg.json'), JSON.stringify({
  version: 1,
  captures: [{ sourceId: boundIds[0], path: 'cap.txt', sha256: sha(capBuf), bytes: capBuf.length, captured: '2026-11-07' }],
  exemptions: [{ ids: boundIds.slice(1), reason: 'equivalence battery' }],
}));
const cr = spawnSync(process.execPath, [capPath, '--registry', join(fx, 'reg.json'), '--sources', srcPath],
  { encoding: 'utf8', env, cwd: fx });
const captured = {};
let capState;
if (cr.status === 0 && /^SOURCE_CAPTURE: CLEAN /m.test(cr.stdout)) {
  capState = 'clean';
  for (const id of boundIds) captured[id] = true;
} else if (cr.status === 1) {
  capState = 'drift';
  const orphans = new Set();
  for (const line of cr.stdout.split('\n')) {
    const m = line.match(/^SOURCE_CAPTURE: note (\S+)$/) || line.match(/^SOURCE_CAPTURE: DRIFT .* first=(\S+)$/);
    if (!m) continue;
    const k = m[1].lastIndexOf(':');
    const id = m[1].slice(0, k); const why = m[1].slice(k + 1);
    if (why === 'orphan-exemption' || why === 'orphan-capture') orphans.add(id);
    else if (why === 'uncaptured') captured[id] = true;
    else errors.push(`unexpected-item:${m[1]}`);
  }
  for (const id of boundIds) if (!orphans.has(id)) captured[id] = true;
} else {
  capState = `exit=${cr.status}`;
  errors.push(`capture:${JSON.stringify(cr.stdout.trim().slice(0, 120))}`);
}
for (const id of Object.keys(captured)) if (!toks.includes(id)) errors.push(`extra-id:${JSON.stringify(id)}`);
process.stdout.write(JSON.stringify({ cite, capture: captured, capState, errors }) + '\n');
