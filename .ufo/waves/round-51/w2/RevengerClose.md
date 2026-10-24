# RevengerClose — round-51 close-tip delta + over-claim audit (wave 2)

Seat: revenger, kumitate round 51 wave 2. Dispatched against close tip `7d88faa733c5621da1cac174515e4a7d7d8896ea`; the tip **moved to `cd7f69d31b0df6882e1472614476a7cee6baa25a`** (the scheduled pre-close repair commit) during this audit — both revs are measured below. Godspeed axes: (1) evidence-grounding — every disagree-item carries the command that re-derives it; (2) re-derivation coverage — how many pinned claims an independent run reproduces; (3) time — 15-minute box, met.

**Attacked:** wave-1 integration commit `a476977` (instrument, stanza re-derivation, S100/S101, lesson+Q43, w1 evidence), close-tip commit `7d88faa` (receipts 1-2 + doctored control), pre-close commit `cd7f69d` (receipt 3 + stale-sidecar control + entry rewrite), the frozen counters (A51 v3r6, D51), SCORECARD stanza + gate pins, SKILL.md registry row + checklist item 23, corpus/QUALITY Q43, corpus/lessons/round-51.md M-rows, plan.md freeze-repair addendum, corpus/knowledge/invocation-attestation.md, corpus/SOURCES.md S100/S101.

## Work-performed opener (the sentence)

> At base `c90b9de9` the lane could re-issue honest receipts but had no machine check that distinguishes a genuine invocation record from a post-hoc forgery — its own round-50 frozen arm scored the prelude-rewrite forgery PASS, and both round-51 counters read `ATTEST_UNMET held=0/9` / `DOCTRINE_UNMET held=0/5` on the committed base — while at the close tip it holds a shipped, gate-pinned instrument `scripts/receipt-attest.mjs` (contract `kumitate-receipt-attest-v1`, 27/27 selftest) whose frozen counter re-derives `ATTEST_HELD held=9/9` exit 0 over committed genuine receipts and four classes of doctored controls (prelude-rewrite, corrupt-digest, ledger-replay twin, probe-issued argv/stdout binding) — evidence: commit `cd7f69d`, artifacts `scripts/receipt-attest.mjs` (pin `449197638d…48e8d9`, verified) and `.ufo/waves/round-51/probe/attest51-probe.mjs` (pin `73ee53ec…`, verified).

Claim C2's predicate does **not** hold at any existing commit (below), so the opener claims only C1 as *held*.

## Re-derivations run (command → output)

1. Instrument pin — `sha256sum scripts/receipt-attest.mjs` → `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` = SCORECARD `pin.receipt-attest`. ✓
2. Counter + base-receipt pins — `sha256sum probe/*.mjs base/attest-base-v3r6.txt` → `73ee53ec…`, `f2d27071…`, `b0fb3558…` — all equal the knowledge entry's `receipt:` pins. ✓
3. Base before-state — `cat .ufo/waves/round-51/base/attest-base-v3r6.txt` → `ATTEST51: ATTEST_UNMET held=0/9 … rev=c90b9de9…` exit 1. Matches addendum item 8. ✓
4. Stanza at a **clean** checkout — clone to /tmp, `git checkout 7d88faa`, `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH (A=67 C=23 operability=9; C1=19/19 C2=117/117 coverage=10; S=88/88 …; R=92/92 …; K=53/53 …; pins=6 match; src-rev=31c465f15669)` exit 0. A=67/C=23/C2=117/117 re-derive at the audited tip independent of any dirty tree. ✓
5. Selftest (checklist item 23) — `node scripts/receipt-attest.mjs --selftest` → 27 cases PASS, `ATTEST_SELFTEST: PASS` exit 0. ✓
6. A51 at `7d88faa` → `ATTEST_UNMET held=7/9 … A2 MISS attest-run-3.txt:absent | A4 MISS attest-run-3.txt:absent;prior-files=162`, all challenge arms (A2c A3 A3c A4c A3d) PASS. exit 1.
7. A51 at `cd7f69d` → `ATTEST_HELD held=9/9 … exit=0`. **C1 holds at the pre-close tip.** ✓
8. D51 at `7d88faa` → `DOCTRINE_UNMET held=2/5 | D1 MISS trio incomplete in first 5 lines | D2 MISS clauses=12 bound=5 | D4 MISS SOURCES_CHECK: DRIFT (ENTRY_HEADER_REQUIRED)`. exit 1.
9. D51 at `cd7f69d` → `DOCTRINE_UNMET held=4/5 | D2 MISS clauses=12 bound=2 hash-miss=0`. exit 1. **C2 holds at no existing commit.**
10. Checklist count — `grep -c '^- \[ \]' SKILL.md` → `23` (baseline 22 + item 23, line 709). ✓ (H1)
11. Forger rev — `git cat-file -t 9cb611b7` → `fatal: Not a valid object name`; `jj log -r 9cb611b7` → `Error: Revision doesn't exist`. See disagree-item 3.
12. Hygiene — probes use `mkdtempSync(tmpdir())` and score `git archive` bytes of `<rev>`, never the working tree; `git status` after runs shows only the pre-existing in-flight edit and sibling seat reports. Lane untouched by this seat.

Not re-run (timebox; unrun ≠ passed): H2 cap-run 12/12, bind-oracle 7/7, round-gate 61/61, counter-rerun gate itself; H4 census; H5 G50 8/8 + R50 8/8; fresh-fetch re-open of S100/S101 (ordered by the lesson's own spot-check row; seats ScoutReopenS100/S101 were in flight, reports untracked).

## Disagree-list — what a non-author verifier will re-derive and could dispute

1. **`DOCTRINE_HELD held=5/5` (tasking, lesson C2 claim) — FALSE at every existing commit.** Measured: `held=2/5` at `7d88faa` (D1+D2+D4 MISS) and `held=4/5` at `cd7f69d` (D2 `clauses=12 bound=2 hash-miss=0`). The only bytes that could satisfy D2 are an **uncommitted** working-tree rewrite of `corpus/knowledge/invocation-attestation.md` (50 insertions/44 deletions in flight during this audit). Re-derive: `node .ufo/waves/round-51/probe/doctrine51-probe.mjs <lane> <rev>`. The close must land that edit and re-run D51 before claiming C2; until then the honest reading is "C2 entry committed, predicate unmet."
2. **`ATTEST_HELD` at the dispatched tip `7d88faa` is 7/9, not 9/9 — and the pre-declared miss was understated.** Tasking said "A2 will MISS until receipt 3"; A4 (ledger + prior-corpus nonce sweep) gates on the same absent file (`A4 MISS attest-run-3.txt:absent;prior-files=162`). Fixed by `cd7f69d` (re-derived 9/9), but any verifier pinning `7d88faa` reads UNMET. Re-derive: command 6/7 above.
3. **Forger rev `9cb611b7` (plan.md:81, lesson M2 "re-verified … held=5/8") is not an object of this repo.** It is a rev of the throwaway lane `/tmp/forger-lane` (RevCounterA.md:16,23), which is gone or private; `git cat-file` and `jj log` both reject it. The claim "forger reads ATTEST_UNMET held=5/8" is therefore **not re-derivable by a non-author from committed bytes** — only the verbatim transcript in `w1/RevCounterA.md` stands, and its line 24 shows a different-era reading (`held=5/5 checks=5`). RevPlan.md Nit 1 (LOW) already flags the provenance; the plan/lesson still cite the bare short rev without the `/tmp` qualifier.
4. **Lesson "Base and round-open tip `c90b9de9`" contradicts git.** The parent of the freeze commit `06ecbf4` is `d788f74` (round-50 verifier spot-check); `c90b9de` is its parent. Mitigating: `git diff --stat c90b9de..d788f74` = one data-only file (`corpus/lessons/round-50-verifier-spotcheck.md`, +68), so every counter reading is identical at either — but the git statement as written is wrong and a pedant will file it.
5. **Q43 convicts round 51 under its own letter.** Q43: "a counter whose before-state receipt is absent from the freeze commit is a conformance defect" — the freeze commit `06ecbf4` contains no executed before-receipt (A51 v1 didn't parse; base receipts landed across the repair commits `1fd8aceb`→`cbca45c`). Only the "From round 51 on" scoping saves it. Also Q43's `Limit` sentence was amended in `cd7f69d` (QUALITY.md +4/-1) — verifiers must re-read the final wording, not dispatch-time wording.
6. **Addendum header says "append-only" while the plan body was edited in place** — `779b16e` (before-line arithmetic, superseded-control claim), `8f3c692` (C1 ledger wording), `cd7f69d` (D1 wording, 4 lines). `git diff 06ecbf4..cd7f69d -- .ufo/waves/round-51/plan.md` shows non-addendum byte changes. Supersession markers in situ mitigate; the header's claim and the practice still disagree.
7. **Knowledge entry "3 round-51 receipts, … span ≥ 300 s" is false at `7d88faa`** (2 receipts; run-1→run-2 span ≈ 235 s) and true only from `cd7f69d`. Deeper: `run-at:` preludes are author-issued — A2's span is an author-attested ordering claim, not a temporal proof; the entry says so itself (Q39 ceiling) and verifiers must not over-read it.
8. **Stanza re-derivation has an out-of-lane dependency.** `PROXY: MATCH` re-derives at a clean tip, but `src-rev=31c465f15669` — the S/R member counts (88/88, 92/92) are read from the **origin tree pin outside this repo**. A verifier without that checkout cannot reproduce four of the stanza's terms; and A=67 breaks if any seat ever drops a runnable file anywhere in the lane (the reason for this seat's write bound).
9. **S100/S101 body hashes are re-derivable only by fresh fetch.** Pinned `7d7948bc…` / `366f0e7e…`; man7.org byte drift flips them. The lesson itself orders wave-2 re-open — the re-open receipts must land before close or the rows' `mined` status rests on round-51-author hashes alone.
10. **D2's denominator is editorial.** `clauses=12` counted at both tips, but clause count changes with every entry rewrite (the in-flight edit already moved `bound` 5→2 at committed state); a verifier counting bullets vs sentences derives a different denominator and can dispute both directions of D2.
11. **Lesson M2's "held=5/8" vs RevCounterA's own verbatim "held=5/5 checks=5"** — same object, two readings, different counter versions; the lesson should name which counter version produced 5/8 (v3r5) and cite the transcript line, else the two committed artifacts appear to contradict each other.

## Findings for the L1 (ordered)

1. Commit the in-flight `invocation-attestation.md` repair and re-run D51 before filing `DOCTRINE_HELD` — it is unmet at every commit that currently exists (disagree-item 1). If the close ships with D51 < 5/5, C2 must be reported unmet, not held.
2. land re-open receipts for S100/S101 (or record the sweep line) per the lesson's own spot-check row.
3. Qualify the `9cb611b7` citations with the `/tmp/forger-lane` provenance (one-word fix, already drafted by RevPlan Nit 1) and reconcile held=5/8 vs held=5/5 with a counter-version tag.
4. Optional one-line lesson fix: "round-open tip" → `d788f74` (base re-measurements at `c90b9de` remain valid).

Everything else this seat re-derived — instrument/counter/base pins, stanza at clean tip, selftest 27/27, checklist 23, A51 9/9 at `cd7f69d`, base `0/9` before-state, nonce/sidecar shape of the committed doctored controls — **holds**.
