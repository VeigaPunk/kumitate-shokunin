RESULT CtlCheckK5Baseline rev=a2e5b54c verdict=premise-holds scrub3=yes clearenv_noenv=yes prior_text=list

Control on the K5 baseline (plan.md § E7, K5): did round-44 practice really scrub exactly three variables on the clone line, did p44d pass `--clearenv` with no spawn env, and did any earlier round already prescribe the two named changes.

B1 Round-44 scrub: exactly three variables (GIT_DIR, GIT_WORK_TREE, GIT_INDEX_FILE), but NOT on the clone line only. controls-spec.json (blob ceefcb85…) context says "made with GIT_DIR, GIT_WORK_TREE and GIT_INDEX_FILE unset" and spells the same `env -u` prefix twice, once before `git clone` and once before `git -C <clone> checkout`; falsify-spec.json (ea385877…) and residual-dispatch.json (97ad837b…) match. Other git commands there are unsanitized: frozen-counter extraction runs `git -C /home/… show 292d9266:…` with no `env -u` (count of `env -u GIT_DIR … git -C /home` = 0). Rounds 42-43 wave specs use the same three-var form; rounds 35-41 never mention GIT_DIR.

B2 p44d: `git show 32b7fd56:.ufo/waves/round-44/probe/p44d-count.mjs` (= a2e5b54c bytes, sha256 9ea97d86…) has `--clearenv` in argv (1 hit) and spawns `spawnSync('bwrap', args, {encoding, timeout, killSignal, maxBuffer})` with no `env:` key (grep "env:" = 0; p44b also 0). Measured: launcher env -> 263 lines in sandbox `/proc/1/environ`, env:{PATH} -> 1, env:{} -> 0. `--clearenv` clears the sandboxed program's env only, not bwrap PID 1's.

B3 Earlier text: `local-env-vars` has exactly one repo hit at a2e5b54c, `.ufo/waves/round-45/plan.md:142` (the K5 line itself). `env -i` occurs in rounds 35, 36, 41, 43 but always before `node` (e.g. round-43/probe/c1-discriminators.sh:27), never before bwrap; the only file holding both "bwrap" and "env -i" is round-45/plan.md. prior_text is a list because the same mechanisms are already prescribed earlier under other spellings (D1, D2).

M1 Row (i) has teeth: ambient GIT_OBJECT_DIRECTORY=/nonexistent/objects gives "fatal: not a git repository" under the three-var scrub and resolves HEAD under the widened scrub; ambient GIT_ALTERNATE_OBJECT_DIRECTORIES=/nonexistent/alt gives "error: unable to normalize alternate object path" vs resolves HEAD. Both names are in the 15-name list.
M2 Row (ii) has teeth: same bwrap argv with a planted marker -> 264 environ lines under the launcher env, 1 under `env -i`, 0 under bare `env -i`; census env unchanged (HOME=/h PATH=/n/bin:/usr/bin).

D1 Defect, row (i). The 15-name list omits GIT_CEILING_DIRECTORIES, GIT_CONFIG_GLOBAL, GIT_CONFIG_SYSTEM (grep 0 each, git 2.56.0), so "widened" holds only against round-44 wave practice, not the lane corpus: round-42/build/SentinelGateMutants.md:130 (R3) requires nine names including those three, and round-36/build/ScoutPinDesign.md:63 says delete every GIT_-prefixed key. The shell form fails open: with git off PATH the substitution is empty, `unset` exits 0, GIT_DIR survives (measured after = /nonexistent/.git). Smallest safe correction: state the round-44 three-name baseline, cite round-36 and round-42 as prior wider prescriptions it does not restate, and record the fail-open mode.
D2 Defect, row (ii). The counter spawns bwrap from Node, so no shell sits in front of bwrap to carry `env -i`; the equivalent is the spawn `env:` option, already prescribed at corpus/lessons/round-44.md:129 ("the next counter passes an explicit minimal" env to spawnSync('bwrap', …)) and round-44/controls/SentinelSandboxEscape.md:29. Smallest safe correction: scope row (ii) to the shell-launched path, cite that passage instead of restating it, and do not present `env -i` as the fix for the frozen counter.
D3 Plan contradiction. plan.md R44-3 (line 71) says the lane runner will carry `--clearenv` while E7/K5 asks for `env -i` instead of `--clearenv` alone, and the working plan (d9ad287) defers that runner and runs no counter this round, so no artifact can exercise row (ii). Smallest safe correction: word K5 as a prescription for the next counter, or land a runner this round.
D4 Provenance. This round's dispatch already made change (i): a2-control-spec.json (blob dc3dc09a…, committed d9ad287) tells seats to "start your shell with `unset $(git rev-parse --local-env-vars)`"; the K5 line is byte-identical at a2e5b54c and d9ad287. Smallest safe correction: the entry records a change the round already made and adds the mechanism, instead of claiming to introduce it.

No judgment of the C1 entry (absent). Read-only against the lane; only this report written. Scratch /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlCheckK5Baseline/ (52 KB, no large temp files, no process of mine left: `pgrep -af a2-CtlCheckK5Baseline` printed nothing). Tools: node v24.21.0, git 2.56.0, bwrap 0.13.1, systemd 262; nothing installed. All runs under `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL …`.

Evidence:
  p44d | grep -c clearenv -> 1 ; grep -c "env:" -> 0 ; sha256 at 32b7fd56 = at a2e5b54c -> 9ea97d86…
  r44 contexts: `env -u … git clone` and `env -u … git -C … checkout` both present ; `env -u … git -C /home` -> 0
  git grep local-env-vars a2e5b54c -> plan.md:142 only ; git grep env -i a2e5b54c -> rounds 35,36,41,43 (node), plan.md
  git rev-parse --local-env-vars | wc -l -> 15 ; grep CEILING -> 0 ; CONFIG_GLOBAL/CONFIG_SYSTEM -> 0
  GIT_OBJECT_DIRECTORY ambient: 3-var -> fatal: not a git repository ; widened -> d9ad28701a9c…
  GIT_ALTERNATE_OBJECT_DIRECTORIES ambient: 3-var -> error: unable to normalize alternate object path ; widened -> d9ad28701a9c…
  git off PATH, unset $(git rev-parse --local-env-vars) -> unset_exit=0, GIT_DIR after=/nonexistent/.git
  bwrap PID1 environ launcher/env -i/bare -> 264/1/0 ; spawnSync inherited/env:{PATH}/env:{} -> 263/1/0
  p44d-style argv under env -i -> HOME=/h PATH=/n/bin:/usr/bin, exit 0
  man git-rev-parse -> "List the GIT_* environment variables that are local to the repository"
  diff plan.md "widened to" line a2e5b54c vs d9ad287 -> identical
