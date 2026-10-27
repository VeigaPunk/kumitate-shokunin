VERDICT: The four frozen files are operable and clean on the happy path, but they are not confined — the archive is not a boundary (committed symlinks and `.gitattributes export-subst` escape or rewrite it, a revision-supplied capture path traverses out of it), revision- and caller-supplied code runs with the caller's full environment, and `NODE_OPTIONS` alone rewrites the verdict from UNMET to HELD exit 0.

## Evidence

All runs used `TMPDIR=/fast/scratch/hyaku/kumitate-r66/K66SentinelCounters` (or a subdir); nothing was written under
`/tmp` or `$HOME`; fixtures are `git init` dirs inside that scratch, each write naming `git -C <fixture>`.
Verbatim outputs: `build/K66SentinelCounters/evidence/outputs.txt` (§E1–E11), `outputs-e13.txt`,
`outputs-forge.txt`, `outputs-controls.txt`; reproducing scripts in `build/K66SentinelCounters/attack/`.

1. Verdict forgery from env (base rev `8d557f85`, which the plan declares UNMET):
   `NODE_OPTIONS="--require ev/forge.mjs" node …/ledger66-probe.mjs <lane> 8d557f85…`
   → `LEDGER66_HELD held=6/6 checks=6 rev=8d557f85312de4fcc82e09ff735d21436bc3746d rule=L66 seed=00` `exit=0`
   (same command without `NODE_OPTIONS` → `LEDGER66_UNMET held=0/6 … exit=1`).
2. Committed symlink as the tool: tree `120000 scripts/routed-ledger.mjs` (link text only) → `held=1/6` and
   `L1 among misses? no` — it executed `<scratch>/outside/fake-tool.mjs`, a file in no revision.
3. Capture-path traversal (`.ufo/pins/source-captures.json` in the revision, `path: "../../…/outside/cap/capture.txt"`):
   `DEPREC66_UNMET held=4/8 … | M5 MISS … | M6 MISS … | M7 MISS … | M8 MISS …` — `M1..M4 held? yes yes yes yes`.
   Same fixture with the path at a FIFO → `exit=137` after `timeout -s KILL 6`, empty output.
4. M8 sandbox: revision's `scripts/sources-check.mjs` wrote outside the archive and echoed a caller env var →
   `escaped: [env:secret-token]`; `SOURCES_CENSUS=<script>` was executed as
   `census argv: validate --file …/deprec66.QxGdyN/corpus/SOURCES.md`. A non-returning script → `exit=137`, no verdict.
5. L2 worktree: fixture with 11 spot-checks committed and the ledger untracked →
   `ledger committed at HEAD: 0  worktree: ?? corpus/routed-ledger.md` and `L2 among misses? no -> L2 held (held=1/6)`.
6. Shell injection: lane dir `…/lane$(touch …/INJECTED)` → `archive-failed`, `injected file exists: YES`.
7. Cleanup: SIGTERM 3 s in → dir `…/tt/ledger66.Zng50E` survives, child pid `384978` survives, `stdout: []`;
   `TMPDIR` at a missing dir → bare `Error: ENOENT … mkdtemp` stack, `exit=1`, no verdict line.
8. Tar/env: `TAR_OPTIONS='--strip-components=1'` extracted 15 entries as 2, exit 0 → caller env mutates the measured tree.
9. Controls reproduce the frozen receipts tonight: `donothing held=4/6`, `autoledger held=4/6`, `c2 held=0/8`, all
   `EXIT=1`, `leftovers in SCRATCH: 0`; `control-tool-sha256 f92a364d…` equals `base/ledger66-donothing.txt`.
   `curl 8.23.0` with the probe's flags: redirect to `file:///etc/hostname` → `curl: (1) Protocol "file" is disabled
   (in redirect)`; redirect to a second http origin → `exit=0`, body `INTERNAL-ONLY-TOKEN`.
10. `strace -f -y` on the base rev: 0 write-opens resolving outside the scratch dir.

## Findings

`K66SentinelCounters-1` **critical** — verdict forgery via caller env. Attacks every claim: the counters pass
`{ ...process.env }` to children (`ledger66:119,137,249`, `deprec66:225`) and are themselves caller-started node
processes, so `NODE_OPTIONS=--require <preload>` prints `LEDGER66_HELD held=6/6 … exit 0` on `8d557f85`.
Reproduce: `attack/…` + `evidence/forge-preload.mjs` (see Evidence 1). Smallest fix: explicit env allow-list for
children (`PATH,TMPDIR,LANG,HOME=T`) and refuse/flag `NODE_OPTIONS|LD_PRELOAD|TAR_OPTIONS|GIT_DIR|GIT_OBJECT_DIRECTORY`.

`K66SentinelCounters-2` **high** — revision-controlled traversal reads host files. Attacks M3/M4 (4 of 8 checks
holdable from outside the repo). `deprec66:132` `const b = rd(c.path)` with `c.path` from the revision's
`.ufo/pins/source-captures.json`; `join(T, rel)` collapses `..`; a FIFO there blocks the counter forever.
Reproduce: `bash attack/e13.sh`. Fix: require `resolve(T,p).startsWith(T+sep)`, `lstat` regular file, byte cap.

`K66SentinelCounters-3` **high** — the extraction root is not a boundary. Attacks L1/L3/L6 and every `rd()`.
`ledger66:50` / `deprec66:48` extract with no symlink guard, so a `120000` blob makes L1 run a host file
(`held=1/6`, L1 held). Reproduce: `bash attack/evidence.sh` (E3). Fix: refuse any symlink/non-regular file after
extraction, `--no-same-owner --no-same-permissions`, or read paths with `git cat-file blob <rev>:<path>`.

`K66SentinelCounters-4` **high** — M8 executes revision code with caller env, no timeout. Attacks M8 and the
counter's liveness: `escaped: [env:secret-token]`, and `exit=137` with no verdict on a non-returning script
(`deprec66:224-225`, `CENSUS` from `:34`). Reproduce: `bash attack/evidence.sh` (E9, E10). Fix: env allow-list +
`timeout: 120000` on both spawns; timeout/signal → MISS.

`K66SentinelCounters-5` **high** — L2 can measure the worktree. Attacks L2's cross-check: `ledger66:137` hands the
tool `--root <live lane>`, so an untracked ledger satisfies L2 while L3 (archive) misses (Evidence 5). Fix: root =
a second clean extraction of M.

`K66SentinelCounters-6` **medium-high** — lane path into `bash -c` (`ledger66:50`, `deprec66:48`): `$(touch …)`
executed; also no `pipefail`, so a failing `git archive` is judged by tar. Fix: argv-only spawn with a pipe, or
archive to a file + `execFileSync('tar', …)`.

`K66SentinelCounters-7` **medium** — no signal/exception cleanup (`rmSync` only at `:292`/`:232`, no handlers):
SIGTERM leaks the extracted archive and orphans the child; a bad `TMPDIR` gives a raw stack with no verdict.
Fix: `try/finally` + `SIGINT/SIGTERM` handlers; validate scratch → `UNMET … | scratch-unusable` exit 2; refuse `/tmp`.

`K66SentinelCounters-8` **medium** — M5 curl is unfiltered (`deprec66:166`): no `--proto-redir`, no
`--max-filesize`, `http://` rows allowed (`:102`), loopback URLs accepted (Evidence 9), curl version unrecorded.
The `file://` redirect is closed on this host only by curl 8.23's default. Fix: `--proto '=https'
--proto-redir '=https' --max-filesize 8388608 --connect-timeout 10`; print `curl=<version>`.

`K66SentinelCounters-9` **medium** — L4 is not held out and `--seed` is caller-chosen: `ledger66:238` carries the
full `MUTANTS` answer key that the plan says "exists [not] to read"; `:43` accepts `--seed`, so fixtures can be
re-rolled. L3 has no quote floor (`:154`, `:160` bound only `> 25` words; `:170` counts any new file as an answer).
Fix (L1/claim text): describe L4 as a fixed mutant suite, add `nwords >= 4` on both quotes.

`K66SentinelCounters-10` **medium** — control provenance unpinned: `c1-controls.sh:22` copies the tool from the live
worktree and only echoes the sha; `.ufo/pins/counter-pins.json` round-66 pins (`453bd64c…`, `866bfb86…`,
`a78ea814…`, `a6b27ef7…`) are referenced by 0 sites inside the counters. Fix: `git show <freeze>:…` + sha assert;
print `self-sha=` and refuse on mismatch.

`K66SentinelCounters-11` **low-medium** — archive ≠ tree both ways: `export-subst` injected a commit message into a
measured file (`blob: QUOTE = "$Format:%s$"` → `archive: QUOTE = "FORGED-ANSWER-TEXT-NEVER-IN-A-BLOB"`);
`export-ignore` hid a committed `corpus/` from the archive. Fix: reject those attributes / use `cat-file`.

`K66SentinelCounters-12` **low** — `c2-donothing.sh:11` copies an unpinned file from `/home/vgpnk/Projects/shokuknow`
(sha `599e0522…` matches the receipt today); if that tree advances the control could score HELD. Fix: assert its sha
against the receipt.

`K66SentinelCounters-13` **low** — L6 accepts any line starting with `|` (`ledger66:279-286`); the `donothing`
control proves it with three EOF-appended lines. Fix: require a real table row above-line header alignment.

## Artifacts

- `kumitate-shokunin/.ufo/waves/round-66/build/K66SentinelCounters/review.md` (full review: severity, exploit,
  evidence, impact, remediation, negatives, limits)
- `…/build/K66SentinelCounters/evidence/{outputs.txt,outputs-e13.txt,outputs-forge.txt,outputs-controls.txt,forge-preload.mjs}`
- `…/build/K66SentinelCounters/attack/{t1,t2,t3,t4,t5,t7,evidence,e13}.sh` (reproducers; run with `TMPDIR` in scratch)
- this report: `.ufo/waves/round-66/w1/K66SentinelCounters.md`

## Limits

- No claim verdict was produced or reproduced: C2's entry does not exist yet (M5 exercised as a component with the
  probe's exact curl flags); no `HELD` run exists from this seat.
- `TAR_OPTIONS` reached tar and mutated the extracted tree, but command execution through it was not achieved
  (GNU tar 1.35 rejects `--checkpoint-action=exec=…` from `TAR_OPTIONS`).
- Symlink/`export-*`/traversal exploits were proven on fixtures only, never against the real lane.
- `LD_PRELOAD`-level interference and non-node callers were not tested; only `NODE_OPTIONS`.
- No pacman/uv/npx installs were needed; no tool versions changed on this host.
Scratch `/fast/scratch/hyaku/kumitate-r66/K66SentinelCounters` deleted after copying the cited outputs into the build dir.
