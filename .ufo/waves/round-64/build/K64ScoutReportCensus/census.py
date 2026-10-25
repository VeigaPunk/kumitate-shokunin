import subprocess,re,os,hashlib
F='/home/vgpnk/Projects/shokunin'
W=F+'/kumitate-shokunin/.ufo/waves'
def sh(*a):
    return subprocess.run(a,capture_output=True,cwd=F).stdout
TAL=re.compile(rb'[A-Z][A-Z0-9]*_(?:HELD|UNMET)[ ]+held=[0-9]+/[0-9]+')
TOK=re.compile(rb'__[A-Z][A-Z0-9_]*__|LANE_HASH|TBD')
SH=re.compile(rb'(?m)^## SHONEN')
def blobinfo(c,p):
    b=sh('git','show',f'{c}:{p}')
    return b
def rec(b):
    return dict(bytes=len(b),shonen=len(SH.findall(b)),tokens=len(TOK.findall(b)),tallies=[t.decode() for t in TAL.findall(b)],sha=hashlib.sha256(b).hexdigest()[:10])
def receipts(n):
    out=[];
    for d in ('base','close'):
        r=f'{W}/round-{n}/{d}'
        if os.path.isdir(r):
            for root,_,fs in os.walk(r):
                for f in fs:
                    out.append(os.path.join(root,f))
    return out
rows=[];flags=[]
hdr='round\tncommits\tfirst_commit\tfirst_bytes\tfirst_shonen\tfirst_tokens\tfirst_tallies\tlast_commit\tlast_bytes\tlast_shonen\tlast_tokens\tlast_tallies\tfirst_last_differ\tlast_vs_prestray_differ\treceipt_files\tunmatched_last_tallies\tunmatched_first_tallies'
rows.append(hdr)
for n in range(30,64):
    p=f'.ufo/reports/round-{n}/kumitate.md'
    cs=sh('git','log','--format=%h',' --',p) if False else sh('git','log','--format=%h','--',p)
    cs=cs.decode().split()
    if not cs: continue
    # real chronological: oldest last
    stray={'35b91714'}
    alive=[c for c in cs if c not in stray]
    first=alive[-1]; last=alive[0]
    # pre-stray last: newest commit older than 35b91714 and not f47ad6ba
    pre=[c for c in alive if c!='f47ad6ba']
    prelast=pre[0] if pre else None
    fb=blobinfo(first,p); lb=blobinfo(last,p)
    pb=blobinfo(prelast,p) if prelast else b''
    fi,li=rec(fb),rec(lb)
    rc=receipts(n)
    txt=b''.join(open(f,'rb').read() for f in rc)
    def unm(tl): return [t for t in tl if t.encode() not in txt]
    ul=unm(li['tallies']); uf=unm(fi['tallies'])
    rows.append('\t'.join(map(str,[n,len(cs),first,fi['bytes'],fi['shonen'],fi['tokens'],';'.join(fi['tallies']) or '-',last,li['bytes'],li['shonen'],li['tokens'],';'.join(li['tallies']) or '-','yes' if fb!=lb else 'no','yes' if pb!=lb else 'no',len(rc),';'.join(ul) or '-',';'.join(uf) or '-'])))
    if li['tallies'] and ul: flags.append((n,len(rc),ul,li['tallies']))
open(W+'/round-64/build/K64ScoutReportCensus/census.tsv','w').write('\n'.join(rows)+'\n')
print('\n'.join(rows))
print()
for f in flags: print('FLAG',f)
