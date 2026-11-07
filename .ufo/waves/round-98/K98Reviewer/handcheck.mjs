#!/usr/bin/env node
/* K98Reviewer hand-check: the R98 reference predicate vs the live census grammar.
 * Writes one tiny fixture per case, runs `sources-census.sh validate --file`, and
 * compares the census codes (W03/E12/E01/E02) with what R98 predicts.
 * Read-only on the lane; writes only its own scratch + seat receipts. */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh';
const W = '/fast/scratch/hyaku/kumitate-r98/K98Reviewer/handcheck';
mkdirSync(W, { recursive: true });
const TODAY = '2026-11-07';

/* exactly R98: ASCII space + TAB only, no flags */
const ROW = /^ {0,3}\|[ \t]*S\d{3,}[ \t]*\|/;
const URL_RE = /https?:\/\/[^\s|)`'"<>]+/g;
const PIN_RE = /^[0-9a-f]{40}$/;
const SEG_RE = /[/?#]/;

function refDeclared(text) {
  const pinned = [];
  const malformed = [];
  const outside = [];
  let inReg = false;
  for (const line of text.split('\n')) {
    if (/^ {0,3}##[ \t]/.test(line)) { inReg = line.replace(/^ {0,3}##/, '').replace(/^[ \t]+|[ \t]+$/g, '') === 'Registry'; continue; }
    if (/^ {0,3}#[ \t]/.test(line)) { inReg = false; continue; }
    if (!ROW.test(line)) continue;
    const fields = line.split('|');
    if (!inReg) { outside.push(fields[1].trim()); continue; }
    if (fields.length !== 13) { malformed.push(fields[1].trim()); continue; }
    const status = (fields[8] ?? '').trim();
    if (status.toLowerCase() === 'rejected') continue;
    for (const m of line.matchAll(URL_RE)) {
      for (const seg of m[0].split(SEG_RE)) if (PIN_RE.test(seg)) pinned.push(seg);
    }
  }
  return { pinned: [...new Set(pinned)], malformed, outside };
}

const pinOf = (label) => createHash('sha256').update(`handcheck:${label}`).digest('hex').slice(0, 40);
const URL = (p) => `https://github.com/o/r/blob/${p}/x.ts`;
function rowText(x) {
  const tail = x.width === 13 ? ' 2026-11-01 | 30d | — |' : ' 2026-11-01 | 30d |';
  return `${x.indent}|${x.lead}${x.id}${x.trail}| src ${URL(pinOf(x.label))} | code | A | scope-x | anchor | teaches a thing | ${x.status} |${tail}`;
}
function fileFor(x) {
  const row = rowText(x);
  if (x.ctx === 'L') return `# SOURCES fixture\n\n## Leads (unopened)\n\n${row}\n`;
  if (x.ctx === 'P') return `${row}\n\n# SOURCES fixture\n\n## Registry\n\n`;
  return `# SOURCES fixture\n\n## Registry\n\n${row}\n`;
}
function census(file) {
  const r = spawnSync('bash', [CENSUS, 'validate', '--file', file, '--today', TODAY], { encoding: 'utf8' });
  const lines = r.stdout.split('\n').filter(Boolean).map((l) => l.split('\t'));
  const ids = (code) => lines.filter((f) => f[1] === code).map((f) => f.slice(2).join('\t'));
  const w03 = ids('W03').map((s) => s.replace(/ mined but unused$/, ''));
  const e12 = ids('E12').map((s) => s.replace(/ row outside Registry section$/, ''));
  const e01 = ids('E01').map((s) => s.replace(/ fields=\d+$/, ''));
  const e02 = ids('E02');
  return { rc: r.status, w03, e12, e01, e02 };
}
const esc = (s) => [...s].map((c) => (c.codePointAt(0) < 0x20 || c.codePointAt(0) > 0x7e
  ? `\\u${c.codePointAt(0).toString(16).padStart(4, '0')}` : c)).join('');

let base = 0;
const nid = () => `S${(700001 + base++).toString()}`;
const cases = [
  { label: 'R13 lead:none', ctx: 'R', lead: '', trail: ' ' },
  { label: 'R13 lead:SP', ctx: 'R', lead: ' ', trail: ' ' },
  { label: 'R13 lead:2SP', ctx: 'R', lead: '  ', trail: ' ' },
  { label: 'R13 lead:TAB', ctx: 'R', lead: '\t', trail: ' ' },
  { label: 'R13 lead:SPTAB', ctx: 'R', lead: ' \t', trail: ' ' },
  { label: 'R13 lead:TABSP', ctx: 'R', lead: '\t ', trail: ' ' },
  { label: 'R13 lead:VT', ctx: 'R', lead: '\v', trail: ' ' },
  { label: 'R13 lead:FF', ctx: 'R', lead: '\f', trail: ' ' },
  { label: 'R13 lead:CR', ctx: 'R', lead: '\r', trail: ' ' },
  { label: 'R13 lead:NEL', ctx: 'R', lead: '\u0085', trail: ' ' },
  { label: 'R13 lead:NBSP', ctx: 'R', lead: '\u00a0', trail: ' ' },
  { label: 'R13 lead:U+180E', ctx: 'R', lead: '\u180e', trail: ' ' },
  { label: 'R13 lead:U+2003', ctx: 'R', lead: '\u2003', trail: ' ' },
  { label: 'R13 lead:U+2028', ctx: 'R', lead: '\u2028', trail: ' ' },
  { label: 'R13 lead:U+FEFF', ctx: 'R', lead: '\ufeff', trail: ' ' },
  { label: 'R13 lead:SP+NBSP', ctx: 'R', lead: ' \u00a0', trail: ' ' },
  { label: 'R13 trail:TAB', ctx: 'R', lead: ' ', trail: '\t' },
  { label: 'R13 trail:VT', ctx: 'R', lead: ' ', trail: '\v' },
  { label: 'R12 lead:SP', ctx: 'R', width: 12, lead: ' ', trail: ' ' },
  { label: 'R12 lead:NBSP', ctx: 'R', width: 12, lead: '\u00a0', trail: ' ' },
  { label: 'R13rej lead:SP', ctx: 'R', status: 'rejected', lead: ' ', trail: ' ' },
  { label: 'R13rej lead:NBSP', ctx: 'R', status: 'rejected', lead: '\u00a0', trail: ' ' },
  { label: 'L13 lead:SP', ctx: 'L', lead: ' ', trail: ' ' },
  { label: 'L13 lead:NBSP', ctx: 'L', lead: '\u00a0', trail: ' ' },
  { label: 'L13 trail:TAB', ctx: 'L', lead: ' ', trail: '\t' },
  { label: 'L13 lead:CR', ctx: 'L', lead: '\r', trail: ' ' },
  { label: 'P lead:SP', ctx: 'P', lead: ' ', trail: ' ' },
  { label: 'P lead:CR', ctx: 'P', lead: '\r', trail: ' ' },
  { label: 'R13 indent:3SP', ctx: 'R', indent: '   ', lead: ' ', trail: ' ' },
  { label: 'R13 indent:4SP', ctx: 'R', indent: '    ', lead: ' ', trail: ' ' },
  { label: 'R13 indent:TAB', ctx: 'R', indent: '\t', lead: ' ', trail: ' ' },
  { label: 'L13 indent:SPTAB', ctx: 'L', indent: ' \t', lead: ' ', trail: ' ' },
  { label: 'R13 id:2digit', ctx: 'R', id: 'S12', lead: ' ', trail: ' ' },
  { label: 'R13 id:lower', ctx: 'R', id: 's700999', lead: ' ', trail: ' ' },
  { label: 'R13 id:trailalpha', ctx: 'R', id: 'S700998x', lead: ' ', trail: ' ' },
];

const out = [];
let bad = 0;
for (const c0 of cases) {
  const x = { width: 13, status: 'mined', indent: '', lead: ' ', trail: ' ', ...c0, id: c0.id ?? nid() };
  const text = fileFor(x);
  const f = join(W, `${x.label.replace(/[^A-Za-z0-9]+/g, '_')}.md`);
  writeFileSync(f, text);
  const ref = refDeclared(text);
  const cen = census(f);
  const idCell = `${x.lead}${x.id}${x.trail}`;
  const admitted = ROW.test(text.split('\n').find((l) => l.includes(x.id)) ?? '');
  const refDecl = ref.pinned.map((p) => p.slice(0, 12));
  const cenDecl = cen.w03.filter((i) => /^S[0-9]{3,}$/.test(i)).map(() => pinOf(x.label).slice(0, 12));
  const refOut = ref.outside; const cenOut = cen.e12;
  const refMal = ref.malformed; const cenMal = cen.e01.filter((i) => /^S[0-9]{3,}$/.test(i));
  const agreeDecl = refDecl.join(' ') === cenDecl.join(' ');
  const agreeOut = refOut.join(' ') === cenOut.join(' ');
  const agreeMal = refMal.join(' ') === cenMal.join(' ');
  const fine = agreeDecl && agreeOut && agreeMal;
  if (!fine) bad++;
  out.push([
    x.label.padEnd(20),
    `cell=[${esc(idCell)}]`.padEnd(24),
    `admitted=${admitted ? 'Y' : 'N'}`,
    `ref{d=${refDecl.length},o=${refOut.length},m=${refMal.length}}`.padEnd(22),
    `census{W03=${cen.w03.length},E12=${cen.e12.length},E01=${cen.e01.length},E02=${cen.e02.length}}`.padEnd(34),
    `rc=${cen.rc}`,
    fine ? 'AGREE' : 'DISAGREE',
  ].join(' '));
}

/* class matrix: every pad class in lead/trail/both x {inside 13, outside, inside 12} */
const PADS = [
  ['none', ''], ['SP', ' '], ['2SP', '  '], ['TAB', '\t'], ['SPTAB', ' \t'], ['TABSP', '\t '],
  ['VT', '\v'], ['FF', '\f'], ['CR', '\r'], ['TABFF', '\t\f'], ['NEL', '\u0085'], ['NBSP', '\u00a0'],
  ['OGHAM', '\u1680'], ['MVS', '\u180e'], ['ENQUAD', '\u2000'], ['ENSP', '\u2002'], ['EMSP', '\u2003'],
  ['FIGSP', '\u2007'], ['THINSP', '\u2009'], ['HAIRSP', '\u200a'], ['ZWSP', '\u200b'], ['ZWNJ', '\u200c'],
  ['ZWJ', '\u200d'], ['LS', '\u2028'], ['PS', '\u2029'], ['NNBSP', '\u202f'], ['MMSP', '\u205f'],
  ['WJ', '\u2060'], ['IDSP', '\u3000'], ['BOM', '\ufeff'], ['SPNBSP', ' \u00a0'], ['NBSPSP', '\u00a0 '],
];
const reg = []; const leads = [];
const expect = { decl: [], out: [], malf: [] };
const idPin = new Map();
const seen = new Set();
const mid = () => { for (;;) { const id = `S${800000 + base++}`; if (!seen.has(id)) { seen.add(id); return id; } } };
for (const [pn, p] of PADS) {
  for (const [shape, lead, trail] of [['lead', p, ' '], ['trail', ' ', p], ['both', p, p]]) {
    const id = mid();
    const label = `M13 ${shape}:${pn} ${id}`;
    const rline = rowText({ id, lead, trail, width: 13, status: 'mined', indent: '', label });
    reg.push(rline);
    idPin.set(id, pinOf(label).slice(0, 12));
    if (ROW.test(rline)) expect.decl.push(pinOf(label).slice(0, 12));
    const oid = mid();
    const oline = rowText({ id: oid, lead, trail, width: 13, status: 'mined', indent: '', label: `MO ${shape}:${pn} ${oid}` });
    leads.push(oline);
    if (ROW.test(oline)) expect.out.push(oline.split('|')[1].trim());
    const midid = mid();
    const mline = rowText({ id: midid, lead, trail, width: 12, status: 'mined', indent: '', label: `M12 ${shape}:${pn} ${midid}` });
    reg.push(mline);
    if (ROW.test(mline) && mline.split('|').length !== 13) expect.malf.push(mline.split('|')[1].trim());
  }
}
const lines = ['# SOURCES fixture', '', '## Registry', '', ...reg, '', '## Leads (unopened)', '', ...leads];
const mf = join(W, 'matrix.md');
writeFileSync(mf, `${lines.join('\n')}\n`);
const refM = refDeclared(`${lines.join('\n')}\n`);
const cenM = census(mf);
const cenMDecl = cenM.w03.filter((i) => /^S[0-9]{3,}$/.test(i));
const okM = refM.pinned.map((p) => p.slice(0, 12)).sort().join() === cenMDecl.map((i) => idPin.get(i)).sort().join()
  && [...new Set(expect.out)].sort().join() === [...new Set(cenM.e12)].sort().join()
  && [...new Set(expect.malf)].sort().join() === [...new Set(cenM.e01.filter((i) => /^S[0-9]{3,}$/.test(i)))].sort().join();
out.push('');
out.push(`MATRIX pads=${PADS.length} rows=${lines.filter((l) => l.includes('| S') || /^\|/.test(l)).length - 2} `
  + `ref d=${refM.pinned.length} o=${refM.outside.length} m=${refM.malformed.length} `
  + `census W03=${cenM.w03.length} E12=${cenM.e12.length} E01=${cenM.e01.length} E02=${cenM.e02.length} rc=${cenM.rc} agree=${okM}`);
let inv = 0; let invBad = 0;
for (const line of lines) if (ROW.test(line)) { inv++; const cell = line.split('|')[1]; if (cell.trim() !== cell.replace(/^[ \t]+|[ \t]+$/g, '')) invBad++; }
out.push(`INVARIANT admitted_lines=${inv} fields1_trim_ne_census_trim=${invBad}`);
out.push(`HANDCHECK cases=${cases.length} disagree=${bad} matrix_agree=${okM}`);
writeFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-98/K98Reviewer/handcheck.txt', `${out.join('\n')}\n`);
process.stdout.write(`${out.join('\n')}\n`);
process.exit(bad === 0 && okM ? 0 : 1);
