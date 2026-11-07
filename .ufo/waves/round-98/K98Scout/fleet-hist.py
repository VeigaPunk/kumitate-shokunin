import glob,os,re,subprocess,sys,json
FLEET="/home/vgpnk/Projects/shokunin"
ES_WS=set("\t\n\v\f\r \u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff")
BASE=re.compile(r"^ {0,3}\|\s*S\d{3,}\s*\|")
CEN=re.compile(r"^\|[ \t]*S\d{3,}[ \t]*\|")
lane=sys.argv[1]
D=os.path.join(FLEET,lane+"-shokunin")
revs=[l.strip() for l in subprocess.run(["git","-C",D,"log","--format=%H","--","corpus/SOURCES.md"],capture_output=True,text=True).stdout.splitlines() if l.strip()]
rows=0;nonblank=[];mism=[];crlf=[]
for r in revs:
    out=subprocess.run(["git","-C",D,"show",f"{r}:corpus/SOURCES.md"],capture_output=True)
    if out.returncode!=0: continue
    raw=out.stdout
    if b"\r\n" in raw: crlf.append(r)
    t=raw.decode('utf-8')
    for i,line in enumerate(t.split('\n'),1):
        s=re.sub(r'^ {0,3}','',line)
        if not s.startswith('|'): continue
        parts=s.split('|')
        if len(parts)<2: continue
        m=re.search(r'S\d{3,}',parts[1])
        if not m: continue
        rows+=1
        pad=parts[1][:m.start()]+parts[1][m.end():]
        if any(c in ES_WS and c not in " \t" for c in pad): nonblank.append((r[:12],i,repr(line[:80])))
        if bool(BASE.match(line))!=bool(CEN.match(s)): mism.append((r[:12],i,repr(line[:80])))
print(json.dumps({"lane":lane,"revs":len(revs),"rows":rows,"nonblank":nonblank[:5],"n_nonblank":len(nonblank),"n_mismatch":len(mism),"mismatch":mism[:5],"crlf_revs":len(crlf)}))
