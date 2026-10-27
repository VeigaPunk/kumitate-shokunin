VERDICT: Staged deprecation theme read in full; of 13 files, 7 are admit-candidates (1 with a fix) and 6 must be rejected as staged — the theme's core contradiction is three incompatible clocks, and rounds 14/15's "cure" (12-month revision clock, earliest removal = 2026-07-28) is disproven by the live SEP §Transition clause the registry cell restates; live pages show no drift since the staged verified-at 2026-10-24.

## Evidence

All staged files read at `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/` (read-only);
rows in `merge/kumitate/SOURCES.append.md`; `MERGE-REPORT.md` (155 rows, 70 entries, nothing written to the lane).

Live fetches 2026-10-27 (captures + sha256 in `.ufo/waves/round-66/build/K66ScoutStagedTheme/evidence/`):

- `curl -fsSL https://modelcontextprotocol.io/specification/2026-07-28/deprecated.md` → 6-row table identical to staged
  (Roots/Sampling/Logging/DCR `First revision released on or after 2027-07-28`; includeContext `Follows Sampling`;
  HTTP+SSE `Three months after SEP-2596 reaches Final`, deprecated in `2025-03-26`); preamble "derived view kept consistent
  with the per-feature deprecation notices and changelog entries, which are the normative records"; Removed section:
  "No features have been removed under this policy yet." (evidence/deprecated-2026-07-28.md:26-40)
- `curl -fsSL https://modelcontextprotocol.io/community/feature-lifecycle.md` → "at least twelve … measured from the
  release of the specification revision in which the feature is first marked Deprecated, not from the date the SEP reaches
  Final" (lines 68-74); Expedited Removal 90-day floor (133-143); Roles table + Lead Maintainer veto (145-157);
  **no Transition/grandfathering section on the policy page** — round14/15's one true claim.
- `curl -fsSL https://modelcontextprotocol.io/seps/2596-spec-feature-lifecycle-and-deprecation.md` → §Transition
  (lines 238-267): "Each is therefore given a three-month grace period from the date this SEP reaches Final before it is
  eligible for removal" + table "HTTP+SSE transport | Streamable HTTP | Three months after this SEP is Final"; registry note
  links the reclassification to "its transition provisions". Created 2026-04-17 / Status Final (line 25).
- `curl -fsSL https://modelcontextprotocol.io/docs/learn/versioning.md` → "The current protocol version is 2026-07-28" (line 25).
- `curl -fsSL https://modelcontextprotocol.io/specification/2026-07-28/changelog.md` → standing `## Deprecated` heading;
  entry 2 "Reclassify the HTTP+SSE transport (deprecated since protocol version 2025-03-26)…"; "a minimum twelve-month
  deprecation window, and a registry of deprecated features" under Governance.
- `curl -fsSL https://modelcontextprotocol.io/specification/2025-03-26/basic/transports.md` → §Backwards Compatibility
  notice, compatibility contract, no removal date (line 250+) — round16's claim verified.
- `curl -fsSL https://docs.unified.to/mcp/changelog` → "Removed the SSE transport", "September 23, 2026", 410 present.
- Live registry/SEP/policy pages show no change vs the staged `verified-at: 2026-10-24`; nothing is stale on the live side.

## Findings

- `K66ScoutStagedTheme-1` (high; attacks the theme's internal clock coherence): three incompatible clocks are staged.
  r5/r6: grace from creation date 2026-04-17 → eligible 2026-07-17. r7: correction to merge date 2026-05-18 → 2026-08-18.
  r13/r14: no date; 12-month revision clock → earliest removal = the 2026-07-28 revision itself. Only the third family
  even asks which event "reaches Final" names, but its cure ignores the SEP §Transition that the registry cell restates
  (evidence/sep-2596.md:238-267). Repro: `grep -n -F 'Three months after this SEP is Final' evidence/sep-2596.md` → 1 match;
  `grep -c -F 'final' evidence/sep-2596.md` confirms the SEP's own basis.
- `K66ScoutStagedTheme-2` (high; attacks r14/r15 "cure"): `sep-2596-final-date-and-the-deprecation-clock-2026-10-26.md` and
  `deprecation-clock-narrative-record-2026-10-27.md` claim the three-month cell "is the policy's opposite … in the wrong
  document" with no normative basis — false: the SEP is a governing record and its §Transition table names exactly
  "Three months after this SEP is Final". Their derived answer (first revision Current after 2026-03-26 = 2026-07-28) is
  wrong under the SEP. Verdicts #7/#10/#11 rejected with flip conditions (verdicts.md).
- `K66ScoutStagedTheme-3` (medium; attacks r5/r6/r7 staged dates): the only completion-tracking marker for "reaches Final"
  is the `final` label 2026-06-03T17:07:09Z (S334 pattern; SEP guidelines condition = reference implementation +
  conformance test, evidence/sep-guidelines.md:108,153-155). Grace ended 2026-09-03 — after the 2026-07-28 revision shipped,
  so the "already eligible when the revision shipped" sentence (r5) and "eligible since 2026-07-17" (r6) are wrong, and r7's
  2026-08-18 corrects a date inside a misidentified rule.
- `K66ScoutStagedTheme-4` (medium; staleness inside the theme): `deprecation-decision-roles-and-operator-retirements-2026-10-25.md`
  says the unified.to retirement (2026-09-23) "is before the registry's own three-month grace … would have expired" — true
  only under the discarded 2026-07-17/2026-08-18 dates; under grace end 2026-09-03 it is 20 days after expiry. Admit with that fix.
- `K66ScoutStagedTheme-5` (low): `sep-2596-status-and-merge-dates-2026-10-25.md` says grace end 2026-09-03 is "five days
  after the revision" — arithmetic slip; 2026-07-28 → 2026-09-03 is 37 days. Direction right, magnitude wrong.
- `K66ScoutStagedTheme-6` (info; scope): theme fits PROVINCE §Frontier "MCP protocol revisions as they bear on orchestration"
  (line 21) — registry removal dates govern when an MCP host (the installed OMP release ships `transports/sse.ts`, declares
  `roots`) must migrate; nothing touches the MCP/OAuth security band (line 28 → kasegi/kagi). Verdicts: 6 admits (#2 r10,
  #5 r12, #6 r13, #8, #9, #13 r16) + 1 admit-with-fix (#12 r11); 6 rejects-as-staged (#1 r5, #3 r6, #4 r7, #7 r14, #10 r14,
  #11 r15) — satisfies the plan's assimilation gate of ≥1 admit and ≥1 reject.

## Artifacts

- `.ufo/waves/round-66/build/K66ScoutStagedTheme/verdicts.md` — per-file verdict/reason/flip table, the 6 load-bearing
  sentences vs live pages, and the 5-point synthesis the L1 should hold after integration.
- `.ufo/waves/round-66/build/K66ScoutStagedTheme/evidence/` — 7 live-page captures (deprecated registry, feature-lifecycle
  policy, SEP-2596, versioning guide, changelog, 2025-03-26 transports, SEP guidelines) with sha256 in this report's Evidence.

## Limits

- The two CJK carrier files (S335/S336) and the release-announcement "year-long offramp" claim (r10) were not opened;
  the GitHub API record (S334) was not re-fetched today — the 2026-06-03 label date is taken from the staged capture and
  the live SEP file's own Final-status banner, not a fresh API read.
- Cloudflare's workers-observability 0.5.5 note (S289) was not spot-checked; unified.to was.
- Live checks are point-in-time 2026-10-27 fetches; the staged recheck clauses (180d) were not re-executed as commands.
- Verdicts judge staged text vs live sources; the frozen counters/controls were not in scope and were not run.
