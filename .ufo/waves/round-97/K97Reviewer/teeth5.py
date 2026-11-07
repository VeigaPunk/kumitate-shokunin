import pathlib, shutil, subprocess, os, json
ROOT=pathlib.Path('/fast/scratch/hyaku/kumitate-r97/K97Reviewer')
SRC=pathlib.Path('/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-97/K97ExecTool/sources-check.mjs')
C=SRC.read_text()
START="  const sourceLines = sourceText.split(/\\r?\\n/).map(normalizeMarkdownIndent);\n"
END="    sectionAtLine[index] = activeSection;\n  }\n"
i=C.index(START); j=C.index(END,i)+len(END)
work=ROOT/'teeth5'; shutil.rmtree(work,ignore_errors=True); work.mkdir()
for f in ('cap-spawn.mjs','cap-run.mjs'):
    shutil.copy('/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/'+f, work/f)
(work/'candidate.mjs').write_text(C)
(work/'sha.txt').write_text(subprocess.run(['sha256sum',str(SRC)],capture_output=True,text=True).stdout)
def run(path,label):
    r=subprocess.run(['node',str(path),'--selftest'],capture_output=True,text=True,timeout=300,
                     env={**os.environ,'TMPDIR':str(work)},cwd=str(work))
    v=[l for l in r.stdout.split('\n') if l.startswith('VERDICT:')]
    fails=[l[len('FAIL '):].split(':')[0] for l in r.stdout.split('\n') if l.startswith('FAIL ')]
    shutil.rmtree(work/'fx',ignore_errors=True); shutil.rmtree(work/'lane-rev',ignore_errors=True)
    print(f'{label:28s} exit={r.returncode} {v[-1] if v else "?":14s} arms_failed={len(fails)} {fails[:5]}',flush=True)
    return {'exit':r.returncode,'verdict':v[-1] if v else '?','fails':fails}
res={'R97+CANDIDATE':run(work/'candidate.mjs','R97+CANDIDATE')}
for p in sorted((ROOT/'ctl').glob('ctl-*.mjs')):
    t=p.read_text(); a=t.index(START); b=t.index(END,a)+len(END); blk=t[a:b]
    out=C[:i]+blk+C[j:]
    if p.stem=='ctl-nodisclose':
        out=out.replace("        add('error', 'ROW_OUTSIDE_REGISTRY',","        if (false) add('error', 'ROW_OUTSIDE_REGISTRY',",1)
    f=work/(p.stem+'-c.mjs'); f.write_text(out)
    res[p.stem]=run(f,'cand+'+p.stem)
(ROOT/'teeth5.json').write_text(json.dumps(res,indent=1))
print('SURVIVORS:', [k for k,v in res.items() if v['verdict']=='VERDICT: PASS'])
arms=sorted({f for v in res.values() for f in v['fails'] if f.startswith('r97sec')})
print('r97sec arms with teeth:',len(arms))
for a in arms: print('  ',a,[k for k,v in res.items() if a in v['fails']])
