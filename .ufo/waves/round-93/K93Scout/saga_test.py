import json, os, collections
ROOT=os.path.expanduser("~/.omp/agent/sessions/-Projects-shokunin")
c=collections.Counter(); bad=[]
for dp,dn,fn in os.walk(ROOT):
    for f in fn:
        if not f.endswith(".jsonl"): continue
        seq=[]
        try:
            with open(os.path.join(dp,f),"rb") as fh:
                for raw in fh:
                    l=raw.strip()
                    if not l: continue
                    try: o=json.loads(l)
                    except Exception: continue
                    if not isinstance(o,dict) or o.get("type")!="message": continue
                    m=o.get("message")
                    if not isinstance(m,dict) or m.get("role")!="assistant": continue
                    if m.get("stopReason")!="error": continue
                    rr=m.get("retryRecovery")
                    seq.append((rr.get("attempt") if isinstance(rr,dict) else None,
                                rr.get("status") if isinstance(rr,dict) else None))
        except OSError: continue
        if not seq: continue
        # group into maximal runs where attempt is 1,2,3,... strictly increasing from 1
        runs=[]; cur=[]
        for a,s in seq:
            if a==1 or (cur and a is not None and a==cur[-1][0]+1):
                cur.append((a,s))
            else:
                if cur: runs.append(cur)
                cur=[(a,s)]
        if cur: runs.append(cur)
        for r in runs:
            c["runs"]+=1
            atts=[a for a,_ in r]
            if any(a is None for a in atts): c["runs_with_none_attempt"]+=1
            if len(set(atts))!=len(atts):
                c["runs_with_dup_attempt"]+=1
                if len(bad)<6: bad.append((os.path.join(dp,f), r))
            if atts and atts[0]!=1: c["runs_not_starting_at_1"]+=1
            # statuses within a run
            sts=collections.Counter(s for _,s in r)
            c["run_status_shape:"+",".join(sorted("%s=%d"%(k,v) for k,v in sts.items()))]+=1
print(dict(c))
for b in bad: print("DUPATT", b)
