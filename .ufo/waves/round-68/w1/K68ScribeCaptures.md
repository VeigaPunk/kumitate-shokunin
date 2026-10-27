VERDICT: The seven S207–S213 capture pins are drafted from bytes that all seven row URLs still serve (sha256 re-verified live today) and the fragment scores M3+M4+M5(live)+M6+M7+M8 PASS on a fixture commit — but `SOURCE_CAPTURE: CLEAN` alone proves neither document identity (a 404 page pins clean) nor a capture at all (an exemption entry pins clean).

## Evidence

Lane state before integration (unchanged by this seat): `node scripts/source-capture.mjs` → `SOURCE_CAPTURE: CLEAN captures=38 exemptions=107` exit 0; `corpus/knowledge/mcp-deprecation-registry.md` absent; zero S207–S213 rows.

Live re-fetch of every row URL (`curl -fsSL`, 2026-10-27) — bytes/sha256 equal to the pinned capture in all seven cases:

```
deprecated.md (2026-07-28)            3839  c12c3cb7d6b8a30cd4df8ea8162a819df071a42745da6d20165e8fdf94b28baa
community/feature-lifecycle.md        8794  3f3371911512591e61d80d8e1bf07ac6a93df4e930d1379d24b78034349e74ee
sse.ts @v18.12.6                     15183  0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0
seps/2596 @183238ddac                26389  6608969be1213cafd12edc27269519be54b3fadb0443ff0f1b5fc76f75752de4
transports 2025-11-25                16321  ae9bb7be00604a66a8f70f439ef028eced174bce4a5cb0f6fc11bbeaa625afcc
sse.ts @v18.13.1                     15183  0b69229a69b01a372117d3d86833ec40e8f5118efe1049fdc4993ae1c677fbb0
commit 183238ddac.patch (HTTP 200)   43988  ff518cf333b141ab8de8d23baddeecf698e6b6f7a6143d8d0fc8a2aa2a6fa919
```

Fixture integration (`git clone --shared` in scratch, 7 scribe rows inside `## Registry`, scribe entry draft, 7 captures copied to `.ufo/waves/round-68/build/captures/`, 7 pins from `gen-pins.mjs --merge`, commit `fc63bd8d`):

```
$ node scripts/source-capture.mjs                       SOURCE_CAPTURE: CLEAN captures=45 exemptions=107   exit 0
$ node scripts/sources-check.mjs | tail -1              SOURCES_CHECK: CLEAN (rows=152 tiers=A:129,B:15,C:8 …)
$ node .../K68ScribeCaptures/gen-pins.mjs … --check      PINS_OK 7/7 bytes match registry                  exit 0
$ git archive fc63bd8d | tar -x -C $A; (cd $A && node scripts/source-capture.mjs)
                                                        SOURCE_CAPTURE: CLEAN captures=45 exemptions=107   exit 0
$ node .ufo/waves/round-68/probe/deprec68-probe.mjs <clone> fc63bd8d
  DEPREC68_UNMET held=9/10 checks=10 rev=fc63bd8d… rule=M68 | M9 MISS readme-map-exit=1,province-entry-not-named
```

`held=9/10` with the **live** arm on: M1–M8 PASS (M3 pin bytes, M4 quotes in captures, M5 quotes in fresh fetches of all seven row URLs, M6 snapshot, M7 clock, M8 release section). The only MISS is M9's `readme-map` + PROVINCE line — L1 integration surface, outside the pin layer.

Attacks (archives of the same fixture, bytes/hashes recomputed honestly before each run):

```
A pin S211→HTTP-404 body (831 B 68b6ff60…)   CLEAN captures=45   | probe M4 MISS S211:quote-not-in-capture,S211:no-bullet  held=7/10
B S207–S213 exempted instead of captured     CLEAN captures=38 exemptions=114 | gen-pins --check PINS_DRIFT … | probe M3 MISS cited=7 S207:pin-absent… held=5/10
C hash flipped on S213                       DRIFT … first=S213:hash-mismatch          exit 1
D S212 capture is a symlink                  DRIFT … first=S212:not-a-regular-file    exit 1
E pin path ../outside.txt (honest bytes)     DRIFT … first=S210:path-escape           exit 1
F capture via a symlinked directory          DRIFT … first=S208:path-escape           exit 1
```

Exemption logic read in `scripts/source-capture.mjs`: exemptions are keyed by **S-id only** (`loadRegistry` folds `x.ids` into the same `Set` as `sourceId`); there is no path-pattern exemption, so the seven new paths under `.ufo/waves/round-68/build/captures/` need **no** exemption entry and the S001–S107 pre-rule blob stays as is.

Peer cross-check (reported by K68ScribeEntry, not reproduced here): its fixture reaches `DEPREC68_HELD held=10/10` once M9's landings are present. Verified read-only here: lane `README_MAP: CLEAN files=163 rows=163 covered=163`, `covered` does **not** name `knowledge/mcp-deprecation-registry.md`, and `corpus/README.md` has no row for it — M9 needs the entry file + README row + `covered` pin (plus the PROVINCE line), not the row alone, or `readme-map` reads `DRIFT … first=unpinned:`.

## Findings

**K68ScribeCaptures-1 — the pin layer is content-blind; a 404 page pins CLEAN. Severity: medium.** `source-capture.mjs` checks bytes, sha256, regular-file-ness and lane confinement — never that the bytes are the document. `https://modelcontextprotocol.io/specification/2025-11-05/basic/transports.md` returns HTTP 404 with an 831-byte "Page Not Found" body (`68b6ff608bc24769f9cf2c472e35635eb89e147419eb2973bd905b36c1c3a3ca`) and, pinned honestly, yields `SOURCE_CAPTURE: CLEAN captures=45` exit 0 (attack A). This is not hypothetical: at 11:55 the shared `.ufo/waves/round-68/build/captures/transports-2025-11-05.md` **was** exactly that 404 body (831 B, same sha), later overwritten with the real 16321-byte 2025-11-25 page under the same misdated name. Only the entry's located quotes (M4) + live re-fetch (M5) catch it, and only because M4 demands ≥1 bullet per cited row. Repro: `curl -s -o stub.md -w '%{http_code}\n' https://modelcontextprotocol.io/specification/2025-11-05/basic/transports.md` → 404, 831 B; pin it and run the gate.

**K68ScribeCaptures-2 — an exemption entry satisfies the gate for a cited row. Severity: medium.** Moving S207–S213 from `captures` to `exemptions` yields `SOURCE_CAPTURE: CLEAN captures=38 exemptions=114` exit 0 while the frozen counter prints `M3 MISS cited=7 S207:pin-absent…` and `held=5/10` (attack B). The gate cannot distinguish "the bytes were captured" from "the row was excused". Repro: the attack-B `node -e` snippet in `build/K68ScribeCaptures/evidence.txt` §9, then `node scripts/source-capture.mjs` beside `node .ufo/waves/round-68/probe/deprec68-probe.mjs`.

**K68ScribeCaptures-3 — two artifacts per row drift apart silently. Severity: medium (integration).** S210's row URL serves the raw file at `183238ddac` (26389 B, `6608969b…`), while `https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation.md` serves a different rendering (25830 B, `cc50162d…`) and `build/captures/sep2596.md` currently holds the latter. Similarly the shared dir now carries `transports-2024-11-05.md`, `transports-2025-11-05.md` (actually the 2025-11-25 page) and `S211-transports-2025-11-25.md` in three seats' naming. Pin the artifact the row URL serves, with an id-prefixed name. Repro: `curl -fsSL <both S210 URLs> | sha256sum`. Drafted set: `.ufo/waves/round-68/build/captures/S2xx-…` per `pins.json-fragment`.

**K68ScribeCaptures-4 — worktree CLEAN is not archive CLEAN. Severity: low.** With eight capture files untracked (`git status --porcelain` → `?? .ufo/waves/round-68/build/`), the worktree gate still printed CLEAN; M9 runs the gate inside `git archive M`. Repro: leave the captures untracked, run `node scripts/source-capture.mjs` (CLEAN), then run it in an extraction of a commit that predates the copy (`S2xx:capture-absent`).

**K68ScribeCaptures-5 — scout captures carry fetch headers, so their pins are not document bytes. Severity: low.** `K68ScoutS207/…(3950)`, `S208/…(9306)`, `S209/…(15726)`, `S212/…(15757)` strip to exactly the live bytes (`c12c3cb7…`, `3f337191…`, `0b69229a…`, `0b69229a…`) but their own sha256 is a sha of the note too. Pinning the header-prefixed file still passes M4/M5 (substring) while the pin claims a byte identity that is not the document's. Repro: `tail -n +N <scout file> | sha256sum`.

**K68ScribeCaptures-6 — missing named captures, flagged not invented. Severity: low.** `.ufo/waves/round-68/build/K68ScoutS210/captures/` and `K68ScoutS211/captures/` exist and are empty; `K68ScoutS213/captures/` holds only `pr2596-commits-api.json` (99864 B) and `mark-seps-final.json` (58741 B), no patch. The S210/S211/patch bytes used here come from `K68ScribeEntry/captures/` and each was re-fetched live by this seat (table above) before being pinned. Repro: `find .ufo/waves/round-68/build/K68ScoutS21*/captures -type f`.

**K68ScribeCaptures-7 — row placement: appending at EOF is DRIFT. Severity: low (integration).** Appending the seven rows after the last line of `corpus/SOURCES.md` gave `SOURCES_CHECK: DRIFT (ROW_OUTSIDE_REGISTRY,ENTRY_SOURCE_UNKNOWN)`; inserting after the `| S206 |` row (line 158) gave CLEAN. Rows, pins, captures and the entry must land in one commit: a pin without its row is `orphan-capture`, a row without its pin is `uncaptured` (both exit 1).

## Artifacts

- `.ufo/waves/round-68/build/K68ScribeCaptures/pins.json-fragment` — the 7 entries (`sourceId/path/sha256/bytes/captured:"2026-10-27"`), paths `.ufo/waves/round-68/build/captures/S2xx-…`, all seven sha256 verified against live fetches today.
- `.ufo/waves/round-68/build/K68ScribeCaptures/gen-pins.mjs` — `--emit | --merge | --check`; regenerates the fragment from committed bytes, merges idempotently, strips S207–S213 from exemptions, fails if a capture is missing.
- `.ufo/waves/round-68/build/K68ScribeCaptures/howto.md` — staging commands, the exemption answer, the ordering rule, the exact archive-rooted close command (`SOURCE_CAPTURE: CLEAN captures=45 exemptions=107`), and the attack table.
- `.ufo/waves/round-68/build/K68ScribeCaptures/evidence.txt` — verbatim outputs of every run cited above.
- `.ufo/waves/round-68/w1/K68ScribeCaptures.md` — this report.

## Limits

- Did not integrate: `scripts/`, `corpus/`, `.ufo/pins/`, PROVINCE.md, README map untouched (L1 sole owner); the entry draft, rows and captures used in the fixture are copies in a scratch clone, made by sibling seats, not by me.
- M9 remains open on the fixture (`readme-map-exit=1`, `province-entry-not-named`); I did not attempt the readme-map row or the PROVINCE line.
- The M5 verdict depends on the network at close time; seven fetches were live today, nothing more.
- Byte-identical captures for S209 and S212 are a verified fact at both tags, not a copy error; the gate has no way to distinguish them, and I did not add one.
- No tool installs or upgrades were needed. Scratch `/fast/scratch/hyaku/kumitate-r68/K68ScribeCaptures/` removed after the receipts were copied out.
