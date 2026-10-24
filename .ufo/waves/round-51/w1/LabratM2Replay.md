# LabratM2Replay — wave-1 seat report (kumitate round 51)

**Seat:** `kumitate-r51.LooseSwan` · **Item:** `LabratM2Replay` (executor, bounded probe)
**Lane:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (read-only except this report and
`build/LabratM2Replay/`) · **Node:** v24.21.0 · **Date:** 2026-10-23 (probe run 23:26–23:36 -03:00)

---

## 1. What I was asked, and what I actually ran

The item asked for the exact lesson-M2 forgery, end-to-end, in scratch: (1) produce a genuine
receipt, (2) copy it, rewrite **only** the `run-at:` prelude, keep the old sidecar, (3) show the
genuine implementation's `verify` rejects it as `RECEIPT: TAMPERED` exit 1 — then the variant
where the forger recomputes the sidecar, showing it then needs the inner digest (nonce reuse),
with `verify --ledger` over a 3-receipt dir reading `REPLAY`.

I ran it myself (no subagents, no spawns). Everything below is executed output.

### Implementations probed

| id | source | sha256 | note |
|---|---|---|---|
| **DELIVERABLE** | `build/ExecInstrument/receipt-attest.mjs` (the seat the item names) | `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` | the shipped candidate |
| INTERIM | `build/ExecSelftestExec/receipt-attest.mjs` | `cdde1e8aaa731b381bda16627114755b0823918409f747ec16a70c7102c5ed04` | appeared 23:18; superseded by the above at 23:27 |
| SCRATCH | `build/LabratM2Replay/scratch-receipt-attest.mjs` (mine, from plan.md §C1) | `89952c55cd29199f5a037b7054efaee88baa948651cc46f543753658c68a20a3` | independent implementation |
| SIBLING | `build/ExecSelftestArms/scratch/receipt-attest.mjs` | — | read-only cross-check |

`build/ExecInstrument/` did **not** exist when I started (checked 23:01, 23:08); it landed at 23:27,
mid-probe. I re-ran the full ladder against it as soon as it appeared — that is the primary result
below. The interim artifact is retained because it is the one my F1 fix was measured against.

### Transcripts (all under `build/LabratM2Replay/`)

- `transcript-ladder-EXECINSTRUMENT.txt` — **the forger ladder against the shipped candidate**
- `transcript-prelude-slack-EXECINSTRUMENT.txt` — the ±60 s prelude-slack measurement
- `transcript-ladder-UNPATCHED.txt` — the ladder against the interim artifact (rungs 2–3 pass)
- `transcript-ladder-F1-patched.txt` — the ladder against the F1-patched interim artifact
- `transcript-ladder-SCRATCH.txt` — the ladder against my scratch build
- `transcript-isolated-scratch.txt` — the ledger-rule matrix, each case in its own directory
- `transcript-probe-scratch.txt` — the full end-to-end probe of the scratch build
- `ladder.sh`, `isolate.sh`, `probe.sh` — the harnesses (re-runnable)

---

## 2. The forger ladder (the item's core, measured)

`ladder.sh <tool> <workdir>`; each rung is a **fresh directory**, so no rung contaminates another.
Rung 1 is the item's exact M2 move; rungs 2–3 are the escalations; rung 4 is the item's "needs the
inner digest (nonce reuse)" step; rung 5 is the kept Q39 ceiling.

### Against the shipped candidate `build/ExecInstrument/receipt-attest.mjs`

```
--- RUNG 0 — genuine receipt (baseline: must be VALID)
    attest-run-1.txt        -> RECEIPT: VALID (exit=0)

--- RUNG 1 — exact lesson-M2 move: rewrite ONLY the prelude, KEEP the old sidecar
    attest-run-2-replayed.txt -> receipt-attest: sidecar mismatch: sidecar b48c32b4…, actual 35310844…
RECEIPT: TAMPERED (exit=1)

--- RUNG 2 — the forger REFRESHES the sidecar over the re-dated bytes (no secret needed)
    attest-run-2-replayed.txt -> receipt-attest: prelude 2030-01-01T00:00:00.000Z is outside the recorded wall window [2026-10-24T02:35:04.388Z, 2026-10-24T02:35:04.391Z]
RECEIPT: TAMPERED (exit=1)
    with --ledger over the dir holding the original:
    attest-run-2-replayed.txt -> receipt-attest: prelude 2030-01-01T00:00:00.000Z is outside the recorded wall window [2026-10-24T02:35:04.388Z, 2026-10-24T02:35:04.391Z]
RECEIPT: TAMPERED (exit=1)

--- RUNG 3 — the M2 PRESENTATION: ONE genuine invocation shown as THREE time-spaced runs
    attest-run-1.txt        -> RECEIPT: VALID (exit=0)
    attest-run-2.txt        -> receipt-attest: prelude 2026-10-24T02:45:04.000Z is outside the recorded wall window […]
RECEIPT: TAMPERED (exit=1)
    attest-run-3.txt        -> receipt-attest: prelude 2026-10-24T02:55:04.000Z is outside the recorded wall window […]
RECEIPT: TAMPERED (exit=1)

--- RUNG 4 — re-dated AND re-bodied (semantic clocks rewritten), OLD nonce, digest+sidecar recomputed
    attest-run-2.txt        -> receipt-attest: nonce 328e2ba383225d396428a84e000b71b3 already bound to a different record in attest-run-1.txt
RECEIPT: REPLAY (exit=1)

--- RUNG 5 — full forge: FRESH nonce + re-dated + recomputed digest + recomputed sidecar
    attest-run-2.txt        -> RECEIPT: VALID (exit=0)
```

(The shipped candidate prints the human detail line before the verdict line; both go to stdout,
so the counter's `lastLine` regex matches. Verified by splitting stdout/stderr.)

**The item's step (3) is confirmed**: RUNG 1 reads `RECEIPT: TAMPERED` exit 1.
**The item's ledger step is confirmed**: RUNG 4 reads `RECEIPT: REPLAY` exit 1 (nonce reuse) over a
3-receipt dir.
**Rungs 2 and 3 are also rejected** by the shipped candidate, via its prelude-window check.

---

## 3. FINDINGS

### F-1 (severity: high — resolved in the shipped candidate, but the contract sentence overstates it)

The contract as written in `plan.md` §C1 has a hole that the **interim** artifact and my scratch
build both fall into. Measured on `build/ExecSelftestExec/receipt-attest.mjs`
(`transcript-ladder-UNPATCHED.txt`):

```
--- RUNG 2 — the forger REFRESHES the sidecar over the re-dated bytes
    attest-run-2-replayed.txt  -> RECEIPT: VALID (exit=0)          <-- forgery accepted
--- RUNG 3 — the M2 PRESENTATION: ONE genuine invocation shown as THREE time-spaced runs
    attest-run-1.txt  -> RECEIPT: VALID (exit=0)
    attest-run-2.txt  -> RECEIPT: VALID (exit=0)                    <-- forgery accepted
    attest-run-3.txt  -> RECEIPT: VALID (exit=0)                    <-- forgery accepted
```

Two-part mechanism:

1. **The inner digest does not bind the prelude.** The contract (`plan.md` lines 31–34) says the
   digest is "sha256 over the JSON line with the `digest` field removed" — the `run-at:` prelude is
   a *display* line outside that JSON. Rewriting it leaves every digest-bound field untouched, so
   the digest still recomputes correctly.
2. **The ledger's same-digest exemption therefore exempts the forgery.** The frozen rule
   (Freeze-repair addendum item 4) reads: *"the `--ledger` arm flags a nonce only when another
   receipt file binds the SAME nonce to a DIFFERENT record digest; the target file itself and
   byte-identical duplicates (same digest) are exempt."* A prelude-rewritten copy has the **same
   inner digest** as its original — so it lands in the exemption — even though its **file bytes
   differ**. The exemption is keyed on the inner digest where the property that matters is
   file-byte distinctness.

**Status: the shipped candidate closes this** with a fifth check — the display prelude must sit
inside the record's own wall window (`build/ExecInstrument/receipt-attest.mjs:379-391`,
`PRELUDE_SLACK_MS`). Rungs 2 and 3 now read `RECEIPT: TAMPERED` exit 1.

**Residual (severity: low, bounded, does not reopen the M2 class).** The slack lets the prelude be
moved by up to ±60 s and still verify (`transcript-prelude-slack-EXECINSTRUMENT.txt`):

```
   -120s -> exit=1  RECEIPT: TAMPERED
    -61s -> exit=1  RECEIPT: TAMPERED
    -60s -> exit=0  RECEIPT: VALID
      59s -> exit=0  RECEIPT: VALID
      60s -> exit=0  RECEIPT: VALID
      61s -> exit=1  RECEIPT: TAMPERED
```

That is a *bounded* re-dating window, not the M2 class: the slack budget is ±60 s per receipt, so
one genuine run can fake at most 120 s of separation, while the M2 class (and the A2 arm) requires
**≥ 300 s** of spacing. The M2 spacing arm cannot be faked within the slack. The slack exists to
tolerate display/rounding lag, which is a defensible engineering choice — but the plan's closure
sentence ("a receipt re-dated by rewriting only its `run-at:` prelude now fails verification") is
true only for re-datings beyond the slack, and should say so.

### F-2 (severity: medium, lane-side — A5 could not pass; **now closed by the L1 concurrently**)

A5 requires `pin.receipt-attest` in the SCORECARD's `kumitate-gate-pins-v1` block **and**
`node scripts/proxy-check.mjs --strict` → `PROXY: MATCH`. But `scripts/proxy-check.mjs:461`
declares the legal keys, and `pin.receipt-attest` is **not** among them:

```js
const GATE_PINS = {
  'pin.anchor-truth': ..., 'pin.sources-check': ..., 'pin.wave-census': ...,
  'pin.gate-mutants': ..., 'pin.omp-census': ..., 'pin.cap-run': ...,
  'pin.bind-oracle': ..., 'pin.cap-spawn': ..., 'pin.counter-rerun': ...,
};   // <-- no 'pin.receipt-attest'
```

Adding the pin therefore **fail-closes proxy-check**, which is exactly what A5 runs:

```
proxy-check: fail-closed — GATE_PIN_KEY_UNKNOWN: line 313: pin.receipt-attest is not a kumitate-gate-pins-v1 key
PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 313: pin.receipt-attest is not a kumitate-gate-pins-v1 key
EXIT=2
```

Control: with the pin removed, proxy-check reaches `PROXY: DRIFT` exit 1 — the pin is what causes
the fail-close. Registering the key in `GATE_PINS` clears it (verified: after registering, the
fail-close is gone and A5 advances to the ordinary proxy comparison). **This is a lane-side
integration step for the L1; I did not edit the lane checkout.**

**Status: the L1 applied this fix concurrently.** At 23:37 the lane working tree shows
`scripts/proxy-check.mjs` modified with exactly the missing line —

```diff
   'pin.counter-rerun': 'scripts/counter-rerun.mjs', // round 48: repeat-run receipt instrument (C2)
+  'pin.receipt-attest': 'scripts/receipt-attest.mjs', // round 51: invocation receipt attestation instrument (C1)
```

— and `scripts/receipt-attest.mjs` is now the ExecInstrument artifact byte-for-byte
(sha256 `44919763ee52…`), with `SCORECARD.md:322` carrying the matching
`pin.receipt-attest=44919763ee52…`. `proxy-check --strict` on that tree no longer fail-closes; it
now reports ordinary term drift (`C: declared=22 computed=23`, `A_DRIFT`, `AXES_DRIFT`) — the
close-commit re-derivation the L1 owns, **not** a property of the instrument. **This finding is
now closed by the L1; I did not make this edit.**

### F-3 (severity: medium — the frozen counter has no arm for the hole in F-1)

The counter `attest51-probe.mjs` (v3r6, 9 arms) scores the shipped candidate **8/9**:

```
ATTEST51: ATTEST_UNMET held=8/9 checks=9 rev=ffadfaab… | A1 PASS | A2 PASS | A2c PASS |
A3 PASS | A3c PASS | A4 PASS | A4c PASS | A3d PASS | A5 MISS (GATE_PIN_KEY_UNKNOWN, see F-2)
```

Every arm that touches the forgery passes, because the arms probe the two halves separately and
never the joint case:

- **A3 / A3c** test the prelude rewrite **with the old sidecar kept** (A3c copies the genuine
  sidecar onto the tampered target, freeze-repair 4) → `TAMPERED`. Correct, but only the half of
  the attack where the forger does *not* refresh the sidecar.
- **A4 / A4c** test nonce reuse via a **different body** (`argv` altered, digest recomputed) —
  i.e. RUNG 4 — which is caught.

Neither arm crafts **prelude edited + sidecar refreshed** — the joint case that RUNG 2/3 exercise.
That gap is exactly how the interim artifact passed 8/9 while RUNG 2 and RUNG 3 read `VALID`.
The shipped candidate closes the hole independently (its prelude-window check), so it scores the
same 8/9 — but the counter would not have *told* anyone it was broken.

### F-4 (severity: low — the frozen ledger exemption is still keyed on the wrong property)

The exemption in the frozen addendum item 4 is keyed on the **inner digest**, while the property
that matters is **file-byte distinctness**. A re-dated copy is byte-different but digest-identical,
so it is wrongly exempted. The shipped candidate compensates with the prelude-window check, but the
ledger rule itself remains weaker than its own stated intent ("byte-identical duplicates … are
exempt" — a re-dated copy is *not* byte-identical).

### F-5 (severity: info)

`build/ExecInstrument/receipt-attest.mjs` did not exist when the item was dispatched; it landed at
23:27 mid-probe. The interim `build/ExecSelftestExec/` artifact is superseded. Integration should
take the `build/ExecInstrument/` bytes (sha256 `44919763ee52…`), and the A5 pin must be the sha256
of that file as copied into `scripts/` — the ExecInstrument report flags the same thing.

---

## 4. Candidate fixes — measured, not proposed

I patched the **interim** artifact in scratch only (never the lane checkout) and re-ran the ladder
plus the frozen counter. Two candidates, both in `build/LabratM2Replay/`.

### F1 — bind the prelude to the digest-bound clock (`patched-F1-prelude-coherence.mjs`)

One check: the `run-at:` prelude must equal the digest-bound `wall_start`.

```js
if (parsed.prelude !== obj.wall_start) verdict('TAMPERED', 1, 'prelude-disagrees-with-wall-start');
```

| rung | interim | F1 | shipped candidate |
|---|---|---|---|
| 0 genuine | VALID | VALID | VALID |
| 1 prelude edit, stale sidecar | TAMPERED | **TAMPERED** | TAMPERED |
| 2 prelude edit, refreshed sidecar | **VALID** | **TAMPERED** | TAMPERED |
| 3 M2 presentation | **VALID ×3** | **VALID + TAMPERED + TAMPERED** | VALID + TAMPERED + TAMPERED |
| 4 re-dated, re-bodied, old nonce | REPLAY | **REPLAY** | REPLAY |
| 5 full forge, fresh nonce | VALID | VALID (Q39 ceiling kept) | VALID (Q39 ceiling kept) |

Frozen counter with F1: **8/9** — identical to unpatched. F1 closes rungs 2–3 without regressing
any counter arm, without touching the Q39 ceiling, and without touching the ledger semantics.

**The shipped candidate already implements the same defence, in a stronger form** (prelude inside
the wall window ± 60 s, rather than exactly equal). F1 is therefore *not* needed for the shipped
candidate; it is retained because it is the minimal patch that fixes the interim artifact and the
scratch build, and because its exact-equality form has **no slack** — it closes the residual
±60 s window that the shipped candidate leaves open (F-1 residual).

### F2 — count a nonce reuse on byte-distinctness (`patched-F2-ledger-intact.mjs`)

Flag reuse when the other receipt binds the same nonce to a different digest **or** to the same
digest but different file bytes. This measures the M2 property directly at the ledger layer.

**Rejected**: it breaks A4. The A3 doctored control (`attest-run-2-replayed.txt`) is byte-distinct
from run-2, so the genuine `attest-run-2.txt` then reads `REPLAY` against its own control:

```
--- CASE 3 — the counter's A4 arm: genuine run-2 + its stale-sidecar twin in one dir
    attest-run-2.txt  -> RECEIPT: REPLAY reason=nonce-reuse:attest-run-2-replayed.txt (exit=1)
```

F1 is the correct minimal fix: it removes the ambiguity rather than moving it.

---

## 5. Counter readings

- **Base** `c90b9de9` (current 9-check counter):
  `ATTEST51: ATTEST_UNMET held=0/9 checks=9 rev=c90b9de9…` — A1 MISS `scripts/receipt-attest.mjs absent`.
- **Shipped candidate** on a faithful lane-HEAD tree (`git archive HEAD`), receipts generated by
  the instrument's own `run` and spaced ≥ 300 s:
  `ATTEST51: ATTEST_UNMET held=8/9 checks=9` — A1/A2/A2c/A3/A3c/A4/A4c/A3d PASS, A5 MISS
  (`GATE_PIN_KEY_UNKNOWN`, F-2).
- **Interim artifact**, same tree: `held=8/9` — identical, **but with rungs 2 and 3 reading VALID**
  (F-1). Same score, different security property: the counter does not discriminate between them.
- **F1-patched interim artifact**: `held=8/9`, rungs 2–3 closed.

The counter grew during the wave (5 → 7 → 8 → 9 arms; freeze-repair commits `1fd8aceb`,
`3ed875d`, `8c07e88`, `8fd3cde`, `4b8da21`, `cbca45c`). I re-read the probe before each run and
measured against the version current at that moment.

---

## 6. Cross-checks

- **Sibling implementation** (`build/ExecSelftestArms/scratch/receipt-attest.mjs`, read-only): its
  ledger has **no** same-digest exemption, so it flags RUNG 1 as `REPLAY` and RUNG 3's copies as
  `REPLAY` — but it also fails the counter's A4 arm
  (`A4 MISS attest-run-2.txt:ledger exit=1 RECEIPT: REPLAY`), because the genuine receipt is
  poisoned by its own A3 control. **Confirms the exemption was necessary; confirms it must not be
  keyed on the inner digest alone.**
- **`sha256sum -c` acceptance** of the sidecar format: `r1.txt: OK`, exit 0.
- **Non-existent nested `--out` dir**: the shipped candidate creates it (`RECEIPT: RECORDED
  …/deep/nested/r2.txt`, exit 0); my scratch build needed `mkdirSync` added.
- **Verdict-line plumbing** (the counter matches on the *last* line): the shipped candidate writes
  its detail line *and* the verdict line to stdout, so `lastLine` sees `RECEIPT: TAMPERED` /
  `RECEIPT: REPLAY` / `RECEIPT: VALID`. Verified by splitting stdout and stderr.
- **Ledger-rule matrix** (`transcript-isolated-scratch.txt`, each case in its own directory)
  separates three readings — `literal`, `intact`, `l1frozen` (frozen) — and shows the frozen
  `l1frozen` rule is the only one that both keeps A4 passable **and** leaves the rungs 2–3 hole
  open.

---

## 7. Findings for the L1 to adjudicate

| # | severity | finding | proposed minimal fix |
|---|---|---|---|
| **F-1** | high → **resolved in the shipped candidate** | A prelude-only rewrite **with a refreshed sidecar** reads `RECEIPT: VALID`; the M2 presentation (one invocation shown as three time-spaced runs) verifies clean. The interim artifact and the contract-as-written both fall into this. | The shipped candidate's prelude-window check closes it (rungs 2–3 now `TAMPERED`). **Residual:** the ±60 s slack lets a bounded re-dating verify — cannot forge the M2-class ≥ 300 s spacing (120 s < 300 s), so the class stays closed. If the L1 wants the closure sentence to be literal, tighten the slack to 0 or adopt the exact-equality form (`patched-F1-prelude-coherence.mjs`). |
| **F-2** | medium (lane-side) — **now closed by the L1** | `pin.receipt-attest` was not a declared `GATE_PINS` key (`scripts/proxy-check.mjs:461`), so adding the SCORECARD pin **fail-closed** proxy-check (exit 2) and A5 could not pass. | Register `'pin.receipt-attest': 'scripts/receipt-attest.mjs'` in `GATE_PINS`. **The L1 applied exactly this line concurrently** (lane tree, 23:37); `proxy-check --strict` no longer fail-closes and now shows only ordinary close-commit term drift. |
| **F-3** | medium | The counter has no arm for "prelude edited **and** sidecar refreshed" — the gap between A3c (prelude edited, sidecar stale) and A4c (body edited). The interim artifact passed 8/9 with rungs 2–3 reading `VALID`. | Add a challenge arm: re-date the prelude **and** refresh the sidecar; require non-VALID. The shipped candidate passes such an arm. |
| **F-4** | low | The frozen ledger exemption is keyed on the **inner digest** where the property is **file-byte distinctness** — a re-dated copy is byte-different but digest-identical, so it is wrongly exempted. | Re-key the exemption on file-byte distinctness, or rely on the prelude-window check (as the shipped candidate does). Note the naive re-key (my F2) breaks A4 — the genuine receipt is poisoned by its own A3 control. |
| **F-5** | info | `build/ExecInstrument/` landed at 23:27, mid-probe; `build/ExecSelftestExec/` is superseded. | Integrate the `build/ExecInstrument/` bytes (sha256 `44919763ee52…`); the A5 pin must be the sha256 of that file as copied into `scripts/`. |

---

## 8. Scope, honesty, and limits

- I ran every check myself, in scratch (`mktemp -d` trees under `/tmp/lm2-opjoxh`), with no
  subagents and no spawns.
- I edited **nothing** in the lane checkout: no `scripts/`, no `corpus/`, no counters, no
  `MANIFEST.json`, no `.ufo/state`. My writes are confined to `build/LabratM2Replay/` and this
  report. The two patched candidates are **scratch copies**, not lane edits.
- **Not run by me** (parent/L1 owns the post-integration gate): the full close-commit battery
  (H1 `surface-probe --checklists` 22/22, H2 `cap-run` 12/12, `bind-oracle` 7/7,
  `counter-rerun --selftest`, `round-gate --selftest` 61/61, H3 `proxy-check --strict` MATCH at the
  close commit, H4 sources census, H5 r50 counters). My A5 readings come from scratch trees and
  are **not** the close-commit proxy reading.
- Every number above is copied from executed output; no check is asserted that I did not run.
- **No fabrication.** The one thing I could not drive to PASS is A5, and I have shown exactly why
  (F-2) rather than papering over it.

**No tooling was installed or updated** this wave — everything needed (`node` v24.21.0,
`sha256sum`, `git`) was already present, so the operator tooling directive raised no action.

---

## 9. Reproduction

```bash
B=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/LabratM2Replay
E=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ExecInstrument/receipt-attest.mjs
I=/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/build/ExecSelftestExec/receipt-attest.mjs

bash $B/ladder.sh "$E" /tmp/ladder-ei        # RUNG 0..5 against the shipped candidate
bash $B/ladder.sh "$I" /tmp/ladder-interim   # the hole (rungs 2-3 read VALID)
bash $B/isolate.sh "$I" /tmp/iso             # ledger-rule matrix, isolated cases
bash $B/probe.sh  $B/scratch-receipt-attest.mjs /tmp/probe-scratch
```

Report: `.ufo/waves/round-51/w1/LabratM2Replay.md`
