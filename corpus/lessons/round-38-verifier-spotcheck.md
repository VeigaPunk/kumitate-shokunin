# Round 38 — non-author closure: genuine repairs, incomplete immutable floor

author: hyaku closure (non-author integrator, @m_opus)

Date: 2026-10-21. I did not author round 38; its author was the round-37 verifier
CloseKumitate37. No sibling gate, selftest, frozen replayer, provider probe, build,
linter or formatter was executed. I used my own plain Python parser/data-walk over
Git blobs. No optional reviewer seats were dispatched; no installs/updates.

## Closure decision and axes

**status=ok; admitted=false; verdict=rejected-honest-stop.** The report names real
landed work. C1's independently remeasured repairs are improved, with zero measured
losses. C2's observed suites are evidence-verified, but its declared immutable
per-anchor floor does not cover valid current-key substitution on the direct
registered entry. This is not a third harmed measurement or a reason to discard C1.
No author files were changed to manufacture an admission.

| axis | verdict | basis |
|---|---|---|
| coverage:script-layer | improved | C1: 811 positions, fixed governing tokens 469→628 true; 159 gains, zero true→nontrue |
| operability | unprovable | C2: 22/22 and three mutation kills are real committed evidence; the claimed per-anchor floor misses a renamed current key, modeled below |
| coverage:runtime-layer | unchanged | proxy receipt remains R92/92; no new runtime claim |
| coverage:kimi-layer | unchanged | proxy receipt remains K51/51; no new Kimi claim |
| coverage (retired aggregate) | unchanged | score remains 10; C2 map86/86 is receipt-verified, not a new coverage capability |

No measured anchor harm is inferred from the new detector defect. Conversely, aggregate
counts are not assumed to prove prose semantics or the claimed gate guarantee.

## Step-1 conformance

- Fleet `git log -1 --format='%an %H' -- .ufo/reports/round-38/kumitate.md`:
  `kumitate-shokunin 204807e0a09897aa586b9e0f7f79e3806700da70`.
- `jj-lane.sh state <lane>` before writing: branch master, local=remote
  `89ff4a74d92d71575687f407311c82abfac53ff7`, ahead=0 behind=0,
  tracked=0 untracked=0; `git status --porcelain` emitted nothing.
- `git merge-base --is-ancestor <rev> master` exited0 for open753446a8,
  baselinee18ff1af, candidatec938c068, measured01aab4b0, delivery89ff4a74,
  and cited historical5031720/fb5b90e/8c41439/6f88d12. The source pin
  31c465f15669f744848bd9f5d56191c5085670f7 is in the source repo, not a lane commit.
- Four `[~]` lines under SHONEN; dispatched prompt sections1–5 carry mission/axes,
  claims/admission, frontier, L2 floor, report/commit/hash/write/push scope and L0.
  The host addendum maps the L1 planner and operator routing. Build90 exceeded
  Main's narrower64–88 context although inside the rendered64–100 prompt: disclosed
  status-neutral conformance defect, not erased by successful gates.
- `git diff --numstat <open> <delivery> -- LOG.md corpus/SOURCES.md`:
  LOG50 additions/0 deletions; SOURCES1 addition/0 deletions. All four new lane
  commits carry `kumitate-shokunin <kumitate@shokunin.local>`.
- `git diff --name-only 01aab4b0 89ff4a74` contains only round-38 evidence;
  production executable/corpus/pin bytes did not change after final measurements.

Dispatch/completion digest (copied from closure assignment; mutable driver log):
`2026-10-21T04:04:24-03:00 launch kumitate round=38 pgid=983302 driver=hyaku-inline attempt=1`
/ `2026-10-21T05:10:38-03:00 complete kumitate round=38; hyaku-inline attempt=1`.

## C1 — independent full-population remeasurement

Method declared before running: preserve round-open historical governing tokens,
left-first positional runs, right-aligned pending symbols and legacy forward fill;
whole normalized token OR longest identifier, word boundary including `$`.
Read immutable source Git blobs, not worktree files. The recognized-span regex is
intentionally the fixed 811 dialect, not an escape-aware Markdown parser. The code
below is mine and imports no lane script. Parser-body SHA256:
`28db3a615bba8c5e8fac59b092950f8fb7259d13a391ddc28a43d36e8a1214eb`.

Observed with plain Python subprocess Git reads against source31c465f1:

| note | anchors | open true | delivered true, old tokens | gains | losses | prior62 corrected/population |
|---|---:|---:|---:|---:|---:|---:|
| native-trial-launch |54|19|53|34|0|21/21|
| remaining-scripts-census |521|357|410|53|0|23/27|
| route-probe-cluster |165|46|96|50|0|6/6|
| sighting-wall |71|47|69|22|0|8/8|
| total |811|469|628|159|0|58/62|

I also independently judged every committed production expectation with its fixed
review token and production word boundary (excluding `$`): baseline467 true,
208 debt,136 unchecked → delivery777 true,21 debt,13 unchecked; zero expectation/
source mismatches. All467 baseline-true ordinals retain raw/path/range and true
status. The frozen oracle SHA256 is `ecb22db008ae4a800e88d86746acedb2820bd69b9166b105915ec03f0f5bc543`
at baseline, final measured production, and delivery. Baselinee18ff1af changes only
the new script, initial expectation pin and freeze receipt; note repairs land later.

### Why the two oracles differ — neither is selected after its result

Historical C1 holds the original governing token fixed; production uses the
pre-frozen pairing (shared-symbol broadcast and no lookahead stealing another
citation's token), explicit reviewed tokens, and a different `$` boundary. The
historical round-open `REAL_BACKUP` anchor has false→true solely under the boundary
change; pairing changes move others in both directions, giving469 vs467, not one
monotone rescaling. Production review tokens change138 delivered true entries;
they are explicit evidence authorities, not old-token gains. These are separate
named questions. I report both full populations and never substitute777 for628.

The prior62 list has58 original-token corrections and four pairing exceptions,
all reopened from source31c465f1:
- S8#112: old MAX_BYTES; actual `fixtureDir` definition at fleet-ledger-rotate.test.mjs54.
- S8#324: old validateTaskReceipt; dynamic `await import` at ufo-l0-monitor.test.mjs36.
- S8#410: old spawnSync; `test("a throw retries and never escapes the seam"` at
  ufo-stale-watchdog.test.mjs62; current token throw accurately scopes this locator.
- S8#475: old agentId; underscored test declaration `conflicting_agent_id_rejected`
  at ufo-swarm-collect.test.mjs560. It remains debt:false, not falsely called fixed.
The first three are supported token corrections, not repaired definitions of the
old symbol; the fourth stays marked. Thus I do not certify62 old-token greens.

## C2 — committed gate evidence, and the unproved floor

These are evidence-verified, **not closure executions**. All final receipts under
`.ufo/waves/round-38/final/` name production01aab4b0:
- truth-selftest.txt22/22 PASS exit0; truth.txt777/21/13 CLEAN exit0 with literal
  baselinee18ff1af; checklist15/15; claims-selftest47/47; proxy MATCH A8/C15,
  C2=86/86, S88/88 R92/92 K51/51, six existing pins match; sources33 CLEAN.
- falsify/MutPair.md:22→17→22 (AT02/03/04/15/18), exits0→1→0;
  MutDebt.md:22→21→22 (AT07), and a same-key hand-pin debt rejected;
  MutOverride.md:22→21→22 (AT09). All restore the exact oracle hash above.
- frozen.txt: seven lane inputs and80 source blobs verified, MATCH final revision,
  exit0; frozen-tamper.txt: zeroed oracle expectation digest → snapshot_tampered,
  exit2. My independent hashlib/Git-blob digest walk verified all7+80 with zero
  mismatches. This is not executing the replayer.
- Two proxy unpinned warnings (anchor-truth/sources-check) remain disclosed. The new
  oracle has its frozen SHA authority, rather than a fabricated seventh proxy pin.

### Missing-key counterexample: supported current input, immutable base unchanged

The declared checklist command (SKILL item14) is directly:
`node scripts/anchor-truth.mjs --base e18ff1af3392e3823227644c977c237737fe65c9`.
It is **not** the digest-checking frozen replay wrapper. Its supported current
input is `.ufo/pins/anchor-truth.json`; the baseline comes from unchanged
`git show BASE:.ufo/pins/anchor-truth.json`.

**Modeled, not gate-executed:** deep-copy the delivered current pin in Python;
change only S8 ordinal3 (`scripts/charter-scribe/config.json:2`), which is true
both in the baseline and delivered pin, as follows:
`token=null; expect="unchecked"; source="pair"; key="closure-r38-missing-base-key"`.
Keep its raw/path/ordinal/coordinates, notes, source, code and baseline untouched.
The original key is `scripts/charter-scribe/config.json|"charter-scribe"|0`.

Full independent schema walk: current valid=true, baseline valid=true, revisions
equal=true. The schema only requires an arbitrary unique string key (script371–388).
The direct read-path accepts the current pin (415–420); checkNote (290–312) sees
unchanged raw/path sequence and null-token unchecked, without a reviewed override.
Its baseline comparison (316–337) has S8 true506≥356, debt5≤77. For each baseline
true entry it rejects only `m && m.expect !== 'true'`; the old key's missing `m`
is ignored. My plain model emitted `local_findings=[] floor_findings=[]`.

This current-pin/schema-identity substitution is inside the direct entry's input
trust boundary, not a rewritten trusted baseline/code and not a bypass of the
frozen wrapper. The frozen wrapper **would reject** its changed pin digest; no
claim that the wrapper accepts it is made. `--write-pin`'s ordinal protection
(445–451) does not run on the normal read path. This defeats the declared
per-anchor immutable-floor guarantee even though all actual delivered467 true
ordinals are preserved. C2's claimed guarantee is therefore unprovable, not
rescued by22/22 or aggregate debt counts.

Three actual baseline-true token-keys disappeared legitimately (S8#52/#270/#456)
while their ordinals remain true. The repair must use a reviewed stable identity/
ordinal crosswalk, not blindly reject every missing old token-key or weaken the
original floor. I made no author-code change and ran no sibling gate.

## Discernment spot-check — opened sources, not count-only trust

| item | lane decision | reopened source | judgment | reason |
|---|---|---|---|---|
| native launch die locator | admit definition coordinate | source31c465f1 scripts/run-omp-native-trial.mjs834–844 | agree | function die is838, BLOCKED output839, exit2 at840; this is the emission body, not a comment token |
| extendLedgerMemoWithSuffix locator | reject comment-only repair; admit definition278 | source31c465f1 scripts/fleet-ledger-read.mjs274–284 | agree | comment274–277 is distinct from exported function278 and guard body279–284 |
| explicit-empty-operand sentence | reject/mark unchecked S8#371 | source31c465f1 scripts/ufo-mission-lifecycle.mjs202–230; note debt row | agree | source&&source!="-" at211 sends empty string to stdin219; invalid JSON227 does not prove empty-operand refusal; false prose is visibly held, not admitted truth |
| reviewed effort token | admit lexical result with semantic limit | source31c465f1 scripts/omp-route-grammar.mjs98–110 | agree, bounded |104–108 really whitelist effort; paragraph-level/case borrowing noted by MutOverride is a weakness, not evidence the body claim is false |
| S033 | admit A/docs for commit-pinned file versions | https://docs.github.com/en/repositories/working-with-files/using-files/getting-permanent-links-to-files | agree | reopened exact section File views show the latest version on a branch;23-word quote below verbatim; line-anchor application explicitly inference |

S033 quote (23 words): “so if you were to copy the normal URL, the file contents
might not be the same when someone looks at it later.” Reopened on2026-10-21;
next heading specifies permanent commit IDs. Independent source-row count33;
`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`
printed `kumitate ok /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md`, exit0.

Additional weak-token semantic samples were actually reopened: S8#74 token1 is
section1 comment273, S8#389 token1 is process.exitCode=1 at observation124,
S7#31 token0 is help's process.exit(0)57–58, S7#83 token2 is usage exit2 at health104.
These narrow claims agree; they do not license arbitrary nearby-token/prose claims.

## Wave accounting, residuals and trends

Committed specs/report paths independently counted: build90 (41scout39reviewer,
3critic3executor2scribe1sentinel1connector),89 reports/1 failed; falsify88
(55reviewer27scout3mutation-tester1critic1sentinel1connector),45 primary reports/
43 failed, supplements excluded from report count. Total178, no replacements.
Build report names ConnSibling failure; falsify summary names all43 failures;
40 completed prose/anchor groups cover171 ids,158 agreed/13 refuted. Twelve
previously actionable findings were integrated, one refutation was already debt.
This is partial fresh semantic review, not811 fresh independent semantic judgments.

Build release is committed in build-seat-accounting; r37 release receipt is also
committed. The current wave-slots ledger has only mori/kengaku/chousa rows and
**no kumitate reservation**, confirming r38 build/falsify and oldr37 are released.
AuditRemainder6 and Check27 were recovered misrooted completions, not dead-seat
replacements; r37 closure's cause diagnosis is superseded by the recovered bytes.

Residual21 lexical debt +13 unchecked are marked, not declared fixed. Registered811
excludes eight escaped-template spans and includes two basename spans omitted by
the817 diagnostic (8−2=6); legacy710-in-four/1574-in20 uses another dialect.
The extractor is explicitly frozen before outcome. Escaped-span/multiline work
needs versioned fixtures/crosswalk, not a post-result population swap. Other16
legacy notes and historical unbackticked locators remain outside this claim.

| trend | verdict | evidence |
|---|---|---|
| expansion | unchanged | no new admitted knowledge/frontier ground; source-row33 alone is not expansion |
| quality | improved | independently159 old-token gains/0 losses, all467 production open-true retained; explicit remaining debt and narrower semantic wording; not whole-corpus truth |
| discernment | unchanged | sampled source admits/rejects agree and Q18 is grounded, but new outside C2-floor disagreement remains an unlanded lesson for the lane; no self-attested upgrade |

## Routed defects / operator handoff

R38-1 → kumitate next permitted repair: close the direct-entry missing-key/ordinal
floor gap with a stable baseline identity across reviewed token changes. Add a
fixture for baseline-true→unchecked with a new current key while aggregate true
stays above base; show an isolated red-before and a behavioral mutant kill, then
re-capture final direct-entry and frozen evidence. Preserve the fixed baseline
and every C1 gain; do not regenerate a ceiling or alter this closure record.

R38-2 → kumitate/operator: keep build90-vs-Main88 context violation and partial
fresh review disclosed; escaped/multiline population remains versioned deferred
scope, never silently counted as verified. SHONEN remains[~], not fully checkable
because C2 is unresolved; no promotion, mint, marks, source edits or round advancement.
The normal three-consecutive-rejection rule belongs to the parent/operator; this
closure neither evades it nor manufactures anchor harm to trigger it.

## Reproducible plain closure measurement

The following standalone Python block is the independent parser/data-walk used
above, with reproduction plumbing. Execute this block only (or extract the final
Python fenced block from this lesson); it never invokes a lane verdict script.
Source clone path can be changed to any existing repo containing immutable pin31c465f1.
Counts were observed in the closure session; the missing-key result is explicitly a
modeled read-path consequence, not an observed lane-gate exit.

```python
import subprocess, re, json, collections, hashlib, copy
lane='/home/vgpnk/Projects/shokunin/kumitate-shokunin'
src='/fast/scratch/kumitate-r36/src'
opened='753446a829edda519c75777ce95888443f51fa94'
delivered='89ff4a74d92d71575687f407311c82abfac53ff7'
measured='01aab4b0a9756cb0d2ebea0e073a49f50a6d0223'
baseline='e18ff1af3392e3823227644c977c237737fe65c9'
pin='31c465f15669f744848bd9f5d56191c5085670f7'
def git(repo,*args): return subprocess.check_output(['git','-C',repo,*args],text=True)
def blob(rev,path): return git(lane,'show',rev+':'+path)
SPAN=re.compile(r'`([^`\n]+)`')
ANCH=re.compile(r'^([\w./@+-]*[\w-]\.[\w]+)?:(\d+)(?:-(\d+))?$')
PATH=re.compile(r'^[\w./@+-]+\.(?:mjs|cjs|js|ts|json|md|sh|rs|toml|py|service|timer|ya?ml|txt|lock|conf)$')
STOP=re.compile(r'(?:\.\s+(?=[A-Z*`(])|\.\s*$|;\s|:\s*$)')
JOIN=re.compile(r'^[\s,;/()]*(?:(?:and|or)[\s,;/()]*)?$')
def parse(text):
    groups=[]; pending=[]
    for line in text.split('\n'):
        separate=not line.strip() or line.startswith(('#','```')) or line.lstrip().startswith('|')
        if separate:
            if pending: groups.append(' '.join(pending)); pending=[]
            if line.strip(): groups.append(line)
        else: pending.append(line)
    if pending: groups.append(' '.join(pending))
    output=[]; context=None; fenced=False
    for group in groups:
        if group.startswith('```'): fenced=not fenced; continue
        if fenced: continue
        if group.startswith('#'):
            paths=[v for v in SPAN.findall(group) if PATH.fullmatch(v) and '/' in v and not v.startswith('.')]
            if paths: context=paths[0]
        sentences=[]; sentence=[]; previous=0
        for span in SPAN.finditer(group):
            gap=group[previous:span.start()]
            if STOP.search(gap) or (group.lstrip().startswith('|') and '|' in gap):
                if sentence: sentences.append(sentence)
                sentence=[]
            value=span[1]; match=ANCH.fullmatch(value)
            sentence.append(('A' if match else 'P' if PATH.fullmatch(value) else 'S',value,gap,match))
            previous=span.end()
        if sentence: sentences.append(sentence)
        for sentence in sentences:
            symbols=[]; i=0
            while i<len(sentence):
                kind,value,gap,match=sentence[i]
                if kind=='P':
                    if '/' in value and not value.startswith('.'): context=value
                    i+=1; continue
                if kind=='S': symbols.append(value); i+=1; continue
                end=i+1
                while end<len(sentence) and sentence[end][0]=='A' and JOIN.fullmatch(sentence[end][2]): end+=1
                count=end-i; left=symbols[-count:]; following=None
                if len(left)<count: following=next((v for k,v,g,m in sentence[end:] if k=='S'),None)
                paired=[following]*(count-len(left))+left
                for item,token in zip(sentence[i:end],paired):
                    m=item[3]; context=m[1] or context
                    output.append(dict(path=context,a=int(m[2]),b=int(m[3] or m[2]),token=token,raw=item[1],block=group))
                symbols=[]; i=end
    return output
files=git(src,'ls-tree','-r','--name-only',pin).splitlines(); cache={}
def truth(anchor,token=None,dollar=True):
    token=anchor['token'] if token is None else token
    if token is None: return 'unchecked'
    path=anchor['path']
    if not path: return 'dead'
    matches=[p for p in files if p==path] or [p for p in files if p.endswith('/'+path)]
    if len(matches)!=1: return 'dead'
    path=matches[0]
    if path not in cache: cache[path]=git(src,'show',pin+':'+path).split('\n')
    lines=cache[path]; a=anchor['a']; b=anchor['b']
    if not 1<=a<=b<=len(lines): return 'dead'
    token=re.sub(r'\(.*\)$','',token.strip().strip('\"\'')).lstrip('.#-')
    ids=re.findall(r'[A-Za-z_$][\w$]*',token); longest=max(ids,key=len) if ids else token
    word=r'[\w$]' if dollar else r'[\w]'; span='\n'.join(lines[a-1:b])
    return 'true' if any(t and re.search('(?<!'+word+')'+re.escape(t)+'(?!'+word+')',span) for t in [token,longest]) else 'false'

notes=['native-trial-launch','remaining-scripts-census','route-probe-cluster','sighting-wall']
for n in notes:
 path='corpus/knowledge/'+n+'.md'
 rows=[parse(blob(r,path)) for r in [opened,delivered,'0614092','91da27c']]
 assert len(set(map(len,rows)))==1
 count=collections.Counter(anchors=len(rows[0]))
 for o,a,p,r in zip(*rows):
  before=truth(o); after=truth(dict(a,token=o['token']))
  count['before_true']+=before=='true'; count['after_true']+=after=='true'
  count['gains']+=before!='true' and after=='true'; count['losses']+=before=='true' and after!='true'
  listed=(p['a'],p['b'])!=(r['a'],r['b']) and truth(p)!='true' and truth(dict(p,a=r['a'],b=r['b']))=='true'
  count['prior62']+=listed
  count['prior62_corrected']+=listed and truth(dict(a,token=p['token']))=='true'
 print(n,dict(count))
pins={r:json.loads(blob(r,'.ufo/pins/anchor-truth.json')) for r in [baseline,delivered]}
for rev,data in pins.items():
 count=collections.Counter(); bad=[]
 for path,n in data['notes'].items():
  anchors=parse(blob(rev,path)); assert len(anchors)==n['anchors']==len(n['entries'])
  for a,e in zip(anchors,n['entries']):
   assert a['raw']==e['raw']
   status=truth(dict(path=e['path'],a=e['a'],b=e['b'],token=e['token']),dollar=False)
   count['true' if status=='true' else 'unchecked' if status=='unchecked' else 'debt']+=1
   if status!=e['expect'].removeprefix('debt:'): bad.append(e['ord'])
 print('production',rev,dict(count),'mismatches',bad)
changed=[]
for path,n in pins[baseline]['notes'].items():
 for b,a in zip(n['entries'],pins[delivered]['notes'][path]['entries']):
  if b['expect']=='true' and (a['expect']!='true' or any(a[k]!=b[k] for k in ['raw','path','a','b'])): changed.append((path,b['ord']))
print('baseline_true_changes',changed)
frozen=json.loads(blob(delivered,'.ufo/waves/round-38/frozen/expected.json'))
bad=[]
for repo,rev,key in [(lane,measured,'input_digests'),(src,pin,'source_digests')]:
 for path,expected in frozen[key].items():
  raw=subprocess.check_output(['git','-C',repo,'show',rev+':'+path])
  if hashlib.sha256(raw).hexdigest()!=expected: bad.append(path)
print('frozen_digests',len(frozen['input_digests']),len(frozen['source_digests']),'mismatches',bad)
# Independent modeled counterexample to the direct read-path, NOT execution of the lane gate.
current=copy.deepcopy(pins[delivered]); path='corpus/knowledge/remaining-scripts-census.md'
e=current['notes'][path]['entries'][3]
e.update(token=None,expect='unchecked',source='pair',key='closure-r38-missing-base-key')
local=[]; floor=[]
for path,n in current['notes'].items():
 anchors=parse(blob(delivered,path))
 if [(a['raw'],a['path']) for a in anchors]!=[(x['raw'],x['path']) for x in n['entries']]: local.append('ANCHOR_SET_CHANGED')
 for x in n['entries']:
  st=truth(dict(path=x['path'],a=x['a'],b=x['b'],token=x['token']),dollar=False)
  if x['expect']=='true' and st!='true': local.append('REGRESSED')
  if x['expect'].startswith('debt:') and st=='true': local.append('DEBT_STALE')
  if x['expect']=='unchecked' and x['token'] is not None: local.append('REGRESSED')
 base=pins[baseline]['notes'][path]['entries']; now={x['key']:x for x in n['entries']}
 if sum(x['expect'].startswith('debt:') for x in n['entries'])>sum(x['expect'].startswith('debt:') for x in base): floor.append('DEBT_GREW')
 if sum(x['expect']=='true' for x in n['entries'])<sum(x['expect']=='true' for x in base): floor.append('CHECKED_SHRANK')
 for x in base:
  match=now.get(x['key'])
  if x['expect']=='true' and match is not None and match['expect']!='true': floor.append('DEBT_GREW')
print('modeled_changed_entry',e)
print('modeled_local_findings',local,'modeled_floor_findings',floor)
```
