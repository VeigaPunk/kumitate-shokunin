VERDICT: Both capture pins are computed, written, and gate-clean in a scratch mirror (CLEAN captures=29 exemptions=107, exit 0) and all four falsifiers move them (hash/bytes/absent), with two operability constraints for the L1: insert the S196/S197 rows inside the `## Registry` table at line 148 (EOF append reads E12), and audit the mirror with a script copy (an out-of-tree `--registry` re-bases paths and reads capture-absent).

## Evidence

Pins computed twice, independently (`sha256sum` + `node:crypto`), and `stat` for bytes:

```
7ea4396645e3b1c89a3fd984ea095dabd75c2e23e8f376ec2211c1b855ec37e6  .ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md
df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223  .ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html
bailian-managed-agents-multiagent.md 3388      arxiv-2512.08296v3.html 663997
node: bailian-managed-agents-multiagent.md 3388 7ea4396…37e6 · arxiv-2512.08296v3.html 663997 df31beb…7223
```
Identity check against the real registry and SOURCES.md: `S196 id_taken=false sha_taken_by=none path_taken=false` / `S197 id_taken=false sha_taken_by=none path_taken=false` / `S196 in_sources=false` / `S197 in_sources=false`.

Gate, real lane before integration: `SOURCE_CAPTURE: CLEAN captures=27 exemptions=107` exit 0.
Gate, mirror (`/tmp/kumitate-r63/K63ExecCapturePins/mirror`, registry = real 27 + S196/S197, SOURCES.md = real 134 + the draft's two rows inserted after S195, all 29 captures copied):
`SOURCE_CAPTURE: CLEAN captures=29 exemptions=107` exit 0.
Gate selftest: `SOURCE_CAPTURE_SELFTEST: PASS (13/13)` / `VERDICT: PASS` exit 0.

Falsifiers in the mirror (byte edits in the scratch copy, restore after each):
```
F1 arXiv byte 331998 ^= 1   → SOURCE_CAPTURE: DRIFT captures=29 exemptions=107 bad=1 first=S197:hash-mismatch  exit 1
F2 Bailian byte 3386 ^= 1   → SOURCE_CAPTURE: DRIFT captures=29 exemptions=107 bad=1 first=S196:hash-mismatch  exit 1
F3 arXiv truncated 1 byte   → SOURCE_CAPTURE: DRIFT captures=29 exemptions=107 bad=1 first=S197:bytes-mismatch exit 1
F4 Bailian file deleted     → SOURCE_CAPTURE: DRIFT captures=29 exemptions=107 bad=1 first=S196:capture-absent  exit 1
restored                    → SOURCE_CAPTURE: CLEAN captures=29 exemptions=107  exit 0
```
Merge guards: `jq -s '{version:1, captures:(.[0].captures + .[1].captures), exemptions:.[0].exemptions}' .ufo/pins/source-captures.json build/K63ExecCapturePins/pins-append.json` → `jq_merge_exit=0`, `shape_ok=0`, gate `CLEAN captures=29`; a node push of the same append block is byte-equivalent (`node-merge equals jq-merge (normalized): true`); appending S196 twice → `SOURCE_CAPTURE: FAIL-CLOSED reason=duplicate sourceId "S196"` exit 2; `captured: "2026-10-25T00:00"` → `FAIL-CLOSED reason=a capture entry lacks valid sourceId/path/sha256(64hex)/bytes/captured` exit 2.

Rows check (census from the mirror root, `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <mirror>/corpus/SOURCES.md`): exit 0, six `W04` lines (S034, S068, S084, S095, S123, S126 — the base six), final line `file	ok	/tmp/kumitate-r63/K63ExecCapturePins/mirror/corpus/SOURCES.md`.

1 MiB new-file warning (`jj --version` → `jj 0.45.1`; `jj --ignore-working-copy config get snapshot.max-new-file-size` → `1MiB`; helper note at `/home/vgpnk/Projects/shokunin/scripts/hyaku/jj-lane.sh:654-656`: named FILES get `--include-ignored` "(which also admits files over snapshot.max-new-file-size)", a named DIRECTORY is tracked like `git add <dir>`):
arXiv capture **663,997 B = 0.6332 MiB**, **384,579 B (36.68%) under** the 1,048,576 B limit → the directory form tracks it; Bailian is 3,388 B = 0.0032 MiB. Neither capture is git-ignored (`git check-ignore -v` on both captures and `pins-append.json` → no output, exit 1).

Path convention: all 27 existing entries are `.ufo/waves/round-<NN>/build/<SeatName>/<file>` (last: S195 → `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`); round-63 build dirs are `K63*`. `K63Capture` is the L1's capture dir (README.txt: "Captured by the L1 (KumitateR63)"), not a seat name, and the two scout seat dirs do not exist (`ls .ufo/waves/round-63/build/K63ScoutBailianOpen` → No such file). **Recommendation: keep `.ufo/waves/round-63/build/K63Capture/`** — the bytes are there and the pins must point at committed bytes; the seat-shaped alternative is pre-written in `pins-append-seatpaths.json` (identical sha256/bytes, only `path` differs) if the L1 moves the files.

## Findings

1. **K63ExecCapturePins-1 — low — out-of-tree audit re-bases paths.** `node scripts/source-capture.mjs --registry <mirror>/.ufo/pins/source-captures.json --sources <mirror>/corpus/SOURCES.md` sets `base = dirname(registry)` (`scripts/source-capture.mjs:182-185`), so every repo-relative pin reads `capture-absent` and a registry-relative pin reads `path-escape`: observed `DRIFT captures=29 exemptions=107 bad=29 first=S108:capture-absent` exit 1, and with `../../waves/...` paths `S196:path-escape`. Workable harness (used above): copy `scripts/source-capture.mjs` into the mirror so `LANE` = mirror and run the default registry. Repro: the two commands above against `/tmp/kumitate-r63/K63ExecCapturePins/mirror`.
2. **K63ExecCapturePins-2 — low — rows must land inside the table, not at EOF.** Appending `K63ExecRowDraft/append-block.md` to the end of `corpus/SOURCES.md` (file ends with `## Paths` at line 153) yields `file	E12	S196 row outside Registry section` / `E12	S197 …`, exit 1. Inserting the same two rows after line 147 (`| S195 |`) yields exit 0 with the base's six W04s. Repro: `bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file <copy-with-EOF-append>`.
3. **K63ExecCapturePins-3 — low — absolute pin paths inside the tree are accepted.** Setting S197's `path` to the absolute `/tmp/kumitate-r63/…/mirror/.ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html` still reads `CLEAN captures=29` (the target is inside `baseReal`, so no `path-escape`); outside the tree (`/etc/hostname`) it reads `DRIFT … bad=1 first=S197:path-escape`. Pins must stay repo-relative or the pin is host-specific; mine are. Repro: as in the mirror, edit `path` in a registry copy and run the default-registry gate.
4. **K63ExecCapturePins-4 — info — the pins are not idempotent.** Appending the block twice reads `FAIL-CLOSED reason=duplicate sourceId "S196"` exit 2 — the L1 must apply `pins-append.json` exactly once; re-running the merge is a hard failure, not a no-op.
5. **K63ExecCapturePins-5 — info — draft rows supersede my fallback.** `build/K63ExecRowDraft/append-block.md` appeared during this seat's run; its cells match my hashes/sizes (`7ea4396…`, 3388; `df31beb…`, 663997) and both its rows carry exactly 11 cells; the mirror was rebuilt with them and reads census `ok` + gate `CLEAN`. My hand-written `rows-append.md` is kept only as a fallback (also 11 cells, also census-clean).

## Artifacts

- `.ufo/waves/round-63/build/K63ExecCapturePins/pins-append.json` — the two entries, current paths (merge with the jq line above).
- `.ufo/waves/round-63/build/K63ExecCapturePins/pins-append-seatpaths.json` — same pins under `.ufo/waves/round-63/build/K63ScoutBailianOpen/` and `…/K63ScoutArxivOpen/` (only if the L1 moves the bytes).
- `.ufo/waves/round-63/build/K63ExecCapturePins/rows-append.md` — fallback S196/S197 rows (11 cells, hashes identical to the draft).
- `/tmp/kumitate-r63/K63ExecCapturePins/mirror/` — full mirror (scripts/, corpus/ incl. `knowledge/multi-agent-coordinator-topologies.md` placeholder for census E11, all 29 captures, merged registry); `merged.json`, `node-merged.json` at `/tmp/kumitate-r63/K63ExecCapturePins/`.
- Lane untouched: `git -C <lane> status --porcelain -- .ufo/pins corpus/SOURCES.md scripts` → empty, exit 0. No tool installs; no commits.

## Limits

- Did not re-fetch either URL: T5 (live fetch match) and the draft's "byte-identical re-fetch the same day" claim are another seat's arm; these pins bind committed bytes only.
- Did not run any frozen round-63 counter/probe, did not touch `.ufo/pins/`, `corpus/SOURCES.md`, `scripts/`, and did not commit.
- The census mirror used a placeholder entry file at `corpus/knowledge/multi-agent-coordinator-topologies.md`; the real entry must exist at integration or E11 fires for S196/S197.
- Not checked: whether the arXiv HTML is self-contained (external asset references), whether the Bailian `.md` is the vendor's canonical raw rendering versus a proxy rewrite, and README.txt is left unpinned (it is a note, not a source capture).
