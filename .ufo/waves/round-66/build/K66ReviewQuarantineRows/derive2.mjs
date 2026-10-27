import fs from 'fs';
import { execSync } from 'child_process';

const LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin';
const FREEZE = '621212bac37f8249c72ac982d1d6534cb8d60701';
const BASE = '8d557f85312de4fcc82e09ff735d21436bc3746d';
const STAGED = '/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md';
const KDIR = '/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge';
const OUT = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-66/build/K66ReviewQuarantineRows';

const IDRE = /^ {0,3}\|[ \t]*S([0-9]{3,})\b/;
const parseRows = (text) => text.split('\n').flatMap((l, i) => { const m = l.match(IDRE); return m ? [{ id: 'S' + m[1], num: +m[1], line: i + 1, text: l }] : []; });
const firstUrl = (t) => { const m = t.match(/https?:\/\/[^\s|)\]]+/); return m ? m[0].replace(/[.,;]+$/, '') : null; };
const normUrl = (u) => { if (!u) return null; let s = u.toLowerCase().split('#')[0]; while (s.endsWith('/')) s = s.slice(0, -1); return s; };

const freezeText = execSync(`git -C ${LANE} show ${FREEZE}:corpus/SOURCES.md`, { encoding: 'utf8', maxBuffer: 1e8 });
const baseText = execSync(`git -C ${LANE} show ${BASE}:corpus/SOURCES.md`, { encoding: 'utf8', maxBuffer: 1e8 });
const lane = parseRows(freezeText);
const baseRows = new Set(parseRows(baseText).map(r => r.id));
const staged = parseRows(fs.readFileSync(STAGED, 'utf8'));

const laneById = new Map(lane.map(r => [r.id, r]));
const laneByUrl = new Map();
for (const r of lane) { const u = normUrl(firstUrl(r.text)); if (u) { if (!laneByUrl.has(u)) laneByUrl.set(u, []); laneByUrl.get(u).push(r.id); } }

const laneNums = new Set(lane.map(r => r.num));
const laneMax = Math.max(...lane.map(r => r.num));
const gaps = []; for (let n = 1; n <= laneMax; n++) if (!laneNums.has(n)) gaps.push(n);
const refs = [117, 130, 131, 146, 147, 148, 160].map(n => `S${n}:${laneNums.has(n) ? 'lane-row' : 'GAP'}`).join(' ');

// theme rows, deduped by document
const THEME = ['mcp-feature-deprecation-registry.md', 'mcp-deprecation-removal-state-2026-10-25.md', 'mcp-deprecation-registry-timing-2026-10-27.md', 'sep-2596-status-and-merge-dates-2026-10-25.md', 'sep-2596-final-date-and-the-deprecation-clock-2026-10-26.md', 'sep-2596-merge-timestamp-surfaces-2026-10-26.md', 'sep-2596-merge-timestamp-surfaces-2026-10-27.md'];
const stagedById = new Map(staged.map(r => [r.id, r]));
const docKey = (r) => { const u = normUrl(firstUrl(r.text)); if (u) return u; const m = r.text.match(/lanes\/kumitate\/round\d+\/[^\s|]+/); return m ? 'file:' + m[0] : 'row:' + r.id; };

const union = [];
for (const f of THEME) {
  const t = fs.readFileSync(`${KDIR}/${f}`, 'utf8');
  for (const m of t.matchAll(/\bS[0-9]{3}\b/g)) { const id = m[0]; if (stagedById.has(id) && !union.includes(id)) union.push(id); }
}
const groups = []; const keyToGroup = new Map();
for (const id of union) {
  const r = stagedById.get(id);
  const k = docKey(r);
  if (!keyToGroup.has(k)) { keyToGroup.set(k, { key: k, members: [] }); groups.push(keyToGroup.get(k)); }
  keyToGroup.get(k).members.push(id);
}
let next = laneMax + 1;
const unescaped = (t) => t.replace(/\\\|/g, '\u0001');
const mapRows = groups.map(g => {
  const lead = stagedById.get(g.members[0]);
  const id = 'S' + next++;
  const om = lead.text.match(/\| (mined|queued|rejected) \| ([0-9]{4}-[0-9]{2}-[0-9]{2}) \|/);
  return { newId: id, docKey: g.key, members: g.members, status: om ? om[1] : null, opened: om ? om[2] : null, cells: unescaped(lead.text).replace(/^ {0,3}/, '').split('|').length, urlInLane: (laneByUrl.get(g.key) || []).join(',') || null, anyMemberAtBase: g.members.some(m => baseRows.has(m)) };
});

const out = {
  freezeMatchesWorktree: fs.readFileSync(LANE + '/corpus/SOURCES.md', 'utf8') === freezeText,
  lane: { rows: lane.length, max: 'S' + laneMax, gapsCount: gaps.length, gaps, specialGapRefs: refs },
  base: { hasS201toS206: ['S201','S202','S203','S204','S205','S206'].map(id => baseRows.has(id)) },
  staged: { rows: staged.length, min: 'S' + Math.min(...staged.map(r => r.num)), max: 'S' + Math.max(...staged.map(r => r.num)) },
  idCollisions: staged.filter(r => laneById.has(r.id)).map(r => ({ id: r.id, stagedLine: r.line, laneLine: laneById.get(r.id).line, sameDoc: normUrl(firstUrl(r.text)) === normUrl(firstUrl(laneById.get(r.id).text)), stagedUrl: firstUrl(r.text), laneUrl: firstUrl(laneById.get(r.id).text) })),
  urlDups: staged.filter(r => { const u = normUrl(firstUrl(r.text)); return u && (laneByUrl.get(u) || []).some(x => x !== r.id); }).map(r => ({ id: r.id, lane: (laneByUrl.get(normUrl(firstUrl(r.text))) || []).filter(x => x !== r.id), url: firstUrl(r.text) })),
  renumberMap: mapRows, nextFree: 'S' + next,
};
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(OUT + '/derive-out.json', JSON.stringify(out, null, 1));
console.log(JSON.stringify({ freezeMatchesWorktree: out.freezeMatchesWorktree, lane: out.lane, base: out.base, staged: out.staged, idCollisions: out.idCollisions.length, urlDups: out.urlDups, nextFree: out.nextFree }, null, 1));
console.log('\nRENUMBER MAP');
for (const m of mapRows) console.log(`${m.newId} <- ${m.members.join('=')}  cells=${m.cells} ${m.status}/${m.opened} urlInLane=${m.urlInLane}  ${m.docKey.slice(0, 90)}`);
