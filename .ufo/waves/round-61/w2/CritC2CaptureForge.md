# CritC2CaptureForge — round 61 w2, C2 subcase 3 falsify (critic)

**Target artifact:** `kumitate-shokunin/.ufo/waves/round-61/w1/CritControlC2.md` counterexample **3**
— "E4 binds pin↔file, not file↔source — invented bytes in `body.md`, own sha pinned → `E4 PASS pin=sha256 15841c50876fe839f sha=15841c50876fe839`".
Task subcase 3: **arbitrary bytes with a matching invented digest**.

**Verdict: reproduced, exactly as w1 claimed — and stronger.** A D61 v1 `E4 PASS` is satisfied
by *any* arbitrary bytes parked in the worktree file whose self-invented sha256 is pinned in a
probe-visible row. The probe never reads the measured rev's capture, never compares against the
real capture or the cited URL, and accepts a full 64-hex invented digest (no partial-hash trick
needed — subcase 8 is orthogonal). **E4 as frozen is incapable of verifying the plan.md E4
semantic** ("its sha256 equals the pin the S195 row carries" of the opened-source capture).

## Reproduction (scratch only)

Scratch: `/tmp/kumitate-r61/CritC2CaptureForge/` (fleet root `fleet/` with `shokunin.conf` +
git clone of lane @ `be4a820`; receipts `receipts/*.txt`; harness `harness.mjs`).
Lane jj/git untouched; no tools installed; no subagent dispatch.

Inventory:

- real capture sha256 (lane worktree): `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`
- invented bytes (deterministic, no fetch ever made):
  `INVENTED BYTES — CritC2CaptureForge subcase-3. No request was ever sent to docs.temporal.io.\n`
- invented sha256: `38f0aebcc43643aa02c4f199f542bb13b6644bd176dceac6fd5feb24f96762ea`
  (shares 0 hex digits with the real capture)

### V1 — invented capture committed + invented digest pinned (w1 a1b replay)

Row `|:S195:| … sha256 38f0aebc… | phantom | shim | mined | 2026-10-25 | 90d | corpus/knowledge/temporal-worker-versioning-pinning.md |`
appended at **line 273**, i.e. after `## Leads (unopened)` (line 246), **outside** `## Registry` (line 10).

```
$ node doctrine61-probe.mjs /tmp/kumitate-r61/CritC2CaptureForge/fleet/kumitate-shokunin a1d7f76 --census-root /tmp/kumitate-r61/CritC2CaptureForge/fleet
DOCTRINE61: DOCTRINE61_HELD held=6/6 checks=6 rev=a1d7f76 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md
 | E4 PASS pin=sha256 38f0aebcc43643aa0 sha=38f0aebcc43643aa
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
exit=0
$ sources-census.sh validate --root /tmp/kumitate-r61/CritC2CaptureForge/fleet kumitate   (W04 warnings elided)
kumitate	ok	/tmp/kumitate-r61/CritC2CaptureForge/fleet/kumitate-shokunin/corpus/SOURCES.md
exit=0
```

### V2 — rev contains no capture at all; worktree-only forgery

The measured rev commits the pin but **not** `body.md`; invented bytes are dropped into the
worktree *after* the commit.

```
$ git ls-tree -r --name-only fc2b226 -- .ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md
(absent)
$ sha256sum .ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md   (worktree, after commit)
38f0aebcc43643aa02c4f199f542bb13b6644bd176dceac6fd5feb24f96762ea  .ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md
$ node doctrine61-probe.mjs /tmp/kumitate-r61/CritC2CaptureForge/fleet/kumitate-shokunin fc2b226 --census-root /tmp/kumitate-r61/CritC2CaptureForge/fleet
DOCTRINE61: DOCTRINE61_HELD held=6/6 checks=6 rev=fc2b226 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md
 | E4 PASS pin=sha256 38f0aebcc43643aa0 sha=38f0aebcc43643aa
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
exit=0
```

`E4 PASS` while the rev has no capture → **E4 measures the worktree, not the measured rev**
(w1 counterexample 5's defect, but isolated on the capture leg).

### V3 — rev captures A, pin + worktree are invented B

The rev commits capture A (`sha 2cdad79741e824e4…`); the row pins invented digest
`38f0aebc…`; the worktree holds B.

```
$ git show 8aa0752:.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md | sha256sum
2cdad79741e824e4ccefaa43103d404ad5cbaf1a8ab66924ad50a329c29777ee  -
$ sha256sum .ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md   (worktree)
38f0aebcc43643aa02c4f199f542bb13b6644bd176dceac6fd5feb24f96762ea  -
$ node doctrine61-probe.mjs /tmp/kumitate-r61/CritC2CaptureForge/fleet/kumitate-shokunin 8aa0752 --census-root /tmp/kumitate-r61/CritC2CaptureForge/fleet
DOCTRINE61: DOCTRINE61_HELD held=6/6 checks=6 rev=8aa0752 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md
 | E4 PASS pin=sha256 38f0aebcc43643aa0 sha=38f0aebcc43643aa
 | E5 PASS exit=0
 | E6 PASS mapped=true readme-map=0 README_MAP: CLEAN files=147 rows=147 covered=147
exit=0
```

The rev's own committed capture contradicts the pin, yet E4 PASS → **the pin does not bind the
rev's capture, let alone a source opening**.

### V4 — sanity (negative control)

Same invented capture, but the pin names a digest that matches nothing:

```
DOCTRINE61: DOCTRINE61_UNMET held=5/6 checks=6 rev=d640a91 rule=D61
 | E4 MISS pin=sha256 84ef05a69a4d9a8c0 sha=38f0aebcc43643aa
exit=1
```

Confirms E4's pass/fail is entirely the worktree-bytes vs pin prefix relation — nothing else.

## Exact probe mechanics (probe source, lines 20–21)

```
20: const cap=join(lane,'.ufo','waves','round-61','build','ScoutSourceWorkerVersioning','body.md');let sha='';try{sha=createHash('sha256').update(readFileSync(cap)).digest('hex')}catch{}
21: const r=spawnSync('git',['-C',lane,'show',`${rev}:corpus/SOURCES.md`],{encoding:'utf8'});const row=(r.stdout||'').split('\n').find(l=>/^\|[[:space:]]*S195[[:space:]]*\|/.test(l))||'';const pin=(row.match(/sha256 [0-9a-f]{64}/)||[])[0]||'';add('E4',!!sha&&pin.includes(sha.slice(0,16)),`pin=${pin.slice(0,24)} sha=${sha.slice(0,16)}`);
```

- capture read via `readFileSync(cap)` — **worktree path**; the rev is never consulted (V2/V3).
- acceptance is `pin.includes(sha.slice(0,16))` — full 64-hex invented pins pass (V1–V3), so
  this defect is independent of partial-hash acceptance (subcase 8).
- `find` needs a probe-visible row to read any pin (V4, and w1 a1 variant 1: no row → `E4 MISS pin= sha=`).

## Impacted axes / independence judgment

- **coverage** (C2 frontier claim): E4's verified semantic is `pin prefix ⊆ sha(worktree bytes)`.
  It cannot distinguish a genuine source opening from arbitrary bytes with a self-invented digest —
  the "capture is the opened-source capture" half of plan.md E4 is unverifiable by the frozen check.
- Does subcase 3 **independently prevent D61 from verifying**?
  - It does **not** by itself make an honest build fail — the honest-vacuity failure (E3/E5
    jointly unsatisfiable; JS POSIX class) is subcases 1/2, not this one.
  - It **does** independently defeat the acceptance direction: under v1, `DOCTRINE61_HELD`
    never certifies authentic capture — E4's pass condition is satisfied by forged bytes, so any
    HELD may be capture-forged. The w1 a5 HELD (no S195 inside `## Registry`) composes this with
    the phantom-row defect (subcase 7); the a0 honest-UNMET composes with the row-regex defect
    (subcase 1).
  - Note the dependency: E4 *alone* cannot reach HELD without a probe-visible row (a matching pin
    must first be found), so subcase 3 requires subcase 1 or 7 as co-defect for a full forgery —
    but in that composition it supplies the *fabricated evidence* leg, and it independently means
    D61's E4 result carries no provenance signal at all.

## Evidence

- `receipts/v1-invented-bytes-invented-digest.txt`, `receipts/v2-no-capture-at-rev.txt`,
  `receipts/v3-rev-capture-mismatch.txt`, `receipts/v4-mismatch-sanity.txt` (all under
  `/tmp/kumitate-r61/CritC2CaptureForge/`), harness `harness.mjs`.
- Lane artifacts quoted (read-only): `probe/doctrine61-probe.mjs` lines 20–21;
  `w1/CritControlC2.md` counterexample 3; `plan.md` lines 60–79 (E4 wording, kill rule, counting command).
- Real capture sha: `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`.
