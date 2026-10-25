# Audit11 — Source-Provenance (temporal-worker-versioning-pinning.md)

Scope: check the new knowledge entry opens with `source`/`verified-at`/`recheck`, cites only
lane id **S195**, and does not retain staged **S217** citations or unsupported retry claims.

Target: `/home/vgpnk/Projects/shokunin/kumitate-shokunin/corpus/knowledge/temporal-worker-versioning-pinning.md`
(untracked new file at HEAD; staged-package origin:
`/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/temporal-worker-versioning-pinning.md`,
`source: S217`, `verified-at: 2026-10-23`, recheck `(ran 2026-10-23)`).

## Verdict: 1 DEFECT (recheck command miscalibrated) — provenance/attribution otherwise CLEAN

### PASS — header trio opens the entry

Lines 1–5 (entry is 29 lines):
- `source: S195 — https://docs.temporal.io/worker-versioning.md — § Versioning behaviors → § Pinned Workflows / § Auto-Upgrade Workflows; § Continue-as-new, Child Workflow, and Retry Semantics`
- `verified-at: 2026-10-25 (raw markdown opened by kumitate; response HTTP 200; captured body sha256 8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc)`
- `recheck: 90d — curl -fsSL 'https://docs.temporal.io/worker-versioning.md' | grep -c 'Pinned Workflows' (expected 1)`
- `coverage-map:` + `ground:` follow immediately after — trio is the opening, per E2 gate expectations.

### PASS — cites only S195, zero S217 residue

- `grep -cn 'S217' corpus/knowledge/temporal-worker-versioning-pinning.md` → **0**.
- Lane ids in entry: only `S195`, at line 1 and line 15 (`[S195 § Versioning behaviors → § Pinned Workflows](…)`). Both staged citation sites flagged by wave-1 (`ScribeLessonPrep.md:75-76`: staged `source: S217` line 2 and `[S217 §Pinned Workflows]` line 24) are rewritten.
- `verified-at` re-grounded to 2026-10-25 with sha256 pin, not header-only-copied from staged `2026-10-23` (fixes C2-control verbatim-copy case).
- Lane `corpus/SOURCES.md:147` S195 row used-by → `corpus/knowledge/temporal-worker-versioning-pinning.md`; `corpus/README.md:182` lists the entry. `grep -c 'S21[0-9]' corpus/SOURCES.md` → 0, so no stray staged row landed in the registry.

### PASS — unsupported retry claims removed

Staged entry's risky claim — §"Rule that follows" line 63: "Temporal will hand a retry to code
that has moved" — is **absent** from the lane entry. The lane entry's retry text (lines 21–23)
mirrors the capture exactly:
- capture `body.md:131-133`: three "Inheritance Conditions (all must be met)" → entry line 21.
- capture `body.md:135-137`: "When Conditions Not Met: No version inheritance occurs" → reflected.
- capture `body.md:141`: Cron "**Never inherit**" → entry line 21.
- The undocumented top-level-Pinned-retry case is explicitly held UNKNOWN (entry line 23), not asserted.

Other claims verified against committed capture
(`.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`,
sha256 `8ef2ee5f…f0f8fc` — independently re-hashed this audit, and re-fetched live
2026-10-25: byte-identical, same sha256):
- Guarantee quote verbatim at `body.md:39` (entry line 29 claims line 39 — correct; quote is 13 words — correct).
- "Auto-Upgrade … never inherit versions" — `body.md:94`.
- "Independent Activities … Current or Ramping Version of their own Task Queue" — `body.md:53-54` → entry line 27.
- Minor: entry line 21 merges child/CAN conditions as "Task Queue belongs to that version" while CAN text at `body.md:121` says "Task Queue not in the same Worker Deployment" — child condition (body.md:105) matches; the CAN paraphrase is looser but not a false claim.

### DEFECT (operability) — recheck command's expected value is wrong

Entry line 3: ``recheck: 90d — `curl -fsSL 'https://docs.temporal.io/worker-versioning.md' | grep -c 'Pinned Workflows'` (expected 1)``

Evidence:
- `grep -c 'Pinned Workflows' .ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md` → **2** (`### Pinned Workflows` heading at :37; `- For Pinned Workflows, an Activity starts…` at :50).
- Live fetch 2026-10-25 (`curl -fsSL … | sha256sum` → `8ef2ee5f…f0f8fc`, identical to capture) → `grep -c 'Pinned Workflows'` → **2**.

Consequence: the recheck fails on a healthy source **today** — expected `1` can never be observed
against the pinned body. It also cannot detect the page disappearing unless it drops below 1
(i.e., to 0), so it is both miscalibrated and insensitive for the common drift case. The staged
entry's recheck (`grep -c 'Pinned'` → 14, ran 2026-10-23) was also stale — live count is 10 — so
the rewrite correctly re-grounded but landed a wrong constant. Fix: `(expected 2)` or
`grep -c 'guaranteed to complete on a single Worker Deployment Version'` (expected 1).

## Residual risk / gaps

- Entry claims `body.md:39` for the located quote — verified correct.
- No git/jj log for the new file yet (untracked); provenance chain to wave-1 scout capture is via
  sha256 only, which independently matches.
- Install/update log: none this seat (no packages installed).
- Commands used: `grep`, `sha256sum`, `curl` (live refetch), `git log/status`, `find`, `ls`.
