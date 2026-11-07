#!/usr/bin/env python3
"""K99CriticB exposure scan: cells whose ECMAScript trim differs from POSIX blank trim."""
import json, os, re, subprocess, sys

FLEET = '/home/vgpnk/Projects/shokunin'
LANE = os.path.join(FLEET, 'kumitate-shokunin')
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'

JS_SET = set('\t\n\x0b\x0c\r \u00a0\u1680' + ''.join(chr(c) for c in range(0x2000, 0x200b))
             + '\u2028\u2029\u202f\u205f\u3000\ufeff')

def js_trim(s):
    i, j = 0, len(s)
    while i < j and s[i] in JS_SET: i += 1
    while j > i and s[j - 1] in JS_SET: j -= 1
    return s[i:j]

def blank_trim(s):
    return s.strip(' \t')

HEAD_RE = re.compile(r'^ {0,3}##[ \t]')
TOP_RE = re.compile(r'^ {0,3}#[ \t]')
INDENT_RE = re.compile(r'^ {1,3}(?=\S)')

def scan(text):
    """Return (rows, cells, diffs) for one SOURCES.md text."""
    lines = text.split('\n')
    section = None
    rows = 0
    cells = 0
    diffs = []
    for idx, raw in enumerate(lines):
        if HEAD_RE.match(raw):
            section = raw.replace('^ {0,3}##', '') if False else raw.split('##', 1)[1]
            section = section.strip(' \t')
            continue
        if TOP_RE.match(raw):
            section = None
            continue
        line = INDENT_RE.sub('', raw)
        if not line.startswith('|'):
            continue
        fields = line.split('|')
        if len(fields) < 3:
            continue
        if section == 'Registry':
            rows += 1
        for ci in range(1, len(fields) - 1):
            cell = fields[ci]
            cells += 1
            a, b = js_trim(cell), blank_trim(cell)
            if a != b:
                diffs.append({'line': idx + 1, 'col': ci, 'section': section,
                              'js': a, 'blank': b,
                              'escaped_js': a.encode('unicode_escape').decode('ascii'),
                              'escaped_blank': b.encode('unicode_escape').decode('ascii'),
                              'residual': b.encode('unicode_escape').decode('ascii'),
                              'blank_is_empty': b == ''})
    return rows, cells, diffs

lanes = sorted(n for n in os.listdir(FLEET)
               if n.endswith('-shokunin') and os.path.isfile(os.path.join(FLEET, n, 'corpus', 'SOURCES.md')))
live = {}
total_rows = total_cells = total_diffs = 0
for lane in lanes:
    p = os.path.join(FLEET, lane, 'corpus', 'SOURCES.md')
    text = open(p, 'rb').read().decode('utf-8')
    rows, cells, diffs = scan(text)
    total_rows += rows; total_cells += cells; total_diffs += len(diffs)
    live[lane] = {'rows': rows, 'cells': cells, 'diffs': diffs, 'sha256': __import__('hashlib').sha256(text.encode()).hexdigest()}

# --- kumitate lane history -------------------------------------------------
revs = subprocess.run(['git', '-C', LANE, 'rev-list', '--all', '--', 'corpus/SOURCES.md'],
                      capture_output=True, text=True, check=True).stdout.split()
hist = []
hist_diffs = 0
hist_rows = 0
for rev in revs:
    show = subprocess.run(['git', '-C', LANE, 'show', f'{rev}:corpus/SOURCES.md'],
                          capture_output=True)
    if show.returncode != 0:
        continue
    text = show.stdout.decode('utf-8', 'replace')
    rows, cells, diffs = scan(text)
    hist_rows += rows
    if diffs:
        hist_diffs += 1
        hist.append({'rev': rev, 'rows': rows, 'diffs': diffs[:20], 'ndiffs': len(diffs)})

report = {
    'js_trim_class': 'ECMAScript TrimString: TAB LF VT FF CR SP NBSP U+1680 U+2000-200A U+2028 U+2029 U+202F U+205F U+3000 U+FEFF',
    'blank_trim_class': 'SP TAB only',
    'lanes_scanned': len(lanes),
    'live': {'rows': total_rows, 'cells': total_cells, 'cells_with_nonblank_edge': total_diffs},
    'live_lane_detail': live,
    'history': {'commits_scanning_sources_md': len(revs), 'registry_rows_scanned': hist_rows,
                'commits_with_nonblank_edge_cell': hist_diffs, 'detail': hist},
}
with open(os.path.join(OUT, 'exposure.json'), 'w', encoding='utf-8') as fh:
    json.dump(report, fh, indent=1, ensure_ascii=True)
print('lanes', len(lanes), 'live rows', total_rows, 'cells', total_cells, 'nonblank-edge cells', total_diffs)
print('history commits', len(revs), 'rows', hist_rows, 'commits with nonblank-edge cell', hist_diffs)
