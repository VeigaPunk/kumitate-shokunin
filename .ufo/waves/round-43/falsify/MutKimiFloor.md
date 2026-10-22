RESULT MutKimiFloor rev=84cb1d5d8e703aafd4f73d887ba4237692ff13f9 verdict=survived mutants=12 survived=5

# MutKimiFloor — mutation test of the new kimi-census mode/owner code

Target `scripts/kimi-census.mjs` at 84cb1d5d8e703aafd4f73d887ba4237692ff13f9
(diff vs e5ffcbe7f155b89cb1870f9da7b0d671d092948b, +48/-15). Detector
`node scripts/kimi-census.mjs --selftest`, every run bounded by
`systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 600`.
Scratch `/fast/scratch/hyaku/kumitate-r43/seats/MutKimiFloor`; the lane repo was
never mutated and the only lane write is this report. No git/jj writes, no
installs (node v24.21.0 already present). No `~/.kimi-code` content read —
secrets only ever `stat`ed by the gate itself.

Baseline on pristine bytes: `KIMI_CENSUS_SELFTEST: 54/54 pass` / `VERDICT: PASS`,
exit 0. The baseline is clean, so no kill below is inconclusive. The lane file
and every restored state hash `H0 = 0f9c5a4c361316e111d0b2636780da5b8d848ccaa5c41507e8f8357ab6090075`.

## Mutants (one literal each) — expected detector vs actual

| ID | Single literal changed | Expected | Actual | Verdict |
|---|---|---|---|---|
| M1 | `:147` `modeCeiling: 0o755` → `0o777` (oauth/) | ceiling arm on oauth/ | 54/54 PASS exit 0 | SURVIVED |
| M2 | `:147` `modeCeiling: 0o755` → `0o700` (oauth/) | ceiling arm on oauth/ | 54/54 PASS exit 0 | SURVIVED |
| M3 | `:329` `0o777 ^ modeCeiling` → `0o777 ^ m.modeFloor` | ceiling arm | 37/54 FAIL exit 1 | KILLED |
| M4 | `:328` `m.kind === 'dir'` → `'file'` (beyondCeiling) | ceiling arm | 52/54 FAIL exit 1 | KILLED |
| M5 | `:330` `m.kind === 'dir'` → `'file'` (wrongOwner) | owner arm | 53/54 FAIL exit 1 | KILLED |
| M6 | `:329` ceiling mask `0o777` → `0o700` | ceiling arm | 36/54 FAIL exit 1 | KILLED |
| M7 | `:327` `m.modeCeiling ?? m.modeFloor` → `?? 0o777` | ceiling arm | 53/54 FAIL exit 1 | KILLED |
| M8 | `:324` `stat.mode & 0o777` → `& 0o700` | ceiling + floor arms | 53/54 FAIL exit 1 | KILLED |
| M9 | `:250` `runningUid = process.getuid()` → `= 0` | owner arm | 37/54 FAIL exit 1 | KILLED |
| M10 | `:467` fixture dir mode `?? 0o755` → `?? 0o700` | fixture-shape arm | 54/54 PASS exit 0 | SURVIVED |
| M11 | `:147` `modeFloor: 0o700` → `0o600` (oauth/) | floor arm on oauth/ | 54/54 PASS exit 0 | SURVIVED |
| M12 | `:330` `m.kind === 'dir'` → `m.id === 'locks/'` (wrongOwner) | owner arm on every secret dir | 54/54 PASS exit 0 | SURVIVED |

7 killed, 5 survived, 0 inconclusive. Each survivor was run twice and gave an
identical 54/54 PASS both times, so each is a stable survivor, not a flaky one.
Failing labels for the kills (from the run log): M3/M6/M9 also fail
`green fixture → CLEAN exit 0`; M4/M6/M7/M8 fail
`SHAPE_DRIFT: locks/ rejects group and other bits beyond its 0700 floor`;
M5 fails `SHAPE_DRIFT: locks/ owner must match the running uid`; M9's failures
all read `SHAPE_DRIFT locks/; SHAPE_DRIFT credentials/; SHAPE_DRIFT oauth/`.

## Survivors — what each permits (the implementation is correct; the suite is blind)

Fixtures below are built by the census' own `fixtureTree`; the live tree was
used only as a `--root` for the gate's read-only verify path.

M1 — `oauth/` ceiling widened to 0777. No ceiling arm on `oauth/`. With
`oauth/` at 0777: pristine → `SHAPE_DRIFT oauth/ oauth mode 0777 has
permissions beyond the 0755 secret-directory limit`, exit 1; M1 →
`KIMI_CENSUS: CLEAN (members=53 checked=53 chain=3 info=4)`, exit 0. A
world-writable secret directory passes the gate under M1.

M2 — `oauth/` ceiling tightened to 0700, same missing arm, opposite direction.
Live `oauth/` is 0755 (`stat -c %a ~/.kimi-code/oauth` → 755), so M2 turns a
clean tree into drift: pristine on live → `KIMI_CENSUS: CLEAN (members=53
checked=53 chain=8 info=4)` exit 0; M2 on live → `SHAPE_DRIFT oauth/ oauth
mode 0755 has permissions beyond the 0700 secret-directory limit` exit 1. The
0755 ceiling exists exactly because the live `oauth/` is 0755, yet no selftest
arm pins that fact.

M10 — fixture default dir mode 0755 → 0700, every selftest still passes. The
two fixture trees differ only in non-secret dir modes (`sessions/`,
`agents/secondary/`, `skills/` are 755 pristine, 700 under M10) and the gate
returns the identical verdict on both (`KIMI_CENSUS: CLEAN (members=53
checked=53 chain=3 info=4)`). No arm asserts the fixture's non-secret modes.

M11 — `oauth/` floor lowered to 0600. No floor arm on `oauth/`. With `oauth/`
at 0600 (no execute bit): pristine → `SHAPE_DRIFT oauth/ oauth mode 0600 lacks
the 0700 floor` exit 1; M11 → `KIMI_CENSUS: CLEAN (members=53 checked=53
chain=3 info=4)` exit 0.

M12 — owner pin narrowed to `locks/` only. The owner arm at `:663-670` calls
`verify(green, process.getuid() ^ 1)` and asserts only that a `locks/` finding
exists; it never checks `credentials/` or `oauth/`. Probe, same fixture, spoofed
uid: pristine `ownerFindings=["locks/","credentials/","oauth/"]`; M12
`ownerFindings=["locks/"]`. Under M12 a foreign-owned `credentials/` or
`oauth/` is not reported at all.

## Coverage summary

The new mode/owner code is genuinely covered — 7 of 12 kills include the
`modeCeiling` default, the ceiling mask width, the `dir`-only gate on both new
checks, the mode mask, and the `runningUid` default; a wrong
`process.getuid()` default (M9) and wrong ceiling arithmetic (M3, M6, M7, M8)
are all detected. The gap is narrow: **`oauth/`, the one secret directory with
a `modeCeiling`, has no mode or owner arm of its own.** Every mode arm targets
`locks/` (floor 0500, ceiling 0777), `credentials/` (floor 0500) or
`server.token` (floor 0400); `oauth/` is only ever a bystander in the green
fixture. Hence all three of its mode literals are unpinned, and the owner arm's
scope over the three secret directories is unpinned.

## Disposition

The implementation at 84cb1d5 is not shown defective by these probes; the five
survivors are coverage findings about the selftest, not grounds to change the
contract. A survivor is not permission to weaken the contract — the pins stay
as they are. If the lane acts on this, the minimal change is suite-side: add
mode and owner arms for `oauth/` mirroring the existing `locks/` arms (floor
below 0700, ceiling above 0755, owner mismatch) and extend the existing owner
arm to assert the finding set covers `locks/`, `credentials/` and `oauth/`.
That change is not made here, and no patch is delivered.

## Restoration evidence

Mutated SHA-256 per mutant (all restored to H0 after their run, and again
after the final pass): M1 `d2f57531…ef4f0`, M2 `d27af4c2…8344c`, M3
`7e26675f…56083`, M4 `8ecc4f65…d87e6`, M5 `d5a544d1…8273b`, M6 `ebb03c22…ec4d`,
M7 `dc824aca…1c52`, M8 `1174916f…696a`, M9 `d92ec175…8cec`, M10
`10c78c05…62c5f`, M11 `0e72ee7a…4a14`, M12 `4d919485…9aa7`.

Final check in the scratch clone: `cp pristine-kimi-census.mjs
scripts/kimi-census.mjs && sha256sum scripts/kimi-census.mjs` printed H0. The
lane repo's `scripts/kimi-census.mjs` still hashes H0 and is byte-identical to
the pristine copy; `git diff -- scripts/kimi-census.mjs` is empty. The lane's
`git status --porcelain -- scripts/` shows one modified file,
`scripts/cite-check.mjs`, which is another seat's in-flight edit and not mine —
this probe touched only `scripts/kimi-census.mjs` in its scratch clone.
`pgrep -f` found no leftover process matching the seat path, and no
`kumitate-kimi-census-selftest-*` temp dir remains under `/tmp` (an orphaned
`mkdtemp` fixture tree from an unrelated 18:09 run was removed during
cleanup; it held only synthetic `fixture`/`x` content, never live secrets).
