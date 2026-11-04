# LOG.md entry — round 80 (draft against `6d03402fddf44cc9797ec590f0f888e933db4677`)

Insertion point: end of `LOG.md` (after the round-79 one-line bullet, `LOG.md:2544`). Two shapes are
drafted: the section the lane's convention carries and the gate-required one-line record. Values marked
`[closure]` are not mine to measure; everything else is re-derived at the scaffold
(`w1/K80ScribeDocs/scaffold-readings.txt`, `base-readings.txt`, `c1-at-6d03402f.txt`,
`c2-at-6d03402f.txt`).

## Section

```markdown
## 2026-11-04 — round 80 (operability: `spotcheck-adopt` v3 reads the spotcheck set and the map as two
readings and scopes `--adopt` to its own delta; coverage:omp: the O terms re-derive offline from the
committed shape receipt)

Two claims, two axes. Trigger: two carried candidates — the round-76 candidate "`--check` conflates an
unrelated map drift with an uncovered spotcheck" (owner named round-80 L1 by the round-79
pre-registration) and the round-79 close's live-root flake (`O_members` 64 ↔ 68 while OMP held
`agent.db-{shm,wal}` open; routed to round 80 in `corpus/lessons/round-79.md` § Limits).

C1 operability (`spotcheck-adopt` v3, contract `kumitate-spotcheck-adopt-v3`): `--check` now prints two
readings — `SPOTCHECK_COVERAGE: CLEAN|DRIFT spotchecks=<n> uncovered=<k> [first=<path>]` whose exit is
the spotcheck verdict, then `MAP: CLEAN|DRIFT first=<finding>` as disclosure only — and `--adopt`
validates its own delta (the target key resolves after the write and `otherFindings` is unchanged)
instead of demanding a globally clean map. Before at a `git archive 1968689f` tree: the frozen counter
reads `C80_C1: HELD held=6/13` (`open/c1-base.txt`), the constant printer `held=3/13`
(`controls/c1-stub.txt`), and a green spotcheck set on a red map reads the conflated
`SPOTCHECK_MAP: DRIFT spotchecks=1 uncovered=0 first=oracle` exit 1 (`open/conflation.txt`; the lane
itself reads `SPOTCHECK_MAP: DRIFT spotchecks=46 uncovered=1`, `open/base-receipts.txt`).

C2 coverage:omp (the axis's own derivation surface): the O terms (`O_members`, `O_findings`, `O_bound`,
`coverage_omp`) default to the committed receipt `.ufo/pins/omp-shape.json` with `source=snapshot` in
the verdict line and the `--json` body; the live root is the explicit `--omp-live` opt-in; an absent
default receipt fails closed (`OMP_SHAPE_NOT_FOUND`), never a silent live read; the receipt is
re-captured at 65 members (sha256 `84e41b9f…`) and pinned in `kumitate-gate-pins-v1`. Before at open:
`PROXY: DRIFT (C2_TOTAL_DRIFT declared=194 computed=195; O_MEMBERS_DRIFT declared=64 computed=65;
AXES_DRIFT coverage row=10 derived=9)` exit 1 (`open/proxy.txt`); offline the proxy was fail-closed
(`open/base-receipts.txt`); `C80_C2: HELD held=4/12` at the base tree, the constant-JSON stub 1/12
(`open/c2-base.txt`, `controls/c2-stub.txt`).

Measured at the scaffolding revision `6d03402f` with the frozen counters: `C80_C1: HELD held=13/13`
and `C80_C2: HELD held=12/12`, both exit 0 (`w1/K80ScribeDocs/c1-at-6d03402f.txt`,
`c2-at-6d03402f.txt`); `OMP_AGENT_ROOT=/nonexistent node scripts/proxy-check.mjs` →
`PROXY: MATCH (… O_members=65 O_findings=0 O_bound=35 coverage:omp=10; pins=6 match;
src-rev=31c465f15669; source=snapshot)` exit 0; `node scripts/spotcheck-adopt.mjs --check` →
`SPOTCHECK_COVERAGE: CLEAN spotchecks=46 uncovered=0` + `MAP: CLEAN` exit 0; `README_MAP: CLEAN
files=195 rows=195 covered=195` exit 0; `OMP_CENSUS: CLEAN (source=snapshot entries=65 findings=0
bound=35/35)` and `OMP_SHAPE_COMPARE: IN_SYNC entries=65 receipt=65 added=0 removed=0 changed=0
transient=0`; selftests `SPOTCHECK_ADOPT_SELFTEST: PASS (28/28)` and `PROXY_SELFTEST: 163/163 pass`;
stanza A 884 → 886, C 39 held, C2/C2_total 194 → 195, `O_members` 64 → 65, re-pins `pin.proxy-check`
`ab304f97…` → `59dfeb64…`, `pin.omp-shape` `5980a0c8…` → `84e41b9f…`, `pin.spotcheck-adopt`
`b84343a0…` → `0d9c56dc…`.

- Same-commit re-measure [closure]: A → <A>, C 39 held, C2/C2_total 195 → <n> (the round's lesson and
  its README row), `pin.*` as measured at the close commit; every close receipt names `rev=<M>`.
- Routed repairs (not claims): [closure — the L1's list].
- Axes: operability 9 (terminal; capability deepened), coverage:omp 10 (the integer's derivation
  surface moved from the host to committed bytes), `coverage` (retired) and the three layer terms
  unchanged and byte-consistent; no axis harmed.
- Limits carried: the live O root is now a non-scoring watch (`omp-census --compare`), the receipt
  names no capture time, `A` counts every runnable file (a fixture leftover moved it 886 → 908), and
  the adopt delta compares findings, not bytes.
- SOURCES [closure: rows and tiers]; census start/end [closure]. No tools installed.

Wave: [closure] — ONE v1 wave, 13 seats under `ufo-wave-policy.json` band 8–16, planner held by the L1.
```

## One-line record (gate-required)

```markdown
- 2026-11-04 — round 80 (gate-required one-line record; the full entry is the section above): C1
  operability — capability deepening `spotcheck-adopt` v3 (the spotcheck set and the README map are two
  readings; `--adopt` validates its own delta on a red map; frozen counter `C80_C1: HELD held=13/13`,
  base 6/13, stub 3/13; selftest 28/28); C2 coverage:omp — the O terms default to the committed shape
  receipt with `source=snapshot` and `--omp-live` as the opt-in, receipt re-captured at 65 and pinned
  (`84e41b9f…`; frozen counter `C80_C2: HELD held=12/12`, base 4/12, stub 1/12); `PROXY: MATCH …
  source=snapshot`, spotcheck map 46/0, README map 195/195, A 884 → 886, C2 194 → 195 [closure: final
  A/C2 and SOURCES].
```
