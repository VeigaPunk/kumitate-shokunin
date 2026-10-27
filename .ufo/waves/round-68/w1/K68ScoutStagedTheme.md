VERDICT: Dossier complete — all four staged files rejected as staged; clock must be rebuilt on the lane's 2026-06-03 Final / 2026-09-03 elapsed reading, table and policy substance survive verbatim.

## Evidence

- Staged set (read-only, `/home/vgpnk/Projects/shokuknow/merge/kumitate/knowledge/corpus/knowledge/`):
  `mcp-feature-deprecation-registry.md`, `mcp-deprecation-removed-section-2026-10-26.md`,
  `mcp-deprecation-registry-timing-2026-10-27.md`, `mcp-deprecation-removal-state-2026-10-25.md`.
  MERGE-REPORT.md has no dedicated theme section — theme appears only as four rows in its
  knowledge-files table (merge rounds 5/6/7/10).
- Base entry clock derivation, verbatim (`mcp-feature-deprecation-registry.md:62-70`): "SEP-2596 is
  **Final**, dated **2026-04-17** … SEP-2596 reached Final on 2026-04-17; three months later is
  **2026-07-17** … **The HTTP+SSE transport was already eligible for removal on the day the revision
  shipped.**" The index column quoted is Created, not Final.
- Timing amendment derivation, verbatim (`mcp-deprecation-registry-timing-2026-10-27.md:51-53`):
  "reached **Final** on **2026-05-18**: its pull request carries a label named `final` … `merged_at`
  is `2026-05-18T18:09:21Z` … earliest removal is **2026-08-18**"; and :55-57, "A secondary account
  … dated the merge to 2026-06-03. That page was **not opened**".
- Lane disproof, `.ufo/waves/round-66/build/K66ReviewStagedClaims/captures/timeline.json` (fetched
  2026-10-27): `"event": "merged"`, `"created_at": "2026-05-18T18:09:21Z"` (lines 2694-2697);
  `"event": "labeled"`, `"created_at": "2026-06-03T17:07:09Z"`, `"label": {"name": "final"}` (lines
  3637-3644); `unlabeled accepted` same instant (line 3604). Merge ≠ Final: label lands 16 days later.
- `review.md` verdicts: C1 → "**reached Final on 2026-05-18**" and "2026-08-18" **wrong**, "the
  label event **2026-06-03T17:07:09Z**, applied **after** the merge … grace ends **2026-09-03**";
  A13 → 2026-07-17 "eligible" is right arithmetic on a wrong premise; A12 → "five days after the
  revision" wrong (37 days); C2 → "was not opened" stale (Haning page opened, dates 合入 2026-06-03);
  C5/C6 → sibling `deprecation-clock-corrections-2026-10-26.md` replacement clause contradicts the
  SEP Transition, and misattributes the 2026-07-17 quote.
- Round-66 plan §C2 staged the theme for re-grounding ("one entry, re-grounded on rows opened in
  round 66, never copied"); LOG.md:2318 records `DEPREC66_UNMET held=0/8` honest stop — review
  committed, entry never integrated. Round-68 plan names the live clock: "SEP-2596 Final 2026-06-03
  (commit `183238ddac`, 'Mark SEPs as final') + three-month grace → elapsed 2026-09-03 … the staged
  theme's 2026-04-17-Created and 2026-05-18-merge readings are disproven and must not enter."
- Live spot check: `curl -o /dev/null -w '%{http_code}'` on both `specification/2026-07-28/deprecated.md`
  and `specification/draft/deprecated.md` → 200/200 today; the plan's "404 recheck path" refers to the
  staged entry's page-pinned grep recheck (a single string on one revision-scoped page), not a live
  failure at dossier time.

## Findings

- **K68ScoutStagedTheme-1** (high, attacks the assimilated claim C2): both staged clock readings are
  disproven by the project's own timeline — `final` label 2026-06-03T17:07:09Z vs the staged
  2026-04-17 (Created) and 2026-05-18 (merge). Repro: `grep -n '2026-06-03T17:07:09Z'
  .ufo/waves/round-66/build/K66ReviewStagedClaims/captures/timeline.json` → lines 3604, 3640
  (`unlabeled accepted`, `labeled final`).
- **K68ScoutStagedTheme-2** (medium, attacks any verbatim copy): the timing amendment's "not opened"
  dismissal of the 2026-06-03 account is stale — its own staged sibling (status entry, S303) had
  opened the Haning page two days earlier; the dismissed date is the correct Final date.
- **K68ScoutStagedTheme-3** (low, recheck fragility): both `.md` rechecks grep one revision-scoped
  page for `Three months after SEP-2596 reaches Final`; a registry edit silently breaks the count.
  The lane re-grounds rechecks on committed captures.

## Artifacts

- `.ufo/waves/round-68/build/K68ScoutStagedTheme/dossier.md` — full dossier (verbatim derivations,
  timeline disproof, survive/rebuild split, per-line conflict table, Gate verdict).
- `.ufo/waves/round-68/w1/K68ScoutStagedTheme.md` — this report.

## Limits

- Did not live-re-fetch the GitHub API this round (timeline.json is the committed round-66 capture;
  the lane's live re-verification is the measured-tip M5 arm's job, not mine).
- Did not audit `sep-2596-*`/`deprecation-clock-*` siblings beyond what review.md already graded;
  C5/C6 noted for the Gate.
- MERGE-REPORT.md checked for a theme section — none exists; coverage is via its file table only.
- No tool installs; no mutations outside my report/build paths. Scratch dir removed.
