import json, os
paths=[]
for line in open("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/probe/sampleA.tsv"):
    parts=line.rstrip("\n").split("\t")
    if len(parts)>=2: paths.append(parts[1])
def rows(p):
    out=[]
    with open(p,"rb") as fh:
        for raw in fh:
            l=raw.strip()
            if not l: continue
            try: o=json.loads(l)
            except Exception: continue
            if isinstance(o,dict): out.append(o)
    return out
def sig(r):
    rf=r.get("retryFallback")
    ch=tuple(rf.get("chain")) if isinstance(rf,dict) and isinstance(rf.get("chain"),list) else None
    return (r.get("resolvedModel"), ch)
n=0; diff=0; multi=0; anom=0
for p in paths:
    if not os.path.exists(p):
        print("MISSING", p); continue
    n+=1
    inits=[r for r in rows(p) if r.get("type")=="session_init"]
    if len(inits)>1:
        multi+=1
        if sig(inits[0])!=sig(inits[-1]):
            diff+=1; print("DIFF", p, len(inits), sig(inits[0]), sig(inits[-1]))
    for i,r in enumerate(inits):
        rf=r.get("retryFallback")
        if not isinstance(r.get("resolvedModel"),str) or not isinstance(rf,dict):
            anom+=1; print("ANOM", p, "idx",i,"of",len(inits), "rm",type(r.get("resolvedModel")).__name__, "rf",type(rf).__name__)
print("A files=%d multi_init=%d first_last_diff=%d anomalous_init_rows=%d"%(n,multi,diff,anom))
