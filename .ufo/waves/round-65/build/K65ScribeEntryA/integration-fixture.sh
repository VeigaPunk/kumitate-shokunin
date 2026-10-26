#!/usr/bin/env bash
# integration-fixture.sh — prove the C2 draft end-to-end against the FROZEN counter in a sandbox clone.
# Writes only inside a fresh mktemp clone; every git call names -C "$D"; identity is inline and throwaway.
set -euo pipefail
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
B=$LANE/.ufo/waves/round-65/build
D=${D:-/tmp/kumitate-r65/K65ScribeEntryA/fixture}
rm -rf "$D"
git clone -q --no-hardlinks "$LANE" "$D"
[ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] || { echo "FIXTURE_NOT_TOPLEVEL"; exit 3; }

# 1. entry
cp "$B/K65ScribeEntryA/omp-installed-release-mcp-runtime.md" "$D/corpus/knowledge/omp-installed-release-mcp-runtime.md"

# 2. captures at the pinned paths
mkdir -p "$D/.ufo/waves/round-65/build/K65ScribeEntryA/capture" "$D/.ufo/waves/round-65/build/K65ScoutTypesTs/capture" "$D/.ufo/waves/round-65/build/K65ScoutRuntimeDoc/capture" "$D/.ufo/waves/round-65/build/K65ScoutCommit/capture" "$D/.ufo/waves/round-65/build/K65ScoutTagVersion/capture"
cp "$B/K65ScoutTypesTs/capture/types.ts"                 "$D/.ufo/waves/round-65/build/K65ScoutTypesTs/capture/types.ts"
cp "$B/K65ScoutRuntimeDoc/capture/mcp-runtime-lifecycle.md" "$D/.ufo/waves/round-65/build/K65ScoutRuntimeDoc/capture/mcp-runtime-lifecycle.md"
cp "$B/K65ScoutCommit/capture/10bce690.patch"            "$D/.ufo/waves/round-65/build/K65ScoutCommit/capture/10bce690.patch"
cp "$B/K65ScoutTagVersion/capture/client.ts"             "$D/.ufo/waves/round-65/build/K65ScoutTagVersion/capture/client.ts"
cp "$B/K65ScribeEntryA/capture/zai.ts"                   "$D/.ufo/waves/round-65/build/K65ScribeEntryA/capture/zai.ts"
cp "$B/K65ScribeEntryA/capture/http.ts"                  "$D/.ufo/waves/round-65/build/K65ScribeEntryA/capture/http.ts"

# 3. rows, pins, README row, PROVINCE line, amendment
python3 - "$D" "$B" <<'PY'
import json, sys, re
D, B = sys.argv[1], sys.argv[2]
ENTRY = 'corpus/knowledge/omp-installed-release-mcp-runtime.md'

rows = [open(f'{B}/{p}').read().strip() for p in [
    'K65ScoutTypesTs/row-S201.md', 'K65ScoutRuntimeDoc/S202-row.md',
    'K65ScribeEntryA/row-S203.md', 'K65ScribeEntryA/row-S204.md',
    'K65ScribeEntryA/row-S205.md', 'K65ScribeEntryA/row-S206.md']]
p = f'{D}/corpus/SOURCES.md'
s = open(p).read().split('\n')
i = next(k for k, l in enumerate(s) if re.match(r'^ {0,3}\|\s*S200\s*\|', l))
s[i+1:i+1] = rows
open(p, 'w').write('\n'.join(s))

pins = [
 {"sourceId":"S201","path":".ufo/waves/round-65/build/K65ScoutTypesTs/capture/types.ts","sha256":"caa3eadeb21bc36d8c6a4bf65fd362b1b27d4c189ca40684b1e11075c48bfe0d","bytes":16167,"captured":"2026-10-25"},
 {"sourceId":"S202","path":".ufo/waves/round-65/build/K65ScoutRuntimeDoc/capture/mcp-runtime-lifecycle.md","sha256":"362acea5d3d0eca06d54aa9a80febab5a43634007ab40a435dbb0c75079cf83d","bytes":22741,"captured":"2026-10-25"},
 {"sourceId":"S203","path":".ufo/waves/round-65/build/K65ScoutCommit/capture/10bce690.patch","sha256":"eedfbbc405d55fdb205b74a76a67f06a0a78fa9b383a06a491107a034e172c9b","bytes":9953,"captured":"2026-10-25"},
 {"sourceId":"S204","path":".ufo/waves/round-65/build/K65ScoutTagVersion/capture/client.ts","sha256":"479aef6ddda012f8402bc2480637a8c71ada8597d9705a56080dd3ed7c7d3fe9","bytes":14975,"captured":"2026-10-25"},
 {"sourceId":"S205","path":".ufo/waves/round-65/build/K65ScribeEntryA/capture/zai.ts","sha256":"0598c9f221c006af760893d4b68ecea095ee4c090ff56efb8ebf664afc2fd8bb","bytes":12774,"captured":"2026-10-25"},
 {"sourceId":"S206","path":".ufo/waves/round-65/build/K65ScribeEntryA/capture/http.ts","sha256":"41ad7d5b3ff364ba790d4a2a9a54b3f0fa0e491c0b836e3c6436c9ea64cbf033","bytes":33157,"captured":"2026-10-25"}]
p = f'{D}/.ufo/pins/source-captures.json'
j = json.load(open(p))
have = {c['sourceId'] for c in j['captures']}
j['captures'] = [c for c in j['captures'] if c['sourceId'] not in {'S201','S202','S203','S204','S205','S206'}] + [c for c in pins if c['sourceId'] not in have]
open(p, 'w').write(json.dumps(j, indent=2) + '\n')

p = f'{D}/corpus/README.md'
s = open(p).read().split('\n')
k = next(k for k, l in enumerate(s) if '`knowledge/omp-task-contract.md`' in l)
s[k:k] = ['| `knowledge/omp-installed-release-mcp-runtime.md` | The installed OMP release at the MCP layer (round 65, S201–S206, measured not just versioned): the release is `omp/18.12.6` behind a 1680-byte crash-restart wrapper; the coding agent sends `2025-11-25` in `initialize` and adopts the server\'s revision, and a second MCP client (Z.AI web search) pins `2025-03-26`; the `MCP-Protocol-Version` header is absent on `initialize` and carries the negotiated revision afterwards; the 250 ms startup gate and the no-replay rule are documentation facts at the tag, not byte facts | S201–S206 in `corpus/SOURCES.md` |']
open(p, 'w').write('\n'.join(s))

p = f'{D}/PROVINCE.md'
s = open(p).read().split('\n')
k = next(k for k, l in enumerate(s) if l.startswith('- OMP harness contract (task batch'))
s.insert(k + 1, '- OMP harness contract, installed-release measurement — `corpus/knowledge/omp-installed-release-mcp-runtime.md` (round 65, S201–S206) advances the band\'s first entry by measuring the installed release at its own tag: two MCP clients in one binary on two revisions, a header that is absent until negotiation, and the wrapper that mediates every reading.')
open(p, 'w').write('\n'.join(s))

amend = open(f'{B}/K65ScribeEntryA/amendment-omp-task-contract.md').read()
p = f'{D}/corpus/knowledge/omp-task-contract.md'
s = open(p).read()
open(p, 'w').write(s + ('\n' if not s.endswith('\n') else '') + '\n' + amend)

# 3b. the lesson path in S202's used-by must EXIST (census E11 / sources-check USED_BY_MISSING);
#     this fixture drops the cell instead of fabricating a lesson, and records the choice.
p = f'{D}/corpus/SOURCES.md'
s = open(p).read().split('\n')
for k, l in enumerate(s):
    if re.match(r'^ {0,3}\|\s*S202\s*\|', l):
        cells = l.split('|')
        cells[11] = ' ' + ENTRY + ' '
        s[k] = '|'.join(cells)
open(p, 'w').write('\n'.join(s))

# 3c. readme-map requires the new knowledge file in its pin registry as well as in README.md
p = f'{D}/.ufo/pins/readme-map.json'
j = json.load(open(p))
cov = set(j['covered']) | {'knowledge/omp-installed-release-mcp-runtime.md'}
j['covered'] = sorted(cov)
open(p, 'w').write(json.dumps(j, indent=1) + '\n')
print('integrated')
PY

git -C "$D" -c user.name=fixture -c user.email=fixture@localhost add -A
git -C "$D" -c user.name=fixture -c user.email=fixture@localhost commit -q -m "fixture: round-65 C2 draft integration (throwaway, sandbox clone)"
REV=$(git -C "$D" rev-parse HEAD)
echo "FIXTURE_REV=$REV"
node "$LANE/.ufo/waves/round-65/probe/omp65-probe.mjs" "$D" "$REV"; echo "COUNTER_EXIT=$?"
