import json, os, collections
ROOT=os.path.expanduser("~/.omp/agent/sessions/-Projects-shokunin")
c=collections.Counter(); ex=[]
for dp,dn,fn in os.walk(ROOT):
    for f in fn:
        if not f.endswith(".jsonl"): continue
        try:
            with open(os.path.join(dp,f),"rb") as fh:
                for raw in fh:
                    l=raw.strip()
                    if not l: continue
                    try: o=json.loads(l)
                    except Exception: continue
                    if not isinstance(o,dict) or o.get("type")!="session_init": continue
                    rf=o.get("retryFallback")
                    if isinstance(rf,dict):
                        c["rf_dict"]+=1
                        c["has_primary:"+str(isinstance(rf.get("primary"),str))]+=1
                        rm=o.get("resolvedModel")
                        if isinstance(rf.get("primary"),str) and isinstance(rm,str):
                            if rf["primary"]==rm: c["primary_eq_resolved"]+=1
                            else:
                                c["primary_ne_resolved"]+=1
                                if len(ex)<6: ex.append((os.path.join(dp,f), rm, rf.get("primary")))
                    else:
                        c["rf_other"]+=1
                    break
        except OSError: pass
print(dict(c))
for e in ex: print("EX", e)
