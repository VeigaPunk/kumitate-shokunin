import os, sys, json, pathlib, shutil, subprocess, hashlib, re, shlex, concurrent.futures
S=pathlib.Path('/fast/scratch/hyaku/kumitate-r76/K76SentinelBoundary'); L=S/'lane'; F=S/'fixtures'; F.mkdir()
REV='cabc7aefd5f1562299f757e23207710c12e4ed58'
records=[]
def run(label,expected,args,cwd=L,watch=None):
    print('EXPECTED '+label+': '+expected,flush=True)
    def snapshot():
        if not watch:return {}
        return {str(p.relative_to(watch)):(hashlib.sha256(p.read_bytes()).hexdigest(),p.stat().st_mtime_ns) for p in watch.rglob('*') if p.is_file() and not p.is_symlink()}
    before=snapshot()
    try:
        p=subprocess.run(args,cwd=cwd,capture_output=True,text=True,timeout=20)
        item=dict(probe=label,expected=expected,command=shlex.join(map(str,args)),cwd=str(cwd),exit=p.returncode,stdout=p.stdout,stderr=p.stderr,changed=[k for k in set(before)|set(snapshot()) if before.get(k)!=snapshot().get(k)])
    except subprocess.TimeoutExpired as e:
        item=dict(probe=label,expected=expected,command=shlex.join(map(str,args)),cwd=str(cwd),exit='TIMEOUT',stdout=str(e.stdout),stderr=str(e.stderr),changed=[])
    records.append(item);print('ACTUAL '+label+': '+json.dumps(item),flush=True)
    return item
note=L/'corpus/knowledge/omp-agent-root.md'
text=(L/'scripts/omp-census.mjs').read_text()
base=text.split('const BASE_MEMBERS = [',1)[1].split('\n];',1)[0]
chain=text.split('const CHAIN_FAMILIES = [',1)[1].split('\n];',1)[0]
names=re.findall(r"name: '([^']+)'",base)+re.findall(r"id: '([^']+)'",chain)
print('REVISION '+REV+' uid='+str(os.getuid())+' node='+subprocess.check_output(['node','--version'],text=True).strip()+' declared_names='+str(len(names)),flush=True)
roots={}
roots['file']=F/'root-file';roots['file'].write_text('sentinel')
roots['empty']=F/'root-empty';roots['empty'].mkdir()
clean=F/'root-clean';clean.mkdir();(clean/'RULES.md').write_text('MEMBER_CONTENT_MUST_NOT_BE_READ');(clean/'RULES.md').chmod(0o644)
roots['symlink']=F/'root-link';roots['symlink'].symlink_to(clean,target_is_directory=True)
roots['newline-backslash']=F/'root-odd';roots['newline-backslash'].mkdir();(roots['newline-backslash']/'odd\nback\\slash').write_text('sentinel')
roots['unreadable']=F/'root-unreadable';roots['unreadable'].mkdir();roots['unreadable'].chmod(0)
rootexpect={'file':'exit 2 OMP_ROOT_NOT_A_DIR','symlink':'exit 2 OMP_ROOT_NOT_A_DIR (census lstat rejects symlink root)','newline-backslash':'exit 1 finding(s), never coverage_omp=10','unreadable':'exit 2 OMP_ROOT_NOT_A_DIR/EACCES as own non-root user','empty':'exit 1 EMPTY; coverage_omp=0, never 10'}
# Separate tasks run concurrently; each expectation is emitted before its child starts.
def c1root(pair):
    name,root=pair
    run('proxy-root-'+name,rootexpect[name]+'; frozen parser expected exit 64 unknown argument', ['node',str(L/'scripts/proxy-check.mjs'),'--omp-root',str(root),'--json'])
    ce={'file':'exit 2 OMP_CENSUS: ERROR reason=ENOTDIR','symlink':'exit 2 OMP_CENSUS: ERROR reason=ENOTDIR','newline-backslash':'exit 1 UNLISTED; no member content reads','unreadable':'exit 2 OMP_CENSUS: ERROR reason=EACCES','empty':'exit 1 EMPTY root holds no member'}[name]
    run('census-root-'+name,ce,['node',str(L/'scripts/omp-census.mjs'),'--root',str(root),'--self',str(L)])
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:list(pool.map(c1root,roots.items()))
roots['unreadable'].chmod(0o755)
# FIFO ensures an accidental member-content open would block; subprocess timeout catches it.
fifo=F/'root-fifo';fifo.mkdir();os.mkfifo(fifo/'agent.db',0o600)
run('census-member-fifo','exit 1 KIND agent.db want=file got=other; returns promptly without FIFO read',['node',str(L/'scripts/omp-census.mjs'),'--root',str(fifo),'--self',str(L)])
notefx=[]
for variant in ['removed','empty','comment','fence']:
    d=F/('self-'+variant);(d/'corpus/knowledge').mkdir(parents=True);(d/'corpus/lessons').mkdir()
    for rel in ['SCORECARD.md','SKILL.md','corpus/README.md']:
        shutil.copy2(L/rel,d/rel)
    (d/'corpus/lessons/sentinel.md').write_text('sentinel fixture')
    n=d/'corpus/knowledge/omp-agent-root.md'
    if variant!='removed':n.write_text({'empty':'','comment':'<!-- '+ '\n'.join(names)+' -->','fence':'```\n'+'\n'.join(names)+'\n```\n'}[variant])
    notefx.append((variant,d))
kimi=F/'kimi';kimi.mkdir()
def c1note(pair):
    variant,d=pair
    expected={'removed':'exit 2 NOTE_MISSING','empty':'exit 1 NOTE_UNBOUND for all declared names','comment':'exit 1 NOTE_UNBOUND for all declared names','fence':'exit 0 CLEAN bound=35/35 (visible fenced tokens bind)'}[variant]
    run('census-note-'+variant,expected,['node',str(L/'scripts/omp-census.mjs'),'--self',str(d),'--root',str(clean)])
    run('proxy-note-'+variant,'frozen proxy has no O arm: no OMP_NOTE_MISSING and no coverage_omp term; other existing drift may remain',['node',str(L/'scripts/proxy-check.mjs'),'--self',str(d),'--src',str(L),'--kimi-root',str(kimi),'--json'])
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(c1note,notefx))
# Small independent fixtures, never full-lane mirrors. Exact frozen script path does not exist.
c2=[]
for variant in ['dotdot','absolute','symlink','trailing-space','directory','readonly-pin','v1-pin','duplicate-row','scope-disguise']:
    d=F/('adopt-'+variant);(d/'corpus/lessons').mkdir(parents=True);(d/'.ufo/pins').mkdir(parents=True)
    for rel in ['corpus/README.md','.ufo/pins/readme-map.json','corpus/lessons/round-75-verifier-spotcheck.md']:
        shutil.copy2(L/rel,d/rel)
    (d/'corpus/lessons/neighbor.md').write_text('NOT A SPOTCHECK; neighbor sentinel\n')
    (d/'SCORECARD.md').write_text('neighbor scorecard sentinel\n')
    target='corpus/lessons/round-75-verifier-spotcheck.md';exp='exit 2 refusal, zero bytes/mtime changes'
    if variant=='dotdot':target='corpus/lessons/../lessons/round-75-verifier-spotcheck.md';exp+='; refuse noncanonical ../ rather than guess'
    if variant=='absolute':target=str(d/target);exp+='; REFUSED_OUT_OF_SCOPE'
    if variant in ['symlink','scope-disguise']:
        target='corpus/lessons/round-12-verifier-spotcheck.md';(d/target).symlink_to('neighbor.md');exp+='; reject symlink, not filename-only adoption'
    if variant=='trailing-space':target+=' ';exp+='; REFUSED_NOT_SPOTCHECK (do not trim)'
    if variant=='directory':(d/target).unlink();(d/target).mkdir();exp+='; reject non-file'
    if variant=='readonly-pin':(d/'.ufo/pins/readme-map.json').chmod(0o444);exp+='; cannot complete both sides, zero partial README write'
    if variant=='v1-pin':
        p=d/'.ufo/pins/readme-map.json';j=json.loads(p.read_text());j['version']=1;p.write_text(json.dumps(j));exp+='; refuse unsupported pin version'
    if variant=='duplicate-row':
        p=d/'corpus/README.md';row='| `lessons/round-75-verifier-spotcheck.md` | duplicate fixture |\n';p.write_text(p.read_text()+'\n'+row+row);exp+='; duplicate ambiguity must refuse'
    c2.append((variant,d,target,exp))
def c2probe(item):
    variant,d,target,exp=item
    run('adopt-'+variant,exp+'; frozen script absent => MODULE_NOT_FOUND exit 1 (blocked)', ['node',str(L/'scripts/spotcheck-adopt.mjs'),'--adopt',target],cwd=d,watch=d)
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:list(pool.map(c2probe,c2))
(S/'raw.json').write_text(json.dumps(dict(revision=REV,uid=os.getuid(),records=sorted(records,key=lambda x:x['probe'])),indent=2))
