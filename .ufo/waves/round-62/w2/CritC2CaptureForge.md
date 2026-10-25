# CritC2CaptureForge — round 62 w2, C2 subcase 3 falsify (critic)

**Target artifact:** `kumitate-shokunin/.ufo/waves/round-61/w1/CritControlC2.md` counterexample **3**
— "E4 binds pin↔file, not file↔source — invented bytes in `body.md`, own sha pinned → `E4 PASS pin=sha256 15841c50876fe839f sha=15841c50876fe839`".
Task subcase 3: **arbitrary bytes with a matching invented digest**. (Partial-hash acceptance is listed as a sibling subcase; it is verified here as a control because it is the same two probe lines.)

**Verdict: reproduced, exactly as w1 claimed — and stronger.** A D61 v1 `E4 PASS` is satisfied
by *any* arbitrary bytes parked in the worktree file whose self-invented sha256 is pinned in a
probe-visible row. The probe never reads the measured rev's capture (V4), never compares against
the real capture or the cited URL, and accepts the full 64-hex invented digest (V1); it also
passes a pin whose **full** 64 hex differ from the file's sha as long as the first 16 hex match
(V3). **E4 as frozen is incapable of verifying plan.md E4's semantic** ("its sha256 equals the
pin the S195 row carries" of the opened-source capture, plan.md lines 69–71).

## Reproduction (scratch only)

Scratch: `/tmp/kumitate-r62/CritC2CaptureForge/` (fleet root `fleet/` with `shokunin.conf` +
git clone of lane @ `0cbe0d7`; receipts `receipts/*.txt`; probe copied read-only from the frozen
wave `round-61/probe/doctrine61-probe.mjs` — byte-identical to `round-62/probe/doctrine61-probe.mjs`).
Lane jj/git untouched (all reads only); no tools installed (node/git/coreutils preinstalled); no subagent dispatch.

Key objects:

- real capture sha256 (honest lane, committed at rev `0cbe0d7`): `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`
- invented bytes (deterministic, no fetch ever made):
  `INVENTED BYTES — CritC2CaptureForge round-62 subcase-3. No request was ever sent to docs.temporal.io.\n`
- invented sha256: `ac0a57a63997b0480f3110f94a5d794eb8f28e389889cb5fef89de51b9333761`
  (shares zero leading hex digits with the real capture)

### V0 — honest baseline (control for the counterexample)

Frozen probe at clone HEAD `0cbe0d7` (the **real** capture in worktree, real S195 row at line 147):

```
$ node doctrine61-probe.mjs /tmp/kumitate-r62/CritC2CaptureForge/fleet/kumitate-shokunin 0cbe0d7 --census-root /tmp/kumitate-r62/CritC2CaptureForge/fleet
DOCTRINE61: DOCTRINE61_UNMET held=3/6 checks=6 rev=0cbe0d7 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 MISS row-absent
 | E4 MISS pin= sha=8ef2ee5f5e196d9d
 | E5 PASS exit=0
 | E6 MISS mapped=true readme-map=1 README_MAP: note unpinned:lessons/round-61-verifier-spotcheck.md
probe_exit=1
```

The honest row `| S195 | …` never matches the probe's regex (JS POSIX-class absent — subcase 1),
so E3 reports `row-absent` and E4 finds no pin; the real capture sha is only echoed as `sha=8ef2ee5f5e196d9d`.

### V1 — invented capture committed + invented digest pinned (w1 a1b replay)

Scratch commit `8964cae` changes exactly four files:
- `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` → the invented bytes above;
- `corpus/SOURCES.md` → phantom row appended at **line 277**, i.e. after `## Leads (unopened)` (line 251), **outside** `## Registry` (line 10; section ends before `## Paths` at line 153):
  ```
  |:S195:| Worker Versioning — invented capture, no fetch ever made | docs | A | scope | § Pinned Workflows sha256 ac0a57a63997b0480f3110f94a5d794eb8f28e389889cb5fef89de51b9333761 | phantom | shim | mined | 2026-10-25 | 90d | corpus/knowledge/temporal-worker-versioning-pinning.md |
  ```
  `split('|')` trimmed → `c[9]='mined'`, `c[10]='2026-10-25'`, `c[12]='corpus/knowledge/temporal-worker-versioning-pinning.md'` — exactly the cells E3 reads. The regex `/^\|[[:space:]]*S195[[:space:]]*\|/` matches because `:` is a member of the JS class (no POSIX semantics).
- `corpus/README.md` + `.ufo/pins/readme-map.json` → one map row + pin for `lessons/round-61-verifier-spotcheck.md` so E6 runs CLEAN.

```
$ node doctrine61-probe.mjs /tmp/kumitate-r62/CritC2CaptureForge/fleet/kumitate-shokunin 8964cae --census-root /tmp/kumitate-r62/CritC2CaptureForge/fleet
DOCTRINE61: DOCTRINE61_HELD held=6/6 checks=6 rev=8964cae rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md
 | E4 PASS pin=sha256 ac0a57a63997b0480 sha=ac0a57a63997b048
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=149 rows=149 covered=149
probe_exit=0
$ git show 8964cae:.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md | sha256sum
ac0a57a63997b0480f3110f94a5d794eb8f28e389889cb5fef89de51b9333761  -
$ /home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --root /tmp/kumitate-r62/CritC2CaptureForge/fleet kumitate   (W04 warnings elided)
kumitate	ok	/tmp/kumitate-r62/CritC2CaptureForge/fleet/kumitate-shokunin/corpus/SOURCES.md
census_exit=0
```

`DOCTRINE61_HELD held=6/6` with zero network activity; the "capture" is arbitrary invented bytes
whose own digest is self-pinned. The phantom row is **outside** `## Registry`, yet E3/E4 pass.

### V2 — control: non-matching pin (same bytes) fails

Scratch commit `7b5f9d4`: identical file set, row pin changed to 64 zeros:

```
$ node doctrine61-probe.mjs … kumitate-shokunin 7b5f9d4 --census-root …
DOCTRINE61: DOCTRINE61_UNMET held=5/6 checks=6 rev=7b5f9d4 rule=D61
 | E4 MISS pin=sha256 00000000000000000 sha=ac0a57a63997b048
probe_exit=1
```

Pass/fail is exactly the `pin-prefix ⊆ sha(worktree bytes)` relation — nothing else is consulted.

### V3 — control: partial-hash acceptance (full pin ≠ full sha still PASSES)

Scratch commit `43d4c34`: pin = `ac0a57a63997b048` + 48 zeros (64 hex total; only the first 16 hex match the file's sha):

```
$ node doctrine61-probe.mjs … kumitate-shokunin 43d4c34 --census-root …
DOCTRINE61: DOCTRINE61_HELD held=6/6 checks=6 rev=43d4c34 rule=D61
 | E4 PASS pin=sha256 ac0a57a63997b0480 sha=ac0a57a63997b048
probe_exit=0
```

The full pinned digest differs from the file's sha256; `pin.includes(sha.slice(0,16))` alone decides. (This is sibling subcase 8's defect, verified from the same two probe lines.)

### V4 — E4 measures the worktree, not the measured rev

Same rev `8964cae` (committed body = B, pin = B's sha). Overwrite only the **worktree** body.md with different bytes C (`df4c30df…`):

```
$ node doctrine61-probe.mjs … kumitate-shokunin 8964cae --census-root …
DOCTRINE61: DOCTRINE61_UNMET held=5/6 checks=6 rev=8964cae rule=D61
 | E4 MISS pin=sha256 ac0a57a63997b0480 sha=df4c30df23d2132d
probe_exit=1
$ git checkout -- .ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md && node doctrine61-probe.mjs … 8964cae --census-root …
DOCTRINE61: DOCTRINE61_HELD held=6/6 checks=6 rev=8964cae rule=D61
 | E4 PASS pin=sha256 ac0a57a63997b0480 sha=ac0a57a63997b048
probe_exit=0
```

The measured rev's capture is identical across both runs; only the worktree file changed — E4 flips with it.

## Exact probe mechanics (probe source, lines 20–21)

```
20: const cap=join(lane,'.ufo','waves','round-61','build','ScoutSourceWorkerVersioning','body.md');let sha='';try{sha=createHash('sha256').update(readFileSync(cap)).digest('hex')}catch{}
21: const r=spawnSync('git',['-C',lane,'show',`${rev}:corpus/SOURCES.md`],{encoding:'utf8'});const row=(r.stdout||'').split('\n').find(l=>/^\|[[:space:]]*S195[[:space:]]*\|/.test(l))||'';const pin=(row.match(/sha256 [0-9a-f]{64}/)||[])[0]||'';add('E4',!!sha&&pin.includes(sha.slice(0,16)),`pin=${pin.slice(0,24)} sha=${sha.slice(0,16)}`);
```

- capture read via `readFileSync(cap)` — **worktree path**; the rev is never consulted (V4).
- pin read via `git show ${rev}:corpus/SOURCES.md` — rev; the two are different sources of truth.
- acceptance is `pin.includes(sha.slice(0,16))` — a 64-hex substring test; V1's full invented digest passes, and V3 proves even a full-digest mismatch passes on the 16-hex prefix.
- E3/E4 both rely on `find()` over the whole file with the malformed regex; a row outside `## Registry` is probe-visible (V1) while the honest row is not (V0).

## Impacted axes / independence judgment

- **coverage** (C2 frontier claim): E4's verified semantic is `pin prefix ⊆ sha(worktree bytes)`.
  It cannot distinguish a genuine source opening from arbitrary bytes with a self-invented digest —
  the "opened-source capture" half of plan.md E4 (lines 69–71) is unverifiable by the frozen check.
- Does subcase 3 **independently prevent D61 from verifying**?
  - It does **not** by itself make an honest build fail — the honest-vacuity failure (E3/E5
    jointly unsatisfiable; JS POSIX class) is subcases 1/2, not this one.
  - It **does** independently defeat the acceptance direction: under v1, `DOCTRINE61_HELD`
    never certifies an authentic capture — E4's pass condition is satisfied by forged bytes, so any
    HELD may be capture-forged. It is a genuine independent blocker of D61 **verifying** the plan
    semantic, even though a full HELD additionally needs a probe-visible row (subcase 1 or 7) for
    E3/E4 to find a pin at all; in that composition, subcase 3 supplies the fabricated-evidence leg
    and independently strips provenance from E4's output.
  - The same defect is live in round 62: `round-62/probe/doctrine61-probe.mjs` is byte-identical
    to the frozen round-61 probe (verified by `diff`).

## Smallest safe correction (v2, disclosed)

- E4: read the capture **from the measured rev** (`git show <rev>:.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`), require **full equality** `pin === 'sha256 ' + sha` (64 hex — removes the 16-hex prefix acceptance), and bind the pin to the real opened capture (e.g. keep the capture committed at rev, and demand the row's pin equal the rev capture's sha; a fetch-side audit remains the only true source-of-truth check, out of probe scope).
- Re-record the negative control `ctl-c2-unopened-row.txt` against v2 with a positive control (honest build must read HELD) so E4 is non-vacuous in both directions.

## Evidence

- Receipts (verbatim runs) under `/tmp/kumitate-r62/CritC2CaptureForge/receipts/`:
  `v0-honest-baseline.txt`, `v1-invented-bytes-invented-digest.txt`,
  `v2-nonmatching-pin-control.txt`, `v3-partial-hash-pin-control.txt`,
  `v4-worktree-capture-not-rev.txt`.
- Lane artifacts quoted (read-only): `probe/doctrine61-probe.mjs` lines 20–21 (frozen; identical in
  `round-61/` and `round-62/`); `w1/CritControlC2.md` counterexample 3; `plan.md` lines 69–71
  (E4 wording) and line 79 (kill rule).
- Real capture sha: `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`;
  invented sha: `ac0a57a63997b0480f3110f94a5d794eb8f28e389889cb5fef89de51b9333761` (0 shared hex prefix).
