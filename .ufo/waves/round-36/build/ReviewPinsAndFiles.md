REVIEW pins files=3 bare="CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669); PROXY: MATCH (A=7 C=14 operability=8; C1=19/19 C2=81/81 coverage=10; S=88/88; R=92/92; K=51/51; pins=6 match; src-rev=31c465f15669); SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 src-rev=31c465f15669)" mismatch-exit=2

# ReviewPinsAndFiles — three pin files + PIN v1 in claims/proxy/surface

Read-only seat. Every lane command ran with cwd
`/home/vgpnk/Projects/shokunin/kumitate-shokunin` (master `0614092e` + L1 integration as of
2026-10-21T02:42-03:00); scratch composites live under
`/fast/scratch/kumitate-r36/w/ReviewPinsAndFiles/`. The source pin was only ever read.
No tool installs. Anything not observed is marked [INFERENCE].

## Verdict (lane, bare = default `.ufo/pins/origin.json`)

```
CLAIMS: MATCH (rows=19 yes=19 notes=27 sections=184 adv=4 src-rev=31c465f15669)          exit 0
PROXY: MATCH (A=7 C=14 operability=8; C1=19/19 C2=81/81 coverage=10; S=88/88 coverage:script-layer=10;
  R=92/92 coverage:runtime-layer=10; K=51/51 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669)  exit 0
SURFACE_PROBE: CLEAN (surfaces=2 checks=12 errors=0 warnings=1 known=1 src-rev=31c465f15669)  exit 0
```
Explicit mismatched `--pin` fixture: all three gates exit **2** with `SRC_REV_MISMATCH`:
```
CLAIMS: FAIL-CLOSED (SRC_REV_MISMATCH /fast/scratch/kumitate-r36/src HEAD 31c465f15669 != pin 000000000000 (…pin-mismatch.json))
PROXY: FAIL-CLOSED (SRC_REV_MISMATCH) /fast/scratch/kumitate-r36/src HEAD 31c465f15669 != pin 000000000000 (…)
SURFACE_PROBE: FAIL-CLOSED (SRC_REV_MISMATCH: src /fast/scratch/kumitate-r36/src HEAD=31c465f1… != pinned revision 000…)
```

## Pin files (`.ufo/pins/`, sha256 identical to the delivered ExecPinFiles patch)

| file | contract | revision == `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` |
|---|---|---|
| origin.json (469 B) | kumitate-origin-pin-v1 | yes (`31c465f15669f744848bd9f5d56191c5085670f7`) |
| surface-known.json (258 B) | kumitate-surface-known-v1 | yes; exactly the one expected finding `{sighting,VERB_UNDECLARED,VERB_DISPATCH,surface}` |
| fidelity-ratchet.json (859 B) | kumitate-fidelity-ratchet-v1 | yes; notes = exactly the 15 prototype nonok>0 notes, every ceiling 0, total 0 |

- All three `JSON.parse` clean; no secret/token/credential/private-URL material
  (`grep -RniE 'token|secret|password|api[_-]?key|bearer|ssh://|aws_|ghp_|sk-'` → clean). The only URL is
  the required local operator-checkout path in `recreate` (a path, not a credential).
- `recreate` no-write test (destination substituted to my scratch):
  `git clone --no-hardlinks file:///home/vgpnk/Projects/ufo-fsd-alpha <dst> && git -C <dst> checkout -q --detach 31c465f1… && chmod -R a-w <dst>`
  → exit 0, `HEAD=31c465f1…` match, dst mode `0555`. Upstream `/home/vgpnk/Projects/ufo-fsd-alpha`
  `.git/index` (1792491951/125375), `.git/HEAD` (1792447324/21) and `Cargo.toml` (1791072640/640)
  were identical before/after; no `.git/*.lock`. `file://` transport + `--no-hardlinks` = no shared
  inodes, so the final `chmod -R a-w` cannot reach the operator checkout.

## Fail-closed matrix (lane gates, exact outputs)

| case | claims | proxy | surface |
|---|---|---|---|
| missing clone | `SRC_NOT_A_DIR` 2 | `SRC_NOT_A_DIR` 2 | `FAIL-CLOSED (--src /nonexistent/… is missing)` 2 |
| not a repo | `SRC_REV_UNVERIFIABLE` 2 | `SRC_REV_UNVERIFIABLE` 2 | `SRC_REV_UNVERIFIABLE … (exit 128)` 2 |
| git absent (`PATH=/nonexistent`) | `SRC_REV_UNVERIFIABLE` 2 | `SRC_REV_UNVERIFIABLE` 2 | `SRC_REV_UNVERIFIABLE … ENOENT` 2 |
| explicit `--src` off-pin | `SRC_REV_UNVERIFIABLE` 2 | `SRC_REV_UNVERIFIABLE` 2 | `SRC_REV_UNVERIFIABLE` 2 |
| explicit `--pin` missing value | usage, 64 | usage, 64 | usage, 64 |
| malformed pin (short rev / foreign contract / non-JSON) | `PIN_MALFORMED` 2 | `PIN_MALFORMED` 2 | `PIN_MALFORMED` 2 (all three fired) |
| known rev != pin | — | — | `KNOWN_REV_MISMATCH` 2 |
| stale known entry | — | — | `KNOWN_STALE` error, DRIFT 1 |
| `--json` | `srcRev` + `pin` present, MATCH | `srcRev` present | `srcRev` + `knownActive` + `known=1` |

No-pin portability: with the pin files hidden, claims and surface-probe stdout is byte-identical to
`.ufo/waves/round-36/baseline/{claims-pin,surface-pin}.txt` (surface differs only by the intended
`SCRIPT_DIGEST_MISMATCH`/`SURFACE_UNREACHABLE` removals); lane surface with `--self /tmp` prints no
`src-rev=`. Selftests: claims 46/46, proxy 116/116, surface 45/45 — all PASS with pins present
(hermetic: spawned fixture runs pass a pinless `--self`).

No-write proof: `find /fast/scratch/kumitate-r36/src -newer <marker>` was empty after all gate runs
(claims/proxy/surface, pinned and unpinned); dispatcher `STATUS_REACH/SHAPE/QUEUE_SCHEMA` all `ok`
under the mkdtemp `UFO_STATE_DIR`/`UFO_PENDING_WORK_PATH` + `NODE_COMPILE_CACHE` redirect.
`GIT_DIR=/nonexistent/.git` no longer breaks a valid pin (all three gates still match with
`src-rev=`): the lane adopted the scout's `GIT_*`-scrubbing `gitEnv`.

## Findings

**F1 — medium — the integrated surface-probe hermetic suite carries no PIN v1 / KNOWN v1 cases.**
Lane `scripts/surface-probe.mjs` has 45 `check(` calls; `node scripts/surface-probe.mjs --selftest |
grep -ciE 'pin:|--known|pin rev|pin clone|pin file|pinned'` → **0**. `SUITE_CODES =
Object.keys(SEVERITY)` (`scripts/surface-probe.mjs:298`) and lane `SEVERITY` lists no
`PIN_MALFORMED/SRC_REV_MISMATCH/SRC_REV_UNVERIFIABLE/KNOWN_*`, so the "every declared code fires"
meta-case cannot notice. Delivered patches carry 8 pin cases (`ExecSurfacePin.patch`, 50/50) and 8
known cases (`ExecSurfaceKnown.patch`, 50/50); my semantic merge of pin+known+digest+dispatcher
passes 61/61 and reaches the after-target verdict. Net: live behavior is correct (verified above),
but no in-tree regression guard covers the new fail-closed arms; restore at least the seven arms
(`PIN_MALFORMED`, `SRC_REV_MISMATCH`, `SRC_REV_UNVERIFIABLE`, default-pin discovery,
`KNOWN_MALFORMED`, `KNOWN_STALE`, `KNOWN_REV_MISMATCH`).

**F2 — low — default-pin discovery silently degrades to "unpinned" when `.ufo/pins/origin.json`
is a directory (claims/proxy only).** `defaultPinPath()` returns null unless `statKind === 'file'`,
so with a directory at that default path: `CLAIMS: MATCH (… adv=6)` and `PROXY: DRIFT (…)` print no
`src-rev=` and exit 0/1, while surface-probe fail-closes `PIN_MALFORMED: … EISDIR`. Explicit
`--pin <dir>` is `PIN_MALFORMED` exit 2 in both. This is the "silently turn provenance off" shape
PIN v1's own comments forbid; make the default arm fail closed on a non-regular file.

**F3 — low — missing-pin-clone token diverges.** claims/proxy print `SRC_NOT_A_DIR`; surface prints
`FAIL-CLOSED (--src <pin clone> is missing)` with no pin code and without naming the pin file
(claims detail likewise omits the pin file). All exit 2, so no contract break (PIN v1 doesn't name a
token for a missing clone), but one token — `SRC_NOT_A_DIR` — with the pin path in the detail would
keep every verdict readable the same way.

**F4 — low — surface `assertPinRevision` maps an empty bare repo to `SRC_REV_MISMATCH`.** An empty
bare repo prints `HEAD` with exit 0, so `head !== pin.revision` fires MISMATCH instead of
UNVERIFIABLE (claims/proxy reject a non-40-hex HEAD first). Exit 2 either way; message is
misleading only. [INFERENCE] from the code path, not exercised live.

**F5 — informational** — `src-rev=` is absent on all `FAIL-CLOSED` lines, by design (only
MATCH/DRIFT carry the proven revision). Checklist items must not require `src-rev=` on a
fail-closed verdict.

## Residual risk / gaps

- `pin.clone` inside another checkout verifies the enclosing repo's HEAD (no toplevel/realpath
  hardening); not required by PIN v1, unexercised.
- [INFERENCE] git ownership refusal (`safe.directory`) untested; expected exit 128 →
  `SRC_REV_UNVERIFIABLE`.
- Did not run the lane SKILL.md checklist (other reviewer's item); `claims --fidelity` verdict does
  carry `src-rev=31c465f15669` (`FIDELITY: CLEAN (notes=20 anchors=1574 src-rev=31c465f15669)`,
  exit 0), confirming the pin reaches the fidelity arm too.
- Lane content moved under me during review (claims sections 175→184, proxy C2 79→81 as R5/R7
  landed); the verdicts above are the 02:42 snapshot. Re-run the three bare gates after L1 freezes
  the tree.
