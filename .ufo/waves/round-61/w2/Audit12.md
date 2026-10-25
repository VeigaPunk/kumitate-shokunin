# Audit12 — round 61 w2 — Source-RowSchema on S195

Attacked artifact: `corpus/SOURCES.md:147` (the landed S195 row, claim heir of
w1 `ScribeSourcesRows.md` draft `build/ScribeSourcesRows/row-S195.txt`).
Axes: operability (does the row survive the live gates/probe) · coverage (does
the claim hold against every registry/collision check).
Verdict up front: the **row passes every named schema criterion** — the check
item is CONFIRMED, not falsified. The falsifiable defects live one layer out:
the frozen C2 probe still cannot see the row, and the id `S195` is contested
by the pending shokuknow merge package.

## Named criteria — all PASS (measured, worktree + extraction)

| criterion | result | evidence |
|---|---|---|
| 11-cell row | PASS — `awk -F'\|'` NF=13 = 11 data cells; cells enumerated [2]…[12]: `S195` / `Worker Versioning — Temporal documentation — https://docs.temporal.io/worker-versioning.md` / `docs` / `A` / scope / anchor+sha256 / teaches / `mined` / `2026-10-25` / `90d` / `corpus/knowledge/temporal-worker-versioning-pinning.md` | `sed -n '147p' corpus/SOURCES.md \| awk -F'\|'`; 12 pipe glyphs total, all delimiters |
| mined/opened 2026-10-25 | PASS — cell 9 `mined`, cell 10 `2026-10-25` (valid present ISO date; `overdue --today 2026-10-25` reports only `cadence S195 recheck=90d opened=2026-10-25`, zero `overdue` lines) | fleet `sources-census.sh overdue` |
| used-by exact | PASS — cell 12 is exactly `corpus/knowledge/temporal-worker-versioning-pinning.md`; file exists (3057 B, `Oct 25 07:58`) and its frontmatter back-cites `source: S195`. Live `validate` on the real lane emits **no** S195 E11 | `ls -la`, `head` of entry, `validate` output below |
| no escaped/literal pipe | PASS — `grep -c '\\\|'` on the row = 0; awk cell-scan for `\` inside any cell prints nothing; NF=13 proves no literal `|` inside cells (an extra `|` would give NF=14, like staged S217) | grep + awk on line 147 |

## Census runs

- **Live lane** — `scripts/sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate`:
  `kumitate ok …` **exit 0**. Six pre-existing W04s only (S034/S068/S084/S095/S123/S126);
  **zero S195 lines** — no E01/E03/E04/E07/E08/E09/E11 against it.
- **Extraction** — `validate --file` + `census --file` on
  `/tmp/kumitate-r61/Audit12/extract2/kumitate-shokunin/corpus/SOURCES.md`
  (SOURCES.md + the S195 used-by target copied into a stub lane):
  `grep -c S195` on validate output = **0**; the ~170 E11 lines are all
  extraction artifacts (uncopied `corpus/knowledge`, `scripts/`, `SKILL.md` —
  S001–S194 targets). Census: `rows 134`, `tier.A 111 B 15 C 8`,
  `status.mined 102 queued 13 rejected 19`, `FLEET.missing 0` — matches the w1
  prediction (133+1, A 110+1, mined 101+1) exactly.
- Worktree row is **byte-identical** to `git show 4fd1ebf:corpus/SOURCES.md`
  line 147 (diff empty after stripping grep's `147:` prefix).

## Counterexample 1 — the honest row is invisible to the frozen C2 gate (operability)

`probe/doctrine61-probe.mjs` is **unchanged** since w1's F1 finding:
- line 17/21: `/^\|[[:space:]]*S195[[:space:]]*\|/` — JS has no POSIX classes;
  `[[:space:]]` never matches `| S195 |` → E3 prints `row-absent`, E4 `pin=''`
  for **any** row, including this schema-perfect one.
- Even if the regex matched, E3 reads `c[9]/c[10]/c[12]` while an 11-cell row
  carries status/opened/used-by at `c[8]/c[9]/c[11]` — off-by-one that only a
  malformed (census-E01) 12-cell row could satisfy.
- E4 is a 16-hex prefix check and hashes the **uncommitted** working-tree
  capture (`git ls-files …/ScoutSourceWorkerVersioning` = 0 matches), not the
  capture at `<rev>`.

Smallest safe correction: fix the probe regex to `/^\|\s*S195\s*\|/` and index
`c[8]/c[9]/c[11]`; compare full 64-hex and hash `git show <rev>:…/body.md`.
Otherwise the row lands but C2 can never go green — or worse, stays green only
under the vacuous control w1 flagged (F2).

## Counterexample 2 — id `S195` is double-allocated across artifacts (coverage)

`/home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md` (still pending):
- line 7 stages **S195 = MCP Architecture** (`modelcontextprotocol.io/…/learn/architecture`).
- line 29 stages **S217 = the same Temporal Worker Versioning URL** this lane
  row just claimed (`docs.temporal.io/worker-versioning.md`), used-by
  `corpus/knowledge/temporal-worker-versioning-pinning.md`, and the staged
  knowledge file cites `S217`, not S195.
- On merge as-is: census **E03** (duplicate id S195) plus **E04/W04**
  (duplicate Temporal URL across S195/S217); staged S217 additionally carries
  an escaped `\|` in its recheck cell → **E01** (NF=14) per w1 measurement.

Smallest safe correction: when the package lands, re-key its MCP row off S195
(or drop/re-key its S217 and point its staged entry at lane S195). A
`source-dupes.json` pin cannot help — it covers same-URL duplicate *groups*
inside one registry, not an id collision across append sources.

## Provenance note (not a schema defect, recorded for the judge)

- Row exists in jj only: `4fd1ebf` is a `jj/keep/` commit (empty subject,
  authored 06:42, recommitted 08:12); `git show HEAD:corpus/SOURCES.md` has no
  S195 and `git status` shows the row as ` M` — consistent with a jj working
  copy whose next `export` will fold it into git. Nothing to fix; any
  git-only consumer sees 133 rows today.
- `corpus/knowledge/temporal-worker-versioning-pinning.md` and the
  ScoutSourceWorkerVersioning capture are likewise jj-only (git `??` / untracked).
- The landed row's scope/anchor cells differ from the w1 draft wording (scope:
  "the version-pinning contract…", anchor: no `body.md:39`/9645-byte detail);
  cells 2,7 (source, teaches) are identical. Not a defect — anchor still
  carries the full 64-hex pin.

## Commands (all exits as shown)

- `sed -n '147p' corpus/SOURCES.md | awk -F'|' '{print NF}'` → 13
- `grep -c '\\|' <row>` → 0; pipe-glyph count = 12 (delimiters only)
- `sources-census.sh validate --root /home/vgpnk/Projects/shokunin kumitate` → exit 0, `kumitate ok`
- `sources-census.sh validate --file /tmp/kumitate-r61/Audit12/extract2/…/SOURCES.md` → exit 1 (E11 artifacts only), `grep -c S195` → 0
- `sources-census.sh census --file …` → rows 134 / A 111 / mined 102
- `sources-census.sh overdue --root … kumitate --today 2026-10-25` → `cadence S195 …` only
- `sha256sum .ufo/…/ScoutSourceWorkerVersioning/body.md` → `8ef2ee5f…f8fc` = row pin
- `git show 4fd1ebf:corpus/SOURCES.md | grep -n '^| S195'` → byte-identical to worktree line 147

## Impacted axes

- operability: HIT — frozen probe cannot observe the honest row (C1).
- coverage: HIT — S195 double-allocated lane-vs-package (C2); otherwise the
  row's own coverage claim is clean (URL new to the lane registry, no W04
  emitted for it today).

## Scratch

`/tmp/kumitate-r61/Audit12/` — `row-S195-worktree.txt`, `row-S195-committed.txt`,
`extract/` (lane-id attempt; rejected by tool as expected),
`extract2/` (SOURCES.md + used-by target used above).

Tool installs/updates: none.
