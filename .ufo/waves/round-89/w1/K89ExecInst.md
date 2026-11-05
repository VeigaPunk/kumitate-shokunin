# K89ExecInst — receipt-bind v3 candidate (round 89, C1)

Seat: executor, leaf member. Base `a5d2503393fc5646acb6468888d8b12a445bf62d`. Lane `kumitate-shokunin`.
Build dir: `.ufo/waves/round-89/build/K89ExecInst/`. No git mutation; nothing committed (see Limits).

## Result

- **Candidate meets the assignment's acceptance on its own bytes.** `receipt-bind-v3.mjs` (sha256
  `37201ad0c6acd4c51b8804fa66ac9606469a181891dbed1d5ee46c56176e1bb3`) → selftest `PASS held=68/68`;
  frozen probe with `--tool` = candidate → `C89_C1: HELD held=30/30`, exit 0.
- **The frozen kill rule is firing on something else.** The lane's working-tree copy of
  `scripts/receipt-bind.mjs` (uncommitted, sha256 `70dbcd5d02e30c831bc7ba9b80539d7443cb76a0e0d9dad0ad70e1e293384b4a`,
  not authored by this seat) also scores **`C89_C1: HELD held=30/30`**. The plan names "the worktree twin of the
  integrated instrument" as a kill-rule control, so if that copy is what M integrates, **C1 is UNMET**.
  It skips a claimed behaviour the probe does not test (below). I did not edit it.
- **Probe defect (a finding, not edited).** `probe89-c1.mjs` has no arm for an *absolute* in-lane token naming a
  mode-120000 instrument. A full-path `realpath` skips the refusal and still passes all 30 arms.

## Changes landed (`receipt-bind-v3.diff`, 236 lines, base → candidate)

1. **Realpath lane membership** (absolute tokens). Membership is decided on
   `join(realpath(dirname(token)), basename(token))` against `realpath(lane)`. A token whose parent is absent keeps
   the lexical judgement. `/proc/self/root<lane>/scripts/x.mjs` resolves in-lane and is hashed at the judged rev.
   `laneRel`'s `root` refusal is unchanged.
   *Deviation from the brief, deliberate:* I resolve the **parent**, not the whole token. Resolving the whole token
   follows an in-lane symlink to its target, so the mode-120000 check would see the target's mode, not the link's.
   Observed effect: the lane working-tree copy, which resolves the whole token, takes the target's path and reads CLEAN on this fixture (`abs-symlink-check.txt`).
2. **BOM.** One leading U+FEFF is stripped from the receipt text before any field parsing.
3. **SYMLINK_INSTRUMENT.** (a) In-lane: `git ls-tree <rev> -- <rel>` mode `120000` → fail-closed, instead of hashing
   the link text. (b) External: `lstat(abs)` is a symlink → fail-closed. Added to the header token list, the USAGE
   text and the contract string `kumitate-receipt-bind-v3`.
4. **TOCTOU-tight read.** `openSync(path, O_RDONLY|O_NOFOLLOW)`, `fstatSync(fd)` for the regular-file and size
   checks, `readFileSync(fd)`, `closeSync` in `finally`. Every probe arm that base v2 already passes (27 of 30) still passes; the three arms base v2 fails are the intended ones.
   The selftest keeps all 59 base cases.

Selftest: 9 cases added (59 → 68): `clean-bom`, `bom-rev-precedence`, `alias-proc-root-in-lane`,
`alias-proc-root-negative`, `symlink-instrument-120000`, `symlink-instrument-twin-target-binds`,
`symlink-instrument-absolute-token`, `symlink-instrument-external`, `receipt-is-directory`. All 59 base arm names
are present in the candidate's output; none is missing; zero arms fail.

## Evidence (all in the build dir)

| receipt | what it shows |
|---|---|
| `selftest-v3.txt` | candidate `RECEIPT_BIND_SELFTEST: PASS held=68/68` |
| `selftest-base-v2.txt` | base v2 `PASS held=59/59` (the count the brief compares against) |
| `probe89-c1-v3.txt` | candidate `C89_C1: HELD held=30/30`, exit 0 |
| `probe89-c1-base-v2-control.txt` | base v2 `C89_C1: UNMET held=27/30`; failing arms exactly `alias-proc-root`, `bom-rev`, `symlink-instrument` (matches the control table) |
| `probe89-c1-lane-worktree-copy.txt` | lane working-tree copy `C89_C1: HELD held=30/30` |
| `abs-symlink-check.txt` | fixture repo (own `git init`, verified toplevel): absolute in-lane symlink token → lane copy `CLEAN matched=1`; candidate `FAIL-CLOSED SYMLINK_INSTRUMENT` (and the relative token also refuses) |
| `receipt-bind-v3.diff` | the four changes plus selftest cases, against base `1f11f124…` |

Commands run (read-only against the lane): `git show a5d2503:scripts/receipt-bind.mjs` (base hash confirmed
`1f11f124…`), `node --check`, `node <candidate> --selftest --work <scratch>`, `node probe89-c1.mjs --lane <lane>
--work <scratch> --rev a5d2503… --tool <tool>` for the candidate, the base copy, and the lane copy.

## Notes on the probe's arms (for the L1)

- `alias-proc-root`, `bom-rev`, `symlink-instrument` pass for the candidate and fail for base v2, as designed. Each
  arm discriminates; I did not weaken any of them.
- `limit-before-read`, `sweep`, `dup-*`, etc. all pass unchanged.
- `symlink-instrument` (A30) checks only the **relative** token `node scripts/link-<nonce>.mjs`. The lane working-tree copy passes it. The same copy reads CLEAN on the **absolute** token that names the same in-lane symlink (`abs-symlink-check.txt`), and the probe has no arm that asks for that. An arm for "absolute in-lane token naming a 120000 entry" would separate them. That is a probe change for the L1 or the next round; this seat did not make it.

## Limits and open items

- **TOCTOU is only partly closed.** The receipt read is descriptor-based, but `lstat` runs before `open`, so the
  `fstat` `isFile`/size re-check on the descriptor is not reachable by a deterministic fixture. The
  `receipt-is-directory` selftest case proves the lstat verdict, not the fstat branch, and no probe arm exists
  (plan limit (d) stands). The external-instrument path (`lstat` → `readFileSync(abs)`) keeps a small window; the
  brief did not ask for it to be closed.
- **Harm rules not run by this seat.** H1–H4 (proxy-check, surface-probe, sources-check, census) and the
  integration-time H5 belong to the L1 at M. I changed nothing under `scripts/`, `corpus/`, `SKILL.md`,
  `SCORECARD.md`, `LOG.md`, `probe/`, `controls/`, `plan.md`, `.ufo/pins/` or `MANIFEST.json`.
- **Not committed.** The brief said "commit the transcripts into your build dir". I may not run mutating git, so the
  files are written but uncommitted; the L1 commits.
- **Abs-symlink finding is observed, not inferred.** The lane copy's CLEAN result on the absolute symlink fixture
  is recorded in `abs-symlink-check.txt`. Whether the L1 integrates the lane copy or my candidate decides C1 under the
  frozen kill rule.
- **Tooling.** None installed or updated (no `pacman`, `uv tool`, `npm -g`, or `~/.local/bin` writes).
- **Scratch.** Removed after the receipts were copied into the build dir. No `/tmp` paths are cited.
- **Lane working tree (not mine).** `scripts/receipt-bind.mjs` is modified and uncommitted in the lane (see above);
  I read it and did not write to it.

## Checks the main agent should run after integration

1. `node scripts/receipt-bind.mjs --selftest --work <scratch>` on the integrated bytes: expect `PASS held=68/68`.
2. `node .ufo/waves/round-89/probe/probe89-c1.mjs --lane <LANE> --work <SCRATCH> --rev a5d2503393fc5646acb6468888d8b12a445bf62d --tool <integrated>`.
3. The same probe with `--tool` = the lane working-tree copy, to confirm it still scores 30/30 (kill-rule input).
4. H1–H5 as declared in the plan.
