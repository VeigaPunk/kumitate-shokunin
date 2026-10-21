CITE-PROVENANCE regressed=182 files=83 errors=30 src-rev=31c465f15669

Scout, read-only. Disposition of round-35 spotcheck routed defects 2 (two comparison
outputs asserted without committed evidence) and 4 (`final/cite.txt` named the moving
checkout). No lane file edited; no tool installed. Pin clone `/fast/scratch/kumitate-r36/src`
is `dr-xr-xr-x`, HEAD `31c465f15669f744848bd9f5d56191c5085670f7`, `git status --porcelain`
→ 0 lines. Base `964f443e` exists there (`git cat-file -t` → `commit`) and is an ancestor
of the pin (`git merge-base --is-ancestor 964f443e 31c465f1…` → exit 0).
Verdict-line scope: `regressed` = S-layer sweep regressions at the pin vs 964f443e on the
round-35 final notes (master-notes baseline 223); `files`/`errors` = docs scanned and the
claim-subject S8 per-file error count for the pinned cite run on the round-35 final tree
(`4c9e407`); that run's full totals are errors=447 warnings=445 (see §b).

## (a1) Repo-wide fidelity comparison — reproduced exactly: 223 → 182

Sweep source: the round-35 prototype `/fast/scratch/kumitate-r35/w/ExecFidelitySweep/fidelity.mjs`
(committed nowhere), run with its source repo repointed to the round-36 pin. Section/anchor/
symbol/line-hit logic unchanged; only the TSV write is redirected to `/dev/null`.
```
sed -e 's#/fast/scratch/kumitate-r35/src#/fast/scratch/kumitate-r36/src#' \
    -e 's#/fast/scratch/kumitate-r35/w/ExecFidelitySweep/anchors.tsv#/dev/null#' \
    /fast/scratch/kumitate-r35/w/ExecFidelitySweep/fidelity.mjs > /tmp/fidelity-r36-final.mjs
node /tmp/fidelity-r36-final.mjs | head -4
S anchors=1351 hit964=467 hit31c=443 regressed=182 never-hit=726 unpaired=209
R anchors=238 hit964=45 hit31c=48 regressed=1 never-hit=189 unpaired=33
NOTES 40
ROWS 1589
```
Master baseline — same script, notes tree = lane master clone at `1770305` (§a2 clone),
`const repo` repointed:
```
sed -e 's#/fast/scratch/kumitate-r35/src#/fast/scratch/kumitate-r36/src#' \
    -e 's#/fast/scratch/kumitate-r35/w/ExecFidelitySweep/anchors.tsv#/dev/null#' \
    -e 's#^const repo = ".*";#const repo = "/tmp/citeprov.mclone";#' \
    /fast/scratch/kumitate-r35/w/ExecFidelitySweep/fidelity.mjs > /tmp/fidelity-r36-master.mjs
node /tmp/fidelity-r36-master.mjs | head -4
S anchors=1311 hit964=422 hit31c=208 regressed=223 never-hit=880 unpaired=177
R anchors=236 hit964=46 hit31c=47 regressed=2 never-hit=187 unpaired=32
NOTES 40
ROWS 1547
```
Both values reproduce: 223 (also the committed baseline `.ufo/waves/round-35/build/
ExecFidelitySweep.md:1`) → 182 (`LOG.md:1651`). Cross-check: the retained round-35 TSV
(`/fast/scratch/kumitate-r35/w/ExecFidelitySweep/anchors.tsv`, 1589 rows) counts S
anchors=1351 hit964=467 hit31c=443 regressed=182, R regressed=1. Caveat [observed]:
the sweeps are different note populations (1547 → 1589 rows; S hit964 422 → 467), so
223 → 182 is a net regression count over an edited corpus, not a fixed-cohort before/after.

## (a2) Per-file cite-check on a master clone — reproduced exactly: 91 → 30, none rose

Full git clones are required; an archive-only tree cannot resolve lane commits (reads 98
for S8 and falsely shows README +1 via `REV_UNKNOWN a5683a9`).
```
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
git clone --no-hardlinks --quiet "$LANE" /tmp/citeprov.mclone && git -C /tmp/citeprov.mclone checkout -q --detach 1770305
git clone --no-hardlinks --quiet "$LANE" /tmp/citeprov.fclone && git -C /tmp/citeprov.fclone checkout -q --detach 4c9e407
cd "$LANE"
node scripts/cite-check.mjs --src /fast/scratch/kumitate-r36/src --self /tmp/citeprov.mclone --fleet /home/vgpnk/Projects/shokunin --json > /tmp/citeprov.mclone.json
node scripts/cite-check.mjs --src /fast/scratch/kumitate-r36/src --self /tmp/citeprov.fclone --fleet /home/vgpnk/Projects/shokunin --json > /tmp/citeprov.fclone.json
```
Per-file error counts from the two JSONs (`files[].findings` filtered `severity==="error"`),
for the 21 docs edited by round 35 (`git diff --name-only 1770305 4c9e407 | grep -E
'^(SKILL\.md|corpus/.*\.md)$'`):
```
delta=0 (19 files, master→final): executable-scorecard 0→0, failure-telemetry 0→0,
kimi-mcp-plane 0→0, live-surface-probe 14→14, member-claims-gate 0→0, native-trial-launch
27→27, ops-watchers 8→8, queue-and-claim 10→10, route-probe-cluster 37→37,
route-resolution 0→0, sighting-wall 25→25, singleton-and-queue-ownership 0→0,
successor-chain 0→0, swarm-wave-lifecycle 0→0, lessons/round-35 0→0, QUALITY 0→0,
README 23→23, SOURCES 0→0, SKILL 8→8
delta=-61 corpus/knowledge/remaining-scripts-census.md 91→30
delta=-1  corpus/knowledge/runtime-remainder-census.md 10→9
edited_docs=21 rose=0 fell=2
TOTALS master files=82 errors=509 warns=445 | final files=83 errors=447 warns=445
```
Both report assertions reproduce exactly: S8 “91 (master clone) → 30” and “no edited file
rose” (rose=0). Defect 2's measurements are TRUE; only their committed output was missing.

## (b) What final/cite.txt named, and the pinned replacement

`.ufo/waves/round-35/final/cite.txt:1-4`:
```
$ node scripts/cite-check.mjs
# run 2026-10-20T23:34:29-03:00 src-pin=31c465f15669f744848bd9f5d56191c5085670f7
kumitate cite-check — kumitate-cite-check-v1
src=/home/vgpnk/Projects/ufo-fsd-alpha (index 1212 files)
```
Observed: the script's own header names the operator's moving checkout, not the pin. The
`src-pin=` token was prepended by the wave harness — `grep -rn "src-pin" scripts/` has no
hits and `grep -rn "src-pin" /home/vgpnk/Projects/shokunin/scripts` is empty; the script
prints only `src=<dir> (index N files)`. The named tree's cite index is 1212 files vs 1103
at `/fast/scratch/kumitate-r36/src`, so the pin token was declarative, not derived from the
bytes read (defect 4 confirmed). That run: files=83 tokens=8438 errors=418 warnings=445,
`CITE_CHECK: DRIFT`, exit 1.

Exact pinned command, claim-supporting per-file figure with the revision printed (live lane
tree; 84 docs now because round 35's verifier note landed after the round):
```
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin
SRC=/fast/scratch/kumitate-r36/src
printf 'src-rev=%s\n' "$(git -C "$SRC" rev-parse HEAD)"
node scripts/cite-check.mjs --src "$SRC" --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s);const f=r.files.find(x=>x.file==="corpus/knowledge/remaining-scripts-census.md");console.log(`CITE_PIN files=${r.totals.filesScanned} errors=${r.totals.error} warnings=${r.totals.warn} verdict=${r.verdict} s8_errors=${f.findings.filter(x=>x.severity==="error").length} src=${r.src}`);})'
src-rev=31c465f15669f744848bd9f5d56191c5085670f7
CITE_PIN files=84 errors=467 warnings=447 verdict=FAIL s8_errors=30 src=/fast/scratch/kumitate-r36/src
```
Exact round-35 final tree (83 docs; the committed-evidence replacement):
```
SRC=/fast/scratch/kumitate-r36/src; LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin; TMP=$(mktemp -d)
git clone --no-hardlinks --quiet "$LANE" "$TMP/self" && git -C "$TMP/self" checkout -q --detach 4c9e407
printf 'src-rev=%s\n' "$(git -C "$SRC" rev-parse HEAD)"
node "$LANE/scripts/cite-check.mjs" --src "$SRC" --self "$TMP/self" --fleet /home/vgpnk/Projects/shokunin --json | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{const r=JSON.parse(s);const f=r.files.find(x=>x.file==="corpus/knowledge/remaining-scripts-census.md");console.log(`CITE_PIN_4c9e407 files=${r.totals.filesScanned} errors=${r.totals.error} warnings=${r.totals.warn} verdict=${r.verdict} s8_errors=${f.findings.filter(x=>x.severity==="error").length} src=${r.src}`);})'
rm -rf "$TMP"
src-rev=31c465f15669f744848bd9f5d56191c5085670f7
CITE_PIN_4c9e407 files=83 errors=447 warnings=445 verdict=FAIL s8_errors=30 src=/fast/scratch/kumitate-r36/src
```
S8=30 is identical under the round-35 final tree, the live lane tree and the moving-checkout
run, so the claim survives re-pinning; the full-run total moves 418 → 447 because the source
tree changed — exactly why a verdict must name the revision it read.

## Disposition

- Defect 2: both claims are TRUE and reproducible; the missing artifact was the counting
  output. To commit: land this report and copy the prototype sweep to
  `.ufo/waves/round-36/build/fidelity-sweep.mjs` (scratch-only today); the cite runs are the
  pure commands above.
- Defect 4: confirmed. `final/cite.txt` read `/home/vgpnk/Projects/ufo-fsd-alpha` (index 1212)
  while carrying `src-pin=31c465f1…`; the pinned command reads only the read-only clone and
  prints `src-rev=31c465f15669…`.
- `scripts/cite-check.mjs` has no `--pin`; unlike claims/proxy/surface it cannot self-verify
  the pin, so the `printf src-rev` wrapper is required. [INFERENCE] A later `--pin` parity arm
  would remove the wrapper.
- Temp state removed after the runs (`/tmp/citeprov.*`, `/tmp/fidelity-r36-*.mjs`); the only
  lane write is this report. No builds/lint/tests, no installs.
- Unresolved: exact revision of the operator checkout (not read; the pin contract forbids
  using it as `--src`). The 91 baseline depends on a real clone with `.git` and the live fleet
  context; an archive-only tree reads 98 and a false README +1.
