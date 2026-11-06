import json, os, collections
ROOT=os.path.expanduser("~/.omp/agent/sessions/-Projects-shokunin")
c=collections.Counter(); roles=collections.Counter(); flags=collections.Counter(); ups=collections.Counter()
def rows(p):
    out=[]
    try:
        with open(p,"rb") as fh:
            for raw in fh:
                l=raw.strip()
                if not l: continue
                try: o=json.loads(l)
                except Exception: continue
                if isinstance(o,dict): out.append(o)
    except OSError: pass
    return out
for dp,dn,fn in os.walk(ROOT):
    for f in fn:
        if not f.endswith(".jsonl"): continue
        for r in rows(os.path.join(dp,f)):
            if r.get("type")=="model_change":
                c["mc_rows"]+=1
                role=r.get("role"); roles[repr(role)]+=1
                fl=r.get("resolvedModelIsFallback")
                if fl is True: flags["true"]+=1
                elif fl is False: flags["false"]+=1
                elif fl is None: flags["absent"]+=1
                else: flags["other:"+type(fl).__name__]+=1
                if role=="fallback":
                    c["role_fallback"]+=1
                    flags["fallback_true" if fl is True else "fallback_false" if fl is False else "fallback_absent"]+=1
                if role!="fallback" and fl is True:
                    c["true_but_not_fallback_role"]+=1
            if r.get("type")=="message":
                m=r.get("message")
                if isinstance(m,dict) and m.get("role")=="assistant":
                    up=m.get("upstreamProvider")
                    if isinstance(up,str) and up: ups[up]+=1
                    if "upstreamProvider" in m:
                        c["turns_with_upstreamProvider_key"]+=1
                        if m.get("stopReason") not in ("stop","toolUse","length"): c["upstream_on_nonserved"]+=1
print("model_change_rows=%d role_fallback=%d true_but_not_fallback_role=%d"%(c["mc_rows"],c["role_fallback"],c["true_but_not_fallback_role"]))
print("resolvedModelIsFallback=%s"%dict(flags))
print("distinct_upstreamProvider=%s"%dict(ups.most_common(20)))
print("turns_with_upstreamProvider_key=%d upstream_on_nonserved=%d"%(c["turns_with_upstreamProvider_key"],c["upstream_on_nonserved"]))
