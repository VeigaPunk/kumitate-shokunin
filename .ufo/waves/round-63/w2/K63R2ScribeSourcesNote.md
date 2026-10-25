VERDICT: The Sources & frontier section is drafted with real numbers from committed bytes at `a9531c8` — registry 134→136 (A 111→113, B 15, C 8), two added rows both tier A, zero old→new touches, census-after exit 0, one new PROVINCE band + README Frontier bullet, assimilation record (admit S200/S202→S196/S197, REJECT with flip, collision S195 only, quarantine 9/9) and considerthese idea 3 — all reproduced by the commands below.

## Evidence

Commands (lane `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin`; census script `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`), verbatim:

```
# before (base dfa6fca8, re-derived)
$ git show dfa6fca8:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3} \|'
134
$ git show dfa6fca8:corpus/SOURCES.md | awk '/^## Registry/{f=1} f && /^\| S[0-9]+/{gsub(/^[ \t]*\|[ \t]*/,""); split($0,a,"|"); tier=a[4]; gsub(/^[ \t]+|[ \t]+$/,"",tier); c[tier]++; n++} END{printf "total=%d\n", n; for (t in c) printf "tier %s=%d\n", t, c[t]}' | sort
total=134
tier A=111
tier B=15
tier C=8

# after (integration a9531c8)
$ git show a9531c8:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3} \|'
136
$ git show a9531c8:corpus/SOURCES.md | awk '<same awk>' | sort
total=136
tier A=113
tier B=15
tier C=8

$ git diff --stat dfa6fca8 a9531c8 -- corpus/SOURCES.md
 corpus/SOURCES.md | 2 ++
 1 file changed, 2 insertions(+)
$ git diff dfa6fca8 a9531c8 -- corpus/SOURCES.md | grep '^[+-]| S' | grep -v '^+.*| S19[67] |'
(no output — only S196/S197 added; zero modified rows; S195 context-only)

$ sources-census.sh validate --file …/kumitate-shokunin/corpus/SOURCES.md
file	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
file	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
file	W04	S084 duplicate url infection.github.io/guide across scopes
file	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
file	W04	S123 duplicate url docs.langchain.com/oss/python/langgraph/checkpointers across scopes
file	W04	S126 duplicate url docs.temporal.io/encyclopedia/detecting-activity-failures across scopes
file	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
EXIT=0

$ sources-census.sh census --file …/kumitate-shokunin/corpus/SOURCES.md
file	rows	136
file	tier.A	113
file	tier.B	15
file	tier.C	8
file	status.mined	104
file	status.queued	13
file	status.rejected	19
FLEET	rows	136
FLEET	tier.A	113
FLEET	tier.B	15
FLEET	tier.C	8
FLEET	tier.invalid	0
FLEET	status.queued	13
FLEET	status.mined	104
FLEET	status.rejected	19
FLEET	status.invalid	0
FLEET	missing	0
EXIT=0

$ git diff dfa6fca8 a9531c8 --stat -- PROVINCE.md corpus/README.md corpus/knowledge/multi-agent-coordinator-topologies.md corpus/QUALITY.md
 PROVINCE.md                                        |  1 +
 corpus/QUALITY.md                                  | 46 +++++++++++++
 corpus/README.md                                   |  4 ++
 .../multi-agent-coordinator-topologies.md          | 75 ++++++++++++++++++++++
 4 files changed, 126 insertions(+)

# committed assimilation files
$ wc -l .ufo/waves/round-63/assimilation/{reg-ids,staged-ids,collisions}
134 reg-ids; 155 staged-ids; 1 collisions
$ cat .ufo/waves/round-63/assimilation/collisions
S195
$ wc -l .ufo/waves/round-63/assimilation/quarantine-slice
9
```

Census-before receipt (committed `base/census-before.txt`) matches the re-derivation: six W04 (S034/S068/S084/S095/S123/S126), `ok`, EXIT=0, 134 rows. Wave-1 corroboration: `K63ScoutQuarantine.md:1` — "9/9 PRESENT, 0 ABSENT, 0 UNVERIFIABLE"; `K63ExecCollisionGuard.md:1` — "lane 134 ids, staged 155 ids, collisions = `S195` only".

## Findings

- K63R2ScribeSourcesNote-1 — INFO (calibration): registry +2 rows, both tier A (S196 Bailian docs, S197 arXiv 2512.08296v3 paper); B=15, C=8 unchanged. Copy's claim "134, A=111 B=15 C=8" re-derived exactly at base. Reproduce: awk commands above.
- K63R2ScribeSourcesNote-2 — INFO (calibration): zero old→new row touches (`status`/`recheck`/`used-by`); S195 untouched; diff = 2 insertions only. Reproduce: `git diff dfa6fca8 a9531c8 -- corpus/SOURCES.md`.
- K63R2ScribeSourcesNote-3 — INFO (calibration): census-after exit 0 with the same six W04 ids as before; tool tier histogram (113/15/8) equals the awk re-derivation exactly; statuses sum to 136 (104 mined + 13 queued + 19 rejected). Reproduce: validate + census commands above.
- K63R2ScribeSourcesNote-4 — INFO (calibration): frontier moved on both documents — PROVINCE.md gained exactly one band line (Multi-agent coordinator topology, first entry `multi-agent-coordinator-topologies.md`, round 63, S196/S197) and corpus/README.md §Frontier gained its matching bullet (corpus/README.md:280+); entry opens with `source:`/`verified-at: 2026-10-25`/`recheck:` and both rows' `used-by` cells name it. Reproduce: `git diff dfa6fca8 a9531c8 -- PROVINCE.md corpus/README.md`.
- K63R2ScribeSourcesNote-5 — INFO (calibration): assimilation record holds — admit S200/S202→S196/S197; REJECT `omp-advisor-and-mcp-transports.md` with flip (citation S104 misnames RFC 8785); carried REJECT `exactly-once-attribution.md` (S134 duplicate); collision guard: reg 134 / staged 155 / collisions = S195 only, not appended (S125 holds it); quarantine slice 9 rows, w1 9/9 PRESENT, none appended. Reproduce: `cat .ufo/waves/round-63/assimilation/{collisions,quarantine-slice}`.
- K63R2ScribeSourcesNote-6 — INFO (calibration): considerthese idea 3 ("Audit seat deaths") landed as C1's dead-seat arm (transcript-derived dead set, `--report` naming, QUALITY Q54/Q59), adapted from the proposed `launcher-progress.tsv` parser because run-7 waves spawn inline. Reproduce: `grep -n 'dead-seat\|Q54\|Q59' scripts/inline-dispatch-evidence.mjs corpus/QUALITY.md`.

No frozen counter or control found wrong; no claim attacked — this seat calibrates the Sources & frontier facts so the round report can paste real numbers.

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-63/build/K63R2ScribeSourcesNote/sources-and-frontier.md` — the drafted "Sources & frontier" section with commands + verbatim outputs.

## Limits

- Did not re-run live-fetch quote verification (K63ReviewQuotes / K63ScribeEntryDraftB wave-1 work) or the I63/T63 counters (other seats' assignments).
- `sources-census.sh validate` was run with `--file` on the lane's SOURCES.md; not `--root` fleet-wide, and the before-receipt's `kumitate` lane prefix vs the after run's `file` prefix differ in label only (same validation semantics, exit 0).
- Worktree vs `a9531c8` checked only for corpus/SOURCES.md, PROVINCE.md, corpus/README.md (no diff); other files may move as the L1 keeps integrating.
