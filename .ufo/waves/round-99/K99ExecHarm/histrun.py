import json, subprocess, sys, pathlib, time
S = pathlib.Path('/fast/scratch/hyaku/kumitate-r99/K99ExecHarm')
tools = sys.argv[1]            # e.g. tools-base / tools-cand / tools-ctlpositive
revs = (S/'revs.txt').read_text().split()
script = S/tools/'sources-check.mjs'
t0 = time.time()
for i, rev in enumerate(revs):
    d = S/'hist'/rev
    out = S/'hist'/f'{rev}.{tools}.json'
    if out.exists():
        continue
    r = subprocess.run(['node', str(script), '--self', str(d), '--today', '2026-11-07', '--json'],
                       capture_output=True, text=True, timeout=120)
    out.write_text(r.stdout)
    if r.returncode not in (0, 1, 2):
        print('UNEXPECTED_RC', rev, r.returncode, r.stderr[:200], flush=True)
    if (i+1) % 20 == 0:
        print(f'{i+1}/{len(revs)} {time.time()-t0:.1f}s', flush=True)
print('DONE', tools, len(revs), f'{time.time()-t0:.1f}s')
