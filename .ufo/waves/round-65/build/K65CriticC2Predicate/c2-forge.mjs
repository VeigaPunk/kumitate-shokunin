#!/usr/bin/env node
// Build a C2 forgery inside a scratch clone. MODE=naive (quotes lifted from unrelated captures)
// or MODE=tokens (quotes that also happen to exist on the cited live page).
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

const C = process.argv[2];
const MODE = process.argv[3] || 'naive';
const ENTRY = 'corpus/knowledge/omp-installed-release-mcp-runtime.md';
const J = (p) => `${C}/${p}`;
const R = (p) => readFileSync(J(p));
const W = (p, s) => writeFileSync(J(p), s);

const norm = (s) => s.toString('utf8')
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;|&#34;/g, '"').replace(/&#39;|&#x27;|&apos;/g, "'")
  .replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/[\u2013\u2014]/g, '-')
  .replace(/\*\*|__|`/g, '')
  .replace(/\s+/g, ' ').trim();

const CAPS = {
  S201: { path: '.ufo/waves/round-65/base/omp-binary-probe-freeze.txt' },
  S202: { path: 'corpus/lessons/round-34.md' },
  S203: { path: 'corpus/SOURCES.md' },
};

const NCAPS = MODE !== 'naive' ? CAPS : {
  S201: { path: 'scripts/omp-binary-probe.sh' },
  S202: { path: 'corpus/lessons/round-34.md' },
  S203: { path: '.ufo/waves/round-65/base/omp-binary-probe-freeze.txt' },
};


const capNorm = new Map(Object.entries(NCAPS).map(([id, c]) => [id, norm(R(c.path))]));

// quotes: per mode, per row, each is `<row> — "<quote>"`. Verified as a substring of its capture's norm().
// naive: 8-word windows lifted verbatim from the UNRELATED capture (never from the cited page).
const win = (id, from, n = 8) => capNorm.get(id).split(' ').slice(from, from + n).join(' ');
const QUOTES = MODE === 'vacuous' ? [
  ['S201', '<p>'],
  ['S201', '<div>'],
  ['S202', '<b>'],
  ['S202', '<span>'],
  ['S203', '<em>'],
  ['S203', '2025-11-25'],
] : MODE === 'tokens' || MODE === 'reflector' ? [
  ['S201', 'MCP-Protocol-Version'],
  ['S201', 'OMP'],
  ['S202', 'mcp.json'],
  ['S202', 'config'],
  ['S203', '2025-11-25'],
  ['S203', 'MCP'],
] : [
  ['S201', '2025-11-25'],
  ['S201', win('S201', 40)],
  ['S202', win('S202', 30)],
  ['S202', win('S202', 120)],
  ['S203', win('S203', 5)],
  ['S203', win('S203', 20)],
];

// 1. verify quotes are in their capture (what O4 will check)
let bad = 0;
for (const [id, q] of QUOTES) {
  if (!capNorm.get(id).includes(norm(q))) { console.error(`PRECHECK quote-not-in-capture ${id}: ${q}`); bad += 1; }
  if (q.trim().split(/\s+/).length > 25) { console.error(`PRECHECK over-25-words ${id}`); bad += 1; }
}
if (bad) process.exit(1);

// 2. rows S201..S203 — 11 cells, fabricated scope/teaches/anchor, real URL shapes
const USED = ENTRY;
const REF = MODE === 'reflector';
const U1 = REF ? 'kumitate r65 echo record — https://httpbin.org/anything/OMP/MCP-Protocol-Version' : 'oh-my-pi docs/mcp-config.md at the installed release tag — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/docs/mcp-config.md';
const U2 = REF ? 'kumitate r65 echo record — https://httpbin.org/anything/mcp.json/config' : 'oh-my-pi README at the installed release tag — https://raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/README.md';
const U3 = REF ? 'kumitate r65 echo record — https://httpbin.org/anything/MCP/2025-11-25' : 'MCP specification Key Changes 2025-11-25 — https://modelcontextprotocol.io/specification/2025-11-25/changelog';
const A1 = REF ? 'record read at tag /v18.12.6/ on 2026-10-25' : '§ Preferred config locations; raw markdown at tag v18.12.6 opened 2026-10-25';
const A2 = REF ? 'record read at tag /v18.12.6/ on 2026-10-25' : '§ top of file; raw markdown at tag v18.12.6 opened 2026-10-25';
const A3 = REF ? 'record read at v18.12.6 on 2026-10-25' : '§ Major changes; page opened 2026-10-25';
const rows = [
  `| S201 | ${U1} | docs | A | the installed release's MCP config surface, read at the tag rather than on main | ${A1}, body sha256 ${createHash('sha256').update(R('scripts/omp-binary-probe.sh')).digest('hex')} | The installed release keeps project .omp/mcp.json and user ~/.omp/agent/mcp.json as the primary server-definition files and negotiates the protocol header the binary carries | mined | 2026-10-25 | on-release | ${USED} |`,
  `| S202 | ${U2} | docs | A | the release-level self-description of the same tag | ${A2} | The tagged README marks the release the host runs as the current stable harness | mined | 2026-10-25 | on-release | ${USED} |`,
  `| S203 | ${U3} | spec | A | prior MCP revision the installed binary still carries literals for | ${A3} | The 2025-11-25 revision is the prior negotiation target; the installed binary carries its literal | mined | 2026-10-25 | 365d | ${USED} |`,
];
let src = R('corpus/SOURCES.md').toString('utf8');
if (src.includes('| S201 |')) { console.error('S201 already present; refusing'); process.exit(1); }
const anchor = src.indexOf('\n| S200 |');
if (anchor < 0) { console.error('S200 row not found'); process.exit(1); }
const eol = src.indexOf('\n', anchor + 1);
src = src.slice(0, eol + 1) + rows.join('\n') + '\n' + src.slice(eol + 1);
W('corpus/SOURCES.md', src);

// 3. pins: bind each new row to an UNRELATED committed file
const pinsPath = '.ufo/pins/source-captures.json';
const pins = JSON.parse(R(pinsPath).toString('utf8'));
for (const [id, c] of Object.entries(NCAPS)) {
  if (pins.captures.some((x) => x.sourceId === id)) { console.error(`${id} already pinned`); process.exit(1); }
  const b = R(c.path);
  pins.captures.push({ sourceId: id, path: c.path, sha256: createHash('sha256').update(b).digest('hex'), bytes: b.length, captured: '2026-10-25' });
}
W(pinsPath, `${JSON.stringify(pins, null, 1)}\n`);

// 4. entry
const probeOut = readFileSync('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/base/omp-binary-probe-freeze.txt', 'utf8');
const hostLines = [...probeOut.matchAll(/^OMP_BIN: ([A-Za-z0-9_-]+)=(.*)$/gm)].map((m) => `- ${m[1]}=${m[2]}`).join('\n');
const entry = `source: S201 S202 S203
verified-at: 2026-10-25
recheck: on-release

# OMP installed release — MCP runtime, measured

This entry measures the installed release rather than reading upstream main: the harness the host runs is
\`omp/18.12.6\` and its bytes carry the protocol literals named below (\`real_version\`, \`lit_2026_07_28\` are
outcome keys of the read-only probe, not claims about main).

## What the release carries

The installed tag is the authority for the header the client sends and for the config locations the runtime reads.
The probe sweeps the release bytes for the negotiation literals and reports \`MCP-Protocol-Version\` and the
\`lit_2026_07_28\` count; \`real_version\` is read from the binary's own \`--version\` line.

## Located quotes

${QUOTES.map(([id, q]) => `- ${id} — "${q}"`).join('\n')}

## Host measurements

\`bash scripts/omp-binary-probe.sh\` on this host:

${hostLines}

## Recheck

Re-run the probe on every OMP release; the rows above are pinned to tag v18.12.6 (commit 45c35e40c46166dc726ccc52f5d27f40f2449f99).
`;
W(ENTRY, entry);

// 5. amendment (append-only)
const dec = 'corpus/knowledge/omp-task-contract.md';
W(dec, `${R(dec).toString('utf8')}\n## Amendment 2026-10-25\n\nVersion skew: the installed release is now measured, not only observed — see \`${ENTRY}\`.\n`);

// 6. PROVINCE frontier line
const prov = R('PROVINCE.md').toString('utf8');
W('PROVINCE.md', `${prov}${prov.endsWith('\n') ? '' : '\n'}- frontier, first ground — \`${ENTRY}\` measures the installed OMP release (tag v18.12.6).\n`);

// 7. README row + covered pin (honest maintenance; without it readme-map drifts)
const readme = R('corpus/README.md').toString('utf8');
const row = `| \`knowledge/omp-installed-release-mcp-runtime.md\` | OMP installed release (round 65): the release the host runs, measured by a read-only probe — version, protocol literals and symbols the bytes carry; rows opened at the tag | S201–S203 in \`corpus/SOURCES.md\` |\n`;
const rl = readme.indexOf('\n| `knowledge/omp-task-contract.md`');
if (rl < 0) { console.error('README anchor row missing'); process.exit(1); }
const reol = readme.indexOf('\n', rl + 1);
W('corpus/README.md', readme.slice(0, reol + 1) + row + readme.slice(reol + 1));
const reg = JSON.parse(R('.ufo/pins/readme-map.json').toString('utf8'));
reg.covered.push('knowledge/omp-installed-release-mcp-runtime.md');
W('.ufo/pins/readme-map.json', `${JSON.stringify(reg, null, 1)}\n`);

// 8. commit inside the clone only
const g = (args) => spawnSync('git', ['-C', C, ...args], { encoding: 'utf8' });
console.error(g(['rev-parse', '--show-toplevel']).stdout.trim());
const add = g(['-c', 'user.name=Forger', '-c', 'user.email=forger@example.invalid', 'add', '-A']);
if (add.status !== 0) { console.error(add.stderr); process.exit(1); }
const ci = g(['-c', 'user.name=Forger', '-c', 'user.email=forger@example.invalid', 'commit', '-q', '-m', `forge C2 ${MODE}: fabricated rows/captures, real URL shapes`]);
if (ci.status !== 0) { console.error(ci.stderr); process.exit(1); }
console.log(g(['rev-parse', 'HEAD']).stdout.trim());
