#!/usr/bin/env python3
"""K99ExecSibling — hermetic fixture generator for the two \\s SOURCES row readers.

Builds fx/SOURCES.md whose Registry rows exercise:
  - id-cell padding: NBSP, U+2003, VT, U+FEFF, TAB, SP, NEL, LS(U+2028)
  - row indent: TAB, NBSP, 4xSP
  - combinations proving census invisibility per indent class
Also writes per-id READMEs for cite-sources and a source-capture registry.
"""
import hashlib, json, os, re

FX = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'fx')
os.makedirs(FX, exist_ok=True)

NBSP  = ' '
U2003 = ' '
VT    = ''
FEFF  = '﻿'
TAB   = '\t'
NEL   = ''
LS    = ' '
SP    = ' '

HEADER = (
    '# SOURCES — fixture\n'
    '\n'
    'Fixture registry for K99ExecSibling parity measurement.\n'
    '\n'
    '## Registry\n'
    '\n'
    '| id | source | kind | tier | scope | anchor | teaches | status | opened | recheck | used-by |\n'
    '|---|---|---|---|---|---|---|---|---|---|---|\n'
)

def row(rid, indent='', lead='', trail=''):
    cells = [
        lead + rid + trail,
        'fixture source text',
        'docs', 'B', 'fx', 'a', 'teaches fixture row',
        'queued', '2026-01-01', '90d', '—',
    ]
    return indent + '| ' + ' | '.join(cells) + ' |\n'

# (id, indent, lead_pad, trail_pad)  — pads sit INSIDE the id cell
ROWS = [
    ('S901', '', '', ''),            # clean control
    ('S902', '', NBSP, NBSP),        # NBSP pad both sides
    ('S903', '', U2003, U2003),      # EM SPACE pad
    ('S904', '', VT, VT),            # VT pad
    ('S905', '', FEFF, FEFF),        # BOM/ZWNBSP pad
    ('S906', '', TAB, TAB),          # TAB pad — blank class, all readers ok
    ('S907', '', SP + SP, SP + SP),  # extra SP pad — control
    ('S908', TAB, '', ''),           # TAB indent, clean id
    ('S909', NBSP, '', ''),          # NBSP indent, clean id
    ('S910', SP * 4, '', ''),        # 4-space indent (code block), clean id
    ('S911', TAB, NBSP, NBSP),       # TAB indent + NBSP id pad
    ('S912', '', NEL, NEL),          # NEL pad — neither JS \\s nor census blank
    ('S913', '', LS, LS),            # LINE SEPARATOR pad — JS \\s yes, census no
    ('S914', NBSP, NBSP, NBSP),      # NBSP indent + NBSP id pad
    ('S915', SP * 4, VT, VT),        # 4-space indent + VT id pad
]

body = HEADER + ''.join(row(*r) for r in ROWS)
with open(os.path.join(FX, 'SOURCES.md'), 'w', encoding='utf-8', newline='') as f:
    f.write(body)

# per-id READMEs for cite-sources (one map row citing that id)
for rid, *_ in ROWS:
    with open(os.path.join(FX, f'README-{rid}.md'), 'w', encoding='utf-8', newline='') as f:
        f.write('# Fixture README\n\n| `knowledge/a.md` | cites ' + rid + ' |\n')
with open(os.path.join(FX, 'README-all.md'), 'w', encoding='utf-8', newline='') as f:
    f.write('# Fixture README\n\n| `knowledge/a.md` | cites ' + ' and '.join(r[0] for r in ROWS) + ' |\n')

# source-capture registry: bind only the clean control id S901 to a real file
cap = 'fixture capture bytes\n'
cap_sha = hashlib.sha256(cap.encode('utf-8')).hexdigest()
with open(os.path.join(FX, 'cap.txt'), 'w', encoding='utf-8', newline='') as f:
    f.write(cap)
reg = {
    'version': 1,
    'captures': [{
        'sourceId': 'S901', 'path': 'cap.txt',
        'sha256': cap_sha, 'bytes': len(cap.encode('utf-8')),
        'captured': '2026-11-07',
    }],
    'exemptions': [],
}
with open(os.path.join(FX, 'reg.json'), 'w', encoding='utf-8') as f:
    json.dump(reg, f, indent=2)

# expected sets derived from the census grammar (row_pass, sources-census.sh):
#   visible row:  ^ {0,3}\|        (0-3 ASCII SP only)
#   cell trim:    [ \t] only       ->  id valid iff ^S[0-9]{3,}$ after that trim
expected = {'census_valid': [], 'census_e02': [], 'census_invisible': []}
for rid, indent, lead, trail in ROWS:
    visible = indent == '' or (set(indent) == {SP} and len(indent) <= 3)
    if not visible:
        expected['census_invisible'].append(rid)
        continue
    trimmed = (lead + rid + trail).strip(' \t')
    if re.fullmatch(r'S[0-9]{3,}', trimmed):
        expected['census_valid'].append(rid)
    else:
        expected['census_e02'].append(rid)

with open(os.path.join(FX, 'expected.json'), 'w', encoding='utf-8') as f:
    json.dump(expected, f, indent=2)

print('fixture rows:', len(ROWS))
print('expected census_valid:', expected['census_valid'])
print('expected census_e02:', expected['census_e02'])
print('expected census_invisible:', expected['census_invisible'])
print('cap sha256:', cap_sha, 'bytes:', len(cap.encode()))
