author: kumitate L1
round: 78

# Round 78 — the K plane's score becomes a census derivation, and a shape receipt learns to age

Two claims, two axes: C1 `coverage:kimi-layer` (the proxy stops re-deriving the K plane from a
private 32-row table and imports the census decision, so a census finding — a mode floor, an
unlisted member, a missing member — moves the score instead of moving nothing), and C2
`operability` (capability acquisition `omp-shape-compare`: a count-only, non-scoring live-vs-receipt
drift diagnostic, so a closure running later than the capture can tell whether the pinned OMP shape
receipt is still true). Frozen plan: `.ufo/waves/round-78/plan.md` (scaffolding `ad2630d0`).

## Gate

Sources opened this round (rows in `corpus/SOURCES.md`; capture pinned in
`.ufo/pins/source-captures.json`; the row's own bytes are the authority — Q71):

- **Admit — S228, Terraform CLI `plan` command, `#detailed-exitcode`, kind `docs`, tier A, status
  `mined`.** Opened 2026-11-04: `curl -sSL` → HTTP/2 200, 276352 bytes, sha256 `a501ef22…`,
  capture `.ufo/waves/round-78/build/L1/terraform-plan.html`. Located quote, 19 whitespace words:
  `0 = Succeeded with empty diff (no changes); 1 = Error; 2 = Succeeded with non-empty diff
  (changes present)` at `-detailed-exitcode`. Criterion met: the page is primary for the three-way
  status C2 adopts — drift is a status distinct from an error, carried by the exit code rather than
  by a parsed sentence. Boundary stated in the entry: the page is about `terraform plan`, not about
  this tool; the entry adopts the *shape* of the contract only.
- **Re-open — S227 (SQLite, `Atomic Commit In SQLite`).** Re-read at the round-78 open through the
  committed capture; still grounds `corpus/knowledge/crash-recoverable-two-file-adoption.md`; no
  correction needed.
- **Reject — the `merge/kumitate/` assimilation package as a bulk append (carried, unchanged).**
  Re-measured read-only at the round open: `SOURCES.append.md` 155 S-rows over 161 lines,
  `MERGE-REPORT.json` `entries=70`, `accepted=155`; unchanged from rounds 75–77. Criterion missed:
  §10 proportionality and CORPUS.md rule 4. **Flip:** a dedicated assimilation round that re-opens
  each entry and admits its rows one at a time. `Assimilation: none` this round.

## Mistakes

- **Class — a judge that writes outside its scratch.** The C1 counter's scorecard-copy helper
  passed the replacement *string* where the destination *path* belonged, so the first control run
  wrote two files (`K_findings=1`, `| coverage:kimi-layer | 9 |`) into the lane root instead of
  `--work`. **Evidence pointer:** `git status --porcelain` at the freeze showed both as untracked
  at the lane root; the pre-fix receipt is `controls/c1-base.txt` (sha `687527f0…`) and the fixed
  probe is `aa00be37…`. **Captured-by:** the §3 misroot sweep (`git status --porcelain`, no
  pathspec) run before the scaffolding commit — a counter's fixture must never be able to name a
  lane-relative destination. **Fix:** `scorecardCopy(ctx, from, to, dest)` takes an explicit
  absolute destination under `--work`, and the arms pass `join(ctx.work, …)`; re-running the fixed
  probe leaves the lane tree clean (the same `git status` is the fail-check).

## Counters

| counter | open (`ad2630d0` context) | close (M) | source |
|---|---|---|---|
| proxy findings (`--strict`) | 0 (`PROXY: MATCH`, after the round-open repair) | 0 (`PROXY: MATCH`) | `open/gates-open.txt`; `close/proxy-check.txt` |
| proxy A / C / C2 / C2_total | 859 / 37 / 187 / 187 | 874 / 39 / 189 / 189 | `open/gates-open.txt`; `close/proxy-json.txt` |
| K census (members / findings) | 55 / 0 | 55 / 0 | `open/gates-open.txt`; `close/census.txt` |
| OMP census (entries / findings / bound) | 64 / 0 / 35 | 64 / 0 / 35 | `open/gates-open.txt`; `close/shape.txt` |
| README map (files / uncovered) | 187 / 0 | 189 / 0 | `open/gates-open.txt`; `close/readme-map.txt` |
| spotcheck map (spotchecks / uncovered) | 44 / 0 | 44 / 0 | `open/gates-open.txt`; `close/spotcheck-check.txt` |
| SOURCES rows / tier A | 166 / 142 | 167 / 143 | `open/gates-open.txt`; `close/sources.txt` |
| checklists (pass / listed) | 37 / 37 | 39 / 39 | `open/gates-open.txt`; `close/checklists.txt` |
| probe C1 / C2 | 4/12, 2/11 (base tree); 5/12, 5/11 (constant printers) | 12/12, 11/11 | `controls/c1-base.txt` …; `close/c1-probe.txt`, `close/c2-probe.txt` |

## Limits

- `K_findings` double-penalizes a *missing* member: the denominator drops by one and the finding
  count rises by one, so one lost member costs two units of the ratio. Disclosed rather than
  smoothed; the OMP precedent (`O_findings`) behaves the same way.
- `--compare` is host-bound by construction: it reads the live `~/.omp/agent`, so it is a closure
  diagnostic, never a bean-counted term. A receipt that was already stale at capture reads DRIFT
  against the same root; the diagnostic says the root moved, never which change is legitimate.
- The K census remains the single authority: a census bug is now a score bug. The proxy's own
  selftest arms (not a second table) are the only independent check that remains.

- **The frozen C1 formula trades away the documentation factor (reported harmed).** With one
  member-naming heading de-named, the base tree's `coverage_kimi` moves 10 → 9 while the patched
  tree stays 10 and only `K_SECTIONS_DRIFT` fires (`close/harm-counterexample.txt`). The formula was
  not changed after data; C1 is `held-but-harmed` and the operator ruling is open. The round-79
  candidate is the composite `K_sections/K_members × (K_members − K_findings)/K_members` with a
  discriminating de-named-heading arm, so the choice is decided by measurement, not preference.
- **Arm 7 proves the export, not the call.** The frozen counter greps `K_MEMBER_RULES` out of the
  proxy and exercises `decide()` in a child, but it does not prove the proxy imports/calls it; a
  renamed duplicate would pass the arm and the behaviour arms on these fixtures. Post-data counter
  changes are forbidden, so the gap is covered by SKILL checklist item 38 (the import grep) and
  recorded here (freeze-review A4).
- **The probes' `DEFAULT_LANE` is one path segment short** (`.ufo`, not the lane). Routed to round
  79; the round's claim commands pass `--lane` explicitly (plan A2).

## Erratum (round 79, 2026-11-04, append-only; the round-78 text above stays as written)

The round-78 non-author spot-check (`round-78-verifier-spotcheck.md`, closure of 2026-11-04) found two
record defects. Filed reports are not rewritten; this erratum names the superseded readings.

- **Dead evidence pointers (reference-drift).** Eleven `close/` receipts named by the filed r78
  report do not resolve under the round directory: `close/proxy-json.txt`,
  `close/census-selftest.txt`, `close/omp-census-selftest.txt`, `close/mutants-c2.txt`,
  `close/proxy-selftest.txt`, `close/proxy-check.txt`, `close/census.txt`, `close/shape.txt`,
  `close/readme-map.txt`, `close/spotcheck-check.txt`, `close/sources.txt`. Their content exists
  under `close/gates.txt`, `close/gates2.txt`, `close/selftests.txt` and `close/proxy.txt`, and the C2
  mutation battery at `build/K78MutC2/battery-standin.txt`. The round-79 L1's independent
  re-measurement (`report-receipt-diff` v4 `POINTER_DEAD`, `.ufo/waves/round-79/close/c2-*.txt`) finds
  ten dead distinct pointers, adding `amended-plan-observed.md`,
  `knowledge/kimi-plane-single-derivation.md`, `knowledge/shape-receipt-live-drift.md` and
  `SOURCES.md`. The round-79 report cites only resolving paths.
- **Close-number drift (number-drift).** The round-78 section's `C2/C2_total = 189` and `README_MAP
  files=189` are superseded by the final M2 receipt `close/gates2.txt` (04:21:50): `C2=190,
  C2_total=190` and `README_MAP: CLEAN files=190 rows=190 covered=190`; the round-78 lesson's close
  `A=874` is the pre-final `rev=working-tree` run, and the same final receipt reads `A=868`.

### Erratum correction (round 79, same day; the erratum above stays as written)

The first erratum paragraph listed eleven `close/` pointers as "named by the filed r78 report". Five of
them — `close/census.txt`, `close/shape.txt`, `close/readme-map.txt`, `close/spotcheck-check.txt`,
`close/sources.txt` — occur **zero** times in that report (the round-79 freeze review's
`.ufo/waves/round-79/w1/K79ReviewFreeze/spotcheck-phantom-pointers.txt`: `grep -c` = 0 each); they were
copied from the closure's receipt list rather than from the report's bytes. The cited-and-dead receipts
are the **six** below, and the general-pointer set adds the four non-receipt tokens, for the **ten** dead
distinct pointers the round-79 measurement reports:

- dead receipts cited by the filed r78 report: `close/proxy-json.txt`, `close/census-selftest.txt`,
  `close/omp-census-selftest.txt`, `close/mutants-c2.txt`, `close/proxy-selftest.txt`,
  `close/proxy-check.txt`;
- dead non-receipt pointers: `amended-plan-observed.md`,
  `knowledge/kimi-plane-single-derivation.md`, `knowledge/shape-receipt-live-drift.md`, `SOURCES.md`.

The `C2/C2_total = 190` / `README_MAP files=190` / `A=868` readings stand as the final M2 receipt.
