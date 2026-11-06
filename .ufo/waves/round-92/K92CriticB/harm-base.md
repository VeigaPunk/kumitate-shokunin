# K92CriticB — harm base readings (claim C1 `seat-route`)

Purpose: the readings the L1 compares at M. A gate CLEAN at base and red at M for a reason other
than the new file's own registration is harm.

## Method

* Base tree = frozen lane commit `596f675366ac5822aac5ea1ffc56b1189b17f65c`, extracted two ways:
  `git -C <lane> archive 596f6753… | tar -x -C $S/tree` (assignment's form) **and** a scratch clone
  `git clone --no-hardlinks <lane> $S/clone && git -C $S/clone checkout -q 596f6753…`
  (`git -C $S/clone status --porcelain` empty, `rev-parse HEAD` = `596f6753…`). The clone is the
  citable base: `round-gate` refuses a non-git tree (`NOT_A_GIT_WORKTREE`, exit 2 on `$S/tree`), so
  the archive alone cannot produce a base reading for it. Both copies are read-only mirrors of the
  lane; nothing was written into the lane by this seat.
* M-sim = `cp -a $S/clone $S/clone-m`, then only `cp <candidate> $S/clone-m/scripts/seat-route.mjs`.
  No registry rows were added, so the M-sim isolates what **the file alone** perturbs. Candidate
  bytes scored/measured here: `3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608`
  (32767 bytes; `.ufo/waves/round-92/K92ExecTool/seat-route.mjs`).
* Every command ran with `timeout`; host `load1` was 15-24 during the run (shared host, 12 seats).

## Base vs M-sim (verbatim verdict lines; full receipts in this directory)

| gate | base @596f6753 | M-sim (file only) | receipt |
|---|---|---|---|
| `node scripts/proxy-check.mjs --strict` | **DRIFT**, exit 1 — `A_WAVE_DRIFT declared=1319 computed=1332 delta=+13`, `C2_TOTAL_DRIFT declared=233 computed=234`, `AXES_DRIFT coverage: ## Axes row=10 derived=9` | **DRIFT**, exit 1 — same three **plus** `A_DRIFT declared=36 computed=37 delta=+1` and `PIN_UNPINNED term=scripts/seat-route.mjs` | `base-proxy.txt`, `base-proxy.json`, `m-proxy.txt` |
| `node scripts/readme-map.mjs` | DRIFT, exit 1 — `files=234 rows=233 covered=233 bad=2 first=uncovered:lessons/round-91-verifier-spotcheck.md` | **identical** (DRIFT, exit 1, same line) | `base-readmemap.txt`, `m-readmemap.txt` |
| `node scripts/counter-pins.mjs` | **CLEAN**, exit 0 — `pins=45` | **CLEAN**, exit 0 — `pins=45` | `base-counterpins.txt`, `m-counterpins.txt` |
| `node scripts/sources-check.mjs` | **CLEAN**, exit 0 — `rows=203 … legacy=38` (6 `USED_BY_ASYMMETRY` warns, unchanged) | **CLEAN**, exit 0 — identical | `base-sources.txt`, `m-sources.txt` |
| `node scripts/surface-probe.mjs --checklists` | **FAIL**, exit 1 — `CHECKLIST: 37/46 pass`, 9 reds at `SKILL.md:723,724,725,737,744,745,748,755,756` | **FAIL**, exit 1 — `CHECKLIST: 36/46 pass`: the same 9 reds **plus item 735** (`gate-mutants`, exit 2). Not file-attributable: its output shows `MUTANT wave-census:survivor/M10-unknown-wave-zero timeout … timeout=60000ms` at `load1=25.51`; `gate-mutants` mutates `cite-check` + `wave-census` only (manifest `8486506f…`, same in both runs), never `seat-route.mjs`. Re-run alone at `load1=40.49` → **`GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 …)`**, exit 0 (`m-gatemutants-rerun.txt`). Load flake, **no harm** | `base-surface.txt`, `m-surface.txt`, `m-gatemutants-rerun.txt` |
| `node scripts/round-gate.mjs --round 91` | **CLEAN**, exit 0 — `checks=10 errors=0 warnings=0` | **CLEAN**, exit 0 — identical | `base-roundgate91.txt`, `m-roundgate91.txt` |

`round-gate` needs `--reports-dir /home/vgpnk/Projects/shokunin/.ufo/reports` (the fleet reports
tree; read-only) — without it both readings are `FAIL-CLOSED (REPORTS_DIR_MISSING)` exit 2, which is
a usage artefact, not a finding.

Note: while I worked, the lane **worktree** carried `M SCORECARD.md` (not mine — I never wrote it) and
10 seat dirs as untracked. My readings come from the frozen commit `596f6753…`, never the dirty
worktree, so they are unaffected; the M readings must likewise be taken at the committed M, not on a
worktree with other seats' in-flight edits.

Base proxy term numbers (`--json`, `base-proxy.json`): `A=36 A_wave=1332 C=46 C1=19 C1_total=19
C2=233 C2_total=234`, `operability` = `floor(10×(36+46)/(36+46+3))` = 9.

## What this means for the L1

1. **Three gates are already red at base** (`proxy-check` DRIFT, `readme-map` DRIFT, `surface-probe`
   37/46 FAIL). None of them becomes red *because of* `seat-route.mjs`; a report that presents them
   as M-time regressions would be false. Conversely, M cannot be credited with making them green.
2. **Two new terms are the new file's own registration, not harm** — but both must be closed at M or
   they remain on the M line:
   * `A_DRIFT A 36 → 37`: the declared count lives in the `<!-- kumitate-proxy-v1 … -->` block,
     `SCORECARD.md:294 A=36` (with `A_wave=1319` at `:295`). M must re-declare `A=37` and
     `A_wave=<computed at M>`; the `A_wave` gap (non-scoring) grows by every seat-side `.mjs/.sh/.py`
     receipt too — `proxy-check.mjs:982-984` counts runnable files under `.ufo/`, so the +13 gap is
     a wave artefact, not this claim's.
   * `PIN_UNPINNED scripts/seat-route.mjs`: `proxy-check.mjs:233` — a `scripts/*.mjs` no pin key
     covers. M adds `pin.seat-route=<sha256>` to the lane-owned `kumitate-gate-pins-v1` block
     (`proxy-check.mjs:548-556` shows the shape). Not a kill event, but it is a warn the base line
     does not carry.
3. **`counter-pins` does not cover the new file** (`pins=45` both sides): landing
   `scripts/seat-route.mjs` does not silently join that pin set, so no drift there.
4. **`readme-map` and `sources-check` are indifferent to the file** (identical readings). They will
   move only if other seats land corpus notes — that is the note seats' registration, not C1's.
5. **`round-gate --round 91` is CLEAN at base and CLEAN with the file.** Whatever round-gate checks
   about the previous round is untouched.
6. **Item 735 (`gate-mutants`) is load-flaky and must not be read as harm on its own.** The mutant
   runner gives each mutant a 60 s wall; at `load1≈25` one wave-census mutant timed out, at
   `load1≈40` the same battery read `killed=43 frozen=41/41` CLEAN. If M's surface-probe shows 735 red,
   re-run `node scripts/gate-mutants.mjs` alone before calling it a regression.

## Candidate evidence gathered while building the base line (read-only, labelled by sha)

* `node --check seat-route.mjs` → OK; `node seat-route.mjs --selftest` →
  `SEAT_ROUTE_SELFTEST: PASS held=30/30`.
* `node seat-route.mjs --results .ufo/waves/round-91/w1-results.json --json` → 12 records (one per
  seat), e.g. `K91ExecInst served/False`. `human-r91.txt` (builder's) prints the same 12 seats and
  `SEAT_ROUTE: OK seats=12 served=12 … fallback=4`.
* Kill clause (d) byte test on the shipped bytes: `grep -c "round-92\|oracle92\|probe92"` → **0**.
* **Clause (e) state**: at the time I first read `K92ExecTool/score1.txt` it carried
  `tool_sha256=40eefe4b…` against a file hashing `3b8b6ce0…` (transient, builder still editing). At
  final `score1/score2/check/sha256/READY` all carry `3b8b6ce0…` = the file's hash, and my own
  independent run on those bytes reads `C92_C1: HELD agree=133/133 …` (`cand-current-bytes.txt`).
  M must commit exactly `3b8b6ce0…` or re-score.
