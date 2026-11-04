# Draft: `corpus/README.md` coverage-map rows
#
# Paste-ready rows for the `## Coverage map` table of corpus/README.md.
# Shape: 3 content cells, matching the table's own header
# (`| Entry | Covers | Primary sources |`) and all 219 existing rows
# (`awk -F'|'` → NF=5 on every one of them). These rows must be placed
# INSIDE the `## Coverage map` section, before the next `## ` heading:
# `node scripts/readme-map.mjs` now carries the R85-V12 section-membership
# arm, and a corpus row after `## Frontier` reads DRIFT `outside-map`.
#
# Both rows below REPLACE the rows the integrating seat already placed at
# corpus/README.md:255-256; adding a second row for the same path reads
# DRIFT `duplicate-row:`. The differences from the integrated rows are
# (a) the primary-source cells name the resolving lane-relative path form
# instead of the bare wave-relative form, and (b) the knowledge row names
# the v3 SOURCE digest that the round added.

| `knowledge/counter-receipt-source-binding.md` | Binding both halves of a counter answer to the bytes read: the v3 `SOURCE:` digest, generated run-time fixtures, the four frozen control classes, and the difference between a consistency check and an oracle | S247, S248, S249; `.ufo/waves/round-86/plan.md`, `.ufo/waves/round-86/probe/probe86-c1.mjs`, `.ufo/waves/round-86/controls/` |
| `lessons/round-86.md` | Round-86 source binding: the frozen 24-arm probe, the four control classes and their frozen scores, the S246 re-adjudication, the mined mistakes and the declared limits | LOG.md round 86; `.ufo/waves/round-86/plan.md`, `.ufo/waves/round-86/probe/probe86-c1.mjs`, `.ufo/waves/round-86/controls/` |
