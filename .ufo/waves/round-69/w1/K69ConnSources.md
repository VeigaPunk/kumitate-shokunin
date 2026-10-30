VERDICT: All 16 MCP-family rows are tier A with distinguishable scopes; adding S214–S216 introduces no W04 warning, but carrier diversity must not be described as independent authority.

## Evidence
- Canonical freeze: `9401d8655970d542b81d318bdad558d6dea39397`; plan `.ufo/waves/round-69/plan.md:106-150` assigns mirrors to origin authentication, not new protocol semantics.
- Axes: coverage frontier (C2), operability (C1); the frozen plan forbids harm to either (`plan.md:32-39`). This proposal targets coverage quality without changing runtime behavior or C1.
- Executed: `python /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/build/K69ConnSources/scan.py` — exit 0. It snapshots current SOURCES, runs the fleet census on scratch copies with and without the three mirror rows, retains receipts, and deletes its scratch in `finally`.
- Saved receipt: `.ufo/waves/round-69/build/K69ConnSources/census-receipt.txt:1-24`. Both census commands returned `exit=0`; their W04 sets were identical:
```text
file	W04	S034 duplicate url stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics across scopes
file	W04	S068 duplicate url github.com/can1357/oh-my-pi/tree/45c35e40c46166dc726ccc52f5d27f40f2449f99 across scopes
file	W04	S084 duplicate url infection.github.io/guide across scopes
file	W04	S095 duplicate url raw.githubusercontent.com/containers/bubblewrap/v0.13.1/bwrap.xml across scopes
file	W04	S123 duplicate url docs.langchain.com/oss/python/langgraph/checkpointers across scopes
file	W04	S126 duplicate url docs.temporal.io/encyclopedia/detecting-activity-failures across scopes
```
- Receipt `:25`: `family_rows=16`; `:42`: `observed_sources_sha256=7d33553d8c091c594b97b4f7461c461eddb469c7aa06b42af157321d88c770a1`.
- Persistent snapshot `.ufo/waves/round-69/build/K69ConnSources/SOURCES-observed.md:153-168` is the evidence for row contents; no ephemeral scratch path is an evidence target.
- S201–S206 split revision constant, lifecycle, change history, handshake, second client, and HTTP header behavior; S209/S212 distinguish release tags despite identical captured SSE bytes. S210 gives transition policy, S213 dates its Final transition. These are not interchangeable scopes.
- S207/S208/S211 describe published registry/policy/compatibility semantics; S214/S215/S216 explicitly describe commit-pinned upstream carriers for those respective rows. All are A. Mirror URLs differ from site URLs in hostname, path and commit pin; the census normalizes URL spelling, not conceptual identity (`/home/vgpnk/Projects/shokunin/scripts/sources-census.sh:600-605,643-649`).
- S214 has kind `code`, S215/S216 `docs`, whereas S207/S211 have kind `spec`. This is a descriptive classification inconsistency, not a demonstrated tier error or census failure. An `.mdx` suffix does not itself imply implementation code.
- Local mirror `.ufo/waves/round-69/build/K69ExecCaptureDraft/deprecated.mdx:19-20` explicitly says: “This registry is a derived view kept consistent with the per-feature deprecation notices and changelog entries, which are the normative records.”

## Findings
1. **K69ConnSources-1 — advisory; attacks conflation of authenticated carriers with independent semantic authority.** No new W04 exists: six warnings before and after. Distinct retrieval URLs support M11's provenance comparison but do not make two copies of the same upstream registry independent normative sources. S214's `code` label also must not be read as evidence of executable implementation behavior. Reproduce: run the saved `scan.py` command above; inspect the persistent snapshot at lines 159–168 and local mirror at lines 19–20.

### One bounded proposed move
Add this paragraph immediately after the knowledge entry's Capture origin bullets (proposal only; no integration performed):

> S214–S216 authenticate commit-pinned upstream carriers for S207, S208 and S211, respectively; they do not add independent policy authorities. S214 mirrors a derived registry whose normative records are the per-feature notices and changelog entries. Distinct carrier URLs explain why this pairing adds no duplicate-URL census warning; they do not establish independent semantic corroboration.

- Affected axis: coverage frontier improves by making the exact evidentiary increment explicit. Operability preservation is [INFERENCE]: no commands, source IDs, captures, runtime paths, or gate predicates change.
- Runtime effect: none proposed; retain the S201/S205 two-client distinction and S209/S212 release distinction.
- Contract effect: retain mirror pairing and tier A within origin-authentication scope; never relax M11 or remove original site rows.
- Substrate effect: retain all six carrier URLs and captures. Do not normalize mirror URLs into site URLs merely to represent their conceptual equivalence.
- Verification effect: current census does not test authority independence. Integration owner should inspect paragraph placement outside the bullet list, then run unchanged M69 and archive M9 checks on the integrated revision.
- Risks/contradictions: “independent carriers” is compatible with shared upstream authorship; “independent policy authorities” is not established. The paragraph must not imply mirrors eliminate M11's live-network dependency. Registry rows are append-only except status/recheck/used-by (`SOURCES-observed.md:7-8`), so no retrospective kind/scope rewrite is proposed.

## Artifacts
- `.ufo/waves/round-69/build/K69ConnSources/scan.py`
- `.ufo/waves/round-69/build/K69ConnSources/SOURCES-observed.md`
- `.ufo/waves/round-69/build/K69ConnSources/census-receipt.txt`
- `.ufo/waves/round-69/w1/K69ConnSources.md`

## Limits
- Census only was explicitly exercised; no live fetch, capture equality, full M69, ledger counter, implementation runtime, or final archive validation was run.
- Scratch fixtures link existing used-by targets read-only; E11 confirms their existence, not that content answers the cited claim. Baseline removes only S214–S216 from the same snapshot, not an independently reconstructed historical checkout.
- Source rows were already present when observed. Conclusions bind the saved snapshot, not concurrent later integration.
- No tools installed, no frozen bytes changed, no source rows edited, no git state mutated. Scratch deleted by the executed driver's finally block.
- Self-evaluation: accuracy 4 (origin network untested); completeness 4 (final integrated archive outside assignment); clarity 4 (dense report); actionability 5 (exact paragraph and reproducer); conciseness 4 (full warnings retained for audit). Mean 4.2. Improvements are final integrated M69 verification and live origin checks by the integration owner; user agreement remains unobserved.
