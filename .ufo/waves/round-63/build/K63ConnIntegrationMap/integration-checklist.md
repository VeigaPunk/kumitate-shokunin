# K63ConnIntegrationMap — integration checklist (drafts for L1)

Round 63 wave w1. Source of truth: `scripts/proxy-check.mjs` (frozen derivations),
`scripts/readme-map.mjs`, `scripts/source-capture.mjs`, `scripts/cite-sources.mjs`,
`scripts/sources-check.mjs`, `scripts/counter-pins.mjs`, `scripts/inline-dispatch-evidence.mjs`,
`scripts/dispatch-evidence.mjs`, probes `inline63-probe.mjs`/`topology63-probe.mjs`
(frozen counters), `SKILL.md`, `PROVINCE.md`, `corpus/README.md`.

## Ordered checklist (file → exact edit → gate that reads it → proof command)

1. **scripts/proxy-check.mjs** (L1-owned; edit → re-pin `pin.proxy-check`)
   - Add to `GATE_PINS` (after `pin.dispatch-evidence`, line ~478):
     `'pin.inline-dispatch-evidence': 'scripts/inline-dispatch-evidence.mjs',`
     `'pin.make-dispatch-actual': 'scripts/make-dispatch-actual.mjs',`
   - Gate: proxy-check `parseGatePins`/`compareGatePins`/`comparePinCoverage`.
   - Proof: `node scripts/proxy-check.mjs --strict` → `PROXY: MATCH` exit 0 (after #2/#3).
2. **SCORECARD.md** — `<!-- kumitate-proxy-v1` stanza (lines 287-311)
   - `A=122` (recompute if more runnable files are committed), `C2=154`, `C2_total=154`;
     `C=30`, `C1=19`, `C1_total=19` unchanged; re-pin `pin.proxy-check` (new sha after #1).
   - Gate: proxy-check `compareTerms`/`comparePins`.
   - Proof: `node scripts/proxy-check.mjs --strict` → MATCH exit 0.
3. **SCORECARD.md** — `<!-- kumitate-gate-pins-v1` block (lines 312-331)
   - Keep `pin.make-dispatch-actual=f0194314e98e87e86eb1329f36411e249911f9a0120aa4feb702562a54bf3dc9` (matches `sha256sum scripts/make-dispatch-actual.mjs`), add
     `pin.inline-dispatch-evidence=<sha256 scripts/inline-dispatch-evidence.mjs>` (current fdd883927baa136afb4672474dc39eb0e524d5351fed26bfe6934bd05b7d2bfd; refresh if edited).
   - Gate: proxy-check `compareGatePins` (`GATE_PIN_DRIFT`), `PIN_UNPINNED` suppression.
   - Proof: same command; plus `node scripts/proxy-check.mjs --selftest` → PASS.
4. **SCORECARD.md** — capabilities table (near `dispatch-evidence` row, line ~1795)
   - Add row `| \`inline-dispatch-evidence\` | <contract kumitate-inline-dispatch-evidence-v1; binds one wave to harness per-seat transcripts + orchestrator dispatcher log + committed bytes> | <entry command> | <selftest 25/25> | <pinned in kumitate-gate-pins-v1> | 63 |`
   - Gate: `inline63-probe` I5 (regex `^\|\s*`inline-dispatch-evidence`\s*\|`, ≥6 cells, second-to-last cell `63`).
   - Proof: `node .ufo/waves/round-63/probe/inline63-probe.mjs <lane> <rev>` → I5 held.
5. **SKILL.md** — Gate registry (table at lines 599-626) + Verifiable checklist (lines 678-726)
   - Registry row: `| inline-dispatch-evidence | gate | \`node scripts/inline-dispatch-evidence.mjs --root DIR --round N --wave NAME\` → \`INLINE_DISPATCH: CLEAN|DRIFT|FAIL-CLOSED\` | \`--selftest\` (25/25) | \`kumitate-gate-pins-v1\` + SCORECARD capabilities |`
   - Checklist items (mirror item 30 format): `- [ ] Inline dispatch-evidence gate (round 63; contract kumitate-inline-dispatch-evidence-v1) — \`node scripts/inline-dispatch-evidence.mjs --selftest\` → exit 0 + \`INLINE_DISPATCH_SELFTEST: PASS\`, and \`node scripts/inline-dispatch-evidence.mjs --root <lane> --round 63 --wave <w>\` over committed wave records → exit 0 + \`INLINE_DISPATCH: CLEAN\``; update "Twenty-six items" prose count.
   - Gate: `surface-probe --checklists` (exit 0, `CHECKLIST: n/n pass`); C term counts the `- [ ]` lines.
   - Proof: `node scripts/surface-probe.mjs --checklists` → `VERDICT: PASS` exit 0.
6. **corpus/SOURCES.md** — append rows S196, S197 (11 cells → NF=13; `source:` URL, tier A/B, scope, anchor incl. fetch metadata, teaches, `mined`, opened `2026-10-25`, recheck cadence, `used-by` naming the entry path). No duplicate id/URL; community never tier A.
   - Gate: `sources-check`; `sources-census.sh validate` (T6); `source-capture` (bind); `cite-sources` (if README cites).
   - Proof: `node scripts/sources-check.mjs` → `SOURCES_CHECK: CLEAN` exit 0; `/home/vgpnk/Projects/shokunin/scripts/sources-census.sh validate --file corpus/SOURCES.md` → exit 0.
7. **.ufo/pins/source-captures.json** — add two captures:
   `{"sourceId":"S196","path":".ufo/waves/round-63/build/K63Capture/arxiv-2512.08296v3.html","sha256":"df31beb3a2ae0f9ad2084750b34a05849b2ab418cb8121666ffb8a8a15517223","bytes":663997,"captured":"2026-10-25"}` and `{"sourceId":"S197","path":".ufo/waves/round-63/build/K63Capture/bailian-managed-agents-multiagent.md","sha256":"7ea4396645e3b1c89a3fd984ea095dabd75c2e23e8f376ec2211c1b855ec37e6","bytes":3388,"captured":"2026-10-25"}` (verify shas after capture files settle).
   - Gate: `source-capture`; `topology63-probe` T3 (sha256+size inside `git archive`).
   - Proof: `node scripts/source-capture.mjs` → `SOURCE_CAPTURE: CLEAN captures=29 exemptions=107`; probe T3 held.
8. **corpus/knowledge/multi-agent-coordinator-topologies.md** (new) — first 14 lines must contain `source: S196 …`, `source: S197 …`, `verified-at: 2026-10-25`, `recheck: <cadence>`; `## Located quotes` with ≥6 bullets `- S### — "<quote>"` (≤25 words each, in capture + live).
   - Gate: `topology63-probe` T1/T2/T4/T5; `sources-check` E11 (used-by paths exist).
   - Proof: `node .ufo/waves/round-63/probe/topology63-probe.mjs <lane> <rev>` → `TOPOLOGY63_HELD held=7/7` exit 0.
9. **corpus/README.md** — add rows (exact form `| \`path\` | … |`):
   `| \`knowledge/multi-agent-coordinator-topologies.md\` | … | ptr |`, `| \`lessons/round-63.md\` | … | ptr |`, `| \`lessons/round-63-verifier-spotcheck.md\` | … | ptr |`, and repair `| \`lessons/round-62-verifier-spotcheck.md\` | … | ptr |`.
   - Gate: `readme-map` (bimap), `cite-sources` (S### in rows must exist), proxy C2.
   - Proof: `node scripts/readme-map.mjs` → `README_MAP: CLEAN files=154 rows=154 covered=154` exit 0.
10. **.ufo/pins/readme-map.json** — add to `covered[]`: the 3 new paths + `lessons/round-62-verifier-spotcheck.md`.
    - Gate: `readme-map` (`unpinned`/`stale-covered`).
    - Proof: same command.
11. **PROVINCE.md** — Frontier section: add bullet containing the full entry path and a frontier keyword (probe matches `frontier|band|ground|first entry` on the same line), e.g. `- Multi-agent coordinator topology (vendor managed-agent contract + measured arXiv scaling study) — first entry \`corpus/knowledge/multi-agent-coordinator-topologies.md\` (round 63, S196/S197): …`.
    - Gate: `topology63-probe` T7 (plus readme-map clean).
    - Proof: probe T7 held.
12. **.ufo/waves/round-63/close/inline63-tip.txt** (closure) — first line `rev=<M full hash>`; quote every wave's CLEAN line from I2.
    - Gate: `inline63-probe` I6.
    - Proof: probe I6 held.
13. **counter-pins.json** — already pins the 4 round-63 probes (pins=21); no edit. Verify `node scripts/counter-pins.mjs` → `COUNTER_PINS: CLEAN pins=21`.

## Numbers

- Base frozen: A=122, C2=150, C2_total=151 (stanza 117/150/150 — masked by the gate-pin fail-closed).
- Post-round canonical: A=122 (+ any committed extra runnable files, e.g. +2 if build-tools/*.mjs land), C2=154, C2_total=154; scores 9/10/10/10/10 unchanged.
