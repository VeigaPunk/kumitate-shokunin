# C2 Bundle — w1 evidence report

Seat: `L1Kumitate62.C2Bundle` (fleet executor, round-62 attempt 1).
Date: 2026-10-25. Lane root: `/home/vgpnk/Projects/shokunin/kumitate-shokunin`.
Scope: R61-V4 fixture conversion (C2 only). No verdict on any round-62 claim; evidence findings only.
No tools installed (git 2.56.0 preinstalled; no pacman/uv/npm actions). No commits made. No git operation outside the explicit fixture `-C` except read-only `git bundle verify/list-heads` and the prescribed temp verification repo (`D=$(mktemp -d) && git -C "$D" init -q`, all later calls `-C "$D"`).

## 1. Fixture root verification (`/tmp/kumitate-r61-a2/fleet/kumitate-shokunin`)

- `git -C <fixture> rev-parse --show-toplevel` → `/tmp/kumitate-r61-a2/fleet/kumitate-shokunin` (root confirmed; repo initialized, not bare).
- HEAD = `4247d2da937842bd6846874d548b7125b356e14c` — commit message `A5 forgery`, author/committer `critic <critic@scratch>`, dates `Sun Oct 25 06:44:19 2026 -0300`.
- Refs present: `refs/heads/master` → `be4a820c344d4eb2f94b999c3b5d649e76ab70f1`; `refs/remotes/origin/master` and `refs/remotes/origin/HEAD` → same `be4a820c…`; `refs/heads/r61-c2-forgery` and `refs/heads/fixture-forgery` → `4247d2da937842bd6846874d548b7125b356e14c`.
- Forged commit tree: `c167e8bb80b4d81c8550d3652d97a06536e952c9`.
- Diffstat of `4247d2d` vs parent `be4a820c…`: 5 files, +77/−2 — `.ufo/pins/readme-map.json` (±6), `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` (+1), `corpus/README.md` (+2), `corpus/SOURCES.md` (+2), `corpus/knowledge/temporal-worker-versioning-pinning.md` (+68).
- Fixture worktree is clean (`git status --short` empty).

## 2. Forged commit contents (fake source-capture + phantom-row falsifier preserved)

- Fake capture at rev: `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` = 41 bytes, verbatim `fabricated capture: no source was opened` + newline.
- Phantom S195 row in `corpus/SOURCES.md` at rev, line 273 — i.e. inside `## Leads (unopened)` (opens line 246), **outside** `## Registry` (line 10–149). Verbatim row:
  `|:S195:| Worker Versioning — https://docs.temporal.io/worker-versioning.md | docs | A | scope | § Pinned Workflows sha256 15841c50876fe839f1a3bc8d31a77a9c3ccbb1f60f9a67a0f2c6e1fe0249f75d | phantom | shim | mined | 2026-10-25 | 90d | corpus/knowledge/temporal-worker-versioning-pinning.md |`
  - Probe `doctrine61-probe.mjs` splits on `'|'` and reads `c[9]`=status (`mined`), `c[10]`=opened (`2026-10-25`), `c[12]`=used-by (entry path). The committed code uses indices **9/10/12** (the brief's "8/9/11" does not match the frozen probe; code governs).
  - E3's `find()` scans every line of committed `SOURCES.md` with no `## Registry` scoping; the lookalike outside Registry therefore satisfies E3 (confirmed by control receipt `ctl-c2-critic-a5-full-forgery-held.txt`: held=6/6).
  - E3/E4 row regex `^\|[[:space:]]*S195[[:space:]]*\|`: in JS `[[:space:]]` is a literal character set (not a POSIX class), so `|:S195:|` matches (`:` is in the set). Permissive, but the forgery passes regardless of section.
- README map row at rev, `corpus/README.md` line 182: `| `knowledge/temporal-worker-versioning-pinning.md` | Temporal Worker Versioning pinning | S195 |`.
- Entry header trio at rev (`corpus/knowledge/temporal-worker-versioning-pinning.md`): `source: S195 — https://docs.temporal.io/worker-versioning.md …`, `verified-at: 2026-10-25`, `recheck: 90d — …`.

## 3. Relevant receipts/output for this fixture

- `close/a2-repro-c2-forgery.txt` — clean checkout of the forged commit, `node doctrine61-probe.mjs <fixture> 4247d2d --census-root /tmp/kumitate-r61-a2/fleet` → `DOCTRINE61_HELD held=6/6 checks=6 rev=4247d2d rule=D61`, E1–E6 all PASS, exit 0.
- `close/a2-repro-c2-forgery-dirty-worktree.txt` — same rev against the CritControlC2 worktree lacking body.md → `DOCTRINE61_UNMET held=4/6`; E4 MISS (`pin=sha256 15841c50876fe839f sha=`) and E6 MISS (`readme-map=1`, unpinned lesson). Evidence that the D61 counter mixes committed-rev bytes (E1/E2/E3/E6-mapped via `git show <rev>:…`) with worktree/cwd execution: E4 reads the capture via `readFileSync(join(lane,'.ufo',…))`; E5 runs `sources-census.sh` (default root = lane when `--census-root` omitted); E6 runs worktree `scripts/readme-map.mjs` with `cwd=lane`.
- `controls/ctl-c2-critic-a5-full-forgery-held.txt` — full forgery held (6/6) although the S195 row sits outside `## Registry`; real capture sha256 recorded there is `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc` (fetch-based), versus the fabricated pin `15841c50876fe839…`.
- Round-62 forged control baseline `controls/forged-control-counter-before.txt` — counters re-run at full rev `4247d2da937842bd6846874d548b7125b356e14c` → still `DOCTRINE61_HELD held=6/6` (forgery defeats the frozen counter under both short and full rev spellings).

## 4. Bundle creation and verification

- Command: `git -C <fixture> bundle create <dest> --all` (all refs + HEAD; complete history; sha1).
- Destination: `kumitate-shokunin/.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle`.
- Result: **size 16,488,385 bytes; sha256 `c5c0154010d5becc752179bee2cbf81c8fb5dc8a8bd7ed8debb2a20ec9f0526b`**.
- `git bundle verify` → `is okay`; 6 refs: `fixture-forgery`→`4247d2da…`, `master`→`be4a820c…`, `r61-c2-forgery`→`4247d2da…`, `origin/HEAD`→`be4a820c…`, `origin/master`→`be4a820c…`, `HEAD`→`4247d2da…`; `records a complete history`; hash algorithm sha1.
- Fetch round-trip verification: fresh `V=$(mktemp -d); git -C "$V" init -q; git -C "$V" fetch <bundle> 'refs/heads/*:refs/heads/*'` → all three branches fetched; fetched `rev-parse 4247d2d` = `4247d2da937842bd6846874d548b7125b356e14c` and tree = `c167e8bb80b4d81c8550d3652d97a06536e952c9` — identical to fixture; key paths (body.md, temporal-worker-versioning-pinning.md) present at the fetched rev; `git -C "$V" fsck --full` clean.
- Prior artifact state: before this run the destination already held a valid single-ref bundle (`refs/heads/r61-c2-forgery` → `4247d2da…`, complete history), size 16,488,336 bytes, sha256 `d1bc3bc6e15cb9e6042cb0d76a6f63a154c08aadc6b1874c114fa063f738c1b4`. It was replaced by the all-refs bundle above (same forged commit, same reachable history; wider ref advertisement).

## 5. C1 status

- The earlier C1 fabrication repository is **ABSENT**: `/tmp/kumitate-r61/CritControlC1` and its `a4-full-fabrication` scratch path (named in `close/a2-repro-c1-fabrication.txt`) do not exist. Per instruction it was **not synthesized**; no C1 fixture created, touched, or inferred. Only the provided C2 fixture was used.

## 6. Concrete follow-up requirements

1. Any claim/counter evidence that cites the fixture rev `4247d2da937842bd6846874d548b7125b356e14c` should reference the verified bundle (sha256 `c5c0154010d5becc752179bee2cbf81c8fb5dc8a8bd7ed8debb2a20ec9f0526b`) so reviewers can reproduce the forged tree without the scratch fixture.
2. If a single-ref artifact is preferred, note the replaced variant's hash (`d1bc3bc6…`) is no longer on disk; regenerate via `git -C <fixture> bundle create <path> r61-c2-forgery` (deterministic per ref set, though not byte-identical to the older artifact due to pack/tool-generation differences).
3. Counter-surface facts to carry forward (no verdict): D61 E4/E5/E6 are not fully revision-pinned (E4 reads the worktree capture file; E5 executes the census script; E6 executes worktree `readme-map`), and E3 does not scope rows to `## Registry` — a syntactically lookalike S195 row outside Registry passes E3 (receipt a5-full-forgery-held).
4. Preserve the exact phantom-row text (section 2) when sharing evidence; it is the falsifier payload and must match the counter's `split('|')` cell indices (9/10/12).
