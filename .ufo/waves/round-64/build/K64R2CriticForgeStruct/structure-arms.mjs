// structure-arms.mjs — prototype of the proposed v3 structure arms for scripts/report-receipt-diff.mjs.
// Not the tool: a drop-in slice the L1 pastes into diffReport() after the existing section/SHONEN block.
// Every arm keeps round-63's filed report CLEAN and each is proven on fixtures + the real 40..63 corpus
// by matrix.mjs in this directory.

const REQUIRED = [
  ['Work performed', /^#{1,6}\s*\**\s*Work performed/im],
  ['Landed changes', /^#{1,6}\s*\**\s*Landed changes/im],
  ['Before → after measurements', /^#{1,6}\s*\**\s*Before\s*(?:→|->)\s*after measurements/im],
  ['Sources & frontier', /^#{1,6}\s*\**\s*Sources\s*&\s*frontier/im],
  ['Trend verdicts', /^#{1,6}\s*\**\s*Trend verdicts/im],
  ['SHONEN', /^#{1,6}\s*\**\s*SHONEN/im],
];

// A box is a mark that opens a bullet; a mark quoted inside prose is a quotation, not an assessment.
const BOX_LINE = /^\s*[-*]\s+`?\[([xX~ ])\]`?/;
const BOX_MARK = /`?\[([xX~ ])\]`?/g;
// A box must carry a pointer: a backticked token, a path with an extension, a 7..40 hex citation, or a verifier.
const POINTER = /`[^`]+`|\b[0-9a-fA-F]{7,40}\b|[\w./-]+\.(?:md|txt|mjs|js|sh|json|ya?ml|png|bundle|log)\b|verifier/i;
const VERIFIER = /verifier|verified by|spot-check/i;
// PROTOCOL: "a subagent the lane dispatched is still the lane" — an [x] that admits this is author attestation.
const SELF_X = /still the lane|author attestation/i;
// PROTOCOL Sources & frontier: "SOURCES.md rows before→after with the counting command ... a lane with no
// corpus writes a line beginning `SOURCES: unchanged —`". Either form satisfies the arm.
const SOURCES_OK = /SOURCES|\b\d+\s*(?:→|->)\s*\*{0,2}\d+|rows?\s+(?:added|touched|before)/i;
const TRENDS = [['Expansion', /expansion/i], ['Quality', /quality/i], ['Discernment', /discernment/i]];
const CITE = /\b[0-9a-fA-F]{39,40}\b/;
// PROTOCOL stale-lane actuator: a report "must say whether it is progressing or silent".
const STALE = /stale[-\s]?lane|progressing|silent|no other mission/i;
const LOG_TIE = /LOG\.md/;

function sections(prose) {
  const lines = prose.split('\n');
  const out = [];
  for (const [name, re] of REQUIRED) {
    const i = lines.findIndex((l) => re.test(l));
    if (i < 0) { out.push({ name, level: 0, start: i, body: '' }); continue; }
    const level = lines[i].trim().match(/^#+/)[0].length;
    const body = [];
    for (let j = i + 1; j < lines.length; j += 1) {
      const h = /^(#{1,6})\s/.exec(lines[j]);
      if (h && h[1].length <= level) break;
      body.push(lines[j]);
    }
    out.push({ name, level, start: i, body: body.join('\n') });
  }
  return out;
}

// A section body is non-empty when it carries at least one line of its own (not a subheading) with >= 4 chars.
const substantive = (body) => body.split('\n').some((l) => !/^\s*#{1,6}\s/.test(l) && l.trim().length >= 4);

function boxBullets(prose, sh) {
  const lines = prose.split('\n');
  const lvl = sh.level;
  const bullets = [];
  let cur = null;
  for (let j = sh.start + 1; j < lines.length; j += 1) {
    const h = /^(#{1,6})\s/.exec(lines[j]);
    if (h && h[1].length <= lvl) break;
    if (BOX_LINE.test(lines[j])) { cur = { line: j + 1, head: lines[j], text: lines[j] }; bullets.push(cur); }
    else if (cur && lines[j].trim()) cur.text += ` ${lines[j].trim()}`;
  }
  return bullets;
}

export function structureArms(reportText, { prose, round }) {
  const findings = [];
  const add = (id, detail) => findings.push({ id, detail });
  const secs = sections(prose);
  // SECTION_EMPTY — a required heading whose section carries no content of its own.
  for (const s of secs) if (s.start >= 0 && !substantive(s.body)) add('SECTION_EMPTY', `${s.name} (${s.body.trim().length} bytes)`);
  // SECTION_ORDER — the six headings must appear in the contract order.
  const idx = secs.filter((s) => s.start >= 0).map((s) => [s.name, s.start]);
  for (let i = 1; i < idx.length; i += 1) {
    if (idx[i][1] < idx[i - 1][1]) { add('SECTION_ORDER', `${idx[i][0]} before ${idx[i - 1][0]}`); break; }
  }
  // SHONEN arms
  const sh = secs.find((s) => s.name === 'SHONEN');
  if (sh && sh.start >= 0) {
    const bullets = boxBullets(prose, sh);
    let boxes = 0;
    for (const b of bullets) boxes += (b.head.match(BOX_MARK) || []).length;
    if (boxes < 4) add('SHONEN_COUNT', `boxes=${boxes}`);
    const marked = bullets.map((b) => ({ mark: BOX_LINE.exec(b.head)[1], line: b.line, text: b.text }));
    for (const m of marked) if (!POINTER.test(m.text)) add('SHONEN_NO_POINTER', `line ${m.line} [${m.mark}]`);
    if (marked.length && !marked.some((m) => m.mark === 'x' || m.mark === 'X' || m.mark === '~')) add('SHONEN_UNASSERTED', `boxes=${marked.length}`);
    for (const m of marked) {
      if (m.mark !== 'x' && m.mark !== 'X') continue;
      if (!VERIFIER.test(m.text)) add('SHONEN_X_VERIFIER', `line ${m.line}`);
      else if (SELF_X.test(m.text)) add('SHONEN_X_SELF', `line ${m.line}`);
    }
  }
  // CITE_ABSENT — PROTOCOL: the report "must cite that commit's hash"; a checkable citation is required.
  if (!CITE.test(prose)) add('CITE_ABSENT', 'no 39/40-hex citation in prose');
  // SOURCES_UNRECORDED — the frontier step's rows before→after (or the `SOURCES: unchanged —` form).
  const src = secs.find((s) => s.name === 'Sources & frontier');
  if (src && src.start >= 0 && !SOURCES_OK.test(src.body)) add('SOURCES_UNRECORDED', 'no rows before→after and no SOURCES line');
  // TREND_MISSING — one verdict per trend (PROTOCOL: the trend verdicts are the round's three trends).
  const tr = secs.find((s) => s.name === 'Trend verdicts');
  if (tr && tr.start >= 0) {
    const absent = TRENDS.filter(([, re]) => !re.test(tr.body)).map(([n]) => n);
    if (absent.length) add('TREND_MISSING', absent.join(','));
  }
  // ROUND_UNNAMED — a report that never names its own round is not this round's report.
  if (round && !new RegExp(`round[\\s-]*${round}\\b`, 'i').test(prose)) add('ROUND_UNNAMED', `round ${round} not named`);
  // STALE_LANE_UNNAMED — PROTOCOL's stale-lane actuator.
  if (!STALE.test(prose)) add('STALE_LANE_UNNAMED', 'no progressing/silent statement');
  // LOG_UNNAMED — PROTOCOL: changes landed "each tied to a `LOG.md` entry".
  if (!LOG_TIE.test(prose)) add('LOG_UNNAMED', 'no LOG.md tie');
  return findings;
}
