# Attack C1/C2 — round-61 probes and committed forgery controls (falsifiable findings)

Lane: kumitate, round 62 attempt 1. Scope: the round-61 declared targets/surfaces only.
No verdict on either round-62 claim; evidence findings only. All paths are relative to the
lane root `/home/vgpnk/Projects/shokunin/kumitate-shokunin` unless absolute. Lane HEAD at
inspection: `0cbe0d75e5a08718e2256408329692908c837766`. No tool installs were needed for
this run.

---

## 1. C1 — `dispatch61-probe.mjs` revision-byte rule and activity-evidence forgeability

### 1.1 Probe source (frozen counter)
`.ufo/waves/round-61/probe/dispatch61-probe.mjs`:

- P1: `spawnSync('node', [lane/scripts/dispatch-evidence.mjs, --selftest])` — hermetic (writes only into `TMPDIR` scratch; `counters.sh` points `TMPDIR` at a probe scratch that is removed on exit).
- P2: the gate `node scripts/dispatch-evidence.mjs --root <lane> --round 61 --wave w1` is spawned **against the working tree** of `lane`; the measured `rev` is used only for `git ls-tree -r --name-only <rev>` **name presence** of `launcher-progress.tsv`, `dispatch-actual.json`, and ≥32 `.md` names under `.ufo/waves/round-61/w1/`. The gate's `CLEAN` verdict therefore reflects worktree bytes, not the rev's bytes; the rev check counts file names, never contents (zero-byte committed reports count as reports).
- P3: `git show <rev>:SCORECARD.md` — rev-pinned; row found by `l.includes('dispatch-evidence')&&l.includes('|')` + `/round 61/` (un-anchored line search, not a section-aware table parse).
- P4: `readFileSync(lane/.ufo/waves/round-61/close/dispatch61-tip.txt)` — **worktree read, not rev-pinned**.

### 1.2 Committed controls (evidence)
- `controls/ctl-c1-critic-a5-commit-worktree-split.txt` — committed at `ced3ece3` holds 32 **zero-byte** reports and no tip receipt; worktree after commit holds 32 one-line reports + untracked `close/dispatch61-tip.txt`. Probe prints `DISPATCH61_HELD held=4/4` (P2 PASS, P4 PASS). **Proof that P2/P4 satisfy the predicate from worktree bytes while the measured rev holds no working evidence.**
- `controls/ctl-c1-critic-a4-full-fabrication.txt` — do-nothing scratch repo (`ab902da2`): hand-written `launcher-progress.tsv` with fabricated sessions, hand-written `dispatch-actual.json`, 32 one-line fabricated seat reports, a SCORECARD row naming round 61, and `close/dispatch61-tip.txt` carrying the CLEAN line. Probe prints `DISPATCH61_HELD held=4/4 exit=0`. "NO seat ever ran; NO real dispatch record exists." Repro receipt: `close/a2-repro-c1-fabrication.txt`.
- `controls/ctl-c1-critic-a1b-nonempty-fabrication.txt` — fabricated registry + 32 **non-empty** fabricated reports → `CLEAN (seats=32 sessions=32 exit0=32 reports=32 dead=0)` exit 0. (The empty-report variant A1 does fail closed, so non-emptiness is the only content bar, and it is fully author-satisfiable.)
- `controls/ctl-c1-critic-a2c-one-id-bypass.txt` — 32 members, agentId null on 31, one non-null → `CLEAN` exit 0; the `NOT_A_DISPATCH` guard is a token-membership check, not provenance.
- `controls/ctl-c1-critic-live-gate.txt` — at live lane w1 pre-progress the gate fails closed (`progress-absent`, exit 2). The receipt's note is decisive: **the harness dispatch record is `.ufo/waves/round-61/w1/swarm-registry.json` (ufo-swarm-registry-v1); neither `launcher-progress.tsv` nor `dispatch-actual.json` is emitted by the harness.** They are produced later by `scripts/make-dispatch-actual.mjs` (commit `019a844` "make-dispatch-actual tool"; `dispatch-actual.json` `generatedAt: 2026-10-25T11:02:15.281Z`).

### 1.3 No-seat fabrication control and stream/history discrimination
Fabrication recipe that satisfies P2: write 32 progress rows with any `session=` (not `null`) and `exit=0`, 32 non-empty `<Seat>.md` files, a `dispatch-actual.json` whose `planned/sessionIds/exit0/reports=32`, `dead=[]`, and members with ≥1 non-null agentId. The gate consults **only** these three author-writable files. It never reads the harness registry (`swarm-registry.json`), any launcher log, per-seat stream files, or external history.

- Round-61 w1 contains no `.stream.jsonl`, no `.err`, no launcher log — there is no in-repo stream/history artifact to cross-check against.
- Real round-60 launcher records (see §3) carry `pid/start/end` and per-seat streams; round-61's authored `launcher-progress.tsv` carries `pid=- start=- end=-` for every seat (verified: all 32 rows). The session ids are naming-convention strings (`L1Kumitate61.<Seat>`) that an author can mint freely.
- Conclusion: within the counter's own inputs, a fabricated no-seat dispatch is indistinguishable from a real one; only out-of-band evidence (e.g., harness dispatch-time registry/timestamps, or external agent transcripts) could discriminate, and the counter does not use any of it. The round-61 record is also consistently "authored" (no process metadata), unlike the round-60 launcher record.

---

## 2. C2 — `doctrine61-probe.mjs` row parsing/schema, census root, and revision-vs-worktree reads

### 2.1 Probe source
`.ufo/waves/round-61/probe/doctrine61-probe.mjs`:

- E3: `git show <rev>:corpus/SOURCES.md` (rev-pinned bytes), then:
  `split('\n').find(l => /^\|[[:space:]]*S195[[:space:]]*\|/.test(l))` — a **whole-file line scan, not scoped to the `## Registry` section** — then `row.split('|').map(x=>x.trim())` and requires `c[9]==='mined' && c[10]==='2026-10-25' && c[12]==='corpus/knowledge/temporal-worker-versioning-pinning.md'`.
- E4: pin is parsed from the same (whole-file) row via `/sha256 [0-9a-f]{64}/`; capture bytes are read **from the worktree** (`join(lane,'.ufo',...,'body.md')`), compared by **first 16 hex chars** (64 bits) of sha256.
- E5: spawns `sources-census.sh validate --root <censusRoot||lane> kumitate`; the census reads **disk** under that root (never the measured rev tree). Default root is `lane`; the plan counting command passes `--census-root $FLEET`.
- E6: `git show <rev>:corpus/README.md` for the map-row string (rev-pinned), plus `node scripts/readme-map.mjs` executed **from the worktree**.

### 2.2 The `[[:space:]]` attack (proven)
In JavaScript, `[[:space:]]` is not a POSIX class: it is a character class whose members are `[`, `:`, `s`, `p`, `a`, `c`, `e` (space is NOT a member). Verified by execution:
- `/^\|[[:space:]]*S195[[:space:]]*\|/` on honest `| S195 | mined` → **false** (space after `|` is not in the class, so `S195` must immediately follow the pipe and does not).
- same regex on `|:S195:| mined` → **true** (the colon after the pipe is in the class).

So the honest row form `| S195 | …` can never match E3's finder, while a lookalike `|:S195:| …` matches trivially.

### 2.3 Schema/column contradiction (contract vs probe)
The real committed S195 row (SOURCES.md line 147; worktree = HEAD) splits into 13 fields (11 data cells):
`['', 'S195', desc, 'docs', 'A', scope, capture/locator, quote, 'mined', '2026-10-25', '90d', 'corpus/knowledge/temporal-worker-versioning-pinning.md', '']`
— status/opened/used-by live at split indices **8/9/11**. The probe requires them at **9/10/12**. Even if the regex matched, the honest row fails E3 on column indices. The census (`sources-census.sh`) requires NF=13 under `## Registry` (`a3` variant 1, `E01 S195 fields=12` for a 12-field malformed row; `a0` note "census requires NF=13 (11 cells) in ## Registry"). Net effect: **E3 and E5 are jointly unsatisfiable for any honest Registry row** (control `a0` states exactly this).

### 2.4 Controls: honest fails, forged passes
- `controls/ctl-c2-critic-a0-honest-row-vacuity.txt` — fully honest build (contract-shaped 11-cell row, real capture sha pinned, re-grounded entry, README row + pin) → `DOCTRINE61_UNMET held=4/6`: E3 MISS row-absent, E4 MISS pin= (regex/column bugs).
- `controls/ctl-c2-critic-a5-full-forgery-held.txt` — header-only rewrite of the package entry (E2 passes on the rewritten header; no fetch/quote), fabricated `body.md` (41 bytes, sha256 `15841c50876fe839f1a3bc8d31a77a9c3ccbb1f60f9a67a0f2c6e1fe0249f75d`), probe-shaped phantom row `|:S195:| …` **outside `## Registry`**, README row → `DOCTRINE61_HELD held=6/6` (E3/E4/E5/E6 PASS). Repro receipt: `close/a2-repro-c2-forgery.txt` (clean checkout of `4247d2d`); the same run in dirty-worktree form (`a2-repro-c2-forgery-dirty-worktree.txt`) shows E4/E6 flip on worktree state (capture/readme-map absent → MISS), proving E4/E6 read the worktree, not the rev.
- `controls/ctl-c2-critic-a1b-fabricated-capture.txt` — capture filled with invented bytes and self-pinned in the row → `DOCTRINE61_HELD held=6/6`: E4 passes on a fabricated capture (no fetch; 64-bit prefix compare accepts any self-consistent bytes).
- `controls/ctl-c2-critic-a2-verbatim-package.txt` — variant 2 (header-only `S217→S195`, `2026-10-23→2026-10-25` rewrite, no refetch) → E2 PASS; E3/E4 MISS only because of the row finder. E2 alone cannot detect a rewrite of the provenance header.

### 2.5 Lookalike-outside-`## Registry` discrimination (needed control result)
`controls/ctl-c2-critic-a3-malformed-row-census.txt`:
- variant 4: probe-shaped `|:S195:|` row (12 cells) **inside** Registry → census `E01 :S195: fields=12` + `E02 :S195:` (exit 1);
- variant 5: the same malformed row placed **outside** `## Registry` (after `## Leads`) → census `ok` (exit 0).
The census discriminates by section; the probe's E3 finder does **not** — it finds the lookalike anywhere in the file (as in `a5`, phantom row under `## Leads (unopened)`). This is the exact "distinguish row-under-`## Registry` from a syntactically lookalike outside it" test: **the probe fails it; the census passes it.**

### 2.6 Default vs explicit census root
`controls/ctl-c2-critic-a6-default-census-root.txt`: without `--census-root`, E5's census runs with `--root <lane>` → `shokunin.conf` not found at the lane root, `unknown lane`, exit 2 → E5 MISS. The plan.md counting command and `counters.sh` counter 4 pass `--census-root $FLEET` (`/home/vgpnk/Projects/shokunin`), which resolves to the same `corpus/SOURCES.md` in the real layout but is a different file in scratch/fleet-vs-lane setups. The probe's default therefore lays E5 on a path that never validates what the claim names.

### 2.7 E5/E4/E6 revision bytes vs dirty worktree
- `controls/ctl-c2-critic-a4-e5-worktree-not-rev.txt`: commit `ad78e87` holds a malformed (escaped-pipe) registry; committed-tree census fails (`E01 S195 fields=12`), but the probe's E5 validates the **clean worktree** → PASS. So "E5 exits 0 at the measured revision" is only meaningful if worktree ≡ rev tree; the counter does not enforce or detect that.
- E4 reads capture bytes from the worktree (see §2.4 dirty-worktree repro); E6's `readme-map` leg runs from the worktree. Only E1/E2/E3 (and E6's map-string half) read rev-pinned bytes.

---

## 3. Audit19 re-queue

### 3.1 Former w2 slot/artifacts
- Slot: `.ufo/waves/round-61/w2-spec.json` entry `Audit19` (role reviewer, axes operability/coverage). Task text (verbatim from spec/plan):
  `Round60-DeadTable — Audit .ufo/waves/round-60/close/dead-seats-r60.md against committed progress, stream files and launcher log: count 32/5/27, full errors no truncation, traceback exact.`
- Result: `close/w2-results.json` → `Audit19`: status **failed**, exit **1**, error **"provider rejected task prompt as invalid_prompt"** — the seat died at dispatch; it never ran. Consequences recorded in the wave evidence: `w2/launcher-progress.tsv` row 35 `Audit19 session=L1Kumitate61.Audit19 exit=1 pid=- start=- end=-`; `w2/dispatch-actual.json` carries Audit19 in its dead list; `w2/swarm-registry.json` member `agentId=L1Kumitate61.Audit19`. There is **no** `w2/Audit19.md` (w2 holds Audit01–18, Audit20–24).

### 3.2 What it was supposed to attack, and which artifacts to use
- Intended target: the round-60 R60-V6 dead-seat table `.ufo/waves/round-60/close/dead-seats-r60.md` — i.e., the claims that round-60 w1 had 32 seats, 5 exit=0, 27 exit=-9 (launcher-timeout kills), that .err tails are full/never-truncated, that stream retry/error facts are exact, and that the launcher crash traceback is quoted whole with no `DONE` line after it.
- Claim/counter artifact to use: the table's declared input set — committed blobs at `be4a820c344d4eb2f94b999c3b5d649e76ab70f1`: `.ufo/waves/round-60/w1/launcher-progress.tsv`, `.ufo/waves/round-60/w1-launcher.log`, `.ufo/waves/round-60/launcher.py.txt`, and the 32 `<Seat>.err` + 32 `<Seat>.stream.jsonl` pairs under `.ufo/waves/round-60/w1/`. The correct counter to run is this blob audit (no frozen counter covers the table; the round-61 C1/C2 probes do not read round-60 w1). Do not recontact/revive `L1Kumitate61.Audit19`.

### 3.3 Re-queued execution — results (committed-blob evidence)
- Counts: progress has exactly **32** rows; `exit=0` ×**5**, `exit=-9` ×**27**; session non-null correlates exactly with exit=0 (5/5) and session=null with exit=-9 (27/27). Launcher log: **32 `spawn` lines, 32 `settled` lines, 0 `DONE` lines**, traceback at end (matches table quote byte-for-byte: `File ".../launcher.py.txt", line 95`, `ValueError: dictionary update sequence element #6 has length 1; 2 is required`).
- `resume_hint`: exactly 1 event per exit=0 seat (ExecRows, ExecGates, ExecCensus, RevS190Quote, RevS133Quote); 0 for sampled dead seats (ExecDispatch60, ExecCapture, CritBaseNotZero, SentinelBounds, RevS126Quote).
- `.err` blob sizes match the table's `.err bytes` column for sampled seats (ExecDispatch60 104360, ExecDoctrine60 336, ExecDispatchGate 3247, ExecProxy 294225, ExecCapture 0, RevS194Quote 49882, RevS126Quote 7579, SentinelBounds 25317); tails match the table verbatim (`BASE_EXIT=1`, `EXIT=0`, empty, `Sat Oct 24 11:25:52 PM -03 2026`).
- `launcher.py.txt` line claims verified: `SEAT_TIMEOUT = 420` (line 16), `proc.kill()` (65–66), `err_txt = err.read_text(...)[:400].replace("\n", " | ")` (line 79, leaves tabs → the crash cause), row writer (line 81), crash split (line 95).
- New observation (follow-up): `RevS126Quote.md` (6826 B) is committed in round-60 w1 **for a dead seat** (exit=-9, session=null, resume_hint=0); the tree holds 6 `.md` reports while only 5 seats exited 0. The R60-V6 table does not inventory report files, so its own claims stand, but under dispatch-evidence semantics this is a `DEAD_SEAT_UNCREDITED`-class anomaly worth accounting for.

---

## 4. Bundle verification (C2 fixture)

- Bundle: `.ufo/waves/round-61/controls/r61-c2-full-forgery.bundle` (untracked at lane HEAD; mtime 2026-10-25T10:19:53-03:00).
- Facts: size **16,488,385 bytes**; sha256 **`c5c0154010d5becc752179bee2cbf81c8fb5dc8a8bd7ed8debb2a20ec9f0526b`**.
- `git bundle verify`: "is okay", records a complete history, hash algorithm sha1; 6 refs: `HEAD`, `refs/heads/fixture-forgery`, `refs/heads/r61-c2-forgery` → **`4247d2da937842bd6846874d548b7125b356e14c`**; `refs/heads/master`, `refs/remotes/origin/HEAD`, `refs/remotes/origin/master` → `be4a820c344d4eb2f94b999c3b5d649e76ab70f1`.
- Fixture rev = `4247d2da937842bd6846874d548b7125b356e14c` ("A5 forgery") — byte-identical commit to the HEAD of `/tmp/kumitate-r61-a2/fleet/kumitate-shokunin` (repo root verified via `git rev-parse --show-toplevel`; worktree clean; parent `be4a820`). Cloning the bundle into a fresh scratch reproduces the same HEAD/tree.
- Committed contents at fixture rev (verified via `git ls-tree`/`git show`):
  - `corpus/SOURCES.md` line 273: phantom row `|:S195:| Worker Versioning — https://docs.temporal.io/worker-versioning.md | docs | A | scope | § Pinned Workflows sha256 15841c50876fe839f1a3bc8d31a77a9c3ccbb1f60f9a67a0f2c6e1fe0249f75d | phantom | shim | mined | 2026-10-25 | 90d | corpus/knowledge/temporal-worker-versioning-pinning.md |` — placed under `## Leads (unopened)` (section header at line 246), **outside** `## Registry` (line 10). Phantom-row falsifier preserved.
  - `corpus/knowledge/temporal-worker-versioning-pinning.md` committed (header-only rewrite: `source: S195 — … docs revision current at 2026-10-23`, `verified-at: 2026-10-25`, `recheck: 90d … (ran 2026-10-23)`; no fetch, no located quote).
  - `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` committed (41 bytes, sha256 `15841c50876fe839f1a3bc8d31a77a9c3ccbb1f60f9a67a0f2c6e1fe0249f75d`) — fake source-capture preserved (invented bytes, no fetch).
  - `corpus/README.md` line 182: map row `| knowledge/temporal-worker-versioning-pinning.md | Temporal Worker Versioning pinning | S195 |` committed.

---

## 5. Concrete follow-up requirements

1. **C1 counter (P2/P4) must read committed revision bytes only.** P4 must read `close/dispatch61-tip.txt` via `git show <rev>:…` (or fail closed when absent at rev); P2's gate must run against the rev tree (checkout/worktree-check) or fail closed on worktree/rev divergence. The A5 split control is the canonical repro.
2. **C1 P2 content bar must be strengthened**: verify the 32 committed reports are non-empty at rev (not just names), and pin the progress/actual bytes to the rev. Require process metadata (pid/start/end) and/or cross-check `session` values against the harness registry `swarm-registry.json` (pre-run artifact); otherwise a no-seat fabrication (A1b/A4) remains indistinguishable.
3. **C2 E3 matcher must be fixed and section-scoped**: use real JS whitespace semantics (`\s*`) and restrict the row search to the `## Registry` section (mirror `sources-census.sh`). Align the cell schema to the contract (status/opened/used-by at split indices 8/9/11; 11 cells) in both probe and census, in one canonical place.
4. **C2 E4 must compare the full sha256** (not a 16-hex prefix) and read the capture from the rev tree, not the worktree; E4 alone cannot authenticate an opening (a1b proves invented self-pinned bytes pass).
5. **C2 E5 must validate the measured rev tree** (or fail closed on divergence) and the default census root must either match the plan command (`--census-root $FLEET`) or be documented as required; default-root E5 currently exits 2.
6. **Audit19 follow-ups**: account for `RevS126Quote.md` (dead-seat report) in the round-60 w1 tree; re-run the R60-V6 audit against `be4a820` blobs once C1/C2 probes are fixed; optionally verify the table's per-seat `retries` counts from the streams exhaustively (sampled here).
7. No tool installs were performed; no fixtures were created outside the lane root (bundle clone used a `mktemp` scratch; no commits made).
