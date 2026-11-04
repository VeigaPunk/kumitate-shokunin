# kumitate round 78 — frozen plan (L1, 2026-11-04)

Round of the run-15 hyaku block (one v1 wave, 8–16 seats, policy `ufo-wave-policy.json`).
Base tip: `0b4df07b6f7478e7db6afb6852c418e096663c3c` (round-77 closure, integrator spot-check).
Axes: **operability 9** (lowest live axis; terminal integer) + **coverage:kimi-layer 10**.
Frozen before any data seat: this file, the two counters (`probe/probe78-c1.mjs`,
`probe/probe78-c2.mjs`), the fixture spec (`probe/kimi-fixture.json`), the open receipts
(`open/`) and the pre-data controls (`controls/`).

## Open state (measured, `.ufo/waves/round-78/open/gates-open.txt`)

- `node scripts/proxy-check.mjs --src <pin> --strict` → `PROXY: DRIFT (C2_TOTAL_DRIFT …; AXES_DRIFT …)`
  exit 1 — the round-77 integrator closure added `corpus/lessons/round-77-verifier-spotcheck.md`
  after the lane closed, so `C2_total` computed 187 while the stanza declares 186. The map is red
  for the same file (`README_MAP: DRIFT files=187 rows=186 covered=186`), the 7th recurrence.
  Repaired in the scaffolding commit (adopt the spotcheck + re-measure `C2`, `C2_total`) so the
  freeze runs on a green map.
- `node scripts/kimi-census.mjs` → `KIMI_CENSUS: CLEAN (members=55 checked=55 chain=22 info=4)` exit 0.
- `node scripts/omp-census.mjs --shape .ufo/pins/omp-shape.json` → `OMP_CENSUS: CLEAN
  (source=snapshot entries=64 findings=0 bound=35/35)` exit 0.

## C1 — coverage:kimi-layer: the K score is derived from the census decision, including its findings

**Claim sentence (frozen).** At M, `node .ufo/waves/round-78/probe/probe78-c1.mjs --set c1` prints
`C78_C1: HELD held=12/12` and exits 0; at the base tree the same probe prints a held count below
12 and exits 1.

**Why it is a move, not a refactor.** Today the proxy re-derives the K plane from its own
`K_MEMBER_RULES` table (`scripts/proxy-check.mjs:615`) — 32 rows that carry **no mode floors and no
secret-shape aliasing** — while `scripts/kimi-census.mjs` gates the same 32 slots *and* their shape
(`modeFloor`, `modeCeiling`, owner, secret-leaf alias). The two tables can drift, and a census
finding today moves nothing: a root whose `mcp.json` loses its `0400` read bit reads
`KIMI_CENSUS: DRIFT … SHAPE_DRIFT`, yet `proxy-check` still derives `coverage_kimi=10`
(`K_members` and `K_sections` are unchanged). After C1 the proxy **imports the census decision**
(`decide(root)`), the duplicate table is deleted, and the score is
`floor(10 × C1k/C1k_total × (K_members − K_findings)/K_members)` with `K_findings` the census's own
finding count — the r76 OMP precedent applied to the K plane (round-78 pre-registered candidate 2).

**After-state (one value the closure re-derives with one command).** The committed probe's
`held=12/12`; `--json` carries `K_findings`; the mode-violating fixture root reads
`K_findings=1 coverage_kimi=9` while the clean fixture root reads `0 / 10`; `K_MEMBER_RULES`
occurrences in `scripts/proxy-check.mjs` = 0.

**Counter arms (frozen, `.ufo/waves/round-78/probe/probe78-c1.mjs`).** 12 arms:
1. `census-clean-fixture` — census on the frozen fixture root: CLEAN, members=55.
2. `census-mode-violation` — `mcp.json` chmod `0200` (drops the declared `0400` floor): census
   DRIFT with `SHAPE_DRIFT mcp.json`.
3. `proxy-clean-terms` — proxy `--kimi-root F --json`: `K_members=55 K_sections=55 K_findings=0
   coverage_kimi=10`, MATCH.
4. `proxy-mode-violation` — same root mutated: `K_findings=1 coverage_kimi=9`, findings include
   `K_FINDINGS_DRIFT` and `COVERAGE_KIMI_DRIFT`.
5. `proxy-stray` — an undeclared root member: census `UNLISTED`; proxy `K_findings=1
   coverage_kimi=9`.
6. `proxy-missing` — `region` removed: census `MEMBER_MISSING`; proxy `K_members=54
   K_findings=1 coverage_kimi=9`.
7. `single-derivation` — `K_MEMBER_RULES` in the proxy = 0 hits; the census exports `decide`
   and `decide(F)` returns `{members:55, findings:[], identities has mcp.json}`.
8. `stanza-tamper` — a copied scorecard declaring `K_findings=1`: `K_FINDINGS_DRIFT` fires.
9. `axes-crosscheck` — a copied scorecard whose `coverage:kimi-layer` row reads 9: `AXES_DRIFT`.
10. `content-blind` — a fixture `mcp.json` carrying `PROBE78_KIMI_SECRET_MARKER` bytes: neither
    tool's stdout/stderr ever contains the marker (shape-only preserved).
11. `live-strict` — the live lane `--strict --json`: MATCH, `K_findings=0`, `coverage_kimi=10`.
12. `selftests` — `kimi-census --selftest` and `proxy-check --selftest` both exit 0.

*Kill rule.* All 12 arms must pass; any miss is UNMET and an honest stop. A constant printer
cannot pass arms 3/4/5/6 (the same command must read 55/0/10, 55/1/9, 55/1/9 and 54/1/9) and
arm 7 reads committed bytes.

*Controls (pre-data, `.ufo/waves/round-78/controls/`).* (a) the same probe run against a
`git archive` of the base tree: the base proxy has no `K_findings` and no census import, so the
count is well below 12; (b) a stub lane whose `proxy-check.mjs`/`kimi-census.mjs` are constant
printers: the count is well below 12.

## C2 — operability: capability `omp-shape-compare` (live-vs-receipt drift diagnostic)

**Claim sentence (frozen).** At M, `node .ufo/waves/round-78/probe/probe78-c2.mjs --set c2` prints
`C78_C2: HELD held=11/11` and exits 0; at the base tree the same probe prints a held count below
11 and exits 1.

**Why it is a move.** Round 77 made `coverage:omp` re-derivable offline from a pinned receipt, but
a receipt proves the shape **at capture**, and a closure running later cannot tell whether the live
root moved (round-78 pre-registered candidate 3). C2 adds a count-only, **non-scoring** diagnostic:
`node scripts/omp-census.mjs --compare FILE [--root DIR]` → one line
`OMP_SHAPE_COMPARE: IN_SYNC|DRIFT entries=<live> receipt=<n> added=<n> removed=<n> changed=<n>
first=<name>`; exit 0 in sync, 1 drift, 2 fail-closed (malformed/absent receipt, root not a dir).
Reads names/kinds/modes only, never content; `--snapshot`/`--shape` and every proxy term are
unchanged. Capability row `omp-shape-compare` enters `SCORECARD.md` in the same round.

**After-state.** The probe's `held=11/11`; the pinned receipt against the live root reads
`IN_SYNC entries=64 receipt=64 added=0 removed=0 changed=0`; a materialised root plus one extra
member reads `added=1`.

**Counter arms (frozen, `probe/probe78-c2.mjs`).** 11 arms:
1. `usage-lists-compare` — the tool's usage names `--compare`.
2. `in-sync` — materialised root vs the pinned receipt: IN_SYNC, entries=64, added/removed/changed 0, exit 0.
3. `added` — root + one extra member: DRIFT `added=1 first=probe-extra`, exit 1.
4. `removed` — one receipt member deleted: DRIFT `removed=1`, exit 1.
5. `changed` — one mode changed: DRIFT `changed=1`, exit 1.
6. `invalid-receipt` — malformed JSON: exit 2 `SHAPE_INVALID`.
7. `absent-receipt` — missing file: exit 2 `SHAPE_NOT_FOUND`.
8. `root-not-dir` — `--root` a file: exit 2.
9. `content-blind` — marker bytes inside a member file: IN_SYNC and no marker in output.
10. `non-scoring` — `--compare` is absent from `scripts/proxy-check.mjs`; `--snapshot`→`--shape`
    roundtrip still reads `OMP_CENSUS: CLEAN (source=snapshot`.
11. `selftests` — `omp-census --selftest` exit 0 and the live `--shape` reading unchanged.

*Kill rule.* All 11 arms must pass; any miss is UNMET. A constant printer cannot pass arms 2–5
(in-sync vs three distinct drift counters) nor arm 10.

*Controls.* (a) the probe against the base tree (no `--compare`: usage 64); (b) a stub lane whose
`omp-census.mjs` always prints the IN_SYNC line: count well below 11.

## Routed repairs (not claims)

The round-77 closure's six routed defects: D1 lesson counter row (856→857) corrected append-only;
D2 re-score the round-77 base controls on the final counter bytes and record the probe sha in the
corrected receipts; D3 the floor-line definition stated (L1 holds the planner seat; the floor used
is the template's, 3 executors this round); D4 quote word-count erratum; D5 the FREEZE-FIX 6
loader-exit annotation corrected; D6 the r76 routed item 3 durable pointer appended to the lesson.

## Round shape

ONE v1 wave, 14 seats, `ufo-wave-policy.json` band 8–16: connector 1, executors 3, scribes 2,
scouts 2, reviewer 2, critic 1, mutation-tester 2, sentinel 1 (attack 6/14 = 43 %). The L1 holds the
canonical planner seat (the validator rejects `planner` as a swarm role). Routes are decided by
`task.agentModelOverrides`; no item passes `model`. Residual: none planned; if a seat dies the
seat stays dead and is reported.

## Targets and admission

C1 and C2 both verify only as HELD 12/12 and 11/11 at M. No axis is harmed: the live K census is
CLEAN (`K_findings=0`), so `coverage:kimi-layer` stays 10; `coverage_omp` and every other term are
untouched (C2 is non-scoring by construction, arm 10); operability's integer is terminal (9) and
the capability table gains one demonstrated row. `SOURCES.md` gains one opened row (S228) cited by
`corpus/knowledge/shape-receipt-live-drift.md`; census start/end must exit 0.

## Amendment 1 (2026-11-04, pre-data; C1 counter, append-only)

The C1 probe's `axes-crosscheck` arm selected the `AXES_DRIFT` finding by `f.term === 'coverage_kimi'`;
the canonical `compareAxes()` emits `term: <axis label>` and `key: <term>` (`scripts/proxy-check.mjs:1296-1304`),
so the arm would have failed an honest implementation on a field name. The arm now selects
`f.key === 'coverage_kimi'`. No target, arm count, kill rule or predicate changes; the arm asked the
same question (a cross-checked `## Axes` row) and now names the canonical field. Counter bytes
`aa00be37…` → `5e9d9d4f…`; all four pre-data controls were re-scored on the amended bytes
(`controls/c1-base.txt` 4/12, `controls/c1-stub.txt` 5/12, both below the 12/12 target) and the
receipts carry the new sha. Found by the round's own pre-data review (K78ReviewC1) before any C1
implementation was scored; disclosed as a routed counter defect in the lesson.

## Amendment 2 (2026-11-04, pre-verdict; invocation only, append-only)

The pre-data freeze review found that both probes' `DEFAULT_LANE` resolves three `..` from
`.ufo/waves/round-78/probe/` to `<lane>/.ufo`, not the lane root. No arm was ever run through the
default (every arm and every seat ran `--lane` explicitly), but the two claim sentences above quote
the counter command without it. Those two sentences are corrected to the explicit form:

- C1: `node .ufo/waves/round-78/probe/probe78-c1.mjs --set c1 --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin`
- C2: `node .ufo/waves/round-78/probe/probe78-c2.mjs --set c2 --lane /home/vgpnk/Projects/shokunin/kumitate-shokunin`

**No probe byte changes.** The C2 implementation was already scored at `a46e53d7…` and C1's arms are
frozen at `5e9d9d4f…`; editing a counter after an implementation has been scored would be a post-data
instrument move. The broken default is recorded as a routed defect (round 79: rewrite `DEFAULT_LANE`
to four `..` and re-run both control sets), not repaired under this round's verdict.

## Amendment 3 (2026-11-04, pre-verdict; wording only, append-only)

The C2 line grammar above is read as `first=<name>` **on DRIFT only**; the IN_SYNC line carries no
`first=` field (`OMP_SHAPE_COMPARE: IN_SYNC entries=64 receipt=64 added=0 removed=0 changed=0`), which
is what the frozen counter asserts and what the `--compare` selftest arms pin. The two claim
sentences, the counters and the kill rules are unchanged; this only writes down the reading the
frozen probe already encodes.
