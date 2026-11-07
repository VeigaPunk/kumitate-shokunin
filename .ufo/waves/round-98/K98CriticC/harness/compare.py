#!/usr/bin/env python3
"""compare.py — differential H98: candidate declaredPins() vs the fleet census.

usage:
  python3 compare.py --tool LABEL=PATH [--tool LABEL=PATH ...] \
      --files LIST.txt --work DIR --out RESULT.json [--jobs 2]

For every file:
  * run `sources-census.sh validate --file <f> --today 2026-11-07` (the real
    script, one process per file) and keep the TSV receipt;
  * the extracted declaredPins() of every --tool (node harness) yields
    {declared pins, outsideRows, malformedRows};
  * expected values are derived from the census itself:
      OUT   = ids printed on E12 lines, output order;
      MALF  = E01 ids matching ^S[0-9]{3,}$, output order;
      DECL  = 40-hex pins mined from rows the census reads as Registry rows
              (inside ## Registry, not a separator row, NF==13, valid id
              ^S[0-9]{3,}$, status cell not `rejected` under the candidate's
              unchanged status rule) that carry a 40-hex URL path segment.
    The census inside-Registry admission is re-implemented here line-for-line
    from sources-census.sh row_pass() (heading regexes, `[ \t]` trim,
    separator_row, NF, id validity); URL/pin extraction re-implements the
    candidate's unchanged SOURCES_URL_RE/SOURCES_PIN_RE/SOURCES_SEGMENT_RE.
  * compare, per tool: declared set == expected set; outside list == OUT;
    malformed list == MALF.

Census exit 2 or an unparsable receipt is a SETUP error for that file (never a
disagreement). Census exit 0/1 are both normal (1 = validation findings).
"""
import argparse, json, os, re, subprocess, sys, hashlib, tempfile
from concurrent.futures import ThreadPoolExecutor

CENSUS = '/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
TODAY = '2026-11-07'

TRIM = re.compile(r'^[ \t]+|[ \t]+$')
HEAD2 = re.compile(r'^ {0,3}##[ \t]')
HEAD1 = re.compile(r'^ {0,3}#[ \t]')
ROWSTART = re.compile(r'^ {0,3}\|')
E12_SHAPE = re.compile(r'^\|[ \t]*S[0-9]{3,}[ \t]*\|')
VALID_ID = re.compile(r'^S[0-9]{3,}$')
SEPARATOR_CELL = re.compile(r'^:?-+:?$')
URL_RE = re.compile(r'https?://[^\s|)`\'"<>]+')
PIN_RE = re.compile(r'^[0-9a-f]{40}$')
SEG_SPLIT = re.compile(r'[/?#]')

def trim(s):
    return TRIM.sub('', s)

def pins_of_line(line):
    out = []
    for m in URL_RE.finditer(line):
        for seg in SEG_SPLIT.split(m.group(0)):
            if PIN_RE.match(seg):
                out.append(seg)
    return out

def expected(file_bytes):
    """Return (decl_pins_set, out_list, malf_list, stats) from census rules."""
    text = file_bytes.decode('utf-8', errors='surrogateescape')
    lines = text.split('\n')
    in_reg = False
    out, malf, decl = [], [], set()
    stats = {'rows_inside': 0, 'decl_rows': 0}
    for raw in lines:
        line = raw
        if HEAD2.match(line):
            stripped = re.sub(r'^ {0,3}', '', line)
            in_reg = trim(stripped[2:]) == 'Registry'
            continue
        if HEAD1.match(line):
            in_reg = False
            continue
        if not ROWSTART.match(line):
            continue
        stripped = re.sub(r'^ {0,3}', '', line)
        if not in_reg:
            if E12_SHAPE.match(stripped):
                out.append(trim(stripped.split('|')[1]))
            continue
        fields = stripped.split('|')
        nf = len(fields)
        if trim(fields[1]) == 'id':
            continue
        if nf >= 3 and all(SEPARATOR_CELL.match(trim(f)) for f in fields[1:nf - 1]):
            continue
        idv = trim(fields[1])
        stats['rows_inside'] += 1
        if nf != 13:
            malf.append(idv)
            continue
        if not VALID_ID.match(idv):
            continue
        status = trim(fields[8])
        if status.lower() == 'rejected':
            continue
        p = pins_of_line(stripped)
        if p:
            stats['decl_rows'] += 1
            decl.update(p)
    malf = [i for i in malf if VALID_ID.match(i)]
    return decl, out, malf, stats

def run_census(path, receipt_dir, idx):
    outp = os.path.join(receipt_dir, f'{idx:06d}.tsv')
    with open(outp, 'wb') as fh:
        r = subprocess.run([CENSUS, 'validate', '--file', path, '--today', TODAY],
                           stdout=fh, stderr=subprocess.PIPE)
    return r.returncode, outp, r.stderr.decode('utf-8', 'replace')

def parse_census(receipt):
    out, malf = [], []
    with open(receipt, 'rb') as fh:
        raw = fh.read().decode('utf-8', errors='surrogateescape')
    for line in raw.split('\n'):
        if not line:
            continue
        # The id cell may itself contain a TAB (a cell whose trailing char is a
        # non-blank whitespace, e.g. `S123\t\f`, defeats the census [ \t] trim),
        # so split only the lane and code fields off and keep the value raw.
        parts = line.split('\t', 2)
        if len(parts) < 3:
            continue
        code, val = parts[1], parts[2]
        if code == 'E12':
            suffix = ' row outside Registry section'
            out.append(val[:-len(suffix)] if val.endswith(suffix) else val)
        elif code in ('E01',):
            suffix = ' fields='
            idx = val.rfind(suffix)
            idv = val[:idx] if idx >= 0 else val
            malf.append(idv)
    malf = [i for i in malf if VALID_ID.match(i)]
    return out, malf

def sha256_file(path):
    h = hashlib.sha256()
    with open(path, 'rb') as fh:
        for chunk in iter(lambda: fh.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tool', action='append', required=True, metavar='LABEL=PATH')
    ap.add_argument('--files', required=True)
    ap.add_argument('--work', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--jobs', type=int, default=2)
    a = ap.parse_args()
    tools = []
    for t in a.tool:
        label, path = t.split('=', 1)
        tools.append((label, path))
    files = [l.rstrip('\n') for l in open(a.files) if l.strip()]
    census_dir = os.path.join(a.work, 'census')
    harness_dir = os.path.join(a.work, 'harness-out')
    os.makedirs(census_dir, exist_ok=True)
    os.makedirs(harness_dir, exist_ok=True)
    node = shutil_which('node')

    with ThreadPoolExecutor(max_workers=a.jobs) as ex:
        cres = list(ex.map(lambda t: run_census(t[1], census_dir, t[0]), enumerate(files)))

    tool_res = {}
    for label, path in tools:
        outp = os.path.join(harness_dir, f'{label}.jsonl')
        chunk = 200
        tmp_out = outp + '.tmp'
        first = True
        for i in range(0, len(files), chunk):
            part = files[i:i + chunk]
            cmd = [node, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'run-harness.mjs'), path, tmp_out] + part
            subprocess.run(cmd, check=True)
            with open(tmp_out, 'r', encoding='utf-8') as fh:
                data = fh.read()
            with open(outp, 'a' if not first else 'w', encoding='utf-8') as fh:
                fh.write(data)
            first = False
            os.unlink(tmp_out)
        rows = [json.loads(l) for l in open(outp, encoding='utf-8')]
        if len(rows) != len(files):
            raise SystemExit(f'{label}: harness returned {len(rows)} rows for {len(files)} files')
        tool_res[label] = {os.path.abspath(r['file']): r for r in rows}

    records = []
    for i, f in enumerate(files):
        rc, receipt, err = cres[i]
        rec = {'file': f, 'sha256': sha256_file(f), 'census_exit': rc,
               'census_receipt': receipt, 'census_stderr': err[:400]}
        if rc not in (0, 1):
            rec['setup_error'] = f'census exit {rc}'
            records.append(rec)
            continue
        exp_decl, exp_out, exp_malf, stats = expected(open(f, 'rb').read())
        c_out, c_malf = parse_census(receipt)
        rec['expected'] = {'declared_count': len(exp_decl), 'outside': c_out,
                           'malformed': c_malf, 'stats': stats}
        # census reimplementation must agree with the census's own printed ids;
        # E12 ids may repeat/carry chars, MALF is already filtered identically
        rec['census_outside_matches_impl'] = (c_out == exp_out)
        for label, _ in tools:
            h = tool_res[label].get(os.path.abspath(f))
            if h is None:
                rec.setdefault('errors', []).append(f'{label}: harness row missing')
                continue
            got = {'declared': sorted(set(h['declared'])), 'outside': h['outside'],
                   'malformed': h['malformed']}
            exp = {'declared': sorted(exp_decl), 'outside': c_out, 'malformed': c_malf}
            ok_decl = got['declared'] == exp['declared']
            ok_out = got['outside'] == exp['outside']
            ok_malf = got['malformed'] == exp['malformed']
            rec[label] = {
                'agree': ok_decl and ok_out and ok_malf,
                'declared_agree': ok_decl, 'outside_agree': ok_out, 'malformed_agree': ok_malf,
                'declared_count': len(got['declared']), 'outside_count': len(got['outside']),
                'malformed_count': len(got['malformed']),
            }
            if not ok_decl:
                rec[label]['declared_extra'] = sorted(set(got['declared']) - set(exp['declared']))[:5]
                rec[label]['declared_missing'] = sorted(set(exp['declared']) - set(got['declared']))[:5]
            if not ok_out:
                rec[label]['outside_extra'] = got['outside'][:5]
                rec[label]['outside_expected_first'] = exp['outside'][:5]
            if not ok_malf:
                rec[label]['malformed_extra'] = got['malformed'][:5]
                rec[label]['malformed_expected_first'] = exp['malformed'][:5]
        records.append(rec)

    summary = {'tools': {label: {'agree': 0, 'disagree': 0, 'setup_error': 0,
                                 'declared_disagree': 0, 'outside_disagree': 0,
                                 'malformed_disagree': 0} for label, _ in tools},
               'files': len(files), 'census_outside_impl_disagree': 0,
               'setup_errors': 0}
    for r in records:
        if 'setup_error' in r:
            summary['setup_errors'] += 1
            for label, _ in tools:
                summary['tools'][label]['setup_error'] += 1
            continue
        if not r.get('census_outside_matches_impl', True):
            summary['census_outside_impl_disagree'] += 1
        for label, _ in tools:
            t = summary['tools'][label]
            d = r.get(label, {'agree': False})
            if d.get('agree'):
                t['agree'] += 1
            else:
                t['disagree'] += 1
                if not d.get('declared_agree', False):
                    t['declared_disagree'] += 1
                if not d.get('outside_agree', False):
                    t['outside_disagree'] += 1
                if not d.get('malformed_agree', False):
                    t['malformed_disagree'] += 1
    out = {'summary': summary, 'records': records}
    with open(a.out, 'w', encoding='utf-8') as fh:
        json.dump(out, fh, indent=1, sort_keys=True)
    print(json.dumps(summary, indent=1, sort_keys=True))

def shutil_which(name):
    from shutil import which
    p = which(name)
    if not p:
        raise SystemExit(f'{name} not found')
    return p

if __name__ == '__main__':
    main()
