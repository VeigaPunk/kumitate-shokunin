import json, os, glob, re, collections
R = os.path.expanduser('~/.omp/agent/sessions/-Projects-shokunin')
S2 = os.path.join(R, '2026-10-25T16-43-09-760Z_01a173f1-d040-72cd-9542-6011673d5d9b')
S1 = os.path.join(R, '2026-10-25T06-15-52-413Z_01a171b3-835d-7667-b875-b75970c45a2a')
F = '/home/vgpnk/Projects/shokunin'

# index all jsonl stems -> paths (depth 3) across both sessions
idx = collections.defaultdict(list)
for base in (S2, S1):
    for root, dirs, files in os.walk(base):
        depth = root[len(base):].count(os.sep)
        if depth >= 3: dirs[:] = []
        for f in files:
            if f.endswith('.jsonl'):
                idx[f[:-6]].append(os.path.join(root, f))

def first_user(p):
    for line in open(p, errors='replace'):
        try: o = json.loads(line)
        except: continue
        m = o.get('message') or {}
        if m.get('role') == 'user':
            c = m.get('content')
            return '\n'.join(x.get('text','') for x in c if x.get('type')=='text') if isinstance(c,list) else c
    return ''

rows = []
for disp in sorted(glob.glob(f'{F}/*-shokunin/.ufo/waves/round-*/*-dispatch.json')):
    lane = disp.split('/')[4].replace('-shokunin','')
    rnd = re.search(r'round-(\d+)', disp).group(1)
    wave = os.path.basename(disp)[:-len('-dispatch.json')]
    try: d = json.load(open(disp))
    except: continue
    tc = d.get('taskCall') or {}
    tasks = tc.get('tasks') or []
    ctx = (tc.get('context') or '').strip()[:200]
    names = [t['name'] for t in tasks]
    if not names: continue
    bare = sum(1 for n in names if n in idx)
    nested = sum(1 for n in names if any(os.path.basename(p).startswith(os.path.basename(p).split('.')[0] + '.' + n + '.') for p in idx.get(n, [])) or any(
        os.path.basename(p) == f'{n}.jsonl' for p in []))
    # nested detection: any stem ending with '.'+name
    nest = sum(1 for n in names if any(s.endswith('.' + n) for s in idx))
    n0 = names[0]
    sample = None
    for p in idx.get(n0, []):
        sample = p; break
    if sample is None:
        for s, paths in idx.items():
            if s.endswith('.' + n0):
                sample = paths[0]; break
    seat_hdr = ctxin = None
    if sample:
        u = first_user(sample)
        seat_hdr = f'# Seat {n0}\n' in u
        ctxin = bool(ctx) and ctx in u
    rows.append((lane, rnd, wave, len(names), bare, nest, seat_hdr, ctxin))

print(f'{"lane":10} {"rnd":4} {"wave":22} {"seats":5} {"bare":4} {"nested":6} {"seatHdr":7} {"ctxIn":5}')
for r in rows:
    print(f'{r[0]:10} {r[1]:4} {r[2]:22} {r[3]:5} {r[4]:4} {r[5]:6} {str(r[6]):7} {str(r[7]):5}')
