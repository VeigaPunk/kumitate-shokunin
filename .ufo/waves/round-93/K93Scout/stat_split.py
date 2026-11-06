import json, os, collections, random
ROOT=os.path.expanduser("~/.omp/agent/sessions/-Projects-shokunin")
random.seed(20261106)
files=[os.path.join(dp,f) for dp,dn,fn in os.walk(ROOT) for f in fn if f.endswith(".jsonl")]
random.shuffle(files)
stat=collections.Counter(); pair=collections.Counter(); att=collections.Counter()
for p in files[:3000]:
    try:
        with open(p,"rb") as fh:
            for raw in fh:
                l=raw.strip()
                if not l: continue
                try: o=json.loads(l)
                except Exception: continue
                if not isinstance(o,dict) or o.get("type")!="message": continue
                m=o.get("message")
                if not isinstance(m,dict) or m.get("role")!="assistant": continue
                rr=m.get("retryRecovery")
                if not isinstance(rr,dict): continue
                s=rr.get("status"); stat[repr(s)]+=1
                sb=rr.get("supersededBy")
                pair[(repr(s), "sb_obj" if isinstance(sb,dict) else "sb_"+type(sb).__name__)]+=1
                att[repr(rr.get("attempt"))]+=1
    except OSError: pass
print("status=%s"%dict(stat))
print("status_x_supersededBy=%s"%dict(pair))
print("attempt=%s"%dict(sorted(att.items())))
