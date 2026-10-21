CRITIC pin modes=14 gaps=11 blockers=2

# CriticPinSemantics — attacking PIN v1 (round 36 build, read-only)

**Scope.** I attacked the frozen PIN v1 contract and its live implementations:
- ExecClaimsPin: `w/KumitateR36.ExecClaimsPin/lane/scripts/claims-check.mjs`
- ExecProxyPin: `w/ExecProxyPin/lane/scripts/proxy-check.mjs`
- ExecSurfacePin: `w/ExecSurfacePin/lane/scripts/surface-probe.mjs` (still in progress at 02:30, so its line numbers may move)
- the candidate pin file: `w/ExecPinFiles/lane/.ufo/pins/origin.json`
- the checklist rewrite: `w/ExecChecklistRewrite.patch`

Here `w/` means `/fast/scratch/kumitate-r36/w`.

**Method.** Each counterexample (E1–E9) ran one of those scratch gates with `--self` set to the lane. Crafted pins came from bash process substitution (`--pin <(…)`), so no file was written anywhere.

**Axes.** Every finding hits operability (C1). Coverage (C2) is touched only through M10b: the fidelity sweep that grades the 9 new sections has its own pin reader.

| # | mode | expected | observed (evidence) | gap | smallest fix | class |
|---|---|---|---|---|---|---|
| M1 | pin clone absent | exit 2, naming the pin and its `recreate` | E6. claims/proxy print `CLAIMS: FAIL-CLOSED (SRC_NOT_A_DIR --src /fast/scratch/kumitate-r36/gone is absent)`, although no `--src` was passed. surface prints `SRC_REV_UNVERIFIABLE: pin clone … is missing`. No gate falls back to the operator checkout ✓ | two tokens for one fault; no recovery hint | use SRC_NOT_A_DIR in every gate; when the src came from the pin, the detail reads `pin clone <c> is absent (pin <file>; recreate: <pin.recreate>)` | fixable, low |
| M2 | clone is a symlink | score the target at the target's HEAD | `statSync` and `git -C` follow links (ScoutPinDesign.md:56: 40-hex, exit 0) | none of its own. A link to a writable tree at the pinned HEAD is case M4 | nothing beyond M4 (optional: JSON `src` = realpath) | info |
| M3 | clone is a git worktree | rev-parse works through the `.git` file | The operator checkout already lists `/tmp/ufo-fsd-alpha-validation 95273d18 … prunable` (directory gone, so the gate fails closed). Creating a worktree writes `.git/worktrees/` into the operator checkout. claims `walkFiles` lists a `.git` *file*, because PRUNE_DIRS prunes directories only (claims-check.mjs:157-165); that file is outside the S/R universes | none in the gates | keep `recreate` a standalone clone (both candidate strings are) | info |
| M4 | dirty tree with HEAD == pin | refuse, or mark the verdict | E4: a tracked edit (` M scripts/claims-check.mjs`) at HEAD 0614092, with a pin at that HEAD, gives `CLAIMS: DRIFT (… +178 more; src-rev=0614092e0804)`. The edited bytes were scored under a clean revision name; ExecClaimsPin.md:103 concedes this. Realistic path: 16 lane docs run with `--src ~/Projects/ufo-fsd-alpha` (e.g. corpus/knowledge/route-probe-cluster.md:410), which is a writable tree | `src-rev=` certifies HEAD, not the bytes scored | after the HEAD check, run `git --no-optional-locks -C <src> status --porcelain --untracked-files=normal`; non-empty ⇒ `SRC_TREE_DIRTY` exit 2 (30 ms; 0 lines on the pin today). `--no-optional-locks` is mandatory: git-status(1) "BACKGROUND REFRESH" writes the index | contract extension (L1's call). If declined, the report must define src-rev as "HEAD of the scored tree" |
| M5 | not a repo, or a subdirectory | SRC_REV_UNVERIFIABLE | A plain directory gives UNVERIFIABLE ✓ (ExecClaimsPin evidence). E3: `--src <pin>/crates` gives `CLAIMS: DRIFT (… +136 more; src-rev=31c465f15669)`. A directory nested inside another repo reports that repo's HEAD (E2b: MISMATCH, which is the wrong token) | a wrong-root tree gets the pin revision as its label (DRIFT, never a false MATCH) | use the same spawn: `git rev-parse --show-toplevel HEAD`; refuse unless toplevel == realpath(src) (observed toplevel `/fast/scratch/kumitate-r36/src` for src `…/crates`) | fixable, low |
| M6 | git missing | SRC_REV_UNVERIFIABLE, exit 2 | E7 (`PATH=/nonexistent`): `SRC_REV_UNVERIFIABLE git rev-parse HEAD in … is not a repository HEAD`, exit 2 ✓. The claims and proxy suites have no git-absent case. Their new fixture-repo cases FAIL rather than SKIP on a host without git (ExecProxyPin.md:51) | ENOENT is labelled "not a repository"; the hermetic suites now depend on the host | name ENOENT in the detail; add a `PATH=''` case (surface already has one); SKIP the fixture-repo cases when `git --version` fails, following the lane precedent at sources-check.mjs:861 | fixable, low |
| M7 | `--src` points elsewhere | SRC_REV_MISMATCH | E2b: `--src <lane>/corpus` (HEAD 0614092) gives `FAIL-CLOSED (… != pin 31c465f15669 …)`, exit 2 ✓ | none of its own. The operator checkout at the pinned HEAD is case M4 | optional: the MISMATCH detail names `--pin <file>` as the way to score a different revision | info |
| M8 | `GIT_*` environment pollution (added mode) | the assertion reads `<src>`'s own repo | E2: `GIT_DIR=<pin>/.git … --src <lane>/corpus` (real HEAD 0614092) gives `CLAIMS: DRIFT (… +178 more; src-rev=31c465f15669)`, exit 1. **A pin mismatch that passes**, which is a frozen falsifier. The git child env is `{ ...process.env, GIT_OPTIONAL_LOCKS:'0', … }` (claims :154, proxy :382); surface (:381) and fidelity (:688) inherit the whole env. githooks(5) line 23: hooks export GIT_DIR. `--show-toplevel` does not catch it (it prints the polluted cwd); `status` does (1107 lines) | false provenance | spawn git with every `^GIT_` key removed. ScoutPinDesign.md:63 asked for exactly this; no executor applied it | **BLOCKER** (a 1-line fix at each of 4 sites) |
| M9 | relative `--pin` or relative `clone` | deterministic outcome | E8: from /tmp, `--pin .ufo/pins/origin.json` gives `PIN_MALFORMED --pin /tmp/.ufo/pins/origin.json is absent`, exit 2 ✓. `--pin` is cwd-relative, while `--scorecard` is `--self`-relative (claims-check.mjs:507). E9: `"clone":"src"` gives MATCH from cwd=/fast/scratch/kumitate-r36 but `SRC_NOT_A_DIR --src /tmp/src` from /tmp | one pin, two outcomes depending on cwd | PIN_MALFORMED unless `isAbsolute(clone)`; USAGE states that `--pin` is cwd-relative | fixable, low |
| M10a | silent unpin | an active lane pin can be proven | claims/proxy `defaultPinPath` returns `statKind(p)==='file' ? p : null` (claims :115, proxy :343). A deleted or renamed pin, a directory, or a dangling symlink therefore falls back to `resolveSrcDefault()`: `$UFO_SRC`, else `~/Projects/ufo-fsd-alpha` (claims :170). Surface treats a directory as PIN_MALFORMED (`existsSync`, :1801). The checklist substrings `SURFACE_PROBE: CLEAN`, `PROXY: MATCH`, `CLAIMS: MATCH` and `FIDELITY: CLEAN` all accept the unpinned legacy line (ExecClaimsPin no-pin run: legacy MATCH, exit 0) | the checklist cannot see falsifier #1; the gates disagree when the pin path is not a regular file | make items 3/8/10/14 expect `src-rev=` (exit 0 already means MATCH/CLEAN, e.g. claims-check.mjs:538); treat "exists but is not a regular file" as PIN_MALFORMED in every gate | fixable, med |
| M10b | pin readers diverge | one authority | Five readers exist: claims :113-190, fidelity (ExecClaimsFidelity) :~660-707, proxy :341-414, surface :341-400, known (ExecSurfaceKnown) :415-430. E5: one pin (uppercase revision, no `repo`) gives claims `MATCH (… src-rev=31c465f15669)` exit 0, but surface `PIN_MALFORMED: pin repo is absent` exit 2. Proxy justifies its copy with "each gate must stand alone", but proxy-check.mjs:297 already imports `probeSections` from claims-check | duplicate authority; the same pin gets different verdicts | export ExecClaimsPin's `resolveOrigin` from claims-check.mjs; proxy and `runFidelity` call it; surface imports it, or keeps a byte-identical copy plus one cross-gate case that feeds the same pin fixtures to all three gates | fixable, med |
| M10c | cite-check and round-gate stay unpinned | move (f): "all items run green at the pin" | Item 1 is still `node scripts/cite-check.mjs`, which resolves `$UFO_SRC`, else `~/Projects/ufo-fsd-alpha` (cite-check.mjs:106-120, 276). Item 6 (`round-gate.mjs`) defaults `--origin` the same way and probes it with `git cat-file -e` (round-gate.mjs:150-166, 336, 361). The rewrite's prose says "Item 1 (`cite-check`) still takes an explicit `--src`" (ExecChecklistRewrite.patch:20), but the command has none (:23) | falsifier #1 fires as built; CITE_CHECK and ROUND_GATE verdicts carry no `src-rev=`; the split stays hidden until the next upstream commit | item 1 becomes `node scripts/cite-check.mjs --src /fast/scratch/kumitate-r36/src` (baseline/cite-pin.txt shows it runs there, exit 1, which is inside 0/1); item 6 gets `--origin /fast/scratch/kumitate-r36/src` (same 41-commit history: `rev-list --count` 41/41); fix the prose. Otherwise the judge must reject C1's "every lane gate verdict" wording | **BLOCKER** |
| M10d | `--checklists --pin X` | X is honoured or rejected | surface returns `runChecklistsMode` before loading any pin (:1793); each child reads its own default pin | the flag is silently ignored | exit 64 for `--pin` or `--known` combined with `--checklists` | fixable, low |
| M11 | recreate gives the same tree | same tree, durable recipe | Two strings exist. ScoutPinDesign: `git clone --no-local --no-checkout <path> …`. ExecPinFiles (the committed candidate): `git clone --no-hardlinks file://<path> …`, without `--no-checkout`. Same tree today: HEAD 31c465f1, tree 1815a679… (ScoutPinDesign.md:31 found ls-tree identical). The pin has no .gitattributes, .gitmodules or .lfsconfig; core.autocrlf is unset; `.git/shallow` (4 lines) is inherited because the operator checkout is itself shallow | (i) the ExecPinFiles string checks out the upstream tip first, and global `filter.lfs.*` plus `/usr/bin/git-lfs` would fetch any tip LFS object over the network, which has nothing to do with the pin [INFERENCE: no LFS file today]; (ii) the only source is the shallow, writable operator checkout; (iii) create-only: an a-w clone needs `chmod -R u+w` before rm | commit the `--no-checkout` variant with a GitHub fallback (below) | fixable, low-med |

## Smallest correction set (in order)
1. **M8.** Fix every git spawn: claims `gitHead`, proxy `gitHead`, surface `readGitHead`, and the fidelity reader. Pass `env: { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith('GIT_'))), GIT_OPTIONAL_LOCKS: '0', GIT_TERMINAL_PROMPT: '0' }`. Add one selftest case where GIT_DIR points at a pinned fixture repo and `--src` is a different repo; it must give SRC_REV_MISMATCH.
2. **M10c.** Make SKILL.md items 1 and 6 pass the pin clone (`--src` and `--origin` respectively), and correct the prose at ExecChecklistRewrite.patch:20. If the L1 declines, the final report must not claim "every lane gate verdict"; it must name CITE_CHECK and ROUND_GATE as gaps, so C1 fails its own falsifier.
3. **M10a.** Items 3/8/10/14 should expect `src-rev=`; treat a pin path that exists but is not a regular file as PIN_MALFORMED.
4. **M10b.** One exported `resolveOrigin`, also covering M1's token and hint, M5's toplevel check and M9's absolute clone.
5. **M4.** `SRC_TREE_DIRTY` via `status --porcelain` with no optional locks. This is L1's call; until it lands, src-rev means HEAD only.
6. **M11.** Use this `recreate` value:
   `(git clone --no-local --no-checkout /home/vgpnk/Projects/ufo-fsd-alpha /fast/scratch/kumitate-r36/src || git clone --no-checkout https://github.com/VeigaPunk/ufo-fsd-alpha.git /fast/scratch/kumitate-r36/src) && git -C /fast/scratch/kumitate-r36/src checkout -q --detach 31c465f15669f744848bd9f5d56191c5085670f7 && chmod -R a-w /fast/scratch/kumitate-r36/src`
   The operator's `refs/remotes/origin/main` contains the pin, so the pin is on GitHub. The fallback is untested here [INFERENCE: network not exercised].

## Commands run (cwd = lane unless stated; read-only)
Shorthand: `C` = ExecClaimsPin claims-check, `SP` = ExecSurfacePin surface-probe, `PIN` = `w/ExecPinFiles/lane/.ufo/pins/origin.json`, `P` = lane, `S` = pin clone.

```
E1  node C --self P --pin PIN                         → CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669) exit=0
E2  GIT_DIR=S/.git node C --self P --pin PIN --src P/corpus → CLAIMS: DRIFT ( … +178 more; src-rev=31c465f15669) exit=1
E2b node C --self P --pin PIN --src P/corpus          → CLAIMS: FAIL-CLOSED ( … != pin 31c465f15669 (…/origin.json)) exit=2
E3  node C --self P --pin PIN --src S/crates          → CLAIMS: DRIFT ( … +136 more; src-rev=31c465f15669) exit=1
E4  pin{revision=HEAD of w/ExecClaimsFidelity/lane, clone=that lane}; status " M scripts/claims-check.mjs"
                                                      → CLAIMS: DRIFT ( … +178 more; src-rev=0614092e0804) exit=1
E5  pin{rev=31C465F1…(upper), no repo}: node C        → CLAIMS: MATCH (… src-rev=31c465f15669) exit=0
                                        node SP       → SURFACE_PROBE: FAIL-CLOSED (PIN_MALFORMED: pin repo is absent or untyped: /dev/fd/63) exit=2
E6  pin{clone=/fast/scratch/kumitate-r36/gone}: C     → CLAIMS: FAIL-CLOSED (SRC_NOT_A_DIR --src /fast/scratch/kumitate-r36/gone is absent) exit=2
                                                SP    → SURFACE_PROBE: FAIL-CLOSED (SRC_REV_UNVERIFIABLE: pin clone /fast/scratch/kumitate-r36/gone is missing) exit=2
E7  env PATH=/nonexistent node C --self P --pin PIN   → CLAIMS: FAIL-CLOSED (SRC_REV_UNVERIFIABLE git rev-parse HEAD in /fast/scratch/kumitate-r36/src is not a repository HEAD (pin …)) exit=2
E8  (cd /tmp) node C --self P --pin .ufo/pins/origin.json → CLAIMS: FAIL-CLOSED (PIN_MALFORMED --pin /tmp/.ufo/pins/origin.json is absent) exit=2
E9  pin{clone:"src"}: cwd=/fast/scratch/kumitate-r36 → MATCH … exit=0 ; cwd=/tmp → FAIL-CLOSED (SRC_NOT_A_DIR --src /tmp/src is absent) exit=2
git -C S/crates rev-parse --show-toplevel HEAD        → /fast/scratch/kumitate-r36/src / 31c465f1…
GIT_DIR=S/.git git -C P/corpus rev-parse --show-toplevel HEAD → P/corpus / 31c465f1… (toplevel check blind to env)
GIT_DIR=S/.git git -C P/corpus --no-optional-locks status --porcelain | wc -l → 1107
git -C S --no-optional-locks status --porcelain --untracked-files=normal → 0 lines, 30 ms
git -C S rev-parse --is-shallow-repository → true ; git -C ~/Projects/ufo-fsd-alpha rev-parse --is-shallow-repository → true
git -C S rev-list --count HEAD → 41 ; operator rev-list --count 31c465f1 → 41 ; S/.git/shallow → 4 lines
find S -perm -u=w -not -type l | wc -l → 0 (of 1341) ; find S -type l → 0 ; findmnt /fast → xfs (persistent; no tmpfiles rule for /fast)
git -C ~/Projects/ufo-fsd-alpha worktree list → … /tmp/ufo-fsd-alpha-validation 95273d18 [agent-definition-validation] prunable
git -C ~/Projects/ufo-fsd-alpha for-each-ref --contains 31c465f1 refs/remotes → refs/remotes/origin/HEAD, refs/remotes/origin/main
git config --get-regexp '^filter' → filter.lfs.{clean,smudge,process,required=true} (~/.config/git/config)
man git-status: "BACKGROUND REFRESH … git status will automatically refresh the index … and writing out the result"
man githooks:23 "Environment variables, such as GIT_DIR, GIT_WORK_TREE, etc., are exported"
```

## Notes
- **Severity.** The two blockers are both named falsifiers in round-36/claims.md:24-25, reproduced as built: M8 is "a pin mismatch that passes" and M10c is "a checklist item still running against the operator checkout". Both have fixes of only a few lines.
- **Already correct (no action).** Strict 40-hex compare (no prefix match). An explicit missing `--pin` is PIN_MALFORMED, never a silent unpin. A missing clone never falls back to the operator checkout. `rev-parse` does not write to the a-w pin.
- **Not exercised.** I tested no safe.directory ownership refusal (it needs a chown) and no real symlinked or worktree clone (both need writes). M2 and M3 rest on ScoutPinDesign.md:56 and on code reading.
- **Lane write hygiene.** One `git status --short` ran in the lane before I switched to `--no-optional-locks`. `.git/index` mtime is still 00:43:25, before this session, so nothing was written.
- **Writes.** None except this report. No tools installed or upgraded; no package transactions.
