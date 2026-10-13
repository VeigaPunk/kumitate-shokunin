# Round 19 — audits + the K-census gate (2026-10-13)

The round-19 pre-registration froze the K-block terms and named the move:
operability via `scripts/kimi-census.mjs`, with kaidoku-round-2-style audits
of round 18's notes first. Executed as registered.

## What landed

- **`scripts/kimi-census.mjs`** (contract `kumitate-kimi-census-v1`, 797 L,
  35-case hermetic suite): the frozen K1–K4 member rules (46 members) as a
  live census over `~/.kimi-code` — `MEMBER_MISSING` / `UNLISTED` /
  `SHAPE_DRIFT` arms, fail-closed `KIMI_ROOT_MISSING`, `--root` / `--json` /
  `--selftest`. Secrecy enforced in code and proven by strace: the secret
  members are stat-only (zero `openat`/`read`), and a FIFO token in the
  selftest passes shape-clean without blocking — a read would have hung.
  Live: `KIMI_CENSUS: CLEAN (members=46 checked=46 chain=12 info=4)` exit 0.
  Proxy effect as pre-registered: A 5→6, C 10→11, `f_O` 0.8333 → 0.85,
  integer held at 8.
- **Four audit lanes (fast model) re-verified round 18's six notes**
  independently. Verdict mix: the load-bearing quantities, hashes, schemas
  and matrices overwhelmingly CONFIRMED (the 18-lane 1:1, the rollout-log
  classification, the shape census, 12/12 drift generations); **4 append-only
  errata blocks** landed (config-plane count errors 12→11 / 15→16 sections /
  api_key 7→6; skills-plugin nits; session-state slug rule now
  case-folding-correct; binary-secrets 87/88 not 88/88); **2 drift
  annotations** — config.toml's secondary `default_model` flipped
  opencode-go → hyper at 18:15 *during the round*, proving the substrate
  mutates under observation (the note snapshots were true at reading time;
  the durable record is the drift narrative, and no machine gate detects
  config content drift — recorded as a limit).
- **K-block terms frozen** (round-19 pre-registration): the
  `coverage:kimi-layer` formula, K_members = 46 with counting rules, the
  near-zero expected first measurement.
- **K5 residue family + first measurement pre-registered for round 20**
  (registry change a round ahead, per rounds 12→13): the census's own
  deviation report exposed `workspaces.json`, `tui.toml.bak`, `rc-qrcode.png`
  as undeclared root children — K5 makes the root enumerable, K_members
  46 → 49.

## Defects recorded

- **Process (audit lane A2):** the lane printed `api_key` values to its own
  transient stdout during a `sed` probe — redacted in its report, no durable
  artifact touched. Shape-only discipline covers durable artifacts *and*
  transient output: future audit briefs carry "count, never print values".
- **Tool limit (investigated, not patched):** `cite-check` tokenizes the prose
  word "base" inside quoted skill-doc text as a ref (16 harmless `OK` notes
  binding to `base.mjs` in `kimi-modes-machinery.md`); repairing means
  altering quoted material. Queued as a tokenizer hardening item.
- **Census limits (stated by the implementer, accepted):** mode pins are
  floors (a loosened secret mode passes); the chain's generation *count* is
  info, its presence is gated.

## Gate

- ## Gate
  - What would falsify this lesson: a census arm that fires on the live
    substrate (none did), an audit verdict accepted without the erratum it
    implies, or a stanza/axes edit that moved an integer the pre-registration
    said would hold.
  - Re-run: `node scripts/kimi-census.mjs` → CLEAN exit 0; `--selftest` →
    35/35 PASS; `--root /nonexistent` → exit 2; `node scripts/proxy-check.mjs
    --src ~/Projects/ufo-fsd-alpha` → legacy terms MATCH (A=6, C=11,
    C1=19/19, C2=60/60), layer terms DRIFT (carried debt, unchanged);
    `cite-check --src … --json` → 0 errors in every `kimi-*` note.
  - Carried debt unchanged: the OMP-side re-census (proxy/claims/checklist
    greens) remains parked with the S2 move.
