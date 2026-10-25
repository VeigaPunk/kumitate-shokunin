# Round 61 — lesson (DRAFT, sections: census, gate, assimilation)

author: kumitate-shokunin — draft by seat ScribeLessonPrep (round 61, w1)
base: `c2721f812cebd97ab67a1dd8cd8492a193f82d42` (draft read at lane HEAD `be4a820`)
access date for every source opened this round: 2026-10-25
plan: `.ufo/waves/round-61/plan.md` (frozen before any data seat scored)

Draft status: every number below names its receipt. A number whose receipt is not yet
committed in the lane is marked **uncommitted**, and the integrator must commit the receipt
or drop the number. Round-close values are not measured yet, so they appear as blanks for
the integrator to fill (for example *after: re-derive*). No round-close value is predicted
as if it had been measured.

## Census before → after

Before (round open, committed receipt `.ufo/waves/round-61/base/census-before.txt`, tracked
since `c2721f8`):

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

That is exit 0 with **six W04** warnings: round 60's five plus the S117/S126 group pinned in
round 60. The S126 line is that group.

`TIER61-before: A=110 B=15 C=8 rows=133`. This is re-derived from the committed registry with
round 60's histogram (`awk -F'|' '/^\|[[:space:]]*S[0-9][0-9][0-9]+[[:space:]]*\|/ {t=$5; …}'`)
at both `c2721f8` and `be4a820`, and both give the same line. It matches the frozen plan's
"registry 133 rows (A=110 B=15 C=8)" and round 60's `TIER60` after-line, so no row landed
between round 60's close and round 61's open.

After: *re-derive at the measured revision* with the same `awk` and with
`scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` (frozen
check E5). Commit the transcript under `.ufo/waves/round-61/close/`. Two expectations are
labelled [INFERENCE] and are not measurements:

- If exactly one tier-A row (S195) is appended, the line reads `A=111 B=15 C=8 rows=134`.
- The W04 count stays at six. `rg -l 'docs\.temporal\.io/worker-versioning' --glob
  '**/corpus/SOURCES.md'` from the fleet root found no other lane registry holding the S195
  URL at draft time.

Any other after-value is a finding to report, not something to round off.

Proxy at open (committed receipt `base/proxy-before.txt`, exit 1):
`PROXY: DRIFT (A_DRIFT … declared=105 computed=107 delta=+2; C2_TOTAL_DRIFT … declared=145
computed=146 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)`.
The repair, the refreshed stanza and the after-line belong to the README-map/proxy seats. This
section only quotes the before-line.

## Gate

| id | decision | quote (≤25 words, located this round) | old → new |
|---|---|---|---|
| S195 | ADMIT temporal-worker-versioning-pinning.md | A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version. | (new row) package id `S217` re-numbered to the lane's next free id S195; tier A (vendor primary docs); status mined; opened 2026-10-25; recheck `90d`; used-by this entry only |

ADMIT temporal-worker-versioning-pinning.md (frontier band 4, durable execution). This adds the
code-pinning contract a replay needs: a Pinned run completes on one Worker Deployment Version.
Row candidate: `.ufo/waves/round-61/build/ScribeSourcesRows/row-S195.txt`, which has 11 cells
and no stray pipe (`awk -F'|' '{print NF-2}'` prints 11). The quote is located at `body.md:39`
under the heading `### Pinned Workflows` (`body.md:37`) and occurs exactly once
(`rg -c -F` prints 1). The quote is 13 words.

The capture is `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`: HTTP/2 200,
`text/markdown`, `last-modified: Sat, 24 Oct 2026 00:21:02 GMT`, 9645 bytes, sha256
`8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`. That hash equals the pin
in the candidate row's anchor cell, which is frozen check E4. **Uncommitted.** At draft time
both the capture and the row candidate are untracked (`git ls-files --error-unmatch` fails), so
E3 and E4 only hold once they land in the measured revision. The package's own row (`S217`,
verified 2026-10-23) was re-grounded, not copied. The lane row carries this round's access
date, the located quote and this round's hash. The staged S217 row could not have been appended
as-is in any case. It splits into 12 cells (`awk -F'|'` gives NF=14) because of one escaped pipe
in its recheck cell (`SOURCES.append.md:29`). The candidate row file is 1 line, NF=13 (11
cells), sha256 `cf37b133c39ba8d8b0fd591c27b0e7e05b43be0f1c54602ebb7db8b416d02660`. The package's
recheck prose (`curl … | grep -c
'Pinned'` -> 14) is reduced to a `90d` cadence, by the round-60 rule that pipes inside cells
split the row.

One [INFERENCE] gap from the source seat stays open in the entry. The page does not say which
version a retry of a top-level Pinned run lands on (`w1/ScoutSourceWorkerVersioning.md`). The
entry must not state it.

### Standing rejects, re-opened and re-adjudicated

Both round-60 rejects were re-opened against the package as it stands today
(`/home/vgpnk/Projects/shokuknow/merge/kumitate/`, files dated 2026-10-24 23:33 -0300, read-only).
**The package has been re-numbered since round 60.** `SOURCES.append.md` now runs `S195`–`S349`
(155 rows; `MERGE-REPORT.md`: "first staged id is **S195**") and carries no `S130`, `S132` or
`S141` row. The same documents now sit under `S200`, `S202` and `S211`. The flip conditions
below therefore bind **by document**, not by the id round 60 printed.

REJECT exactly-once-attribution.md (stays refused). The entry's `source:` is `S211`
(`https://arxiv.org/abs/2609.29095`). That is the same document the lane already grounds as
**S134** (`corpus/SOURCES.md`, used-by `corpus/knowledge/durable-execution-failure-detection.md`,
"scope is the title page only — no measured result is claimed"). Adopting the entry as
staged would hold one paper under two ids. It would also import the package row's measured
claim ("over 25,930 episodes frontier models duplicate only 0.5% of writes whose
acknowledgement was lost but 56% and 74% …"), which this lane has not read. The register's
`kumitate round1 S118 payload-absent` on this document (`absent-defect-register.md:138`) is a
false ABSENT: the `\title{…}` span is in the e-print tarball. It is therefore **not** a reason
for this reject, and the reject rests on the id duplication alone. Flip condition, unchanged in substance: a later band-4
round must open the paper's measured body, move the measured scope onto **S134**, the one id
per document, under the item-10 pipeline, and pin the group. No second id for
2609.29095 is ever appended.

REJECT multi-agent-coordinator-topologies.md (stays refused). Its sources are `S200`
(阿里云百炼 `managed-agents-multiagent`) and `S202` (`https://arxiv.org/abs/2512.08296`,
"Towards a Science of Scaling Agent Systems"). This is a different theme, coordinator topology
and its measured cost, and this round is one theme (band-4 durable execution). Neither
document is in the lane registry. The lane's S131 is the Bailian *introduction* page, a
different URL. There is also a second bar. The register lists 2512.08296 as
`kumitate round1 S116 payload-absent` (`absent-defect-register.md:137`), and this round's
re-verification confirms it is a real defect: the staged `## Gate — S202` quote "We conducted
260 experiments across six benchmarks …" splices the abstract's "260 configurations … six
agentic benchmarks" onto §4.1's "We conducted 180 experiments across four representative
benchmarks" (see Assimilation). Flip condition: a later round whose one theme is coordinator
topology re-opens S200 and S202 (by document), **replaces the spliced S202 quote with one of the
two true sentences**, and adopts the entry through the item-10 pipeline.

## Assimilation

One source opened (Temporal Worker Versioning), one entry adopted on band-4 ground, and the
re-grounded evidence appears as S195. The adopted id S195 is computed as the lane's next free
id after `S194` (`git show HEAD:corpus/SOURCES.md`, 133 ids, highest S194).

**Id collision, which the integrator must record.** The collision guard at draft time
(`/tmp/kumitate-r61/ScoutCollisionGuard/`, scratch and **uncommitted**) reads reg 133 ids,
staged 155 ids, collisions **0** (`collisions-fixed.txt` is empty). Appending the lane's S195
changes that. The package's staged **S195** is a *different document*: "MCP Architecture
overview — https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture". So after the
append, reg ∩ staged = `{S195}`, with two documents behind one id. Round 60's re-pointing rule
moves ids by document, so the package and the lane disagree in both directions:

- **Package S195** (MCP Architecture, `SOURCES.append.md:7`) is the same document as **lane
  S125**. `MERGE-REPORT.md:96` lists it under "Rows whose source the lane's registry already
  holds".
- **Package S217** (Worker Versioning, `SOURCES.append.md:29`) is the same document as **lane
  S195** once this round's row lands.

Whichever of those package rows is appended later must be re-keyed to its lane document's id,
or to a fresh id if it is a distinct claim, never to the package's printed id. No lane
citation of S195 may be read as the MCP page. [INFERENCE] The
collision is computed from the two id lists, not observed in a post-append guard run. The
post-append guard output should be committed under `.ufo/waves/round-61/assimilation/`.

**Quarantine slice: 9 rows.** This is this seat's re-derivation from
`/home/vgpnk/Projects/shokuknow/.ufo/waves/corpus-expansion-1/absent-defect-register.md`
(375 lines, sha256 `5afe1810a6c3d62f37987b575a954f5b1197daa23005d4bb2f1d982f64bad833`,
mtime 2026-10-24 08:37 -0300, unchanged since round 60). It is the same count and the same
ids as `.ufo/waves/round-60/assimilation/quarantine-slice`. ScoutQuarantineRegister got the same
count independently (`.ufo/waves/round-61/build/ScoutQuarantineRegister/verdicts.md`, 191 lines,
**uncommitted** at draft time). Its filter matches cells by shape rather than column index and
yields exactly these 9 rows, each carrying an S-id.

Re-verified this round by that seat: **present 8, absent 1, unverifiable 0.** This seat
spot-checked three of the verdicts against the seat's scratch fetches
(`/tmp/kumitate-r61/ScoutQuarantineRegister/fetch/`):

- S116: `s116.html` holds "We conducted 180 experiments across four representative benchmarks"
  once and no "We conducted 260 experiments".
- S118: `s118.src` is a 112394-byte gzip tarball. Its `\title{Where Does Exactly-Once Live?\\ …}`
  line is present verbatim after extraction.
- S142: `types.ts` line 181 is `export const MCP_PROTOCOL_VERSION = "2025-11-25";`.

| register id | register class | re-verified | cited source (register) | verdict |
|---|---|---|---|---|
| S109 | payload-absent | present | modelcontextprotocol.io/docs/2026-07-28/learn/architecture | false ABSENT: the sentence is in the page, split by `<code>` JSX. Campaign row not adopted. **Same document as lane S125** (its own capture: 688587 bytes, sha256 `3f5cdc19…`) and as package S195 |
| S116 | payload-absent | **absent** | arxiv.org/abs/2512.08296 | **the slice's one real defect.** The quote splices the abstract ("Across 260 configurations spanning six agentic benchmarks") onto §4.1 ("We conducted 180 experiments across four representative benchmarks …"), overwriting 180→260 and four→six. The staged `## Gate — S202` carries the same spliced quote. Not adopted; refused |
| S118 | payload-absent | present | arxiv.org/abs/2609.29095 | false ABSENT: the census read the abs page, but the span is in the e-print tarball. Campaign row not adopted. **Same document as lane S134** (title page only) and as package S211 |
| S129 | payload-absent | present | blog.modelcontextprotocol.io/posts/2026-07-28/ | false ABSENT: the page has a typographic `we’ve` where the quote has an ASCII `'`. Not adopted |
| S142 | payload-absent | present (locator defect) | …/0b5c27ab…/packages/coding-agent/src/mcp/client.ts | the constant is defined at `src/mcp/types.ts:181`. `client.ts:41` only imports it. The row's source cell names the wrong file, and the staged `## Gate — S228` names the right one. Not adopted |
| S143 | unreachable | present [INFERENCE: span recovered] | github.com/VeigaPunk/ufo-fsd-alpha.git | `git ls-remote` exits 0. At pinned `093edb9`, 70 top-level `scripts/*.mjs`; the residue loop reproduces 0 uncited of 70. Not adopted |
| S144 | unreachable | present [INFERENCE: span recovered] | github.com/VeigaPunk/ufo-fsd-alpha | `scripts/charter-scribe/sync.mjs` is a blob at `093edb9`. Not adopted |
| S145 | unreachable | present [INFERENCE: span recovered] | github.com/VeigaPunk/ufo-fsd-alpha | `scripts/ufo-refinement-context.test.mjs` is in the deletion history. Not adopted |
| S178 | unreachable | present [INFERENCE: span recovered] | dl.acm.org/doi/10.1145/38714.38742 | the ACM page returns 403 (Cloudflare). The span is in the `aaron papers fetch` full text (46,529 chars). Campaign row not adopted. **Same document as lane S194** (its own full text, 47194 bytes, sha256 `d57846cc…`) |

Caveat, kept as written: the register's "never checked" table has **no quote column**. For S143,
S144, S145 and S178, the scout recovered the cited span from the campaign staging gate blocks
that cite the same source in the same round (round4 S229, round5 S230/S231, round8 S264). The
"present" verdict on those four rows rests on that mapping, which is inference, not observation.

What this changes for the round: nothing is adopted from the slice. The register over-calls
ABSENT (one true defect in nine rows), but a false ABSENT is not an admission ground. The one
true defect lands on the topology reject's own document, so that reject now carries a second,
independent bar (see Gate). The S142 locator defect belongs to the campaign, not the lane, and
is reported here only.

None of the nine documents is the S195 document (docs.temporal.io/worker-versioning.md).

**Correction to round 60's lesson** (state it in Mistakes). The same item is in the round-60
erratum draft (`.ufo/waves/round-61/build/ScribeErratum/erratum.md`). That draft also corrects the
same sentence in the fleet report (lines 146–148), so the lesson and the erratum must be kept
consistent. Round 60 wrote "S109, S116 and S118
are the lane's own rows and were not touched." The register's ids are the *campaign's*
per-lane id space, not the lane's. Under those ids the lane holds different documents:

- Lane S109 is the Kafka 4.3 *Design* page.
- Lane S116 is Temporal *Visibility*, status `rejected`.
- Lane S118 is Kafka 4.3 *Consumer configs*.
- The lane holds no S129, S142, S143, S144, S145 or S178 at all.

These come from `git show HEAD:corpus/SOURCES.md`. Matching by URL in the same file instead,
three of the nine register documents *are* lane-held:

- register S109 is lane **S125** (round 59);
- register S118 is lane **S134** (round 60);
- register S178 is lane **S194** (round 60).

Round 60's "none of the nine was adopted" is therefore true by campaign id and false by
document for S134 and S194. The lane rows are not thereby defective. Each carries its own
capture and sha256 and its own located span, while the register's finding concerns the
*campaign's* quoted span. A reader cannot tell that from round 60's sentence. The fix for the
lesson: compare the quarantine slice to the registry **by document (URL/DOI)**, never by id, and
name any lane row that shares a document with a register row. That is the same id-versus-document
confusion the collision guard exists to catch. [INFERENCE] A mechanical check, slice URLs ∩ lane
URLs, would have caught it. It was not run as a gate this round.
