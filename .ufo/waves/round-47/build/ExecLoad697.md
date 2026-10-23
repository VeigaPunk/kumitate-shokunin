RESULT ExecLoad697 rev=0bd8be60/cac43009 verdict=CAUSE_FOUND class=unstable(+timeout,+control-fail)
Item 697 root-cause test: which class makes `node scripts/gate-mutants.mjs` exit 2 under load, at which mutants, and do base (0bd8be60) and freeze (cac43009) differ at the same load. Answer: the exit-2 class under load is K43's `unstable` confirmation (dominant), with `timeout` under the synthetic load and one ambient `control-fail`; `crash` did not occur. Base reproduces the same classes, and no rev difference is possible in the measured code: both battery targets and the battery are byte-identical between the revs.
SETUP. Scratch /fast/scratch/hyaku/kumitate-r47/seats/w1-ExecLoad697; clones made with git-local env vars unset. `/usr/bin/node` is absent (first attempt: `timeout: failed to run command '/usr/bin/node'`, EXIT 127, 9 ms); every run used the existing fnm node /home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node. No tool was installed.
BYTE IDENTITY. `git diff --stat 0bd8be60 cac43009 -- scripts/cite-check.mjs scripts/wave-census.mjs scripts/gate-mutants.mjs` printed nothing (`stat_exit=0`); `git diff --quiet` gave `quiet_exit=0` and `freeze_quiet_exit=0`. Targets sha256: cite-check 7484274fff4c540f39d6df829708c86c78f25e803a4657ab4d7bae6d025acdf2, wave-census 76447250f9de1f7e9258d0dfe9544feba18d6c8723db37e77e6ca422235f45f4 — the digests of the round-46 CLEAN header.
COMMANDS. Each run: `KUMITATE_GATE_MUTANTS_TMP=<scratch>/gmtmp systemd-run --user --scope --quiet -p MemoryMax=6G -p TasksMax=512 timeout -s KILL 1200 <node> scripts/gate-mutants.mjs`; load before/after from `cat /proc/loadavg`; wall from timestamps. Loaded runs: `systemd-run --user --scope --quiet -p CPUQuota=800% -p MemoryMax=2G stress-ng --cpu 8 --timeout <N>s` started 5 s before the battery; N=105 s for the first pair (measured ambient battery duration 74 s + 30), N=215 s for the second pair (B3 under load ran 187 s, so its stress tail had ended). Never two batteries at once.
RUN TABLE (A=base, B=freeze; full stdout kept per receipt path in the scratch seat dir).
| run | rev | load before -> after | wall ms | exit | counts |
| A1 ambient | 0bd8be60 | 24.47 -> 28.20 | 4024 | 2 | control-fail=1 |
| B1 ambient | cac43009 | 20.68 -> 23.34 | 56469 | 2 | unstable=5 |
| A2 ambient | 0bd8be60 | 22.84 -> 35.52 | 73790 | 0 | CLEAN |
| B2 ambient | cac43009 | 32.74 -> 27.94 | 57401 | 0 | CLEAN |
| A3 load | 0bd8be60 | 26.99 -> 25.13 | 120827 | 2 | unstable=1 |
| B3 load | cac43009 | 23.92 -> 15.23 | 187125 | 2 | unstable=13 timeout=3 |
| A4 load | 0bd8be60 | 14.58 -> 19.00 | 59460 | 0 | CLEAN |
| B4 load | cac43009 | 21.82 -> 26.98 | 92561 | 2 | unstable=6 |
VERDICT LINES (verbatim, summary elided as ...):
A1 `GATE_MUTANTS: ERROR (mutants=0 killed=0 frozen=0/41 ... leftovers=0) drift=0 nomatch=0 crash=0 unstable=0 timeout=0 overflow=0 control-fail=1` exit=2
B1 `GATE_MUTANTS: ERROR (mutants=43 killed=38 frozen=36/41 ... leftovers=0) drift=0 nomatch=0 crash=0 unstable=5 timeout=0 overflow=0 control-fail=0` exit=2
A2 `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 ... leftovers=0)` exit=0
B2 `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 ... leftovers=0)` exit=0
A3 `GATE_MUTANTS: ERROR (mutants=43 killed=42 frozen=40/41 ... leftovers=0) drift=0 nomatch=0 crash=0 unstable=1 timeout=0 overflow=0 control-fail=0` exit=2
B3 `GATE_MUTANTS: ERROR (mutants=43 killed=27 frozen=27/41 ... leftovers=0) drift=0 nomatch=0 crash=0 unstable=13 timeout=3 overflow=0 control-fail=0` exit=2
A4 `GATE_MUTANTS: CLEAN (mutants=43 killed=43 frozen=41/41 ... leftovers=0)` exit=0
B4 `GATE_MUTANTS: ERROR (mutants=43 killed=37 frozen=37/41 ... leftovers=0) drift=0 nomatch=0 crash=0 unstable=6 timeout=0 overflow=0 control-fail=0` exit=2
ROWS, A1 (exit 2 before any mutant ran):
CONTROL cite-check FAIL exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false cases=75/76 floor=75
ROWS, B1 (ambient, freeze):
MUTANT cite-check:warn-total unstable cases=73/76 control=76 fail_lines=3 exit=1 verdict=FAIL group_clean=true fail_lines=3 overflow=false confirm=differs
MUTANT cite-check:strict-warn-arm unstable cases=74/76 control=76 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=differs
MUTANT cite-check:resolved-kind-gate unstable cases=75/76 control=76 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=differs
MUTANT cite-check:strict-conjunct unstable cases=75/76 control=76 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=differs
MUTANT wave-census:findings/F-M03 unstable cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=differs
ROWS, A3 (loaded, base):
MUTANT wave-census:findings/F-M20 unstable cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=differs
ROWS, B3 (loaded, freeze):
MUTANT cite-check:warn-total unstable cases=73/76 control=76 fail_lines=3 exit=1 verdict=FAIL group_clean=true fail_lines=3 overflow=false confirm=differs
MUTANT cite-check:strict-warn-arm unstable cases=74/76 control=76 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=differs
MUTANT cite-check:resolved-kind-gate unstable cases=75/76 control=76 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=differs
MUTANT cite-check:strict-conjunct unstable cases=75/76 control=76 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=differs
MUTANT cite-check:resolved>0 unstable cases=73/76 control=76 fail_lines=3 exit=1 verdict=FAIL group_clean=true fail_lines=3 overflow=false confirm=differs
MUTANT cite-check:render-env-zero unstable cases=73/76 control=76 fail_lines=3 exit=1 verdict=FAIL group_clean=true fail_lines=3 overflow=false confirm=differs
MUTANT cite-check:render-env-empty timeout cases=not-run/not-run control=76 fail_lines=0 timeout=60000ms group_clean=true
MUTANT cite-check:citeCheck-map timeout cases=not-run/not-run control=76 fail_lines=0 timeout=60000ms group_clean=true
MUTANT cite-check:guard-outer-ne-1 unstable cases=67/76 control=76 fail_lines=9 exit=1 verdict=FAIL group_clean=true fail_lines=9 overflow=false confirm=differs
MUTANT cite-check:suite-exit-text unstable cases=73/76 control=76 fail_lines=3 exit=1 verdict=FAIL group_clean=true fail_lines=3 overflow=false confirm=differs
MUTANT cite-check:suite-exit-json unstable cases=74/76 control=76 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=differs
MUTANT wave-census:findings/F-M23 unstable cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=differs
MUTANT wave-census:exits/M22-name-half-dropped unstable cases=8/32 control=32 fail_lines=24 exit=1 verdict=FAIL group_clean=true fail_lines=24 overflow=false confirm=differs
MUTANT cite-check:guard-outer-eq-undefined timeout cases=not-run/not-run control=76 fail_lines=0 timeout=60000ms group_clean=true
MUTANT wave-census:survivor/V382-pass-count unstable cases=32/32 control=32 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=differs
MUTANT wave-census:findings/F-M22 unstable cases=30/32 control=32 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=differs
ROWS, B4 (loaded, freeze):
MUTANT cite-check:guard-outer-eq-undefined unstable cases=74/76 control=76 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=differs
MUTANT cite-check:guard-outer-ne-1 unstable cases=74/76 control=76 fail_lines=2 exit=1 verdict=FAIL group_clean=true fail_lines=2 overflow=false confirm=differs
MUTANT wave-census:survivor/M04-empty-round unstable cases=16/32 control=32 fail_lines=16 exit=1 verdict=FAIL group_clean=true fail_lines=16 overflow=false confirm=differs
MUTANT cite-check:exit2-empty unstable cases=75/76 control=76 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=differs
MUTANT cite-check:exit2-zerores unstable cases=75/76 control=76 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=differs
MUTANT wave-census:exits/M19-selftest-exit-const unstable cases=31/32 control=32 fail_lines=1 exit=1 verdict=FAIL group_clean=true fail_lines=1 overflow=false confirm=differs
MECHANISM (identical bytes at both revs). `scripts/gate-mutants.mjs:697` `if (!agreed) state = 'unstable';` reclassifies a killed mutant whose immediate rerun has a different sorted `FAIL ` name set; `:545-548` lists `unstable` among the invalid states that return 2; `:149` gives the exit map; `:30` sets the per-run budget `TIMEOUT_MS = 60_000`. Every unstable row above killed its first run (exit=1, `verdict=FAIL`, normal FAIL count) and failed only `confirm=same`; the three timeouts hit the 60 s budget only under the synthetic load. The battery drops the confirmation run's stdout, so the exact flaking case is not observable, but rows such as B3 `guard-outer-ne-1` fail_lines=9 vs the normal 2 show the suites are not load-tolerant.
BASE VS FREEZE. Ambient pair: A1 base control-fail vs B1 freeze unstable=5 (different exit-2 subclass); A2 base CLEAN vs B2 freeze CLEAN. Loaded pair: A3 base unstable=1 vs B3 freeze unstable=13 timeout=3; A4 base CLEAN vs B4 freeze unstable=6. Because the two targets and the battery are byte-identical between the revs, the count differences are stochastic load noise, not a rev effect: both revs exit 2 through the same classes, and every frozen mutant is first-run killed at both revs (B1/B3/B4 frozen kills 36, 27, 37 of 41; A2/A4 41/41).
INTERPRETATION. The round-46 close failures (item 697 exit 2 in 4/4 at loads 19–56) are the battery's own K43 confirmation/control classes reacting to host load, reproducible at frozen base 0bd8be60 as well as at the freeze: a pre-existing load-sensitive flake, not a regression of this round. These receipts keep the battery's own stdout, the loads and the wall times (R46-3).
RISKS/LIMITS. Host load was not controlled (paired runs 14–35; A4 started at 14.58); the bounded 8-CPU synthetic load does not mimic every fleet spike that failed item 697; A3/B3's stress (105 s) ended before B3's 187 s tail, A4/B4 used 215 s. Full stdout: /fast/scratch/hyaku/kumitate-r47/seats/w1-ExecLoad697/{A1,B1,A2,B2,A3,B3,A4,B4}-*.txt (sha256 A1 9298d4e5…, B1 8202b976…, A2 52576c55…, B2 5b2b4640…, A3 fde61a66…, B3 c4b08193…, A4 80241bcc…, B4 e2fae790…). After the last run `pgrep -af w1-ExecLoad697` found nothing.
