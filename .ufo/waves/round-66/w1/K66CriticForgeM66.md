VERDICT: M66 is forgeable — a single commit adding 3 real-URL/junk-teaches SOURCES rows, 3 real captures, and a semantically empty entry scores `DEPREC66_HELD held=8/8` (live M5 included, exit 0) while the pristine freeze control scores 0/8.

## Evidence

Forge commit (sandbox clone only, deleted after evidence capture): `0980890373678e9c6e3f5c8d0848f8ae14aded0d`, parent = freeze `621212bac37f8249c72ac982d1d6534cb8d60701`.

```
$ TMPDIR=<scratch> node .ufo/waves/round-66/probe/deprec66-probe.mjs <clone> 0980890...   # live, no --no-live
DEPREC66_HELD held=8/8 checks=8 rev=0980890373678e9c6e3f5c8d0848f8ae14aded0d rule=M66
EXIT=0

$ node .ufo/waves/round-66/probe/deprec66-probe.mjs <clone> 621212ba... --no-live   # negative control
DEPREC66_UNMET held=0/8 checks=8 rev=621212bac37f8249c72ac982d1d6534cb8d60701 rule=M66 | M1 MISS entry-absent | ... | M8 MISS ... province-names-entry=false
EXIT=1
```

Lane gates on the forge (all pass — M8's half): `SOURCES_CHECK: CLEAN (rows=148 ...)` exit 0; `SOURCE_CAPTURE: CLEAN captures=41 exemptions=107` exit 0; `README_MAP: CLEAN files=161 rows=161 covered=161` exit 0; fleet `sources-census.sh validate` exit 0 (same six carried W04, no new warnings). Verbatim outputs in `build/K66CriticForgeM66/forge-verdict.txt`.

Forge content: S207/S208/S209 rows whose scope/teaches are nonsense ("zeppelin quorum bucket saffron telescope carousel" / "wombat melodies calibrate the umbrella elastically"); an entry whose Scope and Bearing are junk prose carrying the M7 tokens; a Registry snapshot that transcribes the capture's 6 rows verbatim. All 6 located quotes verified as substrings of both capture and live page (`build/K66CriticForgeM66/quote-check.txt`).

## Findings

- **K66CriticForgeM66-1 (high; attacks M2/M1 semantics-free rows).** M2 reads cell count, `mined`, opened, used-by, tier, URL presence — never teaches/scope/anchor text. Real pages + junk cells pass. Reviewer catchable: yes on reading the row; no gate catches it. A plausible-but-wrong teaches is invisible to the whole chain.
- **K66CriticForgeM66-2 (high; attacks M4/M5 quote verification).** Quotes are checked as substrings of capture and live fetch, not as support for any claim. Six true-but-pointless quotes pass; nothing in the entry infers anything from them.
- **K66CriticForgeM66-3 (high; attacks M6 snapshot check).** M6 checks only the data-row count and that each capture row's `Deprecated in`/`Earliest removal` strings appear anywhere in the snapshot; the Feature column and row alignment are never read. Verbatim transcription passes with zero comprehension, and a mis-paired (Roots → `2025-03-26`) snapshot would also pass. Cheapest repro: `git apply` the diff in `build/K66CriticForgeM66/forge-diff.txt` on a freeze clone, commit, re-run the frozen probe.
- **K66CriticForgeM66-4 (medium; attacks M7 Bearing check).** Token presence only: "S201…S206 walk into a roots parade holding an HTTP+SSE umbrella sideways" satisfies the citation, `roots`, and `HTTP+SSE` tests. Reviewer catchable: instantly, on reading the section.
- **K66CriticForgeM66-5 (info; counter's real strength).** The byte-for-byte staged-theme do-nothing fails 0/8 (base/deprec66-donothing.txt): M2 new-since-base + M3 committed captures + M4 per-row bullets force genuine per-round re-grounding and live fetches. M66 buys evidence-chain presence, not comprehension — the plan's stated limit ("cannot tell a sound reading from a well-grounded wrong one") is demonstrably wider: a well-grounded non-reading scores full marks. The backstop must stay the assimilation Gate's read-verdict and non-author spot-checks, not the counter. Smallest safe correction: bind M6 snapshot rows positionally to capture rows as (feature, deprecated-in, earliest-removal) tuples; declare in the plan that C2 semantic soundness is Gate/spot-check judged, with the Gate admit required to quote the entry's claim sentence.

## Artifacts

- `.ufo/waves/round-66/build/K66CriticForgeM66/forge-verdict.txt` — both probe verdicts + gate outputs.
- `.ufo/waves/round-66/build/K66CriticForgeM66/forge-diff.txt` — full forge diff (7 files) against the freeze.
- `.ufo/waves/round-66/build/K66CriticForgeM66/forge-entry.md` — the forged entry.
- `.ufo/waves/round-66/build/K66CriticForgeM66/forge-holes.md` — hole-by-hole table + corrections.
- `.ufo/waves/round-66/build/K66CriticForgeM66/forge-stat.txt`, `quote-check.txt`.

## Limits

Judged the frozen counter only; no lane files were edited (clone deleted after evidence capture). M5 ran live once per verdict; page drift between capture and probe run is possible in principle (seconds apart here). The forge deliberately uses blatant junk to prove the mechanical gap; a subtler "plausible but wrong" entry would pass the same checks and be caught only by a human read — unmeasured beyond this demo. No tools installed.
