RESULT RevMistake3 rev=d5f67ee2 verdict=holds fails_on_row=yes passes_on_copy=yes captured_by_honest=yes

Re-run of the attempt-3 mistake's "shown able to fail" (round-45.md § Mistakes (attempt 3), class "a guard tested in one form is prescribed in another").

## Check reproduction (systemd-run --user --scope -p MemoryMax=2G -p TasksMax=64 timeout -s KILL 600)

1. Extraction:
   - `git show 6b2a4517:corpus/knowledge/agent-isolation-substrates.md | sed -n '162p'` -> row-3 cell; took text after `before any git command: ` (between backticks), unescaped `\|` -> `|`. Length 211 bytes.
   - `git show 6b2a4517:.ufo/waves/round-45/a2-control/SentinelSeatEnvScrub.md | sed -n '40p'` -> the tested line. Length 305 bytes (incl. trailing newline from sed; normalized via printf '%s' for cmp).
2. `cmp` of the two byte strings prints `GUARD_BYTES: DIFFER` — reproduces the lesson's claimed L1 run verbatim.
   diff shows the row's `_g=$(git rev-parse --local-env-vars) || exit; [ -z "$_g" ] || { mapfile -t _n <<< "$_g"; unset "${_n[@]}"; }; ...`
   vs receipt's `_git_local_env=$(git rev-parse --local-env-vars 2>/dev/null) || exit; [ -z "$_git_local_env" ] || { mapfile -t _git_local_env_names <<< "$_git_local_env" && unset "${_git_local_env_names[@]}"; } || exit; ...`
   — renamed vars, added `2>/dev/null`, and the chained `&& unset ... } || exit` the lesson cites.
3. Same check also passes: receipt line vs itself -> `SELF: SAME`; vs byte-exact `cp` copy -> `COPY: SAME`; guard vs itself -> `GUARD_SELF: SAME`. So the check discriminates (not vacuously DIFFER).
4. Defect severity independently evidenced: a3-falsify/AblScrubRow.md D1 shows the row's line fails open inline under `systemd-run` (`A=2 B=1`, exit 0; `${_n[@]}` expanded by systemd's argv env-expansion); D4 names this same receipt-fidelity mismatch.

## captured-by honesty (QUALITY Q1-Q32 at d5f67ee)

Read every criterion's Fails-when/Command at d5f67ee2. None checks byte-identity between a prescribed guard and its testing receipt:
- Q24 (closest: receipt names measured bytes, label==digest) governs the receipt's self-consistency; SentinelSeatEnvScrub carries rev=6b2a4517 header and its own digests — passes Q24 while the row's copy differs.
- Q18 is a reading norm, no command; Q20 pins verdict-expression guards of gates, not seat-environment prescriptions; Q26 concerns operability counters, not guard text; Q2/Q6 check citation existence/anchors, not byte equality; Q31 covers a counter's sandbox (M5/M6 scope), not row-3 prescription fidelity; Q1,Q3-Q17,Q19,Q21-Q23,Q25,Q27-Q30,Q32 unrelated.
- K1' (C1 checklist) binds row to effect, not bytes — explicitly stated in the lesson.
Conclusion: "Captured-by: none" is honest; no Q1-Q32 criterion would have caught the divergence.

Scratch: /fast/scratch/hyaku/kumitate-r45/seats/a3r-RevMistake3/ (guard-check.sh, row3-guard.txt, receipt-line40.txt, receipt-line40-copy.txt). No tools installed (pacman paused; nothing needed). No processes left running.
