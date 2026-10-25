# SCORECARD.md additions — round 64 (draft for the L1 integrator)

Seat `K64ScribeScorecard`. Target `/home/vgpnk/Projects/shokunin/kumitate-shokunin/SCORECARD.md`
(integration-owned; **this file is a draft and is not applied**). Append-only: no existing paragraph is rewritten.

- Freeze `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` (plan, counters `probe/receipt64-probe.mjs` sha256
  `34b3b308fab63355ed6f11ba25fc1a96a9616bd9d5412734fc54c866ad2d2be6`, `probe/jj64-probe.mjs` sha256
  `157be0acaa799bb6acb92c76aa989a49f33c68ca3fd74d594e9e98b6b290daf1`, `probe/make-receipt-controls.mjs`,
  `probe/jj-donothing-control.sh`, `controls/`, `base/` — all pinned in `.ufo/pins/counter-pins.json`, read at
  `dd1a3e6`). Base `6825a51425e91908f019ed65aa2f4209acbd7087`.
- Every number below is (a) quoted from committed bytes with the command that produced it, or (b) a double-`@`
  token (`@@`-wrapped, listed in §Tokens). No token may be replaced by an unmeasured value: an unrun check has not
  passed.
- Insertion points: **A** append at EOF (after line 2971, the round-63 section's closing line); **B** insert after
  line 1798 (`| \`inline-dispatch-evidence\` | …`) and before line 1799
  (`*Round-48 note (capabilities; the paragraphs above stay as written).*`); **C** insert after the Move log
  separator (line 444) and before the round-50 row (line 445); **D** insert immediately after the row from **C**.

---

## A. Section — append at EOF

```markdown
## Round 64 — claims, verdicts, limits (2026-10-25)

Plan `.ufo/waves/round-64/plan.md` frozen at `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` (base
`6825a51425e91908f019ed65aa2f4209acbd7087`), counters and controls pinned in `.ufo/pins/counter-pins.json`
before the first `.ready` marker; frozen counters and controls are never edited by a wave seat — a wrong counter is
reported, not patched. Measured revision M — the revision both counting commands were run at, recorded in
`@@C1_AFTER@@`.

**C1 — operability, capability acquisition `report-receipt-diff` (contract `kumitate-report-receipt-diff-v1`,
frozen `RECEIPT64_HELD`, rule R64 v1, P1..P5).** Rounds 60–63 filed reports whose claims the lane's own receipts
contradicted or left as template tokens (round-60 report as filed: six `__TIP__`/`__MEASURED__`/`__COMMITS__`
tokens and `DISPATCH60_HELD held=10/10` where `close/dispatch60-tip.txt` reads `DISPATCH60_UNMET held=8/10`), and
nothing in the lane compared a report with the committed receipts it cites. The new tool diffs a report against
`.ufo/waves/round-N/{base,close}/*` read at a revision and names seven finding ids: `PLACEHOLDER`,
`TALLY_UNRECEIPTED`, `RECEIPT_MISSING`, `HASH_DEAD`, `HASH_ORPHAN`, `SECTION_MISSING`, `SHONEN_COUNT`
(`scripts/report-receipt-diff.mjs:10-23,50-94`). Counting command:
`node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M> --report <round-64 report>`.
Before at base `6825a514`: `RECEIPT64_UNMET held=0/5 checks=5 rev=6825a51425e91908f019ed65aa2f4209acbd7087
rule=R64 | P1 MISS tool-absent | P2 MISS tool-absent | P3 MISS tool-absent | P4 MISS tool-absent | P5 MISS
report-not-given`, exit 1 (`base/receipt64-base.txt`). At the freeze rev `dd1a3e6` the same command without
`--report` reads `RECEIPT64_UNMET held=3/5 checks=5 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef rule=R64 |
P2 MISS ids=6 | P5 MISS report-not-given`, exit 1 (observed by this seat; P5 MISS is expected without `--report`,
P2's MISS is not — see the P2 bullet below). After at M: `@@C1_AFTER@@`. Controls: `controls/receipt/` holds 16
committed cases (expect = exit code, then sorted finding ids or `CLEAN`): three read `CLEAN`
(`c0-honest`, `c14-honest-templates`, `c15-honest-two-receipts`), thirteen name ids, and the ids exercised are
six — `PLACEHOLDER`, `SHONEN_COUNT`, `HASH_DEAD`, `TALLY_UNRECEIPTED`, `RECEIPT_MISSING`, `SECTION_MISSING`
(`for d in .ufo/waves/round-64/controls/receipt/*/; do tr '\n' ' ' < "$d/expect"; echo; done`). Real data at
`dd1a3e6` (`--rev dd1a3e6`, fleet report blobs at `7b0581ed` / `8fd46e61`): the round-60 report reads
`REPORT_RECEIPT: DRIFT PLACEHOLDER,TALLY_UNRECEIPTED (round=60 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef
bytes=13611)` exit 1 with exactly 6 `PLACEHOLDER` lines = the independent `grep -o '__[A-Z][A-Z0-9_]*__' | wc -l`
count and a `TALLY_UNRECEIPTED DISPATCH60_HELD held=10/10` line; the round-63 report reads
`REPORT_RECEIPT: CLEAN (round=63 rev=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef bytes=17479)` exit 0. The tool's
selftest reads `REPORT_RECEIPT_SELFTEST: PASS (20/20)` exit 0 at `dd1a3e6`. **P2 satisfiability (reported, not
patched):** P2 requires `>= 8` distinct ids exercised (`probe/receipt64-probe.mjs:61`) but the frozen tool defines
seven ids and the committed cases exercise six, so at the freeze rev C1 reads `held=3/5` by construction; the
plan's own P2 prose ("16 at freeze: one honest, the rest each altering one thing") also undercounts the honest
cases (three, not one). `@@P2_RULING@@`. Limits stated, not hidden: "only labelled `<LABEL>_HELD|UNMET held=x/y`
tallies are compared (a bare `held=9/10` cannot be told from a plan's target); a receipt the lane itself wrote is
trusted as written; HASH_DEAD cannot resolve a hash of an external repository. Wave seats are asked to find
cheaper lies (ratchet)." Score delta: none; operability stays 9 (terminal under the frozen `f_O`) — the moved
surface is the repertoire, not the integer.

**C2 — coverage frontier, jj workspaces as seat containment (sourced claim; the retired coverage aggregate stays
10).** `PROVINCE.md`'s *Isolation substrates* band gains its first *demonstrated* jj-workspace ground:
`corpus/knowledge/jj-workspace-seat-containment.md`, grounded on rows opened this round and a hermetic,
re-runnable demo `scripts/jj-seat-demo.sh` (contract `kumitate-jj-seat-demo-v1`). The lane's
`agent-isolation-substrates.md` said for M7 "Not demonstrated this round; no table row relies on it"; the demo
measures the staged claim wrong in one arm — abandoning the seat's checked-out commit leaves the seat `stale`,
while rewriting it leaves the seat `fresh`. Frozen predicate `JJ64_HELD` (rule J64 v1, J1..J8). Counting command:
`node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <M>`. Before at
base `6825a514`: `JJ64_UNMET held=0/8 checks=8 rev=6825a51425e91908f019ed65aa2f4209acbd7087 rule=J64 | J1 MISS
entry-absent | J2 MISS no-entry | J3 MISS no-rows | J4 MISS bullets=0 | J5 MISS no-bullets | J6 MISS
stated-keys=0;demo-exit=127 | J7 MISS census-exit=0 province-names-entry=false readme-map-clean=false | J8 MISS
no-amendment-heading,amendment-lacks-entry-or-M7`, exit 1 (`base/jj64-base.txt`). Do-nothing control (committed
before data): `probe/jj-donothing-control.sh` on a sandbox clone at the base copies the staged entry
byte-for-byte, adds a frontier line and an amendment, changes nothing else —
`JJ64_UNMET held=1/8 … | J1 MISS trio source=true verified-at=false recheck=true | J2 MISS cites-1-rows,S295:not-in-registry
| J3 MISS S295:unbound | J4 MISS bullets=0;S295:no-bullet | J5 MISS live-fetch-skipped | J6 MISS
stated-keys=0;demo-exit=127 | J7 MISS census-exit=0 province-names-entry=true readme-map-clean=false`
(`base/jj64-donothing.txt`; only J8 passes — a control meeting 8/8 would mean the counter is wrong). At the freeze
rev `dd1a3e6` the counter reads `JJ64_UNMET held=0/8` (all eight MISS: entry absent, no rows, no bullets, demo
keys `stated-undefined` against live values, PROVINCE not naming the entry, no amendment) — observed by this seat.
After at M: `@@C2_AFTER@@`. Demo: `bash scripts/jj-seat-demo.sh` on this host prints 15 `JJ_SEAT: <key>=<value>`
lines and `JJ_SEAT_DEMO: DONE jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`, exit 0, byte-equal to
`base/jj-seat-demo-freeze.txt` (observed at `dd1a3e6`; keys: `workspaces_after_add=2`, `seat_gets_base_file=yes`,
`seat_has_git_dir=no`, `seat_file_in_default_tree=no`, `default_status_clean_after_seat_write=1`,
`seat_snapshot_in_shared_op_log=2`, `ignore_working_copy_adds_op=no`, `rewrite_seat_head_seat_state=fresh`,
`rewrite_seat_head_description_seen=rewritten`, `abandon_seat_head_seat_state=stale`,
`abandon_seat_head_files_on_disk=kept`, `update_stale_recovers=yes`, `absolute_path_write_seen_in_default=1`,
`workspaces_after_forget=1`, `seat_dir_after_forget=present`). **The frontier sentence must be superseded, not
left standing:** `PROVINCE.md:21` currently ends "harness isolation is off on this host, jj workspaces are not
demonstrated" and J7 requires PROVINCE to name the entry on a frontier line. `@@PROVINCE_LINE@@`. Limits stated,
not hidden: "the counter measures an evidence chain plus a live demo re-run; it cannot tell a sound entry from a
well-grounded wrong one, and an attacker-hosted row URL would pass J5 (carried hole from T63). It scores the
surface it names, so on a retired axis it carries no integer; the verdict is the counter." Score delta: none;
coverage aggregate stays 10 (retired).

**Registry and census (frontier step, not a claim).** Before: `SOURCES_CHECK: CLEAN (rows=136
tiers=A:113,B:15,C:8 status=queued:13,mined:104,rejected:19 entries_with_source=20 legacy=38)`, exit 0
(`base/sources-check-before.txt`; the census receipt `base/census-before.txt` prints the six W04 duplicate-URL
warnings and `EXIT=0` but no row count, so the 136 comes from the sources gate, not the census). After at M:
`@@CENSUS_AFTER@@`.

**Maintenance repairs (not claims).** The round opened with two live defects, both named in the plan.
`readme-map` DRIFT: `README_MAP: note unpinned:lessons/round-63-verifier-spotcheck.md` /
`README_MAP: DRIFT files=154 rows=153 covered=153 bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md`,
exit 1 (`base/readme-map-before.txt`; reproduced at `dd1a3e6`). `proxy-check` DRIFT: `PROXY: DRIFT
(C2_TOTAL_DRIFT term=C2_total declared=153 computed=154 delta=+1; AXES_DRIFT term=coverage declared=10
computed=9; src-rev=31c465f15669)`, exit 1 (`base/proxy-before.txt`). At the freeze rev the same gate adds two
terms the plan's maintenance list does not name: `PROXY  error  A_DRIFT  A: declared=257 computed=867
delta=+610` and `PROXY  warn  PIN_UNPINNED  scripts/report-receipt-diff.mjs has no pin.<name> key in the
kumitate-proxy-v1 or kumitate-gate-pins-v1 stanza` (`node scripts/proxy-check.mjs` at `dd1a3e6`, exit 1; the
`A` term counts `.mjs/.js/.sh/.py` files in the lane **worktree**, `scripts/proxy-check.mjs:945`, and 616 of the
875 are round-64 wave files, 563 of them under two seat build dirs). `@@MAINT_AFTER@@`.

**Waves and admission.** `@@WAVES@@`. Admission: `@@C1_AFTER@@` / `@@C2_AFTER@@` — a claim admits only if its
frozen counter prints `HELD … exit 0` at M. No axis score changed and no axis harmed: operability is at the frozen
`f_O`'s terminal 9, coverage:script-layer / coverage:runtime-layer / coverage:kimi-layer and the retired aggregate
are at 10, so the verdict is the counter, not a number. `@@HARM@@`.

**Limits carried (not repaired here).** (a) The two stated limits above are the claims' own; the C1 P2 floor and
the C2 frontier-sentence contradiction are reported for an L1 ruling, not patched by a seat. (b) The
`jj-donothing-control.sh` receipt's trailing `exit=0` is the **wrapper's** exit (`probe/jj-donothing-control.sh:19`
ends `node "$PROBE" … --no-live || true`), not the counter's exit 1 the plan quotes; two re-runs by this seat
printed the same verdict and MISS list but two different fixture revs (one `2264ab3f558fc3013668e0e8a7a54400198bba9e`;
the receipt holds `213cfac4…`), because the sandbox commit's timestamp is part of its hash, and their exits differed
(1 when the `rm -rf` trap failed, 0 when it did not), so that receipt's rev is not re-derivable and its exit is not
the counter's. (c) `bash
scripts/plan-before-ready.sh --round 64` at the freeze rev reads `PLAN_BEFORE_READY: NA rev=dd1a3e6… round=64
reason=NO_MARKER … marker=-`, exit 2, because the `.ready` marker is untracked at `dd1a3e6`; Q58 must be cited at
the revision that contains the marker. `@@Q58_AFTER@@`.
```

---

## B. Capabilities row — `report-receipt-diff`

`@@C1_ROUND@@` — enter the row only if C1 reads `RECEIPT64_HELD held=5/5 checks=5` exit 0 at M (`@@C1_AFTER@@`);
if C1 is UNMET, record the MISS in section A instead and do not enter the row (an unadmitted row is history, not
a capability — cf. the round-60 `dispatch-evidence` row).

Insert after line 1798 and before line 1799:

| `report-receipt-diff` | Diff a round report against the committed receipts it cites: read the report bytes and the lane's receipts at a revision (`git show <rev>:.ufo/waves/round-N/{base,close}/*`; the worktree only when `--rev` is absent) and name one line per finding — `PLACEHOLDER` (a template token `__NAME__`, `LANE_HASH` or `TBD`; an angle-bracket `<tip>` is a legitimate command template and is not flagged), `TALLY_UNRECEIPTED` (a labelled `<LABEL>_HELD\|UNMET held=x/y` that no receipt line carries with the same label and the same x/y), `RECEIPT_MISSING` (a `.ufo/waves/round-N/(base\|close)/<file>` the report names that does not exist at the rev), `HASH_DEAD` (a 40-hex hash resolving in neither the lane nor the fleet repo), `HASH_ORPHAN` (a hash in the lane that is not an ancestor of the lane rev), `SECTION_MISSING` (one of the six required report headings), `SHONEN_COUNT` (the `SHONEN` heading not exactly once, or fewer than four box lines under it); `REPORT_RECEIPT: CLEAN (…)` exit 0 / `DRIFT <ids>` plus one line per finding exit 1 / exit 2 fail-closed (unreadable report or rev) / 64 usage. Declared limit: only labelled tallies are compared (a bare `held=9/10` cannot be told from a plan's target) and a receipt the lane itself wrote is trusted as written | `node scripts/report-receipt-diff.mjs --selftest` → `REPORT_RECEIPT_SELFTEST: PASS (20/20)` exit 0 at `dd1a3e6`; real data at `dd1a3e6` — round-60 report as filed (fleet `7b0581ed`) → `REPORT_RECEIPT: DRIFT PLACEHOLDER,TALLY_UNRECEIPTED (round=60 … bytes=13611)` exit 1 with 6 `PLACEHOLDER` lines (= the independent `grep -o '__[A-Z][A-Z0-9_]*__' \| wc -l` count) and `TALLY_UNRECEIPTED DISPATCH60_HELD held=10/10`; round-63 report as filed (fleet `8fd46e61`) → `REPORT_RECEIPT: CLEAN (round=63 … bytes=17479)` exit 0; frozen counter `node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> <M> --report <round-64 report>` → `RECEIPT64_HELD held=5/5 checks=5 rule=R64` (`@@C1_AFTER@@`); pin `pin.report-receipt-diff` still absent at `dd1a3e6` (`PROXY warn PIN_UNPINNED`) | @@C1_ROUND@@ |

Notes for the integrator (not part of the row): the row describes the tip bytes of
`scripts/report-receipt-diff.mjs` at the freeze (`dd1a3e6`); the frozen probe hashes nothing but runs the
revision's own tool from `git archive`, so a ratchet that adds an eighth finding id strengthens the row, never
relaxes it. Do not cite the row's own limit as closed.

---

## C. Move log row — round 64 (insert after line 444, before the round-50 row)

| 64 | operability (lowest non-retired axis; integer held 9 — terminal under `f_O`; C1 capability acquisition `report-receipt-diff`, contract `kumitate-report-receipt-diff-v1`) + coverage frontier (retired aggregate held at 10; C2 ground `corpus/knowledge/jj-workspace-seat-containment.md` on the PROVINCE *Isolation substrates* band) | `node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 6825a51425e91908f019ed65aa2f4209acbd7087` → `RECEIPT64_UNMET held=0/5 checks=5 … \| P1 MISS tool-absent \| P2 MISS tool-absent \| P3 MISS tool-absent \| P4 MISS tool-absent \| P5 MISS report-not-given`, exit 1 (`base/receipt64-base.txt`); `node .ufo/waves/round-64/probe/jj64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 6825a51425e91908f019ed65aa2f4209acbd7087` → `JJ64_UNMET held=0/8 checks=8 … entry-absent … no-amendment-heading`, exit 1 (`base/jj64-base.txt`); do-nothing control `JJ64_UNMET held=1/8` (`base/jj64-donothing.txt`, only J8 passes); base terms A=257, C2_total=153 declared/154 computed, coverage derived 9 | `@@C1_AFTER@@`; `@@C2_AFTER@@`; both counters' HELD lines at M, else the UNMET line as printed — no verdict is written here before it is measured | `.ufo/waves/round-64/plan.md`; `.ufo/waves/round-64/{base,close,probe,controls}/`; `scripts/report-receipt-diff.mjs`; `scripts/jj-seat-demo.sh`; `corpus/knowledge/jj-workspace-seat-containment.md`; `.ufo/pins/counter-pins.json`; `.ufo/pins/source-captures.json` |

---

## D. Move log row — round 65 (planned; insert immediately after the row above)

A planned row is **not** a measurement: it carries no verdict, no before/after reading, and it must be replaced by
the frozen plan's claim sentences when round 65 freezes (Q58). Its purpose is to declare which two claims the
frontier points at, so round 65 cannot silently pick an easier subject.

| 65 (planned) | operability (lowest non-retired axis; capability acquisition `counter-honest-controls` — bind **every** frozen counter to a committed honest control case, its `expect`, and a re-run verdict line, and exit DRIFT when a counter has no honest control, when its expect does not match a fresh run, or when its honest case is absent from the committed bytes) + coverage frontier (the *MCP protocol revisions* band's second family entry, `@@R65_C2_FAMILY@@`; `PROVINCE.md:20` states "other MCP revision families remain queued" and the band's only entry is round 59's `corpus/knowledge/mcp-orchestration-contract.md`, S125/S127/S136) | not frozen — no before-state exists until the plan is committed at `@@R65_PLAN_FREEZE@@`; observed basis for the candidate: 35 `*-probe.mjs` files under `.ufo/waves/*/probe/`, 16 of them pinned in `.ufo/pins/counter-pins.json` (25 pins), and that registry binds paths + sha256 only — it has no field naming a control case, an expect, or a verdict | unmeasured — no after-state may be written before M; the claim admits only if its frozen counter prints `HELD … exit 0` | candidate instruments: `scripts/counter-pins.mjs` (`kumitate-counter-pins-v1`), `.ufo/pins/counter-pins.json`, `.ufo/waves/round-64/controls/receipt/`, `.ufo/waves/round-63/controls/{inline,topology}/`, `PROVINCE.md:20` |

Justification recorded for the planner (not part of the row): candidate 2 (`counter-honest-controls`) is chosen
over candidate 1 (close a declared hole of a round-63/64 counter) because round 64's own freeze shows the missing
instrument — C1's P2 demands `>= 8` distinct finding ids while the tool defines 7 and the committed cases exercise
6, and no lane gate reads a counter's controls at freeze, so the defect surfaced only by running the probe
(`RECEIPT64_UNMET held=3/5 … P2 MISS ids=6`). Closing a declared hole is still the honest ratchet item inside
whichever claim is chosen (round-64 C1's bare-tally/lane-written-receipt holes; round-64 C2's attacker-hosted row
URL carried from T63), and it must not be used as a claim subject that leaves the lowest non-retired axis
unworked. Candidate 3 (a third PROVINCE band) is the round-65 C2 slot; the MCP revision family is the only band
whose own frontier line names queued families.

---

## Tokens (every double-`@` token above; `grep -c '@@'` on this file must reach zero at close)

1. `@@C1_AFTER@@` — M (full hash) plus C1's measured verdict line and exit code at M, with the close receipt path
   (`close/receipt64-*.txt`), and the round-64 report path passed to `--report` (P5).
2. `@@C2_AFTER@@` — C2's measured verdict line and exit code at M, with the close receipt path
   (`close/jj64-*.txt`).
3. `@@C1_ROUND@@` — the capabilities row's *First-working round* cell: `64` only once C1 reads HELD at M; if C1 is
   UNMET, the row is not entered and this token disappears with it.
4. `@@P2_RULING@@` — the P2 ids-floor resolution with its receipt: either (a) a pre-data erratum that changes the
   floor or the tool's id vocabulary (recorded as a rule change with its commit, since no seat has scored the claim
   yet at wave 1), or (b) the ratchet — an eighth finding id the tool accepts today plus a committed control
   exercising it — re-running the counter to a new reading. Both must name the receipt; neither may lower the 14
   case floor.
5. `@@PROVINCE_LINE@@` — the frontier line at M that names `corpus/knowledge/jj-workspace-seat-containment.md` and
   the appended supersede of the sentence "harness isolation is off on this host, jj workspaces are not
   demonstrated" (`PROVINCE.md:21`), quoted as committed bytes.
6. `@@CENSUS_AFTER@@` — the sources census at M: rows, exit code, warning count, and which S-ids the entry cites.
7. `@@MAINT_AFTER@@` — `node scripts/proxy-check.mjs` and `node scripts/readme-map.mjs` at the tip, with their
   verdict lines and exit codes; must state which of the four proxy terms (C2_TOTAL_DRIFT, AXES_DRIFT, A_DRIFT,
   PIN_UNPINNED) were repaired and which were carried, and how the `A` term was measured (worktree vs archive).
8. `@@HARM@@` — the no-axis-harmed line backed by the close gate table (each axis's gate reading at M), with dead
   seats named; must not claim an axis moved.
9. `@@WAVES@@` — wave roster: wave names, seats per wave, total, dead or session-exit seats named.
10. `@@Q58_AFTER@@` — `bash scripts/plan-before-ready.sh --round 64` at a revision that contains the `.ready`
    marker, with its line and exit code (or the honest `NA` reading if no such revision is committed).
11. `@@R65_C2_FAMILY@@` — the MCP revision family round 65's C2 would source (e.g. a named revision family that
    `PROVINCE.md:20` leaves queued); the planner fills it from the source queue, not from guesswork.
12. `@@R65_PLAN_FREEZE@@` — the commit hash round 65's plan is frozen at (unknowable now).
