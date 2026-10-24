# ExecSourcesGate — round 57 (kumitate, hyaku run 5)

Item: run the four sources-domain gates and capture every CLEAN line. Lane leaf; no
production file was read as mutable, nothing was committed, nothing installed.

## 1. What was executed, and against which bytes

- Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`
- jj working-copy commit `2909579f` (change `nuxonxru`), parent `8c6f5b01`
  (`round-57: idempotence at bookkeeping tip c42afe1c`); plan R1 `f0dc6d11`.
- `jj diff --name-only -r @` → `.ufo/waves/round-57/w1/swarm-registry.json` only. Every
  input these four gates read (`scripts/*.mjs`, `corpus/SOURCES.md`,
  `corpus/knowledge/`, `.ufo/pins/*.json`) is therefore byte-identical to parent
  `8c6f5b01`, and the wave build trees are untracked (`jj status` lists them under
  "Untracked paths"), so their verdicts are revision-stable.

Bare argv, lane-root cwd, `node v24.21.0`:

| # | command | exit | stdout |
|---|---|---|---|
| 1 | `node scripts/sources-check.mjs` | **0** | `SOURCES  info  LEGACY_NO_HEADER  count=38`<br>`SOURCES_CHECK: CLEAN (rows=120 tiers=A:99,B:13,C:8 status=queued:12,mined:88,rejected:20 entries_with_source=14 legacy=38)` |
| 2 | `node scripts/source-capture.mjs` | **0** | `SOURCE_CAPTURE: CLEAN captures=13 exemptions=107` |
| 3 | `node scripts/source-dupes.mjs` | **0** | `SOURCE_DUPES: CLEAN groups=4 known=4` |
| 4 | `node scripts/counter-pins.mjs` | **0** | `COUNTER_PINS: CLEAN pins=14` |

All four stderr files are 0 bytes. Also captured: `--strict` (identical output, exit 0 —
no warning-class findings exist to promote) and `--json` (`"verdict":"CLEAN"`,
`"findings":[]`, `"totals":{"errors":0,"warnings":0}`).

Raw evidence: `.ufo/waves/round-57/build/ExecSourcesGate/{sources-check,source-capture,source-dupes,counter-pins}.{stdout,stderr}.txt`,
`…/sources-check.{strict.stdout,json}.txt`, `…/SUMMARY.md`.

## 2. Independent recomputation (not a re-read of the gates' own claims)

- **counter-pins — 14/14 match.** Entries by round: 53→3 (`attest53-probe`,
  `doctrine53-probe`, `receipt-attest`), 54→2, 55→3, 56→3, 57→3
  (`attest57-probe`, `doctrine57-probe`, `readme-map`). Re-hashed every pinned path with
  `node:crypto` against the registry: 14/14 sha256 equal, 0 absent, 0 symlinked. This is
  the H6/no-regression claim read directly (`counter-pins.independent.txt`).
- **source-capture — 13/13 match.** Captures S108..S120 re-hashed: 13/13 sha256 *and*
  byte length equal. One exemption entry carrying exactly 107 ids, `S1..S107`, contiguous,
  **0 ids ≥ S108** — no post-rule row hides behind the exemption
  (`source-capture.exemption-range.txt`). 107 + 13 = 120 = the `sources-check` row total,
  so the two gates partition the same universe.
- **source-dupes — 4/4 groups.** Recomputed the census-W04 class myself from
  `corpus/SOURCES.md` (normalized URL equal AND differing `scope` cell) →
  exactly 4 live groups, each matching a pin by id-set *and* normalized URL
  (`S023,S034` stryker; `S047,S084` infection; `S060,S068` oh-my-pi tree; `S069,S095`
  bwrap). 0 new, 0 stale (`source-dupes.independent.txt`).
- **sources-check — counts.** rows 120 = tiers 99+13+8 = status 12+88+20. `legacy=38` is
  the frozen-`16a5441` knowledge identity set, info-only; `entries_with_source=14`.
- **Row ↔ registry cross-binding.** 44 rows declare `body sha256 <hex>` in their anchor
  cell; the 12 captured ones equal the registry hash exactly. `S108` is the single
  capture whose row declares no hash. S117/S118/S119 are `mined`/tier A with
  `used-by = corpus/knowledge/worker-heartbeat-liveness.md`; that entry's `source:`
  header cites all three URLs; S120 is `rejected`/tier B with `used-by = —` and the
  reject rationale in `teaches` (`s117-s120-fields.txt`).

## 3. Non-vacuity controls (scratch copies only; lane never mutated)

Selftests at this revision, all exit 0: `SOURCES_SELFTEST: 46/46 pass`,
`SOURCE_CAPTURE_SELFTEST: PASS (13/13)`, `SOURCE_DUPES_SELFTEST: PASS (12/12)`,
`COUNTER_PINS_SELFTEST: PASS (11/11)` — each suite carries red-before cases.

Beyond the suites, controls built from the *real* registries and *real* bytes:

- replica of the 14-pin registry + all pinned files → `CLEAN pins=14`; one byte flipped at
  offset 200 of the `attest57-probe` copy → `DRIFT pins=14 bad=1
  first=attest57-probe:hash-mismatch`, exit 1, other 13 still clean (per-pin granularity).
- replica of the 13 captures → `CLEAN captures=13 exemptions=107`; one byte flipped in the
  S119 capture → `DRIFT … bad=1 first=S119:hash-mismatch`, exit 1.
- doc-side with the real registry: deleting the S117 row → `DRIFT … first=S117:orphan-capture`;
  repointing S120 onto S117's URL → `DRIFT groups=5 known=4 first=new-duplicate:docs.temporal.io/encyclopedia/detecting-activity-failures ids=S117,S120`.
- `sources-check` on a scratch lane root: duplicate row id adds `ID_DUPLICATE id=S117` (+
  `ENTRY_SOURCE_UNKNOWN … S119`); tier `Z` adds `TIER_ENUM id=S117 tier=Z`. (Scratch
  baseline is DRIFT only from `USED_BY_MISSING` for `used-by` targets not copied into the
  scratch root; the live tree has 0 findings.)
- layout trap confirmed: a registry placed below lane-root shape but above the pinned paths
  makes the gate report all bindings `absent` and exit 1 — it never passes on unresolved
  paths.

Transcripts: `.ufo/waves/round-57/build/ExecSourcesGate/controls.txt`; the scratch trees
(including the copied `.mjs` probes) were deleted afterwards so my evidence directory
contributes **0** files to the lane's `proxy-check` A term.

## 4. Adjacent measured failure (outside my four-gate item, same checklist)

`node scripts/surface-probe.mjs --checklists` → `CHECKLIST: 26/27 pass`,
`CHECKLIST_SKIPPED: 0`, `VERDICT: FAIL`, exit 1. My three gates pass at
`SKILL.md:717/718/719` (`counter-pins.mjs`, `source-capture.mjs`, `source-dupes.mjs`) and
`readme-map.mjs` passes at `:720`. The single red is `SKILL.md:701`:

```
node scripts/proxy-check.mjs --strict → exit 0 + PROXY: MATCH
observed: exit 1
PROXY  error  A_DRIFT  A: declared=90 computed=5807 delta=+5717
PROXY: DRIFT (A_DRIFT term=A declared=90 computed=5807 delta=+5717; src-rev=31c465f15669)
```

Attribution is exact, not speculative. `A` counts `*.mjs|*.js|*.sh|*.py` under the lane
with `.git` excluded, so the untracked wave evidence tree counts too:

| measurement | value |
|---|---|
| A with the in-flight round-57 build tree excluded | **90** (= the SCORECARD-declared `A=90`) |
| A-class files under `.ufo/waves/round-57/build/` at the same instant | **5717** |
| A total | **5807** = 90 + 5717 |

Recorded before my cleanup the same arithmetic held (declared 90 + 6186 in tree = 6276),
so the term is a moving target while 63 sibling seats write evidence. Conclusion: the
`PROXY: DRIFT` is **not** lane-surface drift — it is the wave's own build tree being
counted — but it means plan **H3 (`PROXY: MATCH` at close) is unreachable while
`.ufo/waves/round-57/build/**` holds any A-class file**. The L1 must decide between
pruning that tree before H3 or re-basing the declared `A`; I did not touch either.

Evidence: `…/proxy-check.strict.txt`, `…/proxy-check.strict.after-cleanup.txt`,
`…/a-count-attribution.txt`, `…/surface-probe.checklists.txt`.

## 5. Risks and coverage limits (measured, not fixed)

1. **Capture coverage is 13/120 rows = 10.8%.** One exemption entry covers S1..S107 by id
   list. The gate enforces *membership*, not a round/date boundary: nothing in
   `source-capture.mjs` refuses an exemption id whose row `opened` postdates the rule.
   Observed state is sound (0 post-rule ids exempt), so this is a latent bypass shape, not
   a failure.
2. **32 of the 44 row-declared `body sha256` anchors are unverifiable** (pre-rule rows with
   no committed bytes). R54-C1's class is narrowed to 12 bound claims, not closed; a
   non-author spot-check still cannot re-open those 32 sources.
3. **`legacy=38`** knowledge files predate the entry-header rule and stay info-only even
   under `--strict`; the header contract covers `entries_with_source=14`.
4. **`--strict` is a no-op at this revision** (0 warnings) — the promotion path is proven
   only by the selftest fixture, never by live data this round.

None of these are drift: all four gates exit 0 with zero findings, and each verdict was
independently reproduced from the underlying bytes.

## 6. Files, installs, blockers

- Wrote only under `.ufo/waves/round-57/build/ExecSourcesGate/` (this report's evidence)
  and this report at `.ufo/waves/round-57/w1/ExecSourcesGate.md`.
- No production file, pin, registry, SOURCES row, README, SCORECARD, LOG, SKILL, PROVINCE,
  jj or Git state was modified; no commit, no push. No installs (tooling directive: none
  needed; `node v24.21.0` present).
- Blockers: none. One decision is owed by the L1, not blocked on me: the §4 H3/A-term
  conflict.
