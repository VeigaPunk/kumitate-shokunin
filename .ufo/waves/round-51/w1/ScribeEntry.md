# ScribeEntry — review pass of the landed C2 entry and the S100/S101 rows

Seat: `kumitate-r51.ProfoundBoar` (item ScribeEntry, wave 1).
Lane read-only for everything except this report. No lane file was edited by this seat:
the entry `corpus/knowledge/invocation-attestation.md` and the rows `S100`/`S101` in
`corpus/SOURCES.md` were landed by the L1 (commits `a476977` … `3aaa25a`) while this seat was
gathering evidence, so this report is a **review of the landed bytes**, not a redraft.
All commands below were run read-only; no git/jj mutation was performed.

## 1. Verdict

The landed artifacts **pass every frozen gate at the current HEAD** and the entry's design
prose is honest about the ceiling it does not close. Two defects survive in the entry's prose
(one medium, one low), both flagged independently by wave-2 seat `RevD51Rerun`
(`.ufo/waves/round-51/w2/RevD51Rerun.md` M-1, L-2) and **still live at HEAD**.

Measured at HEAD `3aaa25a` (the tip moved several times during this review; every gate was
re-run at the tip):

```
node .ufo/waves/round-51/probe/attest51-probe.mjs   <lane> HEAD
  → ATTEST51: ATTEST_HELD held=9/9 checks=9 rev=HEAD rule=A51 version=v3 | A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A3d PASS | A5 PASS
node .ufo/waves/round-51/probe/doctrine51-probe.mjs <lane> HEAD
  → DOCTRINE51: DOCTRINE_HELD held=5/5 checks=5 rev=HEAD rule=D51 | D1 PASS | D2 PASS | D3 PASS | D4 PASS | D5 PASS
node scripts/sources-check.mjs
  → SOURCES_CHECK: CLEAN (rows=101 tiers=A:87,B:6,C:8 status=queued:12,mined:73,rejected:16 entries_with_source=8 legacy=38)   exit 0
node scripts/cite-check.mjs --json     (file: corpus/knowledge/invocation-attestation.md)
  → findings: 0
git archive HEAD | tar -x -C <tmp> && node scripts/proxy-check.mjs --strict   (committed tree)
  → PROXY: MATCH (A=67 C=23 operability=9; C1=19/19 C2=117/117 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=53/53 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)
```

The `A=67` / `C2=117/117` stanza and the `pin.receipt-attest` family are consistent at the
committed tree. A live-worktree `proxy-check --strict` reads `A_DRIFT declared=67 computed=81`
— that delta is **untracked wave-2 seat scratch** (`.ufo/waves/round-51/build/ExecForgerControl/`,
`w2/RevHarm-transcripts/`), not a committed defect; the committed-tree walk above is MATCH.

## 2. Defects still live at HEAD

### M-1 (medium) — the entry's A51 clause states a counter reading that cannot exist

`corpus/knowledge/invocation-attestation.md:31` reads:

> against v3r6 the same forger reads **held=5/8**

Three independent problems, all checkable:

1. **Arithmetic.** v3r6 has **nine** checks (A1, A2, A2c, A3, A3c, A4, A4c, A3d, A5) — the probe
   prints `held=k/9` (`attest51-probe.mjs:361`, `checks.length` = 9). A `/8` reading cannot be
   produced by v3r6. The sentence contradicts its own subject clause ("rule A51 v3r6 (nine checks)").
2. **Provenance.** The only `held=5/8` reading in the lane is **v3r5** (eight checks):
   `.ufo/waves/round-51/w1/RevPlan.md:318` (`ATTEST51: ATTEST_UNMET held=5/8 checks=8 …`) and
   `:327` ("v3 `held=5/7`; my run above records v3r5 `held=5/8`").
   `.ufo/waves/round-51/w2/RevFreezeGenealogy.md:256` states it outright: *"No 9-arm (`v3r6`)
   reading of forger rev `9cb611b7` exists in the lane; the `5/8` figure is from v3r5."*
3. **The bound receipt does not support it.** The clause binds
   `.ufo/waves/round-51/w1/RevCounterA.md@sha256:7510dbd6…` (hash verifies — all 23 receipt
   tokens in the entry resolve and match at HEAD). That report's readings are `held=5/5`
   (v2, `:24`, `:111`) and `held=5/7` (v3, `:127`, `:132`) — **no `5/8` at all**. The
   hash binds a report that does not contain the claimed figure.

A committed v3r6 forger transcript now exists
(`.ufo/waves/round-51/build/ExecForgerControl/transcript-v3r6.txt`, committed) and its readings
are `held=3/9, 4/9, 5/9, 8/9, 9/9` for seven forger variants — no `/8` among them — but the
entry does not cite that transcript (`grep -c "ExecForgerControl\|transcript-v3r6" entry` = 0),
and forger rev `9cb611b7` does not appear in it (`grep -c 9cb611b7 transcript` = 0).

**Minimal correction** (L1's, entry text only): replace the clause tail with the reading that
exists, and cite the receipt that carries it — e.g. "against v3 the same forger reads
`held=5/7` (`receipt:.ufo/waves/round-51/w1/RevCounterA.md@sha256:7510dbd6…`) and against the
committed v3r6 transcript (`receipt:.ufo/waves/round-51/build/ExecForgerControl/transcript-v3r6.txt@sha256:<hash>`)
the forger variants read `held=3/9` … `held=8/9`; no nine-check `/8` reading exists". Do not
assert a v3r6 number that was not measured.

### L-2 (low) — the third receipt is counted but not bound

`corpus/knowledge/invocation-attestation.md:34` claims "**three** receipts, distinct nonces,
pairwise-distinct sha256, span 773.5 s". The entry binds `attest-run-1.txt` and
`attest-run-2.txt` (`grep -o "attest-run-[0-9]*\.txt@sha256" | sort -u` → 1 and 2 only);
**`attest-run-3.txt` is bound nowhere** (`grep -c "attest-run-3" entry` = 0), and neither is the
doctored control `attest-run-2-replayed.txt`. The count of three is therefore asserted over a
corpus of which two members are hash-bound. D2 does not catch this (it counts bound *clause
lines*, not distinct bound artifacts — `RevCounterD` F-1). Low severity because the claim is
true at HEAD (all three committed receipts verify `RECEIPT: VALID`, nonces and sha256 pairwise
distinct) — it is the **binding**, not the number, that is incomplete. Fix: add
`receipt:.ufo/waves/round-51/receipts/attest-run-3.txt@sha256:<hash>` and the replayed control
to that clause.

### Fixed during this review — no action needed (recorded so they are not re-reported)

- **Span figure.** `:34` reads "span **773.5** s"; the committed preludes are
  `02:35:11.057Z → 02:39:06.793Z → 02:48:04.542Z` = **773.485 s** (probe A2 rounds to `773`).
  The earlier "772.9 s" was stale by 0.585 s (`RevD51Rerun` L-1) and was corrected in
  `9d11f4e`.
- **Node → `getrandom()` bridge.** `:29` now reads "the page says nothing about Node
  specifically, and this entry does not claim it does" — the earlier over-claim was corrected;
  wave-2 `ScoutReopenS101.md` had flagged the residual wording.
- **Header order / D1.** The trio is now the first three lines (`source:` / `verified-at:` /
  `recheck:`), which is what D1 and `sources-check`'s `lines[0].startsWith('source:')` require.
  Before the L1's repair the H1 title occupied line 1, which made D1 MISS
  (`S101`, the getrandom URL, `verified-at:` and `recheck:` all fell outside the 5-line window)
  **and** made `scripts/sources-check.mjs` report `ENTRY_HEADER_REQUIRED` — that error was
  breaking checklist item 697 (`node scripts/sources-check.mjs` → exit 0 + `SOURCES_CHECK: CLEAN`),
  i.e. harm rule **H1**. Measured at that intermediate state: `CHECKLIST: 22/23 pass`, `VERDICT: FAIL`.
  At HEAD the registry gate is CLEAN and the checklist item passes.
- **D2 bindings.** The tokens were wrapped across physical lines, so the probe (which scans
  whole lines) saw `bound=5` of the required 12 → `D2 MISS clauses=12 bound=5`. Now every
  clause line carries its token on the same physical line: **13 clause lines, 13 bound**,
  `d2miss=0`, `D2 PASS`.

## 3. Independent verification of the landed entry's substantive claims

**All 23 receipt bindings resolve and match at HEAD** (22 distinct paths, one reused):
every `receipt:<path>@sha256:<hex>` token was checked with `git show HEAD:<path>` and a
recomputed sha256 — 0 absent, 0 mismatched.

Claims re-derived from the committed bytes, not from the entry's prose:

| claim | how verified | result |
|---|---|---|
| prelude-only rewrite with a stale sidecar → `RECEIPT: TAMPERED` | rewrote only line 1 of the committed `attest-run-1.txt`, left the sidecar | `RECEIPT: TAMPERED`, exit 1 — **confirmed** |
| re-dated prelude beyond the tolerance, **sidecar recomputed** → rejected | rewrote the prelude by −300/+300/+600 s and re-signed the sidecar | `RECEIPT: TAMPERED`, exit 1 — **confirmed** (matches `w2/CritA3eGap.md`) |
| the accepted prelude tolerance is ≈ ±60 s | offsets swept against the shipped tool: 30 s → `VALID`, 59 s → `VALID`, 61 s → `TAMPERED` | **confirmed**; matches `w2/CritA2Span.md`'s `[−60 000, +60 073] ms` and `PRELUDE_SLACK_MS = 60_000` (`scripts/receipt-attest.mjs:75`) |
| a re-date **inside** the tolerance is not detectable | prelude +30 s with a recomputed sidecar | `RECEIPT: VALID`, exit 0 — **confirmed**; the entry states this as the ceiling, and it is correctly labelled "indistinguishable from clock jitter — that boundary is the Q39 ceiling, not a defect" |
| the 27-case selftest passes | `node scripts/receipt-attest.mjs --selftest` | `ATTEST_CASES: 27 passed, 0 failed` / `ATTEST_SELFTEST: PASS`, exit 0 — **confirmed** |
| before-state `ATTEST_UNMET held=0/9` at base `c90b9de9` | read `base/attest-base-v3r6.txt` | line 1 reads exactly `held=0/9 … exit 1` — **confirmed** |
| three receipts, distinct nonces, pairwise-distinct sha256 | parsed the three committed receipts' `nonce` / `wall_start` | 3 distinct nonces, 3 distinct file sha256 — **confirmed** |
| span 773.5 s | preludes `02:35:11.057Z → 02:48:04.542Z` | 773.485 s — **confirmed** |
| the S100 quote is verbatim at the stated location | tag-stripped the saved body and searched | "The CLOCK_MONOTONIC clock is not affected by discontinuous jumps in the system time" — present, **confirmed** (22 words with the parenthetical) |
| the S101 quote is verbatim at the stated location | same method on `getrandom.html` | "By default, getrandom() draws entropy from the urandom source (i.e., the same source as the /dev/urandom device)." — present, 17 words — **confirmed** |
| the two S100/S101 body hashes are the fetched bytes | sha256 of the saved fetch artifacts | `7d7948bc…fb69` and `366f0e7e…3d` — match the entry's anchors and the SOURCES rows — **confirmed** |

**A residual this seat measured that the entry does not state** (advisory, not a defect in
the entry — the entry's own ceiling clause covers it in substance): because the tolerated
prelude drift is ±60 s **per receipt**, three receipts whose preludes are each pushed to the
edge of their own tolerance yield an A2-measured span up to ~120 s larger than the true
`wall_start` span. Measured on the committed trio: preludes shifted −60/0/+60 s all read
`RECEIPT: VALID`, giving a prelude-measured span of **893 s** against a true `wall_start`
span of **773 s**. The A2 arm measures span from the `run-at:` prelude, so the recorded
"span" is a display-derived quantity. This does not change any frozen verdict (A2's floor is
300 s and the true span clears it by a wide margin), and the Q39 ceiling sentence in the entry
already says the receipt is not a temporal proof — but a reader of "span 773.5 s … measured,
not asserted" could take the number as the true elapsed time. Suggested wording, if the L1
wants it: note that the A2 span is computed from the display prelude and that the true span
is the `wall_start` window (identical here, 773.5 s), so the two agree only because the
committed receipts were not re-dated.

## 4. SOURCES rows S100 / S101 — audit

Both rows are schema-valid and gate-clean (D3 PASS, D4 CLEAN, D5 census exit 0):

```
| S100 | Linux man-pages clock_getres(2)/clock_gettime(2) — https://man7.org/linux/man-pages/man2/clock_gettime.2.html | docs | A | CLOCK_MONOTONIC semantics … | DESCRIPTION, CLOCK_MONOTONIC paragraph, saved HTML lines 177-184; man-pages 6.19 (page 2026-03-07; …) | … | mined | 2026-10-23 | 180d | corpus/knowledge/invocation-attestation.md |
| S101 | Linux man-pages getrandom(2) — https://man7.org/linux/man-pages/man2/getrandom.2.html | docs | A | nonce generation for receipt ledgers on Linux | DESCRIPTION paragraphs 1-2, saved HTML lines 81-86; man-pages 6.19 (page 2026-02-08; …) | … | mined | 2026-10-23 | 180d | corpus/knowledge/invocation-attestation.md |
```

- 13 pipe-split fields; status at index 8 = `mined`; `opened` 2026-10-23; `recheck` `180d`
  (cadence form, not overdue); `used-by` names the entry — symmetric with the entry's
  `source:` header, so `USED_BY_ASYMMETRY` does not fire.
- Anchors carry the section, the saved-line range, the man-pages version and page date, the
  body sha256 and the UTC fetch instant — a later reader can re-locate the passage in the same
  bytes.
- `teaches` cells stay inside what the pages say. S100's cell says "ignores discontinuous
  system-time steps **but is affected by frequency adjustments**" and does not claim NTP
  immunity (the page names NTP only under `CLOCK_REALTIME`/`CLOCK_TAI`). S101's cell does not
  use the word "CSPRNG" and does not claim Node calls `getrandom()` — both correct against
  the saved bytes.
- `used-by` names only this entry, so no pre-existing row's cell changed (append-only
  respected). The round-51 lesson's `## Gate` block carries the located quotes for both rows.
- One naming nicety, already handled: the URL `…/man2/clock_gettime.2.html` serves the
  combined `clock_getres, clock_gettime, clock_settime` page whose `<title>` is
  `clock_getres(2) - Linux manual page`; the row's `source` cell names it
  "clock_getres(2)/clock_gettime(2)", so the row does not misname the document it quotes.
- The `opened` (2026-10-23, lane-local −03) vs fetch instant (2026-10-24T01:59Z UTC) split is
  deliberate, recorded in the row anchor and in the lesson, and legal under the census's
  on/before-today rule.

## 5. Scope notes for the L1

- The D2 shape is now satisfied **with content**: 13 clause lines, each carrying a distinct
  hash-bound artifact, and each clause states a falsifiable property with its measurement
  named. That is the opposite of the hollow-clause failure mode `RevCounterD` F-1 demonstrated
  (twelve identical empty bullets binding one blob) — worth stating in the close record, since
  the counter cannot tell the two apart.
- The Q39 ceiling is carried verbatim in the entry's last clause ("receipts are author-attested
  invocation records, not cryptographic temporal proof") and `corpus/QUALITY.md` gained Q43
  (a frozen counter is not frozen until executed, with its declared controls run against it),
  both consistent with what this seat could verify.
- The A51/D51 counters were re-run at every HEAD this seat observed during the review
  (`cd7f69d`, `9a345d5`, `2d7ecba`, `efdd742`, `fef6707`, `57333ea`, `cb6c472`, `9d11f4e`,
  `3aaa25a`); the lane moved several times while the review was in progress, so the final
  numbers above are the ones from the tip this seat last observed.

## 6. Tooling

No install or upgrade was needed — `node` v24.21.0, `git`, `python3`, `curl` and `sha256sum`
were already present. No pacman transaction was attempted (the round-51 pacman guard is
PAUSED host-wide). No remote script was fetched and no other runtime was invoked.
