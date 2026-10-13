# Round 18 — Kimi-CLI province expansion, wave 1 (2026-10-13)

Operator directive ("focus on kimi code cli for now"): the province absorbs
Kimi Code CLI orchestration as new domain surfaces. The round is a
**definition/expansion round** — the round-18 pre-registration in
`SCORECARD.md ## Planned` froze the candidate surfaces, the K1–K4 family
membership, and the wave mechanism; this round executed the first wave.

## What landed

Six `corpus/knowledge/kimi-*.md` notes from a 6-lane `AgentSwarm` wave on a
secondary fast model (alibaba-token-plan/deepseek-v4.1-flash), one lane per
frozen K-family scope, each lane writing exactly one note (distinct paths, no
overlap), the parent integrating:

| Lane | Note | Headline finding |
|---|---|---|
| K1 | `kimi-config-plane.md` | 7 provider groups / 8 tables, 124 model tables, `default_permission_mode` the only permission key, and a 13-generation `.bak` drift narrative (10,201 → 40,605 B) |
| K2 | `kimi-lane-definitions.md` | 18 lane files in **three** buckets (7 fast / 5 mid / 6 strong — the strong family was unnamed in the pre-registration), pins cross-referenced 1:1 against `config.toml:1255-1277` |
| K3 | `kimi-skills-plugins.md` | user skills are **symlinks** into `~/Projects/myskills` + `~/.agents/skills`; precedence User > Extra > Built-in verified against the session listing |
| K4 | `kimi-session-state.md` | `wd_<slug>_<sha12>` session-key scheme reproduced against binary constants (`WORKDIR_KEY_PREFIX`, `HASH_LENGTH=12`) — 9/9 catalog keys |
| K5 | `kimi-binary-secrets.md` | update path (CDN `latest.json` → rollout gate → zstd stage → sha256 verify → atomic swap) recovered from binary strings; secret paths shape-only, contents never read |
| K6 | `kimi-modes-machinery.md` | 4-mode storage keys + goal-mode contract from binary strings; **kimi is an undeclared substrate** for the swarm/tower skill docs (frontmatter says omp/devin; kimi has native `/swarm` `/tower` gated by `[experimental] tower`) |

## Method notes

- **Wave discipline worked as designed**: each lane was given the frozen
  member list, the citation discipline, the read-only boundary, and exactly
  one output path; every lane self-corrected at least one anchor or count
  during its own review (K1: api_key non-empty count 7→6; K5: rollout count
  88→87+1) — corrections reported in the lane summaries, not silently fixed.
- **Admission gate FAILED on first pass — reject → repair → re-admit**: the
  parent's 5-anchor spot-check matched, but `cite-check` found **80
  citation-form errors** in the wave's notes (bare basenames — `config.toml`,
  `sec-fast-zai-flash.md`, `session_index.jsonl` — bound to the wrong owning
  tree; plus two gate-artifact specials in `kimi-modes-machinery.md` and one
  backtick mispairing left as a follow-up). The admission was rejected; a
  3-lane repair wave fixed citation form only (claims untouched, verified by
  line-count reconciliation) and re-admitted at **0 errors**. Final
  independent re-run: `errors=386` repo-wide, **0 in any kimi-\* note** — the
  386 are the upstream-relocation fallout in pre-existing OMP notes + the
  established third-party aggregator artifacts, recorded as carried debt.
  First-pass acceptance followed by gate rejection is the lesson: a spot-check
  samples, the gate sweeps — admit only on the sweep.
- **Cross-domain findings routed, not absorbed** (each lane named them):
  credential shapes → kagi; model-quality/selection material → kengaku;
  endpoints (CDN, plugin daemon :10086, provider base_urls) → kama.
- **The round moves no frozen proxy term by design**: A stays 5 (no new
  script), C stays 10 (no new checklist item — deliberately; a `- [` item
  claiming a runnable check that cannot run green would farm the proxy).
  C2 moves 53/53 → **60/60** (6 notes + this lesson get README rows); the
  stanza is re-pinned in the same round per the completion contract.

## Gate

- ## Gate
  - What would falsify this lesson: a note whose anchors do not re-resolve;
    a lane that touched a file outside its one note; a claim of measured
    runtime behavior that is only doc-derived (K6 labels these
    INFERENCE-from-docs — the binary-strings evidence is labelled as such).
  - Re-run: the parent spot-check above (5 anchors, one per plane, all
    matched); `grep -c '^| \`\(knowledge\|lessons\)/' corpus/README.md` → 60
    and `find corpus/knowledge corpus/lessons -name '*.md' | wc -l` → 60;
    `node scripts/cite-check.mjs --src ~/Projects/ufo-fsd-alpha --json` →
    **0 errors in every `kimi-*` note** (repo-wide 386 = carried OMP-relocation
    debt + third-party artifacts, see below).
  - Carried debt, stated plainly: `cite-check`, `proxy-check`, `claims-check`,
    and `surface-probe --checklists` cannot read their CLEAN/MATCH verdicts
    this round — the origin tree relocated (`~/Projects/origin-work/` →
    `~/Projects/ufo-fsd-alpha`) and restructured upstream (50 files deleted
    incl. frozen registry members), so the S/R terms legitimately DRIFT. That
    re-census is parked OMP-side work (with the S2 move) per the operator's
    Kimi-CLI directive; recorded in `SCORECARD.md ## Planned`, not fitted.
