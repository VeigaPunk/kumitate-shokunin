# ScribeLimitations — command capture (round 57, 2026-10-24)

Seat: ScribeLimitations (scribe, leaf). Scope: draft the round-57 report Limits section from
observed evidence: prepared-wave convention, E5 live-only arm, item-count supersession,
B5c lineage. Method: artifact reads + read-only git provenance checks. No probe re-runs,
no installs, no production writes.

## Read-only observations (git, cwd = /home/vgpnk/Projects/shokunin/kumitate-shokunin)

1. `git cat-file -t f0dc6d1160e66af65355bd353665adac22bbf4a9` → `commit`, exit 0 (R1).
2. `git cat-file -t c42afe1c189f2a1ecbe175f6e4ea4f9065c138d7` → `commit`, exit 0 (R2).
3. `git rev-parse 'c42afe1c189f2a1ecbe175f6e4ea4f9065c138d7^'` → `798d4d23743487d0c642239ca54deba421021af3`.
4. `git ls-tree --name-only c42afe1c… -- .ufo/waves/round-57/build/MutCounter57/counter-mutant.txt .ufo/waves/round-57/w1-taskcall.json`
   → both paths listed (mutant transcript and prepared-wave taskcall are committed at R2).
5. `git cat-file -t 1cd6d667e20075fd2e77e6e655bc755f95e3d940` → `fatal: git cat-file: could not
   get object info`, exit 128 — the scratch witness rev is NOT an object in the lane repo.
6. `git rev-parse HEAD` → `8c6f5b017d149b18134917378cdbed3b492d8e89` (HEAD read only; not moved).
7. `git log --format='%h %s' -1` on f0dc6d1 / 798d4d2 / c42afe1:
   - `f0dc6d1 round-57: freeze + integrate — readme-map gate (corpus file<->README-row bimap, R56-V3), worker-heartbeat/liveness frontier entry (S117-S120), plan+counters A57/D57, base receipts, scratch-HELD witness, time-spaced receipts + doctored control, 64-seat v2 wave spec (prepared), routed-defect answers R56-V1/V2/V3`
   - `798d4d2 round-57: close receipts — A57 10/10 + D57 5/5 at measured rev, after-census exit 0, prior-counter obsolescence transcript`
   - `c42afe1 round-57: SCORECARD measured-commit slots filled (R1 f0dc6d11; A57 10/10, D57 5/5 also re-verified at 798d4d23)`
8. `git rev-parse 'b3bd0633aec43ad2559f980b400e4d7077e10af3^'` → `f0dc6d1…` (R1 is b3bd0633's parent).
9. `git rev-parse 'f0dc6d1…^{tree}' 'b3bd0633…^{tree}'` → `e38659262ccb288340b6f55953436019bfccae19` / `286bc263bdfaba8a9c8f43c9da8475b8b25c6985` (trees differ).
10. `git merge-base --is-ancestor f0dc6d1… c42afe1…`; `$?` → `0` (R1 is an ancestor of R2).
11. First attempt `git cat-file -t f0dc6d1… c42afe1…` (two objects, one invocation) →
    `fatal: too many arguments`, exit 129; rerun as separate invocations (item 1–2). Recorded verbatim.

## Artifact reads (observed content backing the Limits section)

- `.ufo/waves/round-57/plan.md` — §Claims (K4, B5c), §Counters, §Routed-defect answers
  (R56-V1 prepared-wave convention; R56-V2 amendment), §Frontier step, §Harm battery (H5).
- `.ufo/waves/round-57/probe/doctrine57-probe.mjs` — header E5 line: "`E5 the live census
  /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root
  /home/vgpnk/Projects/shokunin kumitate` exits 0 (R51-4 class: live-only, recorded as a
  limit)"; code arm: `// E5 — live census exit 0 (live-only; recorded as a limit)` followed by
  `spawnSync('/home/vgpnk/Projects/shokunin/scripts/sources-census.sh', ['validate', '--root',
  '/home/vgpnk/Projects/shokunin', 'kumitate'], …)` — runs against the LIVE tree, not the
  git-archive extraction `T` used by E1–E4.
- `.ufo/waves/round-57/probe/attest57-probe.mjs` — header `B5c VACUOUS-HELD guard (R52-5
  lineage)`; implementation block `// B5/B5c — counter-pins without regression; vacuous-HELD
  transcript + guard` reads `.ufo/waves/round-57/build/MutCounter57/counter-mutant.txt`
  (regex `ATTEST57_UNMET held=0/0` + exit-1 token) and regexes the probe's own source for the
  checks-nonempty guard; both are conjuncts of scored check `B5` (`hold('B5', ok &&
  transcriptOk && guardOk && pins.pins.length >= 5, …)`). Ten scored checks B1..B10; no
  separately printed B5c line in receipts.
- `.ufo/waves/round-57/build/MutCounter57/counter-mutant.txt` — "hold-call-deleted — every
  `hold(` call in attest57-probe.mjs replaced by `void(` (18 sites), run against the scratch
  conformant post-state rev 1cd6d667e20075fd2e77e6e655bc755f95e3d940 (same rev as
  witness/scratch-held-*.txt)"; recipe `sed 's/\bhold(/void(/g' attest57-probe.mjs >
  a57-mutant.mjs`; observed output `ATTEST57: ATTEST57_UNMET held=0/0 checks=0 rev=1cd6d667…
  rule=A57 version=v1 | hold-call-deleted` and `exit=1`.
- `.ufo/waves/round-57/w1-taskcall.json` — `"status": "prepared", "dispatched": false,
  "reason": "orchestrator dispatches waves between rounds (R56-V1 convention); lane prepares
  and reports"`, `"items": 64`.
- `.ufo/waves/round-57/w1-validate.json` — `totalSeats: 64, attackShare: 0.375, distinctItems:
  true, leafOnly: true, wave: "kumitate-r57-w1", policy: "ufo-wave-policy-v2.json (band 64-128,
  attack>=0.25)"`.
- `close/FINAL-attest57-R1.txt` — `ATTEST57: ATTEST57_HELD held=10/10 checks=10
  rev=f0dc6d1160e66af65355bd353665adac22bbf4a9 … | B1 PASS | … | B5 PASS | … | B10 PASS`.
- `close/FINAL-doctrine57-R1.txt` — `DOCTRINE57: DOCTRINE57_HELD held=5/5 checks=5 rev=f0dc6d1…
  | E1 PASS | E2 PASS | E3 PASS | E4 PASS | E5 PASS`.
- `close/IDEMPOTENCE-798d4d2.txt` — both counters HELD at rev `798d4d23…` (A57 10/10, D57 5/5
  incl. E5 PASS).
- `close/IDEMPOTENCE-c42afe1c189f2a1ecbe175f6e4ea4f9065c138d7.txt` — both counters HELD at R2
  (A57 10/10 incl. B5, D57 5/5 incl. E5), each `exit=0`.
- `close/prior-probes.txt` (prior counters at rev f0dc6d1) — A53 17/17 HELD (B7a–B7d PASS);
  `ATTEST54: ATTEST54_UNMET held=9/10 … | B7 MISS row=true …`, exit=1; `ATTEST55: ATTEST55_UNMET
  held=9/10 … | B7 MISS row=true items=27 it…`; `ATTEST56: ATTEST56_UNMET held=9/10 … | B7 MISS
  row=true items=27 it…`; D53–D56 all `DOCTRINE5x_HELD held=5/5`.
- `close/prior-counters-at-close.txt` (prior counters at rev b3bd0633) — same verdicts: A54
  `B7 MISS row=true items=27 item24=true`, A55 `item25=true`, A56 `item26=true`, each
  `held=9/10`; A53 17/17; D53–D56 5/5.
  - Verbatim anomaly: this transcript prints `exit=0` on the lines following the ATTEST55 and
    ATTEST56 UNMET verdicts (and after the intervening doctrine lines), while the UNMET probes'
    contract is exit 1 and [attest54] shows `exit=1`. Looks like a pipeline-exit capture artifact
    in the close transcript. NOT re-run by this seat (do-not-rerun discipline); the substantive
    content (held=9/10, B7 MISS) is identical in both H5 transcripts.
- `close/harm-battery.txt` — `CHECKLIST: 27/27 pass`; `PROXY: MATCH (…C1=19/19 C2=135/135…)`;
  standalone census re-run: 4× `W04 duplicate url` warnings, `census_exit=0`, `EXIT=0`.
- `witness/scratch-held-attest.txt` — `ATTEST57: ATTEST57_HELD held=10/10 …
  rev=1cd6d667e20075fd2e77e6e655bc755f95e3d940` (scratch-HELD witness at the rev absent from
  lane history, see git item 5).
- `corpus/lessons/round-57.md` `## Mistakes` — R56-V3 row (fix R57-1, the readme-map gate);
  R56-V2 row (fix R57-2, A57 B7 freezes `items === 27` AND the full 24→counter-pins,
  25→source-capture, 26→source-dupes, 27→readme-map binding; future capability moves must
  re-express every item binding); R56-V1 row (fix R57-3, wave prepared+validated, dispatch is
  the orchestrator's); `## Round-56 carryover (routed)` repeats the three.
- `LOG.md` round-50 closure line — "R51-1..R51-4 honored (…; live-census limit)" (the R51-4
  class precedent for E5).
- `.ufo/waves/round-52/plan.md` line 31 — "R52-5 vacuous-HELD (`held=0/0 exit 0` on
  hold-call-deleted counter) → check B5c + the A52 probe's own checks-nonempty guard" (the
  lineage origin of B5c).

## Install record

None. No tool installed or updated by this seat (per round routing: no install needed).
