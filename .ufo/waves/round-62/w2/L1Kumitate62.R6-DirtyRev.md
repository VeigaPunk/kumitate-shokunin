# L1Kumitate62.R6-DirtyRev — C2 E4/E5/E6 use worktree bytes

**Counterexample.** C2's supplied revision is not the single authority for E4, E5, or E6. A committed malformed SOURCES row can receive E5 PASS from the clean worktree; conversely E4 hashes an uncommitted capture, and E6 combines a README read from `rev` with a worktree script and its inputs. Thus these checks do not establish the stated properties at the supplied revision.

**Evidence.** Frozen code is `.ufo/waves/round-61/probe/doctrine61-probe.mjs` (SHA-256 `e638e2b932f9d1552484c428131f73ad7efef663b273bad72e1581a30efa1965`; `corpus/lessons/round-61-verifier-spotcheck.md:112` also records the probe code paths). In the probe:

- E4 (`:20-21`) hashes `readFileSync(join(lane, '.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md'))`, then checks the prefix against the pin read from `git show <rev>:corpus/SOURCES.md`. A worktree-only capture can therefore supply the hash while absent from `rev`.
- E5 (`:24`) invokes `sources-census.sh validate` against `censusRoot || lane`, i.e. the live checkout, not a tree extracted from `rev`.
- E6 (`:27`) reads `corpus/README.md` from `rev` for `mapped`, but runs `node <lane>/scripts/readme-map.mjs` with `cwd: lane`, so the executable and the files it inspects are worktree bytes.

Committed receipt `.ufo/waves/round-61/controls/ctl-c2-critic-a4-e5-worktree-not-rev.txt` gives the decisive E5 witness. At rev `ad78e87`, the committed tree census reports `kumitate E01 S195 fields=12` (exit 1), while the restored clean worktree census reports `kumitate ok` (exit 0). Running `doctrine61-probe.mjs <lane> ad78e87 --census-root <fleet>` reports `E5 PASS exit=0`. This is exactly the false pass: supplied-rev bytes fail census, worktree bytes pass it.

Committed follow-up `.ufo/waves/round-61/w2/CritC2LiveCensus.md:10-90` independently repeats the E5 mechanism: malformed committed rev `326c56a` gives archive census `E01 S195 fields=12` / exit 1, yet probe E5 PASS on clean worktree; at identical rev `be4a820`, changing only uncommitted worktree SOURCES flips E5 PASS to MISS. Its `:92-123` details E6: the same revision initially yields E6 PASS, then deleting only the worktree knowledge entry (without changing rev) makes the probe's worktree README-map report stale-covered/DRIFT and E6 fail. This proves E6's result is not rev-stable. The receipt's `:150` notes its scratch reproduction used the frozen probe; lane worktree itself was not re-run by that reviewer.

E4's direct uncommitted-capture case is also documented in committed `.ufo/waves/round-61/build/RevClaimFreeze/verdict.md:179-188`: on fixture `fx2`, E4 printed a worktree capture SHA while `git ls-tree HEAD` showed `body.md` absent; the check also accepts only a 16-hex prefix. This is direct evidence that an uncommitted capture can satisfy the hash half while absent from the measured revision.

**Why it reaches the claim target.** The frozen probe's D61 claim concerns E1–E6 at the supplied `rev`; all three checks use worktree bytes (E6 mixes authorities), so their PASS/MISS can be changed without changing `rev`. The evidence demonstrates both false acceptance (E5) and rev-invariant violation (E6, E4), not merely a theoretical path concern. This attack does not duplicate the independent E3 regex/cell-index defects or claim that this subcase alone makes the whole `DOCTRINE61_HELD` verdict reachable.

**Impacted axis:** coverage — the C2 evidence does not verify the named revision for E4/E5/E6.

**Smallest safe correction:** materialize the supplied revision's required files in an isolated temporary tree and run E4 hashing, the census, and README-map executable plus inputs against that tree; alternatively make every check consume `git show <rev>:<path>` bytes and ensure the census/map implementation operates on that same immutable tree. Compare the complete E4 SHA-256 rather than a prefix. Keep worktree state out of the measured predicate.

**Evidence pointers:** `.ufo/waves/round-61/probe/doctrine61-probe.mjs:20-27`; `.ufo/waves/round-61/controls/ctl-c2-critic-a4-e5-worktree-not-rev.txt`; `.ufo/waves/round-61/w2/CritC2LiveCensus.md:10-123`; `.ufo/waves/round-61/build/RevClaimFreeze/verdict.md:179-188`; `corpus/lessons/round-61-verifier-spotcheck.md:112-118`.