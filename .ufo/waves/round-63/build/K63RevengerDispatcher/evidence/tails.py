import json, os, glob, collections, time
R = os.path.expanduser('~/.omp/agent/sessions/-Projects-shokunin')
S2 = os.path.join(R, '2026-10-25T16-43-09-760Z_01a173f1-d040-72cd-9542-6011673d5d9b')

def rows(name):
    p = os.path.join(S2, name + '.jsonl')
    out = []
    for line in open(p, errors='replace'):
        try: out.append(json.loads(line))
        except: pass
    return out

def tail(name, n=4):
    rs = rows(name)
    print(f'--- {name}: rows={len(rs)}')
    for o in rs[-n:]:
        t = o.get('type')
        if t == 'message':
            m = o['message']; c = m.get('content')
            if isinstance(c, list):
                kinds = [(x.get('type'), x.get('name') or x.get('toolName')) for x in c]
            else:
                kinds = 'str'
            print('   ', t, m.get('role'), kinds, str(c)[:150].replace('\n',' '))
        else:
            print('   ', t, o.get('customType'), json.dumps(o.get('data'))[:160])

for n in ['ExecRows01', 'KaidokuR35', 'CritC1Cheat', 'MadoR39', 'TabiR28', 'KengakuR33', 'K63RevengerDispatcher']:
    if os.path.exists(os.path.join(S2, n + '.jsonl')):
        tail(n)
        print('    mtime', time.strftime('%H:%M:%S', time.localtime(os.path.getmtime(os.path.join(S2, n + '.jsonl')))))

# parent/id analysis for two waves
def wave_info(dispatch_path):
    d = json.load(open(dispatch_path))
    names = [t['name'] for t in d['taskCall']['tasks']]
    parents = collections.Counter(); ids = collections.Counter(); found = 0
    missing = []
    for n in names:
        p = os.path.join(S2, n + '.jsonl')
        if not os.path.exists(p):
            missing.append(n); continue
        found += 1
        first = None
        for line in open(p, errors='replace'):
            try: o = json.loads(line)
            except: continue
            if o.get('type') == 'session': first = o; break
        parents[first.get('parentSession')] += 1
        ids[first.get('id')] += 1
    print(f'  {dispatch_path}: tasks={len(names)} found={found} missing={missing[:5]}')
    print('  parents:', dict(parents))
    print('  duplicate ids:', [k for k, v in ids.items() if v > 1])

wave_info('/home/vgpnk/Projects/shokunin/tameshi-shokunin/.ufo/waves/round-45/w1-dispatch.json')
wave_info('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/w1-dispatch.json')
wave_info('/home/vgpnk/Projects/shokunin/kengaku-shokunin/.ufo/waves/round-35/build-dispatch.json')
