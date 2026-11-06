import json, os, collections
ROOT=os.path.expanduser("~/.omp/agent/sessions/-Projects-shokunin")
c=collections.Counter(); ex=[]
for dp,dn,fn in os.walk(ROOT):
    for f in fn:
        if not f.endswith(".jsonl"): continue
        mc=[]
        try:
            with open(os.path.join(dp,f),"rb") as fh:
                for raw in fh:
                    l=raw.strip()
                    if not l: continue
                    try: o=json.loads(l)
                    except Exception: continue
                    if not isinstance(o,dict) or o.get("type")!="model_change": continue
                    mc.append((o.get("role"), o.get("resolvedModelIsFallback"), o.get("model")))
        except OSError: continue
        # walk: track last non-fallback model (the "primary" in effect)
        last_primary=None; last_fb_true_model=None
        for role,fl,m in mc:
            if role=="fallback":
                if fl is True:
                    c["fb_true"]+=1
                    last_fb_true_model=m
                else:
                    c["fb_not_true"]+=1
                    if last_fb_true_model is not None and last_primary is not None:
                        if m==last_primary: c["revert_matches_pre_fallback_primary"]+=1
                        else:
                            c["fb_not_true_differs_from_pre_primary"]+=1
                            if len(ex)<8: ex.append((os.path.join(dp,f), "pre="+repr(last_primary), "fbtrue="+repr(last_fb_true_model), "row="+repr(m)))
            else:
                last_primary=m
print(dict(c))
for e in ex: print("DIFF", e)
