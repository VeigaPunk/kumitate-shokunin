import json, pathlib, sys
S = pathlib.Path('/fast/scratch/hyaku/kumitate-r99/K99ExecHarm')
SEAT = pathlib.Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-99/K99ExecHarm')
tools = sys.argv[1] if len(sys.argv) > 1 else 'tools-ctlpositive'
label = sys.argv[2] if len(sys.argv) > 2 else 'candidate(ctl-positive=R99)'
revs = (S/'revs.txt').read_text().split()
lines, same, differ = [], 0, 0
for rev in revs:
    fb, fc = S/'hist'/f'{rev}.tools-base.json', S/'hist'/f'{rev}.{tools}.json'
    try:
        b, c = json.loads(fb.read_text()), json.loads(fc.read_text())
    except Exception as e:
        lines.append(f'{rev} PARSE_ERR {e}'); differ += 1; continue
    if b == c:
        lines.append(f'{rev} same -'); same += 1; continue
    differ += 1
    bf, cf = b.get('findings', []), c.get('findings', [])
    note = None
    for i in range(max(len(bf), len(cf))):
        x = bf[i] if i < len(bf) else None
        y = cf[i] if i < len(cf) else None
        if x != y:
            def fmt(f):
                if f is None: return '(absent)'
                return f"{f.get('kind')}@{f.get('path')}:{f.get('line')} {f.get('detail','')[:80]}"
            note = f'finding[{i}] BASE={fmt(x)} CAND={fmt(y)}'
            break
    if note is None:
        for k in ('verdict', 'exitCode', 'totals', 'counts', 'info'):
            if b.get(k) != c.get(k):
                note = f'field {k}: BASE={json.dumps(b.get(k))[:120]} CAND={json.dumps(c.get(k))[:120]}'
                break
    lines.append(f'{rev} differ {note or "json differs"}')
header = f'# history.txt — BASE vs {label} sources-check --json --today 2026-11-07 over {len(revs)} committed corpus/SOURCES.md revisions\n# same={same} differ={differ}\n'
(SEAT/'history.txt').write_text(header + '\n'.join(lines) + '\n')
print(header.strip()); print('\n'.join(l for l in lines if ' differ ' in l or 'PARSE' in l) or 'no differs')
