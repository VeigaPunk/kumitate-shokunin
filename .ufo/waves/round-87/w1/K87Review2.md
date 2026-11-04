# K87Review2 — independent re-derivation of round-87 accounting

Seat: K87Review2 (reviewer, leaf). Round 87, lane `kumitate-shokunin`.
Base `db97929212bb61ae970b10abac3cc4cd976713ae`; freeze `25a3a75df123a59c5cf0de944a6d2f067e278f82`.
All paths below are absolute unless prefixed `open/`, `controls/`, `probe/`, `build/`, `w1/`, `close/`,
which resolve beneath `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-87/`.
Scratch: `/fast/scratch/hyaku/kumitate-r87/K87Review2` (removed before yield; receipts copied to
`build/K87Review2/`).

## Method

I did not edit the plan, the probe, the controls, any production file or history. Every number below
was re-produced by a command run in this seat, at the state named. Frozen bytes were verified against
the freeze commit (`build/K87Review2/frozen-sha256.txt`; all eight frozen files `UNCHANGED` vs
`git show HEAD:<path>`, and the probe sha256 is `6fbd07b54927681d729f15358577b164a994cefffcff2378839f892137280cee`,
matching the sentinel's independent reading).

## 1. Number table

| # | number | round's value (source) | my re-derived value | agree? |
|---|---|---|---|---|
| 1 | base census, rounds 74–86 | `receipts=239 bound=1 mismatch=9 unresolved=0 no_cmd=229` (`open/census-toolbind.txt`, plan, lesson:67) | same line, byte-identical: `diff` of a fresh run over rounds 74–86 vs the committed file → 0 lines, exit 0 (`build/K87Review2/census-rerun.txt`, `census.diff`) | **YES** |
| 2 | committed close receipts, rounds 74–86 | 239 (plan) | 239 = 12+17+25+25+12+12+22+21+20+29+25+9+10 | **YES** |
| 3 | round-86 receipts carrying `cmd=` **and** `tool_sha256=` | 10 (plan: “9 of the 10”) | 10 | **YES** |
| 4 | round-86 bound / mismatched | 1 / 9 | 1 / 9 (`selftest.txt` binds `scripts/counter-receipt.mjs`; its sha256 at `19b4e440` is `e9531370…`, the digest all ten receipts carry) | **YES** |
| 5 | “229 carry no `cmd=`/`tool_sha256=` at all” (plan) / “229 historical receipts without `cmd=`” (lesson:83) | 229 | `no_cmd=229` is the census counter, but the composition is **225 neither + 4 `cmd=`-only** (round-85 `c1-probe.txt`, `content-variation.txt`, `history-v2.txt`, `selftest.txt` carry `cmd=` and no digest) | **NO (prose)** — the counter is right, the sentence is false for 4 receipts |
| 6 | control `controls/base.txt` (instrument absent) | `C87_C1: UNMET held=0/12` | `held=0/12`, exit 1; arm lines byte-identical to the committed receipt modulo arm 12's random `pick=` (`build/K87Review2/control-base.txt`) | **YES** |
| 7 | control `controls/stub-clean.txt` | `held=0/12` | `held=0/12`, exit 1, identical modulo `pick=` | **YES** |
| 8 | control `controls/constant-drift.txt` | `held=1/12` | `held=1/12`, exit 1, identical modulo `pick=` | **YES** |
| 9 | control `controls/path-keyed.txt` | `held=3/12` | `held=3/12`, exit 1, identical modulo `pick=` | **YES** |
| 10 | frozen probe at the freeze rev, default tool (not yet integrated) | — | `C87_C1: UNMET held=0/12`, exit 1 (`probe-head.txt`) | n/a |
| 11 | frozen probe at the freeze rev, both build candidates | — | `held=5/12`, exit 1 (`probe-candidate-head.txt`, `probe-integrated-noclose.txt`): arms 4–8, 10, 11 read `no-r87-close` | n/a |
| 12 | instrument selftest | 39 cases (lesson: “39-case hermetic selftest”) | `RECEIPT_BIND_SELFTEST: PASS held=39/39`, exit 0 (`integrated-selftest.txt`) | **YES** |
| 13 | integrated instrument bytes | `scripts/receipt-bind.mjs` | worktree file exists, sha256 `b640ff3115228e2d7cc1ca748bc892db1887e33f356197ed86937b989eaf4c0a` = `build/K87ExecBind/receipt-bind.mjs` byte-for-byte; it is **untracked** at the time of writing | pending commit |
| 14 | A (tracked/worktree runnable, non-`.ufo`) | stanza declares 35 (round-86 value) | **36** after integration (`walkFiles` sees the new `scripts/receipt-bind.mjs`); 35 before it | expected +1, stanza must move |
| 15 | A_wave (non-scoring) | 955 (round-86 value) | live, moving: 962 → 977 → 1001 → 1010 as seats write `.ufo` runnables | must be re-read at M |
| 16 | C (SKILL.md checklist lines) | 45 (stanza) | **46** (the round-87 “Receipt-subject binding” item is in the worktree; node and GNU-grep counts agree at 46) | expected +1 |
| 17 | C1 / C1_total | 19 / 19 | 19 / 19 | **YES** |
| 18 | C2 / C2_total | 219 (stanza) | **222 / 222** (`corpus/knowledge`+`corpus/lessons` = 222 files; README rows = 222) | expected +3 (spotcheck lesson, receipt-subject-binding, round-87 lesson) |
| 19 | operability / coverage | 9 / 10 | 9 / 10 (`floor(10×82/85)`, `floor(10×19/19×222/222)`) | **YES** |
| 20 | `README_MAP` | adoption read `files=220 rows=220 covered=220` (lesson:68, historical) | now `README_MAP: CLEAN files=222 rows=222 covered=222`, exit 0 | **YES at close** (220 is the adoption-time reading) |
| 21 | `readme-map --selftest` | 19/19 (the round-86 candidate-4 repair adds case 19) | `README_MAP_SELFTEST: PASS (19/19)`, exit 0 | **YES** |
| 22 | `spotcheck-adopt --check` | CLEAN after adoption | `SPOTCHECK_COVERAGE: CLEAN spotchecks=53 uncovered=0` + `MAP: CLEAN`, exit 0 (round 86: 52) | **YES** |
| 23 | `SOURCE_CAPTURE` | R86-D3 re-measure at tip | `SOURCE_CAPTURE: CLEAN captures=78 exemptions=111`, exit 0 | re-derived |
| 24 | `SOURCE_DUPES` | R86-D3 | `SOURCE_DUPES: CLEAN groups=7 known=7`, exit 0 | re-derived |
| 25 | `SOURCES_CHECK` | R86-D3 | `SOURCES_CHECK: CLEAN (rows=189 tiers=A:159,B:20,C:10 status=queued:13,mined:150,rejected:26 entries_with_source=42 legacy=38)`, exit 0 | re-derived |
| 26 | `proxy-check --json` terms | round will quote A=36 C=46 C2=222 | A=36, C=46, C2=222, C2_total=222, C1=19, C1_total=19, operability=9, coverage=10, `ok=false` | **YES on terms, NO on verdict** (DRIFT until the stanza/pins move; see §4) |
| 27 | `proxy-check --strict` | must read MATCH (round proof) | **DRIFT**, exit 1: `A_DRIFT`, `A_WAVE_DRIFT`, `C_DRIFT`, `C2_DRIFT`, `C2_TOTAL_DRIFT`, `GATE_PIN_DRIFT pin.readme-map`, `PIN_UNPINNED scripts/receipt-bind.mjs` | **NO — not yet** |
| 28 | probe at M | `C87_C1: HELD held=12/12` (lesson:22) | **pending `close/`**; at the integrated-but-no-receipts state `held=5/12` | pending |
| 29 | round-87 close receipts | `RECEIPT_BIND: CLEAN mismatched=0 unchecked=0` (plan after-state) | **pending `close/`** | pending |

The census diff and all control reruns are in `build/K87Review2/`; the four control receipts there are
my runs, not copies of the committed ones.

## 2. Close-receipt audit

**Not yet auditable.** At the time of this writing `.ufo/waves/round-87/close/` does not exist, so no
round-87 receipt can be checked for `exit=` vs a re-run, `tool_sha256=` vs its `cmd=` subject, or a
cited revision that exists. The audit is ready as a command
(`build/K87Review2/check-close.mjs`, which resolves `rev=`, re-hashes the `cmd=` instrument from
`git show rev:<path>`, and re-runs each recorded command with `--work` redirected into this seat's
scratch), and the table row 28/29 will be replaced by its output before this report is final.

Two conditions the runner must satisfy, derived from the runner's own source
(`build/K87ExecClose/run-close.mjs`) and the integrated tool's contract:

1. **`--rev` must be the commit that carries `scripts/receipt-bind.mjs` and the patched
   `scripts/readme-map.mjs`.** The runner hashes each case's instrument **from the worktree**
   (`instrumentBytes`, lines 84–97) while the gate hashes it from `git show <rev>:<path>`. If the
   close run happens before the work commit, every receipt citing `scripts/receipt-bind.mjs` is
   `UNRESOLVED` at that rev (exit 2) and `bind.txt` cannot read CLEAN.
2. **The worktree must be clean at every instrument path at close time**, or the worktree digest and
   the rev digest diverge and the round's own `bind` receipt reads DRIFT.

## 3. After-state: is it one command away?

No, not at the state I measured — it is **two steps away**, and both are the L1's:

* step 1 (done in the worktree, not committed): `scripts/receipt-bind.mjs` integrated, sha `b640ff31…`;
* step 2 (not done): the round's own `close/` receipts do not exist, so arms 4–8, 10, 11 read
  `no-r87-close` and the probe reads `C87_C1: UNMET held=5/12` exit 1 (`probe-integrated-noclose.txt`).

I verified the predicate is reachable once both exist: in a scratch `git clone --shared` of the lane
I wrote ten contract-shaped receipts at the clone's HEAD and ran the frozen probe against four
candidates — integrated bytes `held=12/12` exit 0, the L1 reference `12/12`, and the critic's two
constructions `12/12` (`build/K87Review2/clone-probe-*.txt`). So the after-state is one command away
**from the committed M**, not from the current tree.

The SCORECARD row the L1 will write is **not** re-derivable from the `C87_C1: HELD held=12/12` line
alone: that line carries only the held count. The row also quotes the before-state (0/12 absent,
5/12 with the build candidate, controls 0/0/1/3), the census line, the A/C/C2 terms and the proxy
verdict — each re-derivable from its own command, none from the probe line.

## 4. What the round must still do for its own proof to hold

`node scripts/proxy-check.mjs --strict` reads **DRIFT** today. The exact findings and the exact edits
that clear them:

| finding | fix |
|---|---|
| `A_DRIFT` declared=35 computed=36 | stanza `A=36` |
| `A_WAVE_DRIFT` declared=955 computed=1010+ | stanza `A_wave=<final worktree count at M>` |
| `C_DRIFT` declared=45 computed=46 | stanza `C=46` |
| `C2_DRIFT` + `C2_TOTAL_DRIFT` declared=219 computed=222 | stanza `C2=222`, `C2_total=222` |
| `GATE_PIN_DRIFT pin.readme-map` declared=`fc119ab6…` computed=`263d961c…` | re-pin `pin.readme-map` |
| `PIN_UNPINNED scripts/receipt-bind.mjs` | add `'pin.receipt-bind': 'scripts/receipt-bind.mjs'` to `GATE_PINS` in `scripts/proxy-check.mjs`, add `pin.receipt-bind=<sha>` to the gate-pins block, **and re-pin `pin.proxy-check`** (editing the gate changes its own digest) |

Until the `GATE_PINS` entry exists, `pin.receipt-bind` in the block is `GATE_PIN_KEY_UNKNOWN` (exit 2),
so the pin cannot be added without the tool edit. This is the one place where the round's
"`--strict` reads MATCH" is currently red, and it is an integration step, not a data result.

## 5. Predicate-strength findings (verdict-relevant)

The round's own lesson already takes the claim as **UNMET** on the frozen kill rule, citing
`build/K87Critic/transcript-cand-a-worktree.txt` (`held=12/12`). I reproduced this independently and
found a second construction on the same footing:

* `cand-a-worktree` hashes the **worktree** file instead of `git show <rev>:<path>` — `held=12/12`
  (my run: `build/K87Review2/clone-probe-cand-a-worktree.txt`). The twelve arms never present a receipt
  whose instrument bytes differ between the worktree and the judged revision, so they cannot separate
  revision binding from worktree binding.
* `cand-a2-receiptrev` fetches at the **receipt's self-declared `rev=`** instead of the judged
  `--rev` — `held=12/12` (`clone-probe-cand-a2-receiptrev.txt`). This is the behaviour of the
  integrated instrument itself (its own selftest arm is named `rev-per-receipt-overrides`), and the
  plan's contract sentence says the bytes come from `git show <rev>:<path>` with `<rev>` = `--rev`.
  So the “judged revision” of the goal sentence is advisory in the integrated tool whenever a receipt
  carries `rev=`; the probe's `rev-bad` arm only tests receipts with **no** `rev=`.
* The L1 reference candidate also reaches `held=12/12` on the same fixture
  (`clone-probe-l1reference.txt`); it additionally reads CLEAN with `matched=0` when the only `*.txt`
  entry is a subdirectory or a FIFO (sentinel `R87-S1`), a fail-open the probe cannot see because arm
  4 requires `matched>=8`.

Under the plan's sentence “Any seat-constructed control that reaches 12/12 is scored the same way”,
`cand-a-worktree` (and `cand-a2-receiptrev`) reaching 12/12 fires the kill rule. I agree with the
lesson's UNMET verdict on that reading. If the L1 instead classifies these as candidate instruments
rather than controls, then the claim is HELD but the goal sentence “at a judged revision” is not
demonstrated by the predicate — either way the round must not report both “HELD” and “revision-bound”.

## 6. Residual risk and verification gaps

* The `close/` audit (row 28/29) is the only unverified block; it depends on the L1 emitting the
  receipts and committing M. `check-close.mjs` is ready and its output will be appended here.
* The lesson's historical readings (`spotcheck-adopt --check` read `uncovered=1` at round open;
  `README_MAP files=220` at adoption) cannot be re-derived after the repair; they are history, and the
  current readings (53/0, 222/222/222) are what a re-run shows.
* `A_wave` is non-scoring and moves with every seat artifact; any quoted value must be the one read at
  M, not one read during the wave.
* `external=1` on the round-87 `bind` line is the outside-lane `sources-census.sh` instrument; it is
  contract-documented, not revision-bound, and must not be read as a binding.
* I did not re-run the round-86 receipts' `exit=` values (out of this seat's target); the census only
  checks their subject binding, which I re-derived.
