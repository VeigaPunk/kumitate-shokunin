#!/usr/bin/env python3
"""exposure.py — K100CriticB: live exposure of R100 (21 fleet lanes + kumitate SOURCES history).

Implements the census row_pass id reader (gawk RS=LF, FS='|', trim [ \\t], gate ^ {0,3}\\|,
## Registry section) and the four JS readers (BASE/candidate cite, BASE/candidate capture)
with ECMAScript \\s / m semantics, then reports the divergence sets and the live impact:
new ghosts (README), new orphans (pin registry), census-valid rows lost/gained.

Read-only. Writes nothing outside stdout (the caller redirects).
"""
import json
import os
import re
import subprocess
import sys

FLEET = '/home/vgpnk/Projects/shokunin'
LANE = os.path.join(FLEET, 'kumitate-shokunin')
TODAY = '2026-11-07'

# ECMAScript WhiteSpace + LineTerminator (ECMA-262 11.2/11.3)
JS_WS = ('\t\n\v\f\r \u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008'
         '\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff')
JSC = '[' + re.escape(JS_WS) + ']'
ID = r'(S[0-9]{3,})'
GATE = r'^ {0,3}\|'
CITE_BASE = re.compile(GATE + JSC + '*' + ID + JSC + r'\|')
CITE_CAND = re.compile(GATE + r'[ \t]*' + ID + r'[ \t]*\|')
# JS m: ^ matches at start or after any LineTerminator (LF, CR, LS, PS)
CAP_BASE = re.compile(r'(?:^|(?<=[\n\r\u2028\u2029]))' + JSC + r'*\|' + JSC + '*' + ID + JSC + r'\|')
CAP_CAND = re.compile(GATE + r'[ \t]*' + ID + r'[ \t]*\|')
CENSUS_ID = re.compile(r'^S[0-9]{3,}$')
SEP_CELL = re.compile(r'^:?-+:?$')
README_GATE = re.compile(JSC + r'*\| ')
CITE_TOKEN = re.compile(r'\bS[0-9]{3,}\b')


def records(text):
    """gawk RS='\\n': a trailing newline does not create an empty final record."""
    lines = text.split('\n')
    if lines and lines[-1] == '':
        lines.pop()
    return lines


def census_valid(text):
    """Return (rows, valid_ids, e12_ids, malformed_rows, dup_ids) as row_pass reads them."""
    rows = 0
    valid = []
    e12 = []
    malformed = []
    seen = set()
    dups = []
    in_registry = False
    for line in records(text):
        if re.match(r'^ {0,3}##[ \t]', line):
            in_registry = re.sub(r'^ {0,3}', '', line)[2:].strip(' \t') == 'Registry'
            continue
        if re.match(r'^ {0,3}#[ \t]', line):
            in_registry = False
            continue
        if not re.match(GATE, line):
            continue
        line = re.sub(r'^ {0,3}', '', line)
        if not in_registry:
            if re.match(r'^\|[ \t]*S[0-9]{3,}[ \t]*\|', line):
                e12.append(line.split('|')[1].strip(' \t'))
            continue
        cells = line.split('|')
        nf = len(cells)
        # separator_row()
        if nf >= 3 and cells[1].strip(' \t') == 'id':
            continue
        if nf >= 3 and all(SEP_CELL.match(c.strip(' \t')) for c in cells[1:nf - 1]):
            continue
        rows += 1
        rid = cells[1].strip(' \t') if nf > 1 else ''
        if nf != 13:
            malformed.append(rid)
            continue
        if CENSUS_ID.match(rid):
            if rid in seen:
                dups.append(rid)
            seen.add(rid)
            valid.append(rid)
    return rows, valid, e12, malformed, dups


def ids_cite_base(text):
    return [m.group(1) for line in records(text) if (m := CITE_BASE.match(line))]


def ids_cite_cand(text):
    return [m.group(1) for line in records(text) if (m := CITE_CAND.match(line))]


def ids_cap_base(text):
    return [m.group(1) for m in CAP_BASE.finditer(text)]


def ids_cap_cand(text):
    return [m.group(1) for line in records(text) if (m := CAP_CAND.match(line))]


def readme_cites(text):
    out = []
    for line in records(text):
        if README_GATE.match(line):
            out.extend(CITE_TOKEN.findall(line))
    return out


def scan(text):
    rows, valid, e12, malformed, dups = census_valid(text)
    cb, cc = ids_cite_base(text), ids_cite_cand(text)
    pb, pc = ids_cap_base(text), ids_cap_cand(text)
    return {
        'rows': rows,
        'valid': set(valid),
        'e12': e12,
        'malformed': len(malformed),
        'dups': dups,
        'cite_base': set(cb), 'cite_cand': set(cc),
        'cap_base': set(pb), 'cap_cand': set(pc),
        'cite_lost': set(cb) - set(cc),
        'cap_lost': set(pb) - set(pc),
        'crlf_lines': sum(1 for ln in records(text) if ln.endswith('\r')),
        'nonlf': sum(1 for ln in records(text) for ch in ln if ch in '\r\u2028\u2029\u0085\v\f'),
    }


def census_cli(path):
    r = subprocess.run(['bash', os.path.join(FLEET, 'scripts', 'sources-census.sh'),
                        'census', '--file', path], capture_output=True, text=True)
    m = re.search(r'^file\trows\t(\d+)$', r.stdout, re.M)
    return int(m.group(1)) if m else None


def main():
    lanes = sorted(d for d in os.listdir(FLEET)
                   if d.endswith('-shokunin') and os.path.isfile(os.path.join(FLEET, d, 'corpus', 'SOURCES.md')))
    print(f'lanes={len(lanes)}')
    print('lane\trows\tcli\te12\tmalformed\tcrlf\tnonlf\tcite_lost\tcap_lost\treadme_cites\tnew_ghosts')
    tot = dict(rows=0, e12=0, malformed=0, crlf=0, nonlf=0, cite_lost=0, cap_lost=0, cites=0, ghosts=0)
    all_cite_lost, all_cap_lost = set(), set()
    for ln in lanes:
        src = os.path.join(FLEET, ln, 'corpus', 'SOURCES.md')
        text = open(src, 'rb').read().decode('utf-8', 'surrogateescape')
        s = scan(text)
        cli = census_cli(src)
        readme = os.path.join(FLEET, ln, 'corpus', 'README.md')
        cites = readme_cites(open(readme, 'rb').read().decode('utf-8', 'surrogateescape')) if os.path.isfile(readme) else []
        new_ghosts = sorted(set(cites) & s['cite_lost'])
        print(f"{ln}\t{s['rows']}\t{cli}\t{len(s['e12'])}\t{s['malformed']}\t{s['crlf_lines']}\t"
              f"{s['nonlf']}\t{len(s['cite_lost'])}\t{len(s['cap_lost'])}\t{len(cites)}\t{len(new_ghosts)}")
        if cli is not None and cli != s['rows']:
            print(f"  !! census_cli_mismatch {ln}: impl={s['rows']} cli={cli}")
        tot['rows'] += s['rows']
        tot['e12'] += len(s['e12'])
        tot['malformed'] += s['malformed']
        tot['crlf'] += s['crlf_lines']
        tot['nonlf'] += s['nonlf']
        tot['cite_lost'] += len(s['cite_lost'])
        tot['cap_lost'] += len(s['cap_lost'])
        tot['cites'] += len(cites)
        tot['ghosts'] += len(new_ghosts)
        all_cite_lost |= s['cite_lost']
        all_cap_lost |= s['cap_lost']
        if new_ghosts:
            print(f"  new_ghosts {ln}: {new_ghosts}")
    print('TOTAL\t' + '\t'.join(str(tot[k]) for k in
          ('rows', 'e12', 'malformed', 'crlf', 'nonlf', 'cite_lost', 'cap_lost', 'cites', 'ghosts')))
    print(f'all_cite_lost={len(all_cite_lost)} all_cap_lost={len(all_cap_lost)}')

    # pin registry exposure (kumitate only)
    pin = os.path.join(LANE, '.ufo', 'pins', 'source-captures.json')
    if os.path.isfile(pin):
        reg = json.load(open(pin))
        bound = {c['sourceId'] for c in reg.get('captures', [])}
        for x in reg.get('exemptions', []):
            bound |= set(x['ids'])
        text = open(os.path.join(LANE, 'corpus', 'SOURCES.md'), 'rb').read().decode('utf-8', 'surrogateescape')
        s = scan(text)
        new_orph = sorted(bound & s['cap_lost'])
        base_unc = sorted(s['cap_base'] - bound)
        cand_unc = sorted(s['cap_cand'] - bound)
        print(f"pin bound={len(bound)} new_orphans={len(new_orph)} base_uncaptured={len(base_unc)} "
              f"cand_uncaptured={len(cand_unc)}")
        if new_orph:
            print(f"  new_orphans={new_orph}")

    # kumitate SOURCES history
    revs = subprocess.run(['git', '-C', LANE, 'log', '--format=%H', '--', 'corpus/SOURCES.md'],
                          capture_output=True, text=True).stdout.split()
    print(f'history_revs={len(revs)}')
    h = dict(rows=0, e12=0, malformed=0, crlf=0, nonlf=0, cite_lost=0, cap_lost=0, revs=len(revs),
             revs_with_loss=0, revs_crlf=0, revs_nonlf=0)
    for rev in revs:
        r = subprocess.run(['git', '-C', LANE, 'show', f'{rev}:corpus/SOURCES.md'],
                           capture_output=True)
        if r.returncode != 0:
            print(f'  !! show_failed {rev}')
            continue
        s = scan(r.stdout.decode('utf-8', 'surrogateescape'))
        h['rows'] += s['rows']
        h['e12'] += len(s['e12'])
        h['malformed'] += s['malformed']
        h['crlf'] += s['crlf_lines']
        h['nonlf'] += s['nonlf']
        h['cite_lost'] += len(s['cite_lost'])
        h['cap_lost'] += len(s['cap_lost'])
        if s['cite_lost'] or s['cap_lost']:
            h['revs_with_loss'] += 1
            print(f"  rev {rev[:12]} cite_lost={sorted(s['cite_lost'])[:8]} cap_lost={sorted(s['cap_lost'])[:8]}")
        if s['crlf_lines']:
            h['revs_crlf'] += 1
        if s['nonlf']:
            h['revs_nonlf'] += 1
    print('HISTORY\t' + '\t'.join(f'{k}={v}' for k, v in h.items()))


if __name__ == '__main__':
    main()
