RESULT ScribeLessonDraft rev=e5ffcbe7f155b89cb1870f9da7b0d671d092948b verdict=drafted mistakes=4

# ScribeLessonDraft — draft of `corpus/lessons/round-43.md` (skeleton only)

Scope: this report holds a skeleton of the round-43 lesson in the shape of
`corpus/lessons/round-42.md` (header, `## Claims`, `## Round shape`, `## Gate`, routed defects,
`## Mistakes`, `## Open limits`, falsify dispositions). Every value that no committed receipt has
measured yet is written `PENDING`, with the command that would fill it. No number here is invented.
No lane file other than this report was written; nothing was committed; no gate or selftest was run
(read-only `git show`/`git log`/`git diff` and plain counts only). Installs or upgrades: none.

## Observed evidence (cited by the draft)

- E1. Plan commit exists and is an ancestor of the rev: `git merge-base --is-ancestor 0f4108bf… e5ffcbe7…`
  → `plan-ancestor: yes`; `git merge-base --is-ancestor e5ffcbe7… HEAD` → `rev-ancestor-of-HEAD: yes`.
- E2. Frozen counter bytes: `git show 0f4108bf:scripts/gate-mutants.mjs | sha256sum` →
  `e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a`.
- E3. Base-repair commit (0f4108bf vs round open 2a7f37d2) names its parts:
  `SCORECARD.md | 6 +++---` (`C2=94`→`95`, `C2_total=94`→`95`, `pin.gate-mutants=3c6678cb…`→
  `e24749e4…`), `corpus/README.md | 2 ++` (round-42 closure row), plus plan, open receipts,
  pre-commit dry run, `scripts/gate-mutants.mjs` (+88/−17) and the three late round-42 reports.
- E4. D1 commit half: `git ls-tree --name-only e5ffcbe7 -- .ufo/waves/round-42/falsify/` lists
  `CritC1Claim.md`, `CritSeparabilityTip.md`, `CritTradesTip.md` (27 entries total);
  `git log -1 --format=%s -- .ufo/waves/round-42/falsify/CritC1Claim.md` →
  `0f4108b round-43: … D1 three late round-42 falsify reports committed as late evidence`.
- E5. Control receipt: `git diff --stat 0f4108bf e5ffcbe7` → only
  `.ufo/waves/round-43/open/c1-control-base.txt | 56 +`; its summary line is
  `GATE_MUTANTS: SURVIVED (mutants=43 killed=36 frozen=34/41 drift=0 targets=2 rev=2a7f37d2… manifest=8486506f… leftovers=0)`
  with `exit=1`, and `CONTROL`/`CONTROL_AFTER` read `PASS … cases=75/75 floor=75` and
  `PASS … cases=31/31 floor=31`.
- E6. K43 implemented once at the plan commit: `killedOnce` (0f4108bf:scripts/gate-mutants.mjs:447-457)
  and `confirmKill` (:461-463); exit map line 110: `0 all mutants killed (K43) · 1 … survived or drifted
  · 2 setup, nomatch, crash, unstable kill, timeout, control failure …`.
- E7. Seven `k43-*` selftest arms at the plan commit: `k43-kill-confirmed-by-second-run`,
  `k43-nonzero-with-verdict-fail-is-killed`, `k43-nonzero-with-verdict-pass-is-survived`,
  `k43-exit-zero-with-verdict-fail-is-survived`, `k43-confirmation-same-names-agrees`,
  `k43-confirmation-other-names-or-pass-disagrees`, `k43-unstable-exit-class-is-2`; 29 literal
  `check(` sites in the selftest.
- E8. D4 temp parent fixed: `SCRATCH_TMPDIR = process.env.KUMITATE_GATE_MUTANTS_TMP` (:37), `mkdirSync(…,
  0o700)` + `realpathSync` (:44-45), help line `$KUMITATE_GATE_MUTANTS_TMP, else
  ~/.cache/kumitate-gate-mutants` (:111). Isolation selftest cases present: only
  `timeout-and-process-group-cleanup`, `selftest-leftovers`.
- E9. Terms counter inputs at this rev (plain counts, not claimed): `find … \( -name '*.mjs' -o -name
  '*.js' -o -name '*.sh' -o -name '*.py' \) | wc -l` → `10`; `grep -cE '^\s*- \[' SKILL.md` → `19`;
  `f_O` = 29/32 → integer 9. `grep -c 'round 43' corpus/QUALITY.md` → `0` (last criterion is Q24).
- E10. D2/D8 correction sites unchanged at this rev: `grep -n "before any counted run"
  corpus/lessons/round-42.md` → lines `10`, `111`; `plan.md:81`; `grep -n S045` → lesson line `79`
  with no `Q<n>`.
- E11. Open receipts: `PROXY error C2_TOTAL_DRIFT declared=94 computed=95`, `GATE_PIN_DRIFT
  pin.gate-mutants declared=3c6678cb… computed=e24749e4…`, `AXES_DRIFT coverage: row=10 derived=9`,
  `PROXY: DRIFT`, exit 1; `SOURCES_CHECK: CLEAN (rows=45 tiers=A:42,B:1,C:2 status=queued:14,mined:26,rejected:5)`;
  last `SOURCES.md` id `S045`; wave-1 `counts: {"spawn":34,…}`, registry `members` 34.
- E12. Pre-commit dry run of the do-nothing control is committed (49 lines,
  `.ufo/waves/round-43/open/c1-control-base-dryrun-precommit.txt`, line 49 = the same SURVIVED line),
  so the plan's disclosure clause has a receipt.

## PENDING register (nothing below was measured when this draft was written)

1. After-run `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 …)` exit 0 at the measured commit, and the measured commit's 40-hex id.
2. Junk controls J1 (stub printing `VERDICT: FAIL`, exit 1), J2 (both targets zero-byte), J3 (seven survivor literals edited away): each must read `GATE_MUTANTS: ERROR`, exit 2.
3. Cite-check selftest wall-time median of 3 runs, before and after, same host.
4. `corpus/SOURCES.md` row S046 (the K43 source) and its `## Gate` decision.
5. QUALITY criterion for a pass-sensitive operability counter (next id Q25) and the checklist pass-count receipts at open and close (D3).
6. Appended corrections to `round-42/plan.md:81`, `round-42.md:10`, `round-42.md:111` (D2) and the `Q<n>` on `round-42.md:79` S045 (D8).
7. Red-before cases for the four isolation mutants and the external-kill leak (D4); wave-census canonical-path red-before case (D8); kimi-census `locks/` mode/owner cases (D7).
8. Same-sha cite-check errors/warnings receipts at dfabe92 and c9a084bf, or retraction (D5).
9. `PROXY: MATCH` at the repaired commit, and whether `AXES_DRIFT coverage: declared=10 computed=9` closes with the stanza change (it is not named in the base repair text).
10. Wave-1 returned/dead/gate counts, the `FLOOR` line and `spawned total` (QUALITY Q23); wave 2 (falsify) against the measured commit; per-axis verdicts.

------------------------------------------------------------ BEGIN DRAFT ---------------------------------------------

# Round 43 — one frozen kill predicate, and the mutant battery re-claimed against it

Source: S046 (PENDING: candidate, tier, quote, criterion), the round-42 non-author closure
(`corpus/lessons/round-42-verifier-spotcheck.md`, routed defects D1–D8) and the pinned upstream
revision 31c465f15669f744848bd9f5d56191c5085670f7. Round open: lane
2a7f37d2b0a413db8499b413783c27a0effdc989. Plan and frozen counter: `.ufo/waves/round-43/plan.md`
(commit 0f4108bf66d58eb4cf4642ca1faf0fdeeba06c82; `scripts/gate-mutants.mjs` sha256
`e24749e4b1eb21f5fb446c05543451b3221e708978fff6938fa6f68c36d4152a`, contract
`kumitate-gate-mutants-v2`); control receipt commit e5ffcbe7f155b89cb1870f9da7b0d671d092948b.

## Claims

- **C1 operability (claim type: capability re-claim `gate-mutants`, predicate K43).** One predicate,
  frozen in the plan before any counted run and implemented once in code. A mutant is KILLED iff
  (a) its run is evaluable (no timeout, no overflow, its process group gone, no spawn error, a
  parseable case summary whose total equals the control's), (b) the selftest exits numeric non-zero,
  (c) stdout carries the exact line `VERDICT: FAIL`, and (d) an immediate second run of the same
  mutated bytes meets (a)–(c) with the same sorted list of `FAIL ` case names (text before ` — `).
  Evaluable and not killed is SURVIVED (exit 1 class); a disagreeing second run is UNSTABLE (exit 2
  class); every control is re-run after the mutants and must pass again, else exit 2. No amendment
  of K43 or of the counter was permitted this round; a miss is an honest stop.
  - **Before (do-nothing control at the round-open bytes).** Receipt
    `.ufo/waves/round-43/open/c1-control-base.txt` (2026-10-22T22:11:46Z, frozen counter extracted
    from the plan commit, `sha256sum` = `e24749e4…`, run under `MemoryMax=6G TasksMax=256`):
    `GATE_MUTANTS: SURVIVED (mutants=43 killed=36 frozen=34/41 drift=0 targets=2 rev=2a7f37d2… manifest=8486506f… leftovers=0)`,
    exit 1. Controls before and after the mutants: cite-check `PASS … cases=75/75 floor=75`,
    wave-census `PASS … cases=31/31 floor=31`. The seven survivors: cite-check
    `suite-group-verdict` (`exit=0 verdict=PASS fail_lines=2`), `suite-exit-text`
    (`exit=0 verdict=FAIL fail_lines=1`), `suite-any-fail` (`exit=0 verdict=PASS fail_lines=2`);
    wave-census `survivor/V382-pass-count`, `survivor/V385-verdict-const`,
    `survivor/V387-exit-const`, `exits/M19-selftest-exit-const`. The same committed receipt re-counted
    under round-42's pre-data sentence reads `frozen=34/41` (closure, C1 re-count), so the before
    value does not depend on which of the three round-42 statements is read.
  - **After (target, one value).** PENDING — at the measured commit `<40-hex PENDING>` the same frozen
    bytes must print `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 drift=0 targets=2 …)` and
    exit 0, with one `MUTANT` line per id (41/41 enumerated by the command). The work: both selftests
    gain an independent second verdict path, a witness that counts failing cases from the recorded
    results rather than from the mutated expression, so a one-literal fault in the primary verdict or
    exit expression still ends `VERDICT: FAIL` with a non-zero exit. Every frozen literal must still
    apply exactly once (else exit 2 `nomatch`); case floors (cite-check 75, wave-census 31) unchanged.
  - **Junk controls.** PENDING — J1 (both target selftests replaced by a stub printing `VERDICT: FAIL`
    and exiting 1), J2 (both targets zero-byte), J3 (the seven survivor literals edited away) must each
    read `GATE_MUTANTS: ERROR` with exit 2, never `CLEAN`. Each is scored with the same frozen counter
    on a scratch-clone commit, receipt committed.
  - **Cost.** PENDING — cite-check selftest wall time, median of 3 runs, before and after, same host
    (round-41 cost trade: measured, not deepened).
  - **Not claimed.** The operability integer stays 9 and this lesson makes no terms claim (D3). The
    terms counter is blind: C counts listed checklist lines, not passing ones, and A counts any
    runnable file, so a zero-byte `.mjs` at the open bytes reads `PROXY: MATCH … operability=9`
    (round-42 closure). Plain counts at this revision are recorded, not claimed: A=10, C=19,
    `f_O`=29/32, integer 9. The two checklist items (`gate-mutants` battery, its hermetic suite) count
    no move. The capability row `gate-mutants`, entered in round 42 on an unverified claim, is
    re-evidenced by this claim's receipts or corrected if C1 misses.
  - **Sourced.** PENDING — the knowledge text that states K43 cites a `corpus/SOURCES.md` row opened
    this round (S046: a primary source on kill definitions or on flaky outcomes in mutation testing).

## Round shape

PENDING (QUALITY Q23). Expected shape: two v1 waves. Wave 1 (build and first falsifiers)
`kumitate-r43-build`, dispatch `counts.spawn=34`, registry `members` 34; its line must read
`WAVE kumitate-r43-build payload=34 spawned=<n> returned=<n> dead=<n> gate=<granted|never granted>`;
`FLOOR wave1 … verdict=<met|unmet>`; `spawned total=<n> (<=128)`. Wave 2 (falsify) against the
measured commit: PENDING. One bullet per deviation from the allowed shapes, including any wave
dispatched before its predecessor returned.

## Gate — admits and rejects

- Admit S046 (PENDING: tier, quote of 25 words or fewer, criterion met) — grounds K43.
- Re-open (PENDING) — at least one pre-round `SOURCES.md` row re-opened at its recorded revision.
- Reject (PENDING) — or, when nothing is rejected, one line `no reject this round — <why>` plus a
  standing reject re-opened with its re-adjudication (Q21).

Registry changes logged old → new: PENDING. The open census reads `rows=45 tiers=A:42,B:1,C:2
status=queued:14,mined:26,rejected:5`; K43's row is the round's only expected new row.

## Routed defects (round-42 closure D1–D8) — dispositions

- **D1 — observed (commit half), PENDING (report half).** The three late round-42 falsify reports are
  tracked at the plan commit: `git ls-tree --name-only 0f4108bf -- .ufo/waves/round-42/falsify/` lists
  `CritC1Claim.md`, `CritSeparabilityTip.md`, `CritTradesTip.md`; the commit subject names D1; their
  digests `25937520…`, `3e4ff33a…`, `48c12359…` and mtimes (18:16:29–18:18:04 -03, after the round-42
  close 18:13:51) sit in `.ufo/waves/round-43/open/receipts.txt`. The round-43 report's correction of
  round-42's "cancelled … unperformed" line: PENDING (report not yet written).
- **D2 — observed (freeze and code), PENDING (appended corrections).** K43 is stated once in the plan
  and implemented once (`killedOnce`, `confirmKill`; 0f4108bf:scripts/gate-mutants.mjs:447-463), with
  seven `k43-*` selftest arms. The appended corrections to "before any counted run"
  (`round-42/plan.md:81`, `round-42.md:10`, `round-42.md:111`) are PENDING: both lesson lines still read
  unannotated at this revision.
- **D3 — PENDING.** No operability claim is made on the terms counter (C1 above says so). The QUALITY
  criterion that an operability claim needs a pass-sensitive counter is PENDING: `grep -c 'round 43'
  corpus/QUALITY.md` reads `0`, the last criterion being Q24. Checklist pass-count receipts at round
  open and close: PENDING.
- **D4 — observed (temp parent, both-target run), PENDING (red-before cases).** `SCRATCH_TMPDIR` reads
  `$KUMITATE_GATE_MUTANTS_TMP`, else `~/.cache/kumitate-gate-mutants`, created `0700` and
  realpath-confined (:37, :44-45, :111); the both-target `--rev` run is the control receipt
  (`targets=2`). Red-before cases for the four isolation mutants (process cap, RSS cap,
  `--end-of-options`, leading-dash guard) and the external-kill leak are PENDING: the selftest at the
  plan commit carries only `timeout-and-process-group-cleanup` and `selftest-leftovers` for this area.
- **D5 — PENDING.** A same-sha before receipt for cite-check errors/warnings (526/481) at `dfabe92`
  and `c9a084bf`, or retraction: no such receipt exists under `.ufo/waves/round-43/open/`.
- **D6 — observed (re-pin only), ruling pending.** `pin.gate-mutants` moves `3c6678cb…` → `e24749e4…`
  (`git diff 2a7f37d2 0f4108bf -- SCORECARD.md`); no new key, arm or semantics; the operator ruling on
  the `kumitate-gate-pins-v1` block (L0 `9a00d09`) is still pending. Not deepened.
- **D7 — PENDING.** `kimi-census.mjs`: `locks/` mode floor and owner pin with red-before cases;
  `locks/sessions` stays ungated by design (named limit); the unsourced-stub hole named in QUALITY.
- **D8 — PENDING.** Wave-census canonical-path refusal red-before case; S045's decision line
  (`corpus/lessons/round-42.md:79`) still names no `Q<n>`.

## Mistakes

| class | evidence pointer | captured-by | fix |
|---|---|---|---|
| a late delivery recorded as a non-delivery | round-42 closure `jj-lane.sh state` reads `untracked=3`; the three files' digests `25937520…`, `3e4ff33a…`, `48c12359…` and mtimes 18:16:29–18:18:04 -03 (after the 18:13:51 close) sit in `.ufo/waves/round-43/open/receipts.txt`, and the round-42 report calls those seats "cancelled … unperformed" (round-42 closure Step-1 levels row, D1) | the non-author closure's `git status --porcelain` at close, not the lane | commit the three reports as late evidence (`0f4108bf`, subject names D1) and correct the round-42 sentence in this round's report. Shown able to fail: at the round-42 close `git status --porcelain` printed the three `??` paths, and the round-43 open receipt records them untracked before that commit; the identical command now prints nothing for that directory (`git ls-tree` lists all three at `e5ffcbe7`). A reported-but-uncommitted delivery still shows as untracked, and QUALITY Q23's wave accounting names returned seats |
| a counter blind to the substance it claims | a zero-byte `.mjs` at the round-open bytes reads `PROXY: MATCH … operability=9` (round-42 closure, CritC1Claim); `SCORECARD.md` itself records "C counts listed items; the pass count is a separate measurement" (round-35 correction); C counts `^\s*- \[` lines and A any runnable file | falsify seat CritC1Claim, delivered after close and untracked until `0f4108bf` | no terms claim is made this round (C1 is the battery under K43); D3 adds a QUALITY criterion that an operability claim needs a pass-sensitive counter and a checklist pass-count receipt at open and close. Shown able to fail: the failing input is cheap and named — add one zero-byte `scripts/*.mjs` or leave one checklist item red and a pass-sensitive counter must fall; until its open/close receipts exist the terms counter is cited for no claim |
| one frozen predicate stated three ways | plan `b237e3f0:.ufo/waves/round-42/plan.md:21` "killed = exit non-zero with a `VERDICT: FAIL` line"; amendment A1 (`a0a07bae`) "at least one `FAIL ` line"; code `c9a084bf:scripts/gate-mutants.mjs:426-434` `if (run.failLines > 0) return 'killed'`; the frozen-id re-count over the committed receipt reads 34/41 under the pre-data sentence while the gate printed `CLEAN` | closure seat CritC1KillRule's re-count, and the lane's own CritPlanAmendments (`verdict=goalpost`) | K43 is stated once and implemented once at the plan commit, with no amendment right this round; its arms are pinned by seven `k43-*` selftest cases (`k43-nonzero-with-verdict-pass-is-survived`, `k43-exit-zero-with-verdict-fail-is-survived`, `k43-confirmation-other-names-or-pass-disagrees`, `k43-unstable-exit-class-is-2`, `k43-kill-confirmed-by-second-run`, `k43-nonzero-with-verdict-fail-is-killed`, `k43-confirmation-same-names-agrees`). Shown able to fail: the same frozen bytes print `SURVIVED … frozen=34/41` on the round-open commit, so the rule demonstrably discriminates rather than passing everything |
| a close ships a scorecard stanza and pin the proxy reads as drift | `.ufo/waves/round-43/open/receipts.txt`: `PROXY error C2_TOTAL_DRIFT declared=94 computed=95`, `GATE_PIN_DRIFT pin.gate-mutants declared=3c6678cb… computed=e24749e4…`, `AXES_DRIFT coverage: row=10 derived=9`, `PROXY: DRIFT`, exit 1 | the round-43 open receipt; no round-42 criterion ran the proxy after the close commit | base repair at the plan commit: `C2=95`, `C2_total=95`, `pin.gate-mutants=e24749e4…`, README row for the round-42 closure; the same invocation at the repaired commit must read `PROXY: MATCH` (PENDING receipt). Shown able to fail: the open run itself exits 1 with three named DRIFT terms, and `AXES_DRIFT` is not named in the base-repair text, so it stays a live failing input until a receipt closes it |

## Open limits

- PENDING to fill: `gate-mutants` covers two of the ten gates (cite-check, wave-census); literal
  mutants become `nomatch` when their line is refactored; the case floors make `--rev` on a smaller
  suite exit 2; the K43 confirmation run roughly doubles mutant wall time (measured value PENDING);
  the terms counter stays blind (D3); `AXES_DRIFT coverage` open (see Mistakes row 4).

## Falsify wave (PENDING: seats, commit) — dispositions

- Reproduced: PENDING. Fixed after the measured commit: PENDING. Open, named: PENDING. Mistake rows
  from falsify seats: PENDING.

------------------------------------------------------------- END DRAFT -------------------------------------------------------------

## How each fix is shown able to fail (summary, no number invented)

| fix | failing input | observed today | pending |
|---|---|---|---|
| D1 commit-and-correct | a delivered report left untracked | `git status --porcelain` printed the three paths at round-42 close (closure); `git ls-tree` lists them now | the report-line correction |
| D2 one predicate | a rule narrower than the counter | the same bytes read 36 killed / 34 frozen-of-41, exit 1 | appended corrections at 3 sites |
| D3 pass-sensitive counter | a zero-byte script or one red checklist item | zero-byte `.mjs` reads `operability=9` (closure) | Q25 text, open/close pass-count receipts |
| D4 isolation red-before cases | a mutant that escapes a cap | cap cases absent from the selftest (E8) | four case receipts |
| D6 re-pin | a pinned file changed without a re-pin | `GATE_PIN_DRIFT` at open, exit 1 | operator ruling |

## Out of scope

- The round-43 report itself (`.ufo/reports/round-43/kumitate.md`), the fleet repo, the scorecard
  integers, and any gate run: not touched. This draft claims no measurement beyond the receipts named
  in E1–E12.
