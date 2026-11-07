#!/usr/bin/env python3
import json, os, re, subprocess
from collections import Counter
S='/fast/scratch/hyaku/kumitate-r99/K99CriticB'
LANE=os.path.join(S,'counters','nothing'); F=os.path.join(LANE,'fixA','corpus','SOURCES.md')
CENSUS='/home/vgpnk/Projects/shokunin/scripts/sources-census.sh'
BASE=os.path.join(S,'tool-base','scripts','sources-check.mjs'); R99=os.path.join(S,'tool','scripts','sources-check.mjs')
TODAY='2026-11-07'; env=dict(os.environ,LANG='C.UTF-8',LC_ALL='C.UTF-8',TMPDIR=os.path.join(S,'tmp'))
JS_SET=set('\t\n\x0b\x0c\r \u00a0\u1680'+''.join(chr(c) for c in range(0x2000,0x200b))+'\u2028\u2029\u202f\u205f\u3000\ufeff')
def js(s):
    i,j=0,len(s)
    while i<j and s[i] in JS_SET: i+=1
    while j>i and s[j-1] in JS_SET: j-=1
    return s[i:j]
def bl(s): return s.strip(' \t')
text=open(F,'rb').read().decode('utf-8'); src=re.split(r'\r?\n',text)
rows=[]
for i,l in enumerate(src):
    l2=re.sub(r'^ {1,3}(?=\S)','',l)
    if l2.startswith('|'): rows.append((i+1,l2.split('|')))
def run(p):
    return json.loads(subprocess.run(['node',p,'--self',os.path.join(LANE,'fixA'),'--today',TODAY,'--json'],capture_output=True,text=True,env=env).stdout)
b=run(BASE); r=run(R99)
rc=subprocess.run(['bash',CENSUS,'validate','--file',F,'--today',TODAY],capture_output=True,text=True,env=env).stdout
cen=[l.split('\t') for l in rc.split('\n') if l.strip()]
e02=[p[2] for p in cen if len(p)>2 and p[1]=='E02']
def ids(j,kind):
    out=[]
    for x in j['findings']:
        if x['kind']==kind and x.get('path')=='corpus/SOURCES.md':
            m=re.search(r'id=(.*)$', x['detail'], re.S); out.append((x['line'], m.group(1)))
    return out
bid=ids(b,'ID_FORM'); rid=ids(r,'ID_FORM')
print('census E02', len(e02), 'BASE ID_FORM', len(bid), 'R99 ID_FORM', len(rid))
print('R99 ID_FORM ids == census E02 ids (multiset):', Counter(x[1] for x in rid)==Counter(e02))
bc=Counter(re.search(r'S\d{3,}',i).group(0) for _,i in bid if re.search(r'S\d{3,}',i))
ec=Counter(re.search(r'S\d{3,}',i).group(0) for i in e02 if re.search(r'S\d{3,}',i))
print('BASE cores', sum(bc.values()), 'census cores', sum(ec.values()), 'cores only in census', sum((ec-bc).values()), 'cores only in BASE', sum((bc-ec).values()))
# rows behind the 40 extra census-only cores: classify the id cell
rowmap={ln:cells for ln,cells in rows}
extra=[]
for (ln,(l,cells)) in [(x[0],(x[0],rowmap[x[0]])) for x in [] ]: pass
for ln,cells in rows:
    idb=bl(cells[1] or ''); idj=js(cells[1] or '')
    okb=bool(re.fullmatch(r'S\d{3,}',idb)); okj=bool(re.fullmatch(r'S\d{3,}',idj))
    if not okb and okj:
        extra.append((ln, idb, idj, cells[1]))
print('rows whose id is invalid under blank but valid under JS:', len(extra))
print('sample:', [(ln, idb.encode('unicode_escape').decode('ascii'), idj, raw.encode('unicode_escape').decode('ascii')) for ln,idb,idj,raw in extra[:5]])
# duplicate / malformed / enum attribution
def kinds(j): return Counter(x['kind'] for x in j['findings'] if x.get('path')=='corpus/SOURCES.md')
print('BASE kinds', dict(kinds(b)))
print('R99  kinds', dict(kinds(r)))
print('census codes', {c: sum(1 for p in cen if len(p)>2 and p[1]==c) for c in ('E01','E02','E03','E05','E06','E07','E08','E09')})
# check that every row differing in duplicate status has a non-blank pad on the second copy
alias=[]
for ln,cells in rows:
    idb=bl(cells[1] or ''); idj=js(cells[1] or '')
    if idb!=idj: alias.append((ln,idb,idj))
print('rows with id string changed by trim class:', len(alias), 'of which valid-under-JS:', sum(1 for _,idb,idj in alias if re.fullmatch(r'S\d{3,}',idj)))
