#!/usr/bin/env python3
"""K88Scout receipt census (read-only). Usage: python3 census.py <lane> <rev>
Scope: every committed *.txt under .ufo/waves/round-N/{close,controls,build}/ at <rev> (recursive).
Fields are counted with the v2 instrument's own rule: ^key=(.*)$ multiline (scripts/receipt-bind.mjs:250)."""
import collections, os, re, subprocess, sys

lane, rev = sys.argv[1], sys.argv[2]
ls = subprocess.check_output(['git', '-C', lane, 'ls-tree', '-r', '-l', rev, '--', '.ufo/waves'], text=True).splitlines()
rows = []
for ln in ls:
    meta, path = ln.split('\t', 1)
    mode, _typ, oid, size = meta.split()
    if re.match(r'\.ufo/waves/round-\d+/(close|controls|build)/', path) and path.endswith('.txt'):
        rows.append((path, oid, int(size) if size != '-' else 0, mode))
cat = subprocess.Popen(['git', '-C', lane, 'cat-file', '--batch'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
def blob(oid):
    cat.stdin.write((oid + '\n').encode()); cat.stdin.flush()
    n = int(cat.stdout.readline().split()[2]); d = cat.stdout.read(n); cat.stdout.read(1); return d
sec = collections.Counter(re.match(r'\.ufo/waves/round-\d+/(\w+)/', p).group(1) for p, *_ in rows)
print(f'scope rev={rev} receipts={len(rows)} ' + ' '.join(f'{k}={v}' for k, v in sorted(sec.items())))
big, dup, dotdot, escapes, links = [], [], [], [], []
tok = collections.Counter()
for path, oid, size, mode in rows:
    if mode == '120000': links.append(path)
    if size > 1048576: big.append((path, size))
    t = blob(oid).decode('utf8', 'replace')
    for k in ('cmd', 'rev', 'tool_sha256'):
        n = len(re.findall(rf'^{k}=(.*)$', t, re.M))
        if n > 1: dup.append((path, k, n))
    for c in re.findall(r'^cmd=(.*)$', t, re.M):
        ts = c.split()
        if len(ts) < 2: tok['lt2'] += 1; continue
        x = ts[1]
        if x.startswith('../'): dotdot.append((path, x))
        if x.startswith('/'): tok['abs-in-lane' if x.startswith(lane + '/') else 'abs-external'] += 1
        elif x.startswith('-'): tok['flag'] += 1
        else:
            tok['relative'] += 1
            r = os.path.normpath(os.path.join(lane, x))
            if not (r + '/').startswith(lane + '/'): escapes.append((path, x))
print(f'cmd_token2 ' + ' '.join(f'{k}={v}' for k, v in sorted(tok.items())))
print(f'relative_dotdot={len(dotdot)} relative_escapes_lane={len(escapes)}')
for p, x in dotdot + escapes: print(f'  escape {p} {x}')
print(f'duplicate_field_receipts={len({p for p, _, _ in dup})} rows={len(dup)}')
for p, k, n in dup: print(f'  dup {p} {k}= x{n}')
print(f'oversize_gt_1MiB={len(big)}')
for p, s in big: print(f'  big {p} {s}')
print(f'symlink_receipts={len(links)}')
for p in links: print(f'  link {p}')
for s in ('close', 'controls', 'build'):
    print(f'section {s}: dup={len({p for p, _, _ in dup if f"/{s}/" in p})} big={sum(1 for p, _ in big if f"/{s}/" in p)} escapes={sum(1 for p, _ in dotdot + escapes if f"/{s}/" in p)}')
