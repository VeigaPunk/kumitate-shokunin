VERDICT: The round-64 collision guard reproduces the L1's frozen id files byte-for-byte and fires on a planted collision at 0 and 2 spaces (and 3+tab), stays blind to 4-space rows exactly as the maintained census does, and the jj theme's map must be written by document — staged S259+S270 are one document that the lane already holds as S067, so S200 must be a `supersedes S067 —` row, not a second admission.

## Evidence

1. Guard re-run, lane registry vs staged append (the plan's command, unchanged):
```
$ grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' <lane>/corpus/SOURCES.md | grep -oE 'S[0-9]+' | sort > reg-ids
$ grep -oE '^ {0,3}\|[[:space:]]*S[0-9]{3,}' /home/vgpnk/Projects/shokuknow/merge/kumitate/SOURCES.append.md \
    | grep -oE 'S[0-9]+' | sort > staged-ids
$ comm -12 reg-ids staged-ids > collisions
 136 reg-ids / 155 staged-ids / 3 collisions
 S195
 S196
 S197
$ sha256sum reg-ids staged-ids collisions   # mine, then .ufo/waves/round-64/assimilation/*
 ac9b7bde7ff36cf8e40317a02c8528daafbb903e46d4779cfc962212f552ebbd  reg-ids       (both files)
 ca196727ecb5348d6a23421b2aa56f197a2d3a1d83e3a15d000eff3d3cea37f5  staged-ids    (both files)
 28c796ea3fd40be1b5a7081a2e2b58371e92f467c1f5e8a9e0d081f8614d1221  collisions    (both files)
```
→ identical to the L1's frozen copies; the plan's numbers (136 / 155 / S195 S196 S197) hold.

2. Guard proven able to fail, and blind where the census is blind (`build/K64ExecCollisionGuard/proof.sh`, verbatim `proof.txt`, exit 0; S259 is a staged id that does NOT collide today, so a fixture hit is a new collision):
```
FIXTURE          GUARD                        CENSUS                       VALIDATE
base             rows=136 collisions=3 S195 S196 S197 exit=0  rows=136 exit=0  exit=0 E(n=0)=[]
fixture-0sp      rows=137 collisions=4 +S259           exit=0  rows=137 exit=0  exit=0 E(n=0)=[]
fixture-2sp      rows=137 collisions=4 +S259           exit=0  rows=137 exit=0  exit=0 E(n=0)=[]
fixture-4sp      rows=136 collisions=3 S195 S196 S197 exit=0  rows=136 exit=0  exit=0 E(n=0)=[]
fixture-tab      rows=137 collisions=4 +S259           exit=0  rows=137 exit=0  exit=0 E(n=0)=[]
fixture-e12      rows=137 collisions=4 +S259           exit=0  rows=136 exit=0  exit=1 E(n=1)=[E12:S259 row outside Registry section]
fixture-badid    rows=137 collisions=4 +S259           exit=0  rows=137 exit=0  exit=1 E(n=1)=[E02:S259x]
fixture-4digit   rows=137 collisions=3 S195 S196 S197 exit=0  rows=137 exit=0  exit=0 E(n=0)=[]
fixture-crlf     rows=137 collisions=4 +S259           exit=0  rows=0   exit=0  exit=1 E(n=137)=[E12:S001 …]
```
Planted row (identical in every fixture except the last): `  | S259 | Fixture colliding row — https://fixture.example/collision-259 | docs | B | fixture | §1 | … | queued | 2026-10-25 | 90d | — |` at 0 / 2 / 4 leading spaces, `   |\tS259 | …` for `-tab`, under `## Paths` for `-e12`, id `S259x` for `-badid`, `S2590` for `-4digit`, and CRLF line endings for `-crlf`. Guard exit 0 = collisions found, 1 = silent.
Locale: `LC_ALL=C`, `C.UTF-8`, `en_US.UTF-8` all yield `S195 S196 S197`; `S2590` does not prefix-collide with `S259`.

3. S200's document IS lane S067's document (`build/K64ExecCollisionGuard/document-identity.txt`):
```
$ grep -o 'docs/working-copy.md' wc-latest.html | head -1
docs/working-copy.md            <- the live latest page's own "Edit this page" target
$ sha256sum wc-0451.md
20578df094781b9a3a24a33be318ee2810b6686e3886ea13f997c5a20275e4ea
                                <- exactly S067's anchor `body sha256` (corpus/SOURCES.md:80)
v0.45.1 raw sentences found verbatim in live latest page: 20/57
```
S067 (`corpus/SOURCES.md:80`) anchor already reads `§ Workspaces :74-118 (incl. stale working copy), :95-98`.

4. Staged own-work rows and the lane's own precedent:
```
$ git -C /home/vgpnk/Projects/shokuknow log -1 --format='%H'
8b94c5c12c0521e4cd9ed8e5b6939afd8518c715        (all three transcripts tracked=yes)
lane S090 (corpus/SOURCES.md:103): kind own-work, absolute fleet path, anchor "fleet commit 4248e924…;
  body sha256 9f0be557…", tier B.  staged S271/S280/S295: absolute shokuknow paths, no commit binding, tier A.
```

5. The three colliding ids, checked by document (an id collision is not a document collision — Q56):
```
staged S195 (SOURCES.append.md:7) MCP Architecture overview   https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture
                                  == lane S125 (corpus/SOURCES.md:137), same URL
staged S196 (:8)                  Temporal Detecting Activity failures  https://docs.temporal.io/encyclopedia/detecting-activity-failures
                                  == lane S117 (:130) and S126 (:140), same URL
staged S197 (:9)                  MCP Tasks extension spec  …/ext-tasks/blob/b3d28ace…/specification/2026-07-28/tasks.md
                                  == lane S127 (:138), same URL
```
→ three id collisions, zero document collisions: none of the three may be appended (the lane already holds each document). None of the eight jj staged ids (S259 S270 S271 S280 S290 S291 S295 S309) is in `collisions`, so the plan's "none of the jj rows collides" holds.

## Findings

- **K64ExecCollisionGuard-1** (high) — *attacks: the entry's S200 row, C2's J2/J3 chain.* Staged S259 and S270 both point at `https://docs.jj-vcs.dev/latest/working-copy/`, which is the rendered `docs/working-copy.md` — the same document as lane S067, byte-anchored by sha256 (evidence 3). Opening S200 as a second, independent row is a silent duplicate document (QUALITY Q56, `corpus/QUALITY.md:941`), and no automated gate can see it: `source-dupes`/census W04 key on the **normalised URL**, and the two hosts differ (`docs.jj-vcs.dev/latest/working-copy` vs `raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/working-copy.md`). Fix (strengthening): S200's `teaches` opens `supersedes S067 —`, scope names the unpinned `latest` tag versus S067's pinned v0.45.1, capture pinned to the `latest` bytes at 2026-10-25. The lane's own duplicate-resolution language (`.ufo/pins/source-dupes.json`: "resolution = supersede one row into the other") and 15 existing `supersedes S0NN —` teaches (e.g. S081→S004, S090→S061) both admit this form, and S067 keeps status `mined`. Repro: `curl -sS https://docs.jj-vcs.dev/latest/working-copy/ | grep -o 'docs/working-copy.md' | head -1` → `docs/working-copy.md`; `curl -sS https://raw.githubusercontent.com/jj-vcs/jj/v0.45.1/docs/working-copy.md | sha256sum` → `20578df0…e4ea` = S067's pinned `body sha256`; full transcript in `document-identity.txt`.
- **K64ExecCollisionGuard-2** (medium) — *attacks: any copy of staged S270's `teaches`.* S270 says it was read "because round 8's row on the same page reached only its opening paragraph". Copied into the lane that sentence is false about the lane's own registry: S067 anchors `§ Workspaces :74-118 (incl. stale working copy)` (`corpus/SOURCES.md:80`). Copying it imports a false claim about the lane into a row whose `opened` must be 2026-10-25 (J2). Repro: `grep -nE '^\| S067 ' corpus/SOURCES.md` against staged S270 (`SOURCES.append.md:82`).
- **K64ExecCollisionGuard-3** (medium) — *attacks: adopting staged S271/S280/S295.* All three are `own-work` rows whose `source` is an absolute path into the read-only campaign repo (`/home/vgpnk/Projects/shokuknow/lanes/kumitate/round{9,10,12}/…`), with no commit binding, claiming tier A. The lane's own precedent for an external absolute path (S090) binds a commit hash + sha256 and sits at tier B; and a lane row cannot be re-opened at the measured revision (`git archive M`), so J3's capture pin would have to copy campaign bytes into the lane. They are also unnecessary: J2's `source:` lines require a URL, and the demo ground is `scripts/jj-seat-demo.sh` — a command, admitted by `CORPUS.md:90` ("a repo path or command for `own-work`") — whose run is J6's object. Repro: `git -C /home/vgpnk/Projects/shokuknow log -1 --format=%H` and the three `source` cells at `SOURCES.append.md:83,92,107`.
- **K64ExecCollisionGuard-4** (low) — *attacks: the guard's collision set when a fixture or preamble carries a non-registry row.* The guard scans the whole file for `^ {0,3}\|…S###`; the census counts only rows inside `## Registry` and emits E12/E02 instead. So a row-shaped example under any other heading, or an invalid id `S259x`, raises a **phantom** collision the census does not recognise (fixture-e12, fixture-badid above). Direction is fail-safe (the guard can only over-detect), but a seat that plants a fixture in the preamble will read a collision the lane does not have. Repro: `KEEP_FIXTURES=/tmp/fx bash build/K64ExecCollisionGuard/proof.sh <lane> <staged>` then `bash build/K64ExecCollisionGuard/guard.sh /tmp/fx/fixture-e12.md <staged> /tmp/ids`.
- **K64ExecCollisionGuard-5** (low) — *attacks: census tooling, not the guard.* A CRLF registry breaks the census completely while the guard keeps working: `## Registry\r` never equals `Registry`, so rows=0 and 137×E12. Measured on the `fixture-crlf` row of `proof.txt`: guard `rows=137 collisions=4 … exit=0`; census `rows=0`; validate `exit=1`, `137` E12 lines, first `E12 S001 row outside Registry section`. Any registry landed with CRLF would invert every census gate silently. Repro: `KEEP_FIXTURES=/tmp/fx bash build/K64ExecCollisionGuard/proof.sh <lane> <staged>` then `bash build/K64ExecCollisionGuard/guard.sh /tmp/fx/fixture-crlf.md <staged> /tmp/ids` (guard `rows=137 collisions=4 … exit=0`) and `scripts/sources-census.sh census --file <lane-shaped-root>/corpus/SOURCES.md` on the same bytes (`rows=0`).
- **K64ExecCollisionGuard-6** (low) — *attacks: any seat validating a fixture registry out of tree.* `sources-census.sh:497-501` sets the lane dir to `realpath(dirname(file)/..)`, so a fixture at `/tmp/…/fixture.md` resolves every `used-by` path against `/tmp` and emits E11 per path: `172` E11 lines and exit 1 on an otherwise clean 137-row fixture, versus `0` E11 and exit 0 once the same bytes sit in a lane-shaped root. Repro: compare `validate --file /tmp/…/fixture-2sp.md` with `proof.sh`'s in-tree run.

## Artifacts

- `.ufo/waves/round-64/build/K64ExecCollisionGuard/guard.sh` — the plan's guard, parameterised (`<registry> <staged> <outdir>`), exit 0 = fires.
- `.ufo/waves/round-64/build/K64ExecCollisionGuard/proof.sh` — builds the lane-shaped scratch root, plants the eight fixtures, prints the table above; `KEEP_FIXTURES=<dir>` exports the fixture registries (they are generated, not committed, so no 8× registry copy lands in the lane).
- `.ufo/waves/round-64/build/K64ExecCollisionGuard/proof.txt` — verbatim run of `proof.sh` (10 lines, exit 0).
- `.ufo/waves/round-64/build/K64ExecCollisionGuard/renumber-map.md` — the eight staged jj rows classified and the staged→lane map by document (S290→S198, S291→S199, S259+S270→S200; S271/S280/S295 not adopted; S309 available).
- `.ufo/waves/round-64/build/K64ExecCollisionGuard/document-identity.txt` — the S200↔S067 evidence with hashes.
- Scratch: `/tmp/kumitate-r64/K64ExecCollisionGuard/`.

## Limits

- I did not run `jj64-probe.mjs` or attack `scripts/jj-seat-demo.sh` / the entry text (other seats own C2); my S200 claim is document identity plus the J2 opened/used-by requirement, not a verdict on the entry.
- I did not verify that staged S290/S291 quotes appear on their live pages (J4/J5's job); I only confirmed both URLs answer HTTP 200 on 2026-10-25 (47694 / 48988 / 53233 bytes).
- I did not re-derive the 9-id quarantine slice, and did not compare campaign transcript bytes with what S271/S280/S295 quote.
- Guard shapes untested: BOM-prefixed file, rows split across lines, ids below S100 (regex needs 3 digits), and `sort` under a non-UTF-8 exotic locale (only C, C.UTF-8, en_US.UTF-8 tested).
- No tool installed or upgraded this seat (bash, grep, coreutils, gawk, python3, curl only); no pacman, no git/jj mutation in the lane or fleet.
