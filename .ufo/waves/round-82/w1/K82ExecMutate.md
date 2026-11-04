# K82ExecMutate — mutation battery over `scripts/ready-handoff.mjs` v2

Seat: executor (mutation battery). Round 82, wave 1. Lane: kumitate.
Target: `scripts/ready-handoff.mjs` at scaffolding commit `63b12695`.
Judge: frozen counter `.ufo/waves/round-82/probe/probe82-c1.mjs` (`--set c1`), unmodified.
Environment: node v24.21.0 (`node --version`). No tool installs were needed or made.

## 0. Baseline (pristine copy)

Scratch lane built exactly as specified:

```
S=/fast/scratch/hyaku/kumitate-r82/K82ExecMutate
mkdir -p "$S" && git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin archive 63b12695 | tar -x -C "$S" --one-top-level=lane
```

Pristine sha256 of the target, proving the extracted copy equals the committed blob:

```
$ git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin cat-file -p 63b12695:scripts/ready-handoff.mjs | sha256sum
7961c9c9d107d87ea7a20d9eeb51798772f1fc154d25a337eca89fe595109d2d  -
$ sha256sum "$S/lane/scripts/ready-handoff.mjs"
7961c9c9d107d87ea7a20d9eeb51798772f1fc154d25a337eca89fe595109d2d  /fast/scratch/hyaku/kumitate-r82/K82ExecMutate/lane/scripts/ready-handoff.mjs
```

Baseline counter run:

```
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-82/probe/probe82-c1.mjs --set c1 --lane "$S/lane" --work "$S/work"
...
C82_C1 arm round-handoff-ready FAIL exit=2 READY_HANDOFF: READY wave=w1 MISS out=READY_HANDOFF: FAIL-CLOSED READY_ABSENT (no ready file at /fast/scratch/hyaku/kumitate-r82/K82ExecMutate/lane/.ufo/waves/round-82/w1.ready)
...
C82_C1: UNMET held=21/22
exit=1
```

**Excluded arm.** `round-handoff-ready` cannot pass on a lane copy: the `63b12695` archive predates the wave step, so it carries no `.ufo/waves/round-82/w1.ready` (and the arm's `--policy` path `$S/scripts/hyaku/ufo-wave-policy.json` is the fleet repo's policy, outside the lane archive). It answers `FAIL-CLOSED READY_ABSENT`, as the seat spec predicted. **Scored set = the other 21 arms**; the counter's `held=N/22` therefore equals `(N)/21` scored passes (the excluded arm is never in `held`). Pristine score: **21/21**.

## 1. Method

Per mutant: one surgical edit to `$S/lane/scripts/ready-handoff.mjs` (single rule, nothing else), then

```
node .ufo/waves/round-82/probe/probe82-c1.mjs --set c1 --lane "$S/lane" --work "$S/work"
node "$S/lane/scripts/ready-handoff.mjs" --selftest        # internal case names for the report
```

then restore and verify:

```
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 63b12695:scripts/ready-handoff.mjs > "$S/lane/scripts/ready-handoff.mjs"
sha256sum "$S/lane/scripts/ready-handoff.mjs"   # 7961c9c9…109d2d after every one of the 12 rounds
```

The pristine hash was printed and matched after every restore (12/12). The lane repo itself was never touched; all mutation happened inside `$S/lane`.

## 2. Matrix

| Mutant | Defect injected (pristine lines) | Result | Failing counter arms | Scored pass |
|---|---|---|---|---|
| m1 | delete `WAVE_BINDING` add (:186-187) | **KILLED** | `wave-binding-stem`, `selftest` | 19/21 |
| m2 | delete `DISPATCH_WAVE` (:188-190) | **KILLED** | `dispatch-wave-mismatch`, `selftest` | 19/21 |
| m3 | delete `REPORT_DEST_DUPLICATE` add (:232-233) | **KILLED** | `report-dest-duplicate`, `selftest` | 19/21 |
| m4 | delete `L1_SEAT_COLLISION` (:216-218) | **KILLED** | `l1-seat-collision`, `selftest` | 19/21 |
| m5 | delete `L1_UNRESOLVED` (:191-193) | **KILLED** | `l1-unresolved`, `selftest` | 19/21 |
| m6 | `readJson` always uses the read token (:87) | **KILLED** | `agents-malformed`, `policy-malformed`, `selftest` | 18/21 |
| m7 | hardcode band `8:16`, ignore policy (:156-157) | **KILLED** | `policy-band-read`, `selftest` | 19/21 |
| m8 | hardcode 12-role v1 set, ignore policy (:163) | **KILLED** | `policy-roles-narrow`, `labrat-refused`, `selftest` | 18/21 |
| m9 | drop policy structural validation, accept `{}` (:158-162) | **KILLED** | `selftest` | 20/21 |
| m10 | drop dispatch lstat `isFile()` (:136) | **KILLED** | `dispatch-symlink-refused` (token flips to `PATH_UNSAFE`), `selftest` | 19/21 |
| m11 | drop dispatch realpath containment (:137-144) | **SURVIVED** | none | 21/21 |
| m12 | drop `REPORT_TRAILER` rule (:243-245) | **KILLED** | `selftest` | 20/21 |

Counter score lines: pristine `held=21/22`; m1-m5,m7,m10 `held=19/22`; m6,m8 `held=18/22`; m9,m12 `held=20/22`; m11 `held=21/22` (all with `round-handoff-ready` excluded, per §0).

m6 split: **not needed** — the single edit (throwing `token` instead of `badToken` in `readJson`, :87) kills both token arms in one run: `agents-malformed` answered `FAIL-CLOSED AGENTS_ABSENT` and `policy-malformed` answered `FAIL-CLOSED POLICY_ABSENT` (needles MISS), plus the internal `agents-malformed` case.

## 3. Per-mutant evidence (observed output, first line quoted)

- **m1**: `wave-binding-stem` → `exit=0` `READY_HANDOFF: READY wave=w1 seats=14 …` (needle `WAVE_BINDING` MISS); selftest `48/49 pass`, `FAIL wave-binding-stem`.
- **m2**: `dispatch-wave-mismatch` → `exit=0` `READY`; selftest `48/49 pass`, `FAIL dispatch-wave-mismatch`. `dispatch-wave-agree` still passes (as expected: it asserts acceptance).
- **m3**: `report-dest-duplicate` → `exit=0` `READY`; selftest `48/49 pass`, `FAIL report-dest-duplicate`. (Mutation kept destination tracking: `if (!destinations.has(dest)) destinations.set(...)`.)
- **m4**: `l1-seat-collision` → `exit=0` `READY`; selftest `48/49 pass`, `FAIL l1-seat-collision`.
- **m5**: `l1-unresolved` → `exit=0` `READY … agents=1`; selftest `48/49 pass`, `FAIL l1-unresolved`.
- **m6**: `agents-malformed` → `exit=2 FAIL-CLOSED AGENTS_ABSENT (agents: not JSON: …/agents-bad.json)`; `policy-malformed` → `exit=2 FAIL-CLOSED POLICY_ABSENT (policy: not JSON: …)`; selftest `48/49 pass`, `FAIL agents-malformed: {"verdict":"FAIL-CLOSED","token":"AGENTS_ABSENT",…}`.
- **m7**: `policy-band-read` (policy `20:30`) → `exit=0 READY … seats=14` (needle `BAND` MISS); selftest `48/49 pass`, `FAIL policy-band-narrow`.
- **m8**: `policy-roles-narrow` → `exit=0 READY`; `labrat-refused` → `exit=0 READY … roles=…,labrat=1 attack=6/14` (needle `ROLE_UNKNOWN` MISS); selftest `47/49 pass`, `FAIL policy-roles-narrow`, `FAIL labrat-refused`. v1 vocabulary copied from `63b12695^:scripts/ready-handoff.mjs:34-35`: `scout, reviewer, critic, connector, sentinel, executor, mutation-tester, revenger, simplifier, scribe, labrat, distiller`.
- **m9**: every counter arm except the excluded one still holds (`held=20/22`); the defect is reachable only through the tool's own selftest: `FAIL policy-malformed: {"verdict":"DRIFT","findings":["ROLE_UNKNOWN"×10,"ATTACK_SHARE"],…}` where `FAIL-CLOSED POLICY_MALFORMED` was required. Cause: the counter's `policy-malformed` arm feeds `agents-bad.json` (`{not json`), which `readJson` rejects **before** the structural check; the structural check is exercised only by the selftest case that writes valid JSON `{"sighting":{}}`.
- **m10**: `dispatch-symlink-refused` → `exit=2 FAIL-CLOSED PATH_UNSAFE (dispatch realpath escapes …)` — exit code right, needle `DISPATCH_ABSENT` MISS; selftest `48/49 pass`, `FAIL dispatch-symlink-refused: {…"token":"PATH_UNSAFE"…}`. Proves the realpath arm works when it becomes reachable.
- **m11**: all 21 scored arms hold, `held=21/22` (identical to pristine), selftest `49/49 pass`, `VERDICT: PASS`.
- **m12**: every counter arm except the excluded one holds (`held=20/22`); selftest `48/49 pass`, `FAIL report-trailer: {"verdict":"READY","findings":[],…}`. No counter arm asserts `REPORT_TRAILER`; only the tool's selftest does.

## 4. Survivor: m11 (dispatch realpath containment, :137-144)

**Why it survives.** The realpath containment check is reachable only for a path that the lstat guard at :136 has already accepted as a regular file. A symlink is refused there first (`DISPATCH_ABSENT`), so the frozen `dispatch-symlink-refused` fixture never reaches realpath — and the internal `dispatch-symlink-refused` selftest case likewise asserts the lstat token. Reaching a realpath escape with a *regular file* requires the file's resolved path to leave `waveDir` while its own directory entry stays inside (bind-mount / symlinked-ancestor ancestry); none of the 21 fixtures construct that topology. Deleting the check is therefore behaviourally inert on the frozen predicate: same `held=21/22`, selftest 49/49 PASS.

This matches plan Amendment 1 §A1.2 exactly: *"The realpath arm stays as defence in depth and stays unreachable behind the lstat guard — disclosed, not claimed."* The m10/m11 pair proves both directions: m10 makes the realpath arm reachable and it answers `PATH_UNSAFE`; m11 deletes it and nothing observable changes. It is a disclosed non-claim (defence in depth), not an undetected regression in a claimed predicate.

## 5. Measured coverage observations (data, not judgement on the claim)

1. **Selftest is load-bearing for two rules.** Without the `selftest` arm, m9 and m12 would survive entirely; every other killed mutant is also caught by at least one dedicated counter arm (m1-m5, m7, m8, m10 by one; m6 by two). So the counter's dedicated arms cover 9/12 injected defects; the tool's own suite covers the remaining 2 (policy structural validation, `REPORT_TRAILER`).
2. **The counter's `policy-malformed` arm cannot exercise the structural check**: its fixture is invalid JSON, which `readJson` (correctly) rejects first. The structural `{}`-acceptance defect (m9) is invisible to that arm; only the tool's selftest `policy-malformed` case (valid JSON, missing keys) catches it.
3. **`REPORT_TRAILER` has no counter arm** (m12): it is asserted only by the tool's own suite.
4. **`PATH_UNSAFE` has no counter arm** (m11/m10): the only reachable fail-closed token for the dispatch realpath guard appears in no frozen needle; the lstat token `DISPATCH_ABSENT` masks it in the symlink fixture.
5. All other v2 judgments (a)-(f) in the plan's C1 claim are covered by at least one dedicated counter arm each, and each of m1-m8/m10 was killed on its first scoring run with no ambiguity in the needle match.

## 6. Reproduction

```
S=/fast/scratch/hyaku/kumitate-r82/K82ExecMutate
mkdir -p "$S" && git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin archive 63b12695 | tar -x -C "$S" --one-top-level=lane
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-82/probe/probe82-c1.mjs --set c1 --lane "$S/lane" --work "$S/work"
# apply one edit to "$S/lane/scripts/ready-handoff.mjs", rerun the probe, then:
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 63b12695:scripts/ready-handoff.mjs > "$S/lane/scripts/ready-handoff.mjs"
sha256sum "$S/lane/scripts/ready-handoff.mjs"
```

## 7. Files, limits, risks

- Lane file written: this report only (`.ufo/waves/round-82/w1/K82ExecMutate.md`). No other lane path was created or modified; no commits; no mutating git/jj; the frozen counter, receipts, `.ufo/state`, fleet repo and sibling lanes untouched.
- Scratch `/fast/scratch/hyaku/kumitate-r82/K82ExecMutate/` (lane copy, v1 dump, probe work dirs) removed at exit.
- Risk carried by measurement: m11's survival is inherent to the frozen fixture topology and is disclosed in A1.2; it is not evidence of a missing claimed behaviour. m9/m12 survive the counter's dedicated arms by construction (no arm exists); they are killed only by the tool's own suite, which is itself one of the 22 frozen arms.
