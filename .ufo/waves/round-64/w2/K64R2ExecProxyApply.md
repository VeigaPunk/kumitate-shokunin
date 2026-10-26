VERDICT: `close-proxy.sh` turns the integrated tree (2ed8a5f8) from `PROXY: DRIFT` to `PROXY: MATCH` in plain and `--strict` in one idempotent `--write` run — adding the two missing `GATE_PINS` keys, re-hashing `pin.plan-before-ready`, and rewriting only `SCORECARD.md` + `scripts/proxy-check.mjs` — and restores MATCH after 300 stray `.mjs` plus the L1's still-missing SCORECARD/SKILL/LOG additions (proven, 22 arms, scratch archive of the frozen rev).

## Evidence

Scratch archive of the frozen integrated rev, `git archive 2ed8a5f8b133c65b3be59e3d10ff5bff50c4a2d8 | tar -x -C /tmp/kumitate-r64/K64R2ExecProxyApply/tip` (`receipts/01-dryrun.txt`):
```
PROXY  error  A_DRIFT  A: declared=257 computed=514 delta=+257
PROXY  error  C2_DRIFT  C2: declared=153 computed=156 delta=+3
PROXY  error  C2_TOTAL_DRIFT  C2_total: declared=153 computed=156 delta=+3
PROXY  error  GATE_PIN_DRIFT  pin.plan-before-ready: declared=fdc10c4b91a3f59b1452ced06104c4fb03ad6130132cf83f3a8b32b8f3898fc9 computed=ef726eaef83e7068c28ec3e5e0dfc7732337ee7f4c72eaa6db054d1ed40324a0
PROXY  warn  PIN_UNPINNED  scripts/report-receipt-diff.mjs has no pin.<name> key …
PROXY: DRIFT (A_DRIFT term=A declared=257 computed=514 delta=+257; … ; PIN_UNPINNED term=scripts/report-receipt-diff.mjs; src-rev=31c465f15669)      exit=1
```
Dry run prints both patches and refuses to write (`receipts/01-dryrun.txt`): `PIN  + pin.jj-seat-demo=scripts/jj-seat-demo.sh`, `PIN  + pin.report-receipt-diff=scripts/report-receipt-diff.mjs`, `STANZA: NOT written (the refresher reports a blocker: fix the tree, never the number)`, `CLOSE_PROXY: DRIFT (plain=1 strict=1 blockers=2)` exit 1.

`bash close-proxy.sh --lane <tip> --write` (`receipts/02-write.txt`, exit 0):
```
PINS: wrote 2 key(s) into scripts/proxy-check.mjs
--- a/SCORECARD.md   (1510-byte diff)
-A=257 / +A=514      -C2=153 -C2_total=153 / +C2=156 +C2_total=156
-pin.proxy-check=cc4a2ea7… / +pin.proxy-check=d6f8dce9…
-pin.plan-before-ready=fdc10c4b… / +pin.plan-before-ready=ef726eae…
+pin.jj-seat-demo=2d2edd43559c52912e674d89cf5d05c3988cbd1618bb98b82561691ca53182c3
+pin.report-receipt-diff=faca709960bd9c132c78abf6e0f075944d3a7d35a29104cb7203802c3ca58e83
STANZA: wrote SCORECARD.md from the measured candidate
IDEMPOTENT: diff_bytes=0 blockers=0 ok=true
AFTER  PROXY: MATCH (A=514 C=30 operability=9; C1=19/19 C2=156/156 coverage=10; S=88/88 coverage:script-layer=10; R=92/92 coverage:runtime-layer=10; K=49/49 coverage:kimi-layer=10; pins=6 match; src-rev=31c465f15669) (exit 0)
AFTER  PROXY: MATCH (…same line, --strict…) (exit 0)
CLOSE_PROXY: MATCH (plain=0 strict=0 pins_added=2 pins_written=2 stanza_written=yes idempotent=true)
```
Second `--write` (`receipts/03-write-again.txt`, exit 0): `PINS: none written`, `STANZA: already current`, `CLOSE_PROXY: MATCH (… pins_added=0 pins_written=0 stanza_written=no idempotent=n/a)`.
The edit does not break the gate's own suite (`receipts/04-selftest.txt`, exit 0): `PROXY_SELFTEST: 122/122 pass` / `VERDICT: PASS`.
Only the two intended files changed (`receipts/23-only-intended-files.txt`, `diff -rq pristine tip`):
```
Files …/pristine/SCORECARD.md and …/tip/SCORECARD.md differ
Files …/pristine/scripts/proxy-check.mjs and …/tip/scripts/proxy-check.mjs differ
```
Prediction arm — the L1's remaining close edits (`sim-edit.mjs`: capabilities row `report-receipt-diff`, `## Round 64` section, SKILL gate-registry row, one `- [ ]` checklist item, LOG bullet) **plus 300 stray `.mjs`** under `.ufo/waves/round-64/build/proof-stray/` (`receipts/05..09`):
```
PROXY: DRIFT (A_DRIFT term=A declared=514 computed=814 delta=+300; C_DRIFT term=C declared=30 computed=31 delta=+1; …) exit=1   # plain and --strict
CLOSE_PROXY: MATCH (plain=0 strict=0 pins_added=0 pins_written=0 stanza_written=yes idempotent=true)
AFTER  PROXY: MATCH (A=814 C=31 operability=9; C1=19/19 C2=156/156 coverage=10; …)
```
i.e. the capabilities row, the `## Round 64` section, the SKILL registry row and the LOG entry move **no** term (only `C` moved, and only from the checklist item); `A` absorbs arbitrary growth; the re-run reads `STANZA: already current`.

Guards (each must not launder a defect):
- unmapped corpus note → `REFRESH  BLOCK  MAP_INCOMPLETE  C2=156 README rows vs C2_total=157 …`, `STANZA: NOT written`, exit 1, `SCORECARD.md` sha256 unchanged (`3ff3a42a69ea8ad76c47ef74ffef5755b8d76ab6d0b7a54408a97be11a319e92`) — `receipts/12-armB-blocked.txt`.
- gate-block key absent from `GATE_PINS` → `CLOSE_PROXY: FAIL-CLOSED (PROXY_REFUSED) … PROXY: FAIL-CLOSED (GATE_PIN_KEY_UNKNOWN) line 335: pin.ghost …` exit 2 (`receipts/13-armC.txt`); the refresher alone also fails closed (`REFRESH: FAIL-CLOSED (PROXY_GATE_PIN_KEY_UNKNOWN)`), so no drop path exists.
- dry run writes nothing: sha256 manifest of all 15110 files identical before/after (`receipts/14-16-manifest-summary.txt`: `manifest_sha256=71a29ec3…` twice, `cmp=identical`; prove line `16 tree_unchanged=yes`).
- usage/fail-closed: `--bogus` → `CLOSE_PROXY: USAGE unknown argument "--bogus"` exit 64; `--lane /nonexistent` → `FAIL-CLOSED (LANE_NOT_A_LANE)` exit 2; `--refresh /nonexistent/x.mjs` → `FAIL-CLOSED (REFRESHER_ABSENT)` exit 2 (`receipts/17..19`).
- unpinned `scripts/*.mjs` auto-pinned (`receipts/10/11`, 3 files → `pins_added=3`, MATCH); explicit `--pin scripts/zz-demo.sh` (`receipts/20`); stem collision `zz-twin.mjs`+`zz-twin.sh` → `FAIL-CLOSED (PIN_KEY_COLLISION)` exit 2 (`receipts/21`); `--no-subject-pins` still MATCH with `pins_added=1` (`receipts/22`) — the `.sh` pin is a strengthening, not a MATCH requirement.

Live lane measurement (read-only, `node scripts/proxy-check.mjs --json`): `live_A=1308 live_C=30 live_C2=156/156 verdict=DRIFT`, of which **1049** runnable files sit under `.ufo/waves/round-64/`; `git status --porcelain` outside `.ufo/waves/round-64/` is empty (no lane file touched by this seat). Unpinned `scripts/*.mjs` in the live tree: `report-receipt-diff.mjs` only.

## Findings

**K64R2ExecProxyApply-1 — high (the integrated rev is not MATCH; maintenance).** `pin.plan-before-ready` is stale at 2ed8a5f8: wave 2 gave `scripts/plan-before-ready.sh` a `readme-map` arm (`PBR_MAP_FROM`, default 65) and no pin refresh landed. Repro: `D=$(mktemp -d) && git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin archive 2ed8a5f8 | tar -x -C $D && (cd $D && node scripts/proxy-check.mjs)` → `GATE_PIN_DRIFT pin.plan-before-ready … computed=ef726eae…`, exit 1.

**K64R2ExecProxyApply-2 — high (round-62 fail-closed class recurs).** `scripts/report-receipt-diff.mjs` landed at the freeze commit `dd1a3e6` with no `pin.<name>` key, so `--strict` reads `PIN_UNPINNED` → DRIFT even after the stanza numbers are refreshed; `GATE_PINS` in `scripts/proxy-check.mjs:461-485` never learned the name. Repro: same extraction, `node scripts/proxy-check.mjs --strict | grep PIN_UNPINNED` → `scripts/report-receipt-diff.mjs`. My script adds the key (`--write` only) and the refresher then pins it in `kumitate-gate-pins-v1`.

**K64R2ExecProxyApply-3 — medium (frozen check has a blind spot it names as a strength).** `comparePinCoverage` (`scripts/proxy-check.mjs:1143-1152`) filters `scripts/*.mjs`, so a new `scripts/*.sh` is unpinnable by rule: `scripts/jj-seat-demo.sh` — C2's demo, re-run by J6 — can change with no pin noticing and `--strict` stays silent. Repro: `(cd $D && node scripts/proxy-check.mjs --strict | grep -c jj-seat-demo)` → `0`. Reported, not patched; `close-proxy.sh` pins it explicitly (default; `--no-subject-pins` opts out).

**K64R2ExecProxyApply-4 — medium (operational: `A` is a function of commit order, so the refresh has a run-order constraint).** `A` counts every runnable file under the lane including `.ufo/` build artifacts (live `A=1308`, 1049 of them under `.ufo/waves/round-64/`; archive `A=514`). A refresh run before the last build-dir commit is stale on the next commit. Repro: `node scripts/proxy-check.mjs --json | grep '"A"'` in the lane now vs in a `git archive` of any commit. Order that works (and is what the script documents): commit everything runnable → run `close-proxy.sh --write` → commit `SCORECARD.md`/`scripts/proxy-check.mjs` last (`SCORECARD.md` is not runnable, so `A` is stable across that commit).

**K64R2ExecProxyApply-5 — info (review hazard, by design).** `pin.proxy-check` is self-referential: any `GATE_PINS` edit changes the hash of the file that declares it, so the close diff necessarily rewrites `pin.proxy-check` (`cc4a2ea7…` → `d6f8dce9…`). The stanza alone therefore cannot evidence that the gate was not weakened; a reviewer must read the `scripts/proxy-check.mjs` hunk (`receipts/02-write.txt` prints it as a `diff -u` hunk, two added lines only).

## Artifacts

- `.ufo/waves/round-64/build/K64R2ExecProxyApply/close-proxy.sh` (sha256 `61f325cedbb25c176744b2e1d2412c64854e2efef581d122be15b70c8d15e76c`) — the deliverable: `[--lane DIR] [--write] [--pin REL]... [--no-subject-pins] [--refresh FILE] [--json]`; exit 0 MATCH · 1 DRIFT/BLOCKED · 2 FAIL-CLOSED · 64 usage.
- `…/refresh-stanza.mjs` — byte-identical copy of wave 1's tool (sha256 `16fa5d1278475899189fb54f623945b59cb9b7577c3beebef68f2f759583895b`) so the pair travels together; `--refresh` or `$CLOSE_PROXY_REFRESH` overrides.
- `…/prove.sh` (sha256 `9f876edb…`) + `…/sim-edit.mjs` (`f4d1f2b6…`) + `…/receipts/` (23 files: `00-prove.log`, `01..23-*.txt`, the 2.1 MB manifests collapsed to `14-16-manifest-summary.txt`) — the whole 22-arm proof, re-runnable from a clean extraction (`bash prove.sh`).
- Scratch `/tmp/kumitate-r64/K64R2ExecProxyApply/` — only `receipts/` and `prove.log` remain; every extracted lane tree (`tip`, `pristine`, `close-sim`, `arm-*`) was deleted after the proof (prove.sh recreates them under `/tmp`). 4 runnable files added to the build dir (the gate counts `.mjs/.js/.sh/.py`; receipts are `.txt`). No tool installed or upgraded.

## Limits

- Not applied to the lane: the lane's `scripts/`, `SCORECARD.md`, `.ufo/pins/`, git/jj state are untouched (`git status --porcelain` outside `.ufo/waves/round-64/` empty). The L1 runs the script; I only proved it on archives.
- The `.sh` gate pin (`pin.jj-seat-demo`) is a strengthening beyond the frozen coverage rule; if the L1 does not want a non-`.mjs` pin, `--no-subject-pins` still reaches MATCH (`receipts/22`).
- Auto-pin pins whatever sits in `scripts/*.mjs`, including junk: it satisfies `--strict` but cannot tell a gate from a scratch script — a junk file should be deleted, not pinned.
- Not checked: whether the L1's final `## Round 64` prose, capabilities row and SKILL rows are *true* (only that they move no proxy term); whether `round-gate`, `claims-check` or the census read MATCH after the same close; the C1/C2 frozen counters themselves (other seats).
- `A`, `C`, `C2` semantics are the frozen ones; the script never edits an axis row, a README row, a corpus note or a `readme-map` pin — a map gap is reported as a blocker, never repaired.
