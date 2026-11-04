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
| proxy findings (`--strict`) | 0 (`PROXY: MATCH`, after the round-open repair) | `<CLOSE>` | `open/gates-open.txt`; `close/proxy-check.txt` |
| proxy A / C / C2 / C2_total | 859 / 37 / 187 / 187 | `<CLOSE>` | `open/gates-open.txt`; `close/proxy-json.txt` |
| K census (members / findings) | 55 / 0 | `<CLOSE>` | `open/gates-open.txt`; `close/census.txt` |
| OMP census (entries / findings / bound) | 64 / 0 / 35 | `<CLOSE>` | `open/gates-open.txt`; `close/shape.txt` |
| README map (files / uncovered) | 187 / 0 | `<CLOSE>` | `open/gates-open.txt`; `close/readme-map.txt` |
| spotcheck map (spotchecks / uncovered) | 44 / 0 | `<CLOSE>` | `open/gates-open.txt`; `close/spotcheck-check.txt` |
| SOURCES rows / tier A | 166 / 142 | `<CLOSE>` | `open/gates-open.txt`; `close/sources.txt` |
| checklists (pass / listed) | 37 / 37 | `<CLOSE>` | `open/gates-open.txt`; `close/checklists.txt` |
| probe C1 / C2 | 3/12, 2/11 (base tree); 5/12, 5/11 (constant printers) | `<CLOSE>` | `controls/c1-base.txt` …; `close/c1-probe.txt`, `close/c2-probe.txt` |

## Limits

- `K_findings` double-penalizes a *missing* member: the denominator drops by one and the finding
  count rises by one, so one lost member costs two units of the ratio. Disclosed rather than
  smoothed; the OMP precedent (`O_findings`) behaves the same way.
- `--compare` is host-bound by construction: it reads the live `~/.omp/agent`, so it is a closure
  diagnostic, never a bean-counted term. A receipt that was already stale at capture reads DRIFT
  against the same root; the diagnostic says the root moved, never which change is legitimate.
- The K census remains the single authority: a census bug is now a score bug. The proxy's own
  selftest arms (not a second table) are the only independent check that remains.
