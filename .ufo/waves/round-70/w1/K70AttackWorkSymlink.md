# K70AttackWorkSymlink — round 70, C1 replay isolation (operability)

Scope: attack the one contract edge "work-root symlink/canonicalization and parent alias to lane control dir". Attack only; no production file, no other seat's artifact, no commit, no push, no git mutation in the lane/fleet.

## Verdict

The candidate `build/K70ExecRunner/scripts/control-replay.mjs` (sha256 `460c0a6c…`, appeared mid-flight) has **no containment check on `--work`**. It accepts a work root that is — or aliases, via symlink — the lane's `.ufo/waves/round-69/controls` directory, and creates its entire run child (versioned private control, fixture git repository, private scratch, receipts, tmp) **inside the frozen controls dir**. Observed live against a scratch fixture: transient presence on a successful run (exit 0, `CONTROL-PASS donothing`), and a persistent `control-replay-*/` leftover there when the candidate is SIGKILLed mid-run. The frozen counter never supplies such a `--work`, so R3–R7 cannot see any of it; HELD 10/10 would not certify that no run ever wrote inside the frozen controls dir. The `--out` path is safe (`openSync(out,'wx')` refuses symlinks). Fixable candidate-side defect; predicate bytes stay frozen.

## Findings

### D1 — `--work` parent alias to the lane control dir is accepted; the run child is created inside the frozen controls dir (candidate defect)
Candidate `runControl` (lines ~205–245) gates `--work` only with `fs.existsSync(work) && fs.statSync(work).isDirectory()` — `statSync` follows symlinks — then `fs.mkdtempSync(path.join(work, CHILD_TAG))` on the raw path, and reclaims with `fs.rmSync(child, {recursive:true, force:true})` in `finally`. Nothing canonicalizes `--work`, compares it to the lane controls dir, or refuses symlinks.

Live attack, fixture lane in scratch (frozen c1 bytes copied so the sha pin passes; stub counter probe; **no original control executed by me — the candidate ran only its own private copies**):
- `T1` `--work <symlink alias → fixture .ufo/waves/round-69/controls>`: candidate exit 0, `--out` tail `CONTROL-PASS donothing`; while in flight the controls dir listed `control-replay-r6zBL8` next to the five frozen receipts; post-run listing back to the five files.
- `T3` `--work <REAL path of the fixture controls dir>` (no symlink needed): same transient child (`control-replay-QvgJIX`) inside the controls dir, exit 0.
- `T2`/`T6` candidate SIGKILLed 2 s in (`--work` alias, slow stub): persistent leftover `control-replay-Nu0JxM` / `control-replay-K8xRTa` inside the controls dir containing `private-c1-donothing.sh`, `receipts/c1-donothing.txt`, `scratch/c1-donothing/fx` — the latter asserted as a git repo whose `git -C … rev-parse --show-toplevel` is `…/round-69/controls/control-replay-*/scratch/c1-donothing/fx`.

The frozen receipts themselves are not overwritten (the private copy substitutes `W="$CHILD/receipts"`), but the frozen-output **directory hosts the whole replay run** — exactly the harm the round-69 lesson recorded ("replays overwrote two frozen receipts … versioned replay execution must use a unique work directory") and that plan §C1 ("unique mkdtemp child under the supplied work root … no frozen output paths") exists to prevent, re-entered through the `--work` side door.

### D2 — contract and counter pin nothing about `--work` resolution (blind spot, unpins candidate behavior)
- The contract sentence "Unique mkdtemp child under the supplied work root" does not say what "under" means through symlinks, and demands no canonicalization, no containment refusal, no lstat.
- The frozen counter only ever supplies fresh real dirs: line 28 `work=path.join(root,`work-${i}`);fs.mkdirSync(work)` and line 38 `--work root` for R9. R3–R7's reclaim term `fs.readdirSync(work).length===0` therefore never exercises an alias (for a controls-alias it could never be 0 anyway — the frozen dir is non-empty — but the probe never passes one).
- Isolated counterexample `attack-work-symlink.mjs` (godspeed-iterated patterns): a canonicalize-then-mkdtemp candidate shape lands the child in the alias target; a `path.resolve`-only containment guard is bypassed by any symlink alias (`guard(resolve(alias))=false` vs canonicalized guard `=true`); an escape alias to an unrelated empty dir satisfies the raw-path emptiness check whenever the target ends empty. The present candidate's raw-path mkdtemp is the same class of unguarded: "under the supplied work root" is enforced nowhere.

### D3 — the predicate cannot see any of it (counter blind spot, independently verified)
- R1 pins only the two control scripts; R3–R7's `preserved` map is snapshotted from the **archive tree** (`tree/.ufo/waves/round-69/controls`), never the live controls dir; an extra top-level file is outside the snapshot map. So transient or interrupted writes inside the live `round-69/controls` are invisible to REPLAY70 scoring. (Consistent with sibling `K70AttackReceiptOverwrite` F1, verified independently here by reading probe lines 23–25/33.)
- Consequence: a 10/10 HELD certifies neither "no transient writes inside the frozen controls dir" nor (per sibling) "live receipts intact".

### D4 — `--out` exclusive creation is safe (no defect)
Candidate uses `fs.openSync(out, 'wx')` with no pre-check. `T4`: `--out` = symlink to an existing victim → exit 73 (`CANTCREAT`), stderr `refusing to overwrite existing output`, victim bytes intact. Isolated counterexample additionally measured `wx` → `EEXIST` for symlink-to-existing **and dangling** symlinks, while an `existsSync`+`writeFileSync('w')` shape would write through a dangling symlink (existsSync returns false for dangling). The candidate chose the safe mechanism; the contract does not pin the mechanism, so this is recorded as verified-safe, not as a defect.

## Freeze consequence

- Real lane verified untouched throughout: `git status --porcelain .ufo/waves/round-69/` → 0 lines; the five receipts equal the base `78b98d…` sha256 values before and after all runs (values in Commands below). Frozen probe sha `63f52b75…` unchanged. All attack runs used a scratch fixture lane; the candidate's `--lane` never pointed at the real lane.
- If this candidate shape ran in the real lane with a hostile or mistaken `--work` (or the controls dir passed directly), an interruption — probe timeout is 300 s (`replay70-probe.mjs` line 20), the candidate's own child timeout 280 s, `forgecapture` is network-dependent and slow — leaves `control-replay-*/` (private script + receipts + fixture git repo) inside `.ufo/waves/round-69/controls/`, a non-receipt entry in a frozen, committed set. The close-sequence census/freeze-map would flag a leftover present at measurement; one created and removed earlier leaves zero trace; the predicate sees none of it either way.
- Classification: fixable candidate/contract-clarity defect on the operability axis. Not a predicate defect, and not a tradeoff the canonical judge must reject — the frozen counter must not be amended after scoring; the correction belongs in the candidate plus a selftest case.

## Smallest safe correction

Candidate-side (L1/executor's choice of exact shape):
1. In `runControl`, after the existing directory check: canonicalize once `const workReal = fs.realpathSync(work)` (failure → `USAGE`), and refuse (`USAGE`, or a dedicated exit) when `workReal` equals or is inside `fs.realpathSync(path.join(lane, '.ufo/waves/round-69/controls'))`; defense in depth, refuse anywhere inside `fs.realpathSync(lane)` since the lane tree is read-only production. Create the child under `workReal`. Raw-path `mkdtemp` is then safe, but mkdtemp under the canonical root is the cleaner form.
2. Add one hermetic selftest finding id: `--work` as a symlink alias to the fake lane's controls dir (and as the real path of it) is refused with the expected exit — the selftest already builds fake-lane cases, so this is cheap and matches the "stable finding ids and expected exit maps" contract.
3. Keep `openSync(out, 'wx')` (already correct).

Contract-text note for L1 (without touching frozen bytes): "supplied work root must not alias or lie inside the lane tree; implementations canonicalize and refuse" — clarifying text only.

## Commands and outcomes observed

- `read` of `~/.omp/agent/RULES.md` (tooling directive; no installs made, pacman untouched — record below).
- `read` of `round-70/plan.md`, frozen `probe/replay70-probe.mjs` (sha `63f52b75d9c0e3d80a91c6957ce4624cbd46a9488841a962a75bc62ffecbf0c1`), `base/replay70-base.txt`, `base/freeze-map.txt` (`README_MAP: CLEAN`), `corpus/lessons/round-70.md`, `round-69/probe/c1-controls.sh`, `round-69/probe/c2-controls.sh` (read-only; originals never executed).
- `grep -nF` of the four assignment tokens in both frozen controls: `LANE=`/`PROBE=`/`W=`/`S=` each occur exactly once (c1 lines 18–21, c2 lines 22–25) — substitution is line-targeted, no stray second occurrence.
- `sha256sum` of frozen controls: c1 `01efd6dde4c9…aeda12`, c2 `679b7d9619ab…3a66f4` — equal to the candidate's `FROZEN` pins, so a byte-copy fixture passes the pin check.
- `node --version` → v24.21.0 (preinstalled; no install).
- No candidate at first check (`build/K70ExecRunner` absent, ~12:10 UTC); candidate `build/K70ExecRunner/scripts/control-replay.mjs` appeared at 12:22–12:23 UTC and was inspected and attacked live. No waiting/polling was used; the isolated contract counterexample was built first and remains valid for any candidate shape.
- Isolated counterexample: `node build/K70AttackWorkSymlink/attack-work-symlink.mjs` → exit 0; transcript in `run1.out` / `transcript.txt` (fixture controls dir with 5 fake receipts; S1 alias child `inside controls? = true`, in-flight listing shows `replay70-0xgK22` among frozen receipts, interrupted leftover `replay70-BpjG0N`; S2 escape emptiness mid-run 1 / post 0; S3 textual guard bypass `false` vs canonicalized `true`; S4 `wx`→`EEXIST` both symlink kinds, `existsSync+w` writes through dangling symlink).
- Live attack: `bash build/K70AttackWorkSymlink/live-attack.sh` → exit 0; transcript `live-attack.out`: T1 exit 0 (`CONTROL-PASS donothing`, in-flight `control-replay-r6zBL8` in controls dir); T2 SIGKILL rc 137, leftover `control-replay-Nu0JxM` with private script/receipts/scratch/tmp, removed by driver; T3 real-path alias exit 0, transient `control-replay-QvgJIX`; T4 exit 73, victim intact; T5 baseline exit 0, work dir 0 files after; final controls listing = the five frozen files.
- Re-run for fixture-toplevel receipt: leftover `control-replay-K8xRTa`; `git -C …/scratch/c1-donothing/fx rev-parse --show-toplevel` → that path (fixture git repo inside the controls-dir child).
- Real lane, before and after everything: five receipt sha256 `a7476ee5…` / `0fd37a31…` / `003b059b…` / `e9e66843…` / `f2ffbd3a…` (identical to base `78b98d…`); `git status --porcelain .ufo/waves/round-69/` → 0 lines.
- Scratch `/fast/scratch/hyaku/kumitate-r70/K70AttackWorkSymlink/` created explicitly, receipts copied to the private build dir first, then removed (`ls | grep -c K70AttackWorkSymlink` → 0). Only the seat's own scratch was touched.
- Not run: the original `c1-controls.sh` / `c2-controls.sh` (never executed); the frozen counter against the live lane (no scoring event); the real r69 probes (stubbed in the fixture).

## Install record

None. No `pacman`, `uv`, `npm -g`, `cargo`, or binary downloads. `node` v24.21.0 and `git` 2.56.0 were already present.
