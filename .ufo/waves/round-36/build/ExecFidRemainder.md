EXEC fid-remainder done before=64 after=0 reps=31

Assignment: repair FIDELITY defects in `corpus/knowledge/remaining-scripts-census.md` (S8 census)
without re-adding sections for departed members. Frozen contract + L1 amendment applied
(ambiguity-aware pairing: both 14-char neighbours eligible => `noid`, never gated).

## Files changed (only these)
- `corpus/knowledge/remaining-scripts-census.md` — 1 file, +37 / -38 lines (`git diff --stat`),
  heading set byte-identical to HEAD (60 `## \`scripts/…\`` member sections, 0 added, 0 removed).
- Patch: `/fast/scratch/kumitate-r36/w/ExecFidRemainder.patch` (251 lines, `git diff` of the lane clone).
- No production lane file written by me; the lane tree at `/home/vgpnk/Projects/shokunin/kumitate-shokunin`
  was not touched (patch only). Origin clone untouched (read-only `awk`/`grep` reads).

## Note-local FIDELITY counts (amended rule: ambiguity => noid)
| measurement | anchors | ok | elsewhere | absent | dead | noid | nonok |
|---|---|---|---|---|---|---|---|
| before (HEAD 0614092) | 507 | 191 | 54 | 10 | 0 | 252 | **64** |
| after (my patch) | 506 | 256 | 0 | 0 | 0 | 250 | **0** |

Anchor delta is exactly the two sanctioned de-anchors (`:3-8`, config `:16`); one new anchor
(`scripts/fleet-ledger-read.mjs:384`) replaces the false `:498` citation. Every other original
anchor token survives (33 token changes = 30 line re-points + 1 `path:N`→`:N` normalization
+ 2 de-anchors; 31 further gated anchors were repaired by fixing the adjacent symbol only).

For the record, under the *pre-amendment* right-first reading the same file measures
`anchors=506 ok=272 elsewhere=109 absent=1 noid=124 nonok=110`: those 109 are the pairing
artifacts the amendment classifies `noid` (each is a symbol-first citation whose next
clause starts with the following citation's symbol). They were deliberately NOT re-pointed
per the L1 amendment.

## Repair classes (64 gated anchors)
1. **Line re-point (30)** — symbol existed at a different line; digits moved to the
   declaration-preferred occurrence nearest the old range, symbol span untouched.
   Examples (before -> after): cap `:128`->`:117` (BUILD_FAMILY decl), `:136`->`:125` (`have()`),
   `:322`->`:312` (`rc != 0` comment), `:61`->`:62` (`mv -f`), local-helper `:332`->`:325`,
   `:165`->`:161`, `:139`->`:135`, `:132`->`:128`, `:135`->`:131`, `:309`->`:302`
   (verify: `scripts/local-helper.mjs:302` is the `validateClassification` fail site),
   mission-lifecycle `:96`->`:85`, `:187`->`:174`, `:181`->`:168`, `:215`->`:202`, `:131`->`:120`,
   mission-activity `:133`->`:123`, `:160`->`:150`, `:162`->`:152`,
   observation `:66`->`:81`, `:58`->`:59`, activity.test `:15`->`:17`,
   hook `.test` `:32`->`:30`, `:37`->`:36`, rotate `:392`->`:20`,
   devin `:99-101`->`:10`, sync-global `:14-16`->`:15`, contracts `:32-36`->`:33-35`,
   collect.test `:560`->`:564`, watchdog `:278-280`->`:280`.
2. **Symbol-side repair, anchor token kept (31)** — the adjacent span was the *next*
   citation's symbol; the anchor was re-ordered to `(\`:N\`) \`SYM\`` with a verbatim symbol
   that really sits on the cited line (no span deleted, no line changed).
   Examples: dispatcher `:2848-2852` + `failed` (line 2848), dispatcher `:40` + `UFO_TEST_SCRATCH`
   (line 40), timer `:4` + `[Timer]`, timer `:12` + `WantedBy`, timer `:11` + `[Install]`,
   gates `:200` + `out.push`, selfheal `:114` + `process.exit(64)`, drills `:1705-1710` + `breaches`,
   retention `:1912` + `process.stdout.write`, `:184` + `logPath`,
   stale `:62` + `test`, l0-monitor `:35` + `diagnose`, `:1465` + `process.exit`,
   lifecycle `:2` + `Display`, devin `:100` + `profileId`, credential `:16` + `SECRET_TOKEN_MIN = 12`,
   watchdog `:341-345` + `blockedKeys`, activity.test `:18-21` + `projectMissionActivity`,
   collect.test `:16` (anchor moved onto the `SCRIPT` line).
   Verbatim-corrections in this class (span edited so it exists in origin):
   `reconcileObservation(input = {})` (obs:34), `test(name, fn, { skip = null } = {})` (l0:41),
   `{ error: error.message }` (prep-l1:959), `mkdtempSync` (wave.test:313),
   `validationErrors` (contracts:2106).
3. **De-anchor with historical marker (2)** — symbol literally absent from the pinned file:
   - dispatcher `.test` `:3-8` (`node:test` does not occur in `scripts/fleet-dispatcher.test.mjs`;
     sentence now reads "…rather than by `node:test` (that name is absent at `31c465f1`)").
   - config.json `:16` (`kimi.bridge` is a dotted label; the JSON key is `bridge`);
     sentence now reads "…the Kimi bridge value at line 16 (the dotted labels … do not occur
     literally at `31c465f1`)".
   - `scripts/fleet-ledger-read.mjs:498` + `usageError` (absent at the pin) was replaced by a
     true statement citing `defaultLedgerPath` at `:384` — the non-string operand fallback.

## Commands run (cwd = /fast/scratch/kumitate-r36/w/ExecFidRemainder)
```
git clone -q --no-hardlinks /home/vgpnk/Projects/shokunin/kumitate-shokunin lane
git -C lane checkout -q -b r36-execfidremainder 0614092e0804aaca06642cb3a263a05c1cacc98e
node fid.mjs lane/corpus/knowledge/remaining-scripts-census.md --details   # local FIDELITY v1 (amended)
  before: FIDELITY_TOTAL anchors=507 ok=191 elsewhere=54 absent=10 dead=0 noid=252 nonok=64
  after : FIDELITY_TOTAL anchors=506 ok=256 elsewhere=0 absent=0 dead=0 noid=250 nonok=0
node fid-rightfirst.mjs lane/corpus/knowledge/remaining-scripts-census.md   # pre-amendment reading
  after : FIDELITY_TOTAL anchors=506 ok=272 elsewhere=109 absent=1 dead=0 noid=124 nonok=110
node audit.mjs …                                                            # miss=110 nondecl=7,
  all pre-existing pairing artifacts outside the amended gate; 0 introduce a missing symbol.
diff <(grep '^## `' note) <(git -C lane show HEAD:… | grep '^## `')         # identical heading set
odd-backtick scan before/after: 32 == 32 lines (no new unclosed code span)
paren balance outside code spans on changed lines: 0 imbalanced
```
Origin reads were `awk`/`grep`/`sed -n` against `/fast/scratch/kumitate-r36/src` only; no write,
no chmod, no `--src /home/vgpnk/Projects/ufo-fsd-alpha`.

## Behavior
Each repaired citation now names a symbol that occurs verbatim on the cited line of its own
member file at pin `31c465f1`; the retained per-section bullets for departed members are
untouched (no section re-added for a deleted upstream member). The two de-anchored claims carry
an explicit "absent at `31c465f1`" marker instead of a false line citation.

## Risks / notes
- `[INFERENCE]` My local classifier (`fid.mjs`) is a fresh implementation of the frozen contract
  text + amendment; if the shipped gate resolves path-form anchors differently (basename suffix
  vs repo-relative), the anchor *set* could differ slightly. Every anchor in this note is
  repo-relative, and the standalone `:N` form covers the rest, so no drift is expected.
- `scripts/project-devin-subagents.mjs:100` was normalized from the full-path form to `:100`;
  the line is unchanged and the symbol (`profileId`) is on it. `[INFERENCE]` a gate that
  treats a bare `:N` as continuing the last full path still resolves it to the member file.
- No tool installs/upgrades; no pacman; no REA; no subagent dispatch.
- Not run (out of scope for this seat): builds, lint, `node scripts/claims-check.mjs`,
  `cite-check.mjs`, proxy/gates. Main agent owns the post-integration gate run.

## Evidence retained
- `/fast/scratch/kumitate-r36/w/ExecFidRemainder/{fid.mjs,fid-rightfirst.mjs,cands.mjs,audit.mjs}`
- `…/details-amb-before.txt`, `…/details-p5.txt` (per-anchor before/after classes)
- `…/cands.txt` (occurrence lines used for every re-point)
- `/fast/scratch/kumitate-r36/w/ExecFidRemainder.patch`
