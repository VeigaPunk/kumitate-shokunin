author: kumitate L1
round: 76

# Round 76 — coverage:omp becomes census-derived and registry-bound, and operability gains `spotcheck-adopt`

Two claims, two axes: C1 `coverage:omp` (the plane stops being the one live axis row the proxy does
not derive — registry family `O1`, six additive O stanza keys, `AXES_DRIFT` cross-check), and C2
`operability` (capability acquisition `spotcheck-adopt`: the two-sided README-row + covered-pin repair
that rounds 72–75 did by hand, now one constrained command). Frozen plan:
`.ufo/waves/round-76/plan.md` (scaffolding `cabc7aef`), corrections in its `## Amendment 1`.

## Gate

Sources opened this round (rows in `corpus/SOURCES.md`; capture in `.ufo/pins/source-captures.json`;
the row's own bytes are the authority — Q71):

- **S226 — oh-my-pi `packages/utils/src/dirs.ts` at tag `v18.15.0`, kind `code`, tier A.** Opened
  2026-11-04: `curl -sSL` → HTTP 200, 52434 bytes, sha256
  `2d423f4f18e5ed0c25cd4887c68cf2fea704f1615ad4c85846ae5c10d3207f24`, 1292 lines; tag
  `v18.15.0` = `3fedf8d53267e32a6d7521ce725fdcc4a36fdc67`. Located quotes, each ≤ 25 whitespace words:
  line 949 `// Agent subdirectories (~/.omp/agent/*)` (4); lines 991-992
  `const subdir = path.join("predict", method); const stateDir = dirs.agentSubdir(agentDir, subdir, "data");` (11);
  lines 1052-1054 `/** Get the crash log path (~/.omp/agent/omp-crash.log). */ export function getCrashLogPath(agentDir?: string): string { return dirs.agentSubdir(agentDir, "omp-crash.log", "state");` (18).
  Capture: `.ufo/waves/round-76/build/K76ScoutDirsRelease/dirs-v18.15.0.ts` (`SOURCE_CAPTURE: CLEAN captures=57`).
  **Admit** — the installed release's file is byte-identical to S053's `v18.12.6` body (`cmp` on two
  independent fetches exits 0), so the census's member rules hold at the installed tag; the row also
  records five `agentSubdir` names the census does not declare (`modules`, `omp-crash.log`,
  `omp-debug.log`, `python-gateway`, `secret-placeholder.key`), all absent on this host — a named
  coverage gap, not drift.
- **Reject — `merge/kumitate/` package as a bulk append (carried).** `SOURCES.append.md` now reads
  161 rows over 70 entries (`MERGE-REPORT.json`), larger than the 155/70 the r75 spot-check measured.
  Criterion missed: §10 scoping/proportionality — a package that size cannot be re-grounded inside a
  two-claim tooling round; a bulk row append is forbidden (CORPUS.md rule 4). **Flip:** a dedicated
  assimilation round that re-grounds entries one at a time. Not re-adjudicated further this round.

## Mistakes

- **control-fixture-path-shape** · the pre-data `c2-row-only` control's first README insertion wrote
  the first cell as `corpus/lessons/round-75-verifier-spotcheck.md`; `readme-map.mjs` parses a row only
  when its first cell is a bare `knowledge/` or `lessons/` path, so the row count stayed 181 and the
  receipt proved nothing about the half-state · evidence: `.ufo/waves/round-76/controls/c2-row-only.txt`
  (corrected run: `README_MAP: DRIFT files=182 rows=182 covered=181 bad=1
  first=unpinned:lessons/round-75-verifier-spotcheck.md`) · captured-by: **none** — `format-unmapped`
  covers a corpus-SHAPED cell that starts `knowledge/`/`lessons/` but not a `corpus/`-prefixed one,
  so the oracle ignored the malformed row silently · fix: the control carries the corrected row and
  its parse count (`rows=182`); the raw first attempt is disclosed here rather than rewritten.
- **predicate-count-vs-schema** · C1(a) froze `grep -c '"coverage_omp"'` → 1, but `--json` emits every
  term twice (computed `terms.<key>` and the stanza's `terms.declared.<key>`), so a correct
  implementation reads 2 · evidence: `.ufo/waves/round-76/build/K76ExecProxyO/coverage-omp-json-count.txt`
  (`2`), raised independently by seat K76ReviewFreeze FREEZE-FIX 1 · captured-by: **Q70** (a tally
  must be exercisable against a committed transcript) and **Q64** (exercise the counter on a known-good
  sample before freezing) — the base run (0) discriminated, the after-value did not · fix: the claim is
  reported under both readings (literal 2 ≠ 1; corrected: the key is present and equals 10 in both
  slots), and a later freeze greps the computed path (`--json | jq .terms.coverage_omp`), not the key
  name.
- **freeze-under-red-map** · the plan was frozen and committed while `README_MAP` was red
  (`uncovered:lessons/round-75-verifier-spotcheck.md`), so the `plan-before-ready.sh` map arm reads
  `map=DRIFT` for this round's plan archive even though the close is green · evidence:
  `.ufo/waves/round-76/open/maps-open.txt`, `close/readme-map.txt`, and
  `close/plan-before-ready.txt` · captured-by: the round-64 readme-map arm of `plan-before-ready`
  **existed and would have caught it before the plan was committed** — it was not run at freeze time ·
  fix: run the map arm (or `readme-map`) before committing a plan; a red map is either repaired in the
  scaffolding commit or disclosed in the plan itself. The frozen plan bytes are not rewritten.
- **control-token-spelling** · the plan's C1 control paragraph names `STANZA_UNKNOWN_KEY`; the tool's
  token is `STANZA_KEY_UNKNOWN` · evidence: `controls/c1-declare-only.txt` (`PROXY: FAIL-CLOSED
  (STANZA_KEY_UNKNOWN)`) · captured-by: **Q65** (a claim sentence quotes its receipt byte-for-byte) ·
  fix: both spellings are preserved verbatim here and in the report; the plan's `## Amendment 1`
  records the erratum.

## Spot-check

Pending the non-author closure. The next closure writes `lessons/round-76-verifier-spotcheck.md`; this
round does not pre-create that artifact or its map row (C2's `--predict 76` only records `PENDING`).

## Verdicts (see the round report for the receipt lines)

- **C1** — coverage:omp: derived 0 keys → six keys and `coverage_omp=10`, registry family `O1`,
  `AXES_DRIFT` sixth row, three fail-closed/negative arms, selftest 145/145. Literal clause (a) reads
  2, not 1 (Mistakes); every other clause verified. **improved (literal predicate miss disclosed).**
- **C2** — operability: `spotcheck-adopt` adopted the r75 closure lesson on the live tree
  (`wrote=both`, `README_MAP: CLEAN files=182 rows=182 covered=182`), idempotent (byte-identical),
  three refusals without a byte written, both half-states repaired in the suite, selftest 16/16.
  **improved (capability acquisition; the operability integer stays 9 by `f_O`).**

- **adopt-appends-at-eof** · the adopt arm appends the README row at end-of-file, so a `lessons/`
  row landed after the `## Frontier` prose; `readme-map` accepts it (rows are parsed file-wide) and
  the map still read CLEAN, but the map's structure was broken · evidence: the tool's own
  `wrote=both` receipt vs the tidied file; `README_MAP: CLEAN files=183 rows=183 covered=183` after
  the move · captured-by: **none** — the oracle enforces presence, not placement, a named limit ·
  fix: the row was moved into the lessons table by hand and the placement gap is a round-77
  candidate (a `--check` placement arm), not a rewritten tool this round.
