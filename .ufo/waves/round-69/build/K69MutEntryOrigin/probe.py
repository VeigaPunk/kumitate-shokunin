import hashlib, json, os, pathlib, shutil, signal, subprocess, tempfile
LANE=pathlib.Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin')
OUT=LANE/'.ufo/waves/round-69/build/K69MutEntryOrigin'
S=pathlib.Path('/fast/scratch/hyaku/kumitate-r69/K69MutEntryOrigin')
BASE='14057f3e3899180c95713bace088fb9c0d0046e3'
PROBE=LANE/'.ufo/waves/round-69/probe/deprec69-probe.mjs'
S.mkdir(parents=True,exist_ok=True)
env=dict(os.environ,TMPDIR=str(S))
def run(args, **kw):
    return subprocess.run(args,check=True,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE,**kw)
def sha(b): return hashlib.sha256(b).hexdigest()
results=[]
try:
    D=pathlib.Path(tempfile.mkdtemp(prefix='fx.',dir=S))
    archive=run(['git','-C',str(LANE),'archive',BASE]).stdout
    run(['tar','-x','--no-same-owner','--no-same-permissions','-C',str(D)],input=archive)
    run(['git','-C',str(D),'init','-q'])
    assert run(['git','-C',str(D),'rev-parse','--show-toplevel']).stdout.decode().strip()==str(D)
    entry=D/'corpus/knowledge/mcp-deprecation-registry.md'
    sources=D/'corpus/SOURCES.md'
    pins=D/'.ufo/pins/source-captures.json'
    original={p:p.read_bytes() for p in (entry,sources,pins)}
    def score(label):
        run(['git','-C',str(D),'add','-A'])
        run(['git','-C',str(D),'-c','user.name=mutation','-c','user.email=mutation@invalid','-c','commit.gpgsign=false','commit','--allow-empty','--no-verify','-qm',label])
        rev=run(['git','-C',str(D),'rev-parse','HEAD']).stdout.decode().strip()
        cmd=['node',str(PROBE),str(D),rev,'--no-live']
        p=subprocess.Popen(cmd,env=env,cwd=D,stdout=subprocess.PIPE,stderr=subprocess.PIPE,start_new_session=True)
        timeout=False
        try: stdout,stderr=p.communicate(timeout=25)
        except subprocess.TimeoutExpired:
            timeout=True
            os.killpg(p.pid,signal.SIGKILL)
            stdout,stderr=p.communicate()
        text=stdout.decode(errors='replace')+stderr.decode(errors='replace')
        receipt=f'COMMAND: {" ".join(cmd)}\n{text}\nexit={p.returncode} timeout={timeout}\n'
        (OUT/(label+'.txt')).write_text(receipt)
        item={'label':label,'rev':rev,'exit':p.returncode,'timeout':timeout,'output':text,'hashes':{str(k.relative_to(D)):sha(k.read_bytes()) for k in original}}
        results.append(item)
        print(json.dumps(item),flush=True)
    score('pristine')
    origin='\n## Capture origin\n\nDRAFT — mutation fixture, not authenticated source evidence.\n\n'
    mirrors={'S207':'S214','S208':'S215','S211':'S216'}
    origin+='\n'.join(f'- S{i} — capture 2026-10-27 — '+('mirror '+mirrors[f'S{i}'] if f'S{i}' in mirrors else 'pinned') for i in range(207,214))+'\n'
    entry.write_bytes(original[entry]+origin.encode())
    (OUT/'draft-origin.md').write_text(origin)
    score('draft-origin-no-mirrors')
    upstream='82d60be17d75e69b350c9fe77df2e8cac202ac11'
    paths=['docs/specification/2026-07-28/deprecated.mdx','docs/community/feature-lifecycle.mdx','docs/specification/2025-11-25/basic/transports.mdx']
    rows='\n'.join(f'| S{i} | MCP mirror — https://raw.githubusercontent.com/modelcontextprotocol/modelcontextprotocol/{upstream}/{path} | code | A | origin mutation fixture | mirror | origin binding probe | mined | 2026-10-30 | 90d | corpus/knowledge/mcp-deprecation-registry.md |' for i,path in zip(range(214,217),paths))+'\n'
    sources.write_bytes(original[sources]+b'\n'+rows.encode())
    (OUT/'mirror-rows.md').write_text(rows)
    data=json.loads(original[pins])
    s207=next(c for c in data['captures'] if c['sourceId']=='S207')
    payload=(D/s207['path']).read_bytes()
    # Deliberately self-asserted carrier: table-equivalent, never claimed as a live fetch.
    rel='.ufo/mutation-S214.md'
    (D/rel).write_bytes(payload)
    pin=dict(s207,sourceId='S214',path=rel,sha256=sha(payload),bytes=len(payload))
    data['captures'].append(pin)
    pins.write_text(json.dumps(data,indent=2)+'\n')
    (OUT/'one-mirror-pin.json').write_text(json.dumps(pin,indent=2)+'\n')
    score('rows-one-capture')
finally:
    if 'original' in locals():
        for path,content in original.items(): path.write_bytes(content)
        extra=D/'.ufo/mutation-S214.md'
        if extra.exists(): extra.unlink()
        try: score('restored')
        finally:
            evidence={'base':BASE,'probe_sha256':sha(PROBE.read_bytes()),'results':results,'restoration_exact':all(p.read_bytes()==b for p,b in original.items())}
            (OUT/'evidence.json').write_text(json.dumps(evidence,indent=2)+'\n')
            print('restoration_exact='+str(evidence['restoration_exact']),flush=True)
    shutil.rmtree(S)
    print('scratch_removed='+str(not S.exists()),flush=True)
