import re, os, glob, json, collections
root='/home/vgpnk/Projects/shokunin/.ufo/reports'
strict=re.compile(r'github\.com|upstream|\bpin(ned|s)?\b', re.I)
rows=[]
for p in sorted(glob.glob(root+'/round-*/*.md')):
    lane=os.path.basename(p)[:-3]
    rnd=int(re.search(r'round-(\d+)/',p).group(1))
    txt=open(p,encoding='utf-8',errors='replace').read()
    for m in re.finditer(r'`([^`\n]+)`', txt):
        tok=m.group(1).strip()
        if not re.fullmatch(r'[0-9a-f]{40}',tok): continue
        s=max(0,m.start()-100); e=min(len(txt),m.end()+100)
        around=txt[s:e].replace('\n',' ')
        if strict.search(around):
            rows.append(dict(lane=lane,round=rnd,tok=tok,around=around,
                             github='github.com' in around.lower(),
                             upstream='upstream' in around.lower(),
                             pin=bool(re.search(r'\bpin(ned|s)?\b',around,re.I))))
json.dump(rows, open('/fast/scratch/hyaku/kumitate-r94/K94Connector/report_pin_hits.json','w'), indent=1)
print('strict hits:',len(rows))
by=collections.Counter((r['lane'],r['round']) for r in rows)
print('files:',len(by),'lanes:',len({l for l,_ in by}))
print('lanes:',sorted({l for l,_ in by}))
print('github-context hits:',sum(r['github'] for r in rows),'upstream:',sum(r['upstream'] for r in rows),'pin-word:',sum(r['pin'] for r in rows))
for (l,n),c in sorted(by.items()):
    if l=='kumitate': print(f'  KUMITATE r{n}: {c}')
print('--- sample 25 ---')
for r in rows[:25]:
    print(f"[{r['lane']} r{r['round']}] {r['tok'][:16]} :: {r['around'][:200]}")
