DISTINCT selftest=104->UNRUN liveS=UNRUN liveR=UNRUN patch=/fast/scratch/kumitate-r35/w/ExecDistinct.patch

## Implementation
- Edited only `scripts/proxy-check.mjs` in the private clone `/fast/scratch/kumitate-r35/w/ExecDistinct/lane`; generated the requested patch at `/fast/scratch/kumitate-r35/w/ExecDistinct.patch` (154 lines).
- `scripts/proxy-check.mjs:87-94` now documents `S_sections`/`R_sections` as distinct `section.file` identities across their layer's in-family sections; outside-family and unresolved sections remain excluded.
- `scripts/proxy-check.mjs:588-603` now collects in-family file identities in per-layer `Set`s and uses their sizes both for the section terms and coverage calculations. Stanza keys, finding names, and exit behavior are unchanged.
- `scripts/proxy-check.mjs:1503-1572` adds three hermetic cases: S duplicate-one/drop-one expects only `S_SECTIONS_DRIFT`; R duplicate-one/drop-one expects only `R_SECTIONS_DRIFT`; control has three occurrences naming two files and expects a clean match with distinct count two.

## Retained evidence
- Before selftest output: `.ufo/waves/round-35/baseline/proxy-selftest.txt:1-3` records the command and baseline; lines 108-110 are `PROXY_SELFTEST: 104/104 pass`, `VERDICT: PASS`, `exit=0`.
- Baseline live terms: `.ufo/waves/round-35/baseline/proxy-json.txt:1-2` records the command and pinned upstream revision; lines 23-27 report `S_sections=86`, `R_sections=83` (and the corresponding member totals). `.ufo/waves/round-35/baseline/distinct.txt:9-12` independently records S occurrences/distinct `86/86` and R `83/83`.
- The after selftest and post-edit live values were not observed. Three new `check()` cases were added, so `104 -> 107` is an inference, not a run result; S=86/R=83 post-edit are likewise unverified.

## Commands and output
- `mkdir -p /fast/scratch/kumitate-r35/w/ExecDistinct && git clone --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin /fast/scratch/kumitate-r35/w/ExecDistinct/lane && git -C /fast/scratch/kumitate-r35/w/ExecDistinct/lane checkout -q -b r35-ExecDistinct 1770305fae20826b39905a8251ddeca6b4957ac4`
  Output: `Cloning into '/fast/scratch/kumitate-r35/w/ExecDistinct/lane'...` / `done.`
- `git -C /fast/scratch/kumitate-r35/w/ExecDistinct/lane diff 1770305fae20826b39905a8251ddeca6b4957ac4 > /fast/scratch/kumitate-r35/w/ExecDistinct.patch && wc -l /fast/scratch/kumitate-r35/w/ExecDistinct.patch`
  Output: `154 /fast/scratch/kumitate-r35/w/ExecDistinct.patch`
- Did not run `node scripts/proxy-check.mjs --selftest` or `node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src --json`: the fleet editing-wave rule assigns post-integration gates to the parent and forbids running tests during the wave. Parent should run both requested commands after integration; the exact last three selftest lines and live values remain a blocker to claiming verified completion.

## Risks and blockers
- `SCORECARD.md` was not edited; its proxy-check pin remains for the L1 to re-pin.
- No tools were installed. No other files in the lane, global configuration, or external substrate were changed.