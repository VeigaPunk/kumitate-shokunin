# Draft README-map additions

Insert into the existing lessons table of `corpus/README.md` (paths in this table are corpus-relative, matching precedent):

| `lessons/round-74-verifier-spotcheck.md` | Non-author round-74 spotcheck and routed corrections: proxy-pin erratum and receipt-header/exit provenance; inherited map gap repaired in round 75 | Round-74 closure; `.ufo/waves/round-75/open/maps-open.txt`; round-75 append-only erratum |
| `lessons/round-75.md` | Round-75 coverage:omp declaration/binding and origin-tip-drift capability claims, source Gate decisions, scoped assimilation-deferral mistake and routed repairs; verdicts as recorded in the lesson | LOG.md round 75; S224/S225; `.ufo/waves/round-75/plan.md` |

Repo-relative note surfaces represented by those rows:
- `corpus/lessons/round-74-verifier-spotcheck.md`
- `corpus/lessons/round-75.md`

The existing `.ufo/pins/readme-map.json` version-2 `covered` array uses corpus-relative strings, not hashes or `corpus/` prefixes. Add these entries in its established lexical location:

```json
"lessons/round-74-verifier-spotcheck.md",
"lessons/round-75.md"
```

Both were absent in the read window; do not duplicate an entry if another integration owner has already added it. Landing and close map verdict remain L1-owned, not asserted here. No row/covered tally is claimed by this draft.
