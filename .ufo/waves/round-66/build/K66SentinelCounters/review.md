# Counter safety review — round 66 frozen counters and controls

Seat `K66SentinelCounters` (sentinel), milestone "counter safety". Scope: adversarial review of
`.ufo/waves/round-66/probe/ledger66-probe.mjs`, `deprec66-probe.mjs`, `c1-controls.sh`, `c2-donothing.sh` at the
freeze (`621212ba`). Nothing was patched; every claim below was executed in
`/fast/scratch/hyaku/kumitate-r66/K66SentinelCounters/` with `TMPDIR` set inside that scratch dir. Reproducing
scripts: `attack/`, verbatim output: `evidence/outputs.txt`, `evidence/outputs-e13.txt`,
`evidence/outputs-forge.txt`, `evidence/outputs-controls.txt`.

Verdict in one line: the four frozen files are *operable* (all controls reproduce their base receipts, cleanup is
clean on the normal path) but not *confined*: the archive they claim to measure is not a boundary (symlinks and
`export-subst` escape it, a capture path traverses out of it), revision- and caller-supplied code runs with the
caller's full environment, and the verdict line can be forged from the environment alone.

Threat model used: the counters' own declared contract — "measured over `git archive <rev>` (never the worktree)".
A candidate revision is untrusted input; a seat scoring the claim is a potentially self-interested caller.

| # | Severity | Surface | One-line |
|---|---|---|---|
| S1 | critical | both counters | caller env (`NODE_OPTIONS`) prints `*_HELD`, exit 0, on an UNMET rev |
| S2 | high | deprec66 M3/M4 | `source-captures.json` path traversal reads/grounds on host files outside the archive |
| S3 | high | both counters | `git archive \| tar -x` keeps committed symlinks; counter executes a host file (L1 held) |
| S4 | high | deprec66 M8 | revision-supplied scripts run with caller env, no timeout, no sandbox |
| S5 | high | ledger66 L2 | the tool is handed the live lane worktree, so L2 can measure uncommitted files |
| S6 | medium-high | both counters | lane path interpolated into a `bash -c` string → host command execution |
| S7 | medium | both counters | no signal/exception cleanup; missing `TMPDIR` crashes with no verdict |
| S8 | medium | deprec66 M5 | curl: no `--proto-redir`, no `--max-filesize`, `http://` rows, loopback URLs accepted |
| S9 | medium | ledger66 L4/L5, L3 | "held-out fixtures / no answer key" is false; `--seed` is caller-chosen; one-word quotes pass |
| S10 | medium | controls | c1 takes the tool from the live worktree; no counter verifies its own pinned sha |
| S11 | low-medium | both counters | `export-ignore`/`export-subst` make the archive ≠ the tree in both directions |
| S12 | low | controls | c2's staged input is an unpinned file in another repo |
| S13 | low | ledger66 L6 | "SKILL.md table row" is satisfied by any line starting with `|` |

---

## S1 — critical — full verdict forgery from the caller environment

`ledger66-probe.mjs:119,137,249` and `deprec66-probe.mjs:225` spawn children with
`env: { ...process.env, TMPDIR: T }`; the counter itself is also a `node` process started by the caller.

Exploit (executed): `NODE_OPTIONS="--require forge-preload.mjs" node .ufo/waves/round-66/probe/ledger66-probe.mjs
<lane> 8d557f85312de4fcc82e09ff735d21436bc3746d` where the preload writes the exact verdict line and `exit(0)`.

```
-- genuine, base rev:
LEDGER66_UNMET held=0/6 … | L1 MISS tool-absent | … (exit=1)
-- same command, caller sets NODE_OPTIONS=--require forge.mjs:
LEDGER66_HELD held=6/6 checks=6 rev=8d557f85312de4fcc82e09ff735d21436bc3746d rule=L66 seed=00   (exit=0)
```

The weaker variant is also proven: with a preload that fires only for `scripts/routed-ledger.mjs --selftest`,
`held` goes 0/6 → 1/6 with L1 held although the tool in the revision is `process.exit(3)` (`evidence/outputs.txt`
§E5). `TAR_OPTIONS` reaches tar as well (`--strip-components=1` silently extracted 15 entries as 2,
`evidence/outputs.txt` §E7; `--checkpoint-action=exec=…` is rejected by GNU tar 1.35 — no RCE shown there).

Impact: the claim's verdict is decided by the caller, not by the artifact; the plan's counting command carries no
env allow-list, so any seat can emit `LEDGER66_HELD … exit 0`.
Smallest remediation: (a) spawn every child with an explicit env allow-list `{ PATH, TMPDIR: T, LANG, HOME: T }`;
(b) at the top of each counter, refuse to run (exit 64) when `NODE_OPTIONS`, `NODE_EXTRA_CA_CERTS`, `LD_PRELOAD`,
`TAR_OPTIONS`, `GIT_DIR`, `GIT_OBJECT_DIRECTORY` are non-empty, or echo `env-sanitized=false` plus their names into
the verdict line so a receipt shows the taint.

## S2 — high — revision data traverses out of the archive and M3/M4 ground on host files

`deprec66-probe.mjs:132`: `const b = rd(c.path)` where `c.path` comes from `.ufo/pins/source-captures.json` *inside
the revision* and `rd` is `readFileSync(join(T, rel))`. `join` collapses `..`, so a relative path escapes T.

Executed fixture (three rows S900–S902, each capture `../../…/outside/cap/capture.txt`, entry quoting that file):

```
capture path in the revision: ../../../../../../../../../../../../fast/scratch/.../outside/cap/capture.txt
DEPREC66_UNMET held=4/8 checks=8 rev=703782d6da919e48faea56dd69f033e91c090d14 | M5 MISS … | M6 MISS … | M7 MISS … | M8 MISS …
M1 held? yes   M2 held? yes   M3 held? yes   M4 held? yes
```

Second variant, same fixture with the path pointing at a FIFO with no writer: `exit=137` after `timeout -s KILL 6`,
no output — the counter blocks in `readFileSync` forever (`evidence/outputs-e13.txt`).

Impact: four of eight C2 checks can be satisfied from host filesystem content that is in no committed blob (sha256
and size are supplied by the revision too, so they match trivially); a revision can also hang the counter with one
JSON line.
Smallest remediation: before `rd(c.path)`, require `resolve(T, c.path)` to start with `T + sep` (reject absolute),
`lstatSync` it and require a regular file, read with a byte cap (`openSync`+`readSync` up to `c.bytes + 1`, or
`readFileSync` only after `statSync().size <= 32 MiB`).

## S3 — high — the extraction root is not a boundary (committed symlinks)

`ledger66-probe.mjs:50` / `deprec66-probe.mjs:48`: `git … archive <rev> | tar -x -C <dir>` with no `--no-same-owner`,
no post-walk, and `git archive` stores symlinks verbatim (mode `120000`).

Executed fixture: revision commits only a symlink `scripts/routed-ledger.mjs -> <scratch>/outside/fake-tool.mjs`
(blob = link text); the counter prints `held=1/6` and L1 is absent from the miss list — it executed a file that is
in no revision (`evidence/outputs.txt` §E3):

```
tree: 120000 scripts/routed-ledger.mjs
LEDGER66_UNMET held=1/6 … | L2 MISS … | L3 MISS … | L4 MISS … | L5 MISS … | L6 MISS …
L1 among misses? no -> L1 held (held=1/6); the tool it ran is the host symlink target
```

The same primitive applies to L3 answer files (`rd(p)`), L6's `SKILL.md`/`SCORECARD.md` reads, and deprec66's whole
`rd()` set: a symlink at any allow-listed path reads a host file into the measurement.
Impact: evidence can be sourced outside the revision while the verdict claims `rev=<M>`; also executes an arbitrary
host file as the subject tool.
Smallest remediation: after extraction, fail closed if the tree contains any symlink or non-regular file
(`lstatSync` walk, or `tar -tv` pre-scan), and add `--no-same-owner --no-same-permissions`; alternatively read the
handful of needed paths with `git -C lane cat-file blob <rev>:<path>` instead of extracting at all (this also fixes
S11).

## S4 — high — M8 runs the revision's own scripts with the caller's environment and no bound

`deprec66-probe.mjs:224-225`: `spawnSync('bash', [CENSUS, …])` and `spawnSync('node', ['scripts/<x>.mjs'], { cwd: T,
env: { ...process.env, TMPDIR: T } })` — no `timeout`, no env filter, cwd is the *archive* so the revision's code is
what runs. `CENSUS` itself comes from `process.env.SOURCES_CENSUS` (`:34`).

Executed: fixture whose `scripts/sources-check.mjs` writes outside the archive and echoes a canary env var ->
`escaped: [env:secret-token]`, and `SOURCES_CENSUS=<my script>` was executed with the counter's own argv
(`census: [census argv: validate --file …/deprec66.QxGdyN/corpus/SOURCES.md]`) — `evidence/outputs.txt` §E9.
Hang: fixture whose `scripts/sources-check.mjs` never returns -> `exit=137` under `timeout -s KILL 5`, no verdict
(`§E10`); an earlier run of the same shape left the child spinning after the counter was killed.
Impact: "the archive is untrusted input" is nominal — M8 gives a candidate revision arbitrary host code execution
with the caller's credentials, unbounded in time.
Smallest remediation: pass an allow-listed env, `timeout: 120000` on both spawns, refuse when
`scripts/*.mjs` is a symlink, and treat `signal`/timeout as MISS (not as crash).

## S5 — high — L2 measures the live worktree, not M

`ledger66-probe.mjs:137`: the archive tool is invoked with `--root <lane worktree> --rev <full>`. Nothing forces the
tool to read M; the counter cannot tell. Executed fixture: 11 spot-checks committed, ledger *untracked*, tool reads
`<root>/corpus/routed-ledger.md`:

```
ledger committed at HEAD: 0  worktree: ?? corpus/routed-ledger.md
LEDGER66_UNMET held=1/6 … | L1 MISS … | L3 MISS … 
L2 among misses? no -> L2 held (held=1/6) on an untracked worktree ledger
```

Impact: L2 is satisfiable by files that do not exist at M while L3 (archive-only) disagrees — the cross-check that
is supposed to bind the tool to M is defeated by the subject itself.
Smallest remediation: give the tool a root that is a *second clean extraction of M* (or contractually drop `--root`
and require the tool to read `<rev>` through git), so both halves of L2 see the same tree.

## S6 — medium-high — lane path is interpolated into a shell string

`ledger66-probe.mjs:50`, `deprec66-probe.mjs:48`: `` `git -C "${lane}" archive "${full}" | tar -x -C "${A}"` `` in
`bash -c`. `lane` is argv, only `resolve()`d. Executed: a git repo at
`…/ev/lane$(touch …/ev/INJECTED)` -> `archive-failed` and `injected file exists: YES` (`evidence/outputs.txt` §E4).
Also the pipeline has no `set -o pipefail`, so a failing `git archive` is judged by tar's status alone.
Impact: command execution from a directory name (any seat that creates a lane-shaped dir with shell metacharacters);
also a masking path for archive failures.
Smallest remediation: `spawnSync('git', ['-C', lane, 'archive', full])` piped into `tar -x -C A` via `spawn` with
`{ stdio: ['pipe', 'ignore', 'pipe'] }`, or write the archive to a file and `execFileSync('tar', ['-x', '-C', A,
'-f', file])`; check both statuses.

## S7 — medium — no cleanup on signal or exception; no verdict on a bad scratch path

Both counters create `mkdtempSync` (`:48`/`:47`) and `rmSync` only on the normal/known-failure paths (`:292`/`:232`);
no `process.on('SIGINT'|'SIGTERM'|'exit')`, no `try/finally`. Executed: SIGTERM to the counter 3 s into a slow tool
-> the temp dir survives and the child survives it, with empty stdout (`evidence/outputs.txt` §E8):

```
before: …/tt/ledger66.Zng50E   child: 384978 node …/ledger66.Zng50E/archive/…
after : …/tt/ledger66.Zng50E   child: 384978 node …/ledger66.Zng50E/archive/…
stdout: []
```

`TMPDIR` pointing at a missing dir -> bare `Error: ENOENT … mkdtemp` stack, exit 1, **no verdict line** (§E1).
Impact: a killed or crashed counter leaves the extracted (possibly hostile) archive under the scratch dir and no
machine-readable verdict for the receipt; `TMPDIR` unset silently falls back to `/tmp` (`os.tmpdir()`), which the
host rule caps at 50 MB.
Smallest remediation: `process.on('SIGINT'/'SIGTERM', …)` + `try { … } finally { rmSync(T, { recursive: true,
force: true }) }`; validate the scratch dir once and exit 2 with `LEDGER66_UNMET … | scratch-unusable`; refuse when
`tmpdir()` is `/tmp`.

## S8 — medium — M5's live fetch is an unfiltered curl

`deprec66-probe.mjs:166`: `curl -fsSL --max-time 90 --retry 2 -A … <url>`, `maxBuffer 128 MiB`; row URLs may be
`http://` (`:102`, `:117`). Executed against a local redirector with the probe's exact flags: redirect to
`file:///etc/hostname` is **refused** by curl 8.23.0 (`curl: (1) Protocol "file" is disabled (in redirect)`), but a
redirect to a second http origin is followed (`exit=0`, body `INTERNAL-ONLY-TOKEN`). No `--proto-redir`,
`--max-filesize`, `--connect-timeout`; no curl version in the verdict.
Impact: M5 can be satisfied by an author-controlled loopback/LAN URL (the claim's "live re-fetch" then proves only
that the author's server still serves the author's text), and 128 MB per row with no global budget; the safety of
the redirect behaviour depends on the host's curl version, which is unrecorded.
Smallest remediation: `--proto '=https' --proto-redir '=https' --max-filesize 8388608 --connect-timeout 10
--max-time 30`; reject non-`https` (and non-public) hosts at `urlOf`; print `curl=<version>` in the verdict.

## S9 — medium — L4 is not held out; L3's quote floor is absent

`ledger66-probe.mjs:238` carries the full `MUTANTS` table (14 names + expected exit/finding) and `:249` the harness;
the plan says "no answer key exists to read". A tool author can overfit every mutant. `--seed` (`:43`) is
caller-chosen, so fixtures can be re-rolled until the tool passes. L3 accepts any quote with `> 25` words as the only
bound (`:154`, `:160`) — a one-word quote binds a row to an item, and `:170` treats *any* new file as an answer.
Impact: the fixtures measure the tool's overfit, not its parser; the "located quote" binding is cheap to fake.
Smallest remediation (L1's call, claim text + future counters): describe L4 as a fixed mutant suite; add
`nwords(q) >= 4` and a minimum answer length at `:154`/`:160`; do not accept `--seed` from the caller (or require it
to be recorded in the plan's counting command).

## S10 — medium — control provenance is not pinned

`c1-controls.sh:22` copies the tool from the **live worktree** (`cp "$LANE/scripts/routed-ledger.mjs"`) and only
echoes its sha (`:23`); the value matches the freeze receipt today (`f92a364d29…`, reproduced), but the freeze pins
(`.ufo/pins/counter-pins.json` rounds 66: `ledger66-probe 453bd64c…`, `deprec66-probe 866bfb86…`, `c1-controls66
a78ea814…`, `c2-donothing66 a6b27ef7…`) are referenced by **0** sites inside the counters. A strengthened tool
integrated later silently re-baselines the control.
Impact: a control run neither proves the pinned tool was used nor that the pinned counter ran; the ratchet can move
the baseline it was scored against.
Smallest remediation: in the control, `git -C "$C" show <freeze>:scripts/routed-ledger.mjs > …` and abort unless
`sha256sum` equals the receipt value; in each counter, compare `createHash` of `process.argv[1]` against the pin and
print `self-sha=` (mismatch → exit 64).

## S11 — low-medium — the archive is not the tree, in both directions

Executed: `.gitattributes` with `e.md export-subst` -> `blob: QUOTE = "$Format:%s$"` but `archive: QUOTE =
"FORGED-ANSWER-TEXT-NEVER-IN-A-BLOB"` (`evidence/outputs.txt` §E2) — commit-message text enters the measured file.
`corpus/ export-ignore` -> the tree holds `corpus/routed-ledger.md`, the archive does not (`t5.sh` T12).
Impact: `export-subst` lets a revision inject quote/answer text that exists in no blob; `export-ignore` can hide
files from every check (fails closed, but reads as "absent at M" in the miss text).
Smallest remediation: covered by S3's `cat-file` variant, or pass `-c core.attributesFile=/dev/null` and reject a
`.gitattributes` carrying `export-subst`/`export-ignore` in the archive's own tree.

## S12 — low — c2's staged input is external and unpinned

`c2-donothing.sh:11` copies `/home/vgpnk/Projects/shokuknow/merge/…/mcp-feature-deprecation-registry.md` byte for
byte. Today sha `599e05228b…` equals the freeze receipt; nothing pins it, so if that external tree later carries a
grounded entry the control can score `DEPREC66_HELD` and be misread as "the counter is broken".
Remediation: assert the sha256 against the receipt value and abort otherwise (or copy the staged file into the
probe fixture set at freeze time).

## S13 — low — L6's "table row" accepts any line beginning with `|`

`ledger66-probe.mjs:279-286`: `l.startsWith('|') && l.includes('routed-ledger.mjs')` anywhere in `SKILL.md`; the
capability row check uses only `l.split('|')[1]`. Reproduction: the `donothing` control appends three stray lines at
EOF and L6 passes (`evidence/outputs-controls.txt`, `held=4/6` with only L2/L3 missing). Presence-only is what the
plan declares, but the words "table row" overstate it.
Remediation: require the row to be inside a table whose header line is above it and whose cell count matches.

---

## What held up (negatives worth recording)

- Scratch confinement on the normal path is real: with `TMPDIR` set, `strace -f -y -e
  trace=openat,creat,mkdir,mkdirat,rename,unlink,unlinkat` on the base rev shows **0** write-opens whose resolved
  directory is outside the scratch dir (`t3.sh` §T9b); `os.tmpdir()` honours `TMPDIR`.
- All three frozen controls reproduce their base receipts exactly tonight (`held=4/6`, `held=4/6`, `held=0/8`,
  `EXIT=1`) and leave 0 files in `SCRATCH` (`evidence/outputs-controls.txt`); both controls assert
  `git rev-parse --show-toplevel` equals the clone before writing, commit only inside it, and use `set -euo pipefail`.
- The bash `EXIT` trap does clean up under SIGTERM for the controls themselves (`t2.sh` §T5a: `cleaned`), so S7 is
  specific to the node counters.
- `--no-live` (deprec66) and `--tool` (ledger66) both fail closed in the tested directions; `M2`'s
  `baseRows.has(id)` correctly rejects rows that already existed at the base.

## Limits

- I did not run the C2 claim end to end (its entry does not exist yet); M5 was exercised as a component with the
  probe's exact curl flags, not inside a full HELD run.
- No HELD verdict was produced for either claim by me; all numbers above are `held=k/8`/`k/6` fixtures or the base
  rev.
- `TAR_OPTIONS` reached tar and mutated the extracted tree (S1 evidence), but I did not achieve command execution
  through it — GNU tar 1.35 rejects the `--checkpoint-action=exec=…` form used.
- Symlink/`export-*`/traversal exploits were proven against fixtures; I did not attempt them against the real lane
  (out of write scope and unnecessary — the code path is identical).
- Host-wide env hardening (`LD_PRELOAD` at the node level) is out of the counters' control and was not tested
  separately from `NODE_OPTIONS`.
