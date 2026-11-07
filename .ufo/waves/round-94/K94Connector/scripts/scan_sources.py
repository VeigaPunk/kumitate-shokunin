import re, glob, os, json, collections
pins={}; rowcount={}
for p in sorted(glob.glob('/home/vgpnk/Projects/shokunin/*/corpus/SOURCES.md')):
    lane=p.split("/")[5]
    txt=open(p,encoding='utf-8',errors='replace').read().splitlines()
    n=0; rows=0; samples=[]
    for i,line in enumerate(txt,1):
        m=re.match(r'^ {0,3}\|\s*S\d{3,}\s*\|', line)
        if not m: continue
        rows+=1
        cells=[c.strip() for c in line.strip().strip('|').split('|')]
        status=cells[7] if len(cells)>=8 else ''
        if status.lower().startswith('rejected'): continue
        for um in re.finditer(r'https?://[^\s|)]+', line):
            url=um.group(0)
            segs=re.split(r'[/?#]', url)
            if any(re.fullmatch(r'[0-9a-fA-F]{40}',s) for s in segs):
                n+=1
                if len(samples)<3: samples.append((i,url[:110],status))
    pins[lane]=n; rowcount[lane]=rows
    print(f'{lane}: rows={rows} commit-pinned-urls(non-rejected)={n}')
print('TOTAL pinned rows:', sum(pins.values()), 'lanes with pins:', sum(1 for v in pins.values() if v))
json.dump({'pins':pins,'rows':rowcount}, open('/fast/scratch/hyaku/kumitate-r94/K94Connector/sources_pins.json','w'), indent=1)
