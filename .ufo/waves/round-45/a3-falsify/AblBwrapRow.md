RESULT AblBwrapRow rev=6b2a4517 verdict=defect baseline=reproduces control_clean=yes necessary=2/5 redundant=b,d,e

The verdict word `defect` is driven by D1 (a demo number in the judged entry that a re-run contradicts and
that the entry's own sentence and cited receipt contradict) and D2 (two listed guards attributed to a failure
they do not prevent). The M5 mechanism itself, the effect, its do-nothing control, the full guard set and the
Node spelling all reproduce; nothing here says the guards fail to stop the leak.

# AblBwrapRow — guard ablation of decision-table row 5 (mechanism M5)

Judged object: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/agent-isolation-substrates.md`
at `6b2a45178c72a4565bb9d98e09f4c36b95ca1521`, body sha256
`a3a7ce3b340b9984f01a13c1aa5fde36fbf3847d68f920cd1d0573ac75d81d61` (205 lines; M5 paragraph and demo
table at 110-127, row 5 at line 164). The row's action is "run untrusted or generated code (counters,
controls)"; its stated failure is "the launcher's environment (variable names and values) readable at
`/proc/1/environ` inside the sandbox".

Method: necessity ablation, not sufficiency re-test. Each mode keeps the substrate
(`bwrap --unshare-all --die-with-parent --new-session`, a fresh `--proc /proc`, `--dev /dev`, read-only
`/usr`+`/etc`) fixed inside the host-safety scope and changes exactly one row-5 component. My probe reads
`/proc/1/environ` and `/proc/self/environ` with a direct `/proc` reader in Python (not `env` through a
shell), so name counts and name-set hashes are comparable on both sides. A random planted marker
`UFOABL_PLANT_MARKER` is exported only in the launcher; a second planted value is injected only through
`--setenv` to separate the two layers. Only names and sha256 of planted values are printed, never a value.
The a2-control receipts were opened only after my first batch completed; no a2 script was read or copied.

## Evidence (commands and observed output)

E01 `git -C … show 6b2a4517…:corpus/knowledge/agent-isolation-substrates.md | sha256sum` ->
`a3a7ce3b340b9984f01a13c1aa5fde36fbf3847d68f920cd1d0573ac75d81d61  -`
E02 `bwrap --version` -> `bubblewrap 0.13.1`; `systemd-run --version | head -1` -> `systemd 262 (262-1-arch)`;
node v24.21.0 (`/home/vgpnk/.local/share/fnm/node-versions/v24.21.0/installation/bin/node --version` -> `v24.21.0`)
E03 batch: `UFOABL_NODE=… bash probe/run_all.sh > out/run_all.log` -> `BATCH_RC=0`, 122 lines, log sha256
`d10c9a20b745e5cd2592fe3023c0dd7b4e9c176561be6ccf82085ca25bbd3d62`. Every run inside each mode is wrapped as
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 /usr/bin/python3 probe/run_mode.py <mode>`.
A `…` inside a 64-hex value in E04-E18 abbreviates the middle of a sha256 that the log prints in full; no other
text is elided anywhere in this report.
E04 effect (no guard): BEFORE `launcher_names=265 launcher_names_sha=fa69a71c…8c1c644 launcher_marker=1
launcher_marker_sha=99f9385f…62a0710`; INNER `pid1_comm=bwrap pid1_read=ok pid1_names=265
pid1_names_sha=fa69a71c…8c1c644 pid1_launch_marker=1 pid1_launch_sha=99f9385f…62a0710 pid1_setenv_marker=0
cmd_names=265 cmd_names_sha=fa69a71c…8c1c644 cmd_launch_marker=1 cmd_launch_sha=99f9385f…62a0710 tty=denied`
E05 control (same script, marker not exported): launcher 264, INNER `pid1_names=264
pid1_names_sha=ed51b9dd…ef5e824 pid1_launch_marker=0 cmd_names=264 cmd_names_sha=ed51b9dd…ef5e824
cmd_launch_marker=0` — delta against E04 is exactly one name and marker 1 -> 0; control clean.
E06 guards_full (`env -i PATH=/usr/bin:/bin HOME=/tmp` + `--clearenv --setenv`): `pid1_comm=bwrap
pid1_names=2 pid1_names_sha=cc223431…4869e8b pid1_launch_marker=0 pid1_setenv_marker=0 cmd_names=4
cmd_names_sha=d4bc9c91…96e75934 cmd_launch_marker=0 cmd_setenv_marker=1` — failure absent.
E07 `sha256("HOME\nPATH")` -> `cc223431cd82ee01c456252a947a8f6702bfae0aa18af56432065202e4869e8b` (equals E06
PID 1), `sha256("HOME\nPATH\nPWD")` -> `cffaa8d0…6295c37`, `sha256("HOME\nPATH\nPWD\nUFOABL_SETENV_MARKER")`
-> `d4bc9c91…96e75934`. Direct names: `NAMES pid1=HOME,PATH` / `NAMES self=HOME,PATH,PWD,UFOABL_SETENV_MARKER`
E08 ablation (a), env -i removed, `--clearenv --setenv` kept: `pid1_names=265 pid1_names_sha=fa69a71c…8c1c644
pid1_launch_marker=1 pid1_launch_sha=99f9385f…62a0710 cmd_names=4 cmd_launch_marker=0 cmd_setenv_marker=1`;
`NAMES pid1=AGENT,ALACRITTY_LOG,…,XDG_RUNTIME_DIR,…` (the launcher list). NECESSARY.
E09 ablation (b), `--clearenv --setenv` removed, env -i kept: `pid1_names=2 pid1_names_sha=cc223431…4869e8b
pid1_launch_marker=0 pid1_setenv_marker=0 cmd_names=3 cmd_names_sha=cffaa8d0…6295c37 cmd_launch_marker=0` —
failure absent. REDUNDANT for the stated failure.
E10 scope without env -i (`systemd-run --user --scope … bwrap`): `pid1_names=265 pid1_names_sha=fa69a71c…
pid1_launch_marker=1 pid1_launch_sha=99f9385f…` — the scope does inherit the caller's environment.
E11 (c) `systemd-run --user --scope … env -i … bwrap`: `pid1_names=2 pid1_launch_marker=0 cmd_names=4` — clean.
E12 (c) `env -i … systemd-run --user --scope … bwrap` **cannot start**: stderr
`Failed to connect to user scope bus via local transport: $DBUS_SESSION_BUS_ADDRESS and $XDG_RUNTIME_DIR not defined (consider using --machine=<user>@.host --user to connect to bus of other user)`,
`EXIT rc=1`. NECESSARY (position).
E13 same with `XDG_RUNTIME_DIR=/run/user/1000` retained: starts, `pid1_names=4 pid1_names_sha=e77e429d…226db237
pid1_launch_marker=0`, `NAMES pid1=HOME,INVOCATION_ID,PATH,XDG_RUNTIME_DIR` (the scope itself contributes
INVOCATION_ID). The guard could move outside only at the cost of these names at PID 1.
E14 ablation (d), `--new-session` removed, no tty: `pid1_names=2 pid1_names_sha=cc223431… pid1_launch_marker=0
cmd_names=4 tty=denied` — environment unaffected. REDUNDANT for the stated failure.
E15 PTY pair (`script -q -c "…run_mode.py <mode>" /dev/null`, so a real terminal exists):
with `--new-session` `tty=denied:No such device or address`; without it `tty=open` (pid1_names=2 both times).
E16 ablation (e), `--ro-bind /run /run`: `pid1_names=2 pid1_launch_marker=0 cmd_names=4
runtime=/run/user/1000:entries=39:bus=yes`. Same with `--ro-bind /run/user/1000 /run/user/1000`.
REDUNDANT for the stated failure; the environment is unchanged, only the runtime directory becomes visible.
E17 `single_name` (env -i with only the marker): `pid1_names=1 pid1_names_sha=5155f18d…475b8253
pid1_launch_marker=1 pid1_launch_sha=99f9385f…62a0710 cmd_names=2` — one name in, one name out.
E18 node v24.21.0, argv always contains `--clearenv`:
`minimal-env` -> `pid1_names=2 pid1_names_sha=cc223431… pid1_launch_marker=0`; `option-omitted` ->
`pid1_names=265 pid1_names_sha=fa69a71c… pid1_launch_marker=1`; `process-env` -> same as omitted.
E19 a2 receipt `RedoDemoBwrapEnv.md` sha256 `d8fc97c896df7bb74e68de57301793f47df20c319f0b2ceb6f1a5b8a9bc72b01`,
§ "the two decision-table guard spellings (guards.sh)": `proc1_names=[PATH,HOME,] proc1_n=2`; the same file's
§ "Observed output — compact summary (summary.sh)" reports, for its V3 `env -i` row, cmd_env_vars=3 and
proc1_environ_vars=0 (paraphrased here to avoid re-spacing the line).
E20 `RedoDemoBwrapEnv.md` statement table row 11 records `proc1_names=[PATH,HOME]` as 2 for the same condition.
E21 hygiene: `pgrep -af a3f-AblBwrapRow` -> no match (`PGREP_RC=1`); `du -sh .` -> `48K`; no installs.

## Numbers checked against the entry's M5 paragraph (CONFIRMED / DIFFERS observed=…)

N1 "without `--clearenv` the marker is in `env` and in `/proc/1/environ`" — CONFIRMED (E04: marker name and
the same value sha256 in both channels; the value, not only the name, is readable).
N2 plain row 263 command / 264 at PID 1 — DIFFERS observed=265/265: my launcher had 265 names and both
sides give the identical name-set sha256 (E04). Reading both through `/proc` instead of `env` through a
shell removes the entry's +1; the same receipt records the `sh` probe's own `/proc/self/environ` as 0 bytes,
which is the reader artifact. No mechanism claim depends on the +1.
N3 "`--clearenv --setenv`": 4 command names, marker gone from `env`, still at `/proc/1/environ` — CONFIRMED
(E08: 4 command names without the launcher marker, PID 1 265 with the marker).
N4 "a marker injected only by `--setenv` never appears in `/proc/1/environ`" — CONFIRMED (E06, E08, E09,
E11, E16, E18: `pid1_setenv_marker=0` in every mode, `cmd_setenv_marker=1` whenever `--clearenv` ran).
N5 "`env -i` + bwrap: 3 names" command side — CONFIRMED (E09: 3 = HOME, PATH, PWD; bwrap adds PWD).
N6 "`env -i` + bwrap: 0 names" at `/proc/1/environ` — **DIFFERS observed=2** (`HOME,PATH`, E06/E07/E09).
N7 "`env -i` + `--clearenv --setenv`: 4 names" command side — CONFIRMED (E06/E07).
N8 "`env -i` + `--clearenv --setenv`: 0 names" at `/proc/1/environ` — **DIFFERS observed=2** (E06/E07).
N9 control, no marker 0/0 — CONFIRMED (E05: marker 0 in both channels, counts one below the planted twin).
N10 "PID 1 holds exactly the environment bwrap was exec'd with" — CONFIRMED (E04 sha equality with the
launcher; E06/E07 exactly `{HOME,PATH}`; E17 one name in, one out).
N11 "`spawnSync('bwrap', args, {env})` with a two-name env leaves two names in `/proc/1/environ`" — CONFIRMED
(E18), and the leak returns both with the option omitted and with `env: process.env` even though
`--clearenv` is in argv.
N12 "`systemd-run --user --scope` … will thus inherit the execution environment of the caller" — CONFIRMED
(E10), and `env -i` must be the scope's child immediately before bwrap (E11 clean, E12 cannot start).
N13 the remaining count relations reproduce with my launcher (265 names, the a2 seat's was 264): the plain
case exposes the launcher's whole environment at PID 1, the `--clearenv --setenv` command has 4 names, the two
`env -i` commands have 3 and 4, and the marker column behaves as tabulated. Only the PID 1 figures in the two
`env -i` rows are wrong (N6, N8); the rest differ by my launcher's one extra name, not by mechanism.

## Defects

D1 (numeric; K2-relevant). The table's two `env -i` rows state `/proc/1/environ` = 0 names. A re-run gives
2 names, exactly `{HOME, PATH}`. That is what the entry's own sentence N10 predicts and what the entry's cited
receipt prints in its guards block (`proc1_names=[PATH,HOME,] proc1_n=2`, E19, E20), so the entry contradicts
both its own mechanism sentence and its cited evidence on this number; only the receipt's shell-mediated
summary block says 0. A falsify re-run therefore does not reproduce the table as written, although the row's
conclusion (no launcher name or value survives) does hold. The number is not a mechanism failure and not a
guard failure; it is a wrong observation in the judged object and should be corrected by a named appended
erratum to "2 names (`HOME`, `PATH`), which is bwrap's own exec environment", not softened. If the intended
meaning of the 0 was "zero names supplied by the launcher", the column is then inconsistent with its own 264
and 263 totals for the other rows, and the entry should say so explicitly instead of printing 0 under a header
that counts every name.
D2 (attribution). The row lists three component sets as "required guards" for one failure. Ablation shows
only `env -i PATH=/usr/bin:/bin HOME=/tmp` as bwrap's immediate parent is necessary for the `/proc/1/environ`
leak (E08 returns it; E09 is clean without `--clearenv`). `--clearenv --setenv` never touches PID 1 (E08:
command clean at 4 names while PID 1 leaks all 265) and the runtime-directory ban changes no environment byte
(E16). Both prevent real failures — the command's own environment, and reachability of the session bus and
runtime sockets — but not the failure named in the row. The row should pair each guard with the failure it
prevents, or move (b) and (e) under the "Channels that remain" sentence.

## Component verdicts

(a) NECESSARY — E08: name-set sha256 equals the launcher's and the marker value sha256 matches, so names and
values are readable at PID 1. (b) REDUNDANT here — E09; needed where bwrap's own environment cannot be
cleared by the caller (embedder libraries, socket-activated wrappers), or where the command must see a
different environment than bwrap itself (e.g. the command needs `HOME=/tmp` while bwrap needs the real
`XDG_RUNTIME_DIR`); E08 is exactly that case: command allowlisted, PID 1 leaking. (c) NECESSARY as a
positional requirement — E12 cannot start (exit 1) and E13 shows the outside spelling only works by passing
`XDG_RUNTIME_DIR` through, which then appears at PID 1 together with the scope's `INVOCATION_ID`.
(d) REDUNDANT for this failure — E14; needed whenever stdio is a terminal: E15 shows `/dev/tty` opens inside
the sandbox without `--new-session` and is denied with it. (e) REDUNDANT for this failure — E16; needed to
keep the runtime directory and the session bus socket out of the sandbox (39 entries and `bus` visible when
bound), which is the channel the entry's own "Channels that remain" sentence names.

## Risks and limits

- Absolute name counts are launcher-specific (mine 265, the a2 seat's 264); only deltas and sha256 equalities
  are compared.
- The seat's bash tool reported "pty requested but unavailable in this environment", so the terminal test used
  `script -q` to allocate a pty. Only `open("/dev/tty")` was probed; TIOCSTI injection was not attempted, so
  the injection impact beyond reachability is [INFERENCE].
- The a2 receipt is internally inconsistent (summary 0 versus guards 2 at the same condition); I did not run
  their scripts, so I do not attribute their cause, only the contradiction, which the entry inherited.
- One machine, one bwrap 0.13.1, one kernel (`Linux 7.2.11-arch1-1`); no source reopen was needed for this
  item, so no provider was contacted.

## Hygiene

Scratch only under `/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblBwrapRow/` (48K). No lane write except this
report; read-only `git show` only; no jj or git mutation, no clone, no remote, no push; no sibling lane or
operator config touched; no pacman or other install; the only file read under `~/.omp/agent` was `RULES.md`.
Every run went through the host-safety `systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128
timeout -s KILL 900` wrapper; no background job, no process of mine left (E21).

## Scripts

`probe/inner_probe.py` sha256 `4b0a97957fa8367eb00bff3ad8ac6de5092f2ebab9dae6381f95d6f59323ecc4`,
`probe/run_mode.py` sha256 `444d4ffb4676f512adc6b19865e38566309a25eac75cf24496f167ca1c22bf35`,
`probe/node_env.mjs` sha256 `94e2fc72a8affb81ba1020b467f96bf508128e346aedbc0c20ecf503363ac75d`,
`probe/names_only.py` sha256 `8b866e7059ba2cb1fa5082a91de8fb6e024c0f9d802835529b38d03deb59f3bd`,
`probe/run_all.sh` sha256 `874f82c601976b6fa2974b52b1e7241267f1415a3cd03cf1f8034e7a441224b6`.

```python
#!/usr/bin/python3
"""Runs INSIDE the bwrap sandbox. Prints counts and hashes only, never environment values."""
import hashlib
import os
import sys

LAUNCH_MARK = b"UFOABL_PLANT_MARKER"
SETENV_MARK = b"UFOABL_SETENV_MARKER"


def read_environ(path):
    try:
        with open(path, "rb") as f:
            return f.read(), "ok"
    except OSError as exc:
        return b"", "error:%s" % exc.strerror


def pairs(buf):
    out = []
    for item in buf.split(b"\0"):
        if item:
            key, _, value = item.partition(b"=")
            out.append((key, value))
    return out


def names_sha(ps):
    names = sorted(key for key, _ in ps)
    return hashlib.sha256(b"\n".join(names)).hexdigest(), len(names)


def find(ps, name):
    return [value for key, value in ps if key == name]


def hexsha(values):
    return hashlib.sha256(values[0]).hexdigest() if values else "-"


try:
    with open("/proc/1/comm", "r") as f:
        comm = f.read().strip()
except OSError:
    comm = "?"

p1_raw, p1_read = read_environ("/proc/1/environ")
me_raw, me_read = read_environ("/proc/self/environ")
p1 = pairs(p1_raw)
me = pairs(me_raw)
p1_sha, p1_n = names_sha(p1)
me_sha, me_n = names_sha(me)
p1_lm, me_lm = find(p1, LAUNCH_MARK), find(me, LAUNCH_MARK)
p1_sm, me_sm = find(p1, SETENV_MARK), find(me, SETENV_MARK)

try:
    fd = os.open("/dev/tty", os.O_RDWR | os.O_NOCTTY)
    os.close(fd)
    tty = "open"
except OSError as exc:
    tty = "denied:%s" % exc.strerror

rt = "absent"
for path in ("/run/user/1000", "/run"):
    if os.path.isdir(path):
        try:
            entries = os.listdir(path)
        except OSError:
            entries = []
        rt = "%s:entries=%d:bus=%s" % (
            path,
            len(entries),
            "yes" if os.path.exists(path + "/bus") else "no",
        )
        break

print(
    "INNER pid1_comm=%s pid1_read=%s pid1_names=%d pid1_names_sha=%s "
    "pid1_launch_marker=%d pid1_launch_sha=%s pid1_setenv_marker=%d pid1_setenv_sha=%s "
    "cmd_read=%s cmd_names=%d cmd_names_sha=%s cmd_launch_marker=%d cmd_launch_sha=%s "
    "cmd_setenv_marker=%d cmd_setenv_sha=%s tty=%s runtime=%s"
    % (
        comm, p1_read, p1_n, p1_sha,
        len(p1_lm), hexsha(p1_lm), len(p1_sm), hexsha(p1_sm),
        me_read, me_n, me_sha, len(me_lm), hexsha(me_lm),
        len(me_sm), hexsha(me_sm), tty, rt,
    )
)
sys.stdout.flush()
```

```python
#!/usr/bin/python3
"""Launcher-side runner: prints BEFORE from this process's exec env, then runs one bwrap mode."""
import hashlib
import os
import subprocess
import sys

S = "/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblBwrapRow"
PROBE_DIR = S + "/probe"
LAUNCH_MARK = b"UFOABL_PLANT_MARKER"
SETENV_VALUE = "UFOABL-SETENV-planted-2c7e"


def pairs(buf):
    out = []
    for item in buf.split(b"\0"):
        if item:
            key, _, value = item.partition(b"=")
            out.append((key, value))
    return out


def names_sha(ps):
    names = sorted(key for key, _ in ps)
    return hashlib.sha256(b"\n".join(names)).hexdigest(), len(names)


def find(ps, name):
    return [value for key, value in ps if key == name]


def hexsha(values):
    return hashlib.sha256(values[0]).hexdigest() if values else "-"


with open("/proc/self/environ", "rb") as f:
    before = pairs(f.read())
b_sha, b_n = names_sha(before)
bm = find(before, LAUNCH_MARK)
print("BEFORE launcher_names=%d launcher_names_sha=%s launcher_marker=%d launcher_marker_sha=%s"
      % (b_n, b_sha, len(bm), hexsha(bm)))
sys.stdout.flush()

BWRAP = "/usr/bin/bwrap"
BINDS = [
    "--ro-bind", "/usr", "/usr",
    "--symlink", "usr/bin", "/bin",
    "--symlink", "usr/lib", "/lib",
    "--symlink", "usr/lib64", "/lib64",
    "--ro-bind", "/etc", "/etc",
    "--proc", "/proc", "--dev", "/dev", "--tmpfs", "/tmp",
    "--ro-bind", PROBE_DIR, "/probe",
]
CMD = ["/usr/bin/python3", "/probe/inner_probe.py"]
CLEAR = ["--clearenv",
         "--setenv", "PATH", "/usr/bin:/bin",
         "--setenv", "HOME", "/tmp",
         "--setenv", "UFOABL_SETENV_MARKER", SETENV_VALUE]
ENVI = ["/usr/bin/env", "-i", "PATH=/usr/bin:/bin", "HOME=/tmp"]
SCOPE = ["/usr/bin/systemd-run", "--user", "--scope", "--quiet",
         "-p", "MemoryMax=4G", "-p", "TasksMax=128"]


def base(new_session=True):
    argv = [BWRAP, "--die-with-parent", "--unshare-all"]
    if new_session:
        argv.append("--new-session")
    return argv + BINDS


mode = sys.argv[1]
if mode == "effect":
    av = base() + CMD
elif mode == "guards_full":
    av = ENVI + base() + CLEAR + CMD
elif mode == "ablate_a":
    av = base() + CLEAR + CMD
elif mode == "ablate_b":
    av = ENVI + base() + CMD
elif mode == "scope_no_i":
    av = SCOPE + base() + CLEAR + CMD
elif mode == "ablate_c_inner":
    av = SCOPE + ENVI + base() + CLEAR + CMD
elif mode == "ablate_c_outer":
    av = ENVI + SCOPE + base() + CLEAR + CMD
elif mode == "ablate_d":
    av = ENVI + base(new_session=False) + CLEAR + CMD
elif mode == "ablate_c_outer_bus":
    av = ["/usr/bin/env", "-i", "PATH=/usr/bin:/bin", "HOME=/tmp",
          "XDG_RUNTIME_DIR=/run/user/1000"] + SCOPE + base() + CLEAR + CMD
elif mode == "names_guards_full":
    av = ENVI + base() + CLEAR + ["/usr/bin/python3", "/probe/names_only.py"]
elif mode == "names_ablate_a":
    av = base() + CLEAR + ["/usr/bin/python3", "/probe/names_only.py"]
elif mode == "single_name":
    av = ["/usr/bin/env", "-i",
          "UFOABL_PLANT_MARKER=" + os.environ.get("UFOABL_PLANT_MARKER", "x")] + base() + CMD
elif mode == "names_c_outer_bus":
    av = ["/usr/bin/env", "-i", "PATH=/usr/bin:/bin", "HOME=/tmp",
          "XDG_RUNTIME_DIR=/run/user/1000"] + SCOPE + base() + CLEAR + \
         ["/usr/bin/python3", "/probe/names_only.py"]
elif mode == "ablate_e_bind_run":
    av = ENVI + base() + ["--ro-bind", "/run", "/run"] + CLEAR + CMD
elif mode == "ablate_e_bind_xdg":
    av = ENVI + base() + ["--dir", "/run/user",
                          "--ro-bind", "/run/user/1000", "/run/user/1000"] + CLEAR + CMD
else:
    sys.exit("unknown mode: " + mode)

print("ARGV_HASH " + hashlib.sha256(" ".join(av).encode()).hexdigest()
      + " env_i_prefix=%d scope_prefix=%d clearenv=%d new_session=%d"
      % (av[0] == "/usr/bin/env", av[0].startswith("systemd-run") or "systemd-run" in av[0],
         "--clearenv" in av, "--new-session" in av))
sys.stdout.flush()

res = subprocess.run(av)
print("EXIT rc=%d" % res.returncode)
sys.stdout.flush()
```

```javascript
// Node-side comparison: spawn('bwrap', args, {env}) variants. Prints counts/hashes only.
import {spawnSync} from "node:child_process";

const PROBE_DIR = "/fast/scratch/hyaku/kumitate-r45/seats/a3f-AblBwrapRow/probe";
const BWRAP = "/usr/bin/bwrap";
const args = [
  "--die-with-parent", "--unshare-all", "--new-session",
  "--ro-bind", "/usr", "/usr",
  "--symlink", "usr/bin", "/bin",
  "--symlink", "usr/lib", "/lib",
  "--symlink", "usr/lib64", "/lib64",
  "--ro-bind", "/etc", "/etc",
  "--proc", "/proc", "--dev", "/dev", "--tmpfs", "/tmp",
  "--ro-bind", PROBE_DIR, "/probe",
  "--clearenv",
  "--setenv", "PATH", "/usr/bin:/bin",
  "--setenv", "HOME", "/tmp",
  "--setenv", "UFOABL_SETENV_MARKER", "UFOABL-SETENV-planted-2c7e",
  "/usr/bin/python3", "/probe/inner_probe.py",
];

console.log(`NODE version=${process.version} launcher_has_marker=${"UFOABL_PLANT_MARKER" in process.env ? 1 : 0} launcher_names=${Object.keys(process.env).length}`);

const variants = [
  ["minimal-env", {PATH: "/usr/bin:/bin", HOME: "/tmp"}],
  ["option-omitted", undefined],
  ["process-env", process.env],
];

for (const [name, env] of variants) {
  const opts = env === undefined ? {encoding: "utf8"} : {encoding: "utf8", env};
  const r = spawnSync(BWRAP, args, opts);
  console.log(`NODE variant=${name} rc=${r.status} signal=${r.signal || "-"} err=${r.error ? String(r.error.code) : "-"}`);
  if (r.stdout) console.log(r.stdout.trim());
  if (r.stderr) console.log(`NODE_STDERR ${r.stderr.trim().slice(0, 300)}`);
}
```
