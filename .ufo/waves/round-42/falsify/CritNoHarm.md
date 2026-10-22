RESULT CritNoHarm rev=c9a084bf03fb043d3cce5da102fffbc023552a45 verdict=harm worse=1 (cite-check errors 553 -> 554; every other counted number held or improved)

Attacks: the no-harm reading of dfabe92 -> c9a084bf (Axes integers, proxy terms, cite-check, claims-check, sources-check, census, checklist). Clones: /fast/scratch/hyaku/kumitate-r42/falsify/CritNoHarm/{base,meas}, detached at dfabe92 and c9a084bf. S=/fast/scratch/hyaku/kumitate-pin/src. No tools installed.

The one worse number:
- `node scripts/cite-check.mjs --src $S --fleet /home/vgpnk/Projects/shokunin --strict`: base `CITE_CHECK: DRIFT (files=97 tokens=9430 errors=553 warnings=481)`, measured `(files=98 tokens=9465 errors=554 warnings=481)`, exit 1 on both.
- Per-file count of ERROR and WARN lines, ignoring line numbers: only `corpus/lessons/round-40-verifier-spotcheck.md` changes, ERROR 34 -> 35. The new line is `round-40-verifier-spotcheck.md:74 ERROR PIN_MISMATCH 5a7893cba3ea — content pin 5a7893cba3ea does not match sha256(scripts/anchor-truth.mjs)=f31ce40f9154…`.
- Cause: the R40-4 anchor-truth caps changed `scripts/anchor-truth.mjs` (sha256 5a7893cb… at open, f31ce40f… at measured). The round-40 note quotes the old sha as a bare hex next to the path, so cite-check reads it as a content pin. SKILL.md already states the rule this breaks: "superseded revisions are described, not pinned". This is not from C1 or C2; it is a routed-defect side effect that the commit does not record. ScribeKimiLocksEntry's cite-neutrality check was for the C2 drafts only.
- Smallest safe fix, checked in a scratch copy: patch /fast/scratch/hyaku/kumitate-r42/falsify/CritNoHarm/CritNoHarm-round40-pin.patch. It rewrites line 74 to "the anchor-truth gate has the same sha256 at both revisions". Result: `errors=553 warnings=481`, equal to base. A first try that only dropped the sha still left errors at 554, because the commit hex 5ae8ac9c on the same line was then read as the pin. The alternative is to name the +1 as a trade in the lesson.
- If cite-check runs without --fleet from a scratch clone, it reads 719 -> 722 errors and 554 -> 555 warnings. The extra +2 errors and +1 warning are location effects: AXES.md FLEET_MISSING, LEARNING.md UNRESOLVED and AXES.md:31-33 ORPHAN_REF, all in the new QUALITY.md rows. All three resolve against the real fleet tree.

Held or improved (base -> measured; same commands on both clones):
- `## Axes` integers: operability 8 -> 9. coverage, coverage:script-layer, coverage:runtime-layer and coverage:kimi-layer stay 10.
- `proxy-check --src $S --json`, every numeric field: A 9->10, C 17->19, operability 8->9, C2 92->94, C2_total 93->94, coverage 9->10, K_members 52->53, K_sections 52->53, errors 2->0, warnings 3->0, exit 1->0. No field went down.
- `proxy-check --src $S --strict`: base `PROXY: DRIFT (C2_TOTAL_DRIFT …; AXES_DRIFT …; 3 x PIN_UNPINNED)` exit 1. Measured `PROXY: MATCH (A=10 C=19 operability=9; … K=53/53 coverage:kimi-layer=10; pins=6 match)` exit 0.
- claims-check, default and `--strict`: output identical on both sides (`CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4)`, errors=0 warnings=4; strict DRIFT is the same on both). The `--json` numeric diff is empty.
- `sources-check` and `--strict`: CLEAN both sides, rows 38->45, tier A 37->42. Tier C 0->2 are S043 and S044, both REJECTED rows, so this is not weaker evidence. The fleet `sources-census.sh validate` gives exit 0 on both sides with the same pre-existing W04 (S034). `overdue`: zero overdue rows on both sides; cadence lines 38->45, one per row.
- `kimi-census`: base `DRIFT (UNLISTED locks)` exit 1; measured `CLEAN (members=53 checked=53 chain=8 info=4)` exit 0; `--json` rootEnum declared 26->27, strays 1->0, errors 1->0.
- anchor-truth: `TRUTH: CLEAN (anchors=811 true=778 debt=20 unchecked=13)` on both. surface-probe: identical DRIFT (errors=1 warnings=1) on both. `wave-census --round 41`: CLEAN on both. `round-gate --reports-dir .ufo/reports`: CLEAN on both.
- Selftests: none fell. anchor 42->44, census 48->52, proxy 116->121, wave-census 26->31. cite 75, claims 47, sources 46, round 60 and surface 45 are unchanged.
- cite-check `--selftest` wall time (R41-3 trade), 5 interleaved runs each: base 832/837/842/842/849 ms, measured 840/848/849/851/876 ms (median +7 ms, within noise).

Checklist pass count (`node scripts/surface-probe.mjs --checklists`). The reports dir is a scratch symlink to the fleet's `.ufo/reports`. Item 7 was re-run with `--main-repo /home/vgpnk/Projects/shokunin`, which uses read-only git.
- Base: 15/17. It fails item 8 (proxy DRIFT) and item 11 (census DRIFT). Item 7 reads `ROUND_GATE: CLEAN (mode=tracked checked=24)` on both sides.
- Measured: items 1-17 are 17/17 (measured with items 18-19 removed in a scratch copy). In that copy item 8 read `C_DRIFT declared=19 computed=17`, which my removal caused; in the unmodified clone item 8 is `PROXY: MATCH`, exit 0.
- Measured item 19, under the binding wrapper (setsid --wait, prlimit, timeout): `GATE_MUTANTS_SELFTEST: 23/23 pass leftovers=0`, `VERDICT: PASS`, exit 0.
- Measured item 18 is UNVERIFIED by me (the receipt says CLEAN). Three wrapped runs with `--jobs 1` all stopped at exit 2:
  - Run 1 (cap 1085): `GATE_MUTANTS: ERROR (… killed=15 frozen=15/41 …) crash=26 timeout=2`, with every crash `spawn /usr/bin/prlimit EAGAIN`.
  - Run 2 (cap 1124): `CONTROL cite-check FAIL timeout=60000ms`, `control-fail=1`.
  - Run 3 (cap 981): both controls PASS, then `killed=13 frozen=13/41 crash=29 timeout=1`. All 29 crashes are `spawn /usr/bin/prlimit` failures; the timeout is `cite-check:suite-any-fail`.
  - All three are host starvation: other seats' threads count against the same per-user cap (current + 64). Across the three runs, 0 mutants survived. Every mutant that actually ran was killed. The gate failed closed each time and did not count crashes as kills.
- So the pass count rose from 15/17 to at least 18/19.

Outside the numbers, for other seats: `scripts/gate-mutants.mjs:29` hard-codes `SCRATCH_TMPDIR = '/fast/scratch/hyaku/kumitate-r42/seats/ExecGateMutants/tmp'`. My runs wrote mutant temp trees into that other seat's directory, and other seats' runs are writing there at the same time.

Host safety: my first capped checklist run (pids 75915-75917) printed its verdict but hung without exiting, and I killed it. After every battery run, including the third, `pgrep -u $(id -u) -af CritNoHarm` matched 0 processes. Unrelated stray from another lane, not touched: pid 2717455 `python3 … kake-r30 … citing_set.py`.
