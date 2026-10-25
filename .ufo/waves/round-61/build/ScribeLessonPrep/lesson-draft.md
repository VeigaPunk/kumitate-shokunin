# Round 61 — lesson (DRAFT, sections: census, claims, gate, assimilation)

author: kumitate-shokunin — draft by seat ScribeLessonPrep (round 61, w1)
base: `c2721f812cebd97ab67a1dd8cd8492a193f82d42` (read at lane HEAD `be4a820`)
access date for every source opened this round: 2026-10-25
plan: `.ufo/waves/round-61/plan.md` (frozen before any data seat scored)

Draft status: every number names its receipt. A number whose receipt is not committed in the
lane is marked **uncommitted**, and the integrator must commit the receipt or drop the number.
Round-close values are not measured yet and are left as blanks to re-derive.

**Both frozen claims fail as declared this round** (§Claims). Nothing in this lesson may be
written as a held capability.

## Census before → after

Before (round open; committed receipt `.ufo/waves/round-61/base/census-before.txt`, tracked since
`c2721f8`):

```
== census validate (round open) ==
kumitate	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
kumitate	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
kumitate	W04	S084 duplicate url infection.github.io/guide across scopes
kumitate	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
kumitate	W04	S123 duplicate url docs.langchain.com/oss/python/langgraph/checkpointers across scopes
kumitate	W04	S126 duplicate url docs.temporal.io/encyclopedia/detecting-activity-failures across scopes
kumitate	ok	/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/SOURCES.md
exit=0
```

That is exit 0 with **six W04** warnings: round 60's five plus the S117/S126 group pinned in round
60. The S126 line is that group.

`TIER61-before: A=110 B=15 C=8 rows=133`. This is re-derived from the committed registry with
round 60's histogram (`awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {t=$5; …}'`) at
both `c2721f8` and `be4a820`, and both give the same line. That matches the frozen plan's
"registry 133 rows (A=110 B=15 C=8)" and round 60's `TIER60` after-line.

After: re-derive at the measured revision with the same `awk` and with
`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`. Commit the
transcript under `.ufo/waves/round-61/close/`. No after-value is predicted here.

What the working tree shows at about 09:55Z (**not** the measured revision) is recorded only so
the integrator can recognise it: S195 is appended at `corpus/SOURCES.md:147` (uncommitted, ` M`),
the entry file `corpus/knowledge/temporal-worker-versioning-pinning.md` is untracked, and
`corpus/README.md`, `.ufo/pins/readme-map.json` and `.ufo/pins/source-captures.json` are modified
and uncommitted. On that tree the
round-60 `awk` gives `rows=134 A=111 B=15 C=8`, and `node scripts/sources-check.mjs` gives
`SOURCES_CHECK: CLEAN (rows=134 tiers=A:111,B:15,C:8 …)`. At committed HEAD `be4a820` the same
check reads `SOURCES_CHECK: CLEAN (rows=133 tiers=A:110,B:15,C:8 status=queued:13,mined:101,
rejected:19 entries_with_source=18 legacy=38)`. Neither line is the after-line until it is
re-derived from the committed revision.

Proxy at open (committed receipt `base/proxy-before.txt`, exit 1):
`PROXY: DRIFT (A_DRIFT … declared=105 computed=107 delta=+2; C2_TOTAL_DRIFT … declared=145
computed=146 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)`.
The repair and the after-line belong to the README-map and proxy seats. This section quotes the
before-line only.

## Claims: both fail as declared

### C1 `DISPATCH61_HELD` — falsified by a do-nothing control

Receipt: `w1/CritControlC1.md`, controls `controls/ctl-c1-critic-*.txt`.

The critic built a scratch lane where **no seat ran and no dispatch record existed**: 32 one-line
report files, a hand-written `launcher-progress.tsv` with invented session ids, a hand-written
`dispatch-actual.json`, a SCORECARD row and a tip receipt. On that lane the frozen predicate reads
`held=4/4 checks=4` exit 0. Two assigned controls also pass when they should not:

- **A1b** — fabricated registry, fabricated progress ids, 32 reports with one line of text each:
  `DISPATCH_EVIDENCE: CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)` exit 0. The only
  barrier is `statSync(reportPath).size > 0` (`scripts/dispatch-evidence.mjs:120`).
- **A2c** — the same fixture with one non-null `agentId` and `sessionIds` self-declared 32:
  `CLEAN` exit 0. `NOT_A_DISPATCH` is an all-tokens-absent test
  (`dispatch-evidence.mjs:134`), so one invented id in 32 defeats it.

So the predicate proves internal consistency, not that a dispatch happened. As declared
("a capability acquisition"), C1 **fails**.

Two sibling findings sharpen the same gap. They do not change the verdict:
- `w1/MutDispatchGate.md`: 4/8 single-site mutants survive, and each survivor is a proven
  selftest coverage gap. M2b is the important one: a zero-byte report is credited, and the
  selftest never writes an empty report.
- `w1/RevGateSchema.md`: the record-producing tool (`make-dispatch-actual.mjs`) never turns
  `status:"completed"` into `exit`, so 32 real completed seats can be recorded `dead=32`
  (HIGH finding 1). The gate keeps `REPORT_ABSENT`/`NOT_A_DISPATCH` checks that a self-consistent
  fabricated record passes.

No v1 rule was edited after seats scored. The counts stand as the rules read them.

Round-60's dead-seat table is now complete and **uncommitted**
(`.ufo/waves/round-60/close/dead-seats-r60.md`, 115 lines, sha256
`c52532f37d5def6edb8f6e29a48deebc54a0ca6a847648e50527d7248881c4fb`). It records 32 seats, `exit=0`
for 5 and `exit=-9` for 27, and every `-9` is the launcher's own `SEAT_TIMEOUT = 420` kill
(`launcher.py.txt:16,65-66`). The same pattern is what a dispatch record must survive: a dead
seat is named and uncredited, never counted as a completed one.

### C2 `DOCTRINE61_HELD` — the probe cannot measure the claim

Base receipt `base/doctrine61-base.txt`:
`DOCTRINE61: DOCTRINE61_UNMET held=1/6 checks=6 rev=c2721f812ce… rule=D61`, with only E5 PASS.

The probe's own code makes E3 and E4 unable to pass at any revision
(`.ufo/waves/round-61/probe/doctrine61-probe.mjs`, tracked; findings F1 and F4 in
`w1/ScribeSourcesRows.md`, reproduced by this seat):

- **The row lookup never matches.** E3 and E4 find the row with
  `/^\|[[:space:]]*S195[[:space:]]*\|/`. JavaScript has no POSIX classes, so `[[:space:]]` is
  the literal set `[:space` followed by `]*`. On `row-S195.txt` that regex returns `false`, while
  `/^\|\s*S195\s*\|/` returns `true`.
- **E3 reads the wrong cells.** It reads `c[9]`, `c[10]` and `c[12]`, but status, opened and
  used-by sit at `c[8]`, `c[9]` and `c[11]`.
- **E4 hashes the working tree.** E4 reads `body.md` with `readFileSync` from disk (line 20),
  while the row side uses `git show <rev>:`, and it compares only 16 of 64 hex characters
  (line 21). At 09:53Z `ScoutSourceWorkerVersioning/` was untracked and not ignored, and
  `git show HEAD:…/body.md` failed with "exists on disk, but not in 'HEAD'".

- **E4 binds pin↔file, not file↔source.** Invented bytes in `body.md` with their own sha pinned
  read `E4 PASS pin=sha256 15841c50876fe839f sha=15841c50876fe839`, so a fabricated capture
  satisfies E4.
- **E2 checks no quote.** Its three regexes are `m`-flag anywhere-in-file matches, so a
  header-only rewrite (`S217→S195`, `2026-10-23→2026-10-25`, no fetch, body still citing S217)
  reads `E2 PASS`.
- **E5 and E6 measure the worktree.** A committed malformed registry with a clean worktree gives
  `E5 PASS` at that rev, though the rev's own tree reads `E01 S195 fields=12`. Without
  `--census-root`, the plan's counting command cannot pass E5 at all (`ERROR: config not found`,
  exit 2).

The critic's controls turn those defects into a falsification (`w1/CritControlC2.md`, controls
`controls/ctl-c2-critic-*.txt`):

- **The honest build cannot hold.** A fully honest lane (contract-shaped 11-column S195 row,
  re-grounded entry, real capture pinned, README row and pin) reads
  `DOCTRINE61: DOCTRINE61_UNMET held=4/6 checks=6`, with `E3 MISS row-absent`. E3 and E5 are
  **jointly unsatisfiable**: the census requires NF=13 (11 cells) in `## Registry`, while E3's
  lookup requires the 12th cell.
- **A forgery does hold.** A header-only entry rewrite (no fetch, no quote), a fabricated
  `body.md`, a probe-shaped phantom S195 line **outside** `## Registry`, and a README row read
  `DOCTRINE61: DOCTRINE61_HELD held=6/6 checks=6` exit 0, while the census reports `ok`.
- **E5 reads the working tree.** A committed malformed registry with a clean worktree gives
  `E5 PASS` at that rev, though the rev's own tree reads `E01 S195 fields=12`.

So no `DOCTRINE61` line from this probe is a measurement of the claim, and the one line that can
reach HELD is a forgery. **Any `DOCTRINE61_HELD` under D61 v1 is false provenance by
construction**, because no census-valid Registry row can satisfy E3. Per the kill rule, C2
**fails** as declared; a fixed probe would have to be re-declared as a disclosed v2. The claim
also rests on uncommitted artifacts (row, entry, capture, README row), which is independent of
the probe.

## Gate

| id | decision | quote (≤25 words, located this round) | old → new |
|---|---|---|---|
| S195 | ADMIT temporal-worker-versioning-pinning.md | A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version. | (new row) package id `S217` re-numbered to the lane's next free id S195; tier A (vendor docs); status mined; opened 2026-10-25; recheck `90d`; used-by this entry only |

ADMIT temporal-worker-versioning-pinning.md (frontier band 4, durable execution). This adds the
code-pinning contract a replay needs: a Pinned run completes on one Worker Deployment Version.
The row candidate is `.ufo/waves/round-61/build/ScribeSourcesRows/row-S195.txt`: 1 line, 11 cells
(`awk -F'|'` gives NF=13), sha256
`cf37b133c39ba8d8b0fd591c27b0e7e05b43be0f1c54602ebb7db8b416d02660`. The quote sits at
`body.md:39` under `### Pinned Workflows` (`body.md:37`), is 13 words, and occurs once
(`rg -c -F` prints 1).

The capture is `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`: HTTP/2 200,
`text/markdown`, `last-modified: Sat, 24 Oct 2026 00:21:02 GMT`, 9645 bytes, sha256
`8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`, equal to the pin in the row.
**Uncommitted.** Both the capture and the row candidate are untracked at draft time, so E3 and E4
only hold once they land **and** the probe defect above is ruled on.

**Drop staged S217; do not re-key it as it stands.** The lane row is the in-round candidate.
Staged S217 splits into 12 cells (`SOURCES.append.md:29`, NF=14 from one escaped pipe) and was
opened 2026-10-23. The adopted entry's two references must be rewritten to S195 in the same
change, or E2 misses:
- `source: S217` at line 2 of the staged
  `merge/kumitate/knowledge/corpus/knowledge/temporal-worker-versioning-pinning.md`;
- `[S217 §Pinned Workflows]` at line 24.

E2 is `/^source:.*S195/m`, so it passes once line 2 cites S195.

Closure remedy that needs no probe edit:
1. Commit `build/ScoutSourceWorkerVersioning/body.md` and `findings.md` (6468 bytes) with the
   S195 row.
2. Beside the probe output, record
   `git show <rev>:.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md | sha256sum`.
   The full 64-character hash must be
   `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`.

One [INFERENCE] gap from the source seat stays open. The page does not say which version a retry
of a top-level Pinned run lands on (`w1/ScoutSourceWorkerVersioning.md`). The entry must not
state it.

### Standing rejects, re-opened and re-adjudicated

Both round-60 rejects were re-opened against the package as it stands today
(`/home/vgpnk/Projects/shokuknow/merge/kumitate/`, files dated 2026-10-24 23:33 -0300, read-only).
**The package has been re-numbered since round 60.** `SOURCES.append.md` now runs `S195`–`S349`
(155 rows; `MERGE-REPORT.md`: "first staged id is **S195**") and carries no `S130`, `S132` or
`S141` row. The same documents now sit under `S200`, `S202`, `S204`, `S211`. The flip conditions
bind **by document**, not by the id round 60 printed.

REJECT exactly-once-attribution.md (stays refused). The entry's `source:` is `S211`
(`https://arxiv.org/abs/2609.29095`). That is the same document the lane already grounds as
**S134** (`corpus/SOURCES.md`, used-by `corpus/knowledge/durable-execution-failure-detection.md`,
"scope is the title page only — no measured result is claimed"). Adopting it as staged would hold
one paper under two ids. It would also import the package row's measured claim ("over 25,930
episodes … 56% and 74% …"), which this lane has not read.

The duplication is wider than round 60 saw. The package holds 2609.29095 **twice**:
`S204` (`SOURCES.append.md:16`, title page and document structure) and `S211` (`:23`, § Abstract).
With lane S134 that is three ids for one document. The register's
`kumitate round1 S118 payload-absent` on this document (`absent-defect-register.md:138`) is a
false ABSENT: the `\title{…}` span is in the e-print tarball, so it is **not** a reason for this
reject.

**Root cause: S134 has no locator.** Its source cell is `Where Does Exactly-Once Live? … — arXiv
2609.29095 (Jiapeng Li, Microsoft)`. A bare arXiv id is none of the five forms the campaign's
locator rule accepts (`locator.py:27-41`: URL, local path, absolute path, glob path, backticked
command), so `has_locator()` returns False. Neither lane gate notices:
- `scripts/sources-check.mjs:34` reads "E04, W01 and other fleet checks are intentionally
  outside this contract";
- `source-dupes` skips URL-less rows (`:185`) and rows that are not 13 cells (`:166`).

Both read green at committed HEAD `be4a820` (`SOURCES_CHECK: CLEAN …` and
`SOURCE_DUPES: CLEAN groups=6 known=6`), and on the working tree too.

A same-rule sweep of the whole registry finds **5 locator-less rows of 133 at HEAD** (and the
same 5 of 134 on the working tree; receipt `build/ScribeLessonPrep/locator-sweep.txt`,
**uncommitted**): S021, S035, S074 (own-work rows whose locator is a command or host path in no
accepted form, a reading question rather than a clear defect), and S133, S134 (bare arXiv ids).

The lesson line, stated sharply: **a duplicate is structurally invisible to the duplicate-URL
gate when the existing row has no locator. A locator sweep is the detector, and the by-document
rule is the binder.** For 2609.29095 the binding is unambiguous anyway, because the register's
S118 quote is the `\title{…}` line, which is S204's gate quote, not S211's abstract.

In a scratch copy only, giving S134 the arXiv URL makes one re-keyed S211 read
`DRIFT … new-duplicate:arxiv.org/abs/2609.29095 ids=S134,S211`, the pair invisible today
(`dupes-scratch.txt`, `s134url` cases; not a proposed edit). The source cell is append-only, so
whether to add a URL to S133/S134 is the integrator's ruling.

Flip condition: a later band-4 round opens the paper's measured body, moves the measured scope
onto **S134**, the one id per document, under the item-10 pipeline, and pins the group. Neither
S204 nor S211 is ever appended as a second id for 2609.29095.

REJECT multi-agent-coordinator-topologies.md (stays refused). Its sources are `S200`
(阿里云百炼 `managed-agents-multiagent`) and `S202` (`https://arxiv.org/abs/2512.08296`). That is
a different theme, coordinator topology and its measured cost, and this round is one theme.
Neither document is in the lane registry. The lane's S131 is the Bailian *introduction* page, a
different URL.

A second bar stands on the same document. The register lists 2512.08296 as
`kumitate round1 S116 payload-absent` (`absent-defect-register.md:137`), and this round's
re-verification confirms a real defect: the staged `## Gate — S202` quote "We conducted 260
experiments across six benchmarks …" splices the abstract's "260 configurations … six agentic
benchmarks" onto §4.1's "We conducted 180 experiments across four representative benchmarks"
(§Assimilation). arXiv 2512.08296 has only `[v1]`, so the row needs a **correction**, not a
re-verification.

Flip condition: a later round whose one theme is coordinator topology re-opens S200 and S202 (by
document), replaces the spliced S202 quote with one of the two true sentences, and adopts the
entry through the item-10 pipeline.

## Assimilation

One source opened (Temporal Worker Versioning), one entry adopted on band-4 ground, and the
re-grounded evidence lands as S195. This is corpus work, **not** a held claim: C2 fails as
declared (§Claims), so the entry is landed for a later measured round, not claimed as a
capability this round. The adopted id S195 is the lane's next free id after S194
(`git show HEAD:corpus/SOURCES.md`: 133 ids, highest S194).

**Zero collisions, before and after the append.** The collision guard at draft time
(`/tmp/kumitate-r61/ScoutCollisionGuard/`, scratch and **uncommitted**) reads reg 133 ids,
staged 155 ids, collisions **0** (`collisions-fixed.txt` is empty). Appending the lane's S195
does not create a collision:

- **Package S195 (MCP Architecture) is not adopted.** It is the same document as **lane S125**
  (`MERGE-REPORT.md:96` lists the pair), and choosing the lane's next free id S195 for the
  Temporal row does not put two documents under one live id, because the package row stays
  unadopted. The append adds exactly **one source document** (docs.temporal.io/worker-versioning.md)
  under **one** id.
- **Package S217 is the same document as the adopted row.** It carries 12 cells and opened
  2026-10-23, so it is superseded by the in-round row. If it were ever appended as well, the
  lane would hold one document under two ids. That is a by-document duplicate, which the
  by-document rule forbids, and it is why the staged row is dropped rather than re-keyed.

After the append the registry has 134 rows with no id used twice. Record the post-append guard
output under `.ufo/waves/round-61/assimilation/` so the 0 is observed, not inferred.

**Quarantine slice: 9 rows.** Re-derived from
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
(375 lines, sha256 `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833`,
unchanged since round 60). ScoutQuarantineRegister got the same count independently
(`build/ScoutQuarantineRegister/verdicts.md`, **uncommitted**), matching cells by shape rather
than column index.

Re-verified this round: **present 8, absent 1, unverifiable 0.** This seat spot-checked three
verdicts against the scout's scratch fetches:
- S116: `s116.html` holds "We conducted 180 experiments across four representative benchmarks"
  once, and no "We conducted 260 experiments".
- S118: `s118.src` is a 112394-byte gzip tarball whose `\title{Where Does Exactly-Once Live?\\ …}`
  line is present verbatim after extraction.
- S142: `types.ts:181` is `export const MCP_PROTOCOL_VERSION = "2025-11-25";`.

| register id | register class | re-verified | cited source (register) | verdict |
|---|---|---|---|---|
| S109 | payload-absent | present | modelcontextprotocol.io/docs/2026-07-28/learn/architecture | false ABSENT: the sentence is in the page, split by `<code>` JSX. Campaign row not adopted. Same document as lane S125 and as package S195 |
| S116 | payload-absent | **absent** | arxiv.org/abs/2512.08296 | the slice's one real defect: the quote splices the abstract onto §4.1 and overwrites 180→260 and four→six. The staged `## Gate — S202` carries the same spliced quote. Not adopted |
| S118 | payload-absent | present | arxiv.org/abs/2609.29095 | false ABSENT: the span is in the e-print tarball, not on the abs page. Campaign row not adopted. Same document as lane S134 and as package S204/S211 |
| S129 | payload-absent | present | blog.modelcontextprotocol.io/posts/2026-07-28/ | false ABSENT: the page has a typographic `we’ve` where the quote has ASCII |
| S142 | payload-absent | present (locator defect) | …/0b5c27ab…/packages/coding-agent/src/mcp/client.ts | the constant is defined at `src/mcp/types.ts:181`; `client.ts:41` only imports it. The row's source cell names the wrong file, and the staged `## Gate — S228` names the right one |
| S143 | unreachable | present | github.com/VeigaPunk/ufo-fsd-alpha.git | `git ls-remote` exits 0. At pinned `093edb9`, 70 top-level `scripts/*.mjs`; the residue loop reproduces 0 uncited of 70 |
| S144 | unreachable | present | github.com/VeigaPunk/ufo-fsd-alpha | `scripts/charter-scribe/sync.mjs` is a blob at `093edb9` |
| S145 | unreachable | present | github.com/VeigaPunk/ufo-fsd-alpha | `scripts/ufo-refinement-context.test.mjs` is in the deletion history |
| S178 | unreachable | present | dl.acm.org/doi/10.1145/38714.38742 | the ACM page returns 403. The span is in the `aaron papers fetch` full text (46,529 chars). Same document as lane S194 |

**Id-space resolution (all 9 rows).** For every row the chain register id → staged id
(pre-remap) → merged id is recorded in
`/home/vgpnk/Projects/shokuknow/lanes/kumitate/ID-REMAP.md`, and this seat checked each row
twice: the remap line exists, and the merged row's URL in `SOURCES.append.md` equals the
register's cited URL.

| register id | staged id | merged id |
|---|---|---|
| S109 | S125 | S195 |
| S116 | S132 | S202 |
| S118 | S134 | S204 |
| S129 | S145 | S215 |
| S142 | S158 | S228 |
| S143 | S159 | S229 |
| S144 | S160 | S230 |
| S145 | S161 | S231 |
| S178 | S194 | S264 |

The staged id is the register id + 16 in every row. Why 16 is not established and not needed,
because the binding is checked by document. So the spans used for S143–S145 and S178 are the gate
quotes of their own merged rows (S229, S230, S231, S264), and the register's "never checked"
table (no quote column) does not leave those four as inference.

Recheck cautions for a later round:
- **S109:** the served HTML splits the sentence with JSX `<code>` markers, so a literal substring
  recheck of de-tagged prose reports a false negative. Count `clientCapabilities` instead (8).
- **S116:** correction only; arXiv 2512.08296 has only `[v1]`.

What this changes for the round: nothing is adopted from the slice. The register over-calls
ABSENT (one true defect in nine rows), but a false ABSENT is not an admission ground, and the one
true defect lands on the topology reject's own document. The S142 locator defect belongs to the
campaign, not the lane.

None of the nine documents is the S195 document (docs.temporal.io/worker-versioning.md).

**Correction to round 60's lesson** (state it in Mistakes). Round 60 wrote "S109, S116 and S118
are the lane's own rows and were not touched." The register's ids are the *campaign's* per-lane id
space, not the lane's. Under those ids the lane holds different documents:
- lane S109 is the Kafka 4.3 *Design* page;
- lane S116 is Temporal *Visibility*, status `rejected`;
- lane S118 is Kafka 4.3 *Consumer configs*;
- the lane holds no S129, S142, S143, S144, S145 or S178 at all.

Matching by document instead, three of the nine register documents are lane-held: register S109
is lane **S125**; register S118 is lane **S134**; register S178 is lane **S194**. Round 60's
"none of the nine was adopted" is therefore true by campaign id and false by document for S134
and S194. The lane rows are not thereby defective: each carries its own capture and sha256 and
its own located span, while the register's finding concerns the *campaign's* quoted span. The fix
for the lesson: compare the quarantine slice to the registry **by document (URL/DOI)**, never by
id, and name any lane row that shares a document with a register row.

The same item is in the round-60 erratum draft
(`.ufo/waves/round-61/build/ScribeErratum/erratum.md`), which also corrects the same sentence in
the fleet report (lines 146–148). Keep the lesson and the erratum consistent.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| **quarantine slice bound to the registry by id across two id namespaces** (round 60) | `corpus/lessons/round-60.md` §Assimilation ("S109, S116 and S118 are the lane's own rows", "None of the nine was adopted"); the same sentence in the fleet report lines 146–148; register `absent-defect-register.md:136-140,336-339` | **none** — no gate compared the slice to the registry by document | compare by document (URL/DOI), never by id: register S109 = lane S125, S118 = lane S134, S178 = lane S194. Applied this round; carried as the erratum item too |
| **vacuous counter: the same predicate reads HELD for a do-nothing or forged record and UNMET for honest work**, so neither verdict is evidence (this round, C1 and C2) | `w1/CritControlC1.md` (no-seat lane `held=4/4`, A1b/A2c `CLEAN`); `w1/CritControlC2.md` (honest `held=4/6` with `E3 MISS`, forgery `held=6/6`); controls `ctl-c1-critic-a4/a1b/a2c`, `ctl-c2-critic-a0/a5` | **frozen-plan kill rule** — any MISS fails the claim as declared, and a rule changed after seats scored is not this claim's rule | re-declare as a disclosed v2: one row-shape source of truth (census 11 cells == probe cells), E4 hashing the capture at the rev with full 64-char equality, and a positive control where the honest build must read HELD so the negative control is not vacuous |
| **predicted after-values written before measurement** (this seat's earlier draft revision) | earlier revision of this file (working-tree observation `rows=134 A=111`) | **none** | removed; the after-line stays blank until re-derived at the measured revision (§Retracted claims) |

Q56 and Q57 are not added: this lane's `corpus/QUALITY.md` ends at **Q55**, and neither id exists
anywhere in the lane, so a row citing them would be invented. `grep -o 'Q[0-9][0-9]' | sort -V`
over QUALITY.md gives Q50–Q55 as the highest block.

## Retracted claims

These appeared in earlier drafts of this lesson and are withdrawn:
- **"reg ∩ staged = {S195}"** — wrong. Package S195 is not adopted, so the append adds one
  source document under one id and creates no collision (§Assimilation).
- **Predicted after-values** (`A=111 B=15 C=8 rows=134`, "W04 stays at six") — not measured.
  Only the working-tree observation is recorded, labelled as such.
- **"E3 and E4 hold once the capture and row are committed"** — wrong. The honest build reads
  `held=4/6` because E3 is unsatisfiable against the census row shape, and E4 compares a working-tree
  hash (§Claims).
- **Any wording that the S195 row is "mined evidence" for a held claim** — withdrawn. The row and
  the entry are real work and are worth landing, but they sit under a failed claim, so the lesson
  must not present them as a capability acquisition.
