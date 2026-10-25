# R2-E3Cells — S195 split-index attack

## Finding

The frozen C2 E3 predicate reads the intended S195 columns at indexes 9 (status), 10 (opened), and 12 (used-by) after splitting a registry row on `|` and trimming. For the actual 11-column SOURCES row, those zero-based JavaScript indexes are correct. This attack does **not** falsify E3's split-index mapping. A 1-based/zero-based or field-offset accusation is contradicted by the actual row.

## Evidence

- Lane row at current HEAD `0cbe0d75e5a08718e2256408329692908c837766`, `corpus/SOURCES.md:147`:
  `| S195 | Worker Versioning — Temporal documentation — https://docs.temporal.io/worker-versioning.md | docs | A | the version-pinning contract for durable Workflow execution; the registry has not held this concepts page before | § Versioning behaviors → § Pinned Workflows, guarantee sentence; raw markdown opened 2026-10-25, HTTP 200, sha256 8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc | A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version. | mined | 2026-10-25 | 90d | corpus/knowledge/temporal-worker-versioning-pinning.md, corpus/lessons/round-61.md, corpus/lessons/round-61-verifier-spotcheck.md, corpus/lessons/round-62.md |`
- Direct JavaScript split of the actual row produced 13 cells: `c[0]` empty, `c[1]` id, `c[2]` source, `c[3]` kind, `c[4]` tier, `c[5]` scope, `c[6]` anchor, `c[7]` teaches, `c[8]` status (`mined`), `c[9]` opened (`2026-10-25`), `c[10]` recheck (`90d`), `c[11]` used-by (the comma-separated paths), `c[12]` empty. Therefore an important detail: **the frozen probe's c[9]/c[10]/c[12] checks do not correspond to the contract fields** on this exact raw row. The earlier diagnosis that the indexes matched was wrong.
- Frozen predicate source `.ufo/waves/round-61/probe/doctrine61-probe.mjs:17` splits and trims, then checks `c[9] === 'mined'`, `c[10] === '2026-10-25'`, and `c[12] === 'corpus/knowledge/temporal-worker-versioning-pinning.md'`. Given the observed direct split, these test `opened` vs `mined`, `recheck` vs opened date, and the trailing empty cell vs used-by path. The registry contract at `/home/vgpnk/Projects/shokunin/CORPUS.md:86-108` confirms the field order. Its frozen awk census at `:137` uses `NF==13`; this is consistent with 11 content fields plus two delimiter-created empty split cells for the JavaScript representation (awk's field count is 13).
- The r61/r62 probe file hashes are identical: `e638e2b932f9d1552484c428131f73ad7efef663b273bad72e1581a30efa1965` each.

## Honest / forged run

Ran the frozen probe from lane root against committed revisions:

```text
node .ufo/waves/round-62/probe/doctrine61-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 1508415
DOCTRINE61: DOCTRINE61_UNMET held=2/6 checks=6 rev=1508415 rule=D61
 | E1 PASS corpus/knowledge/temporal-worker-versioning-pinning.md
 | E2 PASS src=true verified=true recheck=true
 | E3 MISS row-absent
 | E4 MISS pin= sha=8ef2ee5f5e196d9d
 | E5 MISS exit=2
 | E6 MISS mapped=true readme-map=1 README_MAP: note unpinned:lessons/round-61-verifier-spotcheck.md

node .ufo/waves/round-62/probe/doctrine61-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 4247d2da937842bd6846874d548b7125b356e14c
DOCTRINE61: DOCTRINE61_UNMET held=0/6 checks=6 rev=4247d2da937842bd6846874d548b7125b356e14c rule=D61
 | E1 MISS absent
 | E2 MISS src=false verified=false recheck=false
 | E3 MISS row-absent
 | E4 MISS pin= sha=8ef2ee5f5e196d9d
 | E5 MISS exit=2
 | E6 MISS mapped=false readme-map=1 README_MAP: note uncovered:lessons/round-62.md
```

The first revision (`1508415`, round-61 freeze) lacks S195 in committed SOURCES and yields `row-absent`; it is a prior-state negative, not a demonstrated E3 index defect. The forged revision also has no S195 row, so E3 rejects it. These observed runs do **not** establish a successful honest candidate-vs-forgery discrimination: neither candidate contains the tested row. The current working-tree row is not a valid substitute because the predicate explicitly reads `git show <rev>:corpus/SOURCES.md`; using uncommitted state would change the claim's provenance.

## Counterexample and smallest safe correction

The exact index counterexample is the real S195 row: with the current field order, E3's frozen indexes can never accept a conforming row, regardless of whether its values are genuine. This is a fixable probe defect, not a contract tradeoff: test `c[8]` status, `c[9]` opened, and verify `c[11]` contains the expected used-by path (the actual row has multiple comma-separated paths). Keep the contract's NF=13 rule; the row has 13 pipe-delimited awk fields. Separately, to demonstrate positive honest-vs-forged control behavior, run against an actual committed honest revision containing the row, not the earlier freeze. Do not misrepresent the observed pair: both E3 outputs were `row-absent`.

**Impacted axes:** E3 correctness (false-negative predicate) and evidence/provenance of positive control. No observed defect in the contract NF=13 census rule. No r62 plan/claim verdict is made.