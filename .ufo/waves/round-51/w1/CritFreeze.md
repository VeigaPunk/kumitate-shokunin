# CritFreeze — round 51, wave 1

## Scope and axes

Attacked: the identity, predicate agreement, and dependency closure of the frozen plan and A51/D51 counters. Review only; no judgment, admission, code integration, counter execution, or edits to frozen files.

Axes: **operability** (C1), **coverage** (C2), with freeze integrity, reproducibility, and truthful provenance as no-harm constraints. The two claim axes are named in `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/plan.md:5-6,21,75`. Cheap independent reads/hashes ran concurrently; no seats or other runtimes were launched.

## Exact freeze identities

All three current file hashes equal their committed-byte hashes at freeze commit **`06ecbf4703fe9515ae51f36a903c58825c250ccc`** (also HEAD when inspected). Scoped Git status emitted no changes for these files.

| Absolute file | SHA-256 |
|---|---|
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/plan.md` | `dc8fbc9a53379f8ab1ead3ac75f4640c52a262f903e8e1e4578640ebf6613c2c` |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs` | `e06be992d3fece8f1dfb61c4acfc6bc3e5297c585fc04c390dea34d73bb1dc89` |
| `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs` | `0c689c51ecbfee9da8d12dad6253f1c583d08d132f76a428e0ba3997b91e9682` |

This establishes observed byte identity with the freeze commit, not proof of when seats first ran.

## Label/name audit

References below use these absolute file aliases:

- **P** = `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/plan.md`
- **A** = `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs`
- **D** = `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs`
- **PX** = `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/proxy-check.mjs`
- **SC** = `/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/sources-check.mjs`

| Item | Counter evidence | Plan evidence | Result |
|---|---|---|---|
| RULE `A51` | A:37; emitted at A:189 | P:50-66 omits `A51`; whole-file search also found none | **Mismatch: absent from plan** |
| RULE `D51` | D:32; emitted at D:123 | P:88 contains rule `D51` | Exact match |
| `ATTEST_HELD` | A:188-190 | P:50,65 | Exact match |
| `DOCTRINE_HELD` | D:122-124 | P:87,96 | Exact match |
| `A1`, `A2`, `A3`, `A4`, `A5` | A:80,116,127,163,179 | P:53,54,57,60,62 | All five names verbatim |
| `D1`, `D2`, `D3`, `D4`, `D5` | D:71,88,102,108,113 | P:89,90,92,93,94 | All five names verbatim |

### F1 — HIGH: dependency-closed freeze cannot be confirmed; it is structurally false

**Evidence.** The frozen files are not a closed implementation of either predicate:

| Arm | Dependencies beyond `round-51/{plan.md,probe/}` | Authority / location |
|---|---|---|
| A1–A4 | `scripts/receipt-attest.mjs`; round-51 receipt files and sidecars; prior receipt-like files selected dynamically from `.ufo/waves` | Extracted scored `<rev>`; A:60-68,73,85-104,120-158 |
| A5 | `SCORECARD.md`, `scripts/proxy-check.mjs`, its `scripts/claims-check.mjs` import, and that module's `scripts/cap-spawn.mjs` import | Executable validators are selected from scored `<rev>`, not independently held at freeze; A:167-173, PX:300, `scripts/claims-check.mjs:88` |
| D1–D3 | `corpus/knowledge/invocation-attestation.md`, its bound receipt paths, `corpus/SOURCES.md` | Extracted `<rev>` / `git show <rev>:<path>`; D:33,57-64,78-85,91-99 |
| D4 | `scripts/sources-check.mjs`, imported `scripts/cap-spawn.mjs`, source registry and direct knowledge entries | Validator from scored `<rev>`; D:105, SC:53,179-188,341-355 |
| D5 | Live `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` and live fleet root | Neither archived nor hash-checked; D:111-113 |

All lane-relative paths in that table resolve beneath `/home/vgpnk/Projects/shokunin/kumitate-shokunin` in the scored archive unless explicitly described as live/external. The known validator/helper/pin files exist in the freeze commit (blob IDs recorded below), but neither counter fixes their identity to that commit when scoring a later `<rev>`.

**Important distinction:** post-freeze target artifacts are necessary measured data, not themselves a defect. A:60-68 and D:50-57 correctly obtain ordinary target files from a Git revision rather than the lane working tree; D:83 also reads a revision-bound blob. What fails the assigned closure invariant is mutable **checking authority** and ambient/live dependencies, not the mere existence of new receipts or an entry.

**Strongest counterexample [INFERENCE; not executed].** Hold the three frozen files and scored `<rev>` constant. Change only the availability or exit behavior of the live census executable named at D:111. D5's Boolean follows that live exit status (D:112), so its reading need not remain constant. There is no hash/revision check for that executable. This contradicts the counter header's committed-bytes-only characterization at D:7-8, even though P:94-96 openly declares the live arm. A later `<rev>` can also replace `scripts/sources-check.mjs`, changing D4's checking semantics without changing D51 at all.

**Additional A5 provenance/ambient evidence.** A:173 supplies `UFO_SRC` but inherits the rest of `process.env`. PX:342-348,409-419 selects the archived default origin pin's `clone` ahead of that environment default; the current committed `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/origin.json:4-5` names revision `31c465f15669f744848bd9f5d56191c5085670f7` at `/fast/scratch/hyaku/kumitate-pin/src`, not A:38's live-origin path. PX:438,1270-1276 additionally depends on live `$KIMI_ROOT` or `~/.kimi-code`. Thus P:64's live-origin description is not guaranteed by setting `UFO_SRC`, and A5 is not archive-only either. Those external locations were not read or modified by this review.

**Impacted axes:** operability/A5 and coverage/D4–D5; reproducibility and provenance. The live-gate tradeoff is explicitly declared in P, but that does not make a closed-freeze assertion true. A passing run alone cannot resolve that contract conflict.

**Smallest safe correction:** L1 must distinguish frozen counter implementation, revision-bound targets, and live harm gates. Pin/archive/hash-check the validator dependency closure and the census implementation; snapshot/version the input roots used for scored predicate arms. Alternatively, move genuinely live checks to separately labelled harm evidence and explicitly re-freeze the predicate contract. Ensure A5 explicitly selects and binds the origin tree actually named. Do not silently amend these frozen files after observing data. This is a proposed correction, not an applied change or a judgment.

### F2 — MEDIUM: A51 rule identifier is missing from its plan predicate

**Counterexample/evidence:** A:37 is `const RULE = 'A51';`, while P:50-66 names the counter and `ATTEST_HELD` but never `A51`. D51 has the expected explicit binding at P:88. All ten check IDs are present; the missing string is specifically the C1 rule label.

**Impacted axis:** operability predicate identity/provenance.

**Smallest safe correction:** through the authorized freeze/amendment procedure, add `(rule \`A51\`)` to the C1 predicate sentence, without renaming any checks.

### F3 — MEDIUM: frozen plan and D51 disagree about D1/D2 acceptance

**Evidence:** P:89-90 requires the provenance trio in the **first three lines**; D:64,67-71 accepts it anywhere in the **first five**. P:90-92 says each clause line carries a valid receipt binding; D:74-87 counts clauses and bindings independently and requires only `clauses.length >= 12 && bound.length >= 12 && d2miss === 0`.

**Static counterexamples [INFERENCE; not executed]:**

1. Two initial lines followed by valid `source:`, `verified-at:`, and `recheck:` on lines 3–5 satisfies D51's D1 expression but not P's first-three-lines requirement.
2. Twelve correctly bound clause lines plus a thirteenth unbound `- ` clause satisfy D51's D2 expression but not P's “each” requirement.

These are counterexamples to the individual arm definitions, not claimed full-counter executions or overall HELD results.

**Impacted axis:** coverage; duplicate normative definitions inside the purported freeze.

**Smallest safe correction:** in an authorized refreeze, use a three-line D1 window and require every clause to have a binding (in addition to at least twelve clauses and matching hashes). The plan/counter pair must express one acceptance rule, not two.

## Commands and observed output

All Bash calls used cwd `/home/vgpnk/Projects/shokunin/kumitate-shokunin`; only read-only Git commands were used. `read`, `glob`, and `grep` supplied the line-numbered source evidence above.

### 1. Initial current-byte hashes

```sh
sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/plan.md /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs
```

Exit 0; output is exactly the three hash/path pairs in the identity table.

### 2. Commit provenance, frozen-file status, and HEAD

```sh
git --no-optional-locks -C /home/vgpnk/Projects/shokunin/kumitate-shokunin log -n 5 --format=fuller -- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/plan.md /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs && git --no-optional-locks -C /home/vgpnk/Projects/shokunin/kumitate-shokunin status --porcelain=v1 -- /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/plan.md /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/doctrine51-probe.mjs && git --no-optional-locks -C /home/vgpnk/Projects/shokunin/kumitate-shokunin rev-parse HEAD
```

Exit 0:

```text
commit 06ecbf4703fe9515ae51f36a903c58825c250ccc
Author:     kumitate-shokunin <kumitate@shokunin.local>
AuthorDate: Fri Oct 23 22:53:14 2026 -0300
Commit:     kumitate-shokunin <kumitate@shokunin.local>
CommitDate: Fri Oct 23 22:54:18 2026 -0300

    round-51: freeze plan, counters A51/D51, w1 spec
06ecbf4703fe9515ae51f36a903c58825c250ccc
```

The scoped status command emitted no lines.

### 3. Committed-byte SHA-256 comparison

```sh
git --no-optional-locks -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 06ecbf4703fe9515ae51f36a903c58825c250ccc:.ufo/waves/round-51/plan.md | sha256sum && git --no-optional-locks -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 06ecbf4703fe9515ae51f36a903c58825c250ccc:.ufo/waves/round-51/probe/attest51-probe.mjs | sha256sum && git --no-optional-locks -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show 06ecbf4703fe9515ae51f36a903c58825c250ccc:.ufo/waves/round-51/probe/doctrine51-probe.mjs | sha256sum
```

Exit 0:

```text
dc8fbc9a53379f8ab1ead3ac75f4640c52a262f903e8e1e4578640ebf6613c2c  -
e06be992d3fece8f1dfb61c4acfc6bc3e5297c585fc04c390dea34d73bb1dc89  -
0c689c51ecbfee9da8d12dad6253f1c583d08d132f76a428e0ba3997b91e9682  -
```

### 4. Existing committed helper/pin identities

```sh
git --no-optional-locks -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree -r 06ecbf4703fe9515ae51f36a903c58825c250ccc -- /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/proxy-check.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/sources-check.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cap-spawn.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/origin.json
```

Exit 0 (these are Git blob IDs, **not SHA-256**):

```text
100644 blob b19ee6d7bd416d3f268f95074102de40a211e871	.ufo/pins/origin.json
100644 blob 2cb145ee7cfa6ee468133c8fa8c26e1cfdbd078a	scripts/cap-spawn.mjs
100755 blob c787f1547d0b40da7fea855a25176dedae6861f3	scripts/claims-check.mjs
100755 blob 61fef2a32b0bbcb1bea821343890f901e75553b3	scripts/proxy-check.mjs
100755 blob 6330c9851cc25bab44d9c5bf72a949f32db5c1dd	scripts/sources-check.mjs
```

### 5. Helper/pin working-copy consistency

```sh
git --no-optional-locks -C /home/vgpnk/Projects/shokunin/kumitate-shokunin status --porcelain=v1 -- /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/proxy-check.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/sources-check.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/claims-check.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/cap-spawn.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/pins/origin.json
```

Exit 0, no output. This supports the line-numbered helper evidence's identity with current freeze-commit bytes; it does not pin their future selection by the counters.

## Disposition

**Observed byte freeze intact; dependency-closure claim fails; A51 plan label missing; D1/D2 meanings disagree.** No actual uncommitted external bytes were inspected, and no counter result is asserted. Frozen files remain untouched. No tool installs or updates. The only created file is this assigned report.
