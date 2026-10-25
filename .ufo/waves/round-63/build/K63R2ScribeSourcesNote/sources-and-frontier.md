# Sources & frontier

Measured at integration revision `a9531c8e617338fd16cb69c61344ef8f17711117` (branch master; worktree equals
it for `corpus/SOURCES.md`, `PROVINCE.md`, `corpus/README.md` — `git diff a9531c8 --` on those files is
empty). Base `dfa6fca8f362e9c962f5b940025a2619380b759b`. Every count below was re-derived from committed
bytes by the commands shown; no report figure was copied.

## Registry: before → after

Before (base commit `dfa6fca8`, re-derived; receipt `base/census-before.txt` EXIT=0, six W04 warnings):

```
$ git -C kumitate-shokunin show dfa6fca8:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3} \|'
134
$ git -C kumitate-shokunin show dfa6fca8:corpus/SOURCES.md | awk '/^## Registry/{f=1} f && /^\| S[0-9]+/{gsub(/^[ \t]*\|[ \t]*/,""); split($0,a,"|"); tier=a[4]; gsub(/^[ \t]+|[ \t]+$/,"",tier); c[tier]++; n++} END{printf "total=%d\n", n; for (t in c) printf "tier %s=%d\n", t, c[t]}' | sort
total=134
tier A=111
tier B=15
tier C=8
```

After (integration `a9531c8`):

```
$ git -C kumitate-shokunin show a9531c8:corpus/SOURCES.md | grep -cE '^\| S[0-9]{3} \|'
136
$ git -C kumitate-shokunin show a9531c8:corpus/SOURCES.md | awk '/^## Registry/{f=1} f && /^\| S[0-9]+/{gsub(/^[ \t]*\|[ \t]*/,""); split($0,a,"|"); tier=a[4]; gsub(/^[ \t]+|[ \t]+$/,"",tier); c[tier]++; n++} END{printf "total=%d\n", n; for (t in c) printf "tier %s=%d\n", t, c[t]}' | sort
total=136
tier A=113
tier B=15
tier C=8
```

**Rows added by tier: +2 total, both tier A** — `S196` (Alibaba Cloud Bailian managed-agent coordinator
contract, docs, `https://docs.bailian.console.aliyun.com/zh/model-studio/managed-agents-multiagent.md`) and
`S197` (Kim et al., arXiv 2512.08296v3, paper, `https://arxiv.org/html/2512.08296v3`). No tier-B/C rows added.

**Rows touched old→new: none.** `git diff dfa6fca8 a9531c8 -- corpus/SOURCES.md` = 2 insertions, 0
deletions, 0 modifications; `S195` appears only as diff context (unmodified). No `status`/`recheck`/`used-by`
cell of an existing row changed.

**Census validate after** (worktree == committed bytes):

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
file	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
file	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
file	W04	S084 duplicate url infection.github.io/guide across scopes
file	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
file	W04	S123 duplicate url docs.langchain.com/oss/python/langgraph/checkpointers across scopes
file	W04	S126 duplicate url docs.temporal.io/encyclopedia/detecting-activity-failures across scopes
file	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
EXIT=0
```

Same six W04 warning ids as the base receipt; exit 0.

**Census mode after:**

```
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh census --file /home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
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
```

The tool's tier histogram (113/15/8) equals the awk re-derivation exactly; 104+13+19 = 136.

## Frontier

`PROVINCE.md` gained exactly one band line (`git diff dfa6fca8 a9531c8 -- PROVINCE.md` = +1):

> **Multi-agent coordinator topology — orchestration topology **decisions** (how a wave's seats are arranged:
> which topology, what a coordinator may delegate, what the arrangement costs), not agent evaluation — first
> entry `corpus/knowledge/multi-agent-coordinator-topologies.md` (round 63, S196/S197): a vendor's managed-agent
> coordinator contract beside the measured scaling study of agent-system topologies, version-pinned to arXiv
> 2512.08296 v3; adjacent, not absorbed: kengaku evaluates agents, this lane arranges the seats around that
> judgment; recursion, nested rosters and cost per topology stay unspecified by both sources. (PROVINCE.md §Frontier)

`corpus/README.md` gained the matching §Frontier bullet (+4 lines in the file diff):

> **Multi-agent coordinator topology (how a wave's seats are arranged):** first entry
> `knowledge/multi-agent-coordinator-topologies.md` (S196/S197); the coordinator contract and the measured
> scaling study are mapped to seat arrangement, with kengaku's agent evaluation as the adjacent, not absorbed,
> half; nested rosters and per-topology cost stay open. (corpus/README.md:280+)

Entry `corpus/knowledge/multi-agent-coordinator-topologies.md` (75 lines at `a9531c8`) opens with `source:
S196 — …`, `source: S197 — …`, `verified-at: 2026-10-25`, `recheck: 90d — …`; both registry rows S196/S197
carry `used-by` cells naming the entry.

## Assimilation record

- **Theme** (one-theme round): coordinator topology from `merge/kumitate/`.
- **Admitted entry:** `multi-agent-coordinator-topologies.md` (staged rows S200/S202 → lane S196/S197).
- **REJECT with flip:** `omp-advisor-and-mcp-transports.md` (staged S209/S210) — headline citation `S104`
  names RFC 8785, a different document from the MCP architecture row; all 67 staged files read
  `ENTRY_HEADER_REQUIRED` under `sources-check.mjs`. Flip: re-point the citation to the lane row holding the
  MCP architecture document (S125) or a new row opened in-round.
- **Carried REJECT:** `exactly-once-attribution.md` (arXiv 2609.29095) — duplicate-document scope; lane S134
  already holds that document.
- **Id collision guard** (committed, frozen `b38a2065`, `.ufo/waves/round-63/assimilation/`): `reg-ids`
  = 134 lines, `staged-ids` = 155 lines, `comm -12 <(sort reg-ids) <(sort staged-ids)` → collisions =
  `S195` only. Package S195 (MCP Architecture overview) NOT appended: lane S125 already holds that document.
- **Renumber map:** package `S200` → lane `S196`, package `S202` → lane `S197` (both ids free at freeze:
  `grep -cE '^\| S19[67] \|' corpus/SOURCES.md` → 0).
- **Quarantine slice** (`assimilation/quarantine-slice`, 9 rows): S109/S116/S118/S129/S142 `payload-absent`;
  S143/S144/S145/S178 "the cited source could not be fetched…". Wave-1 `K63ScoutQuarantine` verdict: **9/9
  PRESENT, 0 ABSENT, 0 UNVERIFIABLE**; the five `payload-absent` labels are checker artefacts (S116 = arXiv
  2512.08296 present only in v3); none of the nine is appended — S196/S197 cite documents this round opened
  itself.

## considerthese

Proposal taken: idea 3 of `considerthese/2026-10-25.md` — "**Audit seat deaths.** Parse each round's
`launcher-progress.tsv` for non-zero exits and null sessions, and list any dead seat the report does not name."
Implemented as C1's dead-seat arm, not a standalone parser: run-7 waves spawn inline (no
`launcher-progress.tsv`), so the dead set is derived from host session transcripts; `--report` must name every
dead seat (`DEAD_UNNAMED:<seat>`); verdict line prints `dead=<n>`; criteria QUALITY Q54/Q59.
