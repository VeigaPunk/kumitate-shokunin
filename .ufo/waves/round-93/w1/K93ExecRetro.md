# K93ExecRetro — v2 domain run over the lane's own past waves (r85–r92)

Reference reading: FROZEN `probe/oracle93.py --results .ufo/waves/round-<N>/w1-results.json`, N=85..92.
Seat dir: `.ufo/waves/round-93/K93ExecRetro/` (`FILES.sha256` binds every receipt below).

**Deliverables**

| file | what it is |
|---|---|
| `retro-oracle.tsv` | 100 located seats × 13 columns (seat, role, resolved, chain_len, answered, superseded_by, upstream, error_attempts, recovered_attempts, flag_hops, revert_hops, final); header states the `:level`-strip rule |
| `retro-oracle-counts.tsv` | the per-wave count matrix (seats, dead, zero-served, not-answered-by-resolved, fallback, unrecovered, error/recovered turns, flag/revert hops) |
| `contradictions.md` | 13 graded report statements: **2 CONTRADICTED, 5 UNDERSTATE, 6 AGREE**, per-wave counts, plus 5 routed observations about the frozen text |
| `retro-candidate.txt` | candidate vs oracle: **1600/1600 field values over 100 seats**, 0 disagreements; `--strict` exits and summary lines for all 8 waves; READY hash binding |
| `oracle-recheck.txt` | my independent plan-text implementation vs the oracle: **1700/1700**, 0 disagreements |
| `oracle-attack.txt` | 20 hand-derived synthetic fixtures vs the oracle: **51/51 checks**, 0 fail |

`python3 build_retro.py <scratch> retro-oracle.tsv` · `python3 recheck_oracle.py <scratch> <scratch>` ·
`python3 oracle_attack.py <scratch>/fx-oracle` · `python3 candidate_vs_oracle.py <cand.mjs> <scratch>`.

**Counts (r85–r92).** 100 seats, 84 served / 16 dead / 0 aborted / 0 absent. 215 error turns, 181 recovered,
34 with no `retryRecovery` row. 17 seats answered on no turn of their `resolved` model (34 under the v1
`captured` rule); 6 seats fully unrecovered but 16 seats carry ≥1 unrecovered attempt; 63 flag_hops,
4 revert_hops; 2 seats served through `Stealth` (r91, the only aggregator wave). Per wave the divergences
are r85 10/13, r86 4 (5 dead), r87 3 (7 dead), r88 0, r89 5 (4 dead), r90 6 (3 revert_hops), r91 4 (1
never answered by its resolved model), r92 2.

**Contradictions.** r86 is the only round whose seat-status prose the record contradicts: `:6` "settled"
(5 of 12 end on an error turn, `answered: []`, `yielded: false`) and `:166-168` "settled … output was not
retained … kernel restarted" (all four are `final: dead` with exactly one turn — the 402
`Insufficient account funds` error — so there was no output and the cause is provider funds). `:163-165`
names `commandcode/…` for `K86Mutation` but the record has `resolved` `opencode-go/…` and **3** failed
attempts (2 on opencode-go/402, then the 401 on commandcode) — the D1 defect, graded UNDERSTATE because the
401 did come from the model named. r87 discloses 3 dead/partial seats where 7 seats end on an error turn
(the four extra all wrote `w1/<seat>.md`, which is why artifact counting passed them). r85/r90/r91 state the
dead half correctly and disclose no route. r88/r89/r92 agree — and r92's four routing claims reproduce
exactly, as do its retro figures 81/154 fallback, 26 dead, 43 captured-never-answered.

**Candidate (READY `98a5a3a3…`, bytes unchanged at READY time).** 1600/1600 against the oracle on the same
eight waves, 320/320 on my fixtures, and `--strict` grades the waves exactly by `final`: r85 0, r86 1
(5 dead), r87 1 (7), r88 0, r89 1 (4), r90 0, r91 0, r92 0. No blocker.

**Routed, not kill events.** (1) `last_error` for a seat with no error turn is undefined in `plan.md`; the
oracle prints `null` and 42/100 seats hit the case — the most load-bearing omission in the frozen text.
(2) `chain` never contains the primary model. (3) `superseded_by` can skip chain entries (r85: error on
`devin`, superseded by the 3rd chain entry). (4) No real transcript has `status: "superseded"` or a
`retryRecovery` object without `supersededBy` (181/181 carry both) — F fixtures are load-bearing.
(5) The seat-level unrecovered predicate hides 10 mid-flight deaths (6 seats vs 16).
