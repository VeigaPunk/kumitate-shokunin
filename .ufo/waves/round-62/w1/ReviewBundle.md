# ReviewBundle — independent verification of r61 C2 forgery bundle and source repo consistency

Reviewer: `L1Kumitate62.ReviewBundle`. Date: 2026-10-25.
Scope: verify (1) the r61 C2 forgery bundle's existence/format, (2) the source repository (C2 fixture) commit/object/tree consistency, (3) whether the C1 scratch repository still exists. Read-only operations only; no bundle created, modified, or re-packed; no repo mutated. No tool installs were performed.

---

## 1. C1 scratch repository — ABSENT

- The earlier C1 fabrication scratch repository does not exist.
  - Receipts `close/a2-repro-c1-fabrication.txt` and `/tmp/kumitate-r61-a2/c1-repro.txt` both record the C1 fabrication run at scratch path `/tmp/kumitate-r61/CritControlC1/a4-full-fabrication` (fixture commit `ab902da2fa30d051455a5f3563627e2c23c3a74d`, `DISPATCH61_HELD 4/4`).
  - `/tmp/kumitate-r61/` does not exist. `find /tmp /home/vgpnk/Projects/shokunin -maxdepth 3` for `*r61-c1*`, `*a4-full-fabrication*`, `*c1*bundle*`, `*r61-c2*` returned no C1 repo, no C1 bundle, and no a4 scratch directory. The only surviving round-61 fixture is `/tmp/kumitate-r61-a2/` (C2).
- Per assignment: this fact is reported; nothing is synthesized to replace it. No `r61-c1-*` bundle exists anywhere we can find.
- Implication: the C1 fabrication fixture commit (`ab902da2…`) cannot be bundled — its repository was cleaned. If a C1 bundle is expected, it must be regenerated from a re-run of the C1 fabrication control; no such artifact is presently available.

## 2. C2 source repository (fixture) — commit/object/tree consistency

Source path (assigned extraction source): `/tmp/kumitate-r61-a2/fleet/kumitate-shokunin`.

- Repo root: `git -C <D> rev-parse --show-toplevel` → `/tmp/kumitate-r61-a2/fleet/kumitate-shokunin` (matches). Non-bare repo with `.git/`; worktree clean (`git status --porcelain` empty).
- HEAD: `4247d2da937842bd6846874d548b7125b356e14c` — message `A5 forgery`; author/committer `critic <critic@scratch>`; timestamp 1792921459 = 2026-10-25T09:44:19Z. Parent: `be4a820c344d4eb2f94b999c3b5d649e76ab70f1` — this is the exact lane tip cited by the round-60 dead-seat table (`round-60/close/dead-seats-r60.md` line 3: "HEAD=be4a820c344d4eb2f94b999c3b5d649e76ab70f1"), so the fixture is lane history + exactly one forged commit.
- Object graph: `git fsck --full` exit 0; no missing/corrupt objects (only dangling objects, normal). `git rev-list --objects --count HEAD` = 8867 objects reachable; `git rev-list --count HEAD` = 321 commits; full tree = 10467 entries.
- Forged commit diff vs parent (5 files, +77/−2): `corpus/knowledge/temporal-worker-versioning-pinning.md` (+68), `corpus/SOURCES.md` (+2), `corpus/README.md` (+2), `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` (+1), `.ufo/pins/readme-map.json` (±6). This is exactly the E1/E3/E4/E6 surface.
- Fake source-capture preserved: `body.md` blob (`1df9b1b0e18f4c185e0beaa86d655a6169d07404`) content = `fabricated capture: no source was opened`; sha256 = `15841c50876fe839f1a3bc8d31a77a9c3ccbb1f60f9a67a0f2c6e1fe0249f75d`, which equals the sha256 pin carried by the S195 row (E4 passes on a clean checkout).
- Phantom-row falsifier preserved: S195 line exists (under `## Registry`? no — per control receipt, the row is outside `## Registry`; the probe's regex `^\|[[:space:]]*S195…` matches anywhere), cells include `phantom | shim`; status=`mined`, opened=`2026-10-25`, used-by=`corpus/knowledge/temporal-worker-versioning-pinning.md`; 13 cells (`split('|')` indices 9/10/12 → status/opened/used-by).
- Blob ids at HEAD: SOURCES.md `70c5cc768629e32d9b7e646e88ab57cbbc875663`; README.md `e2d025421b33597b60b3a92f812254c8bdf4b8cb`; entry `7b8c36151695e9ae54abc4519816f11796e37760`; readme-map.json `5e236598e15b5b5c10291a924ad3442af922a29f`; body.md `1df9b1b0e18f4c185e0beaa86d655a6169d07404`.
- The fixture also carries the round-61 `base/` probe receipts in-tree (e.g., `doctrine61-base.txt` blob `4ce81af26d5e4009254205ebecbc68b664403ea1`, `census-before.txt` blob `0cd8206b8c548d4a52e030f9ee2ffcceeda2a916`); the probe-log receipts of the forgery run (clean + dirty-worktree) are in the lane at `close/a2-repro-c2-forgery.txt` and `close/a2-repro-c2-forgery-dirty-worktree.txt` (byte-identical to `/tmp/kumitate-r61-a2/{c2-forgery-repro.txt,c2-repro.txt}`).

## 3. Bundle verification — exists, valid, complete, two files observed

Two bundle files exist; both are v2 git bundles, sha1, "complete history" (no prerequisites), `git bundle verify` exit 0.

1. `/tmp/kumitate-r61-c2-full-forgery.bundle`
   - Size 16,524,479 bytes; sha256 `5ba30b64c0578169ef7728fac74469fa103b42f7878f785d0e15db6207768d54`; mtime 2026-10-25T10:17:17-03.
   - 1 ref: `refs/heads/fixture-forgery` → `4247d2da937842bd6846874d548b7125b356e14c` (HEAD of the fixture repo above).
   - `git bundle verify` → "is okay … records a complete history … hash algorithm: sha1"; exit 0. Pack header at offset 85: `PACK` v2; object count 0x22A3 = 8867.
2. Lane copy `.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle`
   - Size 16,488,385 bytes (stable across reads after 10:19:53); sha256 `c5c0154010d5becc752179bee2cbf81c8fb5dc8a8bd7ed8debb2a20ec9f0526b`; final mtime 2026-10-25T10:19:53-03.
   - 6 refs: `HEAD`, `refs/heads/fixture-forgery`, `refs/heads/r61-c2-forgery` → `4247d2da937842bd6846874d548b7125b356e14c`; `refs/heads/master`, `refs/remotes/origin/HEAD`, `refs/remotes/origin/master` → `be4a820c344d4eb2f94b999c3b5d649e76ab70f1` (the forged commit's parent).
   - `git bundle verify` → "is okay … records a complete history … sha1"; exit 0. Pack header at offset 391: `PACK` v2; object count 0x22A3 = 8867.
- Object-count cross-check: both packs contain exactly 8867 objects, matching the fixture's `git rev-list --objects --count HEAD` (8867) — i.e., each bundle's object set equals the full reachable graph of the forged commit, and the forge's commit/tree/blob addresses (Section 2) are the ones inside the verified bundles.
- Discrepancy/observation A — the lane copy was NOT stable during review: first read at 10:19:25 showed size 16,488,336; at 10:19:53 size 16,488,385 (sha256 c5c01540…). It has been stable across 10:19:53 → last read. The artifact appears to have been finalized mid-review (round-62 session), so any downstream pinning must re-verify the final sha256/size above.
- Discrepancy/observation B — the two bundles differ in bytes: ref lists (1 vs 6 refs) and pack size (16,524,479 vs 16,488,385) / sha256 differ, while object set (8867) and tip commit are identical; both independently verify OK. The `/tmp` copy is a superseded/earlier artifact; the lane copy is the canonical one under `round-61/controls/`.

## 4. Audit19 status (former w2 slot) — dead seat, never produced

- Task (w2-plan.json lines 599–601 / w2-dispatch.json lines 594–596): `Round60-DeadTable — Audit .ufo/waves/round-60/close/dead-seats-r60.md against committed progress, stream files and launcher log: count 32/5/27, full errors no truncation, traceback exact.` Report target: `.ufo/waves/round-61/w2/Audit19.md`.
- Outcome (`close/w2-results.json` member): status `failed`, exit 1, error `provider rejected task prompt as invalid_prompt`; agentId `L1Kumitate61.Audit19`; registry `w2/swarm-registry.json` lines 332–334. No `Audit19.md` exists in `w2/` (glob confirms).
- Target artifact exists: `.ufo/waves/round-60/close/dead-seats-r60.md` (R60-V6 repair) — 32 seats, 5 exit=0, 27 exit=-9, .err tails full/untruncated, launcher traceback quoted whole from `w1-launcher.log` lines 65–68; evidence blobs cited in-table (`launcher-progress.tsv` `df92492b…`, `w1-launcher.log` `d014d430…`, `launcher.py.txt` `24fea66d…`, 32 × `.err`/`.stream.jsonl` pairs).
- What it attacks / counter artifact: the round-60 dead-seat table claim (32/5/27 counts and no-truncation/traceback properties), which underpins the round-60 tip receipts (`close/dispatch60-tip.txt`, `dispatch60-work.txt`) that round-61 C1 P2's `dead=0` comparison builds on. Re-queue requirement: same audit, executed against committed blobs at the measured rev (per R61-V2 committed-revision-bytes rule), producing `w2/Audit19.md`; the prompt that previously failed must be re-validated so the seat can run.

## 5. Counter byte-source note (R61-V2 relevance)

Two frozen probes still read worktree bytes rather than `<rev>:` blobs:
- `doctrine61-probe.mjs` E4: capture `body.md` is read via `readFileSync(join(lane, …))` (worktree), while the S195 pin is read from `<rev>:corpus/SOURCES.md`. This is why the dirty-worktree control (`a2-repro-c2-forgery-dirty-worktree.txt`) flips E4 to MISS (worktree lacks body.md), while the clean checkout passes.
- `dispatch61-probe.mjs` P4: `close/dispatch61-tip.txt` is read via `readFileSync(join(lane,…))` (worktree), not from `<rev>:`.
Both are the remaining committed-vs-worktree asymmetries in the round-61 counters; the C2 bundle/commit itself is unaffected (committed bytes).

## 6. Concrete follow-up requirements

1. Record the canonical lane bundle pin: sha256 `c5c0154010d5becc752179bee2cbf81c8fb5dc8a8bd7ed8debb2a20ec9f0526b`, size 16,488,385, fixture rev `4247d2da937842bd6846874d548b7125b356e14c`; re-run `git bundle verify` once all round-62 writers land (artifact was being written during this review).
2. Reconcile the two bundle copies: delete or archive the superseded `/tmp/kumitate-r61-c2-full-forgery.bundle` (or document it as the pre-final artifact); there should be one canonical bundle artifact.
3. Fix counter byte sources: E4 (body.md) and P4 (dispatch61-tip.txt) must read committed revision blobs only (R61-V2).
4. C1: stay documented as absent; do not synthesize. If a C1-fixture bundle is needed, it requires re-running the C1 fabrication control (fixture rev `ab902da2…` is not currently materialized anywhere).
5. Re-queue Audit19 with a provider-valid prompt (previous failure: `invalid_prompt`), targeting committed blobs at the measured rev, report at `w2/Audit19.md`.
6. Final gate: verify bundle stability (size/sha256 unchanged) plus object count 8867 after all sibling executors land.
