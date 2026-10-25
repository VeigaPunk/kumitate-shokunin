VERDICT: The frozen counter reads `JJ64_HELD held=8/8` on a hermetic honest fixture (commit 9a41cbc2, parent = base 6825a51) and every one of J1, J2, J4, J5, J6, J7, J8 can be made to fail alone by a single-fault variant — but two forgeries still read 8/8 (a stub demo script, and the PROVINCE line moved out of the frontier band), and J3 can never fail alone.

## Evidence

Fixture built by `bash .ufo/waves/round-64/build/K64ExecJjHonestFixture/build-fixture.sh` (twice, same rev: reproducible — fixed author/committer dates):

```
FIXTURE_REPO=/tmp/kumitate-r64/K64ExecJjHonestFixture/fixture-root/jj64-honest.xCwMMDYu
FIXTURE_REV=9a41cbc2aa4dce232f15d303fd9abcc5bd726856
FIXTURE_BASE_PARENT=6825a51425e91908f019ed65aa2f4209acbd7087
```

`git -C <clone> show --stat HEAD` — 11 files, entry `corpus/knowledge/jj-workspace-seat-containment.md` (85 lines, sha256
`167715f98e541a43a240a87b2feee4e57b2b166d7b9ee528db385ae3fe1b4947`), `scripts/jj-seat-demo.sh` byte-identical to the
lane's dd1a3e6 copy (sha256 `e8b4b01f2234b4a296747b01335f71b9140608e7f381c2125378399d4a40fd69`), 3 captures, rows S198–S200,
pins, PROVINCE line, README rows + readme-map pins, appended amendment.

Counter at the honest commit (receipt `out/honest.txt`; exit 0):

```
SERVER: serving .../build/K64ExecJjHonestFixture/captures on 127.0.0.1:8642 (S198 sha256 947d0c56c02f9c10b4c14e8aaa8cc3f435f7650536ab9386ef6a52f1d64ff3c7)
JJ64_HELD held=8/8 checks=8 rev=9a41cbc2aa4dce232f15d303fd9abcc5bd726856 rule=J64
counter_exit=0
```

Calibration at the base commit inside the same fixture repo (`out/base-rev-in-fixture.txt`, exit 1) — same misses as the
committed `base/jj64-base.txt`:

```
JJ64_UNMET held=0/8 checks=8 rev=6825a51425e91908f019ed65aa2f4209acbd7087 rule=J64 | J1 MISS entry-absent | J2 MISS no-entry | J3 MISS no-rows | J4 MISS bullets=0 | J5 MISS no-bullets | J6 MISS stated-keys=0;demo-exit=127 | J7 MISS census-exit=0 province-names-entry=false readme-map-clean=false | J8 MISS no-amendment-heading,amendment-lacks-entry-or-M7
```

Fixture gates, read from `git archive 9a41cbc2`: `sources-census.sh validate --file .../corpus/SOURCES.md` → `file ok`, exit
0, rows 139, six W04 warnings (same six as the plan's base census); `node scripts/readme-map.mjs` → `README_MAP: CLEAN
files=155 rows=155 covered=155`, exit 0. Demo, live on this host (`out/demo-live.txt`, exit 0): jj
0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5, 15 `JJ_SEAT:` keys copied verbatim into the entry.

All 17 repository variant commits' parents are the honest commit (the server-side `j5-live-missing` variant reuses the
honest commit unchanged and only swaps the served mirror); each verdict is in `out/frozen-<variant>.txt` (index:
`out/frozen-index.txt`), run through `run-branches.sh` whose wrapper now fails closed if the port answers with bytes other
than the intended root (`SERVER: PORT-BUSY` / `SERVER: FOREIGN-ANSWER`).

| variant (one fault) | frozen | named miss |
|---|---|---|
| stale-demo-value | 7/8 | `J6 MISS workspaces_after_add:stated=3:live=2` |
| missing-demo-key | 7/8 | `J6 MISS seat_dir_after_forget:stated=undefined:live=present` |
| quote-not-in-capture | 6/8 | `J4 MISS S198:quote-not-in-capture(...)` + `J5 MISS S198:quote-not-live(...)` |
| capture-bytes-edited | 6/8 | `J3 MISS S199:hash-or-size` + `J4 MISS S199:quote-not-in-capture(...)` ×2 |
| row-status-queued | 7/8 | `J2 MISS S199:status=queued` |
| wrong-opened-date | 7/8 | `J2 MISS S200:opened=2026-10-24` |
| province-line-removed | 7/8 | `J7 MISS ... province-names-entry=false ...` |
| amendment-rewritten-in-place | 7/8 | `J8 MISS base-bytes-not-a-prefix` |
| j1-verified-at (extra) | 7/8 | `J1 MISS trio source=true verified-at=false recheck=true` |
| j2-used-by (extra) | 7/8 | `J2 MISS S198:used-by-lacks-entry` |
| j3-unbound (extra) | 6/8 | `J3 MISS S200:unbound` + `J4 MISS S200:quote-not-in-capture(...)` ×2 |
| j4-over-25-words (extra) | 7/8 | `J4 MISS S198:over-25-words` |
| j5-live-missing (extra, server-side) | 7/8 | `J5 MISS S198:quote-not-live(You can have multiple working )` |
| j7-census-duplicate-id (extra) | 7/8 | `J7 MISS census-exit=1 ...` |
| j7-readme-row-removed (extra) | 7/8 | `J7 MISS ... readme-map-clean=false` |
| j7-readme-repair-removed (extra) | 7/8 | `J7 MISS ... readme-map-clean=false` |
| demo-script-stubbed (forgery) | **8/8** | — (see finding -2) |
| province-line-misplaced (forgery) | **8/8** | — (see finding -3) |

Proposed counter (`proposed-jj64-probe.mjs`, diff `proposed-jj64-probe.diff`): honest 8/8 (`out/proposed-honest.txt`);
all 18 variants UNMET (`out/proposed-index.txt`), with `demo-script-stubbed` → `J6 MISS demo-script-not-pinned:92b53a4783df`
and `province-line-misplaced` → `J7 MISS census-exit=0 province-names-entry=false readme-map-clean=true`. No legitimate
variant changed verdict.

## Findings

**K64ExecJjHonestFixture-1 (info, reachability).** HELD is reachable: 8/8 at a committed revision whose entry, rows, pins,
PROVINCE line, README map and amendment are all fixture-authored, and 0/8 at its base parent. J1..J8 are all reachable; all
but J3 can be made to fail alone. Reproduce: `bash build-fixture.sh && bash run-with-server.sh
/tmp/kumitate-r64/K64ExecJjHonestFixture/fixture-root/jj64-honest.xCwMMDYu 9a41cbc2aa4dce232f15d303fd9abcc5bd726856`.

**K64ExecJjHonestFixture-2 (high, counter hole — J6).** J6 runs the *measured revision's own* `scripts/jj-seat-demo.sh`,
so a stub that echoes the entry's 15 stated outcomes and exits 0 reads `JJ64_HELD held=8/8` (branch `var-demo-script-stubbed`,
commit `728dabaa`): the counter cannot tell a measured demo from a printed transcript, contradicting its own header ("a
stale or invented outcome is a MISS"). Proposed ratchet (strengthening, in `proposed-jj64-probe.diff`): pin the claim's
demo bytes at the freeze and MISS on any other script —

```js
const DEMO = 'scripts/jj-seat-demo.sh';
const DEMO_SHA = process.env.JJ64_DEMO_SHA || 'e8b4b01f2234b4a296747b01335f71b9140608e7f381c2125378399d4a40fd69'; // dd1a3e6
// in J6:
const demoBytes = rd(DEMO);
if (!demoBytes) bad.push('demo-script-absent');
else { const sha = createHash('sha256').update(demoBytes).digest('hex');
       if (sha !== DEMO_SHA) bad.push(`demo-script-not-pinned:${sha.slice(0, 12)}`); }
```

Reproduce: `bash run-with-server.sh <clone> 728dabaa638854e825cc93ac4efe247fe896e7ee` (8/8) vs
`PROBE=$PWD/proposed-jj64-probe.mjs bash run-with-server.sh <clone> 728dabaa...` (`J6 MISS demo-script-not-pinned`).
Independently reproduced at the frozen counter by seat K64MutateProbes on its own clone of `9a41cbc2` (peer commit
`d346c87a3eab42168e9ebcdf7404b10fa8627da0`, `JJ64_HELD held=8/8`; peer-reported, not re-run by me).

**K64ExecJjHonestFixture-3 (medium, counter hole — J7 province arm).** J7 accepts any *line anywhere in PROVINCE.md* that
contains the entry path and matches `/frontier|band|ground|first entry/i`; the same line moved into `### Adjacent` still
reads `JJ64_HELD held=8/8` (branch `var-province-line-misplaced`, commit `6bc0f7c5`). Proposed ratchet: scan only inside a
heading whose text names the frontier —

```js
const named = prov ? (() => { let inFrontier = false;
  for (const l of prov.toString('utf8').split('\n')) {
    if (/^#{1,6}\s/.test(l)) { inFrontier = /frontier/i.test(l); continue; }
    if (inFrontier && l.includes(ENTRY)) return true; }
  return false; })() : false;
```

Reproduce: `bash run-with-server.sh <clone> 6bc0f7c55a266ab13cfbd1c2a6e43d7e285f3813` (8/8) vs the proposed counter
(`J7 MISS ... province-names-entry=false`). Independently reproduced at the frozen counter by seat K64MutateProbes (peer
commit `54f57ecc29f554cda106be5a76f3fbf5af328d72`, `JJ64_HELD held=8/8`; peer-reported, not re-run by me).

**K64ExecJjHonestFixture-4 (info, coupling — J3 cannot fail alone).** J3 fills `capText` only when sha256 *and* size match
and J4 reads `capText`, so every J3 failure on a cited row also fails J4 for that row (both J3 variants read 6/8, never
7/8). Not a defect (J4 is a strict superset of J3's failure surface), but "each check can fail alone" is false for J3.

**K64ExecJjHonestFixture-5 (info, landing requirement — J7/readme-map at base).** The base tree carries the round's known
`readme-map` DRIFT (`uncovered:lessons/round-63-verifier-spotcheck.md`, `base/readme-map-before.txt`); the honest entry
without that maintenance repair reads 7/8 (`J7 MISS ... readme-map-clean=false`, branch `var-j7-readme-repair-removed`,
commit `1541753d`). The landing must ship that README row **and** its `.ufo/pins/readme-map.json` pin with the new entry,
or J7 stays red for a reason unrelated to C2.

**K64ExecJjHonestFixture-6 (info, declared hole reproduced — J5).** This 8/8 rests on row URLs at
`http://127.0.0.1:8642/S{198,199,200}.html`: the counter accepts an author-controlled mirror as "live", so the carried hole
is how the fixture passes. A real landing must use the real `docs.jj-vcs.dev` URLs (the captures are those pages' real
bytes, so J4/J5 would hold against the live site if unchanged).

**K64ExecJjHonestFixture-7 (low, method).** One early `j5-live-missing` run read 8/8 because a stale
`python3 -m http.server 8642` answered for the doctored root — a J5 run measures whatever answers the URL. The stale
process I inspected served my `captures/` dir, but seat K64MutateProbes also ran a mirror on 8642 in the same window
(peer report), so ownership at the answering moment is not provable from my receipt; the failure mode is the same either
way. The harness now fails closed (`SERVER: PORT-BUSY` exit 4 / `SERVER: FOREIGN-ANSWER` exit 3), and every receipt
carries the `SERVER: serving ... (S198 sha256 ...)` line naming the bytes J5 fetched.

## Artifacts

- `.ufo/waves/round-64/build/K64ExecJjHonestFixture/` — `build-fixture.sh` (deterministic build, rev `9a41cbc2`, parent `6825a51`), `fixture-tree/` (the committed delta), `captures/` + `variants/` (honest mirror, 18 single-fault deltas), `make-variants.mjs`, `doctor-captures.mjs`, `run-with-server.sh` (fails closed on a foreign mirror), `run-variants.sh`, `run-branches.sh`, `run-proposed.sh`.
- `.../out/` — `honest.txt`, `base-rev-in-fixture.txt`, `frozen-index.txt` + `frozen-<variant>.txt`, `proposed-index.txt`, `proposed-honest.txt`, `demo-live.txt`.
- `.../proposed-jj64-probe.mjs` + `proposed-jj64-probe.diff` — the two ratchets as a full-file draft and a unified diff (L1 integrates; frozen counter untouched).
- Clone in scratch: `/tmp/kumitate-r64/K64ExecJjHonestFixture/fixture-root/jj64-honest.xCwMMDYu`. No tool installed or upgraded; no pacman, no network install.

## Limits

- The entry is a fixture: the three captures are the real `docs.jj-vcs.dev` pages (working-copy, operation-log, cli-reference) fetched 2026-10-25, but J5 is served from a local mirror, and the entry itself says so — it is not a claim about the live site.
- Not attacked: J4's normalization (a quote may span unrelated markup once tags are stripped), J2's 13-cell arithmetic against other row shapes, J1's `recheck` content, J6 with a demo that exits non-zero, J8 with an amendment placed before the base bytes.
- Only jj 0.45.1 on this host; no cross-version check of the demo values.
- I did not run the C1 counter, the receipt controls, or any lane gate other than census-validate and readme-map (both read-only, inside the fixture archive).
- Peer-reported, not re-run by me: seat K64MutateProbes ran a 39-mutant sweep at rev `9a41cbc2` and reported baseline `JJ64_HELD held=8/8` with verdicts identical to its own sweep at the earlier `f1ef90fc` fixture.
- The proposed counter is a draft in my build dir; the frozen `probe/jj64-probe.mjs`, `base/`, `controls/` and the lane tree are unmodified (`git status` in the lane shows only pre-existing untracked `.ufo/waves/round-64/{build,build-tools,w1*,w1/}` paths).
