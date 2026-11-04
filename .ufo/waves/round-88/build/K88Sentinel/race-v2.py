#!/usr/bin/env python3
"""race-v2.py — K88Sentinel: TOCTOU races against receipt-bind v2 (lstat -> readFileSync / lstat(dir) -> readdir).
usage: race-v2.py <TOOL> <LANE> <SCRATCH> <N> <OUT receipt dir>   (env CMDTOOL= cmd= token 2, TREV= receipt rev=)
Three races, each a swapper process flipping a path while the tool is run N times:
  grow     r.txt flips (atomic rename) between a small CLEAN receipt and a 2 MiB receipt with a WRONG digest.
           no race: CLEAN or RECEIPT_TOO_LARGE.  DRIFT == the >1 MiB file was lstat'ed small and read big.
  symfile  r.txt flips between a regular receipt with a WRONG digest and a symlink to a CLEAN receipt.
           no race: DRIFT or SYMLINK_RECEIPT.   CLEAN == lstat saw a regular file, read followed a symlink.
  symdir   --dir flips between a real dir (WRONG digest) and a symlink to a CLEAN dir (non-atomic: rename aside + in).
           no race: DRIFT, SYMLINK_DIR or DIR_UNREADABLE.  CLEAN == lstat saw a dir, readdir/read followed the link.
"""
import collections, hashlib, multiprocessing, os, re, shutil, subprocess, sys

TOOL, LANE, S, N, OUT = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), sys.argv[5]
multiprocessing = multiprocessing.get_context('fork')
REV = subprocess.check_output(['git', '-C', LANE, 'rev-parse', 'HEAD'], text=True).strip()
blob = lambda p: subprocess.check_output(['git', '-C', LANE, 'cat-file', 'blob', f'{REV}:{p}'])
SHA = hashlib.sha256(blob('scripts/proxy-check.mjs')).hexdigest()
TSHA = hashlib.sha256(open(TOOL, 'rb').read()).hexdigest()
CMDTOOL = os.environ.get('CMDTOOL', TOOL)
TREV = os.environ.get('TREV', REV)
BAD = '0' * 64
R = os.path.join(S, 'work', 'race'); shutil.rmtree(R, ignore_errors=True); os.makedirs(R)

def body(digest, pad=0):
    b = f'rev={REV}\ntool_sha256={digest}\ncmd=node scripts/proxy-check.mjs\n'.encode()
    return b + (b'pad=' + b'A' * pad + b'\n' if pad else b'')

def w(p, data):
    with open(p, 'wb') as f: f.write(data)

def swap_grow(d, stop):
    small, big, tgt = os.path.join(d, 's.tmp'), os.path.join(d, 'b.tmp'), os.path.join(d, 'r.txt')
    sb, bb = body(SHA), body(BAD, 2 * 1024 * 1024)
    while not stop.is_set():
        w(small, sb); os.rename(small, tgt)
        w(big, bb); os.rename(big, tgt)

def swap_symfile(d, stop):
    tgt, reg, lnk = os.path.join(d, 'r.txt'), os.path.join(d, 'reg.tmp'), os.path.join(d, 'lnk.tmp')
    clean = os.path.join(R, 'clean-target.dat'); rb = body(BAD)
    while not stop.is_set():
        w(reg, rb); os.rename(reg, tgt)
        try: os.unlink(lnk)
        except FileNotFoundError: pass
        os.symlink(clean, lnk); os.rename(lnk, tgt)

def swap_symdir(d, stop):
    # d is the PATH that flips; realdir holds a WRONG-digest receipt, cleandir a CLEAN one
    realdir, aside, lnk = os.path.join(R, 'realdir'), os.path.join(R, 'aside'), os.path.join(R, 'lnk')
    cleandir = os.path.join(R, 'cleandir')
    while not stop.is_set():
        try:
            os.rename(realdir, d)            # d: real dir
            os.rename(d, realdir)
            try: os.unlink(lnk)
            except FileNotFoundError: pass
            os.symlink(cleandir, lnk); os.rename(lnk, d)   # d: symlink
            os.unlink(d)
        except OSError:
            pass

def run(name, swapper, d, dirarg):
    stop = multiprocessing.Event()
    p = multiprocessing.Process(target=swapper, args=(d, stop)); p.start()
    tally = collections.Counter(); examples = {}
    try:
        for _ in range(N):
            r = subprocess.run(['node', TOOL, '--dir', dirarg, '--rev', REV, '--lane', LANE],
                               capture_output=True, text=True)
            line = (r.stdout.strip().splitlines() or [''])[0]
            m = re.match(r'RECEIPT_BIND: (CLEAN|DRIFT|FAIL-CLOSED \S+)', line)
            k = f'{m.group(1) if m else "OTHER"} exit={r.returncode}'
            tally[k] += 1; examples.setdefault(k, line[:200])
    finally:
        stop.set(); p.join()
    lines = [f'rev={TREV}', f'tool_sha256={TSHA}', f'cmd=node {CMDTOOL} --dir {dirarg} --rev {REV} --lane {LANE}',
             f'exec: node {TOOL} (bytes sha256={TSHA})',
             f'case: race {name}; the command above was run N={N} times while a swapper process flipped the subject (see race-v2.py docstring)']
    for k, v in sorted(tally.items()):
        lines.append(f'tally {k} count={v} example: {examples[k]}')
    # exit= is the race driver's own status (0 = all N runs completed); per-run exits are in the tally lines
    lines += ['exit=0', 'signal=none']
    w(os.path.join(OUT, f'race-{name}.txt'), ('\n'.join(lines) + '\n').encode())
    print(name, dict(tally))

os.makedirs(OUT, exist_ok=True)
w(os.path.join(R, 'clean-target.dat'), body(SHA))
g = os.path.join(R, 'grow'); os.makedirs(g); w(os.path.join(g, 'r.txt'), body(SHA))
run('grow', swap_grow, g, g)
sf = os.path.join(R, 'symfile'); os.makedirs(sf); w(os.path.join(sf, 'r.txt'), body(BAD))
run('symfile', swap_symfile, sf, sf)
os.makedirs(os.path.join(R, 'realdir')); w(os.path.join(R, 'realdir', 'r.txt'), body(BAD))
os.makedirs(os.path.join(R, 'cleandir')); w(os.path.join(R, 'cleandir', 'r.txt'), body(SHA))
sd = os.path.join(R, 'flipdir')
run('symdir', swap_symdir, sd, sd)
