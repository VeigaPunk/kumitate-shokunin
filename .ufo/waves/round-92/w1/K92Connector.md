# K92Connector — sibling-overlap scan (C1 `seat-route`)

Read-only. Full table and evidence: `.ufo/waves/round-92/K92Connector/overlap.md`, receipts in
`.ufo/waves/round-92/K92Connector/receipts/`.

## Findings

1. **No sibling lane owns seat routing.** `grep -iE 'answering model|seat-route' */PROVINCE.md` → 0 hits.
   The transcript surface is partitioned by question: mori = terminal status (`mori-shokunin/PROVINCE.md:103-108`),
   mado = issued commands (`mado-shokunin/PROVINCE.md:25`), kagi = secret leakage over the *opencode* DB
   (`kagi-shokunin/PROVINCE.md:69`). "Which model answered / which requests failed / last error" is unclaimed.
2. **One real overlap, in-lane:** `kumitate-shokunin/scripts/inline-dispatch-evidence.mjs:75,197-200,244,345`
   already emits a per-seat `model` (first `model_change` whose role starts `subagent:`, not seat-scoped) and a
   `dead` verdict (`!(yielded && exitKind normal)`), not `final`. On the twelve r91 seats the two readings are
   **identical** (captured 0/12 mismatch, verdict 0/12 divergence), so the conflict is latent, not current.
   `seat-route` adds `answered`, `fallback`, `errors`, `aborted`, `last_error`, `final` — none present anywhere.
3. **Two live contradictions between lanes, both on the same fields:**
   - `mori-shokunin/tools/mori-round17-context-check.py:567` forbids seats reading `content` or printing
     `errorMessage`; plan's `yielded` requires scanning `content`, and `last_error` prints a redacted line.
   - `mori-shokunin/tools/mori-seat-terminal.py:29-40,582` never materializes `errorMessage`; plan's redaction
     (24+ char alnum runs → `<redacted>`, 120 chars) is a third, weaker rule beside mado's three fixed patterns.
4. **Adjacent consumers exist:** `souji-shokunin/census/round-43/records/seat-terminal-evidence.json` (68 rows,
   hand-read `terminal{stopReason,provider,model,errorMessage}`, raw error text) and
   `kotodama-shokunin/reports/round-88/provider-deaths.json` (4 dead seats, raw `error`). Both are exactly what
   wave mode emits, produced by hand. `kama-shokunin/LOG.md:196-201` measured `resolvedModelIsFallback:false`
   through nine capacity failures — supports computing `fallback` from `answered ≠ captured`.
5. **Motivating evidence reproduced beyond the cited seat:** of the 12 r91 seats, **4** answered from a model
   other than the captured route (`K91CriticA`, `K91CriticB`, `K91Reviewer`, `K91Scout`), not just `K91Scout`
   (`receipts/r91-route-vs-inline.txt`).
6. **Province:** in scope as an instrument (`kumitate-shokunin/PROVINCE.md:15`, "The lane's own instruments
   `scripts/*.mjs`"), but the read surface conflicts with `PROVINCE.md:16` and `:57` ("member **content** stays
   out of scope … readdir + lstat only"). The lane's registered gate already reads those transcripts
   (`SKILL.md:636`), so the stale sentence predates C1; `plan.md` schedules no province amendment
   (`grep -i province plan.md` → none). Routed: the L1 owes a dated amendment or a citation of `SKILL.md:636`.
7. **Candidate:** no `K92ExecTool/READY` at 15:52, so no attack performed. Interim bytes
   (sha256 `3b8b6ce0…2608`) import only node builtins and name no sibling tool, no `round-92`/`oracle92`/`probe92`
   string (`receipts/grep-candidate-interim.txt`); final bytes may differ.

## Ruling

No sibling owns this: in-lane instrument work that duplicates no sibling tool, overlaps only the lane's own
`inline-dispatch-evidence` on `captured` + a dead/done verdict, and is adjacent to mori/mado/souji/kotodama/kama;
the two same-field contradictions and the province wording are routed, not resolved here.
