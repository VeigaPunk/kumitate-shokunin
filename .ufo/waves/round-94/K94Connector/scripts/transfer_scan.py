import re, os, glob, json, subprocess, collections
FLEET='/home/vgpnk/Projects/shokunin'
MAIN=FLEET
ORIGIN='/home/vgpnk/Projects/ufo-fsd-alpha'
REPORTS=FLEET+'/.ufo/reports'
LANES=sorted({p.split('/')[5] for p in glob.glob(FLEET+'/*/corpus/SOURCES.md')})
MAP={l.replace('-shokunin',''):l for l in LANES}
MAP.update({l:l for l in LANES})
def lane_repo(l): return f'{FLEET}/{l}'
def cit_tokens(text):
    out=set()
    for m in re.finditer(r'`([^`\n]+)`',text):
        for part in re.split(r'\.\.\.?',m.group(1)):
            t=part.strip()
            if re.fullmatch(r'[0-9a-f]{7,40}',t): out.add(t)
    return out
# gather tokens per lane
lane_tokens=collections.defaultdict(set); lane_reports=collections.defaultdict(list)
for p in sorted(glob.glob(REPORTS+'/round-*/*.md')):
    lang=os.path.basename(p)[:-3]; rnd=int(re.search(r'round-(\d+)/',p).group(1))
    lang=MAP.get(lang,lang)
    if lang not in LANES: continue
    txt=open(p,encoding='utf-8',errors='replace').read()
    toks=cit_tokens(txt)
    lane_tokens[lang]|=toks
    lane_reports[lang].append((rnd,p,toks))
alltok=sorted(set().union(*lane_tokens.values()))
print('lanes with reports:',len(lane_tokens),'unique tokens:',len(alltok))
def resolved_commits(repo,tokens):
    if not tokens: return set()
    inp='\n'.join(t+'^{commit}' for t in tokens)+'\n'
    r=subprocess.run(['git','-C',repo,'cat-file','--batch-check=%(objectname) %(objecttype)'],input=inp,capture_output=True,text=True)
    out=set()
    for line,t in zip(r.stdout.splitlines(),tokens):
        if line.endswith(' commit') and ' missing' not in line: out.add(t)
    return out
res={}
for repo in LANES+['__main__','__origin__']:
    d=lane_repo(repo) if repo not in ('__main__','__origin__') else (MAIN if repo=='__main__' else ORIGIN)
    print('probe',repo,'exists',os.path.isdir(d))
    res[repo]=resolved_commits(d,alltok)
print('resolved counts', {k:len(v) for k,v in list(res.items())[:3]}, 'main',len(res['__main__']),'origin',len(res['__origin__']))
# registry pin segments per lane
reg={}
for l in LANES:
    segs=set(); rej=set()
    for line in open(f'{FLEET}/{l}/corpus/SOURCES.md',encoding='utf-8',errors='replace'):
        if not re.match(r'^ {0,3}\|\s*S\d{3,}\s*\|',line): continue
        cells=[c.strip() for c in line.strip().strip('|').split('|')]
        status=(cells[7] if len(cells)>=8 else '')
        for um in re.finditer(r'https?://[^\s|)]+',line):
            for s in re.split(r'[/?#]',um.group(0)):
                if re.fullmatch(r'[0-9a-fA-F]{40}',s):
                    if status.lower().startswith('rejected'): rej.add(s)
                    else: segs.add(s.lower())
    reg[l]=(segs,rej)
summary={}; flip_rows=[]
for l in LANES:
    unresolved=set()
    for t in lane_tokens.get(l,()):
        if t in res[l] or t in res['__main__'] or t in res['__origin__']: continue
        unresolved.add(t)
    segs,rej=reg[l]
    declared={t for t in unresolved if any(s.startswith(t) for s in segs)}
    rejected_only={t for t in unresolved if t not in declared and any(s.startswith(t) for s in rej)}
    for rnd,p,toks in lane_reports.get(l,[]):
        d=[t for t in toks if t in declared]
        if d: flip_rows.append((l,rnd,p,sorted(d)))
    summary[l]=dict(tokens=len(lane_tokens.get(l,())),unresolved=len(unresolved),
                    declared=len(declared),rejected_only=len(rejected_only),
                    pinned_segments=len(segs),rejected_segments=len(rej),
                    reports=len(lane_reports.get(l,[])))
json.dump(dict(summary=summary,flips=[(a,b,c,d) for a,b,c,d in flip_rows]),
          open('/fast/scratch/hyaku/kumitate-r94/K94Connector/transfer.json','w'),indent=1)
print(f"{'lane':22s} {'toks':>5s} {'unres':>5s} {'decl':>5s} {'rejOnly':>7s} {'seg':>5s} {'rej':>4s} {'reports':>7s}")
for l,v in summary.items():
    print(f"{l:22s} {v['tokens']:5d} {v['unresolved']:5d} {v['declared']:5d} {v['rejected_only']:7d} {v['pinned_segments']:5d} {v['rejected_segments']:4d} {v['reports']:7d}")
print('\nreports that would gain a declared token:',len(flip_rows))
for l,rnd,p,d in flip_rows[:40]: print(f'  {l} r{rnd}: {d[:4]}')
