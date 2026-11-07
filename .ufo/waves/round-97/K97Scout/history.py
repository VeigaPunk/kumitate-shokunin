#!/usr/bin/env python3
"""K97Scout: across every revision of kumitate's corpus/SOURCES.md, classify heading
lines by the round-97 grammar classes and report any non-plain class."""
import subprocess, re, sys, collections

LANE = '/home/vgpnk/Projects/shokunin/kumitate-shokunin'
OUT = '/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-97/K97Scout'

revs = subprocess.run(['git','-C',LANE,'log','--format=%H','--','corpus/SOURCES.md'],
                      capture_output=True, text=True, check=True).stdout.split()

def esc(s):
    out=[]
    for ch in s:
        if ch=='\t': out.append('<TAB>')
        elif ch=='\r': out.append('<CR>')
        elif ch=='\v': out.append('<VT>')
        elif ch=='\f': out.append('<FF>')
        elif ch=='\u00a0': out.append('<NBSP>')
        elif ord(ch)<32: out.append('<%02X>'%ord(ch))
        elif ord(ch)==0xA0: out.append('<NBSP>')
        else: out.append(ch)
    return ''.join(out)

def cls(line):
    m=re.match(r'^[ \t]*',line); ind=m.group(0)
    indent = 'TAB' if '\t' in ind else ('%dSP'%len(ind))
    rest=line[len(ind):]
    mm=re.match(r'^(#+)',rest); marker=mm.group(1) if mm else '?'
    body=rest[len(marker):]
    sep='none'
    for c,n in ((' ','SP'),('\t','TAB'),('\v','VT'),('\f','FF'),('\r','CR'),(' ','NBSP')):
        if body.startswith(c): sep=n; break
    text=body[1:] if body[:1] in (' ','\t','\v','\f','\r',' ') else body
    trail='none'
    for c,n in (('\r','CR'),('\v','VT'),('\f','FF'),(' ','NBSP'),('\t','TAB'),(' ','SP')):
        if text.endswith(c): trail=n; break
    return indent,marker,sep,trail,text

plain = collections.Counter()
nonplain = collections.Counter()
nonplain_examples = collections.defaultdict(list)
per_rev = []
for r in revs:
    blob = subprocess.run(['git','-C',LANE,'show','%s:corpus/SOURCES.md'%r],
                          capture_output=True, check=True).stdout
    has_cr = b'\r' in blob
    text = blob.decode('utf-8')
    lines = text.split('\n')
    np_here = 0
    for i,l in enumerate(lines):
        if not re.match(r'^[ \t]*#', l): continue
        indent,marker,sep,trail,t = cls(l)
        key=(indent,marker,sep,trail)
        # "plain" = column-0 '##' + single SP separator + no exotic trail
        is_plain = (indent=='0SP' and marker=='##' and sep=='SP' and trail in ('none','SP'))
        if is_plain:
            plain[key]+=1
        else:
            nonplain[key]+=1
            np_here+=1
            if len(nonplain_examples[key])<3:
                nonplain_examples[key].append((r[:12], i+1, esc(l)))
    per_rev.append((r, has_cr, np_here, len(lines)))

out=[]
out.append('=== kumitate corpus/SOURCES.md history: heading-class census ===')
out.append('revisions touching corpus/SOURCES.md: %d' % len(revs))
out.append('revisions whose blob contains a CR byte: %d' % sum(1 for p in per_rev if p[1]))
out.append('')
out.append('--- PLAIN class counts (indent,marker,sep,trail) ---')
for k,v in sorted(plain.items()): out.append('  %-28s %d' % (str(k), v))
out.append('  TOTAL plain heading lines: %d' % sum(plain.values()))
out.append('')
out.append('--- NON-PLAIN class counts ---')
if not nonplain:
    out.append('  (none)')
for k,v in sorted(nonplain.items()):
    out.append('  %-28s %d' % (str(k), v))
    for ex in nonplain_examples[k]:
        out.append('      rev=%s L%d  %s' % ex)
out.append('  TOTAL non-plain heading lines: %d' % sum(nonplain.values()))
out.append('')
out.append('--- per-revision non-plain heading count (nonzero only) ---')
nz=[p for p in per_rev if p[2]>0]
out.append('  revisions with >=1 non-plain heading line: %d of %d' % (len(nz), len(per_rev)))
for p in nz[:50]:
    out.append('  rev=%s crlf=%s nonplain=%d lines=%d' % (p[0][:12], p[1], p[2], p[3]))
txt='\n'.join(out)+'\n'
open(OUT+'/history.txt','w').write(txt)
print(txt)
