# SCORECARD.md additions — round 64, FINAL (for the L1 integrator)

Seat `K64R2ScribeScorecardFinal`. Target `/home/vgpnk/Projects/shokunin/kumitate-shokunin/SCORECARD.md`
(2971 lines, integration-owned; **this file is a draft and is not applied**). Append-only: no existing paragraph is
rewritten. Supersedes `.ufo/waves/round-64/build/K64ScribeScorecard/scorecard-r64.md` (written against the freeze:
tool v1, selftest 20/20, 16 controls, demo v1/15 keys, no `CHANGES-AFTER-FREEZE.md`, P2 unsatisfiable, no
integration commit).

- Freeze `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef`; base `6825a51425e91908f019ed65aa2f4209acbd7087`; integrated tree
  (wave 1 landing `d92cf1fff3026087a0e21a3183b97de169c6f22c`) **`2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`**.
- Every figure below is quoted from committed bytes with the command that produced it, or is the literal word
  `UNMEASURED` with the exact command that fills it (§Close-time UNMEASURED, at the end). No token may be replaced by
  an unmeasured value: an unrun check has not passed.
- Anchors are **unique text matches**, not line numbers. Line numbers are given only as a cross-check against
  `SCORECARD.md` at `2ed8a5f` and were verified by `grep -c` (each count = 1).

| # | Insertion point | Verified line (at `2ed8a5f`) | Unique anchor text | Uniqueness |
|---|---|---|---|---|
| A | `## Round 64` section | append after 2971 (EOF) | `**Waves:** w1 40 seats (all finished; six session_exit rows landed after the wave settled), w2 39 seats (all finished), 79 total;` | `grep -c '^\*\*Waves:\*\* w1 40 seats'` → 1 |
| B | Capabilities row | insert before 1799 (row 1798 = `inline-dispatch-evidence`) | `*Round-48 note (capabilities; the paragraphs above stay as written).*` | `grep -c 'Round-48 note (capabilities; the paragraphs above stay as written)'` → 1 |
| C | Move log row 64 | insert after 444, before 445 (`\| 50 \| operability …`) | `\| 50 \| operability (integer held 9` (inside `## Move log`, whose header at 441 + header row 443 + separator 444 are unique as a trio; the bare `\| Round \| Axis \| Before \| After \| Evidence \|` occurs **twice** — 443 and 1726 — so it is **not** usable as the anchor) | `grep -c '^\| 50 \| operability (integer held 9'` → 1 |
| D | Round-65 planned row | immediately after C's row | the row from C, verbatim | by construction |

---

## A. Section — append at EOF (after the round-63 section's closing `**Waves:**` line)

```markdown
## Round 64 — claims, verdicts, limits (2026-10-25)

Plan `.ufo/waves/round-64/plan.md` frozen at `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` (base
`6825a51425e91908f019ed65aa2f4209acbd7087`), counters, control generator and do-nothing script pinned in
`.ufo/pins/counter-pins.json` before the first `.ready` marker. QUALITY Q58 at the integrated tree:
`bash scripts/plan-before-ready.sh --round 64` → `PLAN_BEFORE_READY: PASS rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8
round=64 dir=.ufo/waves/round-64 plan=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef … marker=d92cf1fff3026087a0e21a3183b97de169c6f22c
marker_kind=ready … map=SKIP reason=MAP_PRE_EPOCH_ROUND`, exit 0. Q60's epoch: the readme-map arm is enforced from
round 65 (`scripts/plan-before-ready.sh:147` `MAP_FROM="${PBR_MAP_FROM:-65}"`), so round 64's own plan is judged with
that arm `SKIP` — the gate exists and reads green, but it does not yet bind a plan freeze; round 64 is its red-before
receipt, not its first PASS. Frozen counters and controls are never edited by a wave seat: a wrong counter is
reported, not patched. The post-freeze changes are disclosed in `.ufo/waves/round-64/controls/CHANGES-AFTER-FREEZE.md`
(tool v1→v2, controls 16→37, demo v1→v2) and no frozen byte moved (`node scripts/counter-pins.mjs` → `CLEAN`).

**C1 — operability, capability acquisition `report-receipt-diff` (contract `kumitate-report-receipt-diff-v2`, frozen
`RECEIPT64_HELD`, rule R64 v1, P1..P5).** Rounds 60–63 filed reports whose claims the lane's own receipts contradicted
or left as template tokens (round-60 report as filed: six `__TIP__`/`__MEASURED__`/`__COMMITS__` tokens and
`DISPATCH60_HELD held=10/10` where `close/dispatch60-tip.txt` reads `DISPATCH60_UNMET held=8/10`), and nothing in the
lane compared a report with the committed receipts it cites. The tool diffs a report against
`.ufo/waves/round-N/{base,close}/*` read at a revision and names nine finding ids — `PLACEHOLDER`,
`TALLY_UNRECEIPTED`, `TALLY_CHECKS_MISMATCH`, `RECEIPT_MISSING`, `RECEIPT_EMPTY`, `HASH_DEAD`, `HASH_ORPHAN`,
`SECTION_MISSING`, `SHONEN_COUNT` (`scripts/report-receipt-diff.mjs:9-25`). Counting command:
`node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M> --report <round-64 report>`.
Before at base `6825a514`: `RECEIPT64_UNMET held=0/5 checks=5 rev=6825a51425e91908f019ed65aa2f4209acbd7087 rule=R64 |
P1 MISS tool-absent | P2 MISS tool-absent | P3 MISS tool-absent | P4 MISS tool-absent | P5 MISS report-not-given`,
exit 1 (`base/receipt64-base.txt`). At the integrated tree `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`:
`RECEIPT64_UNMET held=4/5 checks=5 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=R64 | P5 MISS
report-not-given`, exit 1 — P1..P4 pass, P5 cannot pass before the round-64 report exists (it is the last artefact).
After at close M: `UNMEASURED` — `node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M> --report .ufo/reports/round-64/kumitate.md`,
receipt at `.ufo/waves/round-64/close/receipt64-<M>.txt`. Selftest: `node scripts/report-receipt-diff.mjs --selftest`
→ `REPORT_RECEIPT_SELFTEST: PASS (52/52)`, exit 0. Controls: `.ufo/waves/round-64/controls/receipt/` holds 37
committed cases (floor 14, unchanged); the 16 frozen cases are untouched; eight distinct finding ids are exercised —
`CLEAN HASH_DEAD PLACEHOLDER RECEIPT_EMPTY RECEIPT_MISSING SECTION_MISSING SHONEN_COUNT TALLY_CHECKS_MISMATCH
TALLY_UNRECEIPTED` (`for d in .ufo/waves/round-64/controls/receipt/*/; do tr '\n' ' ' < "$d/expect"; echo; done | awk
'{print $2}' | tr ',' '\n' | sort -u`) and three read CLEAN (`grep -l '^0' .ufo/waves/round-64/controls/receipt/*/expect
| wc -l` → 3). **P2, reported and then resolved by the declared ratchet, not by a rule change:** at the freeze the
counter required `>= 8` distinct ids while the v1 tool defined seven and the committed cases exercised six, so
`RECEIPT64_HELD` was unreachable by construction (found by eight seats, `CHANGES-AFTER-FREEZE.md`); the ratchet added
two ids (`RECEIPT_EMPTY`, `TALLY_CHECKS_MISMATCH`) and 21 control cases, the floor stayed 8 and the 14-case floor
stayed, and P2 now passes on committed bytes. Real data (P3): over the real reports of rounds 40–63 the v2 tool reads
11 DRIFT — `r40 HASH_DEAD`, `r41 HASH_DEAD`, `r42 HASH_DEAD`, `r43 HASH_DEAD`, `r49 TALLY_UNRECEIPTED`,
`r53 TALLY_UNRECEIPTED,HASH_DEAD`, `r57 HASH_DEAD`, `r58 TALLY_UNRECEIPTED`, `r60 PLACEHOLDER,TALLY_UNRECEIPTED`,
`r61 HASH_DEAD`, `r62 TALLY_UNRECEIPTED,HASH_DEAD` (`controls/real-reports-v2.txt`, 11 lines) — of which only r60 is a
true report-lie; the other ten are the false-positive classes hand-classified by `K64ExecReceiptRealRun`
(unresolvable hashes of read-only clones/scratch/bundles; receipts filed outside `base/`/`close/`), declared as a
limit of the tool and deliberately not "fixed" by adjacent-word heuristics. Limits stated, not hidden: only labelled
`<LABEL>_HELD|UNMET held=x/y` tallies are compared (a bare `held=9/10` cannot be told from a plan's target); a receipt
the lane itself wrote is trusted as written; HASH_DEAD cannot resolve a hash of an external repository; `HASH_ORPHAN`
is unreachable from a plain-directory control lane (so it is defined but not exercised). Score delta: none;
operability stays 9 (terminal under the frozen `f_O`) — the moved surface is the repertoire, not the integer.

**C2 — coverage frontier, jj workspaces as seat containment (sourced on S198/S199/S200; the retired aggregate stays
10).** `PROVINCE.md`'s *Isolation substrates* band gains its first *demonstrated* jj-workspace ground:
`corpus/knowledge/jj-workspace-seat-containment.md` (140 lines; `source:` S198/S199/S200, `verified-at: 2026-10-25`,
`recheck: 180d`; 13 `## Located quotes` bullets, `awk '/^## Located quotes/{f=1;next} /^## /{f=0} f && /^- S[0-9]/{c++}
END{print "located_quotes="c}'` → 13), grounded on rows opened this round and a hermetic, re-runnable demo
`scripts/jj-seat-demo.sh` (contract `kumitate-jj-seat-demo-v2`). The lane's `agent-isolation-substrates.md` said for
M7 "Not demonstrated this round; no table row relies on it"; the demo measures the staged claim wrong in one arm —
abandoning the seat's checked-out commit leaves the seat `stale`, while rewriting it leaves the seat `fresh` — and
the entry is appended to that document as `Amendment 2026-10-25`. Frozen predicate `JJ64_HELD` (rule J64 v1, J1..J8).
Counting command: `node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>`.
Before at base `6825a514`: `JJ64_UNMET held=0/8 checks=8 rev=6825a51425e91908f019ed65aa2f4209acbd7087 rule=J64 | J1
MISS entry-absent | J2 MISS no-entry | J3 MISS no-rows | J4 MISS bullets=0 | J5 MISS no-bullets | J6 MISS
stated-keys=0;demo-exit=127 | J7 MISS census-exit=0 province-names-entry=false readme-map-clean=false | J8 MISS
no-amendment-heading,amendment-lacks-entry-or-M7`, exit 1 (`base/jj64-base.txt`). Do-nothing control (committed before
data): `probe/jj-donothing-control.sh` on a sandbox clone at the base copies the staged entry byte-for-byte, adds a
frontier line and an amendment, changes nothing else → `JJ64_UNMET held=1/8 … | J8` only (`base/jj64-donothing.txt`; a
control meeting 8/8 would mean the counter is wrong). At the integrated tree `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`:
`JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=J64`, exit 0. Demo: `bash
scripts/jj-seat-demo.sh` on this host prints 21 `JJ_SEAT: <key>=<value>` lines and `JJ_SEAT_DEMO: DONE
jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`, exit 0 (`grep -c '^JJ_SEAT: '` → 21; the six keys the v2 demo
added are `ignore_working_copy_hides_pending`, `rewrite_treechange_seat_state`, `abandon_empty_seat_state`,
`update_stale_abandoned_seat_file`, `cross_abandon_both_fresh_after_status`, `forget_seat_commit_in_all`; J6 compares
the entry with the live run set-equal, so the extra keys are additive). **The frontier sentence was superseded, not
left standing:** `PROVINCE.md:21` now reads "… harness isolation is off on this host; jj workspaces advanced in round
64 by `corpus/knowledge/jj-workspace-seat-containment.md` — the first demonstrated jj-workspace seat-containment ground
(mechanism M7 measured by `scripts/jj-seat-demo.sh`: one shared operation log, staleness that follows the seat's tree,
`update-stale` recovery that deletes the abandoned files, no filesystem boundary), appended to the round-45 entry as
`Amendment 2026-10-25`." Limits stated, not hidden: the counter measures an evidence chain plus a live demo re-run; it
cannot tell a sound entry from a well-grounded wrong one; an attacker-hosted row URL would pass J5 (carried hole from
T63); and its archive boundary is porous (`../` pin paths, committed symlinks, caller cwd, env-overridable census —
`K64ReviewProbeC2`), which the round's supplementary wave-2 checks address where a frozen counter cannot. It scores
the surface it names, so on a retired axis it carries no integer; the verdict is the counter. Score delta: none;
coverage aggregate stays 10 (retired).

**Registry and census (frontier step, not a claim).** At the integrated tree: `node scripts/sources-check.mjs` →
`SOURCES_CHECK: CLEAN (rows=139 tiers=A:116,B:15,C:8 status=queued:13,mined:107,rejected:19 entries_with_source=21
legacy=38)`, exit 0 (before at base: rows=136, `base/sources-check-before.txt`); the entry cites S198/S199/S200, each
pinned in `.ufo/pins/source-captures.json` to a committed capture under `.ufo/waves/round-64/build/Capture/`
(`firefox-jujutsu.html`, `jj-v0.46.0-technical-concurrency.html`, `jj-v0.46.0-working-copy.html`).

**Maintenance repairs (not claims) — one repaired, one not.** `readme-map` **repaired**: base `README_MAP: DRIFT
files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md`, exit 1
(`base/readme-map-before.txt`) → tip `README_MAP: CLEAN files=156 rows=156 covered=156`, exit 0. `proxy-check` **not
repaired at `2ed8a5f`**: `node scripts/proxy-check.mjs` → `PROXY: DRIFT (A_DRIFT term=A declared=257 computed=1291
delta=+1034; C2_DRIFT term=C2 declared=153 computed=156 delta=+3; C2_TOTAL_DRIFT term=C2_total declared=153
computed=156 delta=+3; GATE_PIN_DRIFT term=pin.plan-before-ready declared=fdc10c4b… computed=ef726eae…;
PIN_UNPINNED term=scripts/report-receipt-diff.mjs; src-rev=31c465f15669)`, exit 1 — base had two error terms
(`C2_TOTAL_DRIFT` +1, `AXES_DRIFT` coverage 10/9, `base/proxy-before.txt`) and the tip has four. Three of the four are
round-64 artefacts the L1 can still bind before close (`C2`/`C2_total` 153→156 = the three new corpus files, the stale
`pin.plan-before-ready` because `scripts/plan-before-ready.sh` gained the map arm after its pin, and the missing
`pin.report-receipt-diff`); the `A` term is not a round-64 defect and not fixable mid-wave: it counts
`.mjs/.js/.sh/.py` files in the lane **worktree** (`scripts/proxy-check.mjs:945` `walkFiles(self)`), so it grows with
every seat build directory and was observed at 1290 and 1291 in two consecutive runs of the same command. Close-time
reading: `UNMEASURED` — `node scripts/proxy-check.mjs` at M on a tree whose seat build dirs are cleaned.

**Waves and admission.** Wave 1 landed at `d92cf1f` (`w1.ready`); wave 2 dispatched at
`w2.ready`/`w2.ready.dispatched`. `node scripts/wave-census.mjs --round 64` at `2ed8a5f` (mid-wave 2) reads `WAVE
round=64 wave=w1 … seats=41 attack=8 reports=41/41` and `WAVE round=64 wave=w2 … seats=39 attack=15 reports=11/39`
(`absent:` 28 seats, this scribe among them), `ROUND round=64 waves=2 seats=80 attack=23 reports=52/80`, `WAVE_CENSUS:
CLEAN (rounds=1 waves=2 findings=0)`, exit 0. Close-time roster (final report count, dead and session-exit seats):
`UNMEASURED` — `node scripts/wave-census.mjs --round 64` at M. Admission: a claim admits only if its
frozen counter prints `HELD … exit 0` at M. At `2ed8a5f` C2 admits (`held=8/8`, exit 0) and C1 does not yet
(`held=4/5`, P5 MISS by construction); close-time admission for C1 is `UNMEASURED` —
`node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M> --report
.ufo/reports/round-64/kumitate.md`. No axis score changed and no axis harmed: operability is at the frozen `f_O`'s
terminal 9 (`SCORECARD.md:340`), coverage is retired at 10 (`SCORECARD.md:341`), so the verdict is the counter, not a
number. The per-axis gate table at M backing the no-harm claim: `UNMEASURED` — `node scripts/proxy-check.mjs`,
`node scripts/cite-check.mjs`, `node scripts/claims-check.mjs`, `node scripts/readme-map.mjs`,
`node scripts/sources-check.mjs`, `node scripts/source-capture.mjs`, `node scripts/counter-pins.mjs` at M.

**Limits carried (not repaired here).** (a) The C1 P2 floor and the C2 frontier-sentence contradiction were reported
at wave 1; P2 was resolved by the declared ratchet (above), the frontier sentence was superseded in `PROVINCE.md:21`.
(b) `cite-check` is DRIFT at the integrated tree — `CITE_CHECK: DRIFT (files=160 tokens=11883 errors=1224
warnings=645)`, exit 1 — a pre-existing lane state, not a round-64 regression and not a round-64 claim; its count is
also not reproducible outside a git worktree (see the round-64 build note: the same revision extracted with `git
archive` reads `errors=1689` because hash tokens no longer resolve). (c) The `jj-donothing-control.sh` receipt's
trailing `exit=0` is the wrapper's exit (`probe/jj-donothing-control.sh:19` ends `node "$PROBE" … --no-live || true`),
not the counter's exit 1 the plan quotes; its fixture rev is not re-derivable because the sandbox commit's timestamp
is part of its hash. (d) `CHANGES-AFTER-FREEZE.md` states "13 CLEAN and 11 DRIFT" over 24 real reports but
`controls/real-reports-v2.txt` carries only the 11 DRIFT lines — the CLEAN half has no committed receipt.
```

---

## B. Capabilities row — `report-receipt-diff`

**Admission condition (do not silently drop it):** insert this row only if C1 reads `RECEIPT64_HELD held=5/5 checks=5`,
exit 0, at close M. At `2ed8a5f` it reads `RECEIPT64_UNMET held=4/5` (P5 MISS, report not yet written), so the
*First-working round* cell is the literal word `UNMEASURED` — not `64`. If C1 is UNMET at close, do **not** enter the
row: record the MISS in section A (an unadmitted row is history, not a capability — cf. the round-60
`dispatch-evidence` row, which entered only in round 59's table).

Insert immediately **before** the unique anchor `*Round-48 note (capabilities; the paragraphs above stay as written).*`:

| `report-receipt-diff` | Diff a round report against the committed receipts it cites: read the report bytes and the lane's receipts at a revision (`git show <rev>:.ufo/waves/round-N/{base,close}/*`; the worktree only when `--rev` is absent; a symlinked, escaping or empty receipt is not a receipt) and name one line per finding — `PLACEHOLDER` (a template token `__name__`, `{{NAME}}`, `XXXX`, "to be filled", `<measured>`, `LANE_HASH`, `TBD`; the command-template arguments `<tip>`/`<lane>`/`<rev>` are not flagged), `TALLY_UNRECEIPTED` (a labelled `<LABEL>_HELD\|UNMET held=x/y`, case- and spacing-insensitive, table cells included, that no receipt carries as the same label and the same x/y — and when the claim's own line cites receipts, only those may carry it), `TALLY_CHECKS_MISMATCH` (`checks=k` for a pair a receipt carries with another k), `RECEIPT_MISSING` (a `.ufo/waves/round-N/(base\|close)/<file>` the report names that does not exist at the rev, escapes with `..`, is a directory or a symlink), `RECEIPT_EMPTY` (a cited receipt with no bytes), `HASH_DEAD` (a 39- or 40-hex hash, either case, resolving in neither the lane nor the fleet repo), `HASH_ORPHAN` (a 40-hex lane hash that is not an ancestor of the lane rev), `SECTION_MISSING` (a required report heading absent from the prose; a heading inside a fenced block is a quotation), `SHONEN_COUNT` (`SHONEN` heading not exactly once, or fewer than 4 box lines in its own section). `REPORT_RECEIPT: CLEAN` exit 0 / `DRIFT <ids>` + one line per finding exit 1 / 2 fail-closed / 64 usage; contract `kumitate-report-receipt-diff-v2`. Stated limits: only labelled tallies are compared (a bare `held=9/10` is indistinguishable from a plan's target); a receipt the lane itself wrote is trusted as written; `HASH_DEAD` cannot resolve a hash of an external repository; `HASH_ORPHAN` is defined but unreachable from a plain-directory control lane; on real reports of rounds 40–63 it reads 11 DRIFT of which one (r60) is a true report-lie, the other ten being declared false-positive classes | `node scripts/report-receipt-diff.mjs --selftest` → `REPORT_RECEIPT_SELFTEST: PASS (52/52)` exit 0; `node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M> --report .ufo/reports/round-64/kumitate.md` → `RECEIPT64_HELD held=5/5` exit 0 at close; `controls/receipt/` 37 cases, 8 distinct ids, 3 CLEAN; QUALITY Q61 | UNMEASURED |

Notes for the integrator (not part of the row): the row describes the **v2** bytes at `2ed8a5f`
(`kumitate-report-receipt-diff-v2`, nine ids, selftest 52/52), not the freeze's v1 (seven ids, 20/20). The frozen probe
hashes nothing but runs the revision's own tool from `git archive`, so a later ratchet that adds a tenth id
strengthens the row, never relaxes it. Do not cite the row's own limit as closed.

---

## C. Move log row — round 64 (insert after the Move log separator, before the unique anchor `| 50 | operability (integer held 9`)

| 64 | operability (lowest non-retired axis; integer held 9 — terminal under `f_O`; C1 capability acquisition `report-receipt-diff`, contract `kumitate-report-receipt-diff-v2`) + coverage frontier (retired aggregate held at 10; C2 ground `corpus/knowledge/jj-workspace-seat-containment.md` on the PROVINCE *Isolation substrates* band) | `node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 6825a51425e91908f019ed65aa2f4209acbd7087` → `RECEIPT64_UNMET held=0/5 checks=5 … \| P1 MISS tool-absent \| P2 MISS tool-absent \| P3 MISS tool-absent \| P4 MISS tool-absent \| P5 MISS report-not-given`, exit 1 (`base/receipt64-base.txt`); `node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 6825a51425e91908f019ed65aa2f4209acbd7087` → `JJ64_UNMET held=0/8 …`, exit 1 (`base/jj64-base.txt`); base gates: `README_MAP: DRIFT files=154 rows=153 covered=153` exit 1, `PROXY: DRIFT (C2_TOTAL_DRIFT +1; AXES_DRIFT coverage 10/9)` exit 1 | at `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`: C2 `JJ64_HELD held=8/8 checks=8 rule=J64` exit 0, demo 21 keys exit 0; C1 `RECEIPT64_UNMET held=4/5 … \| P5 MISS report-not-given` exit 1 (P5 awaits the report) — C1's close reading is `UNMEASURED`; `README_MAP: CLEAN files=156 rows=156 covered=156` exit 0; `PROXY: DRIFT` 4 error terms (A_DRIFT worktree-scoped, C2/C2_total 153→156, stale `pin.plan-before-ready`, `PIN_UNPINNED report-receipt-diff`) — close reading `UNMEASURED` | `.ufo/waves/round-64/{plan.md,probe/,base/,controls/,build/}`; `corpus/knowledge/jj-workspace-seat-containment.md`; rows S198–S200 + `.ufo/pins/source-captures.json`; `corpus/QUALITY.md` Q60/Q61/Q51-C1; `corpus/lessons/round-64.md`; `PROVINCE.md:21`; report `.ufo/reports/round-64/kumitate.md` (UNMEASURED) |

---

## D. Move log row — round 65 (planned; insert immediately after the row from C)

A planned row is **not** a measurement: it carries no verdict, no before/after reading, and it must be replaced by the
frozen plan's claim sentences when round 65 freezes (Q58). Its purpose is to declare which two claims the frontier
points at, so round 65 cannot silently pick an easier subject.

| 65 (planned) | operability (lowest non-retired axis; capability acquisition `counter-honest-controls` — bind **every** frozen counter to a committed honest control case, its `expect`, and a re-run verdict line, and exit DRIFT when a counter has no honest control, when its expect does not match a fresh run, or when its honest case is absent from the committed bytes) + coverage frontier (a second family in the *MCP protocol revisions* band, `UNMEASURED` — the planner fills the family from `PROVINCE.md:20`'s own queued list, whose only landed entry is round 59's `corpus/knowledge/mcp-orchestration-contract.md`) | not frozen — no before-state exists until the plan is committed at `UNMEASURED` (fill: the round-65 plan commit hash) | `UNMEASURED` | `UNMEASURED` — round-65 plan, probe and close receipts |

Justification recorded for the planner (not part of the row): candidate 2 (`counter-honest-controls`) is chosen over
"close a declared hole of a round-63/64 counter" because round 64's own freeze shows the missing instrument — C1's P2
demanded `>= 8` distinct finding ids while the v1 tool defined 7 and the committed cases exercised 6, and no lane gate
read a counter's controls at freeze, so the defect surfaced only by running the probe (`RECEIPT64_UNMET held=3/5 … P2
MISS ids=6` at the freeze; eight seats found it independently). Closing a declared hole remains the honest ratchet
item inside whichever claim is chosen (round-64 C1's bare-tally / lane-written-receipt holes; round-64 C2's
attacker-hosted row URL carried from T63) and must not be used as a claim subject that leaves the lowest non-retired
axis unworked. A third PROVINCE band is the round-65 C2 slot; the MCP revision family is the only band whose own
frontier line names queued families.

---

## Close-time UNMEASURED — every slot and the exact command that fills it

| Slot in the text above | Command (run at close M, output pasted verbatim) | Receipt to commit |
|---|---|---|
| C1 close verdict + admission | `node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M> --report .ufo/reports/round-64/kumitate.md` | `.ufo/waves/round-64/close/receipt64-<M>.txt` |
| C1 *First-working round* cell | same command; enter `64` only on `RECEIPT64_HELD held=5/5`, exit 0 | same |
| C2 close verdict | `node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>` | `.ufo/waves/round-64/close/jj64-<M>.txt` |
| `proxy-check` close reading | `node scripts/proxy-check.mjs` (worktree cleaned of seat build dirs) | `close/proxy-<M>.txt` |
| Wave roster, seats, dead seats | `node scripts/wave-census.mjs --round 64` | `close/waves-<M>.txt` |
| Per-axis no-harm gate table | `node scripts/proxy-check.mjs; node scripts/cite-check.mjs; node scripts/claims-check.mjs; node scripts/readme-map.mjs; node scripts/sources-check.mjs; node scripts/source-capture.mjs; node scripts/counter-pins.mjs` | `close/gates-<M>.txt` |
| Round-64 report path (C1 P5 input) | the filed report `.ufo/reports/round-64/kumitate.md` | — |
| Round-65 C2 family / plan freeze | planner fills from `PROVINCE.md:20`'s queued list and the round-65 plan commit | — |

Verified at `2ed8a5f` and **not** UNMEASURED (measured by this seat, quoted above): selftest 52/52; 37 controls / 8
ids / 3 CLEAN; `JJ64_HELD held=8/8`; 21 demo keys; `SOURCES_CHECK` rows=139; `README_MAP: CLEAN 156/156/156`;
`CITE_CHECK: DRIFT errors=1224 warnings=645`; `CLAIMS: MATCH errors=0 warnings=4`; `PLAN_BEFORE_READY: PASS … map=SKIP
reason=MAP_PRE_EPOCH_ROUND`.
