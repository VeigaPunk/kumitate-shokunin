VERDICT: `OMP65_HELD` reads 8/8 on an entry that opens no source — three rows with fabricated claims, three pins bound to unrelated committed files, five "quotes" that normalise to the empty string — for 80 inserted lines across 7 files; O5 adds only "the quoted token appears somewhere in the live body", which a public echo URL satisfies with no hosting.

## Evidence

Frozen counter, base still 0/8 (not vacuous):
```
$ node .../probe/omp65-probe.mjs <clone at base> 47fe2383151909d31557ada118ad84f90404dc6c --no-live
OMP65_UNMET held=0/8 checks=8 rev=47fe2383... | O1 MISS entry-absent | O2 MISS no-entry | O3 MISS no-rows | ... | O8 MISS no-amendment-heading,...
EXIT=1
```
Naive forgery (real tag URLs, captures of unrelated files), off-line → 7/8, live → 7/8 with 5 of 6 quotes caught:
```
$ node .../omp65-probe.mjs <cloneA> a4f836b8... --no-live
OMP65_UNMET held=7/8 checks=8 ... | O5 MISS live-fetch-skipped                                  EXIT=1
$ node .../omp65-probe.mjs <cloneA> a4f836b8...
OMP65_UNMET held=7/8 checks=8 ... | O5 MISS S201:quote-not-live(bytes. # Output: OMP_BIN: = li);S202:quote-not-live(by +1 to +22. LOG.md pointers );...
```
Four independent 8/8 forgeries (all on the freeze commit 2ca91a0, forged commits only in /tmp clones):
```
tokens,    captures = freeze receipt + round-34 lesson + SOURCES.md   OMP65_HELD held=8/8 rev=367058425fec0e5575db21f91dd0b94800944d6e  EXIT=0
vacuous,   quotes = <p> <div> <b> <span> <em> "2025-11-25"           OMP65_HELD held=8/8 rev=d396720b746101d4942a26af54ebbf928da01fdf  EXIT=0
reflector, rows = httpbin.org/anything/*, no row URL at the release   OMP65_HELD held=8/8 rev=e72edf95ee0043ca001678790cee9a856bfd6a89  EXIT=0
doctored,  probe script = 15 echo lines; entry states real_bytes=1,
           lit_2026_07_28=999, wrapper_max_restarts=99 (host: 256702432, 0, 5)
                                                                     OMP65_HELD held=8/8 rev=e73e6f8cd7b2c4930af484cb9af647b6c528b0ea  EXIT=0
```
Cost of the cheapest one (`git diff --stat 2ca91a0 HEAD` in cloneE):
```
 7 files changed, 80 insertions(+), 1 deletion(-)   (entry 48 lines, 3 rows, 3 pins, README row, covered pin, PROVINCE line, amendment)
```
Full transcripts: `.ufo/waves/round-65/build/K65CriticC2Predicate/receipts/`.

## Findings

**K65CriticC2Predicate-1 (high) — O4/O5 accept quotes that normalise to the empty string.** `norm('<p>')` is `''`; `capture.includes('')` and `liveBody.includes('')` are both true, so five markup-only bullets pass O4 and O5 on any capture and any page (only the `2025-11-25` bullet needed real content). Attacks O4 and O5 directly; a "quote" is not required to be text. Repro: `node c2-forge-ratchet.sh <lane> <frozen probe> vacuous` → `OMP65_HELD held=8/8 ... EXIT=0`. Fix: `const q = norm(b.q); if (q.length < 8 || !/[A-Za-z0-9]/.test(q)) bad.push(...)` plus a line locator.

**K65CriticC2Predicate-2 (high) — O3 never binds the capture to the row URL.** A pin proves only that a committed file hashes to the pinned sha256; nothing compares those bytes with the cited page, or with each other. The three captures that read 8/8 were `base/omp-binary-probe-freeze.txt`, `corpus/lessons/round-34.md` and `corpus/SOURCES.md` — the registry pinned as the capture of an MCP page. Repro: receipt 3 (`cloneB`). Fix: capture record carries `url` and `status`, O3 requires `c.url === urlCell(row)`, and O5 requires `sha256(liveBody) === c.sha256`.

**K65CriticC2Predicate-3 (high) — O6 measures code the revision controls.** `scripts/omp-binary-probe.sh` is taken from the archive at M, so a revision can replace the measurement with 15 `echo` lines; the entry then states `real_bytes=1`, `lit_2026_07_28=999`, `wrapper_max_restarts=99` and O6 passes (no O6 MISS at `e73e6f8`). This is the false-provenance failure the entry claims not to make ("measured on this host"). Repro: `node c2-forge.mjs <clone> tokens && node c2-doctor.mjs <clone> && node omp65-probe.mjs <clone> HEAD`. Fix: run the freeze revision's probe bytes (`git show 2ca91a0:scripts/omp-binary-probe.sh`), as `ratchet-probe.mjs` does.

**K65CriticC2Predicate-4 (medium-high) — O6's version pin is a substring test on the whole row line.** `const u = rows.get(id) || ''` searches every cell, so `/v18.12.6/` written in the anchor cell pins the row while its URL is `httpbin.org/anything/...`; all three row URLs can avoid the release. Repro: receipt 5 (`cloneD e72edf9`). Fix: extract the URL cell (`cells(line)[2]`) and require host + `/v<real_version>/` path.

**K65CriticC2Predicate-5 (high, cheaper than the declared limit) — O5 is satisfied by a reflecting URL without any hosting.** `https://httpbin.org/anything/<token>` echoes the path in its JSON body; three such URLs passed O5 live. The plan's stated limit ("an attacker-hosted row URL would pass O5") understates the cost: no account, no hosting, one `curl` to confirm. Fix: host allowlist built from the round-base registry (`ALLOWED_HOSTS` in the ratchet prototype) plus the live-body hash binding of finding 2.

**K65CriticC2Predicate-6 (medium) — O7's two repo oracles are archive-local, and a real DRIFT is masked.** With the README row and covered pin removed, the honest gate reads `README_MAP: DRIFT files=158 rows=157 covered=157 bad=2 first=uncovered:knowledge/omp-installed-release-mcp-runtime.md` exit 1; after replacing `scripts/readme-map.mjs` and `scripts/sources-check.mjs` with constant printers the counter reads `OMP65_HELD held=8/8` (`cloneD 35c6512`). `readme-map.mjs` is already pinned in `.ufo/pins/counter-pins.json` (round 58) — the counter never consults the pin. Fix: run both oracles from the freeze revision's bytes (as with finding 3).

**K65CriticC2Predicate-7 (low) — O7's PROVINCE matcher accepts non-frontier prose.** `/frontier|band|ground|first entry|advanced/i` on any line containing the entry path: the line ``- ground: `corpus/knowledge/omp-installed-release-mcp-runtime.md` (not a frontier advance; a ground note)`` passes (`cloneD 7c76b9b`, 8/8). Fix: require the path inside the `### Frontier` section (the ratchet prototype's section slice).

**What O5 adds, exactly.** Against the naive forgery it is the only discriminating check: 7/8 off-line, 7/8 live with five lifted quotes MISSed, so the forger must open each cited page once and copy a token that is actually in the body. It does not require the capture to be that body (finding 2), does not care what the token means, and cannot see an empty token (finding 1).

**Smallest safe correction (ratchet, monotone).** `build/K65CriticC2Predicate/omp65-probe.ratchet.patch` (122 lines) adds: non-empty quote (min 8 normalised chars), capture `url`+`status` fields bound to the row URL, live-body sha256 equal to the capture pin, registry-host allowlist, freeze-revision probe and freeze-revision O7 oracles, URL-cell-only version pin, Frontier-section PROVINCE test. The prototype `ratchet-probe.mjs` rejects all four forgeries (`held=4/8`, `3/8`, `3/8`, `4/8`) and still reads the base 0/8; `c2-forge-ratchet.sh` FAILs on the frozen counter and PASSes on the prototype. Its O4 floor of 8 chars deliberately outlaws 3-char tokens (`MCP`, `OMP`) — a quote must be a phrase; the L1 may want to lower it to 6 chars and require ≥2 words.

## Artifacts

- `.ufo/waves/round-65/build/K65CriticC2Predicate/` holds `c2-forge.mjs` (modes naive|tokens|reflector|vacuous), `c2-doctor.mjs`, `mkratchet.mjs`, `ratchet-probe.mjs`, `omp65-probe.ratchet.patch`, `c2-forge-ratchet.sh`, `receipts/frozen-counter.txt`, `receipts/ratchet-clone{B,C,D,E}.txt`, `receipts/control-{frozen,ratchet}.txt`.
- Forgery clones (scratch): `/tmp/kumitate-r65/K65CriticC2Predicate/clone{A,B,C,D,E}`; forged revisions `a4f836b8`, `367058425`, `d396720b`, `e72edf95`, `e73e6f8c`, `7c76b9bb`, `35c65121`.
- Lane worktree untouched: `git status --short` shows only untracked round-65 wave files; no frozen file edited, no index change.

## Limits

- No honest revision M exists yet, so the ratchet prototype has never been shown to *accept* a sound entry; it may over-reject (the 8-char quote floor, the host allowlist, and the freeze-revision oracle rule all need an honest fixture before pinning).
- The reflector receipts use httpbin.org; reachability was verified today only (three GETs, HTTP 200). A lane that loses network access fails O5 closed, which is correct but unmeasured here.
- I did not run the C1 counter, the harm matrix, or any gate outside C2's O1–O8.
- I did not test whether a forged *entry body* (claims, not quotes) can mislead a reader; O1–O8 have no semantic check at all, which is the plan's declared limit and remains true.
