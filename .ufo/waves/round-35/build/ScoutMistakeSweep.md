SWEEP new_classes=8

# Round-35 frontier step 3 — mistake classes absent from `corpus/lessons/round-34.md` `## Mistakes`

Read-only scout. Sources swept: `LOG.md` (last 300 lines), `SCORECARD.md`, `corpus/lessons/round-3*.md`,
`corpus/lessons/round-34-verifier-spotcheck.md`, `.ufo/reports/round-34/kumitate.md`, plus the lane's
own gates re-run as measurement. Baseline class set = the 14 rows at `corpus/lessons/round-34.md:9-22`.
No tool installs. Nothing written outside this file.

## New classes

### N1 — Out-of-lane corpus write lands unregistered and moves the term it verifies (C2 77→78)
Evidence: `a5683a9` (author/committer `protocol-shokunin <protocol@shokunin.local>`) adds exactly
`corpus/lessons/round-34-verifier-spotcheck.md` (17 insertions, `git show --stat a5683a9`). It has no
`corpus/README.md` map row and no `## Gate` section (`grep -c '^## Gate'` → 0).
```
$ LC_ALL=C comm -13 <(grep -o '`\(knowledge\|lessons\)/[^`]*\.md`' corpus/README.md | tr -d '`' | LC_ALL=C sort -u) <(find corpus/knowledge corpus/lessons -name '*.md' | sed 's|^corpus/||' | LC_ALL=C sort)
lessons/round-34-verifier-spotcheck.md
$ grep -c '^| `\(knowledge\|lessons\)/' corpus/README.md   → 77
$ find corpus/knowledge corpus/lessons -name '*.md' | wc -l → 78
$ node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src
PROXY: DRIFT (... C2_TOTAL_DRIFT term=C2_total declared=77 computed=78 delta=+1; ...)
```
So the non-author verification artifact itself is the live C2 drift. Gate coverage also fell:
`grep -rL '^## Gate' corpus/lessons | wc -l` → 22 of 38 (was 21 of 36 at round 34).
Nearest listed class: "Unadopted contract surfaces" is about a lane file missing `## Gate`; N1 is the
write-scope element — an outside author adds corpus content with no map row and no gate runs against it
until the L1 recomputes the proxy two commits later.

### N2 — The wave's own scratch tool enters the measured universe (A observer effect; frozen baseline not reproducible)
```
$ find . -path ./.git -prune -o -type f \( -name '*.mjs' -o -name '*.js' -o -name '*.sh' -o -name '*.py' \) -print | sort
./scripts/{cite-check,claims-check,kimi-census,proxy-check,round-gate,sources-check,surface-probe}.mjs
./.ufo/waves/round-35/baseline/distinct-probe.mjs        ← 8th, untracked
$ git status --porcelain → ?? .ufo/waves/
scripts/proxy-check.mjs:323  const RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/;
scripts/proxy-check.mjs:746  const A = walkFiles(self).filter((r) => RE_RUNNABLE.test(r)).length;
```
`SCORECARD.md:25` defines A as scripts "with a documented invocation that exits with a verdict"; the
probe has none, yet it counts. The frozen baseline `…/baseline/proxy.txt` (run 21:11:12, before the
probe existed) reads A computed 7 with no `A_DRIFT`; the same command now reads
`A_DRIFT term=A declared=7 computed=8 delta=+1`. The baseline command for `distinct.txt` is
`node /tmp/kr35-distinct.mjs`; the in-tree copy is what moves A — measuring changed the measurement.
Nearest listed class: "Substrate mutation under observation" is an external config flip; N2 is
self-inflicted by the round's own tooling and lands on a frozen term.

### N3 — Pointer translation table is asserted, not measured (wrong at its own commit and at HEAD)
`corpus/lessons/round-34.md:5-6` claims SCORECARD lines after :300 shift "by +1 to +22" at the round-34
commit. Measured per pointer (`git show 16a5441:SCORECARD.md` line → same text located in
`1a8eed5:SCORECARD.md` / live `SCORECARD.md`):
```
base :307  → 1a8eed5 :308  (+1)    HEAD :308  (+1)
base :378  → 1a8eed5 :388  (+10)   HEAD :395  (+17)
base :401  → 1a8eed5 :411  (+10)   HEAD :418  (+17)
base :458  → 1a8eed5 :487  (+29)   HEAD :494  (+36)
base :913  → 1a8eed5 :942  (+29)   HEAD :949  (+36)
base :1197 → 1a8eed5 :1226 (+29)   HEAD :1233 (+36)
base :1208 → 1a8eed5 :1237 (+29)   HEAD :1244 (+36)
```
At HEAD `SCORECARD.md:1197` now reads "round 16**: the successors now have derived terms…", i.e. the
row's `SCORECARD.md:1197-1208` (recalled-count rule) mispoints; the rule lives at `:1243-1244`.
Nearest listed class: "Stale prose in historical rows" is about stale numbers, "Dead pointers" about
literal stale paths; N3 is a *translation scheme* whose range was never re-derived after later commits.

### N4 — Two different revisions are both called "the round"
`corpus/lessons/round-34-verifier-spotcheck.md:5` says verification ran "after the round landed at
`d933e15e2`". `.ufo/reports/round-34/kumitate.md:3` says "Round commit: `1a8eed5`". `d933e15` is a
later integrator commit ("record verified source-gate direct-file boundary", SCORECARD 1-line change),
not the round's work commit.
```
$ grep -n 'd933e15\|1a8eed5\|a5683a9' LOG.md SCORECARD.md corpus/README.md   → (no output; exit 1)
```
No lane record names either revision, so a reader cannot tell which tree the admit/reject samples were
reproduced on. Nearest listed classes: "Revision skew unpinned" (origin-tree claims) and
"Admission-status ambiguity" (missing LOG entry); N4 is a verification record whose subject revision is
ambiguous between two commits of the same repo.

### N5 — Machine-assembled adjudication lost token boundaries and carries no gate line
`corpus/lessons/round-34-verifier-spotcheck.md:17`:
```
ADMIT bounded claims: operability fraction improved with8held; Kimi computed9→10 within frozen50members;
source gate direct-file scope only. Expansion improved by2newnotes; qualityunchanged; discernmentimproved…
```
7 glued tokens (`at0acb775` on :12 plus `with8held`, `computed9→10`, `frozen50members`, `by2newnotes`,
`qualityunchanged`, `discernmentimproved`). In the file that records the only non-author verdict:
```
$ grep -c '^```' corpus/lessons/round-34-verifier-spotcheck.md → 0
$ grep -cE '^\s*(node|git|bash) ' corpus/lessons/round-34-verifier-spotcheck.md → 0
```
The five trend verdicts at `.ufo/reports/round-34/kumitate.md:79-83` rest on this text, which cannot be
quoted or re-run. No listed class covers record corruption.

### N6 — PII in a durable fleet evidence artifact, routed but unowned
`.ufo/reports/round-34/kumitate.md:95` names
`fleet-ledger/.ufo/waves/kaika-w1/kumitate-state.md:52` as printing the operator's personal email in the
commit-author histogram, and dispositions it as "Consider redacting". Verified (email masked here):
```
$ sed -n '52p' .ufo/waves/kaika-w1/kumitate-state.md | sed -E 's/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+/<EMAIL-REDACTED>/g'
- **M3 — Attribution/identity defects (live).** Commit-author histogram: `git log --format='%ae' | sort | uniq -c`
  → 26 `<EMAIL-REDACTED>`, **16 `<EMAIL-REDACTED>`**, **25 `<EMAIL-REDACTED>`** (operator personal identity), 6 …
```
No owner, no round, no gate. Nearest listed class: "Attribution / identity defect" is commits carrying
the wrong identity; N6 is identity *leaking into* an artifact that is read as evidence.

### N7 — Layout-coupled default: the fix for the stale absolute path assumes the canonical checkout
```
$ sed -n '142,143p' scripts/round-gate.mjs
const DEFAULT_MAIN_REPO = resolve(HERE, '..', '..');
const DEFAULT_REPORTS_DIR = join(DEFAULT_MAIN_REPO, '.ufo', 'reports');
$ node -e "console.log(require('path').resolve('/home/vgpnk/Projects/shokunin/.tower/worktrees/kaika/kumitate-shokunin/scripts','..','..'))"
/home/vgpnk/Projects/shokunin/.tower/worktrees/kaika
```
That directory has no `.ufo/reports`, so the audit fails closed `REPORTS_DIR_MISSING` in the worktree the
round actually ran in (`.ufo/reports/round-34/kumitate.md:93`, "Lane-owned defect, queued"). The
checklist item "round-close artifact audit" therefore needs undocumented flags there. Nearest listed
class: "Dead pointers (/tmp, lowercase projects/)" is a literal old path; N7 is the round-17 repair
(`DEFAULT_MAIN_REPO = resolve(HERE,'..','..')`) re-creating the same failure in relative form.

### N8 — Fixture pinned to a content hash no live file produces: no doc-only route to green
`corpus/lessons/round-30.md:26-27`: the F3 integration case "hardcoded token `44a3c781`, which no live
file hashes to — **no doc-only route existed**"; the parent had to re-token the case to `ba5e02be`
(intent preserved) to reach `--integrations` 9/9, and de-pinned round-7.md's live `44a3c781` at :31.
Nearest listed class: "Gate blind spot / cheapest fake pass" is a false green; N8 is an immovable false
red whose only repair crosses the doc/check boundary. Not in the table.

## Checked and deliberately NOT counted (already in the table)

- Two-space-indented SOURCES row + `reflip:` false acceptance (round-34 post-review) → "Gate blind spot /
  cheapest fake pass"; recorded, not new.
- Origin drift 964f443→31c465f1 lowering script-layer 10→9 → `## Limits`/LOG, not a `## Mistakes` class.
- `comm` without `LC_ALL=C` printing `file is not in sorted order` (reproduced in this sweep) → already
  `## Limits` round-15 "collated diff is not a comparison" note.
- Saturation pointer 1613→1620, seats skipping assigned verification, relay displacing finals,
  registry-change-in-measuring-round → all four already rows `:20-22` and the pointer rows.

## Remaining unknowns

- `d933e15`'s SCORECARD one-line change was not diffed against `a5683a9` content; whether it repaired the
  same boundary the spot-check claims to have verified is [INFERENCE] from its message alone.
- The tower worktree `.tower/worktrees/kaika` no longer exists, so N7's `REPORTS_DIR_MISSING` is taken
  from the lane report line 93 plus the deterministic path resolution above, not re-observed live.
- `node scripts/proxy-check.mjs` exit code for the DRIFT above was not captured separately (the piped
  run ends in `tail`); the identical DRIFT in `…/baseline/proxy.txt` records `exit=1`.
