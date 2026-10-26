#!/usr/bin/env bash
# build-fixture.sh <clone-dir> <stage>  — stage one committed state in a fixture clone of the lane.
# Stages: HONEST | M1-doctored-probe | M2-swapped-capture | M3-cross-capture-quote | M4-province-off-section
# Never touches the lane: every git call names -C <clone>.
set -eu
C=$1; STAGE=$2
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B=$LANE/.ufo/waves/round-65/build
S=$B/K65ReviewProbeO65
E=corpus/knowledge/omp-installed-release-mcp-runtime.md
[ "$(git -C "$C" rev-parse --show-toplevel)" = "$C" ] || { echo FIXTURE-ROOT-MISMATCH; exit 2; }
commit() { git -C "$C" add -A && git -C "$C" -c user.name=fixture -c user.email=fixture@example.invalid commit -q -m "$1"; git -C "$C" rev-parse HEAD; }

if [ "$STAGE" = HONEST ]; then
  mkdir -p "$C/.ufo/waves/round-65/build/K65ReviewProbeO65/capture"
  cp "$B/K65ScoutTypesTs/capture/types.ts" "$C/.ufo/waves/round-65/build/K65ReviewProbeO65/capture/S201.ts"
  cp "$B/K65ScoutRuntimeDoc/capture/mcp-runtime-lifecycle.md" "$C/.ufo/waves/round-65/build/K65ReviewProbeO65/capture/S202.md"
  cp "$B/K65ScoutCommit/capture/10bce690.patch" "$C/.ufo/waves/round-65/build/K65ReviewProbeO65/capture/S203.patch"
  cp "$B/K65ScoutTagVersion/capture/client.ts" "$C/.ufo/waves/round-65/build/K65ReviewProbeO65/capture/S204.ts"
  cp "$S/honest-entry.md" "$C/$E"
  # rows
  node - "$C" "$B" <<'JS'
const fs = require('fs');
const [C, B] = process.argv.slice(2);
const rows = ['K65ScoutTypesTs/row-S201.md','K65ScoutRuntimeDoc/S202-row.md','K65ScribeEntryA/row-S203.md','K65ScribeEntryA/row-S204.md']
  .map((p) => fs.readFileSync(`${B}/${p}`, 'utf8').split('\n').find((l) => l.startsWith('|')).trim());
const f = `${C}/corpus/SOURCES.md`;
const lines = fs.readFileSync(f, 'utf8').split('\n');
const at = lines.findIndex((l) => /^ {0,3}\|\s*S200\s*\|/.test(l));
if (at < 0) { console.error('S200 row not found'); process.exit(3); }
lines.splice(at + 1, 0, ...rows);
// the scribe's S202 used-by names a lesson file the fixture does not create; drop it so USED_BY_MISSING is not a fixture artefact
const i202 = lines.findIndex((l) => /^ {0,3}\|\s*S202\s*\|/.test(l));
lines[i202] = lines[i202].replace(', corpus/lessons/round-65.md', '');
fs.writeFileSync(f, lines.join('\n'));
// pins
const pf = `${C}/.ufo/pins/source-captures.json`;
const pin = JSON.parse(fs.readFileSync(pf, 'utf8'));
const crypto = require('crypto');
for (const [id, name] of [['S201','S201.ts'],['S202','S202.md'],['S203','S203.patch'],['S204','S204.ts']]) {
  const rel = `.ufo/waves/round-65/build/K65ReviewProbeO65/capture/${name}`;
  const b = fs.readFileSync(`${C}/${rel}`);
  pin.captures.push({ sourceId: id, path: rel, sha256: crypto.createHash('sha256').update(b).digest('hex'), bytes: b.length, captured: '2026-10-25' });
}
fs.writeFileSync(pf, JSON.stringify(pin, null, 1) + '\n');
// PROVINCE frontier line
const pv = fs.readFileSync(`${C}/PROVINCE.md`, 'utf8').split('\n');
const adj = pv.findIndex((l) => /^###\s+Adjacent/.test(l));
pv.splice(adj, 0, '- OMP harness contract (MCP runtime) — frontier entry `corpus/knowledge/omp-installed-release-mcp-runtime.md` (round 65): the installed release measured at its own tag.');
fs.writeFileSync(`${C}/PROVINCE.md`, pv.join('\n'));
// README row
fs.appendFileSync(`${C}/corpus/README.md`, '| `knowledge/omp-installed-release-mcp-runtime.md` | fixture row: the installed OMP release at the MCP layer, 18.12.6, read at its tag and measured on the host | S201–S204 |\n');
// readme-map pin
const rmf = `${C}/.ufo/pins/readme-map.json`;
const rm = JSON.parse(fs.readFileSync(rmf, 'utf8'));
rm.covered.push('knowledge/omp-installed-release-mcp-runtime.md');
rm.covered.sort();
fs.writeFileSync(rmf, JSON.stringify(rm, null, 1) + '\n');
JS
  # amendment
  printf '\n' >> "$C/corpus/knowledge/omp-task-contract.md"
  cat "$B/K65ScribeEntryA/amendment-omp-task-contract.md" >> "$C/corpus/knowledge/omp-task-contract.md"
  commit 'honest fixture: entry + 4 rows + captures + pins + province + readme + amendment'
fi

if [ "$STAGE" = M1-doctored-probe ]; then
  # the probe script no longer measures anything: it prints the honest 15 keys as constants
  cat > "$C/scripts/omp-binary-probe.sh" <<'PROBE'
#!/usr/bin/env bash
# mutant: measures nothing, prints constants
echo 'OMP_BIN: wrapper_is_script=1'
echo 'OMP_BIN: wrapper_names_real=omp.real'
echo 'OMP_BIN: wrapper_restart_codes=132-139'
echo 'OMP_BIN: wrapper_max_restarts=5'
echo 'OMP_BIN: real_is_elf=1'
echo 'OMP_BIN: real_bytes=256702432'
echo 'OMP_BIN: real_version=18.12.6'
echo 'OMP_BIN: lit_2025_11_25=2'
echo 'OMP_BIN: lit_2026_07_28=0'
echo 'OMP_BIN: lit_2025_03_26=2'
echo 'OMP_BIN: sym_MCP_PROTOCOL_VERSION=3'
echo 'OMP_BIN: header_MCP-Protocol-Version=3'
echo 'OMP_BIN: sym_DeferredMCPTool=3'
echo 'OMP_BIN: collab_hosts_literal=2'
echo 'OMP_BIN: docs_phrase_never_replayed=0'
echo 'OMP_BIN_PROBE: DONE omp=18.12.6'
PROBE
  # the entry body now claims a different installed release and a present literal
  sed -i -e 's/^The installed release is `omp\/18.12.6`\./The installed release is `omp\/18.12.3`./' \
         -e 's/`2025-03-26` twice and `2026-07-28` not at all (`lit_2026_07_28=0`; the key/`2025-03-26` twice and `2026-07-28` four times (`lit_2026_07_28=4`; the forged key/' \
         "$C/$E"
  commit 'M1: doctored probe prints stated constants; body contradicts the measurements'
fi

if [ "$STAGE" = M2-swapped-capture ]; then
  node - "$C" <<'JS'
const fs = require('fs'); const crypto = require('crypto');
const C = process.argv[2];
const E = `${C}/corpus/knowledge/omp-installed-release-mcp-runtime.md`;
let t = fs.readFileSync(E, 'utf8');
t = t.replace('- S204 — "Streamable HTTP spec requires the MCP-Protocol-Version header after initialize; transports that don\'t need it ignore this."',
              '- S204 — "transport.setProtocolVersion?.(result.protocolVersion)"');
fs.writeFileSync(E, t);
const pf = `${C}/.ufo/pins/source-captures.json`;
const pin = JSON.parse(fs.readFileSync(pf, 'utf8'));
const rel = '.ufo/waves/round-65/build/K65ReviewProbeO65/capture/S203.patch'; // wrong file: the commit patch, not client.ts
const b = fs.readFileSync(`${C}/${rel}`);
const e = pin.captures.find((c) => c.sourceId === 'S204');
e.path = rel; e.sha256 = crypto.createHash('sha256').update(b).digest('hex'); e.bytes = b.length;
fs.writeFileSync(pf, JSON.stringify(pin, null, 1) + '\n');
JS
  commit 'M2: S204 pin points at the S203 patch capture; quote text exists in both files'
fi

if [ "$STAGE" = M3-cross-capture-quote ]; then
  node - "$C" <<'JS'
const fs = require('fs');
const C = process.argv[2];
const E = `${C}/corpus/knowledge/omp-installed-release-mcp-runtime.md`;
let t = fs.readFileSync(E, 'utf8');
t = t.replace('- S204 — "Streamable HTTP spec requires the MCP-Protocol-Version header after"',
              '- S204 — "fix(mcp): send MCP-Protocol-Version header and negotiate 2025-11-25"');
fs.writeFileSync(E, t);
JS
  commit 'M3: S204 bullet quotes the S203 capture'
fi

if [ "$STAGE" = M4-province-off-section ]; then
  node - "$C" <<'JS'
const fs = require('fs');
const C = process.argv[2];
const f = `${C}/PROVINCE.md`;
let lines = fs.readFileSync(f, 'utf8').split('\n');
lines = lines.filter((l) => !l.includes('corpus/knowledge/omp-installed-release-mcp-runtime.md'));
const at = lines.findIndex((l) => /^###\s+Adjacent/.test(l));
if (at < 0) { console.error('no Adjacent heading'); process.exit(3); }
lines.splice(at + 1, 0, '', '- `corpus/knowledge/omp-installed-release-mcp-runtime.md` — background only; not absorbed, not entered.');
fs.writeFileSync(f, lines.join('\n') + '\n');
JS
  commit 'M4: entry named only in the Adjacent section as not absorbed'
fi

if [ "$STAGE" = M0-edge-punctuation ]; then
  # false-negative probe: a bullet whose quote carries an em dash inside it, and one with backticks/spacing
  node - "$C" <<'JS'
const fs = require('fs');
const C = process.argv[2];
const E = `${C}/corpus/knowledge/omp-installed-release-mcp-runtime.md`;
let t = fs.readFileSync(E, 'utf8');
t = t.replace('- S202 — "Connection loss after a request may have reached the server is non-retryable and is never replayed automatically"',
  '- S202 — "Connection loss after a request may have reached the server is non-retryable and is never replayed automatically"\n- S202 — "a slow server no longer blocks startup — issue #2100"\n- S202 — "Reconnect retries with backoff (`500`, `1000`, `2000`, `4000` ms)"');
fs.writeFileSync(E, t);
JS
  commit 'M0: honest entry with em dash inside a quote, backticks, and a hyphen'
fi

if [ "$STAGE" = M5-equals-value ]; then
  sed -i 's/^- real_version=18\.12\.6$/- real_version=18.12.6=x/' "$C/$E"
  commit 'M5: a Host measurements value carries an equals sign'
fi

if [ "$STAGE" = M7-twelve-keys ]; then
  # the plan's ">= 12 bullets" wording: drop three measurement bullets, leaving 12
  sed -i -e '/^- lit_2025_03_26=2$/d' -e '/^- collab_hosts_literal=2$/d' -e '/^- docs_phrase_never_replayed=0$/d' "$C/$E"
  commit 'M7: only 12 of the probe keys stated (the plan says >= 12)'
fi

if [ "$STAGE" = M8-header-window ]; then
  # the plan's O1 window is 14 lines; sources-check reads 5. Split the merged source lines so recheck: sits on line 6.
  node - "$C" <<'JS'
const fs = require('fs');
const C = process.argv[2];
const E = `${C}/corpus/knowledge/omp-installed-release-mcp-runtime.md`;
let lines = fs.readFileSync(E, 'utf8').split('\n');
const split = (l) => { const i = l.indexOf(' ; source:'); return i < 0 ? [l] : [l.slice(0, i), l.slice(i + 3)]; };
lines = [...split(lines[0]), ...split(lines[1]), ...lines.slice(2)];
fs.writeFileSync(E, lines.join('\n'));
JS
  commit 'M8: four source lines push recheck: to line 6 (O1 window 14, gate window 5)'
fi

if [ "$STAGE" = M9-false-amendment ]; then
  # an amendment that names the entry path and "Version skew" but asserts the opposite of the entry
  printf '\n## Amendment 2026-10-25 — Version skew, corrected\n\n`corpus/knowledge/omp-installed-release-mcp-runtime.md` is withdrawn: its Version skew reading was\nwrong, the installed release negotiates `2026-07-28`, and nothing in it may be relied on.\n' >> "$C/corpus/knowledge/omp-task-contract.md"
  commit 'M9: appended amendment names the entry and Version skew but contradicts it'
fi

if [ "$STAGE" = M6-pin-by-mention ]; then
  # every row's URL is the moving `main` branch; the tag/commit appears only as text in the anchor cell
  node - "$C" <<'JS'
const fs = require('fs');
const C = process.argv[2];
const f = `${C}/corpus/SOURCES.md`;
let lines = fs.readFileSync(f, 'utf8').split('\n');
for (const id of ['S201', 'S202', 'S203', 'S204']) {
  const i = lines.findIndex((l) => new RegExp(`^ {0,3}\\|\\s*${id}\\s*\\|`).test(l));
  let row = lines[i]
    .replace('raw.githubusercontent.com/can1357/oh-my-pi/45c35e40c46166dc726ccc52f5d27f40f2449f99/', 'raw.githubusercontent.com/can1357/oh-my-pi/main/')
    .replace('raw.githubusercontent.com/can1357/oh-my-pi/v18.12.6/', 'raw.githubusercontent.com/can1357/oh-my-pi/main/');
  const c = row.split('|');
  c[6] = `${c[6]} ; opens at /v18.12.6/`;
  lines[i] = c.join('|');
}
fs.writeFileSync(f, lines.join('\n'));
JS
  commit 'M6: all row URLs are main; the tag appears only as anchor text'
fi

if [ "$STAGE" = M10-heading-spoof ]; then
  # put the amendment heading text in a line that is neither appended nor a section of its own
  node - "$C" <<'JS'
const fs = require('fs');
const C = process.argv[2];
const f = `${C}/corpus/knowledge/omp-task-contract.md`;
let t = fs.readFileSync(f, 'utf8');
t = t.replace('\n## Amendment 2026-10-25', '\n- Amendment 2026-10-25');
fs.writeFileSync(f, t);
JS
  commit 'M10: amendment heading demoted to a bullet'
fi

if [ "$STAGE" = M11-extra-key ]; then
  sed -i 's/^- docs_phrase_never_replayed=0$/- docs_phrase_never_replayed=0\n- real_sha256=deadbeef/' "$C/$E"
  commit 'M11: one measurement key the probe does not print'
fi

if [ "$STAGE" = M12-pin-escapes-archive ]; then
  # the pin path is joined onto the archive root without normalisation: `..` leaves the archive,
  # so the "committed capture" never has to be committed (here: a file in this seat's /tmp scratch).
  node - "$C" <<'JS'
const fs = require('fs'); const crypto = require('crypto');
const C = process.argv[2];
const outside = '/tmp/kumitate-r65/K65ReviewProbeO65/live/S204.ts';
const b = fs.readFileSync(outside);
const pf = `${C}/.ufo/pins/source-captures.json`;
const pin = JSON.parse(fs.readFileSync(pf, 'utf8'));
const e = pin.captures.find((c) => c.sourceId === 'S204');
e.path = '../kumitate-r65/K65ReviewProbeO65/live/S204.ts';
e.sha256 = crypto.createHash('sha256').update(b).digest('hex');
e.bytes = b.length;
fs.writeFileSync(pf, JSON.stringify(pin, null, 1) + '\n');
JS
  commit 'M12: S204 capture pinned outside the archive by ../ traversal'
fi
