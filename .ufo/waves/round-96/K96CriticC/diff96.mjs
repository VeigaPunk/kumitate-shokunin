// diff96.mjs — K96CriticC differential for hypothesis H96.
// Compares the R96 reference rule (ctl-positive generated from BASE by make-controls96.py)
// against: (1) the frozen clause battery fixtures A/B, (2) every historical revision of
// kumitate corpus/SOURCES.md, (3) every sibling lane's current registry, (4) 300 seeded
// mutations of the current kumitate registry, plus adversarial whitespace-class probes.
// For each file: harness outside ids vs census E12 ids; R96 declared set vs BASE declared set
// on files whose census E12 list is empty; malformedRows vs census E01 as a secondary axis.
// Census calls run in parallel (each invocation forks ~900 children and takes ~3 s).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawn } from 'node:child_process';
import { loadRule } from './rule.mjs';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const FLEET = '/home/vgpnk/Projects/shokunin';
const CENSUS = path.join(FLEET, 'scripts/sources-census.sh');
const SEAT = path.join(LANE, '.ufo/waves/round-96/K96CriticC');
const EV = process.env.EV || path.join(SEAT, "evidence");
const S = process.env.SCRATCH;
if (!S) throw new Error('SCRATCH unset');
for (const d of [EV, path.join(S, 'revs'), path.join(S, 'mut'), path.join(S, 'fx'), path.join(S, 'adv')]) {
  fs.mkdirSync(d, { recursive: true });
}

const TOOL_BASE = path.join(LANE, 'scripts/round-gate.mjs');
const TOOL_R96 = process.env.R96_TOOL || path.join(S, 'ctlgen/ctl-positive.mjs');
const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const CONCURRENCY = 12;

const ruleBase = loadRule(TOOL_BASE);
const ruleR96 = loadRule(TOOL_R96);

function censusIdsAsync(file) {
  return new Promise((resolve, reject) => {
    const p = spawn('bash', [CENSUS, 'validate', '--file', file], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '', err = '';
    p.stdout.setEncoding('utf8').on('data', (d) => { out += d; });
    p.stderr.setEncoding('utf8').on('data', (d) => { err += d; });
    p.on('error', reject);
    p.on('close', (status) => {
      if (status !== 0 && status !== 1) return reject(new Error(`census rc=${status} ${file}: ${err.slice(0, 300)}`));
      const e12 = [], e01 = [];
      for (const line of out.split('\n')) {
        if (!line) continue;
        const f = line.split('\t');
        if (f[1] === 'E12') e12.push(f[2].replace(/ row outside Registry section$/, ''));
        else if (f[1] === 'E01') e01.push(f[2].replace(/ fields=\d+$/, ''));
      }
      resolve({ e12, e01, exit: status });
    });
  });
}

async function pool(items, n, fn) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(n, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i], i);
    }
  });
  await Promise.all(workers);
  return results;
}

const arrEq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
const setEq = (a, b) => a.length === b.length && [...a].sort().join('\u0000') === [...b].sort().join('\u0000');
const hex = (seed) => sha256(`kumitate-r96-${seed}`).slice(0, 40);
const url = (p) => `https://github.com/o/r/blob/${p}/x.ts`;
const row = (id, pinv, status = 'mined', tail = ' 2026-11-07 | 30d | — |') =>
  `| ${id} | ${id.toLowerCase()}.ts — ${pinv ? url(pinv) : 'no url here'} | code | A | scope-${id} | anchor | teaches | ${status} |${tail}`;
const SHORT = ' 2026-11-07 | 30d |';
const HDR = ['| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |',
  '|---|---|---|---|---|---|---|---|---|---|---|'];

/* calibration fixtures: byte-identical construction to probe96-c1.mjs ---- */
const PIN = {};
const pin = (k) => { PIN[k] = hex(k); return PIN[k]; };
const FA = [
  row('S901', pin('pre')), '# SOURCES — fixture r96 A', '',
  `Prose mention, not a row: ${url(pin('prose'))}`, '',
  '## Registry', '', ...HDR,
  row('S001', pin('okA')), row('S002', pin('shortB'), 'mined', SHORT),
  row('S003', pin('rejC'), 'rejected'), '', '### Sub-band (a level-3 heading stays inside)', '',
  row('S004', pin('h3D')), '    ## Leads (4-space indent: not a heading)',
  row('S005', pin('ind4E')), '##Leads (no space: not a heading)',
  row('S006', pin('nospF')), '```text', '## Leads (inside a fence: a heading to the census)', '```',
  row('S007', pin('fenceG')), '', '## Registry', '',
  `   ${row('S008', pin('reopenH'))}`, '', '## Leads (unopened)', '',
  row('S020', pin('leadI')), row('S011', null), row('S020', pin('leadJ')),
  row('S021', pin('leadrejK'), 'rejected'), row('S022', pin('leadshortL'), 'mined', SHORT),
  '', '## Registry ##', '', row('S023', pin('closeM')), '', '## registry', '',
  row('S024', pin('lowerN')), '', '## Registry\r', '', row('S025', pin('crO')), '',
  '##\tRegistry', '', row('S026', pin('tabP')), '', '   ## Registry  ', '',
  row('S027', pin('ind3Q')), '', '# Appendix', '', row('S028', pin('h1R')), '',
].join('\n');
const FB = ['# SOURCES — fixture r96 B (whole file CRLF)', '', '## Registry', '', ...HDR,
  row('S101', pin('crlfS')), row('S102', pin('crlfT')), row('S103', pin('crlfU'), 'rejected'), ''].join('\r\n');
const EXP_OUT_A = ['S901', 'S007', 'S020', 'S011', 'S020', 'S021', 'S022', 'S023', 'S024', 'S025', 'S028'];
const EXP_OUT_B = ['S101', 'S102', 'S103'];
const EXP_DECL_A_NAMES = ['okA', 'h3D', 'ind4E', 'nospF', 'reopenH', 'tabP', 'ind3Q'];
const EXP_BASE_A_NAMES = ['pre', 'okA', 'h3D', 'ind4E', 'nospF', 'fenceG', 'reopenH', 'leadI', 'leadJ',
  'closeM', 'lowerN', 'crO', 'tabP', 'ind3Q', 'h1R'];

const records = [];
function prepare(kind, label, file, extra = {}) {
  const buf = fs.readFileSync(file);
  const text = buf.toString('utf8');
  const b = ruleBase(text);
  const r = ruleR96(text);
  if (r.outside === null) throw new Error(`R96 tool has no outsideRows: ${TOOL_R96}`);
  const rec = {
    kind, label, file, bytes: buf.length, sha256: sha256(buf),
    outside: r.outside, basePins: b.pins.length, r96Pins: r.pins.length,
    malformed: r.malformed, baseMalformed: b.malformed, ...extra,
  };
  records.push(rec);
  return rec;
}

/* 1. calibration ------------------------------------------------------ */
const faPath = path.join(S, 'fx/fixture-a.md');
const fbPath = path.join(S, 'fx/fixture-b.md');
fs.writeFileSync(faPath, FA);
fs.writeFileSync(fbPath, FB);
{
  const ra = ruleR96(FA), ba = ruleBase(FA), rb = ruleR96(FB);
  const expDecl = new Set(EXP_DECL_A_NAMES.map((n) => PIN[n]));
  const expBase = new Set(EXP_BASE_A_NAMES.map((n) => PIN[n]));
  const cal = {
    aOutsideEqFrozen: arrEq(ra.outside, EXP_OUT_A),
    aDeclEqFrozen: setEq(ra.pins, [...expDecl]),
    aMalformedEqFrozen: arrEq(ra.malformed, ['S002']),
    baseDeclEqFrozen: setEq(ba.pins, [...expBase]),
    baseMalformedEqFrozen: arrEq(ba.malformed, ['S002', 'S022']),
    bOutsideEqFrozen: arrEq(rb.outside, EXP_OUT_B),
    bDeclEmpty: rb.pins.length === 0,
  };
  const ok = Object.values(cal).every((v) => v === true);
  if (!ok) throw new Error(`SETUP: calibration failed: ${JSON.stringify(cal)}`);
  fs.writeFileSync(path.join(EV, 'calibration.json'), JSON.stringify(cal, null, 2) + '\n');
  console.log(`CALIBRATION ok fixtureA/fixtureB r96=${TOOL_R96}`);
}

/* 2. historical revisions -------------------------------------------- */
const revs = execFileSync('git', ['-C', LANE, 'log', '--format=%H', '--', 'corpus/SOURCES.md'],
  { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim().split('\n').filter(Boolean);
for (const rev of revs) {
  const text = execFileSync('git', ['-C', LANE, 'show', `${rev}:corpus/SOURCES.md`],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const f = path.join(S, 'revs', `${rev.slice(0, 12)}.md`);
  fs.writeFileSync(f, text);
  prepare('rev', rev, f);
}

/* 3. sibling lanes + kumitate current -------------------------------- */
const lanes = fs.readdirSync(FLEET).filter((n) => n.endsWith('-shokunin')).sort();
for (const lane of lanes) {
  const f = path.join(FLEET, lane, 'corpus/SOURCES.md');
  if (!fs.existsSync(f)) continue;
  prepare('lane', lane, f);
}

/* 4. 300 seeded mutations -------------------------------------------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = 960096;
const N_MUT = 300;
const HEADINGS = ['## Leads (unopened)', '## Registry', '## Paths', '## Search log', '# Appendix',
  '### Sub-band', '## Registry ##', '## registry', '    ## Leads', '##Leads', '   ## Registry  ',
  '##\tRegistry', '## Registry\r'];
const ROW_RE = /^ {0,3}\|\s*S\d{3,}\s*\|/;
const mutManifest = [];
function mutate(text, rng) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const lines = text.split('\n');
    const ops = [];
    const k = 1 + Math.floor(rng() * 4);
    for (let o = 0; o < k; o++) {
      const choice = Math.floor(rng() * 5);
      if (choice === 0) {
        const idx = Math.floor(rng() * (lines.length + 1));
        const h = HEADINGS[Math.floor(rng() * HEADINGS.length)];
        lines.splice(idx, 0, h);
        ops.push(`insertHeading@${idx}:${JSON.stringify(h)}`);
      } else if (choice === 1) {
        const rows = [];
        for (let i = 0; i < lines.length; i++) if (ROW_RE.test(lines[i])) rows.push(i);
        if (!rows.length) { o--; continue; }
        const from = rows[Math.floor(rng() * rows.length)];
        const [rowLine] = lines.splice(from, 1);
        const to = Math.floor(rng() * (lines.length + 1));
        lines.splice(to, 0, rowLine);
        ops.push(`moveRow@${from}->${to}:${rowLine.split('|')[1].trim()}`);
      } else if (choice === 2) {
        const cand = [];
        for (let i = 0; i < lines.length; i++) if (!lines[i].endsWith('\r')) cand.push(i);
        if (!cand.length) { o--; continue; }
        const idx = cand[Math.floor(rng() * cand.length)];
        lines[idx] += '\r';
        ops.push(`crlfLine@${idx}`);
      } else if (choice === 3) {
        const idx = Math.floor(rng() * (lines.length + 1));
        const f = rng() < 0.5 ? '```' : '```text';
        lines.splice(idx, 0, f);
        ops.push(`fence@${idx}:${f}`);
      } else {
        const heads = [];
        for (let i = 0; i < lines.length; i++) if (/^ {0,3}#[ \t]/.test(lines[i])) heads.push(i);
        if (!heads.length) { o--; continue; }
        const from = heads[Math.floor(rng() * heads.length)];
        const [h] = lines.splice(from, 1);
        const to = Math.floor(rng() * (lines.length + 1));
        lines.splice(to, 0, h);
        ops.push(`moveHeading@${from}->${to}:${JSON.stringify(h)}`);
      }
    }
    const out = lines.join('\n');
    if (out !== text) return { text: out, ops };
  }
  throw new Error('mutation generator failed to change the text');
}
{
  const baseText = fs.readFileSync(path.join(LANE, 'corpus/SOURCES.md'), 'utf8');
  const rng = mulberry32(SEED);
  for (let n = 1; n <= N_MUT; n++) {
    const { text, ops } = mutate(baseText, rng);
    const f = path.join(S, 'mut', `mut-${String(n).padStart(3, '0')}.md`);
    fs.writeFileSync(f, text);
    mutManifest.push({ n, file: f, seed: SEED, ops });
    prepare('mut', `mut-${String(n).padStart(3, '0')}`, f, { ops });
  }
  fs.writeFileSync(path.join(EV, 'mutations.jsonl'), mutManifest.map((m) => JSON.stringify(m)).join('\n') + '\n');
}

/* 5. adversarial whitespace-class probes (critic boundary tests, not H96 domain) */
const ADV = [
  ['adv-vtab-outside', ['# T', '', '## Registry', '', ...HDR, '', '## Leads', '',
    '|\vS001 | x — ' + url(pin('advV')) + ' | code | A | s | a | t | mined | 2026-11-07 | 30d | — |', ''].join('\n')],
  ['adv-formfeed-outside', ['# T', '', '## Registry', '', ...HDR, '', '## Leads', '',
    '|\fS002 | x — ' + url(pin('advF')) + ' | code | A | s | a | t | mined | 2026-11-07 | 30d | — |', ''].join('\n')],
  ['adv-nbsp-outside', ['# T', '', '## Registry', '', ...HDR, '', '## Leads', '',
    '|\u00a0S003 | x — ' + url(pin('advN')) + ' | code | A | s | a | t | mined | 2026-11-07 | 30d | — |', ''].join('\n')],
  ['adv-cr-in-idcell-outside', ['# T', '', '## Registry', '', ...HDR, '', '## Leads', '',
    '| S004\r | x — ' + url(pin('advR')) + ' | code | A | s | a | t | mined | 2026-11-07 | 30d | — |', ''].join('\n')],
  ['adv-vtab-inside-13f', ['# T', '', '## Registry', '', ...HDR,
    '|\vS005 | x — ' + url(pin('advI')) + ' | code | A | s | a | t | mined | 2026-11-07 | 30d | — |', ''].join('\n')],
  ['adv-vtab-inside-12f', ['# T', '', '## Registry', '', ...HDR,
    '|\vS006 | x — ' + url(pin('advS')) + ' | code | A | s | a | t | mined | 2026-11-07 | 30d |', ''].join('\n')],
];
for (const [name, text] of ADV) {
  const f = path.join(S, 'adv', `${name}.md`);
  fs.writeFileSync(f, text);
  prepare('adv', name, f);
}

/* 6. census (parallel), then compare --------------------------------- */
console.log(`files=${records.length} census_concurrency=${CONCURRENCY}`);
const censuses = await pool(records, CONCURRENCY, (rec) => censusIdsAsync(rec.file));
for (let i = 0; i < records.length; i++) {
  const rec = records[i], c = censuses[i];
  rec.e12 = c.e12; rec.e01 = c.e01; rec.censusExit = c.exit;
  rec.e12Eq = arrEq(rec.outside, c.e12);
  rec.pinsCompared = c.e12.length === 0;
  // declared sets: recompute from stored text? pins are not stored; compare counts + hash of sorted pins
  rec.malformedEqE01 = arrEq(rec.malformed, c.e01);
}

/* pins equality needs the pin sets: recompute per file (cheap) and compare */
const pinMismatches = [];
for (const rec of records) {
  if (!rec.pinsCompared) continue;
  const text = fs.readFileSync(rec.file, 'utf8');
  const b = ruleBase(text), r = ruleR96(text);
  rec.pins = { base: b.pins.length, r96: r.pins.length, equal: setEq(r.pins, b.pins) };
  if (!rec.pins.equal) pinMismatches.push(rec);
}
fs.writeFileSync(path.join(EV, 'main.jsonl'), records.map((x) => JSON.stringify(x)).join('\n') + '\n');

/* 7. summary ---------------------------------------------------------- */
const summary = [];
summary.push(`tool_r96=${TOOL_R96} sha256=${sha256(fs.readFileSync(TOOL_R96))}`);
summary.push(`tool_base=${TOOL_BASE} sha256=${sha256(fs.readFileSync(TOOL_BASE))}`);
summary.push(`seed=${SEED} mutations=${N_MUT} revs=${revs.length} lanes=${lanes.length} concurrency=${CONCURRENCY}`);
const mainKinds = ['rev', 'lane', 'mut'];
for (const k of [...mainKinds, 'adv']) {
  const rs = records.filter((x) => x.kind === k);
  const e12Eq = rs.filter((x) => x.e12Eq).length;
  const nonEmpty = rs.filter((x) => x.e12.length > 0).length;
  const pinsCmp = rs.filter((x) => x.pinsCompared);
  const pinsEq = pinsCmp.filter((x) => x.pins.equal).length;
  const malfEq = rs.filter((x) => x.malformedEqE01).length;
  summary.push(`${k}\tfiles=${rs.length}\te12Eq=${e12Eq}/${rs.length}\tfilesWithE12=${nonEmpty}\tpinsEq=${pinsEq}/${pinsCmp.length}\tmalformedEqE01=${malfEq}/${rs.length}`);
  for (const x of rs.filter((y) => !y.e12Eq || (y.pinsCompared && !y.pins.equal))) {
    summary.push(`  MISMATCH ${x.label} e12=[${x.e12.join(' ')}] outside=[${(x.outside || []).join(' ')}] pinsEq=${x.pins.equal} sha=${x.sha256.slice(0, 12)}`);
  }
}
const domain = records.filter((x) => mainKinds.includes(x.kind));
const survived = domain.every((x) => x.e12Eq && (!x.pinsCompared || x.pins.equal));
summary.push(`E12_FILES ${domain.filter((x) => x.e12.length).length} files with census E12 in domain; E12 rows total ${domain.reduce((a, x) => a + x.e12.length, 0)}`);
summary.push(`ADV_E12EQ ${records.filter((x) => x.kind === 'adv' && x.e12Eq).length}/${records.filter((x) => x.kind === 'adv').length}`);
summary.push(`VERDICT ${survived ? 'H96_SURVIVES' : 'H96_FALSIFIED'}`);
fs.writeFileSync(path.join(EV, 'summary.txt'), summary.join('\n') + '\n');
console.log(summary.join('\n'));
