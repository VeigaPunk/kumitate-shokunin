# ScribeMistakes — round-57 audit of `corpus/lessons/round-57.md ## Mistakes`

Seat: ScribeMistakes (scribe). Scope: falsify or independently corroborate the
`## Mistakes` block of `corpus/lessons/round-57.md`. Two claims audited:

1. Each `## Mistakes` row carries `class` / `evidence` / `captured-by` / `fix`.
2. The names `R56-V1` / `R56-V2` / `R56-V3` resolve to the routed items of the
   spotcheck artifact `corpus/lessons/round-56-verifier-spotcheck.md`.

Both corroborated; no defects found in the audited surface.

## Commands run (read-only against lane)

- `sed -n '27,33p' corpus/lessons/round-57.md` — read Mistakes block.
- `awk 'NR>=29&&NR<=33{n=gsub(/\|/,"|");print NR": "(n-1)}'` — per-row arity → all
  rows = 4 data columns.
- `grep -n '^## ' corpus/lessons/round-56-verifier-spotcheck.md` — section map.
- `sed -n '22,32p' / '108,110p'` of the spotcheck — read the three routed items.
- `grep -n 'round-56-verifier-spotcheck' corpus/README.md` — README row exists.
- `grep -n 'round-56-verifier-spotcheck\|round-57' .ufo/pins/readme-map.json` —
  both files pinned in `covered`.
- `grep -n 'R56-V[123]' LOG.md` — routed-defect records present.
- `python3 -c "…len(d['items'])"` on `w1-spec.json` — `items: 64`.
- `ls` on `w1-spec/w1-validate/w1-taskcall/w1/swarm-registry.json` — all present.

Full captured output: `.ufo/waves/round-57/build/ScribeMistakes/mistakes-audit.txt`
and `…/evidence-crosschecks.txt`.

## Finding 1 — row shape (PASS)

The `## Mistakes` table (lesson lines 28–33) has a 4-column header
`class | evidence | captured-by | fix` plus separator; the three data rows each
emit exactly 4 data columns (arity check above). No malformed/short row.

| class | evidence | captured-by | fix |
|---|---|---|---|
| coverage-map drift | R56-V3 (… §6) | `none` until this round | R57-1 |
| stale frozen literal | R56-V2 (same artifact §1) | `none` | R57-2 |
| process carry | R56-V1 (same artifact §1) | n/a — orchestrator ruling | R57-3 |

Each row carries all four cells; the `fix` cells name the R57-1/2/3 bindings,
which match the plan §Routed-defect answers verbatim.

## Finding 2 — name resolution (PASS)

The three names resolve to the spotcheck artifact's routed items, and the
lesson rows cite the correct section of that artifact:

- **R56-V1** — defined in the spotcheck §1 *Defects* block (lines 23–28: "the §3
  L2 floor is unmet — … prepared-but-undispatched") and re-listed in §6 item 1
  ("L2 floor unmet this round (prepared-but-undispatched wave)"). Lesson row 3
  cites it as "(same artifact §1)" — correct: the canonical definition lives in
  §1. Fix `R57-3` = prepared-wave convention, matching spotcheck §6 item 1's
  "dispatch, or record an explicit orchestrator ruling."
- **R56-V2** — defined in spotcheck §1 *Defects* (lines 29–32: "frozen A54
  (exactly-24 items) and A55 (exactly-25) read `UNMET 9/10` at the close
  revision") and re-listed in §6 item 2. Lesson row 2 cites it as "(same
  artifact §1)" — correct. Fix `R57-2` = the amended A57 B7 supersession
  convention, matching spotcheck §6 item 2's "established counter-amendment
  convention."
- **R56-V3** — defined ONLY in spotcheck §6 item 3 (lines 108–110: "this
  artifact lands without a `corpus/README.md` map row … Add the row next
  round"). Lesson row 1 cites it as "(… §6)" — correct: §6 is its sole
  definition site. Fix `R57-1` = the `readme-map` gate + the restored README row.

All three names appear in the lesson (B9 arm of the frozen A57 counter requires
`/R56-V1/`, `/R56-V2/`, `/R56-V3/` in `round-57.md` — satisfied), and LOG.md
carries `R56-V2` + `R56-V3` records (lines 2201–2210), satisfying the B9 log
conjunct.

## Corroborating detail (independent, not asserted by the lesson alone)

- The R56-V3 repair is real: `corpus/README.md` line 168 now carries a row for
  `lessons/round-56-verifier-spotcheck.md`, and `.ufo/pins/readme-map.json`
  lines 130/132 pin both that file and `round-57.md` in `covered`.
- The "third recurrence" framing is consistent: README carries rows for every
  prior `round-NN-verifier-spotcheck.md` (r34–r56) — the r52 and r55 spotcheck
  files are present in the map, so the r56 file was the third of its class to
  land row-less (the r52/r55 rows were backfilled in their own rounds).
- The `R57-3` fix's named wave artifacts exist and the spec is the claimed size:
  `w1-spec.json` `items` array length = 64; `w1-validate.json`,
  `w1-taskcall.json`, `w1/swarm-registry.json` all committed.
- The gate-cited selftest cases named in fix `R57-1` (`uncovered`,
  `orphan-row`, `stale-covered`, `unpinned`) exist as DRIFT arms in
  `scripts/readme-map.mjs` (selftest cases 2,3,6,7 assert exit 1 with the
  named `*:…` reason).

## Out of scope / limits

- Did not re-run `readme-map.mjs` or the A57 probe — this seat audits the
  *text/table* of `## Mistakes`, not the gate's runtime verdict (other seats
  own B1–B10).
- Did not verify the historical r52/r55 drift events beyond README/git state —
  taken as documented class history, not re-measured.

## Verdict

`## Mistakes` is well-formed and the R56-V1/V2/V3 names resolve correctly to
the spotcheck artifact's routed items, with accurate §-level citations.
**Corroborated — no defect on this surface.**
