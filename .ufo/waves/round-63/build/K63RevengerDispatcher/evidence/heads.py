import json, os, sys, collections

ROOT = os.path.expanduser('~/.omp/agent/sessions/-Projects-shokunin')
S2 = '2026-10-25T16-43-09-760Z_01a173f1-d040-72cd-9542-6011673d5d9b'
P = os.path.join(ROOT, S2)

def types_and_last(fn):
    types = collections.Counter()
    last = None
    first_user = None
    sess = None
    with open(fn, errors='replace') as f:
        for line in f:
            try:
                o = json.loads(line)
            except Exception:
                types['<unparseable>'] += 1
                continue
            t = o.get('type')
            types[t] += 1
            if t == 'session' and sess is None:
                sess = o
            m = o.get('message')
            if isinstance(m, dict) and m.get('role') == 'user' and first_user is None:
                first_user = m
            last = o
    return types, last, first_user, sess

for name in ['ExecRows01', 'ExecRows01-2', 'ExecRows01-3', 'KumitateR63', 'K63RevengerDispatcher', 'SoujiR26', 'KaidokuR35', 'TameshiR45']:
    fn = os.path.join(P, name + '.jsonl')
    if not os.path.exists(fn):
        print(name, 'MISSING'); continue
    types, last, fu, sess = types_and_last(fn)
    print(f'=== {name}')
    print('  session.id=', (sess or {}).get('id'), 'ts=', (sess or {}).get('timestamp'), 'cwd=', (sess or {}).get('cwd'))
    print('  parentSession=', (sess or {}).get('parentSession'))
    print('  version=', (sess or {}).get('version'))
    print('  types=', dict(types))
    print('  LAST type=', (last or {}).get('type'), 'keys=', sorted((last or {}).keys()))
    print('  LAST=', json.dumps(last)[:500])
    if fu:
        c = fu.get('content')
        s = json.dumps(c) if not isinstance(c, str) else c
        print('  FIRST_USER len=', len(s), 'head=', repr(s[:200]))
    else:
        print('  FIRST_USER none')
