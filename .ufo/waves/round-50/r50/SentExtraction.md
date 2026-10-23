# SentExtraction — frozen-counter extraction boundary

Axes: **operability** (whether G50 actually exercises the candidate guard) and **coverage** (whether both frozen counters establish the claims they report).

## Verdict

**High, conditional on an untrusted `<rev>`:** G50 executes candidate-revision JavaScript as the probe's user and trusts its output. A locally constructed scratch commit with counterfeit `scripts/*` and matching `SCORECARD.md` printed `GUARD_HELD held=8/8` without running bubblewrap or testing a real cap-run guard. Do not run G50 on an untrusted commit with credentials or useful host access. This is a counter-integrity limitation, not evidence that the current lane commit is malicious.

**High, static command-construction issue:** G50 interpolates caller-controlled lane and rev into a `bash -lc` command. `JSON.stringify` is not shell escaping: Bash still performs `$()`/backtick expansion inside double quotes. An untrusted `rev` can therefore run shell commands before Git resolves it. This was identified from the source; I did not execute an injection.

**Medium, extraction containment limitation:** ordinary Git archive paths cannot escape using `../` or absolute path components in the tested Git implementation; `git archive` also rejected malformed trees made with `--literally`. However, Git symlinks are preserved by tar. A symlink can point outside extraction root T, and the probe's subsequent `existsSync`, `readFileSync`, and `node <path>` follow it. Archive extraction is not a boundary for the code the probe subsequently reads or runs.

**Medium, R50 evidence limitation:** R50 does not use `git archive` and does not execute target scripts. It reads/parses target-revision text with `git show`/`git ls-tree`. A crafted revision containing plausible receipts and lesson text can meet its in-revision predicates without fetching the referenced sources or running B49. Current live R7/R8 dependencies must also pass; they did during the scratch demonstration below. Treat the counter as a text/shape audit, not independent provenance verification.

## Evidence — source and paths

Inspected frozen inputs at lane HEAD `6927903f99bbc26e397aa47387aa76950f42b3a5`:

- `.ufo/waves/round-50/probe/bindguard50-probe.mjs`, SHA-256 `a9e79600d8849d947f0074b6f2964c17611b40a324afb9c5793ea7f212b61dc3`.
- `.ufo/waves/round-50/probe/repairs50-probe.mjs`, SHA-256 `f69dbc3ecb6212646ed07503cfe395c8a32d5044e2ea8184b86ca74b7dca240d`.

G50 makes T at lines 54-56, then constructs and runs `bash -lc` with interpolated `lane` and `rev` at lines 61-63. It extracts there at 64-67. Lines 72-75 hash extracted scripts and line 115 reads the extracted scorecard; lines 78, 105, 109, 127, and 133 execute extracted cap-run, bind-oracle, and proxy-check. The checks accept their exit status and strings (G2/G3/G4/G5/G7/G8, lines 81-134); G6 compares the extracted files to pins in that same extracted scorecard (113-122). No signature, independent script hash, or trusted runner authenticates the candidate revision.

R50 instead reads blobs through `git show <rev>:<path>` and enumerates paths with `git ls-tree` (lines 51-58). R2/R3 only check a receipt's first nonblank line and whether the expected hash occurs anywhere (68-77); R4 checks receipt text, parseable dates, distinct bytes, and a textual `ORACLE_HELD` marker (79-92). It does not fetch either source or execute B49. R7 is a live census and R8 reads the live fleet `master` report (102-112), so those two checks are not controlled by the candidate lane revision.

## Reproductions (all scratch-only; removed afterward)

### 1. Counterfeit G50 revision prints HELD

Built a disposable Git repository at `/tmp/sent-g50-forge-c35xzg73/repo`, with fake `cap-run.mjs`, `bind-oracle.mjs`, and `proxy-check.mjs`, plus scorecard pin lines computed from those fake bytes. The fake cap-run printed the expected refusal/pass strings, made G3's `out.txt`, printed `TMPFS=true`, and returned success for the no-bind child without invoking bwrap. The probe itself was the lane's frozen G50 file.

Command:

```text
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-50/probe/bindguard50-probe.mjs /tmp/sent-g50-forge-c35xzg73/repo 48bcb71c53242b89d7ad4e077269dcf378457867
```

Output / exit:

```text
exit 0
  G1 PASS present
  G2 PASS refused=8/8
  G3 PASS exit=0 bound_rw=true tmpfs=true
  G4 PASS exit=0 VERDICT: PASS
  G5 PASS exit=0 VERDICT: PASS
  G6 PASS pins=5/5
  G7 PASS exit=0 PROXY: MATCH
  G8 PASS exit=0 host_marker=false
BINDGUARD50: GUARD_HELD held=8/8 checks=8 rev=48bcb71c53242b89d7ad4e077269dcf378457867 rule=G50 caprun_sha256=736ca35c5b1304eb71c7b9797d5ac70009adc43aca8052829d9f819f6e1f2d71
```

Counterfeit `cap-run.mjs` SHA-256: `736ca35c5b1304eb71c7b9797d5ac70009adc43aca8052829d9f819f6e1f2d71`; counterfeit `SCORECARD.md` SHA-256: `d22009aab8a9c1e42a3e70e071edc8405546627f126830186c780893ae06f67e`. The scratch repo was removed. A poisoned scorecard alone only controls G6; fake scripts plus self-consistent pins make the full predicate pass.

### 2. Path traversal vs symlinks

On Git 2.56.0 / GNU tar 1.35, tested `git archive HEAD | tar -x -C <scratch-extract>` for a valid tree containing symlinks to `../outside-target` and an absolute path. Both extracted entries remained symlinks; the outside target file remained unchanged, and the archive had no descendants through either link. Thus the tested valid Git tree did not write an outside file merely by extraction.

Also attempted raw tree entries named `../outside`, `/tmp/outside`, and `scripts/../../outside` with `git hash-object -w -t tree --stdin`: each exited 128 with `error: object fails fsck: fullPathname: contains full pathnames` / `fatal: refusing to create malformed object`. Using `git hash-object --literally` to force malformed `../outside-dotdot.txt` and absolute-path trees created objects/commits, but `git archive <commit>` exited 128 with `error: invalid path ...`; tar received no archive and exited 2. Neither outside-extract target appeared. These tests cover normal object creation and Git's archive rejection in this environment; they do not claim safety for a Git implementation that emits malformed archive members.

A separate valid tree had `scripts/cap-run.mjs` be a symlink to an external scratch `outside-cap-run.mjs`. After archive extraction, the extracted path still pointed outside T, and `node <T>/scripts/cap-run.mjs --selftest` exited 0 and printed `EXECUTED_OUTSIDE_EXTRACTION` (external file SHA-256 `58354d10225f673620832b2cd6fb1f332581ccea1a72e4679fb64b2b67ea28c8`). So tar did not copy an outside file, but G50's subsequent dereference executes outside-T content. All scratch directories were removed.

### 3. Crafted R50 revision prints LEDGER_HELD

Made a disposable lane at `/tmp/sent-r50-forge-enqbn7l_/lane` with minimal text satisfying R1-R6: arbitrary `## Gate` words; HOLD lines carrying the expected hashes but an invalid example URL; three forged `run-at` lines 5 minutes apart with only the expected `ORACLE_HELD held=6/6` text; and minimal SKILL/round-50 section strings. No referenced documents were fetched and B49 was not run. Ran against the live fleet because frozen R7/R8 read that external state:

```text
node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-50/probe/repairs50-probe.mjs /tmp/sent-r50-forge-enqbn7l_/lane a4cda7c64dc503c46193c6a68385d75adb232390 --fleet /home/vgpnk/Projects/shokunin
```

Output / exit:

```text
exit 0
  R1 PASS gate-ledger
  R2 PASS REOPEN50: HOLD source=https://invalid.example/source sha256=2cb77df2f4be
  R3 PASS REOPEN50: HOLD source=https://invalid.example/source sha256=c16859e07dac
  R4 PASS files=3 distinct=3 held=3 span_s=600
  R5 PASS swept
  R6 PASS sections
  R7 PASS exit=0
  R8 PASS erratum
REPAIRS50: LEDGER_HELD held=8/8 checks=8 rev=a4cda7c64dc503c46193c6a68385d75adb232390 rule=R50
```

This demonstrates that R50's lane-revision checks are forgeable text predicates. It is consistent with plan.md's explicit R4 limit (receipt preamble/distinctness is not proof of actual elapsed time), but R2/R3 likewise do not independently establish their source fetches.

## Smallest remediation / relevance

- **Do not accept untrusted revisions in this invocation model.** For G50's command construction, replace `bash -lc` interpolation with direct argv (`git -C lane archive rev`) and a streamed argv-based tar child; `JSON.stringify` is not shell quoting. To safely score untrusted revisions, run candidate scripts in a disposable isolated environment with a minimal env, no secrets, restricted filesystem/network, and independent tests that do not trust candidate stdout or its own scorecard pins.
- Keep extraction in a fresh scratch directory, but do not treat that as a sandbox while following archive symlinks. If symlinks are not part of the intended repository contract, reject them or materialize files without following links before executing; isolation remains necessary for arbitrary candidate code.
- For R50, either state explicitly that the verdict is committed-record shape only, or use independent source/hash fetches and actual B49 executions to substantiate the receipt predicates. R7/R8 remain live external dependencies, as the frozen code already makes explicit.

The flaw matters if the revision/ref or repo contents are attacker-controlled or if `GUARD_HELD`/`LEDGER_HELD` is treated as independent proof. It does not establish that current lane HEAD or the L1's trusted committed revision contains malicious code. No lane, fleet, or Git state was changed; no tools were installed.