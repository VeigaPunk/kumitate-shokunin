import os, re, pathlib, subprocess, shutil, hashlib, concurrent.futures
L=pathlib.Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin')
B=L/'.ufo/waves/round-69/build/K69ReviewRegistryRows'
S=pathlib.Path('/fast/scratch/hyaku/kumitate-r69/K69ReviewRegistryRows')
F='9401d8655970d542b81d318bdad558d6dea39397'
log=[]
def emit(s): log.append(s); print(s,flush=True)
def run(args,cwd=S):
 p=subprocess.run(args,cwd=cwd,env={**os.environ,'TMPDIR':str(S)},capture_output=True,text=True,timeout=180)
 emit('$ '+' '.join(args)+'\n'+p.stdout+p.stderr+'exit='+str(p.returncode)); return p
try:
 S.mkdir(parents=True,exist_ok=True)
 base=subprocess.run(['git','-C',str(L),'show',F+':corpus/SOURCES.md'],capture_output=True,text=True,check=True).stdout
 current=(L/'corpus/SOURCES.md').read_text()
 drafts=sorted((L/'.ufo/waves/round-69/build').glob('K69ScoutMirror*/row.md'))
 emit('scout draft paths: '+str([str(p.relative_to(L)) for p in drafts]))
 rows=[]
 for i in (214,215,216):
  matches=[line for p in drafts for line in p.read_text().splitlines() if re.match(r'^\|\s*S'+str(i)+r'\s*\|',line)]
  if not matches: matches=[line for line in current.splitlines() if re.match(r'^\|\s*S'+str(i)+r'\s*\|',line)]
  assert len(set(matches))==1,(i,matches)
  rows.append(matches[0])
 (B/'rows-reviewed.md').write_text('\n'.join(rows)+'\n')
 ids=[int(m) for m in re.findall(r'^\|\s*S(\d+)\s*\|',base,re.M)]
 emit('freeze='+F+' baseline_rows='+str(len(ids))+' max_existing_id='+str(max(ids)))
 assert max(ids)==213
 shutil.copytree(L/'corpus',S/'corpus',dirs_exist_ok=True)
 for line in base.splitlines():
  cells=[c.strip() for c in line.split('|')[1:-1]]
  if len(cells)==11 and re.fullmatch(r'S\d{3,}',cells[0]) and cells[7]=='mined':
   for path in re.split('[,;]',cells[10]):
    path=path.strip()
    if path and path!='—' and (L/path).is_file():
     (S/path).parent.mkdir(parents=True,exist_ok=True)
     shutil.copyfile(L/path,S/path)
 (S/'corpus/SOURCES.md').write_text(base)
 run(['bash','/home/vgpnk/Projects/shokunin/scripts/sources-census.sh','validate','--file',str(S/'corpus/SOURCES.md'),'--today','2026-10-30'])
 pos=base.index('\n## Paths')
 (S/'corpus/SOURCES.md').write_text(base[:pos]+'\n'+'\n'.join(rows)+'\n'+base[pos:])
 shutil.copyfile(S/'corpus/SOURCES.md',B/'SOURCES-appended.md')
 for row in rows:
  c=[x.strip() for x in row.split('|')[1:-1]]
  assert len(c)==11
  assert c[2] in 'spec docs paper code tool dataset talk book community own-work'.split()
  assert c[3]=='A' and c[7]=='mined' and c[8]=='2026-10-30' and c[9]=='90d'
  assert (L/c[10]).is_file()
  emit(c[0]+' cells=11 kind='+c[2]+' tier=A opened='+c[8]+' recheck='+c[9]+' used-by-exists=yes cited-in-entry='+str(c[0] in (L/c[10]).read_text()))
 def fetch(row):
  c=[x.strip() for x in row.split('|')[1:-1]]; url=re.search(r'https://\S+',c[1]).group()
  p=subprocess.run(['curl','--fail','--location','--silent','--show-error','--max-time','120',url],capture_output=True,timeout=150)
  assert p.returncode==0,(c[0],p.stderr)
  (B/(c[0]+'.mdx')).write_bytes(p.stdout)
  return c[0],url,p.stdout
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
  fetched=list(pool.map(fetch,rows))
 for id,url,data in fetched:
  emit(id+' curl exit=0 URL='+url+' bytes='+str(len(data))+' sha256='+hashlib.sha256(data).hexdigest())
 commands=[]
 contract=pathlib.Path('/home/vgpnk/Projects/shokunin/CORPUS.md').read_text()
 manual=contract.split('### Census —')[1].split('```sh\n')[1].split('```')[0]
 for line in manual.splitlines():
  if line.strip() and not line.startswith('#'): commands.append(line)
 for command in commands: run(['bash','-c',command])
 run(['bash','/home/vgpnk/Projects/shokunin/scripts/sources-census.sh','validate','--file',str(S/'corpus/SOURCES.md'),'--today','2026-10-30'])
 run(['bash','/home/vgpnk/Projects/shokunin/scripts/sources-census.sh','census','--file',str(S/'corpus/SOURCES.md'),'--today','2026-10-30'])
finally:
 (B/'receipt.txt').write_text('\n'.join(log)+'\n')
 shutil.rmtree(S,ignore_errors=True)
