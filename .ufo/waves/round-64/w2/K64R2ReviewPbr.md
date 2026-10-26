VERDICT: The `readme-map` arm in `scripts/plan-before-ready.sh` (`2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`) has two HIGH bypasses (`map_first_add` walks `HEAD` with `tail -n 1` instead of `$plan`, letting a dropped gate pass as `MAP_PRE_EPOCH` exit 0; and `$plan:scripts/readme-map.mjs` executes unpinned with operator privileges, allowing a plan commit to self-certify a red map and bypass close-time `proxy-check`), three MEDIUM operability/epoch defects (`PBR_MAP_FROM` unvalidated, leading-zero `--rounds 08-09` crashing `((r=lo...))` with exit 0, default `MAP_FROM=65` shadowing `MAP_PRE_EPOCH`/`map=CLEAN` across rounds 41–64, leaked `/tmp/pbr-selftest.*` dirs and missing signal traps/`timeout -k`), and one LOW verdict-line grammar defect.

## Evidence

LSP check: `read xd://lsp` → `No such tool: xd://lsp` (literal `grep` used as fallback; not semantic proof). Tooling: no packages installed or updated.

1. **Integrated script digest & stale pins/docs (`2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8`):**
```
$ sha256sum /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh
ef726eaef83e7068c28ec3e5e0dfc7732337ee7f4c72eaa6db054d1ed40324a0  /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh
$ grep -n 'pin.plan-before-ready' /home/vgpnk/Projects/shokunin/kumitate-shokunin/SCORECARD.md
332:pin.plan-before-ready=fdc10c4b91a3f59b1452ced06104c4fb03ad6130132cf83f3a8b32b8f3898fc9
```

2. **Default `--all` vs `PBR_MAP_FROM=0` (`MAP_FROM=65` shadows `MAP_PRE_EPOCH` on 41–56 and `map=CLEAN` on 57, 59):**
```
$ bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh --repo /home/vgpnk/Projects/shokunin/kumitate-shokunin --all | tail -n 3
PLAN_BEFORE_READY: PASS rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 round=63 dir=.ufo/waves/round-63 plan=b38a2065ab8ac5b198f6569b9013d04411c3d40d plan_ct=1792961253 marker=05b3176915de4175bb211b4b1422d8e56cf16888 marker_kind=ready marker_ct=1792964033 marker_path=.ufo/waves/round-63/w1.ready map=SKIP reason=MAP_PRE_EPOCH_ROUND
PLAN_BEFORE_READY: PASS rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 round=64 dir=.ufo/waves/round-64 plan=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef plan_ct=1792967888 marker=d92cf1fff3026087a0e21a3183b97de169c6f22c marker_kind=ready marker_ct=1792970647 marker_path=.ufo/waves/round-64/w1.ready map=SKIP reason=MAP_PRE_EPOCH_ROUND
PLAN_BEFORE_READY_SUMMARY: pass=13 fail=7 na=10 rounds=all(30) rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 exit=1 failed=35,36,37,38,39,40,62 na_rounds=49,52,53,54,55,56,57,58,59,60 map_red=
$ PBR_MAP_FROM=0 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh --repo /home/vgpnk/Projects/shokunin/kumitate-shokunin --all | tail -n 1
PLAN_BEFORE_READY_SUMMARY: pass=10 fail=12 na=8 rounds=all(30) rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 exit=1 failed=35,36,37,38,39,40,58,60,61,62,63,64 na_rounds=49,52,53,54,55,56,57,59 map_red=58,60,61,63,64
```

3. **`MAP_ABSENT` bypassed when `HEAD` predates the gate (`--rev`) or when a merged branch has an older add (`tail -n 1`):**
```
PLAN_BEFORE_READY: PASS rev=c1d242a2d6b5cce07fea095b6828ef9569d0aeda round=70 dir=.ufo/waves/round-70 plan=3e59ab0cc8f998472227cd916d1db2749fd7937b plan_ct=1000000200 marker=c1d242a2d6b5cce07fea095b6828ef9569d0aeda marker_kind=ready marker_ct=1000000300 marker_path=.ufo/waves/round-70/w1.ready map=SKIP reason=MAP_PRE_EPOCH
PLAN_BEFORE_READY_SUMMARY: pass=1 fail=0 na=0 rounds=70-70 rev=c1d242a2d6b5cce07fea095b6828ef9569d0aeda exit=0 failed= na_rounds= map_red=
rc=0
```

4. **Self-certifying `$plan:scripts/readme-map.mjs` over a red map (restored before tip) & permissive `CLEAN` regex:**
```
PLAN_BEFORE_READY: PASS rev=fc05109b0b8bab65cd58a94f845622f23e4a943d round=65 dir=.ufo/waves/round-65 plan=2c5c6e52374202a622da52981790c3a000726247 plan_ct=1000000100 marker=fc05109b0b8bab65cd58a94f845622f23e4a943d marker_kind=ready marker_ct=1000000200 marker_path=.ufo/waves/round-65/w1.ready map=CLEAN files=1 rows=1 covered=1
rc=0
PLAN_BEFORE_READY: PASS rev=2835e6d75579d752a3d9c8cfab237341e5d392a6 round=65 dir=.ufo/waves/round-65 plan=2835e6d75579d752a3d9c8cfab237341e5d392a6 plan_ct=1000000100 marker=2835e6d75579d752a3d9c8cfab237341e5d392a6 marker_kind=ready marker_ct=1000000100 marker_path=.ufo/waves/round-65/w1.ready map=CLEAN files=? rows=? covered=?
rc=0
```

5. **Unvalidated `PBR_MAP_FROM` and leading-zero octal crash (`--rounds 08-09` exits `0 PASS` with 0 rounds judged):**
```
$ bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh --repo /home/vgpnk/Projects/shokunin/kumitate-shokunin --rounds 08-09; echo "rc=$?"
/home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh: line 526: ((: 08: value too great for base (error token is "08")
PLAN_BEFORE_READY_SUMMARY: pass=0 fail=0 na=0 rounds=08-09 rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 exit=0 failed= na_rounds= map_red=
rc=0
$ PBR_MAP_FROM=round-65 bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh --repo /home/vgpnk/Projects/shokunin/kumitate-shokunin --round 64; echo "rc=$?"
PLAN_BEFORE_READY: FAIL rev=2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 round=64 dir=.ufo/waves/round-64 reason=MAP_DRIFT plan=dd1a3e6f19dc82c54ef67864c9ba87e4eb7c24ef plan_ct=1792967888 marker=d92cf1fff3026087a0e21a3183b97de169c6f22c marker_kind=ready marker_ct=1792970647 marker_path=.ufo/waves/round-64/w1.ready map=DRIFT map_exit=1 map_first=uncovered:lessons/round-63-verifier-spotcheck.md
rc=1
```

## Findings

- **K64R2ReviewPbr-1 (HIGH) — `map_first_add()` queries `HEAD` instead of `$plan` and takes `tail -n 1` across all history, letting a dropped gate (`MAP_ABSENT`) pass with `map=SKIP reason=MAP_PRE_EPOCH` (`exit 0`).**
  - *Attacks:* `scripts/plan-before-ready.sh:149-166`, `corpus/QUALITY.md:1021-1022`. Unlike `oldest_add()` (`:127`), `map_first_add()` (`:150`) runs `git -C "$1" log --full-history --diff-filter=A --format='%H' -- "$MAP_GATE" | tail -n 1` without a revision argument (walking `HEAD`). (a) When `--rev <tip>` is passed while `HEAD` is checked out before the gate's introduction, `gate_sha` is empty; (b) even at `HEAD=<tip>`, if a merged branch has an older `--diff-filter=A` commit for `scripts/readme-map.mjs` that is not an ancestor of `$plan`, `tail -n 1` picks that non-ancestor commit and `merge-base --is-ancestor` returns 1. In both cases a round >= 65 that deletes `scripts/readme-map.mjs` at `$plan` exits `0 PASS` (`MAP_PRE_EPOCH`). Also, `cat-file -e "$plan:$MAP_GATE"` (`:157`) succeeds when `$plan:$MAP_GATE` is a directory or symlink.
  - *Reproduce:* `D=$(mktemp -d) && git -C "$D" init -q && [ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] && mkdir -p "$D/scripts" "$D/.ufo/waves/round-70" && printf 'x\n' > "$D/README.md" && git -C "$D" add README.md && git -C "$D" -c user.name=t -c user.email=t@t commit -q -m c0 && B=$(git -C "$D" rev-parse HEAD) && printf 'process.exit(0);\n' > "$D/scripts/readme-map.mjs" && git -C "$D" add -A && git -C "$D" -c user.name=t -c user.email=t@t commit -q -m c1 && git -C "$D" rm -q scripts/readme-map.mjs && printf 'p\n' > "$D/.ufo/waves/round-70/plan.md" && git -C "$D" add -A && git -C "$D" -c user.name=t -c user.email=t@t commit -q -m c2 && printf 'r\n' > "$D/.ufo/waves/round-70/w1.ready" && git -C "$D" add -A && git -C "$D" -c user.name=t -c user.email=t@t commit -q -m c3 && T=$(git -C "$D" rev-parse HEAD) && git -C "$D" checkout -q "$B" && bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh --repo "$D" --rev "$T" --round 70; echo exit=$?; rm -rf "$D"`

- **K64R2ReviewPbr-2 (HIGH) — Unpinned execution of `$plan:scripts/readme-map.mjs` inside `cd "$t"` runs arbitrary archived code with operator privileges and lets a plan commit self-certify a red map while still passing close-time `proxy-check`.**
  - *Attacks:* `scripts/plan-before-ready.sh:171-178`, `corpus/QUALITY.md:1014-1018`. `map_at_plan()` extracts `$plan` into `$t`, `cd`s into `$t` before resolving `timeout`/`node` from `PATH`, and executes `$t/scripts/readme-map.mjs` with operator privileges. Nothing in `plan-before-ready.sh` checks `sha256($plan:scripts/readme-map.mjs)`, and `proxy-check.mjs` (`pin.readme-map` in `SCORECARD.md`) only checks `scripts/readme-map.mjs` at the **tip** revision. A plan commit that replaces `scripts/readme-map.mjs` with a 1-line `README_MAP: CLEAN` stub (or arbitrary code) and restores the real script in a later commit before close passes both `plan-before-ready.sh` (`PASS` exit 0) and close-time `proxy-check` (`MATCH` exit 0). If `$plan:scripts/readme-map.mjs` is a symlink (`120000`) to an outside file, `tar -x -C "$t" --no-same-owner` extracts the symlink and `node` executes the outside target.
  - *Reproduce:* `D=$(mktemp -d) && git -C "$D" init -q && [ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] && mkdir -p "$D/scripts" "$D/corpus/lessons" "$D/.ufo/waves/round-65" && printf '# uncovered\n' > "$D/corpus/lessons/u.md" && printf 'process.stdout.write("README_MAP: CLEAN files=1 rows=1 covered=1\\n");\n' > "$D/scripts/readme-map.mjs" && printf '# plan\n' > "$D/.ufo/waves/round-65/plan.md" && git -C "$D" add -A && GIT_COMMITTER_DATE="@1000000100 +0000" git -C "$D" -c user.name=t -c user.email=t@t commit -q -m plan && cp /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/readme-map.mjs "$D/scripts/readme-map.mjs" && printf 'r\n' > "$D/.ufo/waves/round-65/w1.ready" && git -C "$D" add -A && GIT_COMMITTER_DATE="@1000000200 +0000" git -C "$D" -c user.name=t -c user.email=t@t commit -q -m ready && bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh --repo "$D" --round 65; echo exit=$?; rm -rf "$D"`

- **K64R2ReviewPbr-3 (MEDIUM) — Unvalidated `PBR_MAP_FROM` (`[ "$round" -lt "$MAP_FROM" ] 2>/dev/null`) and leading-zero octal crash in `norm_round` / `((r=lo; r<=hi; r++))`.**
  - *Attacks:* `scripts/plan-before-ready.sh:116-123, 147, 254-256, 526`. (a) `MAP_FROM="${PBR_MAP_FROM:-65}"` is never validated: non-numeric values like `PBR_MAP_FROM=round-65` or `PBR_MAP_FROM=abc` cause `[ "$round" -lt "$MAP_FROM" ] 2>/dev/null` to exit 2 (false) and silently enforce the arm on all rounds (as if `0`), while `PBR_MAP_FROM=999` silently skips round 65+. (b) `norm_round()` accepts leading zeros (`08`, `09`); `--rounds 08-09` crashes `for ((r=lo; r<=hi; r++))` at `:526` with `((: 08: value too great for base`, skips the loop, and exits `0 PASS` (`pass=0 fail=0 na=0`).
  - *Reproduce:* `bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh --repo /home/vgpnk/Projects/shokunin/kumitate-shokunin --rounds 08-09; echo exit=$?`

- **K64R2ReviewPbr-4 (MEDIUM) — Default `MAP_FROM=65` shadows `MAP_PRE_EPOCH` and `map=CLEAN` on rounds 41–64, contradicting header/usage and `corpus/QUALITY.md` Q60; `SCORECARD.md:332`, `SKILL.md:628`, and `.ufo/waves/round-64/close/plan-before-ready-r64.txt` are stale or missing.**
  - *Attacks:* `scripts/plan-before-ready.sh:39-42, 87-88, 254-256, 298`, `corpus/QUALITY.md:1034, 1042-1046`, `SCORECARD.md:332`, `SKILL.md:628`. Because `[ "$round" -lt "$MAP_FROM" ]` runs before `map_at_plan()`, default `--all` prints `map=SKIP reason=MAP_PRE_EPOCH_ROUND` for every round 41–64 (`map_red=` empty), contradicting `:39-42, 87-88` and `corpus/QUALITY.md:1042-1046` (which say rounds 41–56 read `MAP_PRE_EPOCH` and 57, 59 read `CLEAN`). `corpus/QUALITY.md:1034` cites `.ufo/waves/round-64/close/plan-before-ready-r64.txt` (absent at `2ed8a5f8`), `SCORECARD.md:332` still pins `fdc10c4b…` instead of `ef726eae…`, `SKILL.md:628` still says `PASS (10/10)` (and `build/K64ScribeLogSkill/skill-rows.md` does not update row 628), and `run_selftest()` (`:298`) sets `MAP_FROM=0` without testing `MAP_PRE_EPOCH_ROUND`.
  - *Reproduce:* `bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh --repo /home/vgpnk/Projects/shokunin/kumitate-shokunin --all | grep -E 'round=(41|57|64) '` and `test -e /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-64/close/plan-before-ready-r64.txt; echo exit=$?`

- **K64R2ReviewPbr-5 (MEDIUM) — `--selftest` leaks `/tmp/pbr-selftest.XXXXXX` (16 git repos) on every run, `map_at_plan()` has no signal trap for `/tmp/pbr-map.XXXXXX`, and `timeout 300` without `-k` hangs if `SIGTERM` is trapped.**
  - *Attacks:* `scripts/plan-before-ready.sh:169-179, 300-478`. `run_selftest()` never removes `$root`; `map_at_plan()` installs no `INT`/`TERM`/`HUP` trap to remove `$t`; `timeout 300` (`:175`) omits `-k` (`--kill-after`), so a script that traps `SIGTERM` hangs forever after 300s (and the `else` fallback has no bound).
  - *Reproduce:* `out=$(bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh --selftest | tail -n 1); d="${out##*fixtures=}"; ls -ld "$d"; rm -rf "$d"`

- **K64R2ReviewPbr-6 (LOW) — Verdict-line `key=value` grammar collisions (duplicate `reason=` keys, unescaped spaces in `map_reason=`/`map_first=`, and permissive `README_MAP: CLEAN ` prefix match).**
  - *Attacks:* `scripts/plan-before-ready.sh:155, 170, 172, 181-204, 253-290`. No `scripts/*.mjs` parses `PLAN_BEFORE_READY:` lines, but every `FAIL`/`NA` line with `map=SKIP` or `map=UNRUNNABLE` emits two `reason=` tokens (e.g. `reason=NO_PLAN … map=SKIP reason=NO_PLAN`), `PASS` lines for rounds 41–64 emit `reason=MAP_PRE_EPOCH_ROUND`, `map_reason=$fc` / `map_first=$first` contain raw spaces, and `grep -q '^README_MAP: CLEAN '` (`:181`) accepts `README_MAP: CLEAN bogus` (exit 0) as `PASS … map=CLEAN files=? rows=? covered=?`.
  - *Reproduce:* `D=$(mktemp -d) && git -C "$D" init -q && [ "$(git -C "$D" rev-parse --show-toplevel)" = "$D" ] && mkdir -p "$D/scripts" "$D/.ufo/waves/round-65" && printf 'process.stdout.write("README_MAP: CLEAN bogus\\n");\n' > "$D/scripts/readme-map.mjs" && printf 'p\n' > "$D/.ufo/waves/round-65/plan.md" && printf 'r\n' > "$D/.ufo/waves/round-65/w1.ready" && git -C "$D" add -A && git -C "$D" -c user.name=t -c user.email=t@t commit -q -m c && bash /home/vgpnk/Projects/shokunin/kumitate-shokunin/scripts/plan-before-ready.sh --repo "$D" --round 65; echo exit=$?; rm -rf "$D"`

## Artifacts

- `.ufo/waves/round-64/build/K64R2ReviewPbr/plan-before-ready.patch` — minimal unified diff fixing `norm_round` base-10 normalization, `PBR_MAP_FROM` validation, `map_first_add "$repo" "$plan"`, regular-file blob check, pre-`cd` binary resolution, `timeout -k 5 300`, strict `CLEAN` regex, temp-dir cleanup/traps, and selftest case 19 (`PASS (19/19)`).
- `.ufo/waves/round-64/w2/K64R2ReviewPbr.md` — this report.

## Limits

- `xd://lsp` is not mounted in this runtime (`No such tool: xd://lsp`), so caller checks across `scripts/*.mjs`, `corpus/QUALITY.md`, `SKILL.md`, and `SCORECARD.md` relied on `grep` rather than semantic indexing.
- I did not test real 300-second wall-clock timeouts or edit `scripts/plan-before-ready.sh`, `corpus/QUALITY.md`, `SKILL.md`, or `SCORECARD.md` (integration-owned by the L1).
