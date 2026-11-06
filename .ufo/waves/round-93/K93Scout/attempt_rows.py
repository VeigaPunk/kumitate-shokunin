import json, os, collections
ROOT=os.path.expanduser("~/.omp/agent/sessions/-Projects-shokunin")
c=collections.Counter(); dup=[]
for dp,dn,fn in os.walk(ROOT):
    for f in fn:
        if not f.endswith(".jsonl"): continue
        seen=collections.Counter(); nrr=0; nerr=0; byattempt=collections.Counter()
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
                    nerr+=1
                    rr=m.get("retryRecovery")
                    if isinstance(rr,dict):
                        nrr+=1
                        a=rr.get("attempt")
                        byattempt[a]+=1
        except OSError: continue
        if nrr:
            c["files_with_rr"]+=1
            c["rr_rows"]+=nrr
            c["distinct_attempt_slots"]+=len(byattempt)
            dups=[k for k,v in byattempt.items() if v>1]
            if dups:
                c["files_with_dup_attempt"]+=1
                c["dup_attempt_rows"]+=sum(byattempt[k]-1 for k in dups)
                if len(dup)<5: dup.append((os.path.join(dp,f), dict(byattempt)))
            if nrr!=len(byattempt):
                c["files_rr_rows_ne_distinct_attempts"]+=1
print(dict(c))
for d in dup: print("DUP", d)
