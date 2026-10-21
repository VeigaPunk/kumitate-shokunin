EXEC claims-pin done cases=9 selftest=48/48 verdict="CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6 src-rev=31c465f15669)"

# ExecClaimsPin — PIN v1 in scripts/claims-check.mjs

Axes: **operability** (the claims verdict names the revision it scored, and a wrong
tree can no longer be scored under a pin), **correctness** (strict 40-hex equality,
fail-closed on every unverifiable shape), **hermeticity** (7 new cases write only
under `tmpdir()`, and the default pin never keys off the tool's own repo).

## Deliverable
- Patch: `/fast/scratch/kumitate-r36/w/KumitateR36.ExecClaimsPin.patch`
  (406 lines, sha256 `4b355c17…0088`; applies clean to a fresh clone of
  `0614092e0804` — `git apply --check` + applied + selftest 48/48 and
  `PIN_DETECT: 10/10` there). Gate-file identity: `scripts/claims-check.mjs`
  sha256 `6540f4de109eaeca0c33af4edb15ca1d91e112fd51fc756db63bf82825915693`
  (the patch reproduces it byte-for-byte from `0614092e0804`).
- Scratch clone: `/fast/scratch/kumitate-r36/w/KumitateR36.ExecClaimsPin/lane`
  (branch `r36-execlaimspin` at `0614092e0804`), one file changed:
  `scripts/claims-check.mjs` (+277/−17).
- Read-only seat: no production lane file, git index or jj state touched.

## What changed (anchors are final file lines)
- `:57-74` header: PIN v1 contract paragraph; verdict grammar now shows the
  optional `src-rev=` segment.
- `:110-187` pin helpers: `defaultPinPath`, `readPin` (contract id, 40-hex
  revision, non-empty clone; every defect is `PIN_MALFORMED`), `gitHead`
  (`git -C <dir> rev-parse HEAD`, `GIT_OPTIONAL_LOCKS=0`,
  `GIT_TERMINAL_PROMPT=0`), `resolveOrigin` (precedence `--src` → `pin.clone` →
  legacy default; assertion always runs on the RESOLVED tree).
- `:530` `renderVerdict(…, srcRev)`: ` src-rev=<12>` inside the parens on MATCH;
  `; src-rev=<12>` after the findings on DRIFT (never counted in `+N more`).
- `:546` fail-closed JSON gains `pin` + `srcRev`.
- `:612` `runCheck`: `resolveOrigin` first; `probeSections` called with the
  resolved src; JSON gains `pin`/`srcRev`; text verdict gets `runOpts.srcRev`.
- `:1092` `parseArgs`: `--pin` added; eager `--src` default resolution removed
  (resolution now happens only in `runCheck`, never for `--selftest`/`--help`).
- `:901-1044` selftest block + `:135-139` three new FAIL_CLOSED_KINDS coverage
  tokens.
- **Unchanged**: `probeSections({self, scorecard, src})` signature and body, the
  export list (`CORPUS_DIRS SCORECARD_FILE parseRegistry probeSections
  resolveSrcDefault walkFiles`), and every pre-existing finding kind/shape.

## Exact new verdict text
- pinned MATCH: `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6 src-rev=31c465f15669)`
- pinned DRIFT: `CLAIMS: DRIFT (NOTE_MISSING row=S1 knowledge/nope.md does not exist under corpus/; src-rev=22aa98234ab6)`
- mismatch: `CLAIMS: FAIL-CLOSED (SRC_REV_MISMATCH <src> HEAD <12hex> != pin <12hex> (<pin file>))`
- non-repo: `CLAIMS: FAIL-CLOSED (SRC_REV_UNVERIFIABLE git rev-parse HEAD in <src> is not a repository HEAD (pin <file>))`
- malformed pin: `CLAIMS: FAIL-CLOSED (PIN_MALFORMED --pin <file> is absent)`
- pin clone absent: `CLAIMS: FAIL-CLOSED (SRC_NOT_A_DIR --src <clone> is absent)`
- **no pin**: byte-identical to today, `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6)` — no `src-rev=` segment.

## Hermetic cases added (9; baseline 39/39 → 48/48)
1. `PIN match`: explicit `--pin` on a temp git repo (fixture files committed);
   src resolves from `pin.clone`, verdict equals the literal MATCH+`src-rev=` above.
2. `PIN default`: `<--self>/.ufo/pins/origin.json` discovered with no
   `--pin`/`--src`. Default is keyed on **`--self`**, so a committed lane pin
   cannot leak into fixture runs (guarded by case 7).
3. `PIN mismatch`: HEAD ≠ pin revision → exit 2, `SRC_REV_MISMATCH`, and no
   `CLAIMS: MATCH` is printed.
4. `PIN non-repo`: clone is a plain fixture dir → exit 2, `SRC_REV_UNVERIFIABLE`
   (runs with `GIT_CEILING_DIRECTORIES=<tmp>` so a host tmpdir inside another
   checkout cannot fake a repo).
5. `PIN malformed`: explicit `--pin` naming an absent file → exit 2,
   `PIN_MALFORMED` (never silently "no pin").
6. `PIN malformed`: short revision `31c465f1` → exit 2, `PIN_MALFORMED` (no
   prefix comparison).
7. `PIN absent`: no pin file → exact legacy verdict and no `src-rev=` substring.
8. `PIN same-prefix mismatch` (round-36 mutation feedback): revision = real HEAD
   with hex[7] flipped → exit 2 `SRC_REV_MISMATCH`, both 12-hex prefixes in the
   detail. Kills a 7-char prefix compare (mutant then scores MATCH).
9. `PIN clone absent` (round-36 mutation feedback): `pin.clone` points at an
   absent path while `HOME/Projects/ufo-fsd-alpha` holds a valid git tree at the
   pin revision → exit 2 `SRC_NOT_A_DIR`, detail names the absent clone, no
   scored verdict. Kills an absent-clone fallback to `resolveSrcDefault()`.

## Evidence (commands run in the scratch clone)
- `node scripts/claims-check.mjs --selftest` → `CLAIMS_SELFTEST: 48/48 pass` /
  `VERDICT: PASS` exit 0, both with and without a lane-shaped
  `.ufo/pins/origin.json` present (scratch-only; removed afterwards).
- `node scripts/claims-check.mjs --self <lane> --pin <pin>` →
  `CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=175 adv=6 src-rev=31c465f15669)` exit 0.
- bare `node scripts/claims-check.mjs` with the pin at
  `lane/.ufo/pins/origin.json` → same line (default discovery + `pin.clone`).
- `--src <lane>` + pin → `SRC_REV_MISMATCH … 0614092e0804 != 31c465f15669` exit 2.
- `--src /tmp/claims-norepo` + pin → `SRC_REV_UNVERIFIABLE …` exit 2.
- `--pin /tmp/no-such-pin.json` → `PIN_MALFORMED … is absent` exit 2.
- `--pin` with no value → `claims-check: --pin needs a value` + usage, exit 64.
- `--json` at the pin → `verdict=MATCH`, `src=/fast/scratch/kumitate-r36/src`,
  `srcRev=31c465f15669…f7`, `pin.revision` = same full sha.
- pinned DRIFT fixture (temp self + temp git origin) → the literal above, exit 1.
- no pin at the live lane → legacy MATCH, no `src-rev=`, exit 0.
- import compatibility: `node scripts/proxy-check.mjs --selftest` →
  `PROXY_SELFTEST: 109/109 pass` / `VERDICT: PASS`.
- read-only proof: `find /fast/scratch/kumitate-r36/src -printf '%p %T@ %s\n' | sort | sha256sum`
  identical before/after a pinned run (`ed461642…e7c8`); `rev-parse` takes no lock.
- mutation round-trip v2 (MutPin re-probe of gate sha `6540f4de…`): pristine
  `48/48` + `PIN_DETECT: 10/10`; M1 prefix-7, M2 absent-clone fallback, M3
  non-repo, M4 mismatch+prefix → 4/4 killed, each selftest `47/48` or lower with
  only the owning pin case failing (detector P2/P3/P4+P5/P2+P6); restore is
  sha-equal to `6540f4de…` and both gates green after each. No residual finding
  (evidence: `w/MutPin/evidence/mutation-claims-exec-v2.json`,
  `detector-claims-exec-v2.json`).
- Evidence files: `w/KumitateR36.ExecClaimsPin/evidence/*.txt` (selftest,
  pinned-match, pinned-drift, mismatch, unverifiable, malformed, no-pin,
  pin-detect-10, mutant-prefix7, mutant-fallback).
- No tool installs or upgrades were needed.

## Integration notes for the L1
- The lane's `scripts/claims-check.mjs` is still the unlanded base (`e9a21b44…`);
  the L1 must apply this patch (v2, gate sha `6540f4de…`) as part of integration.
- `.ufo/pins/origin.json` is **not** written here — `ExecPinFiles` owns the file;
  this gate only reads it. Its contract field must be `kumitate-origin-pin-v1`,
  `revision` must be the full 40-hex sha, `clone` non-empty.
- `ExecProxyPin` implements its own pin in `proxy-check.mjs`; it must not rely on
  this file's internals — only the shared on-disk pin shape. `probeSections` is
  untouched, so proxy's import and `src` argument are unaffected.
- `ExecFidOps` edits the same regions (`parseArgs`, `runCheck`, `renderVerdict`,
  selftest). Merge order note: this patch adds `srcRev` as the 5th parameter of
  `renderVerdict` and resolves origin at the top of `runCheck`; `--fidelity`
  should thread its own ratchet state alongside, not re-resolve src.

## Risks / limits
- A clone that is dirty at the pinned HEAD still passes: PIN v1 asserts the
  revision only (frozen contract; byte equality is not claimed).
- Token precedence changed for a doubly-broken run: an active pin's
  `SRC_REV_*`/`PIN_MALFORMED` now precedes `SELF/SCORECARD/REGISTRY/CORPUS`
  tokens because origin resolution runs before `probeSections`. Still exit 2,
  never a scored verdict.
- [INFERENCE] A symlinked `--src`/clone is followed by `stat`/`git`; both report
  the real repository's HEAD, which is the intended meaning.
- The verdict's `src-rev` is the observed `rev-parse HEAD`, never echoed from
  the pin file, so tampering with `revision` in the pin produces a mismatch.
