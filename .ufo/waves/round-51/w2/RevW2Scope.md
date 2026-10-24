# RevW2Scope — wave-2 scope audit + freeze re-hash (round 51)

Seat: RevW2Scope (`kumitate-r51.HilariousMongoose`), independent leaf, read-only except this report.
Audit window: 2026-10-23T23:44:20-03:00 → 23:50:20-03:00 (13:44Z–13:50Z UTC). The lane was live
throughout: the tip moved `3304a56` → `cd7f69d3` at 23:45:22 while the audit ran, so every reading
below is timestamped. Runtime used for all node work: `/run/user/1000/fnm_multishells/5324_.../bin/node`,
`node v24.21.0` (one canonical runtime; no second node was invoked).

## Axes attacked

1. **Write containment** — every file under `.ufo/waves/round-51/` at run time; every wave-2 write against
   `w2/<Seat>.md` only (+ /tmp); seat names against `w2-assignments.json`.
2. **A-term contamination** — the frozen `RE_RUNNABLE` walk (`scripts/proxy-check.mjs:495,935`, walker `:682-692`:
   skips `.git` only) replayed over the lane; every runnable file with mtime ≥ wave-2 start.
3. **Freeze identity** — sha256 of `plan.md` + both counters vs SonicAudit's wave-1 record (`w1/SonicAudit.md` §4),
   worktree vs `HEAD` blobs, commits touching frozen paths, close evidence honesty.
4. **Claim honesty at run time** — both frozen counting commands executed at `7d88faa` (the rev named in the
   round banner) and at the new tip `cd7f69d3`; results compared with `close/A51-*.txt`, `close/D51-*.txt`.

I did not run the H1–H5 harm battery (owned by other seats), and I did not content-review the 20 filed reports.

## 1. Inventory at run time

```
$ find .ufo/waves/round-51 -type f | wc -l
179
$ ls -1 .ufo/waves/round-51/w2/
ConnOverlap2.md  CritA2Span.md  CritA3eGap.md  CritClaims.md  CritLedger.md  CritQ43.md
CritReceiptsHand.md  CritReportContract.md  CritSourcesRows.md  RevA51Rerun.md  RevA5Pin.md
RevChecklist23.md  RevEntryClauses.md  RevFreezeGenealogy.md  RevHarm-transcripts/  ScoutCensus2.md
ScoutDeadSeats.md  ScoutPriorSweep2.md  ScoutReopenS100.md  ScoutReopenS101.md  SentSecrets2.md
swarm-registry.json
```

| Check | Result |
|---|---|
| w2 `*.md` basenames ⊆ `w2-assignments.json` keys | **PASS** — 20/20 (machine check, `missing/unassigned: []`), 12 of 32 seats not yet filed |
| Any wave-2 `.mjs/.js/.sh/.py` under the lane | **NONE** (`find ... -newermt '2026-10-23 23:44:00'` → empty) |
| Any seat file outside `w2/` | **NO seat-attributable file**; three non-report lane writes occurred mid-wave (F2), all integration, now committed |
| Symlinks/fifos/devices under round-51 | none (`find -type l -o -type b -o -type p -o -type s` → empty) |

## 2. A-term contamination — measured, not assumed

```
$ node -e '<RE_RUNNABLE walk over lane root, skipping .git>'
A_walk=67 wave2_runnable=0
$ grep -n "RE_RUNNABLE" scripts/proxy-check.mjs
495: const RE_RUNNABLE = /\.(?:mjs|js|sh|py)$/;
935: const A = walkFiles(self).filter((r) => RE_RUNNABLE.test(r)).length;
```

`A_walk=67` equals the integrated stanza (`A=67`), and **zero** runnable files carry a wave-2 mtime.
The 20 wave-2 reports are `.md`, the transcript scratch is `.txt`: no A-term inflation from wave 2 at
this snapshot. **Caveat (F5)**: wave-2 mutation seats were dispatched with `/tmp` scratch, but nothing
machine-checks that; this is a point-in-time result only.

## 3. Freeze hashes vs SonicAudit — drift table

```
$ sha256sum .ufo/waves/round-51/plan.md .ufo/waves/round-51/probe/attest51-probe.mjs \
            .ufo/waves/round-51/probe/doctrine51-probe.mjs
a532bbaaeb55bcc1d3ef5713d007bb8532afb5ad2df94d3dd584757c747be4e4  plan.md          (15637 B, mtime 23:45:08)
73ee53ec994c5abaf23a5d95022a395be89e87675df07cea58efd3cf1cf0ff2c  attest51-probe.mjs (19415 B, mtime 23:25:17)
f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0  doctrine51-probe.mjs (5875 B, mtime 23:01:47)
```

| File | SonicAudit final (23:03:56) | At audit start | At audit end (HEAD `cd7f69d3`) | Verdict |
|---|---|---|---|---|
| `plan.md` | `dc8fbc9a…` 10427 B | `1cb5bd0b…` 15486 B (23:44:20) | `a532bbaa…` 15637 B | **DRIFT**, two events (see F2) |
| `attest51-probe.mjs` | `422e67b0…` 9533 B | `73ee53ec…` 19415 B | `73ee53ec…` | DRIFT, authorized by addendum items 3/6/7/8 (`8c07e88`, `8fd3cde`, `4b8da21`, `cbca45c`); worktree == HEAD blob |
| `doctrine51-probe.mjs` | `f2d27071…` 5875 B | `f2d27071…` | `f2d27071…` | **MATCH** |

`git show HEAD:<path> | sha256sum` equals the worktree hash for both counters, and for `plan.md` at
`cd7f69d3`; all three frozen files are clean in `git status` at audit end. SonicAudit's record is
therefore **two repair generations stale for the counter** and **one generation + one inline edit stale
for the plan**; no artifact pins the post-addendum hashes. The hashes in this table are the audit-time
pins.

## 4. Claim honesty measured at run time (frozen commands)

```
$ node .ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 7d88faa…
ATTEST51: ATTEST_UNMET held=7/9 checks=9 rev=7d88faa… rule=A51 version=v3 | A1 PASS | A2 MISS attest-run-3.txt:absent |
A2c PASS | A3 PASS | A3c PASS | A4 MISS attest-run-3.txt:absent;prior-files=162 | A4c PASS | A3d PASS | A5 PASS   (exit 1)

$ node .../doctrine51-probe.mjs … 7d88faa…
DOCTRINE51: DOCTRINE_UNMET held=2/5 checks=5 rev=7d88faa… rule=D51 | D1 MISS trio incomplete in first 5 lines |
D2 MISS clauses=12 bound=5 hash-miss=0 | D3 PASS | D4 MISS exit=1 SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED) | D5 PASS   (exit 1)

$ node .../attest51-probe.mjs … cd7f69d31b0df6882e1472614476a7cee6baa25a
ATTEST51: ATTEST_HELD held=9/9 checks=9 rev=cd7f69d3… rule=A51 version=v3 | A1…A5 all PASS                (exit 0)

$ node .../doctrine51-probe.mjs … cd7f69d31b0df6882e1472614476a7cee6baa25a
DOCTRINE51: DOCTRINE_UNMET held=4/5 checks=5 rev=cd7f69d3… rule=D51 | D1 PASS | D2 MISS clauses=12 bound=2
hash-miss=0 | D3 PASS | D4 PASS | D5 PASS                                                                   (exit 1)
```

`close/D51-cd7f69d3.txt` records the same `4/5` (sha256 `89bee2bd…`), and `close/A51-cd7f69d3.txt`
records `9/9` (sha256 `bf7c9f83…`); my A51 run reproduces its verdict line exactly. **The close evidence
is honest — it does not overstate.** The round's C2 predicate, however, is **not met**.

---

# Findings

## F1 — HIGH — `DOCTRINE_HELD` is false at every rev the round has named: 4/5 at `cd7f69d3`, 2/5 at `7d88faa`

`cd7f69d3` (committed 23:45:22, message: “entry trio-first/D2 bindings … per wave-2 findings”) repaired
D1 and D4 but **not D2**. The frozen D2 arm (`probe/doctrine51-probe.mjs:73-91`) requires
`clauses>=12 && bound>=12 && hash-miss===0`, where `bound` counts only clause lines (`l.startsWith('- ')`)
that carry `receipt:<path>@sha256:<64hex>` **on that same line**. In the committed entry:

```
$ git show HEAD:corpus/knowledge/invocation-attestation.md | grep -c '^- .*receipt:'
2                      # clause lines 62 and 66 only
$ grep -n '^- ' /tmp/revw2scope-entry.txt
20,27,33,42,47,54,62,66,71,76,81,84        # 12 clauses
```

Ten of the twelve clause lines carry their `receipt:` token on a **continuation** line, which D2 does
not scan; the remaining bindings are outside clause lines entirely. Consequently `bound=2`, D2 MISSes,
and `DOCTRINE_HELD` cannot be claimed at the current tip. Any close text that asserts
`DOCTRINE_HELD held=5/5` for round 51 would be false; the correct reading at `cd7f69d3` is
`DOCTRINE_UNMET held=4/5 exit 1`.

Additionally, at the rev named in the round banner (`7d88faa`) the predicate was worse: **2/5**, because
the entry began with a title line, so the provenance trio fell outside D1's first-five-lines window, and
`sources-check` reported `SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)` (D4). Both were repaired only in
`cd7f69d3`. The banner's “only A2 misses (receipt 3) is expected” caveat covers A51; it does not cover
D51, which was also `0/5`-adjacent at that rev.

Smallest correct fix (integration owner): restructure the entry so each of the 12 `- ` clause lines
carries its own binding on that line (or reduce the clause count consistently — but the ≥12 threshold is
frozen), commit, and re-run D51 at the new rev. **Do not edit the counter to widen D2.**

## F2 — HIGH — the frozen plan was mutated mid-wave, inline, with no addendum item and no hash pin

`plan.md` changed **during wave 2**, before any wave-2 report was filed:

```
$ sha256sum .ufo/waves/round-51/plan.md          # 23:44:20
1cb5bd0b… 15486 B
$ sha256sum .ufo/waves/round-51/plan.md          # 23:45:08
a532bbaa… 15637 B
$ git diff HEAD -- .ufo/waves/round-51/plan.md   # at 23:45:1x (pre-commit)
- URLs, `verified-at:`, `recheck:`) in its first three lines; D2 ≥12 clause lines, each
+ URLs, `verified-at:`, `recheck:`) within its first five lines (the frozen counter's window;
+ the body's original "first three lines" wording is superseded — item 7-class text repair
+ per seat ScribeLesson F-1); D2 ≥12 clause lines, each
```

This is an **inline edit to §C2**, not an addendum entry, although the addendum declares itself
“append-only; supersedes the freeze bytes it names” (`plan.md:169`). It was committed 14 s later in
`cd7f69d3`, so nothing was lost, but three concrete harms remain:

1. **Version skew inside one wave.** Net +2 lines at `plan.md:100`; every citation to a line >100 made
   before 23:45:08 (e.g. seats citing §C1/A3, the addendum, or `191-198`) now points two lines off.
   Seats that read the plan after 23:45:08 cite the new bytes. No report records which version it read.
2. **The freeze chain has no pin.** SonicAudit's `dc8fbc9a` was the only recorded plan hash; the
   addendum names commits for items 1–6 but no hash table, and the post-addendum plan bytes were never
   pinned anywhere until this report. A frozen artifact whose identity depends on “whatever the plan says”
   is self-referential.
3. **The write is outside the wave-2 write grammar I was asked to enforce** (“every wave-2 write is
   `w2/<Seat>.md` only”). Two more corpus writes landed in the same window — entry at 23:45:46,
   `corpus/QUALITY.md` at 23:46:13 — all now committed in `cd7f69d3` (message names them). They are
   integration writes by the L1, not seat violations, but the close report must record them as explicit
   integration exceptions and pin the resulting hashes; otherwise the “frozen before data ran” claim
   is not mechanically true.

Same-window corpus drift, recorded for the close:
`corpus/knowledge/invocation-attestation.md` HEAD now `4851b4c2…`; `corpus/QUALITY.md` HEAD now
`0612fab3…` (adds the Q43 manual-enforcement limit sentence).

## F3 — MEDIUM — committed entry carries two literal `@sha256:pending-close` pseudo-bindings

```
$ git show HEAD:corpus/knowledge/invocation-attestation.md | grep -n 'pending-close'
38:  `receipt:.ufo/waves/round-51/w2/CritA3eGap.md@sha256:pending-close`); a drift inside the
45:  this entry does not claim it does (`receipt:.ufo/waves/round-51/w2/ScoutReopenS101.md@sha256:pending-close`
```

They are inert for D2 (its regex requires 64 hex), so they neither help nor hurt the score today — but
they are non-resolvable “receipt” tokens in a shipped knowledge entry, and a future checker with a
laxer parser would bind nothing. If the F1 restructure moves bindings onto clause lines, these two must
become real hashes of the committed wave-2 reports (or be dropped); shipping `pending-close` text in a
`receipt:` token is a content-integrity smell regardless of the counter.

## F4 — MEDIUM — A51 self-description drifts from its own check set; addendum genealogy is incomplete

```
$ sed -n '20p;58p;71p' .ufo/waves/round-51/probe/attest51-probe.mjs
 * Scores seven checks over the committed bytes of <rev> (extracted with `git archive`, never
 * Predicate ATTEST_HELD = held=9/9, exit 0. Any other reading is `ATTEST_UNMET held=<k>/9`
const VERSION = 'v3';
$ node .../attest51-probe.mjs … 7d88faa… | tail -1   # output self-ID
… rule=A51 version=v3 | A1 … A5   (checks=9)
```

The header still says **seven checks** and `VERSION='v3'`, while the executed set is nine
(A1, A2, A2c, A3, A3c, A3d, A4, A4c, A5) and the plan/addendum call the frozen revision **v3r6**.
The predicate line is correct; the header/version are stale v3-era text. Addendum item 7 claims
“fixes the header claim”, but only the exit-2 wording was fixed. This matters because a reader auditing
“the header matches the predicate” (CritFreeze's criterion) will see seven ≠ nine.

Genealogy gap in the same class: the addendum names four commits (`1fd8aceb`, `3ed875d3`, `8c07e880`,
`8fd3cde1`); **eight** commits touched the frozen paths since the freeze:

```
$ git log --oneline 06ecbf4..HEAD -- .ufo/waves/round-51/plan.md .ufo/waves/round-51/probe/
8f3c692 779b16e cbca45c 4b8da21 8fd3cde 8c07e88 3ed875d 1fd8ace
```

Items 7 and 8 name no commit at all, and the two text-repair commits (`779b16e`, `8f3c692`) are unnamed.
Closing the freeze genealogy from `plan.md` alone is therefore impossible; the close report must carry
the eight-commit list plus the audit-time hashes in §3.

## F5 — LOW — the “w2/<Seat>.md only” grammar is already contradicted by the dispatch, and one seat used it

```
$ find .ufo/waves/round-51/w2 -type f ! -name '*.md' | sort
.ufo/waves/round-51/w2/RevHarm-transcripts/h1-checklists-live-rerun.txt
… (10 files) …
.ufo/waves/round-51/w2/swarm-registry.json
```

`RevHarm` wrote a sibling transcript directory (`w2/RevHarm-transcripts/*.txt`) because its item says
“Save transcripts (.txt) next to your report”; `MutShipped` says “transcripts .txt in your report dir”,
and `RevChecklist23`/`MutCounters`/`MutSkillItem`/`CritLedger` say “report transcripts”. The strict grammar
in my brief (`w2/<Seat>.md` only) and six dispatch items cannot both be satisfied. No runnable
contamination resulted (A walk clean), and the `w2/RevHarm-transcripts` name is seat-attributable and
inside `w2/`, so this is a specification conflict, not a rogue write: either record the widened grammar
(`w2/<Seat>.md` + `w2/<Seat>-transcripts/*.txt`) in the close, or have transcripts embedded in the `.md`.

## F6 — INFORMATIONAL — orchestrator/close infrastructure outside the wave-2 grammar

`close/A51-cd7f69d3.txt`, `close/D51-cd7f69d3.txt` (untracked at 23:48, created by the integration
flow), `w2/swarm-registry.json` (mode 600, 35901 B, committed at `3304a56`, `reportDir` field +
32 `agentId`s) and round-root `w2-assignments.json` are not seat writes. Same class as SonicAudit's
F2 flags; exclude the registry from any byte-freeze check (it is live harness telemetry) and treat
`close/` as close-time evidence, not wave-2 output.

## F7 — INFORMATIONAL (corroboration) — the doctored control's sidecar was absent at the rev the round named

```
$ git ls-tree --name-only 7d88faa .ufo/waves/round-51/receipts/
attest-run-1.txt  attest-run-1.txt.sha256  attest-run-2-replayed.txt  attest-run-2.txt  attest-run-2.txt.sha256  run-1.out
$ git ls-tree --name-only HEAD .ufo/waves/round-51/receipts/
… attest-run-2-replayed.txt  attest-run-2-replayed.txt.sha256  attest-run-3.txt  attest-run-3.txt.sha256 …
```

At `7d88faa` there was **no** `attest-run-2-replayed.txt.sha256`, so A3's PASS there exercised the
missing-sidecar class, not the declared prelude-rewrite + untouched-sidecar class (CritReceiptsHand
reported this independently). `cd7f69d3` adds the sidecar and run-3, so A3 at the close rev tests the
declared class and A2/A4 go to 9/9. Close text should cite `cd7f69d3`, never `7d88faa`, for A3's mechanism.

Also note for the record: at `7d88faa` **A4** misses alongside A2 (both require `attest-run-3.txt`), so
the pre-close reading is `held=7/9`, not 8/9. This matches the announced receipt-3 schedule and is not a
defect; it is recorded so no close table claims 8/9.

---

## Residual risk / verification gaps

- **Point-in-time.** Wave 2 was still running: at snapshot 12/32 seats had not filed, and 20/32 had.
  Later reports, transcript dirs, or (worse) runnable scratch under the lane are unobserved. Re-run the
  A walk and the `w2` listing at close.
- **Report contents not reviewed.** I checked report filenames/paths against the dispatch only; the
  claims inside the 20 reports are other seats' attack surface. `RevHarm-transcripts/` contents were
  not read.
- **No LSP device in this seat's toolset**, so caller/definition/diagnostic checks were done by literal
  text/git inspection only (`grep`/`sed`/`git show`); no semantic reference proof is claimed. This is a
  recorded tooling limitation, not a substitute for one.
- **Counters executed at two revs only** (`7d88faa`, `cd7f69d3`), not at every filing; they are cheap
  (~2 s each) and should be re-run at the final close rev.
- **H1–H5 not exercised** by this seat; the harm battery is owned elsewhere.
- `.jj/` op-store churn accompanies every lane write in this colocated repo and was excluded from the
  lane-file accounting; it contains no `RE_RUNNABLE` files.
- The `close/` evidence is rev-named but untracked at observation; if the close commit changes the rev,
  those files become stale evidence and must be regenerated, not reused.

## Attestation

Only file written in the lane: this report
(`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w2/RevW2Scope.md`).
Scratch outside the lane: `/tmp/revw2scope-attest.txt`, `/tmp/revw2scope-attest2.txt`,
`/tmp/revw2scope-doctrine.txt`, `/tmp/revw2scope-doctrine2.txt`, `/tmp/revw2scope-entry.txt`.
All git usage read-only (`status`, `log`, `diff`, `show`, `ls-tree`, `rev-parse`); no git/jj mutation.
No tool installed or updated; pacman untouched (host-wide pause respected). No sibling lane, fleet repo,
`.ufo/state`, `MANIFEST.json`, or `~/.omp/agent/*` touched. Both frozen counters were executed but not
edited; A51's output is byte-identical to `close/A51-cd7f69d3.txt` apart from its `run-at:` capture line.
