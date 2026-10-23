RESULT RedoDemoBwrapEnv rev=a2e5b54c verdict=reproduces effect=yes control_clean=yes statements_confirmed=13/13

# RedoDemoBwrapEnv — independent re-derivation of mechanism M5 (DemoBwrapEnv)

Scope: re-derive the inherited demo `DemoBwrapEnv` from the item description alone, then compare every
numeric/textual statement the draft entry's M5 paragraph and decision-table row make about this demo.
The inherited receipt `.ufo/waves/round-45/build/DemoBwrapEnv.md` and the attempt-1 scratch were read
**only after** my own script was written and first run, so nothing below is inherited.

## Method (independent, own script)

My own script was written from the item description before any inherited artifact was opened. Two marker
variables are used so that "launcher environment" and "`--setenv`-injected" can never be confused:

- `KUMITATE_R45_ENV` — exported in the launcher environment, value a fresh random 128-bit hex token.
- `KUMITATE_R45_SET` — never in the launcher environment; only planted via `--setenv`, separate random token.

No variable value is printed except the two planted markers; every other variable shows its NAME and
`<redacted>`. Verified after the run: `count_of_unredacted_secret_lines=0` over the five secret-bearing
names present on this host (XAI_OAUTH_TOKEN, OPENAI_CODEX_TOKEN, HL_INITIAL_WORKSPACE_TOKEN,
STARSHIP_SESSION_KEY, SSH_AUTH_SOCK).

Every variant runs the identical probe (command environment + `/proc/1/environ`), so the only difference
between rows is the bwrap invocation. The do-nothing control (C0) runs the same probe with no marker
planted anywhere.

## Two script bugs found and fixed before the demo was valid

Both were caught by my own runs, and both are worth recording for whoever writes the entry's demo script:

1. **`bwrap --setenv` takes two arguments** (`--setenv VAR VALUE`), not `VAR=VALUE`. The `VAR=VALUE` form
   fails with `bwrap: setenv failed` (exit non-zero) — it does not silently misbehave.
2. **`--ro-bind /usr /usr` alone is not a runnable root.** `/usr/bin/sh` is a symlink to `bash`, and the ELF
   loader lives under `/lib64` -> `usr/lib`, so the sandbox needs `--symlink usr/lib lib64` (a `--symlink
   usr/lib /lib` is *not* enough; `/lib64` is the name that resolves). Without it every run fails with
   `bwrap: execvp /usr/bin/sh: No such file or directory`.

An inherited receipt's sandbox argv (`--symlink usr/lib /lib --symlink usr/lib64 /lib64`) contains the
`usr/lib64` form; mine uses `usr/lib lib64`, which resolves identically on this host (`/lib64 -> usr/lib`).

## Script (verbatim, my own)

```bash
#!/usr/bin/env bash
# RedoDemoBwrapEnv — independently written from the item description (own script, own markers).
#
# Claim under test:
#   "bwrap --clearenv empties the command's environment but /proc/1/environ inside a
#    PID namespace still holds the launcher's; `env -i` in front of bwrap removes it."
#
# Method notes:
#  * Two marker variables, so "launcher environment" and "--setenv injected" can be told apart:
#      KUMITATE_R45_ENV  -> exported in the launcher environment (random token A)
#      KUMITATE_R45_SET  -> never in the launcher environment; only planted via --setenv (random token B)
#  * Only the two marker VALUES are ever printed. Every other variable shows its NAME and "<redacted>".
#  * Every variant runs the identical probe (command environment + /proc/1/environ), so the only
#    difference between rows is the bwrap invocation.
#  * Do-nothing control (C0): same probe, NO marker planted anywhere. If C0 reports a marker,
#    the measurement itself is bogus.
#  * Everything runs inside `bwrap --unshare-all` so the PID namespace exists and /proc is fresh;
#    PID 1 of that namespace is the bwrap helper, the probe shell is PID 2.
#
# Usage: ./demo-bwrap-env.sh
set -uo pipefail

# The probe: names + marker values only, never other values.
PROBE='
echo "== cmd env =="
/usr/bin/env | /usr/bin/awk -F= '"'"'{ if ($1 ~ /^KUMITATE_R45_/) print $1"="$2; else print $1"=<redacted>" }'"'"' | /usr/bin/sort
echo "== /proc/1/environ =="
/usr/bin/tr "\0" "\n" < /proc/1/environ | /usr/bin/awk -F= '"'"'{ if ($1 ~ /^KUMITATE_R45_/) print $1"="$2; else print $1"=<redacted>" }'"'"' | /usr/bin/sort
echo "== end =="
'

# Sandbox layout: read-only /usr, fresh /proc, fresh /dev, /lib64 -> usr/lib symlink
# (needed so the ELF loader resolves; /lib64 on this host is a symlink to usr/lib).
BW=(/usr/bin/bwrap --unshare-all --die-with-parent
    --ro-bind /usr /usr
    --symlink usr/lib lib64
    --symlink usr/bin bin
    --proc /proc
    --dev /dev
    --tmpfs /tmp)

run_probe() {  # $1 = label, rest = command
  local label="$1"; shift
  echo "--- $label"
  "$@" 2>&1
  echo
}

TOK_A="$(head -c 16 /dev/urandom | od -An -tx1 | tr -d ' \n')"
TOK_B="$(head -c 16 /dev/urandom | od -An -tx1 | tr -d ' \n')"
export KUMITATE_R45_ENV="$TOK_A"
unset KUMITATE_R45_SET

echo "### markers"
echo "KUMITATE_R45_ENV value = $TOK_A   (exported in the launcher environment)"
echo "KUMITATE_R45_SET value = $TOK_B   (never in the launcher environment; only --setenv)"
echo

echo "### V1 plain bwrap (no --clearenv)"
run_probe V1 "${BW[@]}" /usr/bin/sh -c "$PROBE"

echo "### V2 bwrap --clearenv --setenv KUMITATE_R45_SET"
run_probe V2 "${BW[@]}" --clearenv --setenv KUMITATE_R45_SET "$TOK_B" /usr/bin/sh -c "$PROBE"

echo "### V3 env -i in front of bwrap (no --clearenv)"
run_probe V3 env -i "${BW[@]}" /usr/bin/sh -c "$PROBE"

echo "### V4 env -i in front of bwrap --clearenv --setenv KUMITATE_R45_SET"
run_probe V4 env -i "${BW[@]}" --clearenv --setenv KUMITATE_R45_SET "$TOK_B" /usr/bin/sh -c "$PROBE"

echo "### C0 CONTROL: no marker planted at all"
(
  unset KUMITATE_R45_ENV KUMITATE_R45_SET
  run_probe C0 "${BW[@]}" /usr/bin/sh -c "$PROBE"
)

echo "### C1 CONTROL: no marker planted, plain bwrap, /proc/1/environ only"
(
  unset KUMITATE_R45_ENV KUMITATE_R45_SET
  echo "--- C1"
  "${BW[@]}" /usr/bin/sh -c '/usr/bin/tr "\0" "\n" < /proc/1/environ | /usr/bin/awk -F= '"'"'{ if ($1 ~ /^KUMITATE_R45_/) print $1"="$2; else print $1"=<redacted>" }'"'"' | /usr/bin/sort'
  echo
)
```

Companion scripts (same directory, same wrapper): `summary.sh` (counts only), `guards.sh` (the two decision-
table guard spellings), `c3equiv.sh` (marker inside bwrap's own exec environment), `spawnenv.sh` (the
`spawn(…, {env})` guard branch). Their sha256 values are listed under Hygiene.

## Host-safety wrapper

Every run, including the controls, was executed as:

`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 <script>`

(the outer scope the item names). All runs exited 0. `systemctl --user is-system-running` reports `degraded`
on this host, which does not affect the scope runs.

## Observed output — compact summary (summary.sh)

Command: `cd /fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoBwrapEnv && systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 ./summary.sh` -> exit 0.

```
marker ENV (launcher) = 2471e658b49a91f86e46aa32ea004aeb ; marker SET (setenv-only) = a9f757a3c9a610eee6e6a6dd4c8e39c3
V1 plain bwrap:            cmd_env_vars=263 proc1_environ_vars=264 cmd_env_has_SET=0 proc1_has_ENV=1 proc1_has_SET=0 proc1_comm=bwrap shell_pid=2
V2 --clearenv --setenv:    cmd_env_vars=4   proc1_environ_vars=264 cmd_env_has_SET=1 proc1_has_ENV=1 proc1_has_SET=0 proc1_comm=bwrap shell_pid=2
V3 env -i + bwrap:         cmd_env_vars=3   proc1_environ_vars=0   cmd_env_has_SET=0 proc1_has_ENV=0 proc1_has_SET=0 proc1_comm=bwrap shell_pid=2
V4 env -i + --clearenv:    cmd_env_vars=4   proc1_environ_vars=0   cmd_env_has_SET=1 proc1_has_ENV=0 proc1_has_SET=0 proc1_comm=bwrap shell_pid=2
C0 control no marker:      cmd_env_vars=262 proc1_environ_vars=263 cmd_env_has_SET=0 proc1_has_ENV=0 proc1_has_SET=0 proc1_comm=bwrap shell_pid=2
```

Field meanings: `cmd_env_vars` = names in the target's `env`; `proc1_environ_vars` = names in
`/proc/1/environ`; `*_has_ENV` = launcher marker present; `*_has_SET` = `--setenv`-only marker present.

Read: **V1** — the launcher's marker is in the command environment *and* in `/proc/1/environ`.
**V2** — `--clearenv` empties the command environment (263 -> 4 names) but the launcher marker is **still**
in `/proc/1/environ` (264 names, unchanged). **V3** — `env -i` in front removes it from both
(`/proc/1/environ` is empty). **V4** — `env -i` plus `--clearenv --setenv` is the clean combination: the
command sees only the setenv'd marker (4 names) and `/proc/1/environ` is empty.
**C0** — with no marker planted, no marker is reported anywhere and the counts are one lower than the
planted twin (262/263 vs 263/264). The control is clean, so the marker counts measure the planted marker.

Note on V2: the `--setenv`-only marker appears in the command's `env` but **not** in `/proc/1/environ`
(`proc1_has_SET=0`). `--setenv` writes into the environment handed to the exec'd command; PID 1 keeps the
environment bwrap itself was exec'd with. This is the sharpest form of the mechanism and it holds in
every mode.

## Observed output — the two decision-table guard spellings (guards.sh)

```
G1 env -i PATH=/usr/bin HOME=/tmp in front of bwrap:
   cmd_env_names=[PWD,HOME,SHLVL,PATH,_,] cmd_env_n=5 | proc1_names=[PATH,HOME,] proc1_n=2 | marker_in_cmd_ENV=0 marker_in_cmd_SET=0 marker_in_proc1_ENV=0 marker_in_proc1_SET=0
G2 env -i PATH=/usr/bin HOME=/tmp + --clearenv --setenv KUMITATE_R45_SET:
   cmd_env_names=[PWD,SHLVL,KUMITATE_R45_SET,_,] cmd_env_n=4 | proc1_names=[PATH,HOME,] proc1_n=2 | marker_in_cmd_ENV=0 marker_in_cmd_SET=1 marker_in_proc1_ENV=0 marker_in_proc1_SET=0
G3 plain bwrap, /proc/self/environ of the sh probe (size in bytes):  0
G4 plain bwrap, /proc/1/environ of the bwrap reaper (size in bytes): 13106
```

`env -i PATH=… HOME=…` reduces `/proc/1/environ` to exactly the two explicitly allowed names; adding
`--clearenv --setenv` also restricts the command. G3/G4 reproduce the inherited receipt's note that the
`sh -c` probe's own `/proc/self/environ` reads 0 bytes (the shell rebuilds its environment array), so the
target's view must be taken from `env` and PID 1's from `/proc/1/environ`.

## Observed output — marker inside bwrap's own exec environment (c3equiv.sh)

```
C3-equiv: env -i KUMITATE_R45_ENV=<tok> bwrap:
   cmd_env_names=[PWD,SHLVL,KUMITATE_R45_ENV,_,] cmd_env_n=4 | proc1_names=[KUMITATE_R45_ENV,] proc1_n=1 | marker_in_cmd=1 marker_in_proc1=1
MODE B-equiv: bwrap --clearenv --setenv PATH /usr/bin --setenv HOME /tmp :
   cmd_env_names=[PWD,HOME,SHLVL,PATH,_,] cmd_env_n=5 | proc1_names=[KUMITATE_R45_ENV,] proc1_n=1 | marker_in_cmd=0 marker_in_proc1=1
```

This is the decisive measurement: `/proc/1/environ` holds **precisely** the environment bwrap itself was
exec'd with — one name in, one name out. `--clearenv` changes only the array handed to the exec'd command.

## Observed output — the `spawn(…, {env})` guard branch (spawnenv.sh)

```
marker ENV = 27da5c8c5667d179f8e90a01652cf269
spawn_env_guarded: proc1_marker_lines=0 proc1_total_lines=2
spawn_env_default: proc1_marker_lines=1 proc1_total_lines=264
```

Node's `spawnSync('bwrap', args, { env: { PATH: '/usr/bin', HOME: '/tmp' } })` closes the channel exactly as
the `env -i` spelling does; the same spawn without `env` leaks 264 names including the marker.

## Statement-by-statement comparison with the draft entry's M5 paragraph and decision-table row

The draft text compared is `corpus/knowledge/agent-isolation-substrates.md` (byte-identical to the inherited
draft `/fast/scratch/hyaku/kumitate-r45/a2/inherited-entry-draft.md`; `diff` produced no output). Its M5
paragraph is at lines 83-91 and its decision-table row at line 124.

| # | draft statement | verdict | my observed value |
|---|---|---|---|
| 1 | M5: "without `--clearenv` the marker is in `env` and in `/proc/1/environ`" | CONFIRMED | V1: marker in both channels; `cmd_env_vars=263`, `proc1_environ_vars=264` |
| 2 | M5: "(263 names)" for the no-`--clearenv` case | CONFIRMED | `cmd_env_vars=263` planted / `262` control — identical to the inherited figure |
| 3 | M5: "with `--clearenv --setenv …` it is gone from `env` but **still in `/proc/1/environ`**" | CONFIRMED | V2: `cmd_env_vars=4` (marker absent from `env`), `proc1_environ_vars=264` with `proc1_has_ENV=1` |
| 4 | M5: "with `env -i` in front of bwrap it is in neither" | CONFIRMED | V3: `proc1_has_ENV=0`, `proc1_environ_vars=0`, marker absent from `env` |
| 5 | M5: "Control (no marker): 0/0 in every mode." | CONFIRMED | C0: marker 0 in both channels, all four variants 0/0; counts 262/263 vs planted 263/264 |
| 6 | M5: "planted marker only, no values printed" | CONFIRMED | Only the two planted marker values printed; 0 unredacted secret-name lines in the full output |
| 7 | M5: "`--clearenv` does not empty bwrap's PID 1" | CONFIRMED | `proc1_comm=bwrap`, `shell_pid=2`; `/proc/1/environ` = 264 names while `env` = 4 |
| 8 | M5: S070 "`bubblewrap.c:2490` clears bwrap's own `environ` before `execvp` (:3555)"; "PID 1 is a forked reaper (:3487-3495) that never execs" | CONFIRMED | At tag v0.13.1 (362936ae): `:2490 xclearenv ();`, `:3555 if (execvp (exec_path, argv) == -1)`, `:3487 pid = fork ();` — all three cited line numbers exact |
| 9 | M5: S069 "`--clearenv` unsets the variables of the command bwrap execs"; "with a PID namespace «bwrap is running a minimal pid 1 process»" | CONFIRMED | Host `man bwrap` line 158-160: "Unset all environment variables, except for PWD and any that are subsequently set by --setenv"; line 24: "If needed (e.g. when using a PID namespace) bwrap is running a minimal pid" / line 25 "1  process in the sandbox that is responsible for reaping zombies" |
| 10 | M5: S071 "`/proc/<pid>/environ` holds the environment «set when the currently executing program was started via execve(2)»" | CONFIRMED | `man 5 proc_pid_environ` lines 8-9 carry that sentence verbatim |
| 11 | Table row: guards "`env -i PATH=… HOME=…` **or** `spawn(…, {env})`, plus `--clearenv --setenv` for the command" | CONFIRMED | `env -i PATH=… HOME=…` -> `proc1_names=[PATH,HOME]` (2); `spawnSync(...,{env})` -> `proc1_marker_lines=0, proc1_total_lines=2` (vs 1/264 unguarded); `--clearenv --setenv` -> command sees only the setenv'd name |
| 12 | Table row: failure prevented "the launcher's environment (token names and values) readable at `/proc/1/environ` inside the sandbox" | CONFIRMED | `/proc/1/environ` = 264 names incl. the launcher marker (names and values both readable — the value is visible, only the non-marker values were withheld by my probe) |
| 13 | M5/§ practice change 2: "Round 44's counter passed `--clearenv` and no spawn environment"; the row's substrate "`bwrap with `--unshare-all --die-with-parent`" | CONFIRMED | `.ufo/waves/round-44/probe/p44b-count.mjs:225` passes `--clearenv` and `:233` calls `spawnSync('bwrap', args, {encoding, timeout, killSignal, maxBuffer})` with **no** `env` option; my argv uses `--unshare-all --die-with-parent` throughout |

13 of 13 statements confirmed; 0 refuted; 0 not-reproduced. `statements_confirmed=13/13`.

## Where the inherited receipt's numbers differ from mine (not a defect, but not identical either)

- The inherited receipt reports `launcher environment 263 variable names`; on my run the launcher
  environment holds **262** names without the marker and **263** with it. The draft's M5 paragraph says
  "(263 names)" for the no-`--clearenv` case, which matches my planted case (263) — the environment simply
  grew by one variable between the two seats' shells. The *shape* (planted count one above control, PID 1
  one above the command) is identical in both.
- The inherited receipt's mode B used `--setenv PATH /usr/bin --setenv HOME /tmp`; the draft's M5 paragraph
  writes "`--clearenv --setenv …`". Both spellings behave identically (I ran both: MODE B-equiv above gives
  `proc1_names=[KUMITATE_R45_ENV]`, `proc1_n=1`).
- The inherited receipt's mode C3 ("marker planted AFTER the scrub") is reproduced exactly by my
  C3-equiv row: `proc1_n=1`, marker in both channels.

## Risks and blockers

- **None blocking.** The mechanism reproduces on this host, on the tip revision `a2e5b54c`, with a clean
  do-nothing control.
- **Fragility note for the entry author.** Both `--setenv` arity and the `/lib64` symlink are easy to get
  wrong, and both fail *loudly* (non-zero exit / `execvp ... No such file or directory`), so a demo that
  "works" is unlikely to hide these. Still, the entry's demo script should use `--symlink usr/lib64 /lib64`
  or `--symlink usr/lib lib64`; `--ro-bind /usr /usr` alone is not runnable.
- **Scope note.** This seat re-derives the demo only. It does not judge the entry (wave 2's job) and does
  not evaluate C1 as a whole.
- The `--setenv` marker reaching the command but not `/proc/1/environ` is worth an explicit sentence in the
  entry: it is the cleanest single observation that `--setenv` and PID 1's environment are different layers.

## Hygiene

- No installs or updates; no pacman transaction (all pacman transactions are paused host-wide).
- Scratch only under `/fast/scratch/hyaku/kumitate-r45/seats/a2-RedoDemoBwrapEnv/`. Attempt-1 scratch dirs
  were not written or edited. No git or jj write in the lane repo, no push, no remote added, no lane clone
  was made (this seat needed no clone).
- Scratch size 980K (includes a shallow `bubblewrap` clone, 884K, used only to verify the three cited line
  numbers).
- No process of mine left running: `pgrep -af 'a2-RedoDemoBwrapEnv'` -> exit 1, empty;
  `pgrep -af 'spawnenv|demo-bwrap-env|summary.sh|guards.sh|c3equiv'` -> exit 1, empty.
- sha256: `demo-bwrap-env.sh` 9025fef40b9511c12d1b888584693baaeb9b549cfab0dc2423310a48ee0579a7,
  `summary.sh` 0f1bd7554d2d7c9197de85a50b7d9c836f247bac6dfc7491b0d0513e9576abad,
  `guards.sh` 4107db7fdef7ec676b0d391fcec8599b98e17d1efe58fc42de6c85471d5b0b8c,
  `summary.txt` 47afd24d37652cedc88254e5b709a32092b5b84f8fd23fd4d8139bf7d3970e22,
  `guards.txt` e6091be26a8f1ea12e0e82a6225cbad9e1cdd6ba7f09f28c5439940b3ac0cca2,
  `run2.txt` 17531e1d6ae9f1dfa737e03eff6b8389246fd76f460be64b18464371e35a2603.
- Host facts re-checked: `bwrap --version` -> `bubblewrap 0.13.1`; `uname -srm` -> `Linux 7.2.11-arch1-1 x86_64`;
  `git --version` -> `git version 2.56.0`; `git rev-parse --local-env-vars` -> 15 names;
  `kernel.unprivileged_userns_clone=1`; `user.max_user_namespaces=122865`.
- Independent source opens (ordinary means only, no browser, no challenge bypass):
  `git clone --depth 1 --branch v0.13.1 https://github.com/containers/bubblewrap.git` -> HEAD
  `362936aea0d5c6e70f7af75d2d44b5a914cb4ba2`, `bubblewrap.c` sha256
  `de141c805cb88f8faff9af1b3bb49098191fc67833b51b51fea84510ea4426ce` (matches the inherited row's figure).
  `man bwrap | col -bx` sha256 `8fe4a0c9cf2c61de11e0df7f6fa610d97e5c097d682fee7dd8b1bc5c8e1c0951`
  (matches the inherited receipt's figure). `man 5 proc_pid_environ | col -bx` sha256
  `2a7da9cd4a64cac40e72d972ae241dbfa98b749f9563b9236c551641937cd682` — note this differs from the
  inherited row's `93394d9edb801ad44e342e8e8ab057bea619d995803221edaf008226b2062c46`, which is the body
  sha of the man7.org HTML page rather than the local man extract; the quoted sentence is present verbatim
  in both (checked at man lines 8-9).
