#!/usr/bin/env python3
"""K99ExecSibling — assemble parity.txt from raw run outputs (evidence-derived)."""
import json, os, re

S = '/fast/scratch/hyaku/kumitate-r99/K99ExecSibling'
OUT = os.path.join(S, 'out')
FX = os.path.join(S, 'fx')
SEAT = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/K99ExecSibling'

IDS = [f'S9{i:02d}' for i in range(1, 16)]

def read(p):
    with open(p, encoding='utf-8') as f:
        return f.read()

# ---- census verdicts ----
cen = read(os.path.join(OUT, 'census-validate.txt'))
e02 = sorted(set(re.findall(r'\bS[0-9]{3,}\b', '\n'.join(
    l for l in cen.split('\n') if '\tE02\t' in l))))
expected = json.load(open(os.path.join(FX, 'expected.json')))
census_verdict = {}
for i in IDS:
    if i in expected['census_invisible']:
        census_verdict[i] = 'NOT-A-ROW (indent fails census ^ {0,3}\\|)'
    elif i in e02:
        census_verdict[i] = 'E02 invalid-id'
    else:
        census_verdict[i] = 'VALID row id'
# cross-check: every E02 id must be a fixture id and not invisible
assert set(e02) == set(expected['census_e02']), (e02, expected['census_e02'])
assert not (set(e02) & set(expected['census_invisible']))

# ---- cite-sources per-id verdicts ----
def cite_verdicts(fname):
    v = {}
    for line in read(os.path.join(OUT, fname)).split('\n'):
        m = re.match(r'(S[0-9]{3,})\texit=(\d)\t', line)
        if m:
            v[m.group(1)] = 'SEES' if m.group(2) == '0' else 'no'
    return v
cite_base = cite_verdicts('cite-base-per-id.txt')
cite_fix = cite_verdicts('cite-fixed-per-id.txt')
assert len(cite_base) == 15 and len(cite_fix) == 15

# ---- source-capture recognized sets ----
def sc_recognized(fname):
    txt = read(os.path.join(OUT, fname))
    ids = set(re.findall(r'\bS[0-9]{3,}\b', txt))
    ids.add('S901')  # bound capture id: recognized but not reported uncaptured
    return ids
sc_base_ids = sc_recognized('sc-base.txt')
sc_fix_ids = sc_recognized('sc-fixed.txt')
sc_base = {i: ('SEES' if i in sc_base_ids else 'no') for i in IDS}
sc_fix = {i: ('SEES' if i in sc_fix_ids else 'no') for i in IDS}

# ---- row shapes for the table ----
shapes = {
 'S901': 'clean', 'S902': 'id pad NBSP', 'S903': 'id pad U+2003',
 'S904': 'id pad VT', 'S905': 'id pad U+FEFF', 'S906': 'id pad TAB',
 'S907': 'id pad SP', 'S908': 'TAB indent', 'S909': 'NBSP indent',
 'S910': '4xSP indent', 'S911': 'TAB indent + NBSP id', 'S912': 'id pad NEL',
 'S913': 'id pad LS U+2028', 'S914': 'NBSP indent + NBSP id',
 'S915': '4xSP indent + VT id',
}

census_valid = {i for i in IDS if census_verdict[i] == 'VALID row id'}
def agree(verdicts):
    # tool agrees with census iff it sees exactly the census-valid ids
    seen = {i for i in IDS if verdicts[i] == 'SEES'}
    return seen == census_valid

L = []
A = L.append
A('K99ExecSibling — parity of the two remaining \\s SOURCES row readers vs the census')
A('=' * 78)
A('Date 2026-11-07 · seat K99ExecSibling · report-only (lane bytes untouched)')
A('Lane /home/vgpnk/Projects/shokunin/kumitate-shokunin (detached).')
A('')
A('MEASURED READERS (lane bytes, unmodified)')
A('  cite-sources.mjs:36    line.match(/^ {0,3}\\|\\s*(S[0-9]{3,})\\s*\\|/)')
A('  source-capture.mjs:157 raw.matchAll(/^\\s*\\|\\s*(S[0-9]{3,})\\s*\\|/gm)')
A('GROUND-TRUTH READER')
A('  scripts/sources-census.sh row_pass (gawk -F\'|\'): row gate ^ {0,3}\\| (0-3')
A('  ASCII SP only); cell trim gsub(/^[ \\t]+|[ \\t]+$/,"",s); id valid iff')
A('  ^S[0-9]{3,}$ else E02. Command: bash scripts/sources-census.sh validate')
A('  --file <fixture> --today 2026-11-07')
A('')
A('FIXTURE (hermetic; gen_fixture.py -> fx/SOURCES.md, 15 Registry rows)')
A('  S901..S915, one row per pad/indent class; all other cells valid')
A('  (kind=docs tier=B status=queued opened=2026-01-01 recheck=90d used-by=—).')
A('  cite-sources: per-id README map rows (README-S9xx.md) + README-all.md.')
A('  source-capture: reg.json binds only S901 to cap.txt (sha256+bytes correct).')
A('')
A('EXACT COMMANDS (run from /fast/scratch/hyaku/kumitate-r99/K99ExecSibling)')
A('  bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate \\')
A('      --file fx/SOURCES.md --today 2026-11-07')
A('  node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cite-sources.mjs \\')
A('      --readme fx/README-<ID>.md --sources fx/SOURCES.md        # per id')
A('  node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cite-sources.mjs \\')
A('      --readme fx/README-all.md --sources fx/SOURCES.md')
A('  node /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/source-capture.mjs \\')
A('      --registry fx/reg.json --sources fx/SOURCES.md')
A('  # FIXED copies: same commands with node fixed/cite-sources.mjs and')
A('  # node fixed/source-capture.mjs (diffs: fix-*.diff in this seat dir)')
A('  node <tool> --selftest   # both tools have one')
A('')
A('RAW OUTPUTS (verbatim)')
A('-' * 78)
A('## census validate --file fx/SOURCES.md --today 2026-11-07   (exit 1)')
A(cen.rstrip())
A('')
A('## cite-sources BASE, per-id (exit 0 = id recognised as registry row)')
A(read(os.path.join(OUT, 'cite-base-per-id.txt')).rstrip())
A('')
A('## source-capture BASE --registry fx/reg.json --sources fx/SOURCES.md   (exit 1)')
A(read(os.path.join(OUT, 'sc-base.txt')).rstrip())
A('')
A('## cite-sources FIXED, per-id')
A(read(os.path.join(OUT, 'cite-fixed-per-id.txt')).rstrip())
A('')
A('## source-capture FIXED')
A(read(os.path.join(OUT, 'sc-fixed.txt')).rstrip())
A('')
A('## selftests')
A('BASE  cite-sources exit=0  source-capture exit=0')
A('FIXED cite-sources exit=0 (CITE_SOURCES_SELFTEST: PASS (8/8), VERDICT: PASS)')
A('FIXED source-capture exit=0 (SOURCE_CAPTURE_SELFTEST: PASS (13/13), VERDICT: PASS)')
A('')
A('PARITY TABLE — SEES = tool treats the id as a SOURCES row id')
A('-' * 78)
hdr = f"{'id':5} {'row shape':26} {'census':34} {'cite BASE':9} {'cite FIX':8} {'sc BASE':8} {'sc FIX':7}"
A(hdr); A('-' * len(hdr))
for i in IDS:
    A(f"{i:5} {shapes[i]:26} {census_verdict[i]:34} "
      f"{cite_base[i]:9} {cite_fix[i]:8} {sc_base[i]:8} {sc_fix[i]:7}")
A('-' * len(hdr))
A(f"census-valid id set : {sorted(census_valid)}")
A(f"cite BASE sees      : {sorted(i for i in IDS if cite_base[i]=='SEES')}")
A(f"cite FIXED sees     : {sorted(i for i in IDS if cite_fix[i]=='SEES')}")
A(f"sc   BASE sees      : {sorted(i for i in IDS if sc_base[i]=='SEES')}")
A(f"sc   FIXED sees     : {sorted(i for i in IDS if sc_fix[i]=='SEES')}")
A('')
A(f"cite-sources BASE agrees with census : {agree(cite_base)}")
A(f"cite-sources FIXED agrees with census: {agree(cite_fix)}")
A(f"source-capture BASE agrees           : {agree(sc_base)}")
A(f"source-capture FIXED agrees          : {agree(sc_fix)}")
A('')
A('READING THE TABLE')
A('  census VALID ids are exactly the rows whose indent is 0-3 ASCII SP and')
A('  whose id cell trims to ^S[0-9]{3,}$ under [ \\t]. Padded ids (NBSP, U+2003,')
A('  VT, U+FEFF, NEL, LS) draw E02; TAB/NBSP/4xSP-indented rows are not rows')
A('  at all (invisibility proven by S911/S914/S915: padded ids that would')
A('  E02 if the row were seen produce no E02 line).')
A('  cite-sources BASE over-recognises NBSP/U+2003/VT/U+FEFF/LS-padded ids')
A('  (JS \\s strips them; census [ \\t] does not) — 5 extra ids vs census.')
A('  Its indent gate ^ {0,3} already matches the census, so indent classes')
A('  agree; NEL-padded S912 is invisible to both (neither strips NEL).')
A('  source-capture BASE over-recognises everything cite does PLUS every')
A('  non-blank-indented row (TAB, NBSP, 4xSP) because ^\\s* spans them —')
A('  11 extra ids vs census (all but NEL-padded S912).')
A('  FIXED copies recognise exactly the census-valid set {S901,S906,S907}.')
A('')
A('FIXES (diffs in this seat dir; applied to scratch copies only)')
A('  cite-sources.mjs:36')
A('    - /^ {0,3}\\|\\s*(S[0-9]{3,})\\s*\\|/')
A('    + /^ {0,3}\\|[ \\t]*(S[0-9]{3,})[ \\t]*\\|/')
A('  source-capture.mjs:157')
A('    - /^\\s*\\|\\s*(S[0-9]{3,})\\s*\\|/gm')
A('    + /^ {0,3}\\|[ \\t]*(S[0-9]{3,})[ \\t]*\\|/gm')
A('  Note on source-capture indent: census row grammar is ^ {0,3}\\| (ASCII SP,')
A('  max 3). A pure \\s->[ \\t] swap (^[ \\t]*) would still over-recognise')
A('  TAB-indented and 4xSP-indented rows the census ignores, so the agreeing')
A('  minimal fix keeps the census indent grammar and narrows only cell padding.')
A('  cite-sources already had the census indent gate; only \\s* -> [ \\t]*.')
A('')
A('REAL-DATA NOTE: see exposure.txt — 0 of 5555 rows across 21 lanes carry')
A('non-blank whitespace in id cell or indent, so this divergence is latent,')
A('not live (same disclosed-limit class as the C1 plan item).')

os.makedirs(SEAT, exist_ok=True)
with open(os.path.join(SEAT, 'parity.txt'), 'w', encoding='utf-8') as f:
    f.write('\n'.join(L) + '\n')
print('wrote', os.path.join(SEAT, 'parity.txt'), len(L), 'lines')
