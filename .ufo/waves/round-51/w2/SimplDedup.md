# SimplDedup — 96-item distillation vs dispatched wave-2 seats (kumitate r51 w2)

## What this seat attacked

The wave-2 dispatch itself: every item in the wave-1 distillation
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/DistWave1/wave2-items.md`
(431 lines, trailer line 376: `**Item count: 96.**`) was mapped against the attack text of every
dispatched wave-2 seat in
`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/w2-taskcall.json`.
Coverage was judged from the dispatched task texts (no w2 report is complete at run time; this
seat does not wait). A seat may incidentally brush a residual while executing; the residual list
below is what **no seat was asked to do**.

Commands run (evidence):

```
$ jq '.tasks|length' .ufo/waves/round-51/w2-taskcall.json
32
$ jq '.items|length' .ufo/waves/round-51/w2-spec.json
32
$ jq -r '.tasks[].name' .ufo/waves/round-51/w2-taskcall.json | paste -sd, -
RevA51Rerun,RevD51Rerun,RevA5Pin,RevInstrument,RevFreezeGenealogy,RevEntryClauses,RevStanza,
RevChecklist23,RevHarm,CritClaims,CritA2Span,CritLedger,CritReceiptsHand,CritSourcesRows,
CritReportContract,CritQ43,MutShipped,MutCounters,MutStanza,MutReceiptBytes,MutSkillItem,
ScoutCensus2,ScoutReopenS100,ScoutReopenS101,ScoutPriorSweep2,ScoutDeadSeats,ConnOverlap2,
SentSecrets2,RevengerClose,SimplDedup,RevW2Scope,CritA3eGap
$ grep -n "hold(" .ufo/waves/round-51/probe/attest51-probe.mjs
116:hold('A1'…) 150:hold('A2'…) 177:hold('A2c'…) 188:hold('A3'…) 217:hold('A3c'…)
252:hold('A4'…) 305:hold('A4c'…) 335:hold('A3d'…) 351:hold('A5'…)
$ grep -n "hold(" .ufo/waves/round-51/probe/doctrine51-probe.mjs
71:hold('D1'…) 88:hold('D2'…) 102:hold('D3'…) 108:hold('D4'…) 113:hold('D5'…)
```

## Finding 0 — count and path discrepancies (bookkeeping, not blockers)

1. The tasking says "31 dispatched wave-2 seats"; `w2-taskcall.json` and `w2-spec.json` both
   carry **32** items = **31 attack seats + SimplDedup** (this meta seat). Dedupe below is against
   the 31 non-meta seats.
2. The tasking's path `build/DistWave1/wave2-items.md` does not exist at the repo root
   (`kumitate-shokunin/build/` absent). The artifact lives at
   `.ufo/waves/round-51/build/DistWave1/wave2-items.md`. Recorded so the L1 cites it correctly.

## Finding 1 — version skew: items are stated against A51 v3r5 (8 checks), the counters are now v3r6 (9 checks)

`hold()` in `attest51-probe.mjs` lists A1, A2, A2c, A3, A3c, A4, A4c, **A3d**, A5. The ninth
check A3d (lines 309–335: corrupt the stored `digest` field to `f`×64, recompute the sidecar,
require `RECEIPT: REPLAY` exit 1) is a DIGEST-BINDING challenge arm that **largely closes item 1**
("stored digest never validated"). `wave2-items.md` was never re-baselined; every "8 checks" /
v3r5 statement in it is stale by one check. D51 is unchanged (D1–D5). `MutCounters` covers A3d
(its text says "A51's 9 checks"), `RevA51Rerun` re-runs it — the residual for item 1 is only to
confirm A3d PASS in those transcripts.

## Coverage map (condensed)

Legend: ✓ covered by a named seat · ◐ partial (real-data/judgment side covered; fix-arm or
wording residual open) · ✗ uncovered by every seat.

| Items | Subject | Coverage |
|---|---|---|
| 1 | digest-field validation | ✓ closed by A3d (v3r6) + MutReceiptBytes digest flip + CritReceiptsHand hand recompute |
| 2 | counter discrimination mutants as controls | ◐ MutCounters proves invertibility; the two named weak-run mutants are not replayed |
| 3, 15 | semantic tamper + recomputed sidecar | ◐ A3d covers the digest field; CritA2Span/CritA3eGap cover the prelude; `exit`/`stdout_sha256` variant open |
| 4 | canonical-form twin match | ◐ RevInstrument + MutShipped audit the shipped canon; probe-twin equality unasserted |
| 5 | A1 selftest content floor | ✗ |
| 6 | nonce freshness across probe's own runs | ✗ (CritReceiptsHand checks the committed receipts' nonces — a different object) |
| 7 | unanchored verdict regexes | ✗ |
| 8 | prelude-less receipt accepted by A2 | ✗ |
| 9 | first-`{`-line misparse | ✗ |
| 10 | sidecar cwd sensitivity | ◐ instrument side covered (RevInstrument); probe-side emission/cwd open |
| 11 | pin regex unscoped | ✗ |
| 12 | proxy-check executed from scored rev | ✓ RevA5Pin runs the **extracted** proxy-check from git archive |
| 13 | GATE_PIN chain → MATCH exit 0 at close | ✓ RevA5Pin + RevHarm H3 + MutStanza |
| 14 | doctored control's construction | ✓ CritReceiptsHand independently recomputes the control |
| 16 | A4 sweep name-filter | ◐ ScoutPriorSweep2 re-runs the filtered sweep; widening open |
| 17 | sweep skips unreadable files | ✗ |
| 18 | evidence read after tool executes (cwd=T) | ✗ |
| 19 | extraction caveats (symlink/export-subst) | ✗ |
| 20 | `bash -lc` spawn | ✗ |
| 21 | full env inheritance | ✗ |
| 22 | D2 hollow clauses | ◐ RevD51Rerun judges the real entry; probe hardening open |
| 23 | one blob bound 12× | ◐ RevD51Rerun (distinctness observable); counter edit open |
| 24 | fenced-code clauses count | ✗ |
| 25 | unconstrained binding target | ◐ RevEntryClauses recomputes every binding; allowlist open |
| 26 | D3 used-by substring test | ◐ CritSourcesRows checks the real cells; exact-match open |
| 27 | mined status self-attested | ◐ ScoutReopenS100/S101 bind sha↔fresh fetch; probe arm open |
| 28 | tier inflation invisible | ◐ CritSourcesRows judges tier-A defensibility; machine check open |
| 29 | D4 trusts the rev's own checker | ✗ (RevA5Pin extracts proxy-check but nobody extracts sources-check) |
| 30 | D5 live-only | ✗ |
| 31 | census executable unauthenticated | ✗ |
| 32 | D1 trio vacuity (S1000 substring) | ✗ |
| 33 | decorative line-0 citation survives D4 | ✗ |
| 34 | URL↔id unordered | ◐ CritSourcesRows row cells; adjacency rule open |
| 35 | D1 window drift slice(0,5) vs "three lines" | ✗ |
| 36 | D2 "each" drift | ◐ RevD51Rerun clause↔binding judgment; note/fix open |
| 37 | D3 row-filter crash (FAIL-CLOSED) | ✗ |
| 38 | indented rows missed | ✗ |
| 39 | quote the full held line | ✓ RevA51Rerun |
| 40 | plan §C1 superseded ledger sentence | ✗ (plan-edit residual for L1/close) |
| 41 | do-nothing kill rule wording | ✓ CritClaims (b) |
| 42 | `A51` label missing in §C1 sentence | ✗ (one-line plan edit at close) |
| 43 | header exit-2 re-read at close | ◐ RevA51Rerun observes header live; explicit re-read open |
| 44 | repairs list + re-hash frozen files | ✓ RevFreezeGenealogy (per commit) + RevW2Scope (re-hash) |
| 45 | A2c outOk dead discriminants | ✗ |
| 46 | lineage + run from committed bytes | ✓ RevW2Scope + RevA5Pin (git-archive extraction) |
| 47 | Q39/K restatement risk / threat matrix | ✓ CritClaims (c) + RevEntryClauses |
| 48 | S100 NTP/frequency distinction | ✓ CritSourcesRows |
| 49 | S100 hrtime scope | ✓ CritSourcesRows (scope defensibility) |
| 50 | S101 CSPRNG bridge | ✓ CritSourcesRows |
| 51 | opened UTC convention | ✗ |
| 52 | used-by path exists / same revision | ✓ ScoutCensus2 + CritSourcesRows (--strict CLEAN) |
| 53 | lesson Gate fields | ✗ |
| 54 | lesson Mistakes M-entries | ✗ |
| 55 | Q39 ceiling verbatim | ◐ judged by CritClaims/RevengerClose; verbatim grep open |
| 56 | ledger addendum-4 semantics | ✓ CritLedger (a)(b)(c) |
| 57 | verdict precedence / exits | ✓ RevInstrument + MutReceiptBytes |
| 58 | digest removal procedure | ✓ RevInstrument + CritReceiptsHand (hand recompute) |
| 59 | canonical-JSON pinned in entry | ◐ RevInstrument audits code; entry-text pin open |
| 60 | sidecar byte format (GNU text) | ✓ RevInstrument + MutReceiptBytes + MutShipped |
| 61 | no sha256sum/spawn in shipped tool | ✗ (one-grep residual) |
| 62 | run exits 0, writes both files | ✓ RevInstrument |
| 63 | run spawns without shell | ✓ RevInstrument |
| 64 | prelude first line, Date.parse-able | ✓ RevInstrument (prelude/wall window) |
| 65 | mono key unpinned | ✗ |
| 66 | sidecar resolved next to receipt | ✓ RevInstrument |
| 67 | clock rule not over-tightened | ✓ RevInstrument + CritA2Span boundary measurement |
| 68 | selftest hermeticity | ◐ RevInstrument runs selftest; isolated-mktemp run open |
| 69 | verdict last line | ✓ RevInstrument |
| 70 | flake case re-signs sidecar | ✗ |
| 71 | same-body-duplicate → VALID case | ✓ CritLedger (b) |
| 72 | argv secret sweep | ✓ SentSecrets2 |
| 73 | trusted-writer assumption stated | ✗ |
| 74 | birthday bound stated | ✗ |
| 75 | A re-derivation | ✓ RevStanza |
| 76 | C2_total README-row drift | ✓ RevStanza + ScoutCensus2 (measurement; fix is L1's) |
| 77 | coverage-axis integer | ◐ RevStanza/ScoutCensus2 produce the inputs; the floor(10×n/n) assert open |
| 78 | DRIFT kinds, never MATCH | ✓ RevA5Pin + MutStanza + RevHarm H3 |
| 79 | C=23 + item executes | ✓ RevChecklist23 + MutSkillItem |
| 80 | baseline item-identity, not count | ◐ MutSkillItem mutates identity fields; 22-item set diff open |
| 81 | SKILL registry row mirrors bind-oracle | ✗ |
| 82 | capabilities row + pin = shipped sha | ✓ RevA5Pin (hand sha256) |
| 83 | H2/H4/H5 baselines retrospective | ✓ RevHarm |
| 84 | G50 re-derive then 8/8 | ✓ RevHarm H5 |
| 85 | H7 confidentiality arm | ◐ SentSecrets2 runs the sweep; arm addition open |
| 86 | A4 walked-set sentence | ◐ ScoutPriorSweep2 runs it; sentence restatement open |
| 87 | `run-at=` vs `run-at:` drift | ◐ RevEntryClauses prose read; explicit statement open |
| 88 | no sibling paths in D2 clauses | ✓ RevEntryClauses (recompute catches non-resolving targets) |
| 89 | nonce-ledger naming vs kake r44 | ◐ ConnOverlap2 rescans siblings; registry wording assert open |
| 90 | freeze-hash discipline at close | ✓ RevW2Scope |
| 91 | containment grammar extension | ◐ RevW2Scope audits wave-2 writes; orchestrator-artefact disposition open |
| 92 | corrected `round-{48,49,50}` find | ◐ ScoutPriorSweep2 carries the sweep; close-evidence wording open |
| 93 | closure claim scope | ✓ CritClaims (a) + RevengerClose |
| 94 | zero-run minting stays a limit | ✓ CritClaims (b) |
| 95 | Q39 ceiling survives the round | ◐ (shared with 55) |
| 96 | C2 = mechanism record | ✓ CritClaims (c) + RevEntryClauses + RevD51Rerun |

Tally: **38 items fully covered · 26 partial · 32 uncovered** (96 total).

## Seat-level duplications

- **D1 — RevChecklist23 ⊂ MutSkillItem.** Both scratch-mutate SKILL.md checklist item 23 and
  require the probe to fail it; RevChecklist23's single mutation (wrong expected substring) is one
  of MutSkillItem's three mutations. RevChecklist23's unique residue is only the
  23/23-with-execution proof (also obtained by RevHarm H1 and implicitly by MutSkillItem).
  Recommendation: keep MutSkillItem as the mutation seat; RevChecklist23 need not repeat its
  mutation arm.
- **D2 — CritA2Span ∩ CritA3eGap.** Both construct the ≥300s re-dated receipt with a recomputed
  sidecar against the shipped verify (A2Span to "prove the M2 class still fails", A3eGap as its
  main experiment). A2Span's unique residue is the ≤60s inside-window boundary; A3eGap's is the
  arm-vs-limit verdict. One shared /tmp forgery would serve both.
- **D3 — RevHarm overlaps three seats on single commands** (H4 census ≡ ScoutCensus2's census;
  H1 `--checklists` ≡ RevChecklist23's run; H3 `--strict` ≡ RevA5Pin's run). Harmless in a
  falsification wave (independent re-runs are the point) — noted, no action.
- **D4 — RevInstrument vs MutShipped:** same target (instrument contract) by audit vs mutants.
  Complementary methods, not duplication.
- **D5 — RevengerClose ∩ CritReportContract:** both are close-report meta (disagree-list vs
  section/evidence risk map). Distinct outputs; the actual re-hash belongs to RevW2Scope.

## Uncovered items → residual-call candidates (numbered, one-line method each)

No residual work was started, per tasking.

1. **Item 5** (A1 selftest content unchecked) — run `receipt-attest.mjs --selftest`; assert ≥10
   `ATTEST_CASE:` PASS lines and ≥1 `RECEIPT: REPLAY` case line.
2. **Item 6** (nonce freshness) — run the instrument's `run` three times in /tmp and assert the
   three receipts' nonces are pairwise-distinct; the standing probe arm would add that assert.
3. **Item 7** (unanchored verdict regexes) — feed `RECEIPT: VALID RECEIPT: TAMPERED` through the
   probe's match in /tmp to show it satisfies, then anchor `^…$` on the exact last line.
4. **Item 8** (prelude-less receipt) — strip the `run-at:` line from a /tmp receipt copy; record
   that A2 still PASSes on the `wall_start` fallback.
5. **Item 9** (first-`{`-line parse) — prepend a banner ` {` line to a /tmp receipt copy, re-run
   the counter, record A2's misparse.
6. **Item 11** (pin regex unscoped) — append a second `pin.receipt-attest=<64hex>` outside the
   gate-pins block in a /tmp SCORECARD copy; record which value the probe/proxy-check reads.
7. **Item 17** (silent skip in sweep) — `chmod 000` a basename-matching file in a /tmp sweep
   corpus; record that the skip is uncounted in the detail line.
8. **Item 18** (evidence after execution) — code-read `attest51-probe.mjs`: the tool runs with
   `cwd=T` before receipts are read; report line numbers and the snapshot/outside-cwd fix.
9. **Item 19** (extraction caveats) — `git show <rev>:scripts/receipt-attest.mjs | sha256sum` vs
   the extracted copy's sha; lstat-refuse symlinks on scored paths.
10. **Item 20** (`bash -lc`) — `grep -n bash attest51-probe.mjs`; record PATH/`$(…)` expansion
    risk; argv-array fix.
11. **Item 21** (env inheritance) — code-read the probe's spawn for `process.env` pass-through;
    minimal-allowlist fix.
12. **Item 24** (fenced-code clauses) — put a `- receipt:…` bullet inside a fenced block in a /tmp
    entry copy; record the D2 count inflation.
13. **Item 29** (D4 self-attested checker) — extract `sources-check.mjs` from 7d88faa via git
    archive, re-run D4's invocation, compare verdict to the working-tree run.
14. **Item 30** (D5 live-only) — record `sha256(sources-census.sh)` + fleet-registry sha256 in the
    probe's D5 detail so readings are reproducible.
15. **Item 31** (census unauthenticated) — pin the census script's sha256 into the probe; a stub
    `exit 0` census in /tmp must then fail.
16. **Item 32** (D1 trio vacuity) — require non-empty `verified-at:`/`recheck:` in ISO shape;
    demonstrate key-presence-only and `S1000`-substring passing today.
17. **Item 33** (decorative citation) — build a /tmp SOURCES copy with a line-0 `source: S001`
    header plus S100/S101 below; record D1+D4 PASS (fix: first line carries both ids).
18. **Item 35** (window drift) — one-line close-note reconciling plan "first three lines" vs probe
    `slice(0,5)`; counter is normative.
19. **Item 37** (crash-vs-miss) — a short `| S100 |` row in a /tmp SOURCES copy must MISS cleanly,
    not FAIL-CLOSED exit 2; guard `(c[11] ?? '')`.
20. **Item 38** (indented rows) — a 2-space-indented row in a /tmp SOURCES copy shows the D3
    filter missing what real checkers accept; relax to `^\s*\|`.
21. **Item 40** (plan ledger sentence) — close-note edit restating the addendum-4 same-digest
    exemption in §C1's body.
22. **Item 42** (A51 label) — one-line plan edit adding `(rule A51)` to the §C1 predicate sentence,
    mirroring D51.
23. **Item 45** (A2c outOk dead discriminants) — code-read the three byte-identical comparisons
    (probe ~lines 150–176); collapse to one.
24. **Item 51** (opened convention) — assert S100/S101 `opened` cells carry the true UTC fetch
    instants (`2026-10-24T01:59:31Z` / `01:59:28Z`) under one stated convention.
25. **Item 53** (lesson Gate fields) — grep `corpus/lessons/round-51.md` `## Gate` for S100 and
    S101, each with URL + UTC instant + ≤25-word located quote.
26. **Item 54** (lesson Mistakes) — assert `## Mistakes` carries this round's two new mined
    classes (unexecutable counter; column-index-unpassable counter) with the repair commits named.
27. **Item 61** (no spawn) — `grep -nE 'sha256sum|spawn|execFile|execSync'
    scripts/receipt-attest.mjs` must be empty (all digests via `node:crypto`).
28. **Item 65** (mono key unpinned) — print a receipt JSON line's keys and assert the entry names
    the monotonic-span field exactly (pin one key).
29. **Item 68** (selftest hermeticity) — copy the script alone into an empty mkdtemp and run
    `--selftest`; it must PASS with no lane or env dependency.
30. **Item 70** (flake case re-sign) — code-read the selftest flake case; assert it recomputes the
    sidecar over the doctored bytes and reads `REPLAY`, not `TAMPERED`.
31. **Item 73** (trusted-writer limit) — grep the entry for the trusted-writer/append-only
    statement; absent, add it as a declared limit.
32. **Item 74** (birthday bound) — assert the entry states the 128-bit nonce collision bound
    (≈1.75e-36 at n=35) as a stated bound.
33. **Item 81** (registry row format) — diff the new SKILL.md `receipt-attest` row against the
    `bind-oracle` row's format; assert the contract name `kumitate-receipt-attest-v1`.

### Partial-coverage residuals (real-data side covered; the named residual is open)

P1. **Item 2** — replay the two wave-1 weak-run mutants (no-ledger-nonce-check;
    no-inner-digest-byte-ledger) against v3r6; expect `UNMET` 8/9 with the named MISS arms; keep
    as standing controls (MutCounters only proves check invertibility).
P2. **Items 3/15** — flip `exit` in a /tmp receipt copy and recompute the sidecar; shipped verify
    must read `REPLAY` (A3d covers the digest field; CritA2Span/CritA3eGap cover the prelude).
P3. **Item 4** — assert the probe twin's textual canonical splice (A4c) equals the shipped
    instrument's canonical form (RevInstrument/MutShipped audit only the shipped side).
P4. **Item 10** — assert emitted sidecars carry the receipt basename and `verify` resolves them
    relative to the receipt from a foreign cwd (probe-side emission check).
P5. **Item 16** — widen the A4 sweep to all committed `.txt`/`.json` outside round-51, or state
    the finite walked set (162 files) in the plan sentence.
P6. **Item 22** — probe edit: require non-empty clause prose before the binding token.
P7. **Item 23** — probe edit: require ≥12 distinct bound paths.
P8. **Item 25** — probe edit: D2 path allowlist (`scripts/`, `corpus/`, `.ufo/waves/round-51/`).
P9. **Item 26** — mirror `splitUsedBy` exact-match in D3 (current: substring).
P10. **Item 27** — probe arm binding the recorded body sha256 to the committed fetched-bytes
     artifact (ScoutReopenS100/S101 cover only this round's two rows).
P11. **Item 28** — bind tier to observed source kind, or declare tier as a stated limit.
P12. **Item 34** — D1 adjacency requirement: clock_gettime URL beside S100, getrandom beside S101.
P13. **Item 36** — implement `bound.length === clauses.length` in a future revision; note the
     plan's stronger reading in the lesson.
P14. **Item 43** — explicit re-read of the A51 header against the code at close (repair-5 wording).
P15. **Item 55** — grep entry + lesson + close report for the verbatim Q39 ceiling sentence.
P16. **Item 59** — assert the entry text pins the canonical-JSON definition (recursive
     lexicographic sort, no-space separators, arrays in order).
P17. **Item 68** — run `--selftest` from an empty mkdtemp with the script alone.
P18. **Item 77** — derive coverage from ScoutCensus2's histograms (`floor(10×n/n)`) and assert the
     `## Axes` row still reads 10.
P19. **Item 80** — diff the executed 23-item set against the round-open 22-item set by
     (command, expected exit set, expected substring).
P20. **Item 85** — add the receipts-confidentiality sweep (SentSecrets2's command) to the plan
     harm list as H7, counts only.
P21. **Item 86** — restate the plan's A4 parenthetical to the code's actual walked set.
P22. **Item 87** — state the round-51 `run-at:` format explicitly in the entry (Q39 uses `run-at=`).
P23. **Item 89** — assert the SCORECARD capability row's wording names the nonce ledger, distinct
     from kake r44's `ledger_latest_check.py` family.
P24. **Item 91** — extend the audited containment grammar to the six orchestrator dispatch
     artefacts, or relocate them (L1 decision).
P25. **Item 92** — use `round-{48,49,50}` (not `round-4{8,9,50}`) in the close evidence.
P26. **Items 95** — covered by judgment (CritClaims); residual shared with P15 (verbatim grep).

## Dependencies

None absent: the distillation, dispatch JSON, both probes, and the wave-1 reports were all
readable. No file was created under the lane except this report; no runnable extension written.

## Tradeoffs

Coverage was judged from dispatched task text, not from completed w2 reports (none were complete
at run time and this seat does not wait on siblings). A seat may incidentally cover a residual
while executing its task; the L1 should re-check the ✗/◐ rows against filed w2 reports before
spending residual calls. Item↔seat mapping is judgmental where a task text names a class only by
example; those were marked ✓ only when the named example is the item's substance.
