# Wave-2 attack items — kumitate round 51 (wave 1 synthesis)

Seat: `DistWave1` (synthesis). Inputs: every peer report present under
`.ufo/waves/round-51/w1/` at synthesis time — **21 reports** (ConnSiblingOverlap, CritC1, CritC2,
CritFreeze, CritHarm, ExecBaseCounter, ExecSelftestArms, LabratClocks, RevCounterA, RevCounterD,
RevInstrumentContract, RevPlan, RevScope, RevengerGap, ScoutBaselineHar, ScoutClockSource,
ScoutRandomSource, ScoutReceiptCorpora, ScoutSiblingLanes, SentReceipt, SonicAudit).
Late reports are not this list's input. **11 of the 32 wave-1 seats filed no report** at synthesis
time (ExecInstrument, ExecForgerControl, ExecPinsRecipe, MutInstrument, MutCounter,
LabratM2Replay, ScribeEntry, ScribeSources, ScribeLesson, ExecSelftestExec) — their surfaces are
therefore covered only by the counter/code-path sections below and by the build artefacts present
under `build/`, not by a peer report. Counter bytes at synthesis time:
`attest51-probe.mjs` sha256 `f3169a676ede4265d00355cae9e900e70ee27043f624d3c28306249b26348d32`
(A51 **v3r5**, 8 checks: A1, A2, A2c, A3, A3c, A4, A4c, A5); `doctrine51-probe.mjs` sha256
`f2d27071241489122a683269938a19bc17607be967880ece0aaf9e651983e8a0` (D51, 5 checks);
`plan.md` sha256 `c23b6881b11795e92fd0300f4a54a276dcb47a8016d4bdd8b6b8ed328c0b262e`.
A **fifth freeze repair** (`4b8da21`, "A4c REPLAY challenge arm + plan body arithmetic (8 checks)
+ header exit-2 claim fix, per RevPlan") landed during synthesis; the items below are stated
against these bytes, and §C1's body arithmetic was repaired in the same commit (addendum item 7).

Each item names WHAT it attacks and gives a one-line method. Severity in brackets:
`CRIT` = falsifies a scored predicate; `HIGH` = can make the round's own close read wrong;
`MED` = weakens a claim or leaves a real hole; `LOW` = drift/hygiene.

## A. Counter A51 — instrument/attest predicate (`attest51-probe.mjs` v3r5)

1. **A51 v3r5 — the stored `digest` field is never validated by any arm** (CRIT; observed at the
   current bytes). A tool that writes a **constant** `digest` field (`f`×64), never checks it in
   `verify`, and computes a body fingerprint *only* inside the ledger walk scores
   `ATTEST_HELD held=8/8` exit 0. The probe **writes** a digest for its own A4c twin (line 279) but
   never **reads and recomputes** a receipt's stored `digest` (only occurrences of the token in
   the probe are the `sha()` helper, the A4c twin-construction `digest` destructure, and the
   twin's own digest write). Method: probe-side recompute of the receipt's stored digest over the
   canonical semantic body and assert a mismatch → `REPLAY`; the C1 claim "the `digest` field
   binds every semantic field" is currently unscored.
2. **A51 v3r5 whole-counter discrimination — the ledger *is* now exercised** (partly closed by
   repair 5): a real-`run` implementation with **no ledger nonce check** now reads
   `ATTEST_UNMET held=7/8` (`A4c MISS … ledger(orig)=RECEIPT: VALID`), and one with **no inner
   digest** but a byte-comparing ledger reads `held=7/8` (`A4 MISS … RECEIPT: REPLAY` — a
   byte-comparing ledger wrongly flags the M2 twin). Method: keep both mutants as standing
   regression controls so a future repair cannot silently re-open either hole.
3. **A2c/A3c arms — a semantic-field tamper with a recomputed sidecar is still untested** — forge
   `exit` (or `stdout_sha256`) in a receipt's JSON and **recompute the sidecar**; the sidecar check
   passes and only an inner-digest check would reject it. Method: probe-side recompute of the
   inner digest over the semantic fields; assert a semantic tamper → `REPLAY`.
4. **A4c arm — the probe's twin digest is the probe's own canonical hash, not the contract's
   stored field** — the twin is built by `JSON.stringify(sortKeys(rest))` with the digest appended
   textually (`canon.slice(0,-1) + ',"digest":"…"}'`), which assumes a specific canonical
   serialization; an instrument that canonicalizes differently (e.g. keeps insertion order, or
   sorts only top-level keys) will compute a different digest and the twin will not validate.
   Method: assert the shipped instrument's canonical form matches the probe's
   (recursive lexicographic sort, no-space separators) — this pins the contract's canonical-JSON
   definition, which is currently unspecified (see item 57).
5. **A1 arm — selftest content is unchecked** — a zero-case `--selftest` printing
   `ATTEST_SELFTEST: PASS` clears A1. Method: count ≥10 `ATTEST_CASE:` PASS lines in the selftest
   output, and require a `RECEIPT: REPLAY` case line (the REPLAY class is currently asserted
   nowhere outside the tool's own suite).
6. **A2/A2c/A3c/A4c arms — the instrument's nonce freshness is never checked** (CRIT; observed at
   the current bytes). The probe issues **three** `run` invocations (A2c, A3c, A4c) but never
   compares their nonces: a tool whose `run` always emits nonce `0`×32 — every receipt it will
   ever write carries the same nonce — still scores `ATTEST_HELD held=8/8` exit 0. A2's distinctness
   check reads the *committed* receipts' parsed `nonce` fields, which the tool does not generate at
   scoring time, and A4's prior-corpus sweep only greps those same three committed nonces.
   Method: assert that the probe's own successive `run` receipts carry pairwise-distinct nonces;
   this is the only arm that can test the plan's "freshness of nonces across a ledger" claim.
7. **A1/A2/A3 verdict regexes are unanchored** — `NOT RECEIPT: VALID` or
   `RECEIPT: VALID RECEIPT: TAMPERED` satisfy the patterns. Method: anchor to `^RECEIPT: (VALID|
   REPLAY|TAMPERED)$` on the exact final line.
8. **A2 arm accepts receipts with no `run-at:` prelude** — it falls back to `j.wall_start`.
   Method: require the prelude line's presence in the probe-side parse.
9. **A2 arm — probe-side metadata parse picks the first `{`-line** — a banner brace line
   mis-parses. Method: parse the **last** `{`-line and require exactly one JSON line.
10. **A2c arm — sidecar `sha256sum -c` is cwd-sensitive** — a basename sidecar resolves only from
   the receipt's own directory; the probe runs with `cwd=T`. Method: emit `<64hex>␠␠<basename of
   the receipt file including .txt>` and have `verify` resolve the sidecar target relative to the
   receipt's directory, never the process cwd.
11. **A5 arm — the pin regex is unscoped** — `/pin\.receipt-attest=([0-9a-f]{64})/` matches
    anywhere in `SCORECARD.md`, not just the `kumitate-gate-pins-v1` block. Method: scope the match
    to the block's byte range.
12. **A5 arm — `proxy-check.mjs` is executed from the scored rev** — a two-line stub printing
    `PROXY: MATCH` satisfies the arm (observed). Method: extract the validator from the freeze
    commit, or pin its sha256.
13. **A5 arm — the shipped instrument's own pin cannot be placed** — `pin.receipt-attest` inside the
    gate-pins block makes `proxy-check --strict` **fail closed exit 2** with
    `GATE_PIN_KEY_UNKNOWN` (observed); the v1 stanza rejects it with `STANZA_KEY_UNKNOWN`. Method:
    add the key to `scripts/proxy-check.mjs` `GATE_PINS` and re-pin `pin.proxy-check`; assert
    `PROXY: MATCH` exit 0 at the close rev.
14. **A3 arm — the doctored control's M2 construction is never verified** — the probe checks only
    that the tool says TAMPERED on a filename. Method: probe-side assert the control differs from
    run-2 **only** on the `run-at:` line and that its sidecar bytes equal run-2's sidecar bytes.
15. **A3c arm — the prelude-rewrite + intact-sidecar pair is the only live forgery tested** — the
    "semantic field edited, sidecar recomputed" forgery is untested. Method: add that vector.
16. **A4 prior-corpus sweep is name-filtered** — only basenames matching
    `/receipt|ReRun|L1-score/i` are opened, so a nonce reused into any other path (or outside
    `.ufo/waves`) evades it. Method: widen the sweep to all committed `.txt`/`.json` under
    `.ufo/waves`, or state the finite walked set in the plan sentence.
17. **A4 sweep skips unreadable files silently** — a nonce in an unreadable prior file is missed.
    Method: count skipped files in the probe's detail line instead of `continue`-ing.
18. **A51 probe is rev-controlled code executing before evidence is read** — the tool under test runs
    with `cwd=T` **before** the probe reads the receipts, so it can rewrite every byte it is later
    asked to measure. Method: snapshot all scored paths' bytes before the first tool execution and
    run the tool with `cwd` outside `T`.
19. **A51 probe `git archive | tar -x` extraction caveats** — symlinks are followed by
    `existsSync`/`readFileSync`/`statSync`; `export-ignore`/`export-subst` can rewrite bytes at
    archive time. Method: `lstat`-refuse symlinks on scored paths; assert the extracted script's
    sha equals `git show <rev>:<path>`'s.
20. **A51 probe spawns `bash -lc`** — a login shell makes PATH/`tar` resolution host-dependent, and
    `$(…)` inside the double-quoted rev expands. Method: use an argv array (no shell) for
    extraction.
21. **A51 probe inherits the full `process.env`** — a counted rev can write outside `T`. Method:
    scrub the child env to a minimal allowlist.

## B. Counter D51 — doctrine/entry predicate (`doctrine51-probe.mjs`)

22. **D2 — hollow clauses pass** — twelve identical `- receipt:<path>@sha256:<hash>` lines with no
    prose read `clauses=12 bound=12 miss=0 → D2 PASS` (observed at the repaired bytes: a 12-bullet
    entry with no content reads `DOCTRINE_HELD held=5/5`). Method: require distinct binding targets,
    non-empty clause prose before the binding token, and an allowlist of paths.
23. **D2 — one blob bound 12× counts 12** — no distinctness requirement. Method: require ≥12
    *distinct* bound paths, or a distinct-clause-count floor.
24. **D2 — `- ` lines inside fenced code count as clauses.** Method: strip fenced blocks before
    counting.
25. **D2 — the binding target is unconstrained** — any committed path qualifies, including
    `corpus/SOURCES.md` itself and the probe file. Method: restrict to a path allowlist
    (`scripts/`, `corpus/`, `.ufo/waves/round-51/`).
26. **D3 — `used-by` is a substring test** — `attic/corpus/knowledge/invocation-attestation.md` or
    `…invocation-attestation.md.bak` satisfies D3 while the real sources-check only warns
    (`USED_BY_ASYMMETRY` is warn-severity and never moves the exit code). Method: split the cell on
    `,`, trim, drop `—`, exact-match against the entry (mirror `splitUsedBy`).
27. **D3 — `mined` status is self-attested** — no gate binds fetched bytes, a hash, or a located
    quote; rows with `teaches=hollow` and any URL pass. Method: add a probe arm binding the
    recorded body sha256 to a committed fetched-bytes artifact.
28. **D3 — tier inflation/deflation is invisible** — only `community@A` is machine-flagged; a
    `docs` row self-declares tier A, and `tier C` + mined + used-by is warn-only (W01). Method: bind
    the tier to the observed source kind, or state tier as a declared limit.
29. **D4 trusts the rev's own checker** — `sources-check.mjs` is executed from the extracted rev; a
    rev carrying a weakened checker passes D4 on its own say-so. Method: extract the checker from
    the freeze commit or pin its sha256.
30. **D5 is live-only** — the census ignores both `<rev>` and `<lane>` and reads the mutable fleet
    script plus the live working tree, so the same rev can score 4/5 at one moment and 5/5 later.
    Method: record the census script's sha256 and the live registry's sha256 in the probe's output
    line.
31. **D5 — the census executable is unauthenticated** — anything at
    `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` defines the arm; a stub `exit 0`
    passes. Method: pin the census script's sha256 into the probe.
32. **D1 — trio values are vacuous** — `verified-at:` / `recheck:` test key presence only, and
    `S100`/`S101` are substring matches (`S1000` satisfies). Method: require a non-empty value and
    an ISO date shape.
33. **D1 — decorative citation survives D4** — `sources-check` binds only **line 0** ids, so a
    line-0 `source: S001 …` with S100/S101 text below passes D1 and D4. Method: require the header's
    first line to carry both S100 and S101.
34. **D1 — URL↔id association is unordered** — either man7 URL may pair either id. Method: require
    `clock_gettime` URL adjacent to S100 and `getrandom` URL adjacent to S101.
35. **D1 window drift** — plan §C2 says "first three lines", the probe reads `slice(0,5)`. Method:
    reconcile the plan sentence to the counter (counter is normative and more permissive).
36. **D2 "each" drift** — plan says each clause carries a binding; the probe requires
    `clauses>=12 && bound>=12`. Method: implement `bound.length === clauses.length` in a future
    revision; for r51 note the plan's stronger reading in the lesson.
37. **D3 row filter can crash the counter** — a short `| S100 |` line makes `c[11]` undefined →
    `TypeError` → `FAIL-CLOSED` exit 2 instead of a clean MISS. Method: guard with
    `(c[11] ?? '')`.
38. **D3 row filter misses indented rows** — `^\|` requires column 0 while both real checkers accept
    1–3 spaces of indentation. Method: relax the filter to `^\s*\|`.

## C. Plan ↔ counter ↔ report prose drift (freeze integrity)

39. **Plan §C1 predicate arithmetic — REPAIRED by repair 5, but re-verify at close** — the body said
    "five checks", `held=5/5`; repair 5 (`4b8da21`) rewrote it to eight checks / `held=8/8` and
    the control to `held=0/8`. Method: assert the close report quotes the **full** emitted line
    (`ATTEST51: ATTEST_HELD held=8/8 checks=8 rev=<rev> rule=A51 version=v3 | …`), never the
    plan's `held=5/5` fragment; `ConnSiblingOverlap.md` still tells the integrator to expect
    `held=5/5`.
40. **Plan §C1 ledger sentence states the superseded literal rule** — the body still says "rejects a
    nonce already present"; addendum item 4 replaced it with the same-digest exemption, and repair
    5's A4c arm now *enforces* the clarified rule. Method: restate the body sentence to the
    addendum's rule so the plan and the counter describe one acceptance rule.
41. **Plan §C1's declared do-nothing kill rule — the body is now marked SUPERSEDED, but the
    correction still needs its honest wording** — repair 5 annotated the sentence rather than
    replacing it. Method: restate it positively ("a print-stub is defeated by A2c/A3c/A4c, which
    require real execution and real digest/ledger behaviour") instead of leaving a falsified
    sentence in the predicate body.
42. **Rule label `A51` is absent from §C1's predicate sentence** (present for `D51`). Method: add
    `(rule \`A51\`)` to the §C1 predicate sentence.
43. **A51 header's exit-2 promise — REPAIRED by repair 5** (the header now says a malformed verdict
    line "simply fails its check's pattern (a MISS, not a crash)"). Method: re-read the header
    against the code at close; the remaining live defect is the plan §C1 sentence, not the header.
44. **Addendum "repairs to date" list — REPAIRED by repair 5's item 7, but the list is a moving
    target** — five repairs have landed; any sixth will re-stale it. Method: at close, re-list every
    repair with its commit sha and re-hash all three frozen files.
45. **A2c's `outOk` disjunction compares three byte-identical expressions** — dead discriminants.
    Method: collapse to one comparison.
46. **Both counters were amended FIVE times mid-wave** (one observed torn read of a dirty counter
    file; the fifth landed during this synthesis). Method: at close, re-hash all three frozen
    files, record the full amendment lineage (`06ecbf4` → `1fd8ace` → `3ed875d` → `8c07e88` →
    `8fd3cde` → `4b8da21`), and run the counting command from committed bytes (`git show`) rather
    than the working tree.

## D. Entry / SOURCES / lesson content (C2 substance)

47. **Entry clause — the Q39/K restatement risk** — separate receipts, UTC start, distinct bytes,
    and a pre-registered span are already Q39 and `counter-amendment-discipline.md` C8–C11; twelve
    restatements are not new coverage. Method: require one exercised alteration/threat matrix
    (exact edit → command → observed verdict/exit → responsible layer → remaining trust assumption)
    as the entry's core, cross-referencing Q39/K as the sole policy authorities.
48. **S100 row — "unaffected by NTP" is unsupported** — the page says CLOCK_MONOTONIC is unaffected by
    *discontinuous jumps* but **is** affected by frequency adjustments; RAW is the no-adjustment
    clock. Method: assert the `teaches` cell carries the jump/frequency distinction verbatim.
49. **S100 row — the man page does not establish Node's implementation** of
    `process.hrtime.bigint()`. Method: keep the scope to Linux interface semantics, or open
    version-matched Node/libuv primary sources.
50. **S101 row — the man page does not say "CSPRNG" and does not say Node uses `getrandom`** — the
    string `CSPRNG` occurs 0 times in the fetched body. Method: drop the "kernel CSPRNG interface
    node uses" bridge from plan §C2 and the entry, or ground it separately.
51. **S100/S101 `opened` date convention** — the fetch instants are `2026-10-24T01:59:31Z` /
    `2026-10-24T01:59:28Z` (UTC) while the local date is still the 23rd; the two scout rows propose
    different `opened` values. Method: state the UTC-calendar convention in the row/lesson and
    record the true UTC fetch instants; do not write "fetched 2026-10-23 UTC".
52. **S100/S101 `used-by` path does not exist until the entry lands** — `USED_BY_MISSING` fires
    otherwise. Method: land the entry and both rows in the same revision; verify D4 CLEAN.
53. **Lesson `## Gate` must carry each row's URL, UTC access instant, and ≤25-word located quote.**
    Method: assert the lesson Gate contains both S100 and S101 with those three fields each.
54. **Lesson `## Mistakes` — the round has already mined two new mistake classes** (a frozen counter
    that could not execute; a frozen counter whose column indexes made its predicate unpassable).
    Method: add both as M-entries with the four freeze repairs named, since they are this round's
    own mined mistakes, not the r50 inheritance.
55. **Lesson must record the Q39 ceiling verbatim** — receipts remain author-attested, not temporal
    proof. Method: assert the ceiling sentence appears in the entry and the lesson.

## E. Instrument code path (`scripts/receipt-attest.mjs`)

56. **`--ledger` semantics must implement addendum item 4** — flag a nonce only when another
    receipt binds the **same nonce to a different digest**; exempt the target file and
    byte-identical duplicates. Method: assert `verify --ledger` over a dir holding the M2 twin
    reads `RECEIPT: VALID` for run-2 and `REPLAY` for a same-nonce/different-body receipt.
57. **Verdict precedence and unmapped failure classes** — the contract names no verdict for clock
    disorder and no rule for malformed JSON or a missing sidecar. Method: implement
    sidecar → inner-digest/structure → clocks → ledger, with clock disorder → `REPLAY`, missing or
    malformed sidecar → `TAMPERED` exit 1, unreadable receipt → exit 2, bad args → usage 64.
58. **Digest-removal procedure** — textual excision vs parse-delete-recanonicalize. Method: verify
    by parsing, deleting `digest`, re-serializing canonically (recursive lexicographic key sort,
    no-space separators, arrays in order), and comparing to the stored field.
59. **Canonical-JSON definition is underspecified** — recursive vs top-level sort, array order,
    whitespace, number rendering. Method: pin the definition in the entry so later rounds can
    re-derive it.
60. **Sidecar byte format** — emit `<64 lowercase hex>␠␠<basename of the receipt file>` + newline,
    GNU **text** mode (no `*` binary marker); the embedded name is display data and must not be
    enforced by `verify`. Method: byte-compare the emitted sidecar with `/usr/bin/sha256sum`'s own
    output.
61. **The shipped tool must not spawn `sha256sum`** — a PATH-injected `sha256sum` would flip A1/A3
    (the live chousa-r37 attack). Method: grep the shipped file for `sha256sum`/`spawn`/
    `execFile`/`execSync`; require all digests come from `node:crypto`.
62. **`run` must exit 0 on a successful recording** — the child's exit code is *data* in the
    receipt, not the tool's verdict. Method: assert `run --out <base> -- <cmd>` exits 0 and writes
    `<base>.txt` + `<base>.txt.sha256`.
63. **`run` must spawn without a shell** so the recorded argv is exactly `<cmd...>`. Method: assert
    the receipt's `argv` array equals the command words verbatim.
64. **`run-at:` prelude is display-only but must be the file's first line and `Date.parse`-able** —
    the probe's A2 span uses the prelude in preference to `wall_start`. Method: emit exactly one
    prelude line `run-at: <wall_start.toISOString()>`.
65. **The monotonic-span JSON key is unpinned** — the contract names the concept but not the field.
    Method: pin one key (`mono_ns`) in the entry and in the receipts, since later rounds parse these
    committed artefacts.
66. **`verify` must resolve the sidecar relative to the receipt's directory, not the process cwd** —
    the probe invokes the tool with `cwd` = the extracted tree root while the receipts live in
    `.ufo/waves/round-51/receipts/`. Method: assert `verify` on an absolute path works from any cwd.
67. **Do not tighten the clock rule to `wall_span <= mono_span`** — `Date.now()` is
    millisecond-quantised; the wall span exceeds the monotonic span by up to ~0.7 ms (measured
    280/280 trials). Method: assert the implemented rule is `wall_end >= wall_start && mono >= 0`.
68. **`--selftest` must be hermetic** — all I/O under a fresh `os.tmpdir()` mkdtemp; no lane tree,
    network, or env. Method: run the selftest in an empty mktemp dir with the script copied alone.
69. **The verdict must be the LAST output line** — the probe takes the last line of stdout+stderr.
    Method: assert the selftest's final line is exactly `ATTEST_SELFTEST: PASS`.
70. **The selftest's flake case must re-sign the sidecar** to earn `REPLAY` — a doctored field with
    a stale sidecar reads `TAMPERED`, not the mandated `REPLAY`. Method: assert the flake case
    recomputes the sidecar over the doctored bytes.
71. **The selftest needs the same-body-duplicate-in-ledger → VALID case** — that is the case that
    decides whether A4 can ever pass. Method: assert the case exists and passes.

## F. Receipt confidentiality / trust boundary

72. **Raw `argv` can carry secrets** — a token flag, a password argument, or userinfo in a URL
    lands verbatim in the committed receipt; "no env is recorded" does not protect arguments.
    Method: run the close-revision secret sweep over `*.txt` and `*.txt.sha256` in the receipts dir
    (counts only, never values); add a canary-argument case to the selftest.
73. **A sidecar does not authenticate against a directory writer** — anyone who can write
    `receipts/` can edit the JSON, recompute the public digest, and rewrite the sidecar.
    Method: state the trusted-writer assumption explicitly in the entry, or record it as a
    declared limit; the ledger must live in append-only/protected storage to resist deletion.
74. **128-bit nonce collision is negligible but must be stated** — at n=35 receipts
    `P ≈ 1.75e-36`. Method: carry the birthday bound into the entry as a stated bound, not a proof.

## G. Close-commit integration (stanza, pins, registry, checklist)

75. **The SCORECARD stanza must be re-derived — plan §"Terms expected to move" is wrong.** A is
    already **45** at the round-open tip (43 at base + the two round-51 probe `.mjs`), not 43→44;
    with `scripts/receipt-attest.mjs` the close A is **46**. Method: recompute A from the close
    tree's `RE_RUNNABLE` walk and set the declared value to the measured number.
76. **`C2_total` is already drifted** — 115 corpus notes vs declared 114, because
    `corpus/lessons/round-50-verifier-spotcheck.md` was committed in `d788f74` without a
    `corpus/README.md` row. Method: add the missing README row at close.
77. **The `coverage` axis integer depends on that README row** — with the new entry's README row
    and the round-50 spot-check's row, rows=116 and notes=116 → `floor(10×116/116)=10` (the
    declared value stays correct); without the round-50 row, `floor(10×115/116)=9` → `AXES_DRIFT`.
    Method: assert `## Axes` coverage row 10 still matches the derived value at close.
78. **The close tree's `proxy-check --strict` currently reads `PROXY: DRIFT`** — `A_DRIFT (+3)`,
    `C2_TOTAL_DRIFT (+1)`, `C2_DRIFT (+1)`, `AXES_DRIFT`, and `PIN_UNPINNED` for the new script.
    Method: re-derive every declared term from the close tree and require `PROXY: MATCH` exit 0.
79. **`C` (checklist) must reach 23 and the new item must actually run** — a `[x]`-marked item
    raises the count without executing anything. Method: require `CHECKLIST: 23/23 pass`,
    `CHECKLIST_SKIPPED: 0`, exit 0, and the new item's own PASS line naming
    `node scripts/receipt-attest.mjs --selftest`.
80. **H1's baseline floor must be item-identity, not a number** — marking one old item checked and
    adding one new unchecked item keeps the count at 23 while losing a baseline item. Method:
    compare the executed item set by (command, expected exit set, expected substring) against the
    round-open 22-item set.
81. **The SKILL.md gate-registry row for `receipt-attest`** must mirror the `bind-oracle` row's
    format. Method: assert the row exists and names the contract `kumitate-receipt-attest-v1`.
82. **The SCORECARD capabilities table must gain the `receipt-attest` row** and the pin must be the
    sha256 of the **shipped** bytes, computed after the last edit. Method: assert
    `pin.receipt-attest=<sha256 of scripts/receipt-attest.mjs at the close rev>`.
83. **H2/H4/H5 baselines were never captured** — `base/baseline-gates.txt` holds only the proxy
    line and the 22 checklist lines; no census result and no G50/R50 reading is in it. Method:
    capture them now and label them **retrospective**, not round-open.
84. **H5's G50 arm fails at the tip** — `GUARD_UNMET held=7/8` with `G7 MISS … PROXY: DRIFT`,
    because the freeze tree's two extra probe scripts moved A. Method: re-derive the stanza first,
    then re-run G50/R50 at the close rev and require 8/8 each.
85. **A receipt-confidentiality harm arm is missing entirely** — no H-arm sweeps the published
    receipts for credentials. Method: add the sweep (item 71) as H7 and record counts only.
86. **The plan's A4 parenthetical under-describes the walked set** — the code walks every
    `.ufo/waves` file outside `round-51` whose basename matches `/receipt|ReRun|L1-score/i` (162
    files), not "r49/r50 receipt files". Method: restate the sentence to the code's actual set.
87. **The `run-at=` vs `run-at:` field-name drift** — QUALITY Q39 specifies receipts begin with
    `run-at=<ISO>` while the round-51 contract and the probe's A2 parse use `run-at:`. Method: state
    the round-51 format explicitly in the entry so the two conventions are not confused.

## H. Cross-lane / operational hygiene

88. **Do not cite a sibling lane's path in a D2 clause** — sibling paths are not blobs at the
    kumitate rev, so the binding fails. Method: assert every D2 bound path resolves under the lane.
89. **Keep "nonce ledger" distinct from kake r44's `ledger_latest_check.py`** — same word, different
    family; a shared registry row would let a later census merge them. Method: assert the
    SCORECARD capability row's wording names the nonce ledger.
90. **Freeze-hash discipline for the close critic** — re-hash plan.md and both counters at close
    and record the full repair lineage. Method: assert the close report carries the final three
    sha256 values.
91. **Containment grammar** — the six orchestrator dispatch artefacts
    (`w1-assignments.json`, `w1-dispatch.json`, `w1-spec.json`, `w1-taskcall.json`,
    `w1-validate.json`, `w1/swarm-registry.json`) sit outside `{plan.md, probe/, base/, w1/<Seat>.md,
    build/<seat>/}`. Method: extend the audited grammar or relocate them; assert zero
    seat-attributable violations at wave end.
92. **The A4 sweep's own item command was wrong** — `round-4{8,9,50}` expands to `round-48`,
    `round-49`, `round-450` (round-450 does not exist) and misses round-50 entirely; the corrected
    sweep is `round-{48,49,50}`. Method: use the corrected find in the close evidence.

## I. Round-shape / claim-scoping

93. **C1's closure claim must not outrun its predicate** — at the current bytes `ATTEST_HELD 8/8`
    certifies that the instrument really runs commands (A2c/A3c/A4c), that the sidecar covers the
    whole file (A3/A3c), and that the ledger detects a same-nonce/different-body twin (A4c) — but
    **not** that the stored `digest` binds the semantic fields (item 1) and **not** that the
    instrument generates fresh nonces per invocation (item 6). Method: add those two
    discriminating arms, or restate §C1's closure sentence to exactly what the eight arms measure.
94. **Zero-run minting stays out of scope** — an author who never executes a command can mint three
    internally consistent receipts. Method: keep it in the declared limits (Q39 ceiling) and do not
    let it be quietly upgraded by a passing predicate.
95. **The Q39 ceiling must survive the round** — receipts are author-attested invocation records,
    not cryptographic temporal proof. Method: assert the ceiling sentence in the entry, the lesson,
    and the close report.
96. **C2 must be a mechanism record, not a policy restatement** — the novelty test is the
    mechanism delta (which layer catches which mutation), and it must be *exercised* against the
    shipped instrument, with actual verdicts recorded. Method: assert the entry contains an
    alteration/threat matrix with observed results.

---

**Item count: 96.** Distinct targets: A51 arms A1, A2, A2c, A3, A3c, A4, A4c, A5 (items 1-20);
D51 arms D1-D5 (items 21-38); plan/counter/report prose drift (items 39-46); entry/SOURCES/lesson
content (items 47-55); instrument code path (items 56-71); confidentiality/trust boundary (items
72-74); close-commit integration (items 75-87); cross-lane/operational hygiene (items 88-92);
round-shape/claim scoping (items 93-96).

**Build vs attack findings: 41 build-side, 55 attack-side.**

| Section | Items | n | Kind |
|---|---|---|---|
| A — A51 arms (A1, A2, A2c, A3, A3c, A4, A4c, A5) | 1-21 | 21 | attack |
| B — D51 arms (D1-D5) | 22-38 | 17 | attack |
| C — plan/counter/report prose drift | 39-46 | 8 | attack |
| D — entry / SOURCES / lesson content | 47-55 | 9 | build |
| E — instrument code path | 56-71 | 16 | build |
| F — receipt confidentiality / trust boundary | 72-74 | 3 | build |
| G — close-commit integration | 75-87 | 13 | build |
| H — cross-lane / operational hygiene | 88-92 | 5 | attack |
| I — round-shape / claim scoping | 93-96 | 4 | attack |

Attack-side (55): 21 target A51 arms, 17 target D51 arms, 8 target the plan-counter-report prose,
5 target cross-lane/operational hygiene, 4 target the claim's own wording and scope.
Build-side (41): what the L1 must actually produce — the entry's clause content and alteration/threat
matrix, the S100/S101 `teaches` cells and date convention, the lesson skeleton and `## Gate` ledger,
the instrument's ledger/verdict/canonical-JSON/sidecar/prelude/clock/selftest behaviours, the
confidentiality sweep and trust-boundary statement, and the pin/stanza/README/checklist/SKILL
integration.

**Top 5 highest-severity findings overall:**

- **(item 1, CRIT, observed)** A51 v3r5 never validates the stored `digest` field: a tool writing a
  constant `f`x64 digest and computing its body fingerprint only inside the ledger walk scores
  `ATTEST_HELD held=8/8` exit 0. C1's central "the `digest` field binds every semantic field"
  sentence is unscored by every arm.
- **(item 6, CRIT, observed)** A51 v3r5 never checks the instrument's nonce freshness: a `run` that
  always emits nonce `0`x32 scores `ATTEST_HELD held=8/8` exit 0. The plan's "freshness of nonces
  across a ledger" rests on committed fields the instrument does not generate at scoring time.
- **(items 22, 26, CRIT, observed)** D51 admits a content-free entry at `DOCTRINE_HELD held=5/5`:
  twelve identical receipt-only bullets with no prose pass D2, `used-by` is a substring test, and
  `mined`/tier are self-attested (only `community@A` is machine-checked). C2's grounding is shape,
  not substance.
- **(item 13, HIGH, close-blocker, observed)** `pin.receipt-attest` is unplaceable without editing
  `scripts/proxy-check.mjs` and re-pinning `pin.proxy-check`: the plan's own placement makes
  `proxy-check --strict` fail closed exit 2 with `GATE_PIN_KEY_UNKNOWN`. A5 cannot pass at the close
  commit until that chain is walked, and the plan never mentions it.
- **(items 75-78, 84, HIGH, observed)** The plan's expected close terms are arithmetically wrong and
  the trees already read `PROXY: DRIFT`: A is 45 at the round-open tip and 46 at close (not 43->44);
  `C2_total` is already 115 vs 114 from a missing `corpus/README.md` row; `coverage` derives 9, not
  10, so `AXES_DRIFT` fires; H5's G50 arm reports `GUARD_UNMET held=7/8` for the same reason.

**Five repairs landed during wave 1** (four before this synthesis, one during it): `1fd8aceb` (A51 v1
comment-termination — the counter literally could not execute), `3ed875d3` (D51 D3 column indexes —
`DOCTRINE_HELD` was unpassable as frozen), `8c07e880` (A51 v3 challenge arms A2c/A3c — a print-stub
cleared v2's A1..A4), `8fd3cde1` (A3c genuine-sidecar copy), `4b8da21` (A51 v3r5 A4c REPLAY
challenge + §C1 body arithmetic + header exit-2 claim). Items 39-44 are updated to reflect which of
those defects are closed and which drifted again.
