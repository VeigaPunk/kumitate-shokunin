# LOG.md — round 64 entry (final draft, append-only)

Append after the last line of `LOG.md` (the round-63 bullet ends at `LOG.md:2304`; verified: the file's last
non-empty line is the round-63 bullet's tail). Never edit a prior bullet. Every number below carries the command
that produced it; a value not measured when this draft was written is the literal word **UNMEASURED** followed by
its filling command. Draft by seat `K64R2ScribeLogFinal` (wave 2); the L1 integrates.

---

- 2026-10-25 — round 64 (attempt 1): plan frozen before the first wave marker
  (`.ufo/waves/round-64/plan.md`, committed at `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` on base
  `6825a51425e91908f019ed65aa2f4209acbd7087`). Lane commits this round:
  `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` (freeze: plan, probes R64/J64, 16 controls, base receipts,
  `scripts/report-receipt-diff.mjs` v1, `scripts/jj-seat-demo.sh` v1), `d92cf1fff3026087a0e21a3183b97de169c6f22c`
  (wave-1 landing: tool v2, demo v2, 21 ratchet controls, 41 wave-1 reports), and
  `2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8` (C2 entry, rows S198–S200, captures, amendment, PROVINCE/README,
  lesson, QUALITY Q60/Q61, plan-before-ready map arm) — `git log --oneline -6`.
  **C1 operability capability `report-receipt-diff`** (`scripts/report-receipt-diff.mjs`, contract
  `kumitate-report-receipt-diff-v2` at the tip, v1 at the freeze; exit 0 clean / 1 finding / 2 fail-closed / 64
  usage; selftest `node scripts/report-receipt-diff.mjs --selftest` → `REPORT_RECEIPT_SELFTEST: PASS (52/52)`,
  exit 0, against `PASS (20/20)` at the freeze, `base/report-receipt-diff-selftest-freeze.txt`). The frozen
  counter `RECEIPT64_HELD` rule R64 v1 reads, at the integrated tree, `RECEIPT64_UNMET held=4/5 checks=5
  rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 rule=R64 | P5 MISS report-not-given`, exit 1
  (`node .ufo/waves/round-64/probe/receipt64-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin
  2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`); base `RECEIPT64_UNMET held=0/5 … exit=1`
  (`base/receipt64-base.txt`). P5 is the arm that needs the round-64 report as filed, so the tip reading is
  **UNMEASURED** and its filling command is `node .ufo/waves/round-64/probe/receipt64-probe.mjs
  /home/vgpnk/Projects/shokunin/kumitate-shokunin <close-tip> --report .ufo/reports/round-64/kumitate.md`.
  **C2 coverage frontier**: the first *demonstrated* jj-workspace ground,
  `corpus/knowledge/jj-workspace-seat-containment.md` plus `scripts/jj-seat-demo.sh` (contract
  `kumitate-jj-seat-demo-v2`; `bash scripts/jj-seat-demo.sh` → 21 `JJ_SEAT:` keys then `JJ_SEAT_DEMO: DONE
  jj=0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5`, exit 0; v1 at the freeze printed 15,
  `base/jj-seat-demo-freeze.txt`; the demo has no exit-1 arm, so it is a demo and never a gate). The frozen
  counter `JJ64_HELD` rule J64 v1 reads `JJ64_HELD held=8/8 checks=8 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8
  rule=J64`, exit 0 (`node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> 2ed8a5f`), against base `0/8` exit 1
  and the committed do-nothing control `JJ64_UNMET held=1/8` (`base/jj64-donothing.txt`).
  **What wave 1 found (41/41 reports; `ls .ufo/waves/round-64/w1/*.md | wc -l` → 41 vs `w1-dispatch.json`
  `{"spawn":41,…}`):**
  (a) *the freeze's own P2 floor was unreachable* — P2 requires `>= 8 distinct finding ids` while the 16 frozen
  cases exercise 6: `git archive dd1a3e6f .ufo/waves/round-64/controls/receipt | tar -x -C <scratch>` then
  `ls -d …/controls/receipt/*/ | wc -l` → 16 and `cat …/*/expect | tr ' ' '\n' | grep -E '^[A-Z][A-Z_]+$' |
  sort -u | grep -v CLEAN` → `HASH_DEAD PLACEHOLDER RECEIPT_MISSING SECTION_MISSING SHONEN_COUNT
  TALLY_UNRECEIPTED` (6), with `HASH_ORPHAN` unreachable from a plain-directory control lane; found
  independently by eight seats and disclosed in `controls/CHANGES-AFTER-FREEZE.md:14-15`. The tool could
  therefore not read HELD at any revision as frozen — a defect of the freeze, not of the subject;
  (b) *twenty forgeries of the v1 tool* — `K64ExecReceiptForge` built 20 report-lies (spaced/lower-case/table/
  zero-width tallies, cited-receipt scoping, `checks=` mismatch, symlinked/empty/escaping receipts, fence-blind
  sections, 39-digit and upper-case hashes, five more placeholder spellings) that all read `CLEAN` on v1 and all
  read DRIFT on v2 (`.ufo/waves/round-64/w1/K64ExecReceiptForge.md:1,18-37`);
  (c) *the demo was not hermetic* — v1's `seat_has_git_dir` flipped with `TMPDIR` ancestry: reproduced on the
  frozen bytes, `D=$(mktemp -d) && git -C "$D" init -q`, then `TMPDIR=$D bash <freeze>/scripts/jj-seat-demo.sh`
  → `JJ_SEAT: seat_has_git_dir=yes`, while the shipped v2 under the same `TMPDIR` reads `seat_has_git_dir=no`
  (`build/K64ExecJjDemoHarden/tmpdir-flip.txt`); inherited `GIT_WORK_TREE` without `GIT_DIR` made v1 exit 2
  (`fatal: GIT_WORK_TREE … not allowed without specifying GIT_DIR`), and v2 fail-closes on `util-absent`
  instead of leaking `mktemp: command not found`;
  (d) *the staged claim was narrowed, not copied* — "the seat does not go stale" holds only for *rewriting* the
  seat's checked-out commit and is contradicted by *abandoning* it: `rewrite_seat_head_seat_state=fresh`,
  `abandon_seat_head_seat_state=stale`, `abandon_seat_head_files_on_disk=kept`, `update_stale_recovers=yes`,
  `update_stale_abandoned_seat_file=deleted-no-recovery-commit` (same demo run).
  **Controls and ratchet:** 16 → 37 committed cases (`ls -d .ufo/waves/round-64/controls/receipt/*/ | wc -l` →
  37; 20 `k1…k20` + `c16-held-cited-other-round`), distinct ids exercised 6 → 8 (`cat …/*/expect | tr ' ' '\n' |
  grep -E '^[A-Z][A-Z_]+$' | sort -u` → the 8 above plus `RECEIPT_EMPTY`, `TALLY_CHECKS_MISMATCH`; two cases
  read CLEAN), P2's floor stays 14 cases / 8 ids — a strengthening, never a relaxation, and no frozen counter,
  probe check, threshold or pin changed (`node scripts/counter-pins.mjs` → CLEAN, per
  `CHANGES-AFTER-FREEZE.md:5-7`). **Assimilation:** ONE theme, jj seat containment, 12 staged rows — ONE admit
  (staged `jj-operation-log-and-seat-staleness` + `jj-seat-staleness-outcome`, merged and re-grounded into the
  new entry) and 7 rejects with named flips (superseded definition; two citing campaign transcripts outside the
  lane; three same-date or fleet-path amendments; carried r63 rejects unchanged); the six URL-bearing staged
  rows are re-pointed by document onto S198/S199/S200, the six transcript-only rows are not appended. Collision
  guard: registry 136 ids, staged 155, `comm -12` → `S195 S196 S197` (lane ids equal staged ids for documents
  the lane already holds; none appended), no jj row collides, adopted ids continue at S198; negative control
  raises collisions 3 → 4 on an indented `  | S259 |` fixture. **considerthese:** `considerthese/2026-10-25.md:62-63`
  idea 2 ("diff reports against receipts") is C1; `:59-61` idea 1 ("try to forge each new gate") was applied to
  the new tool and both counters by the wave-2 forge seats — that is where the 20 forgeries above came from.
  **Mistake mined:** the R56-V3 README-map drift recurred a tenth time — the round-63 spot-check file landed
  without its `corpus/README.md` row and `covered` pin (base `README_MAP: DRIFT files=154 rows=153 covered=153
  bad=2 first=uncovered:lessons/round-63-verifier-spotcheck.md`, exit 1, `base/readme-map-before.txt`); class
  `reference-drift`, captured by `readme-map` only after the fact; the fix is the round-start gate Q60
  (`corpus/QUALITY.md:999`) with a red-before receipt, and Q61 (`:1050`) makes a report-vs-receipts diff
  mandatory before filing. The same lesson's second row is `unreceipted-tally` (r63's `PASS (69/69)` had no
  transcript; committed transcripts now read `PASS (25/25)`), routed as D2.
  **Inherited repairs, not claims:** `node scripts/readme-map.mjs` → `README_MAP: CLEAN files=156 rows=156
  covered=156`, exit 0 (base DRIFT above); `bash scripts/plan-before-ready.sh --round 64` →
  `PLAN_BEFORE_READY: PASS rev=2ed8a5f… round=64 … map=SKIP reason=MAP_PRE_EPOCH_ROUND`, exit 0 — the map arm
  is enforced from round 65 (`PBR_MAP_FROM` default 65), so round 64's own plan froze over a red map and the
  entry says so instead of hiding behind the epoch. `node scripts/proxy-check.mjs --strict` at the close tip is
  **UNMEASURED** here (wave-2 seats' build files change the `A` file count mid-flight): filling command
  `node scripts/proxy-check.mjs --strict`. **Census:** `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh
  validate --file corpus/SOURCES.md` exit 0, seven lines, six W04 duplicate-URL warnings (S034/S068/S084/S095/
  S123/S126, none disambiguated this round); `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN (rows=139
  tiers=A:116,B:15,C:8 status=queued:13,mined:107,rejected:19 entries_with_source=21 legacy=38)`, exit 0, against
  base `rows=136` (`base/sources-check-before.txt`); registry `grep -c '^| S' corpus/SOURCES.md` → 139 (136 + S198–S200).
  **Waves:** wave 1 41/41 reports; wave 2 39 planned (`w2-dispatch.json` `{"spawn":39,…}`) and its report count
  is **UNMEASURED** at this draft (`ls .ufo/waves/round-64/w2/*.md | wc -l`). **Stated limits carried:** C1
  compares labelled `<LABEL>_HELD|UNMET held=x/y` tallies only (a bare `held=9/10` cannot be told from a plan's
  target) and trusts a receipt the lane itself wrote; `HASH_DEAD` cannot resolve a hash of an external
  repository; over the 24 real reports of rounds 40–63 (`for n in $(seq 40 63); do test -f
  /home/vgpnk/Projects/shokunin/.ufo/reports/round-$n/kumitate.md && echo $n; done | wc -l` → 24) the v2 tool
  reads 13 CLEAN and 11 DRIFT, of which only r60 is a true DRIFT — but the cited receipt
  `controls/real-reports-v2.txt` carries the 11 DRIFT rows only (`wc -l` → 11; `grep -c CLEAN` → 0), so the
  13 CLEAN half is a subtraction, not a receipted row (see the round report's finding); C2's counter measures
  an evidence chain plus a live demo re-run and cannot tell a sound entry from a well-grounded wrong one, an
  attacker-hosted row URL passes J5 (carried hole from T63), the archive boundary is porous (`../` pin paths,
  committed symlinks, caller cwd, env-overridable census) and the measured tree runs with operator privileges
  — reported as limits, with the wave-2 supplementary checks closing what a frozen counter cannot; C2 sits on a
  retired axis and carries no integer — the verdict is the counter. **Open L0 questions:** the round files
  candidates for `/home/vgpnk/Projects/shokunin/.ufo/l0-questions.md` (post-freeze control growth under a
  declared ratchet whose frozen floor was unreachable; the Q60 epoch choice, round 65 vs retroactive FAIL of
  rounds 58/60/61/63/64; the kimi layer's degraded `K_members` record; whether the next round replaces the
  R64/J64 counters or adds a `bwrap`-bounded runner; the inherited R61 `dispatch61`/`doctrine61` probes) —
  drafted by seat `K64R2ScribeL0Questions`, **not appended by this seat**; the round-63 lines
  (`l0-questions.md:167`, `:168`) remain open and unmodified. Tool installs/updates: none.

---

## Provenance of each number (for the L1's re-run)

| value in the bullet | command | observed |
|---|---|---|
| lane commits | `git log --oneline -6` | `2ed8a5f`, `d92cf1f`, `dd1a3e6`, `6825a51`, … |
| C1 tip | `node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> 2ed8a5f` | `RECEIPT64_UNMET held=4/5 checks=5 … P5 MISS report-not-given`, exit 1 |
| C2 tip | `node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> 2ed8a5f` | `JJ64_HELD held=8/8 checks=8 … rule=J64`, exit 0 |
| selftest | `node scripts/report-receipt-diff.mjs --selftest` | `PASS (52/52)`, exit 0 |
| controls / ids | `ls -d …/controls/receipt/*/ \| wc -l`; `cat …/*/expect \| … sort -u` | 37; 8 ids + CLEAN |
| frozen controls / ids | `git archive dd1a3e6f …controls/receipt` then same two commands | 16; 6 ids |
| demo | `bash scripts/jj-seat-demo.sh` | 21 keys, `DONE jj=0.45.1-7c41cdeb…`, exit 0 |
| v1 non-hermetic key | `TMPDIR=<git-fixture> bash <freeze>/scripts/jj-seat-demo.sh` | `seat_has_git_dir=yes` (v1) vs `no` (v2) |
| census | `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file corpus/SOURCES.md` | exit 0, 6 W04 |
| registry | `grep -c '^\| S' corpus/SOURCES.md` | 139 |
| rows | `node scripts/sources-check.mjs` | `CLEAN (rows=139 …)`, exit 0 |
| readme-map | `node scripts/readme-map.mjs` | `CLEAN files=156 rows=156 covered=156`, exit 0 |
| plan gate | `bash scripts/plan-before-ready.sh --round 64` | `PASS … map=SKIP reason=MAP_PRE_EPOCH_ROUND`, exit 0 |
| real reports | `for n in $(seq 40 63); do test -f /home/vgpnk/Projects/shokunin/.ufo/reports/round-$n/kumitate.md && echo $n; done \| wc -l` | 24 |

## Do not write into this bullet

- No `held=` line that the frozen counter did not print: C1's 5/5 stays **UNMEASURED** until the round report
  exists and the probe is re-run with `--report`.
- No wave count read from a payload (`w2-dispatch.json` proves validation, not dispatch); wave 2's count comes
  from its report files, or from `inline-dispatch-evidence` if the wave ran inline.
- No number from a wave seat's report that the L1 did not re-run.
