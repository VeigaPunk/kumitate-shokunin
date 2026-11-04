# C1 contract review

Axes: operability and coverage:kimi-layer. Recommendation only; no admission or integration.

## Routed frozen-counter defect (medium)
`probe78-c1.mjs:187` selects `AXES_DRIFT` by `term === 'coverage_kimi'`. The canonical `compareAxes()` emits `term: axis` and `key: term` (`scripts/proxy-check.mjs:1299–1306`), hence the relevant existing diagnostic is `term=coverage:kimi-layer key=coverage_kimi`. The frozen arm checks the wrong field. Updating existing observable diagnostics just to pass this arm is a compatibility change, not evidence that the old diagnostic was wrong. Counter unchanged; routed to coordinator.

Commands: read frozen probe lines 182–189; read canonical proxy lines 1289–1307. Text evidence, not semantic-reference proof: `xd://lsp` is not mounted (read request returned `No such tool`). References, definitions and diagnostics through LSP are therefore unavailable.

## Formula analysis
Frozen formula replaces `K_sections/K_members` with `(K_members-K_findings)/K_members`; it does not multiply both factors. One absent member both reduces live `K_members` and supplies a finding, but does not incur two independent multiplicative penalties. With 54 members/1 finding the score is floor(10*53/54)=9; 55 members/1 finding gives floor(10*54/55)=9. Losing an entire counted directory can remove many members but yield one finding, so this is findings-density, not fraction of individual member slots that are healthy. Findings can outnumber members (root strays are findings, not members); whether the implementation clamps at zero must be checked on its actual patch. The frozen formula does not specify that clamp.

`K_findings` is a census-derived term with pre-registered semantics, not intrinsically a fitted constant. Its declaration in the stanza is useful only when recomputed from the imported decision and compared; a literal 0 alone would not meet the claim. Census bugs can change the derived value by design, but script pin drift and stanza/axis comparisons must expose unacknowledged byte/value changes. Those mechanisms do not constitute an independent correctness oracle for a deliberately re-pinned census bug.

Historical code requires `K_sections` separately; frozen C1 deliberately removes it from score arithmetic but must retain term drift detection. Honest saturation now means no findings plus yes registry rows, not complete note coverage by score arithmetic alone.

No tools installed or updated. No tracked files, counters, git state or fleet files changed.
