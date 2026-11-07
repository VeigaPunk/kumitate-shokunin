#!/usr/bin/env python3
"""h99diff.py — K99CriticC independent differential H99 (round 99 claim C1).

Compares a sources-check candidate's `--json` finding set against the live fleet census
(scripts/sources-census.sh) on the fixtures made by h99gen.py.  Mapped codes:

  ID_FORM<->E02  ID_DUPLICATE<->E03  ROW_MALFORMED<->E01\\E02  KIND_ENUM<->E05
  TIER_ENUM<->E06  STATUS_ENUM<->E07  OPENED_INVALID<->E08  RECHECK_INVALID<->E09
  ROW_OUTSIDE_REGISTRY<->E12

Usage:
  h99diff.py --manifest M.json --tools label=path [--tools ...] --out DIR
             [--census /home/vgpnk/Projects/shokunin/scripts/sources-census.sh]
             [--today 2026-11-07] [--jobs 6] [--scratch DIR]
Writes DIR/results-<label>.json, DIR/summary.json and prints a summary.
"""
import argparse, json, os, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

MAPPED = {
    'ID_FORM': 'E02', 'ID_DUPLICATE': 'E03', 'ROW_MALFORMED': 'E01',
    'KIND_ENUM': 'E05', 'TIER_ENUM': 'E06', 'STATUS_ENUM': 'E07',
    'OPENED_INVALID': 'E08', 'RECHECK_INVALID': 'E09', 'ROW_OUTSIDE_REGISTRY': 'E12',
}
MARK = {'E01': ' fields=', 'E03': ' duplicate id', 'E05': ' kind=', 'E06': ' tier=',
        'E07': ' status=', 'E08': ' opened=', 'E09': ' recheck=',
        'E12': ' row outside Registry section'}
IDVAL = re.compile(r'^id=(.*?)(?: (?:kind|tier|status|opened|recheck)=| split-fields='
                   r'| row outside Registry section|$)', re.S)
VALID_ID = re.compile(r'^S[0-9]{3,}$')  # ASCII digits: JS \d and census [0-9] are ASCII here
KIND_ENUM = {'spec', 'docs', 'paper', 'code', 'tool', 'dataset', 'talk', 'book', 'community', 'own-work'}
TIERS = {'A', 'B', 'C'}
STATUSES = {'queued', 'mined', 'rejected'}


def wrap_argv(argv, timeout):
    return argv, timeout


def run(argv, env, timeout=90):
    try:
        r = subprocess.run(argv, capture_output=True, env=env, timeout=timeout)
        return {'status': r.returncode, 'stdout': r.stdout.decode('utf-8', 'surrogateescape'),
                'stderr': r.stderr.decode('utf-8', 'surrogateescape')}
    except subprocess.TimeoutExpired:
        return {'status': None, 'stdout': '', 'stderr': 'TIMEOUT'}


def census_lines(res):
    return [l for l in res['stdout'].split('\n') if l != '']


def parse_census_validate(lines):
    """-> list of {code, id} for the eight mapped validate codes (E11/E04/W* dropped)."""
    out = []
    for line in lines:
        parts = line.split('\t')
        if len(parts) < 3:
            continue
        code, rest = parts[1], '\t'.join(parts[2:])
        if code not in MARK and code != 'E02':
            continue
        if code == 'E02':
            out.append({'code': code, 'id': rest})
            continue
        i = rest.find(MARK[code])
        if i < 0:
            out.append({'code': code, 'id': rest, 'unparsed': True})
            continue
        out.append({'code': code, 'id': rest[:i]})
    return out


def parse_census_counts(lines):
    counts = {'rows': 0, 'tiers': {}, 'status': {}}
    for line in lines:
        p = line.split('\t')
        if len(p) != 3:
            continue
        metric, val = p[1], p[2]
        try:
            n = int(val)
        except ValueError:
            continue
        if metric == 'rows':
            counts['rows'] = n
        elif metric.startswith('tier.'):
            counts['tiers'][metric[5:]] = n
        elif metric.startswith('status.'):
            counts['status'][metric[7:]] = n
    return counts


def parse_tool_json(stdout):
    try:
        j = json.loads(stdout)
    except Exception:
        return None
    found = {'by_line': {}, 'other': []}
    for f in j.get('findings', []) or []:
        kind = f.get('kind')
        if f.get('path') != 'corpus/SOURCES.md' or kind not in MAPPED:
            continue
        m = IDVAL.match(f.get('detail', ''))
        rec = {'kind': kind, 'id': m.group(1) if m else None, 'detail': f.get('detail', '')}
        line = f.get('line')
        if isinstance(line, int):
            found['by_line'].setdefault(line, []).append(rec)
        else:
            found['other'].append(rec)
    return {'findings': found, 'counts': j.get('counts'), 'exitCode': j.get('exitCode'),
            'verdict': j.get('verdict'), 'raw': j}


def _registry_effective(fx):
    """Whole-CRLF puts a \\r on the `## Registry` heading: neither reader recognizes the section."""
    return bool(fx['registry']) and not bool(fx['crlf'])


def expected_candidate_counts(fx):
    """sources-check semantics: only rows whose blank-trimmed id is valid are counted; the tier and
    status reads are the *field positions* 4/8 of the split row (index 3/7 of the literal cell list)."""
    tiers = {'A': 0, 'B': 0, 'C': 0}
    status = {'queued': 0, 'mined': 0, 'rejected': 0}
    if not _registry_effective(fx):
        return {'rows': 0, 'tiers': tiers, 'status': status}
    n_valid = 0
    for r in fx['rows']:
        if not VALID_ID.match(r['census_id']):
            continue
        n_valid += 1
        vals = r['cells']
        tier = vals[3].strip(' \t')
        st = vals[7].strip(' \t')
        if tier in TIERS:
            tiers[tier] += 1
        if st in STATUSES:
            status[st] += 1
    return {'rows': n_valid, 'tiers': tiers, 'status': status}


def expected_census_counts(fx):
    """Census semantics: every non-separator row inside Registry is counted and histogrammed, whatever
    its id; outside Registry (no section, or a whole-CRLF heading) nothing is counted."""
    tiers = {'A': 0, 'B': 0, 'C': 0}
    status = {'queued': 0, 'mined': 0, 'rejected': 0}
    if not _registry_effective(fx):
        return {'rows': 0, 'tiers': tiers, 'status': status}
    for r in fx['rows']:
        tier = r['cells'][3].strip(' \t')
        st = r['cells'][7].strip(' \t')
        if tier in TIERS:
            tiers[tier] += 1
        if st in STATUSES:
            status[st] += 1
    return {'rows': len(fx['rows']), 'tiers': tiers, 'status': status}


def compare_fixture(fx, census_validate, census_counts, tool_json):
    """Return per-row checks + counts checks for one tool."""
    codes = parse_census_validate(census_validate)
    row_lines = fx['row_lines']
    rows = fx['rows']
    nrows = len(rows)
    # attribute census codes to rows
    per_row = [{'E01': 0, 'E02': [], 'E03': 0, 'E05': 0, 'E06': 0, 'E07': 0,
                'E08': 0, 'E09': 0, 'E12': []} for _ in range(nrows)]
    problems = []
    for item in codes:
        code, cid = item['code'], item['id']
        if nrows == 1:
            idx = 0
        elif code == 'E03':
            idx = _dup_row(rows, cid)
        else:
            hits = [i for i, r in enumerate(rows) if r['census_id'] == cid]
            if len(hits) != 1:
                problems.append(f'census {code} id={cid!r} attributes to {len(hits)} rows')
                continue
            idx = hits[0]
        if idx is None:
            problems.append(f'census {code} id={cid!r} unattributable')
            continue
        if code == 'E02':
            per_row[idx]['E02'].append(cid)
        elif code == 'E12':
            per_row[idx]['E12'].append(cid)
        else:
            per_row[idx][code] = per_row[idx][code] + 1
    # tool findings per row
    got = [{'ID_FORM': [], 'ID_DUPLICATE': 0, 'ROW_MALFORMED': 0, 'KIND_ENUM': 0, 'TIER_ENUM': 0,
            'STATUS_ENUM': 0, 'OPENED_INVALID': 0, 'RECHECK_INVALID': 0,
            'ROW_OUTSIDE_REGISTRY': []} for _ in range(nrows)]
    line_to_idx = {ln: i for i, ln in enumerate(row_lines)}
    if tool_json is None:
        problems.append('tool json unparsable')
    else:
        for line, recs in tool_json['findings']['by_line'].items():
            idx = line_to_idx.get(line)
            if idx is None:
                problems.append(f'tool finding on non-row line {line}: {[r["kind"] for r in recs]}')
                continue
            for rec in recs:
                k = rec['kind']
                if k in ('ID_FORM', 'ROW_OUTSIDE_REGISTRY'):
                    got[idx][k].append(rec['id'])
                else:
                    got[idx][k] = got[idx][k] + 1
        for rec in tool_json['findings']['other']:
            problems.append(f'tool {rec["kind"]} without line')
    checks = []
    for i in range(nrows):
        c, g = per_row[i], got[i]
        ck = {
            'id_form': sorted(x for x in g['ID_FORM'] if x is not None) == sorted(c['E02']),
            'id_duplicate': (g['ID_DUPLICATE'] > 0) == (c['E03'] > 0),
            'row_malformed': (g['ROW_MALFORMED'] > 0) == (c['E01'] > 0 and not c['E02']),
            'kind_enum': (g['KIND_ENUM'] > 0) == (c['E05'] > 0),
            'tier_enum': (g['TIER_ENUM'] > 0) == (c['E06'] > 0),
            'status_enum': (g['STATUS_ENUM'] > 0) == (c['E07'] > 0),
            'opened_invalid': (g['OPENED_INVALID'] > 0) == (c['E08'] > 0),
            'recheck_invalid': (g['RECHECK_INVALID'] > 0) == (c['E09'] > 0),
            'row_outside': sorted(x for x in g['ROW_OUTSIDE_REGISTRY'] if x is not None) == sorted(c['E12']),
        }
        checks.append({
            'line': row_lines[i], 'checks': ck, 'ok': all(ck.values()),
            'census': c, 'tool': g,
        })
    # counts arm: three independent statements
    #  (i) the census's own counters, (ii) the plan's rows - #E02 invariant, (iii) the candidate's counters
    exp = expected_candidate_counts(fx)
    cexp = expected_census_counts(fx)
    cc = census_counts
    n_e02 = sum(len(p['E02']) for p in per_row)
    tj_counts = (tool_json or {}).get('counts') or {}
    counts_checks = {
        'census_rows': cc['rows'] == cexp['rows'],
        'census_tiers': {k: cc['tiers'].get(k, 0) for k in ('A', 'B', 'C')} == cexp['tiers'],
        'census_status': {k: cc['status'].get(k, 0) for k in ('queued', 'mined', 'rejected')} == cexp['status'],
        'rows_minus_e02': cc['rows'] - n_e02 == exp['rows'],
        'tool_rows': tj_counts.get('rows') == exp['rows'],
        'tool_tiers': (tj_counts.get('tiers') or {}) == exp['tiers'],
        'tool_status': (tj_counts.get('status') or {}) == exp['status'],
    }
    return {'rows': checks, 'counts': counts_checks, 'exp_counts': exp,
            'census_counts': cc, 'problems': problems, 'n_e02': n_e02}


def _dup_row(rows, cid):
    hits = [i for i, r in enumerate(rows) if r['census_id'] == cid]
    if len(hits) >= 2:
        return hits[-1]
    return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--manifest', required=True)
    ap.add_argument('--tools', action='append', required=True, help='label=path')
    ap.add_argument('--out', required=True)
    ap.add_argument('--census', default='/home/vgpnk/Projects/shokunin/scripts/sources-census.sh')
    ap.add_argument('--today', default='2026-11-07')
    ap.add_argument('--jobs', type=int, default=6)
    ap.add_argument('--scratch', required=True)
    ap.add_argument('--emptyroot', required=True)
    a = ap.parse_args()
    man = json.loads(Path(a.manifest).read_text())
    fixtures = man['fixtures']
    out = Path(a.out)
    out.mkdir(parents=True, exist_ok=True)
    tools = []
    for spec in a.tools:
        label, path = spec.split('=', 1)
        tools.append((label, path))
    tmp = Path(a.scratch) / 'tmp'
    tmp.mkdir(parents=True, exist_ok=True)
    cenv = {'PATH': os.environ['PATH'], 'HOME': os.environ['HOME'], 'LANG': 'C.UTF-8',
            'LC_ALL': 'C.UTF-8', 'TZ': 'UTC'}
    tenv = dict(cenv, TMPDIR=str(tmp), SHOKUNIN_ROOT=a.emptyroot)

    def one(fx):
        f = str(Path(fx['dir']) / 'corpus' / 'SOURCES.md')
        rec = {'name': fx['name'], 'excluded': fx['excluded'], 'note': fx['note'],
               'census_validate': run(['bash', a.census, 'validate', '--file', f,
                                       '--today', a.today], cenv),
               'census_census': run(['bash', a.census, 'census', '--file', f,
                                     '--today', a.today], cenv),
               'tools': {}}
        for label, path in tools:
            rec['tools'][label] = run(['node', path, '--self', fx['dir'],
                                       '--today', a.today, '--json'], tenv)
        rec['census_validate_lines'] = census_lines(rec['census_validate'])
        rec['census_census_lines'] = census_lines(rec['census_census'])
        rec['census_counts'] = parse_census_counts(rec['census_census_lines'])
        rec['census_codes'] = parse_census_validate(rec['census_validate_lines'])
        for label, _ in tools:
            tj = parse_tool_json(rec['tools'][label]['stdout'])
            rec['tools'][label]['parsed'] = tj is not None
            rec['tools'][label]['json'] = tj is not None
            rec['tools'][label]['cmp'] = compare_fixture(fx, rec['census_validate_lines'],
                                                         rec['census_counts'], tj)
        return rec

    results = []
    with ThreadPoolExecutor(max_workers=a.jobs) as ex:
        for i, rec in enumerate(ex.map(one, fixtures)):
            results.append(rec)
            if (i + 1) % 100 == 0:
                print(f'  ... {i + 1}/{len(fixtures)}', file=sys.stderr)
    by_name = {r['name']: r for r in results}
    Path(out / 'results.json').write_text(json.dumps(
        {'seed': man['seed'], 'tools': [t[0] for t in tools], 'results': results}, ensure_ascii=False))
    # summary
    summary = {'seed': man['seed'], 'fixtures': len(results),
               'excluded_fixtures': sum(1 for r in results if r['excluded']),
               'tools': {}, 'excluded_observations': []}
    for label, path in tools:
        scored = [r for r in results if not r['excluded']]
        rows = [c for r in scored for c in r['tools'][label]['cmp']['rows']]
        bad = [(r['name'], c) for r in scored for c in r['tools'][label]['cmp']['rows'] if not c['ok']]
        counts_bad = [(r['name'], {k: v for k, v in r['tools'][label]['cmp']['counts'].items() if not v})
                      for r in scored if not all(r['tools'][label]['cmp']['counts'].values())]
        problems = [(r['name'], p) for r in scored for p in r['tools'][label]['cmp']['problems']]
        per_kind = {k: {'rows': 0, 'agree': 0} for k in
                    ('id_form', 'id_duplicate', 'row_malformed', 'kind_enum', 'tier_enum',
                     'status_enum', 'opened_invalid', 'recheck_invalid', 'row_outside')}
        for r in scored:
            for c in r['tools'][label]['cmp']['rows']:
                for k, v in c['checks'].items():
                    per_kind[k]['rows'] += 1
                    per_kind[k]['agree'] += 1 if v else 0
        summary['tools'][label] = {
            'path': path,
            'scored_fixtures': len(scored), 'scored_rows': len(rows),
            'row_agreements': len(rows) - len(bad), 'row_disagreements': len(bad),
            'counts_fixtures': len(scored), 'counts_clean': len(scored) - len(counts_bad),
            'counts_bad': len(counts_bad),
            'problems': len(problems),
            'per_kind': per_kind,
            'disagreements': [{'fixture': n, **c} for n, c in bad[:200]],
            'counts_disagreements': [{'fixture': n, 'failed': f} for n, f in counts_bad[:100]],
            'harness_problems': [{'fixture': n, 'problem': p} for n, p in problems[:50]],
        }
    # excluded fixtures: show observed candidate/base outcome vs census codes
    for r in results:
        if not r['excluded']:
            continue
        obs = {'fixture': r['name'], 'reason': r['excluded'],
               'census_codes': r['census_codes'], 'tools': {}}
        for label, _ in tools:
            cmp = r['tools'][label]['cmp']
            kinds = set()
            for c in cmp['rows']:
                for k, v in c['tool'].items():
                    if (isinstance(v, list) and v) or (isinstance(v, int) and v > 0):
                        kinds.add(k)
            obs['tools'][label] = {'ok': all(c['ok'] for c in cmp['rows']),
                                   'kinds': sorted(kinds)}
            if not cmp['rows']:
                obs['tools'][label]['ok'] = None
                obs['tools'][label]['kinds'] = ['<no rows>']
        summary['excluded_observations'].append(obs)
    Path(out / 'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=1))
    print(json.dumps({k: v for k, v in summary.items()
                      if k not in ('excluded_observations',)}, ensure_ascii=False, indent=1)[:6000])
    print(f'FIXTURES={summary["fixtures"]} EXCLUDED={summary["excluded_fixtures"]}')
    for label in summary['tools']:
        t = summary['tools'][label]
        print(f'{label}: rows={t["scored_rows"]} agree={t["row_agreements"]} '
              f'disagree={t["row_disagreements"]} counts_bad={t["counts_bad"]} problems={t["problems"]}')
    print(f'seed={summary["seed"]}')


if __name__ == '__main__':
    main()
