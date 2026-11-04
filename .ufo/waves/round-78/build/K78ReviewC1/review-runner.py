import os, pathlib, subprocess, tarfile, io, shutil, json, hashlib, time
L=pathlib.Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin'); B=L/'.ufo/waves/round-78/build/K78ReviewC1'; S=pathlib.Path('/fast/scratch/hyaku/kumitate-r78/K78ReviewC1'); P=L/'.ufo/waves/round-78/build/K78ExecKDerive/patch.diff'
S.mkdir(parents=True,exist_ok=True); (S/'tmp').mkdir(exist_ok=True)
os.environ['TMPDIR']=str(S/'tmp')
def run(args,cwd=None):
 r=subprocess.run(args,cwd=cwd or S,text=True,capture_output=True); return {'command':' '.join(map(str,args)),'exit':r.returncode,'stdout':r.stdout,'stderr':r.stderr}
def save(name,obj): (B/name).write_text(json.dumps(obj,indent=2)+'\n')
try:
 raw=subprocess.check_output(['git','-C',str(L),'archive','ad2630d0566a561ee078f47fade5644a22c10621']);
 for name in ['base','patched']:
  d=S/name; d.mkdir(exist_ok=True)
  with tarfile.open(fileobj=io.BytesIO(raw)) as t:t.extractall(d,members=[m for m in t.getmembers() if not (m.issym() or m.islnk())],filter='data')
 spec=json.loads((L/'.ufo/waves/round-78/probe/kimi-fixture.json').read_text()); root=S/'clean'; root.mkdir()
 for m in spec['members']:
  p=root/m['path']; p.parent.mkdir(parents=True,exist_ok=True)
  if m['kind']=='dir':p.mkdir(exist_ok=True)
  else:p.touch()
  p.chmod(m['mode'])
  for c in m.get('children',[]):(p/c).touch(); (p/c).chmod(0o644)
 root.chmod(0o755)
 src='/fast/scratch/hyaku/kumitate-pin/src'
 args=['--src',src,'--kimi-root',str(root),'--json']
 base=run(['node',str(S/'base/scripts/proxy-check.mjs'),*args]);save('base-proxy.json',base)
 basec=run(['node',str(S/'base/scripts/kimi-census.mjs'),'--root',str(root),'--json']);save('base-census.json',basec)
 for i in range(120):
  if P.exists():break
  time.sleep(2)
 if not P.exists():save('execution.json',{'patch':'absent after 240s','base':base});raise SystemExit(0)
 patch=(B/'reviewed.patch.diff').read_bytes()
 # patch applies source files in an archive, not git state.
 ap=run(['patch','-p1','--batch','--forward','-i',str(B/'reviewed.patch.diff')],S/'patched');save('apply.json',ap)
 if ap['exit']:raise SystemExit(1)
 probe=run(['node',str(S/'base/.ufo/waves/round-78/probe/probe78-c1.mjs'),'--lane',str(S/'patched'),'--work',str(S/'probe'),'--set','c1']);(B/'original-frozen-probe-on-patch.txt').write_text(json.dumps(probe,indent=2)+'\n')
 after=run(['node',str(S/'patched/scripts/proxy-check.mjs'),*args]);save('patched-proxy.json',after)
 afterc=run(['node',str(S/'patched/scripts/kimi-census.mjs'),'--root',str(root),'--json']);save('patched-census.json',afterc)
 a=json.loads(base['stdout']);b=json.loads(after['stdout']); k={'C1k','C1k_total','K_members','K_sections','K_findings','coverage_kimi','declared','pins','pinsMatched','pinsTotal'}
 save('non-k-delta.json',{x:[a['terms'].get(x),b['terms'].get(x)] for x in a['terms'].keys()|b['terms'].keys() if x not in k and a['terms'].get(x)!=b['terms'].get(x)})
 for j in [basec,afterc]:
  data=json.loads(j['stdout']);data.pop('durationMs',None);j['normalized']=data
 save('census-equivalence.json',{'equal':basec['normalized']==afterc['normalized']})
 ownership=run(['sudo','-n','chown',str(os.getuid()+1),str(root/'locks')])
 if ownership['exit']==0:
  url=(S/'patched/scripts/kimi-census.mjs').as_uri()
  code=f"import {{decide}} from {json.dumps(url)}; let a=decide({json.dumps(str(root))}); let b=decide({json.dumps(str(root))},process.getuid()); console.log(JSON.stringify({{implicit:a.findings,explicit:b.findings}}))"
  save('default-owner.json',run(['node','--input-type=module','-e',code]))
  save('owner-cli.json',run(['node',str(S/'patched/scripts/kimi-census.mjs'),'--root',str(root),'--json']))
  run(['sudo','-n','chown',str(os.getuid()),str(root/'locks')])
 else:save('default-owner.json',ownership)
 attacks={}
 for name in ['region','skills']:
  p=root/name
  if p.is_dir():shutil.rmtree(p)
  else:p.unlink()
  attacks[name]=run(['node',str(S/'patched/scripts/proxy-check.mjs'),*args])
 save('missing-members.json',attacks)
 # A root with more findings than members exposes formula lower-bound behavior.
 for p in root.iterdir():
  if p.is_dir():shutil.rmtree(p)
  else:p.unlink()
 (root/'region').touch()
 for i in range(40):(root/f'rogue-{i}').touch()
 save('saturation.json',run(['node',str(S/'patched/scripts/proxy-check.mjs'),*args]))
 save('execution.json',{'patch_sha256':hashlib.sha256(patch).hexdigest(),'probe_exit':probe['exit'],'scratch_deleted_in_finally':True,'node':run(['node','--version'])})
finally:shutil.rmtree(S)
