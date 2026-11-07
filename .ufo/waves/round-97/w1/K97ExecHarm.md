# K97ExecHarm — harm battery for the sources-check swap (K3)

Seat: K97ExecHarm. Sandbox lane: clone at freeze `38eb197c17de7ce0dc562539f2f31f41bea037ec`
(`/fast/scratch/hyaku/kumitate-r97/K97ExecHarm/lane`, verified toplevel = lane dir, detached).
BASE battery (`base.txt`): 7/9 tools CLEAN exit 0; `proxy-check` / `--strict` DRIFT exit 1 on the
known open-state bookkeeping (A_wave 1595→1598 delta +3 at freeze vs +1 at open `477afff7` — the
freeze commit itself adds plan/probe/controls bookkeeping; C2/C2_total 248→249 unchanged). Every
other verdict identical to `open/battery-before.txt`.
Candidate: builder bytes `K97ExecTool/sources-check.mjs` sha256
`d70870424c2bed2722b6291f5c49ef93bc9c9a832f1f3e2bc1bfc781d167fd73` (builder rewrote twice during
the run: first `318497b5…` had 12 wrong r97sec expectations → selftest 51/63 FAIL; selftest-fix
`4955a630…` 63/63; final `d7087042…` 66/66. READY was absent when this seat's work finished, so
bytes were taken from the builder dir; re-verify READY sha before integration).
`--json` BASE vs CAND on real lane (`--today 2026-11-07`, plain and `--strict`): byte-identical
(`json-cand-plain.txt`, `json-cand-strict.txt` vs `json-base-*.txt`, `cmp` exit 0), plain text
identical too. sources-check text verdict identical: `SOURCES_CHECK: CLEAN (rows=213 ...)`.

## Consumers of sources-check bytes/output (`consumer-analysis.txt`)
1. `scripts/proxy-check.mjs` — `GATE_PINS['pin.sources-check']` verifies SCORECARD
   `kumitate-gate-pins-v1` sha (`5402b210…` at freeze). Unpinned swap → `GATE_PIN_DRIFT`
   (declared 5402b210…, computed d7087042…). Integration must re-pin in SCORECARD (this is lookbook
   re-declaration under K3, not harm). Sandbox repin verified (`cand-proxy-repinned.txt`): after
   `sed` pin update, GATE_PIN_DRIFT vanishes; residual proxy findings = base set exactly
   (A_wave +3, C2/C2_total +1).
2. `scripts/harm-matrix-gates.json` — runs the tool and `--selftest`, verdict regexes
   `^SOURCES_CHECK: (\w+)` / `^SOURCES_SELFTEST: \d+/\d+ (\w+)`, clean `CLEAN`/`pass`. Candidate
   keeps both words; selftest count grows 46→66 (regex-tolerant). CAND selftest exit 0,
   `SOURCES_SELFTEST: 66/66 pass`, `VERDICT: PASS` (`selftest-cand.txt`).
3. `SKILL.md` (614, 730-731) — documents the CLI → verdict text contract only; preserved.
4. `scripts/counter-pins.mjs`, `round-gate.mjs`, `readme-map.mjs`, `spotcheck-adopt.mjs`,
   `.ufo/pins/*`: no reference to sources-check bytes. `round-gate` / `cite-sources` /
   `source-dupes` read `corpus/SOURCES.md` directly (bytes unchanged) — unaffected.
5. `round-gate.mjs` has its own SOURCES reader (`SOURCES_ROWS_OUTSIDE` info, non-finding); its
   `--tracked` / `--round 96` battery lines are SAME exit 0 at CAND.

## Battery diff (`battery-diff.txt`, `battery-diff-final.txt`, `cand.txt` = cand-final)
Per tool BASE vs CAND: proxy-check (DIFFERS = expected pin bookkeeping only), proxy-check --strict
(same), readme-map SAME, sources-check SAME, counter-pins SAME, spotcheck-adopt SAME,
round-gate --tracked SAME, round-gate --round 96 SAME, census validate SAME. Exit codes: only
proxy-check {1,1} pairs; all others {0,0}.

## Notes / risks
- Earlier `cand.txt` (4955a630 bytes) showed `A_DRIFT +17` and tail-truncated proxy lines; a
  clean rerun (`cand-final.txt`, full `--json`) shows A=37 both, no A_DRIFT. The +17 was sandbox
  harness noise during concurrent seat activity (untracked files in the shared clone path), not
  candidate-caused. `base.txt`/`cand-final.txt` are the citable pair.
- Candidate selftest spawns the fleet census via `cap-spawn` with an absolute
  `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh` fallback (else repo-relative). Passes
  here; if census absent it skips that one case. It is a new runtime dependency of `--selftest`
  (skip-path exists, so not fail-closed).
- Real registry is LF, column-zero single-space headings, no bare-`#`/CR rows — the R97 rule
  change is behavior-identical on it (proven by byte-identical `--json`), and behavior changes only
  on the census-grammar classes the frozen counter exercises.
- Sandbox mutation check: sandbox lane restored (`git status --porcelain` empty, sources-check
  back at `5402b210…`). Scratch under `/fast/scratch/hyaku/kumitate-r97/K97ExecHarm/` holds all
  receipts (base.txt, cand-final.txt, battery-diff.txt, json/txt base+cand, selftest-cand.txt,
  cand-proxy-repinned.txt, proxy-*-full.json, consumer-analysis.txt, interaction-notes.txt,
  attack-inventory.txt).
