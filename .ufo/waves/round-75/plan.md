# kumitate round 75 — frozen plan (L1, 2026-11-04)

Base: lane branch `master` = `c38382d547a1ec21bb7f51b4c08ef08053e7abae` (round-74 close).
Host: Linux 7.2.11-arch1-1 x86_64 (plazir27), node v24.21.0, installed harness `omp/18.15.0`.
This file is frozen and committed in the scaffolding commit **before any data seat runs**, together
with every open/base receipt and every control receipt it names (Q58, Q64, Q65). Nothing below may
be narrowed after data; a miss is an honest stop.

Claims (2): C1 coverage:omp / C2 operability. Distinct axes, causally separable: C1 needs only the
census and its note; C2 needs only the proxy-check mode. Neither edits the other's file.

## C1 — coverage:omp (new live sub-axis): declare and bind every member of the OMP agent plane

Instrument: `scripts/omp-census.mjs` (contract `kumitate-omp-census-v1`, extended additively).
Score (pre-registered): `coverage:omp = floor(10 × (entries − findings) / entries)`, both numbers read
from the tool's own verdict line; nothing else is counted.

Before at base `c38382d5` (`open/gates-open.txt`):
`OMP_CENSUS: DRIFT (root=/home/vgpnk/.omp/agent entries=64 findings=40)` exit 1 → 24/64 ⇒ **3**.
The 40 findings are 29 `config.yml.pre-<slug>-<YYYYMMDD>`, 7 `agent.db.pre-<slug>-<YYYYMMDD>`
(4 files + 3 SQLite sidecars), 3 `models.db.corrupt-<epochms>-<uuid>` (1 file + 2 sidecars) and
1 `lsp.json`. All 40 are mode 0600 on this host (`open/prereqs.txt` mode sweep).

Frozen predicate — C1 verifies iff, at the measured commit, **all** of:
- (a) `node scripts/omp-census.mjs` exits 0 and prints exactly one `OMP_CENSUS: CLEAN (` line
  carrying `entries=64`, `findings=0` and `bound=35/35`;
- (b) specificity — the same tool with `--root` on a scratch fixture that reproduces the live root's
  depth-1 shape (dirs `mkdir`, files hardlinked) **plus one added bogus member** prints
  `UNLISTED <that bogus name>` and exits 1; a catch-all/blanket widening must not read CLEAN;
- (c) `node scripts/omp-census.mjs --selftest` exits 0, final line `VERDICT: PASS`, last count line
  naming ≥ 34 cases (29 base + one per new rule arm);
- (d) drop-rule mutants — for each of the four new declaration units (base member `lsp.json`, chain
  families `config-pre`, `agent-pre-named`, `models-corrupt`) a copy of the tool with **that unit
  alone removed** exits non-zero from `--selftest` with `VERDICT: FAIL` and its sorted `FAIL` case
  names, confirmed by an immediate rerun (Q23 kill predicate); one receipt line per unit.

`bound` counts the declared names the knowledge note must bind: every `BASE_MEMBERS` name (26 after
the change) plus every `CHAIN_FAMILIES` id (9) = 35; the census reads
`corpus/knowledge/omp-agent-root.md` and reports `bound=<found>/35`, printing `NOTE_UNBOUND <name>`
for each miss.

Kill rule: any live finding at close; exit ≠ 0; `bound` < 35/35; the bogus fixture reading CLEAN; a
new unit whose removal does not flip a case; or the note arm accepting a family id it never binds.

Controls (pre-data, receipts under `controls/`):
- **do-nothing**: base receipt `open/gates-open.txt` (findings=40) cannot reach `findings=0`.
- **junk widening** `controls/c1-junkwiden.txt`: a copy of the tool with a catch-all rule for every
  unmatched name reads `OMP_CENSUS: CLEAN (… findings=0)` on the live root — so the verdict line and
  exit alone are gameable, which is why (b) and (d) are in the predicate, not just (a).
- **drop-rule live** `controls/c1-droprule.txt`: the real tool with the `agent-corrupt` family
  removed reads `VERDICT: FAIL` from `--selftest` naming that family's case — the kill predicate (d)
  is executable against today's tool, not a promise.

## C2 — operability: capability acquisition `origin-tip-drift`

Instrument: `scripts/proxy-check.mjs` (contract `kumitate-proxy-v1`, + one additive mode
`--tip-drift [--origin DIR]`; default-mode terms and verdicts unchanged).

Before at base `open/modes-open.txt`:
`node scripts/proxy-check.mjs --tip-drift; echo exit=$?` → `proxy-check: unknown argument:
--tip-drift` + usage, **exit 64**. The lane cannot measure how far the live origin has moved from
the pin without ad-hoc git: today `origin=fb7157fcf146` is **58 commits / 241 changed paths** past
`pin=31c465f15669` (161 other, 57 script-layer, 23 runtime-layer by the proxy's own layer
predicates — `open/prereqs.txt`, command `git -C <origin> diff --name-only <pin> <origin>`).

Frozen predicate — C2 verifies iff, at the measured commit, **all** of:
- (a) `node scripts/proxy-check.mjs --tip-drift` prints exactly one line
  `ORIGIN_TIP_DRIFT: MOVED pin=31c465f15669 origin=fb7157fcf146 commits=58 changed=241
  scripts=57 runtime=23 other=161` and exits **1** (the line starts `ORIGIN_TIP_DRIFT: MOVED`
  and carries every field named above — a different origin tip must change the numbers, never the
  shape; a drifted world is the expected verdict here, and exit 1 says so);
- (b) `--tip-drift --origin` on a tree whose HEAD equals the pin revision (the pinned read-only
  clone for the live receipt; a hermetic temp repo plus a temp pin file inside `--selftest`) prints
  `ORIGIN_TIP_DRIFT: IN_SYNC pin=… origin=… commits=0 changed=0 scripts=0
  runtime=0 other=0` and exits **0**;
- (c) `--tip-drift --origin <non-git dir>` prints `ORIGIN_TIP_DRIFT: FAIL-CLOSED <TOKEN>` and exits
  **2**; a malformed `--pin` likewise exits 2 with the token;
- (d) `node scripts/proxy-check.mjs --selftest` exits 0, `PROXY_SELFTEST: <n>/<n> pass` with n ≥ 127
  (124 base + ≥3 tip-drift arms), each of the three arms killed by removing that arm's branch alone
  (mutation receipt, one line per arm);
- (e) the default mode is unchanged and green: at the measured commit
  `node scripts/proxy-check.mjs --strict` prints `PROXY: MATCH` and exits 0, with the round's
  same-commit re-measured stanza (A, C2/C2_total and the two re-pins) disclosed in the report.

Kill rule: an arm's exit code off its value; a constant printer meeting one arm (control
`controls/c2-stub.txt` shows both constant stubs miss one arm each); the new mode changing any
default-mode term or verdict; an arm surviving its mutant.

Capability: on admission the SCORECARD capabilities row `origin-tip-drift` enters with the evidence
pointer `close/tip-drift.txt`. Operability integer stays 9 (`f_O` terminal; A rises only by the
committed receipts' own runnable files, disclosed in the stanza re-measure).

## Score arithmetic (pre-registered, so the report cannot fit it)

| axis | before | after target | ceiling |
|---|---|---|---|
| coverage:omp (new) | 3 (`floor(10×24/64)`) | 10 (`floor(10×64/64)`) | 10 = terminal for `(E−F)/E` |
| operability | 9 (terminal) | 9 + capability row `origin-tip-drift` | 9 is this proxy's terminal integer |

The `coverage` (retired) and `coverage:{script,runtime,kimi}-layer` rows must read exactly what
`proxy-check` derives at the measured commit (`AXES_DRIFT` clean); the round re-measures the stanza
terms its own edits change (A; C2/C2_total after the routed map repair and this round's lesson;
`pin.omp-census`, `pin.proxy-check`) in the same work commit, and nothing else.

## Routed repairs (not claims; inherited red states)

- R74-spotcheck D1 erratum: SCORECARD round-74 text cites `pin.proxy-check d6f8dce9… → 25e7eccc…`;
  the landed pin is `aabf389e…`. Append-only erratum naming the superseded text (this plan's
  `close/` receipts carry the corrected value).
- R74-spotcheck D2/D3: this round's close receipts carry `rev=<hash> date=<ISO> exit=<n>` headers
  and numeric exits (the census receipts included).
- Spotcheck coverage recurrence (4th): `lessons/round-74-verifier-spotcheck.md` (landed by the
  round-74 closure after our close) is uncovered at open — `README_MAP: DRIFT files=180 rows=179
  covered=179 bad=2 first=uncovered:…` exit 1 (`open/maps-open.txt`). Repair: README row + covered
  entry for that file and (same commit) for this round's own new lesson; `README_MAP: CLEAN` and
  the stanza C2/C2_total re-measured at close.
- `node scripts/proxy-check.mjs` at open reads `PROXY: DRIFT (C2_TOTAL_DRIFT …179 vs 180;
  AXES_DRIFT coverage row=10 derived=9)` — the same recurrence through the proxy; it must read
  `PROXY: MATCH` at close (`open/gates-open.txt`).

## Waves

ONE v1 wave of 12 seats under `/home/vgpnk/Projects/shokunin/scripts/hyaku/ufo-wave-policy.json`
(band 8–16), attack roles 5/12 = 42 % (reviewer, critic, mutation-tester ×2, sentinel), connector
1, executors 2, scribes 2, scouts 2. The canonical planner seat is held by the L1 (validator rejects
`planner`; orchestrator ruling 2026-10-19). Dispatch through the inline handoff: the L1 writes
`.ufo/waves/round-75/w1.ready`, the orchestrator spawns, the L1 waits for `WAVE-DONE`.

## Frontier step

Census before/after with `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root
/home/vgpnk/Projects/shokunin kumitate` (start: `open/census-start.txt`, exit 0, six carried W04).
New rows this round (opened this round, each with URL, access date and ≤25-word located quote in the
lesson `## Gate`): S224 oh-my-pi `docs/lsp-config.md`; S225 the fleet run-state records naming the
operator's `config.yml.pre-*` / `agent.db.pre-*` copies. C1 is the sourced claim (it cites S224/S225
for the new declaration units). One mistake mined into `corpus/lessons/round-75.md`.

## Write scope

Lane repo `/home/vgpnk/Projects/shokunin/kumitate-shokunin` only (seats work in scratch clones at
$HYAKU_SCRATCH/kumitate-r75/<seat>/, never the lane tree, never commit/push/jj). The L1 only writes
the report `.ufo/reports/round-75/kumitate.md` (fleet) and appended L0 lines; commits go through
`jj-lane.sh` (lane) and `fleet-commit.sh` (report).

## Amendment 1 (appended 2026-11-04T01:29-03:00, pre-verdict; the freeze bytes above are unchanged)

Raised by the freeze-review seat (`K75ReviewFreeze`), each item accepted; no predicate, kill rule or
target is changed.

1. §C1 (b) says the fixture reproduces the live root's depth-1 shape with "files hardlinked". The
   committed builder `controls/mk-shape-fixture.sh` creates **shape-only empty files carrying the
   live member's mode** (dirs by `mkdir`), because `/home/vgpnk/.omp/agent` and `$HYAKU_SCRATCH`
   (`/fast`) are different devices and a hardlink cannot cross them. Superseded wording: "files
   hardlinked". Substance unchanged: depth-1 shape, one added bogus name, `UNLISTED` on it, exit 1.
2. `open/prereqs.txt` at the freeze commit carried only identity/version lines; the mode sweep
   (40 × 0600) and the 57/23/161 layer classification the plan quotes came from ad-hoc commands
   whose output was not committed. Both sweeps are appended to that same file *after* the freeze
   commit (append-only; freeze bytes unchanged), and the gap is disclosed in the report and mined
   as this round's mistake (Q65 class: plan-quotes-receipt).
3. `controls/c1-junkwiden.txt` §3 conflated two clauses; an appended `## Correction` there records
   it: clause (a) alone is gameable by a blanket catch-all, clause (b) run on the same committed
   tool rejects it, and (d) proves each declared rule load-bearing.
