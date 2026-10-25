import os, re, sys, hashlib
B = sys.argv[1]
TIERS = [
  re.compile(r'SELFTEST[^:]*:\s*PASS\s*\(\d+/\d+\)'),        # LABEL_SELFTEST: PASS (n/n)
  re.compile(r'SELFTEST:\s*\d+/\d+'),                        # LABEL_SELFTEST: n/n pass
  re.compile(r'^\d+/\d+ cases passed'),                       # cite-check / surface-probe
  re.compile(r'VERDICT:\s*PASS\s*\(\d+ cases\)'),             # omp-census
  re.compile(r'SELFTEST:\s*PASS\b'),                          # counter-rerun (no count)
]
def tally(path):
    lines = [l.rstrip('\n') for l in open(path, encoding='utf-8', errors='replace')]
    for pat in TIERS:
        hits = [l for l in lines if pat.search(l)]
        if hits: return hits[-1]
    return '<no tally line>'
rows = []
for tag, sub, idxname in (('base','transcripts','index-base.tsv'), ('frozen-tip','transcripts-frozen','index-frozen.tsv')):
    idx = {}
    for line in open(os.path.join(B, idxname), encoding='utf-8'):
        s, rc, ms = line.rstrip('\n').split('\t'); idx[s] = (rc, ms)
    d = os.path.join(B, sub)
    for f in sorted(os.listdir(d)):
        if not f.endswith('.txt'): continue
        path = os.path.join(d, f); script = f[:-4]
        rc, ms = idx.get(script, ('?','?'))
        rows.append((tag, script, rc, ms, tally(path),
                     hashlib.sha256(open(path,'rb').read()).hexdigest(),
                     os.path.relpath(path, B)))
print('rev\tscript\texit\tms\ttally_line\tsha256\tpath')
for r in rows: print('\t'.join(r))
