import json, os, collections
ROOT=os.path.expanduser("~/.omp/agent/sessions/-Projects-shokunin")
c=collections.Counter(); bystop=collections.Counter(); stat=collections.Counter()
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
            if r.get("type")!="message": continue
            m=r.get("message")
            if not isinstance(m,dict) or m.get("role")!="assistant": continue
            sr=m.get("stopReason")
            if sr=="error": c["error_turns"]+=1
            rr=m.get("retryRecovery")
            if isinstance(rr,dict):
                c["rr_dict_turns"]+=1
                bystop[sr]+=1
                st=rr.get("status"); stat[repr(st)]+=1
                sb=rr.get("supersededBy")
                if isinstance(sb,dict):
                    c["rr_with_supersededBy"]+=1
                    if st!="recovered": c["supersededBy_but_status_not_recovered"]+=1
                    if not isinstance(sb.get("provider"),str) or not sb.get("provider"): c["sb_bad_provider"]+=1
                    if not isinstance(sb.get("model"),str) or not sb.get("model"): c["sb_bad_model"]+=1
                else:
                    if st=="recovered": c["recovered_without_supersededBy"]+=1
            elif rr is not None:
                c["rr_nondict"]+=1
                bystop[sr]+=0
print("error_turns=%d rr_dict_turns=%d rr_with_supersededBy=%d recovered_without_supersededBy=%d supersededBy_but_status_not_recovered=%d rr_nondict=%d sb_bad_provider=%d sb_bad_model=%d"%(c["error_turns"],c["rr_dict_turns"],c["rr_with_supersededBy"],c["recovered_without_supersededBy"],c["supersededBy_but_status_not_recovered"],c["rr_nondict"],c["sb_bad_provider"],c["sb_bad_model"]))
print("retryRecovery_by_stopReason=%s"%dict(bystop))
print("retryRecovery_status=%s"%dict(stat))
