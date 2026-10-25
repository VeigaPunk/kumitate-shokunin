# LOG.md — round 64 entry (draft, append-only)

Insert: **append** after the last line of `LOG.md` (the round-63 bullet ends at `LOG.md:2304`).
Never edit a prior bullet; a correction to an older round is a new bullet that names the superseded text.
Fill every `@@TOKEN@@` at close from a re-run receipt, never from memory; leave a token in place (with the
`Limits` sentence) if its measurement was not taken.

---

- 2026-10-25 — round 64 (attempt 1): plan frozen before the first wave marker
  (`.ufo/waves/round-64/plan.md`, committed at `dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef` on base
  `6825a51425e91908f019ed65aa2f4209acbd7087`). C1 operability capability `report-receipt-diff`
  (`scripts/report-receipt-diff.mjs`, contract `kumitate-report-receipt-diff-v1`: seven finding ids
  `PLACEHOLDER`, `TALLY_UNRECEIPTED`, `RECEIPT_MISSING`, `HASH_DEAD`, `HASH_ORPHAN`, `SECTION_MISSING`,
  `SHONEN_COUNT`; 0 clean · 1 finding · 2 fail-closed · 64 usage; a 20-case hermetic selftest and 16 committed
  controls under `.ufo/waves/round-64/controls/receipt/`): frozen counter `RECEIPT64_HELD` rule R64 v1, at the
  tip `@@RECEIPT64_TIP@@`. The tool diffs ONE round report against the lane's committed receipts read at a
  revision — the round-60 report as filed (`7b0581ed`: six `__MEASURED__`/`__TIP__`/`__COMMITS__` tokens and
  `DISPATCH60_HELD held=10/10` where its own receipt reads 8/10) is the negative datum, the round-63 report as
  filed (`8fd46e61`) the positive one; base read `RECEIPT64_UNMET held=0/5` exit 1 (`base/receipt64-base.txt`).
  C2 coverage frontier: the first *demonstrated* jj-workspace ground —
  `corpus/knowledge/jj-workspace-seat-containment.md` plus `scripts/jj-seat-demo.sh` (contract
  `kumitate-jj-seat-demo-v1`, 15 outcome keys, exit 0 done / 2 fail-closed, **no** exit-1 arm, so it is a demo
  and never a gate); frozen counter `JJ64_HELD` rule J64 v1, at the tip `@@JJ64_TIP@@`. The staged claim "the
  seat does not go stale" holds only for *rewriting* the seat's commit
  (`rewrite_seat_head_seat_state=fresh`) and is contradicted by *abandoning* it
  (`abandon_seat_head_seat_state=stale`, `abandon_seat_head_files_on_disk=kept`, `update_stale_recovers=yes`) —
  measured on this host before the freeze (`base/jj-seat-demo-freeze.txt`, jj `0.45.1-7c41cdeb…`); the adopted
  text is re-grounded, not copied. Base read `JJ64_UNMET held=0/8` exit 1; the do-nothing control (staged entry
  copied byte-for-byte, one PROVINCE line, one amendment) read `JJ64_UNMET held=1/8`, J8 only
  (`base/jj64-donothing.txt`). Assimilation: ONE theme, jj seat containment (eight staged jj entries), adopting
  ONE merged entry (staged `jj-operation-log-and-seat-staleness` + `jj-seat-staleness-outcome`, re-grounded);
  collision guard in scratch — registry 136 ids, staged 155, collisions S195/S196/S197 (lane ids equal to
  staged ids for documents the lane already holds; none appended), no jj row collides; adopted ids continue the
  registry at S198, re-pointed by document; quarantine slice re-derived, 9 ids (S109, S116, S118, S129, S142,
  S143, S144, S145, S178), none appended. considerthese `2026-10-25.md` idea 2 ("diff reports against receipts")
  is C1; idea 1 ("try to forge each new gate") is applied to the new tool and both counters by the wave-2 forge
  seats. Mistake mined (§2b.3): the R56-V3 README-map drift recurred a tenth time — the round-63 spot-check file
  landed without its `corpus/README.md` row (base `README_MAP: DRIFT files=154 rows=153 covered=153 bad=2`, exit
  1) — class `reference-drift`, captured by `readme-map` only after the fact; the fix is a round-start gate run
  before the plan freeze (QUALITY Q60) with a red-before receipt (base exit 1 for the named reason, repaired
  tree exit 0). Inherited repairs, not claims: `readme-map` DRIFT and `proxy-check` DRIFT
  (`C2_TOTAL_DRIFT declared=153 computed=154`; `AXES_DRIFT coverage row=10 derived=9`) must read clean at the
  tip — `@@README_MAP_AFTER@@`, `@@PROXY_AFTER@@`. Routed R63 defects answered: D1 map row + the structural
  fix, D2 selftest transcripts committed, D3 appended correction of the w2 `-2` stem count (three, not one),
  D4 the kimi layer recorded degraded (K=49 not cited as clean), D5 both counters' declared holes stay named,
  D6 role mix planned before dispatch. Census before: exit 0, `rows=136`, six W04 duplicate-URL warnings
  (`base/census-before.txt`); after: `@@CENSUS_AFTER@@`; registry `136 → @@REGISTRY_AFTER@@`. Wave 1
  `@@W1_SEATS@@` seats, wave 2 `@@W2_SEATS@@`; the committed receipt controls stand at `@@CONTROL_COUNT@@`
  after the ratchet and the selftest at `@@SELFTEST_N@@` cases. Stated limits carried into the round: C1
  compares labelled tallies only (a bare `held=9/10` cannot be told from a plan's target) and trusts a receipt
  the lane itself wrote; `HASH_DEAD` cannot resolve a hash of an external repository; C2's counter measures an
  evidence chain plus a live demo re-run and cannot tell a sound entry from a well-grounded wrong one, and an
  attacker-hosted row URL passes J5 (carried hole from T63); C2 sits on a retired axis and carries no integer —
  the verdict is the counter. Tool installs/updates: none.

---

## Tokens to fill at close

| token | measured by | shape |
|---|---|---|
| `@@RECEIPT64_TIP@@` | `node .ufo/waves/round-64/probe/receipt64-probe.mjs <lane> <tip> --report <round-64 report>` | one line `RECEIPT64_HELD held=5/5 checks=5 rev=<40hex> rule=R64` + `exit=0` |
| `@@JJ64_TIP@@` | `node .ufo/waves/round-64/probe/jj64-probe.mjs <lane> <tip>` | one line `JJ64_HELD held=8/8 checks=8 rev=<40hex> rule=J64` + `exit=0` |
| `@@CENSUS_AFTER@@` | `bash scripts/sources-census.sh` (after appends) | the `rows=…` summary line + `EXIT=` |
| `@@REGISTRY_AFTER@@` | `grep -c '^| S' corpus/SOURCES.md` | integer (136 + adopted rows) |
| `@@W1_SEATS@@` | `ls .ufo/waves/round-64/w1/*.md \| wc -l` against `w1-dispatch.json` `counts` | `<reports>/<planned>` |
| `@@W2_SEATS@@` | same for `w2` | `<reports>/<planned>` |
| `@@CONTROL_COUNT@@` | `ls -d .ufo/waves/round-64/controls/receipt/*/ \| wc -l` | integer ≥ 14 (16 at freeze) |
| `@@SELFTEST_N@@` | `node scripts/report-receipt-diff.mjs --selftest` | `20/20` or higher |
| `@@README_MAP_AFTER@@` | `node scripts/readme-map.mjs` | `README_MAP: CLEAN …` + exit 0 |
| `@@PROXY_AFTER@@` | `node scripts/proxy-check.mjs --strict` | `PROXY: MATCH …` + exit 0 |

## Do not write into this bullet

- No claim outcome that the frozen counter did not print (a `held=k/5` line is quoted whole, with its exit).
- No seat count read from a payload (`w1-dispatch.json` proves validation, not dispatch); wave counts come from
  the report files, or from `inline-dispatch-evidence` when the wave ran inline.
- No number from a wave seat's report that the L1 did not re-run.
