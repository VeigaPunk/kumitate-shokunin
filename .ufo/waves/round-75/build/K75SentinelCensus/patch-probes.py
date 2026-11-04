from pathlib import Path
import os,re,subprocess,json
S=Path('/fast/scratch/hyaku/kumitate-r75/K75SentinelCensus')
T=S/'patched/scripts/omp-census.mjs'
source=T.read_text()
base=source.split('const BASE_MEMBERS = [',1)[1].split('];',1)[0]
families=source.split('const CHAIN_FAMILIES = [',1)[1].split('];',1)[0]
tokens=re.findall(r"name: '([^']+)'",base)+re.findall(r"id: '([^']+)'",families)
assert len(tokens)==35
(S/'tokens.json').write_text(json.dumps(tokens))
notes=S/'notes'; notes.mkdir(exist_ok=True)
(notes/'all.md').write_text('\n'.join(tokens))
(notes/'empty.md').write_text('')
(notes/'fenced.md').write_text('```text\n'+'\n'.join(tokens)+'\n```\n')
root=S/'patchroot'; root.mkdir(exist_ok=True)
(root/'config.yml').touch(); (root/'config.yml').chmod(0o600)
rows=[]
def probe(name,expected,root,note,code,has,extra=()):
    print(f'EXPECTED {name}: {expected}',flush=True)
    cmd=['node',str(T),'--root',str(root),'--note',str(note),*extra]
    r=subprocess.run(cmd,text=True,capture_output=True,env={**os.environ,'TMPDIR':str(S)})
    out=r.stdout+r.stderr
    (S/'out'/f'{name}.txt').write_text('COMMAND '+json.dumps(cmd)+'\n'+out+f'exit={r.returncode}\n')
    held=r.returncode==code and all(x in out for x in has)
    selected='; '.join(x for x in out.splitlines() if x.startswith(('OMP_CENSUS:','NOTE_MISSING','UNLISTED','KIND','MODE')))
    if name=='patch-empty-note': selected='NOTE_UNBOUND count='+str(out.count('NOTE_UNBOUND '))+'; '+selected
    row=f'{name} | {expected} | {selected} | {r.returncode} | '+('HELD' if held else 'FAILED')
    rows.append(row); print(row,flush=True)
probe('patch-good-note','CLEAN bound=35/35 exit 0',root,notes/'all.md',0,['OMP_CENSUS: CLEAN','bound=35/35'])
for n in ['config.yml.pre-x-2026','config.yml.pre-x-2026110','bogus-75.txt']:
    (root/n).touch(); (root/n).chmod(0o600)
probe('patch-malformed-dates','UNLISTED both malformed dates and bogus-75.txt exit 1',root,notes/'all.md',1,['UNLISTED config.yml.pre-x-2026\n','UNLISTED config.yml.pre-x-2026110\n','UNLISTED bogus-75.txt'])
for n in ['config.yml.pre-x-2026','config.yml.pre-x-2026110','bogus-75.txt']: (root/n).unlink()
probe('patch-empty-note','NOTE_UNBOUND nonzero never CLEAN',root,notes/'empty.md',1,['NOTE_UNBOUND config-pre','OMP_CENSUS: DRIFT'])
probe('patch-missing-note','NOTE_MISSING exit 2 never CLEAN',root,notes/'missing.md',2,['NOTE_MISSING'])
probe('patch-fenced-note','CLEAN bound=35/35: mention-binding LIMIT',root,notes/'fenced.md',0,['OMP_CENSUS: CLEAN','bound=35/35'])
(root/'config.yml').chmod(0)
probe('patch-mode000','CLEAN entries=1 bound=35/35 despite unreadable member',root,notes/'all.md',0,['OMP_CENSUS: CLEAN','entries=1','bound=35/35'])
(root/'config.yml').chmod(0o600)
(S/'patch-rows.txt').write_text('\n'.join(rows)+'\n')
