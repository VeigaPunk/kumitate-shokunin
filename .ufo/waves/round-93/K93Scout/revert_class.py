import json, os, collections
ROOT=os.path.expanduser("~/.omp/agent/sessions/-Projects-shokunin")
c=collections.Counter(); ex=[]
for dp,dn,fn in os.walk(ROOT):
    for f in fn:
        if not f.endswith(".jsonl"): continue
        models=[]; seen_fb_true=False
        try:
            with open(os.path.join(dp,f),"rb") as fh:
                for raw in fh:
                    l=raw.strip()
                    if not l: continue
                    try: o=json.loads(l)
                    except Exception: continue
                    if not isinstance(o,dict) or o.get("type")!="model_change": continue
                    role=o.get("role"); fl=o.get("resolvedModelIsFallback"); m=o.get("model")
                    if role=="fallback":
                        if fl is True:
                            seen_fb_true=True; c["fb_true"]+=1
                        else:
                            c["fb_not_true"]+=1
                            # is the model one already seen earlier in this file? => revert-to-primary
                            if m in models: c["fb_not_true_model_seen_earlier"]+=1
                            else:
                                c["fb_not_true_model_new"]+=1
                                if len(ex)<8: ex.append((os.path.join(dp,f), m, models[:4]))
                    models.append(m)
        except OSError: continue
print(dict(c))
for e in ex: print("NEWMODEL", e)
