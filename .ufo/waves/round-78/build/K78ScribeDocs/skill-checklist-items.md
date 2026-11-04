# SKILL.md — two round-78 checklist insertions (not applied)

Append these under `## Verifiable checklist`; retain the existing command → accepted exit + verdict grammar. Both commands run from the lane root. These are unexecuted drafts.

- [ ] Kimi score live derivation (round 78; the proxy imports the census decision; inspect the live K terms and `K_findings`, not a second member table) — `node scripts/proxy-check.mjs --json | node --input-type=module -e 'let s=""; for await (const c of process.stdin) s+=c; const j=JSON.parse(s),t=j.terms; if(j.verdict!=="MATCH" || t.C1k!==5 || t.C1k_total!==5 || t.K_members!==55 || t.K_sections!==55 || t.K_findings!==0 || t.coverage_kimi!==10) process.exit(1); console.log("C78_K_DERIVATION: MATCH")'` → exit 0 + `C78_K_DERIVATION: MATCH`
- [ ] OMP shape receipt live comparison (round 78; host-bound, shape-only and non-scoring; a moved live root is a real DRIFT, never an accepted clean exit) — `node scripts/omp-census.mjs --compare .ufo/pins/omp-shape.json` → exit 0 + `OMP_SHAPE_COMPARE: IN_SYNC`

The live derivation item reads all six K terms from computed `terms`, not `terms.declared`. Parse errors fail the consumer; a non-MATCH body is rejected. The existing proxy strict item separately enforces strict pin checks. Keep the full frozen C1 probe for the chmod/missing/stray/anti-printer negatives; a clean-live checklist item does not replace those arms.

If the original list remains 37 at integration, the new total is 39; update the dated checklist introduction and stanza C only from the L1's final count. Neither checklist was run by this scribe.
