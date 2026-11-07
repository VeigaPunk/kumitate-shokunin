#!/usr/bin/env python3
"""K97Scout: classify every '#'-starting line of every lane's corpus/SOURCES.md by the
round-97 plan's grammar classes, and flag lines where the BASE reader and the census
reader disagree about the active section.

BASE reader (sources-check.mjs @ 477afff, runCheck):
  lines = sourceText.split(/\\r?\\n/).map(normalizeMarkdownIndent)   # normalizeMarkdownIndent: ^ {1,3}(?=\\S) -> ''
  heading regex ^## (.+?)\\s*$   -> section = match[1]
  else /^#(?:\\s|$)/ -> section = null
  inside Registry iff section === 'Registry'

Census reader (scripts/sources-census.sh row_pass, gawk RS="\\n"):
  raw line (CR kept)
  /^ {0,3}##[ \\t]/ -> in_registry = (trim(substr(line,3)) == "Registry")   trim = strip [ \\t] only
  /^ {0,3}#[ \\t]/  -> in_registry = 0
  (no strip of CR, no NBSP/VT/FF trim)
"""
import os, sys, glob, re, unicodedata, json

BASE_HEAD = re.compile(r'^## (.+?)\s*$')
BASE_CLEAR = re.compile(r'^#(?:\s|$)')
CENSUS_HEAD = re.compile(r'^ {0,3}##[ \t]')
CENSUS_CLEAR = re.compile(r'^ {0,3}#[ \t]')
JS_WS = ' \t\n\r\v\f                 　﻿'

def normalize_markdown_indent(line):
    return re.sub(r'^ {1,3}(?=\S)', '', line, count=1)

def base_reader(text):
    """returns list of (section_or_None) per line, as BASE sees it"""
    lines = text.split('\n')
    lines = [re.sub(r'\r$', '', l) for l in lines]   # split(/\\r?\\n/)
    lines = [normalize_markdown_indent(l) for l in lines]
    secs = []
    active = None
    for l in lines:
        m = BASE_HEAD.match(l)
        if m:
            active = m.group(1)
        elif BASE_CLEAR.match(l):
            active = None
        secs.append(active)
    return secs

def census_reader(text):
    """returns list of (section_or_None) per line, as the census sees it (CR kept)"""
    lines = text.split('\n')
    secs = []
    active = None
    for l in lines:
        if CENSUS_HEAD.match(l):
            inner = re.sub(r'^ {0,3}', '', l)[3:]
            active = re.sub(r'[ \t]+$', '', re.sub(r'^[ \t]+', '', inner))
        elif CENSUS_CLEAR.match(l):
            active = None
        secs.append(active)
    return secs

def classify(line):
    """classify a '#'-starting line into the plan's grammar classes"""
    # leading indent
    m = re.match(r'^[ \t]*', line)
    indent_raw = m.group(0)
    has_tab_indent = '\t' in indent_raw
    n_spaces = len(indent_raw) - indent_raw.count('\t')
    marker = None
    rest = None
    mm = re.match(r'^(#+)', line[len(indent_raw):])
    if mm:
        marker = mm.group(1)
        rest = line[len(indent_raw)+len(marker):]
    sep = 'none'
    if rest is not None:
        if rest.startswith(' '): sep = 'SP'
        elif rest.startswith('\t'): sep = 'TAB'
        elif rest.startswith('\v'): sep = 'VT'
        elif rest.startswith('\f'): sep = 'FF'
        elif rest.startswith('\r'): sep = 'CR'
        elif rest.startswith('\ '): sep = 'NBSP'
    text = rest[1:] if rest and rest[:1] in (' ', '\t', '\v', '\f', '\r', ' ') else rest
    trail = 'none'
    for cand, name in (('\r','CR'), ('\v','VT'), ('\f','FF'), ('\ ','NBSP'), ('\t','TAB'), (' ','SP')):
        if text.endswith(cand):
            trail = name
            break
    return {
        'indent': indent_raw.replace('\t','<TAB>').replace(' ','<SP>'),
        'indent_kind': ('TAB' if has_tab_indent else ('%dSP' % n_spaces)),
        'marker': marker,
        'sep': sep,
        'text': text,
        'trail': trail,
        'has_cr': '\r' in line,
        'has_vt': '\v' in line,
        'has_ff': '\f' in line,
        'has_nbsp': ' ' in line,
        'has_tab': '\t' in line,
    }

def esc(s):
    out = []
    for ch in s:
        if ch == '\t': out.append('<TAB>')
        elif ch == '\r': out.append('<CR>')
        elif ch == '\v': out.append('<VT>')
        elif ch == '\f': out.append('<FF>')
        elif ch == ' ': out.append('<NBSP>')
        elif ord(ch) < 32: out.append('<%02X>' % ord(ch))
        elif ord(ch) == 0xA0: out.append('<NBSP>')
        else: out.append(ch)
    return ''.join(out)

def main():
    lanes = sorted(glob.glob('/home/vgpnk/Projects/shokunin/*-shokunin/corpus/SOURCES.md'))
    report = []
    total_dis = 0
    for path in lanes:
        lane = path.split('/')[5]
        with open(path, 'rb') as f:
            raw = f.read()
        text = raw.decode('utf-8')
        has_cr = b'\r' in raw
        lines = text.split('\n')
        b = base_reader(text)
        c = census_reader(text)
        cls_counts = {}
        dis = []
        head_lines = []
        for i, l in enumerate(lines):
            # "every '#'-starting line": leading whitespace + '#'
            if not re.match(r'^[ \t]*#', l):
                continue
            k = classify(l)
            key = (k['indent_kind'], k['marker'], k['sep'], k['trail'])
            cls_counts[key] = cls_counts.get(key, 0) + 1
            head_lines.append((i+1, l, k))
            if b[i] != c[i]:
                dis.append((i+1, l, b[i], c[i], k))
        report.append({
            'lane': lane, 'bytes': len(raw), 'crlf_file': has_cr,
            'n_lines': len(lines), 'n_head_lines': len(head_lines),
            'classes': {str(k): v for k, v in sorted(cls_counts.items())},
            'disagreements': dis,
            'base_registry': b.count('Registry'), 'census_registry': c.count('Registry'),
        })
        total_dis += len(dis)
    json.dump(report, open('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-97/K97Scout/survey.json','w'), indent=1)
    # human readable
    out = []
    out.append('=== FLEET REGISTRY HEADING-CLASS SURVEY ===')
    out.append('classes keyed by (indent_kind, marker, separator, trail); SEP/trail chars shown as names')
    out.append('')
    hdr = 'lane                 bytes   CRLF  lines  #lines  cls  disagree  baseReg censusReg'
    out.append(hdr)
    for r in report:
        out.append('%-20s %6d  %-5s %5d  %6d  %3d  %8d  %7d %8d' % (
            r['lane'], r['bytes'], 'yes' if r['crlf_file'] else 'no', r['n_lines'],
            r['n_head_lines'], len(r['classes']), len(r['disagreements']),
            r['base_registry'], r['census_registry']))
    out.append('')
    out.append('TOTAL disagreement lines across fleet: %d' % total_dis)
    for r in report:
        if r['disagreements']:
            out.append('')
            out.append('--- %s: %d disagreeing lines ---' % (r['lane'], len(r['disagreements'])))
            for (ln, l, bs, cs, k) in r['disagreements'][:40]:
                out.append('  L%-6d base=%-22r census=%-22r  line=%s' % (ln, bs, cs, esc(l)))
    open('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-97/K97Scout/survey.txt','w').write('\n'.join(out)+'\n')
    print('\n'.join(out))

main()
