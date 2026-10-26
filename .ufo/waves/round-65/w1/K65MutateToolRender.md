VERDICT: Of 36 single-literal mutants of the frozen `harm-matrix.mjs` render/summary/args/fixture code (bytes `6bde065f`, = `git show 2ca91a0c:scripts/harm-matrix.mjs`), 21 die on the bundled 26-case selftest, 10 more die with my 11 new cases (1 needs patch P1), all 16 frozen controls are killed by the frozen probe (14 via H2, 2 via H1's selftest run only), and the full frozen probe reads `HARM65_HELD held=5/5` at the restored bytes.

## Evidence

Subject: copy of `scripts/harm-matrix.mjs` at `6bde065f8b80a53c864be10fa6a5c30cbaeeafc29847d6a8b397144bf7ce7560`; `git show 2ca91a0c81542cad5f731049aa55dd2f99ade98d:scripts/harm-matrix.mjs | sha256sum` → same. Registry `harm-matrix-gates.json` (20 gates) and `harm-cases.json` (26 cases) copied beside it. Lane file never written by me.

Baseline: `node work/harm-matrix.mjs --selftest` → `HARM_MATRIX_SELFTEST: PASS (26/26)`, exit 0, 7.1 s.

Battery (`node mutate.mjs`, one mutant at a time, kill = non-zero exit with `HARM_MATRIX_SELFTEST: FAIL`, results `mutants-results.json`): `mutants=36 killed=21 survived=15 nofind=0`. All 36 found exactly once (occ=1). Survivors: `bad-sign-flip`, `carried-counter`, `moved-counter`, `new-counter`, `gone-counter`, `harm-print-counter`, `usage-cond-drop-tip`, `only-split-semi`, `timeout-regex-zero`, `timeout-regex-digit`, `same-rev-branch-off`, `toplevel-check-off`, `gates-default-path`, `selftest-label-swap` (exit 0, prints `FAIL (26/26)`), `selftest-exit-0`.

Killed examples (verbatim): `counted-absent-include … FAIL (24/26) fails=absent-both-skipped,all-absent-no-gates`; `no-gates-cond-lt … FAIL (25/26) fails=all-absent-no-gates`; `exit-map-invert … FAIL (5/26)`; `allow-empty-drop … FAIL (18/26)`; `add-u-tip … FAIL (24/26) fails=new-ok,new-red`; `usage-exit-2 … FAIL (25/26) fails=usage-missing-base`.

New cases (`new-cases.json`; run set `cases-plus.json` = 26+11): pristine + plus → `PASS (37/37)`. Survivor rerun (`mutants-results-plus.json`): `mutants=11 killed=10 survived=1`, e.g. `bad-sign-flip … FAIL (36/37) fails=mix-harm-new-red`; `carried/moved/new/gone/harm-print-counter … fails=<*-summary-pin>`; `timeout-regex-zero|digit … FAIL (35/37) fails=timeout-zero-usage,timeout-leading-zero-usage`; `only-split-semi … fails=only-multi-comma`; `usage-cond-drop-tip … fails=missing-tip-usage`. Remaining `same-rev-branch-off` dies only under patch P1: pristine-P1 + `cases-ext-p1.json` → `PASS (27/27)`; mutant-P1 → `CASE FAIL same-rev-summary-pin-patch-P1 … summary="…base=7afb897740d7 tip=664f87cb9b76"`, `FAIL (26/27)`. Patch P2 (`expect.stderr`): pristine-P2 + `cases-ext-p2.json` → `PASS (27/27)`; usage→stdout mutant → `CASE FAIL usage-stderr-pin-patch-P2 exit=64 … summary=null`, `FAIL (26/27)`.

Frozen H1 predicate on selftest mutants (node eval of `status===0 && /PASS \((\d+)\/(\d+)\)/` with `\1===\2` and n≥20): `selftest-label-swap exit=0 line=null frozen_H1=MISS`; `selftest-exit-0 exit=0 line="HARM_MATRIX_SELFTEST: PASS (26/26)" frozen_H1=HELD` (but on `cases-broken.json`: pristine prints `FAIL (1/2)` exit 1, mutant prints `FAIL (1/2)` exit 0 — the exit contract alone is broken; the PASS regex still guards H1).

Frozen-probe view of the 16 controls (probe's `build/runCase/h2` copied verbatim into `probe-run/h2-harness.mjs`; mutant committed in a scratch clone `git clone --no-hardlinks` of the lane at `2ca91a0c`, identity flags on every commit; `cases_missed` from h2):

| case | pinned mutant | H2-killed | selftest-killed |
|---|---|---|---|
| 01 honest-held | exit-map-invert | yes (16 cases miss) | yes (honest-held) |
| 02 repaired | `repaired=${n('HELD')}` | **no** (`why_n=0`) | yes (`repaired=1` pin) |
| 03 harm-verdict | `bad===0?'HARM':'CLEAN'` | **no** (`why_n=0`) | yes (01+03 pins) |
| 04 exit-code-clean-line | ok_exit check dropped | yes (case-04 `got exit=0 rows=["g1 HELD"]`) | yes |
| 05 no-verdict-line | no-hit→CLEAN | yes (case-05 HELD) | yes |
| 06 gate-deleted | `harmAbsent=n('GONE')` | yes (exit 0 vs 1) | yes |
| 07 new-ok / 08 new-red | NEW_OK↔NEW_RED swap | yes (both) | yes |
| 09 carried / 10 moved | CARRIED↔CARRIED_MOVED swap | yes (both, rows) | 10 only via rows (no summary pin) |
| 11 harm-timeout / 12 repaired-from-timeout | TIMEOUT→CLEAN | yes (both) | yes |
| 13 stderr-verdict-held | stderr scan dropped | yes (rows CARRIED) | yes |
| 14 last-verdict-wins | first-wins | yes (rows HELD) | yes |
| 15 absent-both-skipped | counted includes ABSENT_BOTH | **no** (`why_n=0`) | yes (`gates=1` pin) |
| 16 same-rev-held | HELD→HOLD | yes (6 cases) | yes |

All 16 are killed by the full frozen probe: 14 directly in H2, 3 summary-only mutants (02, 03-word, 15) only because H1 re-runs the bundled selftest inside the probe. H5's summary regex checks only `gates=`, `harm=`, `harm_absent=`, `new_red=` presence, not values, so `held/repaired/carried/moved/new/gone` value mutants are invisible to H5.

Full frozen probe, once, at the restored-pristine clone rev: `HARM65_HELD held=5/5 checks=5 rev=48a72f158148e7ee72654167e826fc67df520816 rule=H65`, exit 0.

Restoration: work copy sha256 after all runs = `6bde065f…` (unchanged); clone restore commit `48a72f15` with `git diff --quiet PRISTINE_REV RESTORED -- scripts/harm-matrix.mjs` → equal; 239 MB clone deleted. No installs were needed (node v24.21.0 present; no pacman/uv/npx use).

## Findings

1. **high — five summary counters are unpinned**: `carried=`, `moved=`, `new=`, `gone=`, `harm=` values can be swapped to any other `n('…')` and the bundled selftest stays 26/26 (`mutants-results.json` survivors `carried-counter`…`harm-print-counter`). Killing cases `carried-summary-pin`, `moved-summary-pin`, `new-summary-pin`, `gone-summary-pin`, `harm-count-pin` in `new-cases.json` — proven: each mutant FAILs only its pin case, pristine reads 37/37.
2. **high — the bad-sum is sign-unchecked**: `harm+harmAbsent-newRed` passes 26/26 because no case has HARM and NEW_RED together; a mixed transition reads CLEAN/exit 0. Case `mix-harm-new-red` (g1 HARM + g2 NEW_RED, expect exit 1 + `HARM_MATRIX: HARM gates=2`) kills it.
3. **medium — `--timeout` validation accepts junk**: regex mutants `^[0-9]*$` and `^\d+$` accept `0`/`07` (override silently dropped or set to 7) and skip usage-64; cases `timeout-zero-usage`, `timeout-leading-zero-usage` (expect exit 64) kill both.
4. **medium — missing `--tip` is misclassified**: `if (!base)` alone still runs and reads `REV_UNREADABLE` exit 2 where usage-64 is contracted; case `missing-tip-usage` pins 64.
5. **medium — the frozen probe's H2 ignores `expect.summary`** (it compares only exit + sorted rows): every summary-only mutant is H2-invisible, and controls 02/15 (plus 01/03's word pins) are caught solely via H1's selftest re-run. Any ratchet case without a summary pin adds no probe coverage beyond H1. New cases therefore pin every counter.
6. **low — same-rev fixture branch is invisible**: removing `if (c.same_rev)` changes nothing for case-16 (empty commit, same tree). Patch P1 adds `{BASE12}`/`{TIP12}` substitution into the selftest's `expect.summary` (`patch-P1-summary-substitution.diff`); case `same-rev-summary-pin-patch-P1` then FAILs the mutant with `base=7afb897740d7 tip=664f87cb9b76` visible in the FAIL line (proven above).
7. **low — `usage()` stream unpinned**: moving usage to stdout passes all cases; patch P2 adds `expect.stderr` support (`patch-P2-expect-stderr.diff`), case `usage-stderr-pin-patch-P2` kills it (proven).
8. **low — unkillable residuals** (schema-limited, reported not patched): `toplevel-check-off` (cases cannot shape fixture tmpdir paths), `gates-default-path` (`--gates` default `join(HERE,…)` never exercised — every case passes `--gates` explicitly; note `--cases` default is HERE-relative too), `selftest-exit-0` (self-referential; frozen H1's PASS-regex still guards, demonstrated `exit=0` with `FAIL (1/2)` on broken cases).
9. **info — the subject moved mid-round**: the lane working tree now carries a v2 rewrite (`ba35088ca5c7568e3bfd6c940d8b26242ed818e4b3a6e97c714dff67cef34c4a`, header `kumitate-harm-matrix-v2`, new strict flags/registry_added). All results above attach to the frozen-commit bytes `6bde065f` (2ca91a0c); the live v2 tool passes both the bundled 26/26 and my `cases-plus` 37/37, so the new cases land cleanly on v2 as well (L1 to integrate).

## Artifacts

- `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-65/w1/K65MutateToolRender.md` (this report)
- `…/build/K65MutateToolRender/new-cases.json` — 13 proposed cases (11 runnable now, 2 patch-gated)
- `…/build/K65MutateToolRender/patch-P1-summary-substitution.diff`, `patch-P2-expect-stderr.diff` (+ full copies `work/harm-matrix-p1.mjs`, `work/harm-matrix-p2.mjs`)
- `…/build/K65MutateToolRender/mutate.mjs`, `mutants-results.json`, `mutants-results-plus.json`
- `…/build/K65MutateToolRender/work/` (frozen-byte copies, `cases-plus/ext-p1/ext-p2/broken.json`, `probe-mut/` 16+2 case-pinned mutants)
- `…/build/K65MutateToolRender/probe-run/` (`h2-harness.mjs`, `drive.sh`, `h2-*.txt` 18 files, `full-probe-pristine.txt`, `baseline-selftest.txt`, `broken-*.txt`)

## Limits

- H2 view run for the 16 frozen controls only; per-mutant full-probe runs (H3/H4/H5 end-to-end) were not repeated — H1/H2 evidence stands in for them (probe internals quote-verified).
- `measure()`/`transition()` were mutated only at the 16 control-pinned points; no exhaustive fuzz of the classification table beyond that.
- Duplicate mutants c08/c10/c12 (same bytes as c07/c09/c11) re-ran H2 on identical commits — results duplicated, not conflicting.
- Host load ~50: selftest timings are observed values, not SLOs; the full probe was run once (6 min) as instructed.
- The three patch-gated cases are proven only against my patched copies in `work/`, not against any lane-integrated file.
