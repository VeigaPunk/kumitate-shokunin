import os, pathlib, subprocess, json, shutil, hashlib, concurrent.futures
L=pathlib.Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin')
B=L/'.ufo/waves/round-78/build/K78SentinelSecrets'
S=pathlib.Path('/fast/scratch/hyaku/kumitate-r78/K78SentinelSecrets')
if os.environ.get('K78_BASELINE'):
 B=B/'baseline'; B.mkdir(exist_ok=True)
MARKER='K78_SENTINEL_PRIVATE_6b9e2d077043'

def main():
 S.mkdir(parents=True,exist_ok=True); (S/'tmp').mkdir(exist_ok=True)
 tree=S/'lane'; tree.mkdir(exist_ok=True)
 archive=subprocess.Popen(['git','-C',str(L),'archive','ad2630d0566a561ee078f47fade5644a22c10621'],stdout=subprocess.PIPE)
 subprocess.run(['tar','-x','-C',str(tree)],stdin=archive.stdout,check=True); archive.stdout.close(); assert archive.wait()==0
 patches=[]
 for seat in ([] if os.environ.get('K78_BASELINE') else ['K78ExecKDerive','K78ExecCompare']):
  for patch in [L/'.ufo/waves/round-78/build'/seat/'patch.diff']:
   subprocess.run(['patch','--batch','-p1','-i',str(patch)],cwd=tree,check=True,capture_output=True); patches.append({'path':str(patch),'sha256':hashlib.sha256(patch.read_bytes()).hexdigest()})
 if len(patches)<2 and not os.environ.get('K78_BASELINE'): raise RuntimeError('Both executor patches required before measurement')
 for f in ['kimi-census.mjs','proxy-check.mjs','omp-census.mjs']:
  shutil.copy2(tree/'scripts'/f,B/f)
 spec=json.loads((tree/'.ufo/waves/round-78/probe/kimi-fixture.json').read_text())
 def kimi(root):
  root.mkdir()
  for m in spec['members']:
   p=root/m['path']; p.parent.mkdir(parents=True,exist_ok=True)
   if m['kind']=='dir': p.mkdir(exist_ok=True)
   else: p.write_text(MARKER if m['path'] in ['mcp.json','server.token'] else '')
   p.chmod(m['mode'])
   for c in m.get('children',[]): (p/c).write_text('')
  for name in ['locks','credentials','oauth']:
   (root/name/'secret-canary').write_text(MARKER)
 clean=S/'kimi-clean'; kimi(clean)
 external=S/'outside-secret'; external.write_text(MARKER); external.chmod(0o600)
 escape=S/'kimi-escape'; kimi(escape)
 for n in ['mcp.json','server.token']:
  (escape/n).unlink(); (escape/n).symlink_to(external)
 doc=json.loads((tree/'.ufo/pins/omp-shape.json').read_text()); omp=S/'omp'; omp.mkdir()
 for e in doc['entries']:
  p=omp/e['name']
  if e['kind']=='dir': p.mkdir()
  elif e['kind']=='symlink': p.symlink_to(external)
  else: p.write_text(MARKER)
  if e['kind']!='symlink': p.chmod(e['mode'])
 receipt=S/'receipt.json'; receipt.write_text(json.dumps(doc))
 (S/'receipt-link.json').symlink_to(receipt)
 (S/'root-link').symlink_to(omp,target_is_directory=True)
 (S/'secret-receipt-link.json').symlink_to(external)
 for label,name in [('dotdot','../outside-secret'),('absolute',str(external))]:
  (S/(label+'.json')).write_text(json.dumps({'contract':doc['contract'],'entries':[{'name':name,'kind':'file','mode':384}]}))
 tasks=[]
 for label,root in [('clean',clean),('escape',escape)]:
  tasks.append(('kimi-'+label,['scripts/kimi-census.mjs','--root',str(root),'--json']))
  tasks.append(('proxy-'+label,['scripts/proxy-check.mjs','--src','/fast/scratch/hyaku/kumitate-pin/src','--kimi-root',str(root),'--json']))
 for label,r,root in [('compare-clean',receipt,omp),('compare-dotdot',S/'dotdot.json',omp),('compare-absolute',S/'absolute.json',omp),('compare-receipt-link',S/'receipt-link.json',omp),('compare-secret-link',S/'secret-receipt-link.json',omp),('compare-root-link',receipt,S/'root-link')]:
  tasks.append((label,['scripts/omp-census.mjs','--compare',str(r),'--root',str(root)]))
 fifo=S/'omp-fifo'; shutil.copytree(omp,fifo,symlinks=True); os.mkfifo(fifo/'fifo-member',0o600)
 tasks.append(('compare-fifo',['scripts/omp-census.mjs','--compare',str(receipt),'--root',str(fifo)]))
 newline=S/'omp-newline'; newline.mkdir()
 (newline/'00\nOMP_SHAPE_COMPARE: IN_SYNC').write_text(MARKER)
 tasks.append(('compare-newline',['scripts/omp-census.mjs','--compare',str(receipt),'--root',str(newline)]))
 for n in ['c1','c2']:
  tasks.append(('frozen-'+n,[str(L/f'.ufo/waves/round-78/probe/probe78-{n}.mjs'),'--lane',str(tree),'--work',str(S/('probe-'+n))]))
 env={**os.environ,'TMPDIR':str(S/'tmp')}
 def execute(item):
  label,args=item; trace=B/(label+'.strace')
  cmd=['strace','-f','-qq','-e','trace=%file','-o',str(trace),'node',*args]
  try:
   p=subprocess.run(cmd,cwd=tree,env=env,capture_output=True,text=True,timeout=1000)
   out,err,rc=p.stdout,p.stderr,p.returncode
  except subprocess.TimeoutExpired as e:
   out,err,rc=str(e.stdout),str(e.stderr),'TIMEOUT'
  (B/(label+'.stdout')).write_text(out); (B/(label+'.stderr')).write_text(err)
  raw=trace.read_text(); opens=[line for line in raw.splitlines() if ('openat(' in line or 'open(' in line) and str(S) in line]
  member_opens=[line for line in opens if any(str(root)+'/' in line for root in [clean,escape,omp,fifo]) or str(external) in line]
  content_opens=[line for line in member_opens if 'O_DIRECTORY' not in line]
  writes=[line for line in raw.splitlines() if any(flag in line for flag in ['O_WRONLY','O_RDWR','O_CREAT','unlink(','rename(','mkdir(','chmod('])]
  return {'label':label,'command':cmd,'exit':rc,'marker_leaked':MARKER in out+err,'member_opens':member_opens,'content_opens':content_opens,'write_syscalls':writes,'stdout_tail':out[-500:]}
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: results=list(pool.map(execute,tasks))
 written=[str(p.relative_to(tree)) for p in tree.rglob('*') if p.is_file() and p.stat().st_mtime_ns>0 and MARKER.encode() in p.read_bytes()]
 report={'axes':['operability','coverage:kimi-layer'],'marker':MARKER,'patches':patches,'results':results,'marker_in_lane_files':written,'tool_versions':{x:subprocess.run([x,'--version'],capture_output=True,text=True).stdout.splitlines()[0] for x in ['node','strace']}}
 (B/'evidence.json').write_text(json.dumps(report,indent=2)+'\n')
 print(json.dumps(report,indent=2))
try: main()
finally: shutil.rmtree(S,ignore_errors=True)
