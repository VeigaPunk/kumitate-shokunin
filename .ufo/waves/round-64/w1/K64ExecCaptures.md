VERDICT: The three C2 source documents are captured byte-stably at lane paths and bound to S198/S199/S200 in a pins append that reads `SOURCE_CAPTURE: CLEAN captures=32 exemptions=107` (exit 0) on a scratch mirror; the /latest/ pair is byte-stable across three fetches but /latest/working-copy/ is AHEAD of the host's jj 0.45.1, so a version-pinned alternate binding is supplied and recommended.

## Evidence

Fetch (all `curl -sSL -A 'Mozilla/5.0 (kumitate-r64)'`, 2026-10-25):
```
jj-technical-concurrency.html -> 200 text/html; charset=UTF-8 48988
firefox-jujutsu.html          -> 200 text/html; charset="utf-8" 53233
jj-working-copy.html          -> 200 text/html; charset=UTF-8 47694
sha256sum: 5e2f7576…e2e00bf6 (concurrency) · abbe47cf…db7b3d2 (firefox) · 947d0c56…4ff3c7 (working-copy)
```
Stability — every URL fetched 2× (the /latest/ pair and Firefox 3×); `cmp` byte-identical each time:
```
jj-technical-concurrency BYTE-IDENTICAL / firefox-jujutsu BYTE-IDENTICAL / jj-working-copy BYTE-IDENTICAL
live3-conc.html 5e2f7576…  live3-wc.html 947d0c56…  live3-ff.html abbe47cf…   (third fetch, same shas)
```
Versioned alternates (`/v0.45.1/…`), fetched twice each, stable:
```
jj-technical-concurrency-v0.45.1.html 48988 5e2f7576…  cmp /latest/ -> IDENTICAL
jj-working-copy-v0.45.1.html          47168 b660365a1b951cf24973397c69763bb130971c245e57e1e8d6cf760290543c3d  cmp /latest/ -> DIFFERS
```
Pin binding, full scratch mirror of the lane (`/tmp/kumitate-r64/K64ExecCaptures/fullmirror`, tar copy minus .git/.jj) with the three entries spliced and the three draft rows spliced after `| S197 |`:
```
cd $F && node scripts/source-capture.mjs
SOURCE_CAPTURE: CLEAN captures=32 exemptions=107          EXIT=0     (variant A, /latest/ pins)
SOURCE_CAPTURE: CLEAN captures=32 exemptions=107          EXIT=0     (variant B, v0.45.1 pins)
bash /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file $F/corpus/SOURCES.md
file  ok  …/corpus/SOURCES.md                             CENSUS_EXIT=0   (only the 6 pinned W04 lines)
```
Red-before (the pin really binds bytes; each mutation restored to CLEAN after):
```
append 1 byte      -> SOURCE_CAPTURE: DRIFT captures=32 exemptions=107 bad=1 first=S198:bytes-mismatch   EXIT=1
truncate 10 bytes  -> … first=S198:bytes-mismatch                                                       EXIT=1
same length, 1 byte flipped -> … first=S198:hash-mismatch                                               EXIT=1
absolute symlink   -> … first=S198:path-escape                                                          EXIT=1
relative symlink   -> … first=S198:not-a-regular-file                                                   EXIT=1
drop the S198 SOURCES row -> … first=S198:orphan-capture                                                EXIT=1
restore            -> SOURCE_CAPTURE: CLEAN captures=32 exemptions=107                                  EXIT=0
```
Gate binary is live: `node scripts/source-capture.mjs --selftest` → `SOURCE_CAPTURE_SELFTEST: PASS (13/13)` / `VERDICT: PASS`, exit 0. Lane baseline unchanged: `SOURCE_CAPTURE: CLEAN captures=29 exemptions=107`, `SOURCE_DUPES: CLEAN groups=6 known=6`.
Quotes (probe's own normalizer, `jj64-probe.mjs:70-78`), 19 candidates, capture AND live:
```
node .ufo/waves/round-64/build/K64ExecCaptures/verify-quotes.mjs . --live
VERIFY_QUOTES: CLEAN quotes=19 bad=0 live=on pins=pins-append.json            EXIT=0
VERIFY_QUOTES: CLEAN quotes=19 bad=0 live=on pins=pins-append-versioned.json  EXIT=0
```
Row shape under the probe's splitter (`line.split('|')` → 13 tokens, `jj64-probe.mjs:97,108`): all three rows `cells=13`, status `mined`, opened `2026-10-25`, used-by names the entry, URL + tier present → `J2-shape OK`.

## Findings

**K64ExecCaptures-1 — HIGH — /latest/working-copy/ documents a subcommand the host does not have.**
`jj-working-copy.html` (47694 B) carries `jj workspace remove`; `jj-working-copy-v0.45.1.html` (47168 B) does not, and the host refuses it:
```
$ jj --version   -> jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
$ jj workspace remove --help
error: unrecognized subcommand 'remove'
  tip: a similar subcommand exists: 'rename'
EXIT=2
```
Attack on C2: a `## Located quotes` bullet drawn from that sentence passes J4/J5 (it is in the capture and live) yet describes behaviour the J6 demo cannot show on this host, and an entry that lists a `remove=` demo key would be fabricated. The demo's 15 outcome keys must stay on 0.45.1 semantics (`forget`, `update-stale`, `list`, `root`, `--ignore-working-copy`, rewrite vs abandon). Repro: `grep -c 'jj workspace remove' .ufo/waves/round-64/build/K64ExecCaptures/captures/jj-working-copy.html` → 1; same grep on the `-v0.45.1.html` → 0.

**K64ExecCaptures-2 — MEDIUM — `/latest/` is an unpinned moving target; a version-pinned binding is supplied.**
Neither jj URL contains a version segment, and `/v0.45.1/technical/concurrency/` answers 200 with the same bytes as `/latest/` today — so the rendering is versioned server-side and `/latest/` will move at the next release, rotting J5's live re-fetch. `pins-append-versioned.json` binds S198/S199 to the immutable v0.45.1 renderings (verified CLEAN, and all 19 quotes still pass against them); `pins-append.json` binds the /latest/ renderings exactly as assigned. Integrate ONE file only — both carry S198/S199/S200, and two bindings for one id are `FAIL-CLOSED` in the gate. Repro: `curl -sSI https://docs.jj-vcs.dev/v0.45.1/working-copy/ | head -1` → `HTTP/2 200`; `curl -sSL …/latest/working-copy/ | sha256sum` vs `…/v0.45.1/working-copy/`.

**K64ExecCaptures-3 — MEDIUM — the Firefox page is unversioned main-branch docs, and its quotes break on apostrophes/code spans.**
`Last-Modified: Sat, 24 Oct 2026 08:10:33 GMT`, CloudFront, no versioned alternative; stable across three fetches but it can change on any mozilla-central docs push, so keep `recheck: on-release` and treat the committed capture as the J4 ground. Its prose has 12 × U+2019 and its code spans 16 × `&#39;`, zero raw ASCII apostrophes, and `update-stale` is a code span — so the sentence normalizes to `…update with jj workspace update-stale .` (space before the period). A scribe writing `update-stale.` MISSES J4. Repro: `node …/verify-quotes.mjs . --live` after editing one bullet to drop that space → `FAIL S200 … capture=n`. The safe, verified bullet set is in `quotes-verified.md`.

**K64ExecCaptures-4 — LOW — S199 overlaps S067 and the dupe gate will not say so.**
S067 already pins `docs/working-copy.md` at tag v0.45.1; S199 is the same document rendered. `source-dupes` keys on the normalized URL, so `docs.jj-vcs.dev/latest/working-copy` and `raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/working-copy.md` never form a group (`SOURCE_DUPES: CLEAN groups=6 known=6` in the mirror). Scope S199 to workspace/staleness semantics and let the row text say what it adds over S067 (per-workspace checked-out commit, forget, stale detection), or the registry splits authority silently. Repro: `node scripts/source-dupes.mjs` in the mirror → 6 groups, S199 absent.

**K64ExecCaptures-5 — LOW — the ">1 MiB named directory" rule is still unlocated.**
All five files are 47–53 KB, so no hazard exists here; but no such threshold exists in `scripts/*.mjs|*.sh` (round-63's `K63SentinelScope-…` recorded the same negative), so the constraint in my brief cannot be re-verified by any seat. Declared as a limit below, not patched.

**K64ExecCaptures-6 — INFO — pages are static; no `.md` fallback is needed.**
No nonce, CSRF token, build date or cache-buster in any body (`grep -oiE '(nonce|csrf|build_date|timestamp|generated at)'` → no hits); `last updated` in `jj-working-copy.html` is prose about the operation log, not a date. Generators: `mkdocs-1.6.1, mkdocs-material-9.6.23` (jj), Sphinx + Read the Docs (Firefox). If a text-only capture is ever wanted, `https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/technical/concurrency.md` answers 200, 7295 B.

## Artifacts

- `.ufo/waves/round-64/build/K64ExecCaptures/captures/{jj-technical-concurrency,firefox-jujutsu,jj-working-copy}.html` — the three pinned captures (A)
- `.ufo/waves/round-64/build/K64ExecCaptures/captures/{jj-technical-concurrency,jj-working-copy}-v0.45.1.html` — versioned alternates (B; unpinned in A, documented in `captures/README.txt`)
- `.ufo/waves/round-64/build/K64ExecCaptures/captures/README.txt` — fetch record: UA, URLs, HTTP status, bytes, sha256, stability
- `.ufo/waves/round-64/build/K64ExecCaptures/pins-append.json` — three registry entries (A: /latest/, the assignment's fetch)
- `.ufo/waves/round-64/build/K64ExecCaptures/pins-append-versioned.json` — three registry entries (B: v0.45.1, immutable)
- `.ufo/waves/round-64/build/K64ExecCaptures/draft-rows.md` — 11-cell SOURCES rows S198/S199/S200, wording valid under both bindings
- `.ufo/waves/round-64/build/K64ExecCaptures/quotes-verified.md` — 19 probe-normalized quote candidates (6/7/6 per row), all capture+live
- `.ufo/waves/round-64/build/K64ExecCaptures/verify-quotes.mjs` — re-runnable J4/J5 checker (`node …/verify-quotes.mjs <lane> [--pins file] [--live]`)

## Limits

- I did not run the C2 probe (`jj64-probe.mjs`) end to end: it archives a *revision*, and the entry, rows and demo do not exist at any revision yet. I verified J2's row shape, J3's binding and J4/J5's quote test by re-using the probe's own code paths on a mirror; J1/J6/J7/J8 belong to the entry and demo seats.
- The mirror is a tar copy of the lane minus `.git`/`.jj` taken while siblings were writing into `.ufo/waves/round-64/build/` (`tar: ./.ufo/waves/round-64/build: file changed as we read it`); my three captures were copied before any sibling wrote, and the gate's hash check confirms the mirrored bytes.
- `sources-census.sh` lives in the FLEET repo (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh`), not in the lane; I ran it read-only from there, as J7 does.
- I did not test whether the `/latest/` pages change under a different UA or via the site's search index; only the HTML document bodies were compared.
- No tool was installed or upgraded (nothing needed); pacman untouched; no REA work; no subagent dispatched.
- The pin paths sit under `.ufo/waves/round-64/build/K64ExecCaptures/`; if the L1 prefers round-63's `K63Capture`-style location or wants the versioned pair dropped, both are one-line edits in the chosen pins file.
