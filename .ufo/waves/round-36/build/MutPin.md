MUT pin kills=4/4 survivors=none

# MutPin — PIN v1 mutation probe (kumitate round-36 build wave)

Mutation-tested PIN v1 (`kumitate-origin-pin-v1`) in scratch copies of the claims gate and
against the landed gate. Four behavior-bearing defects, each applied alone to fixed pristine
bytes; detector = the gate's own `--selftest` AND a black-box contract detector
(`pin-detect.mjs`, 10 cases). A mutant is killed only when a mutation-free baseline passes.

## Gates under test (all fixed bytes, under /fast/scratch/kumitate-r36/w/MutPin)

| copy | file | sha256 (pristine) | role |
|---|---|---|---|
| A | `lane/scripts/claims-check.mjs` | `b3eaba06cd30ce2ef99b1b5a7bb21cd50d38a8c9e89ad489cc99b4c178a0d4ae` | my contract-faithful PIN v1 implementation (lane claims-check was still base `e9a21b44…` with no `--pin` at probe time) |
| B | `proxy-gate/scripts/proxy-check.mjs` | `3f1b7c7bfa74d9d22e5429a18660f67e68bc894aeb3b5b744a6443a8becdece8` | the **landed** gate (identical to lane `scripts/proxy-check.mjs`) |
| C | `claims-exec-snapshot/claims-check.mjs` | `910c94cbfeacd706cb7c54bdc608f2edd3383117131298b8243a0ef2c32038c8` | 02:31:16 snapshot of `KumitateR36.ExecClaimsPin`'s in-flight implementation (uncommitted; lane claims gate still unlanded) |

## Mutants (each one smallest behavior-bearing edit in `resolveOrigin`/`applyPin`)

| id | defect | exact edit |
|---|---|---|
| M1-prefix7 | pin revision compared only over the first 7 hex | `if (head !== loaded.pin.revision)` → `if (head.slice(0,7) !== loaded.pin.revision.slice(0,7))` |
| M2-fallback | absent pin clone falls back to the derived operator checkout | `const src = opts.src ?? loaded.pin.clone;` → `… ?? (statKind(loaded.pin.clone)==='dir' ? loaded.pin.clone : resolveSrcDefault());` |
| M3-soft-git | git-unverifiable tree treated as a pass | the `head === null` fail-closed block → `if (head === null) return { ok: true, src, pin: { ...loaded.pin, srcRev: null } };` |
| M4-print-only | `src-rev` printed but never compared | `if (head !== loaded.pin.revision)` → `if (head !== head)` |

## Verdict matrix (killed = at least one detector fails; baselines all green)

| mutant | A selftest | A detector | B selftest | B detector | C selftest | C detector | killed by |
|---|---|---|---|---|---|---|---|
| M1-prefix7 | **FAIL** 48/49 | FAIL P2 | **PASS 116/116** | FAIL P2 | **PASS 46/46** | FAIL P2 | P2 |
| M2-fallback | **FAIL** 48/49 | FAIL P3 | **FAIL** 114/116 | FAIL P3 | **PASS 46/46** | FAIL P3 | P3 |
| M3-soft-git | **FAIL** 47/49 | FAIL P4,P5 | **FAIL** 113/116 | FAIL P4,P5 | **FAIL** 45/46 | FAIL P4,P5 | P4+P5 |
| M4-print-only | **FAIL** 47/49 | FAIL P2,P6 | **FAIL** 113/116 | FAIL P2,P6 | **FAIL** 45/46 | FAIL P2,P6 | P2+P6 |

**kills=4/4 on A, 4/4 on B, 4/4 on C; survivors=none.** Mutant shas:
A `d5352bfa…`/`282101d4…`/`081f0394…`/`f1122f02…`; B `e92628a7…`/`2c9b367a…`/`c5a298d1…`/`b9d6c0cb…`;
C `8f6ee193…`/`4f863aa5…`/`6abe1086…`/`146ca8ff…` (full in `mutation-results*.json`).

## The case that kills each mutant (observed output)

- **M1 → P2** (pin differs only after hex 7): fixture repo HEAD `r`; pin `revision = r[0:7] + flip(r[7]) + r[8:]`.
  Pristine: `exit=2  PROXY: FAIL-CLOSED (SRC_REV_MISMATCH) … HEAD f7e11d58dc01 != pin f7e11d50dc01`.
  Mutant: scored verdict naming `src-rev=f7e11d58dc01`, exit 0/1 — the forged pin scores.
- **M2 → P3** (clone absent, operator-checkout candidate present at the pin revision): pristine
  `exit=2 SRC_NOT_A_DIR` naming the absent clone; mutant scores the candidate tree, exit 0.
- **M3 → P4/P5**: P4 plain dir, P5 `PATH` without git. Pristine `exit=2 SRC_REV_UNVERIFIABLE` both;
  mutant prints a scored verdict (or null `src-rev`) and exits 0/1.
- **M4 → P2 and P6**: P6 is an explicit `--src` at another revision under an active pin — pristine
  `exit=2 SRC_REV_MISMATCH`, mutant scores the wrong tree while printing the pin's `src-rev`.

## Coverage findings (the actionable result for C1)

1. **No in-repo selftest kills M1.** B (116/116) and C (46/46) stay green under a prefix-7 compare;
   only the external detector's same-prefix pin kills it. C's nearest case, "a short revision is
   refused (no prefix match)", is a `PIN_MALFORMED` shape check, not a revision comparison.
   Recommendation for L1: add the P2 fixture to the claims/proxy `--selftest` (a pin built from the
   real HEAD with one hex flipped at index 7).
2. **C's selftest does not kill M2** (no clone-absent case at all) — it survives 46/46 while silently
   scoring the fallback tree. B's selftest does kill it (case "a pin whose clone is absent →
   SRC_NOT_A_DIR naming the resolved path"), so this is an implementation divergence, not a contract gap.
3. **M2 is not hypothetical.** Under B's selftest the mutant's fallback resolved to
   `/home/vgpnk/Projects/ufo-fsd-alpha` with `HEAD 31c465f15669` — *equal to the pin revision*, so the
   defect produces a MATCH on the operator tree. That run was read-only in the operator tree
   (stat + `git rev-parse` + reads); no write, no chmod.
4. **Token gap, low severity:** an explicit `--pin` naming an absent file is `PIN_NOT_A_FILE` in A
   (and in the frozen FIDELITY arm's token list) but `PIN_MALFORMED` in B and C. Both exit 2, so the
   gate is fail-closed either way; the frozen contract does not name this token. The detector accepts
   either (P10).
5. PIN v1 semantics themselves are correct in all three copies: clone precedence, exact-40-hex
   compare, `SRC_NOT_A_DIR` for a missing clone, fail-closed on unverifiable, `src-rev=<12>` in
   every scored verdict when pinned, and no `src-rev` segment with no pin.

## Baseline and negative control (proves the detector is not vacuous)

- Base-commit gate without PIN (`evidence/base-claims-check.mjs`): detector **1/10** — only P7 (the
  legacy no-pin case) holds; P1-P6/P8-P10 fail (exit 64 for `--pin`).
- Pristine A: detector 10/10, selftest 49/49. B: 10/10, 116/116. C: 10/10, 46/46.

## Restoration

Each mutant was applied to the copy, then the pristine byte buffer was written back. After every
restore: sha256 equals the pristine sha, selftest PASS, detector 10/10 (logged as `RESTORE-*` in the
JSON). Current bytes: A `b3eaba06…`, B `3f1b7c7b…`, C `910c94cb…` — all equal their baselines.
Lane files were never touched: lane `scripts/claims-check.mjs` `e9a21b44…` (unchanged, PIN unlanded)
and `scripts/proxy-check.mjs` `3f1b7c7b…` (unchanged). No git/jj mutation, no index refresh, no
writes outside `/fast/scratch/kumitate-r36/w/MutPin/`; `/fast/scratch/kumitate-r36/src` was only ever
passed as `--src` to a read-only gate and never chmod'ed or written.

## Commands run

```
node pin-detect.mjs --gate lane/scripts/claims-check.mjs --json
node pin-detect.mjs --gate proxy-gate/scripts/proxy-check.mjs --verdict-prefix 'PROXY:' --self lane --kimi-root empty-kimi/kimi --json
node pin-detect.mjs --gate claims-exec-snapshot/claims-check.mjs --json
node pin-detect.mjs --gate evidence/base-claims-check.mjs --json          # negative control, 1/10
node mutate.mjs                                                          # copy A, 4/4
node mutate-proxy.mjs                                                    # copy B, 4/4, selftest 116/116
node mutate-gate.mjs --gate claims-exec-snapshot/claims-check.mjs --self lane --out evidence/mutation-claims-exec-snapshot.json   # copy C, 4/4
```

## Artifacts (under /fast/scratch/kumitate-r36/w/MutPin/)

`pin-detect.mjs` (portable: `--gate FILE [--verdict-prefix] [--self] [--kimi-root] [--json]`),
`mutate.mjs`, `mutate-proxy.mjs`, `mutate-gate.mjs`, `mutation-results.json`,
`mutation-results-proxy.json`, `evidence/mutation-claims-exec-snapshot.json`,
`evidence/detector-{claims-reference,proxy-landed,claims-exec-snapshot,negative-control}.json`.

## Addendum — re-probe of the revised claims gate (v2, same wave)

`KumitateR36.ExecClaimsPin` added the two missing cases and asked for a re-probe. Snapshot
`claims-exec-v2/claims-check.mjs`, sha256 `6540f4de109eaeca0c33af4edb15ca1d91e112fd51fc756db63bf82825915693`,
mtime 2026-10-21 02:36:17 (the executor's quoted `4b355c17…0088` is its `.patch` file, not the gate).

- Pristine: `CLAIMS_SELFTEST: 48/48 pass`, `PIN_DETECT: 10/10 cases hold`.
- M1-prefix7 (mutant `b5f5bb34…`): **killed** — selftest 47/48, the only failing case is the new
  `PIN same-prefix mismatch: revision differing only at hex[7] → SRC_REV_MISMATCH (no prefix compare)`;
  detector P2. Confirms gap (1) is closed.
- M2-fallback (`c932d81a…`): **killed** — selftest 47/48, the only failing case is the new
  `PIN clone absent: SRC_NOT_A_DIR even when the derived default has a candidate (no fallback)`;
  detector P3. Confirms gap (2) is closed.
- M3-soft-git (`109e2535…`): **killed** — selftest 47/48 (`PIN non-repo … SRC_REV_UNVERIFIABLE`),
  detector P4+P5. M4-print-only (`3c2bf94a…`): **killed** — selftest 46/48 (mismatch + same-prefix),
  detector P2+P6.
- `MUTATION_TOTAL kills=4/4 survivors=[]`; all four restores sha-equal to `6540f4de…` with selftest
  and detector green. Evidence: `evidence/mutation-claims-exec-v2.json`,
  `evidence/detector-claims-exec-v2.json`.
- Lane integration status at re-probe: `scripts/claims-check.mjs` still `e9a21b44…` (PIN unlanded);
  the L1 must integrate v2 for the claims gate to carry PIN v1.

## Tooling


No installs or upgrades; `node` and `git` already present. All fixtures are git repos under
`mkdtemp` with `GIT_CONFIG_NOSYSTEM=1`/`GIT_CONFIG_GLOBAL=/dev/null`.
