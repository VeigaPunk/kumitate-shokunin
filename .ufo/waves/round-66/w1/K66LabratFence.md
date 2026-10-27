VERDICT: CONFIRMED — routed-ledger.mjs v1 `routedItems()` counts column-0 `- ` lines inside a fenced code block within a routed section as items (2 real + 2 fenced lines → 4 items), the frozen counter's `items66` shares the identical blind spot, and no real routed section in rounds 40–65 currently contains a fence, so the defect is latent but real and triggers the plan's ratchet ("a non-item counted").

## Evidence

Hypothesis: tool v1 counts `- ` lines inside a fenced code block within a routed section as items.

Fixture spot-check (routed section: one real item, then a fenced block with two `- ` lines, then one real item) run through the tool's exported `routedItems()` and the counter's `items66` (extracted verbatim from the frozen probe, no hand transcription), driver: `node probe.mjs` (copy in build dir):

```
=== TOOL routedItems ===
{
  "found": true,
  "items": [
    "- real item alpha\n",
    "- fence item one",
    "- fence item two\n```\n",
    "- real item beta\n"
  ]
}
TOOL_ITEM_COUNT 4
=== COUNTER items66 ===
[ "- real item alpha\n", "- fence item one", "- fence item two\n```\n", "- real item beta\n" ]
COUNTER_ITEM_COUNT 4
```

Root cause (static): `routedItems` iterates section lines and classifies each solely by `/^(?:[-*+]|\d+[.)])\s+\S/` (list) or `/^\|/` (table) — there is no fence state tracking. `grep -n '```\|fence\|code block' scripts/routed-ledger.mjs` → no matches; the counter probe likewise has no fence handling (`ledger66-probe.mjs:67-104`).

Real-data sweep, fence containment inside routed sections (tool heading rule), rounds 40–65, all 26 sections:

```
round-40: section lines 245..265 | fenceLines inside: [] | in-fence item-like lines: []
… (identical empty result for every round 40..65) …
round-65: section lines 69..78  | fenceLines inside: [] | in-fence item-like lines: []
```

Fence lines do exist in 6 files (r42, r49, r53, r54, r60, r61) but always before the routed heading, never inside the section.

L4 held-out harness mutant list (`ledger66-probe.mjs:238-242`): good, drop, quote-swap, quote-decoy, answer-wrong, answer-ledger, answer-eof, dup, ordinal, nested-as-item, prose-as-item, long-quote, no-section, ledger-absent — no fenced-block mutant; the counter cannot generate this case by construction.

## Findings

1. **K66LabratFence-1 (severity: medium; attacks: C1 tool v1 section rule; ratchet trigger).** `routedItems()` counts in-fence `- ` lines as items. Per `plan.md`'s declared ratchet — "a wave finding that the tool mis-reads a real section (an item missed, a non-item counted, ...) is fixed in the tool with a new selftest case — a strengthening, never a relaxation" — this is a "non-item counted" finding. Suggested fix for the L1: track fence state (toggle on `/^\s*```/` at column 0 within the section) and skip item classification while inside a fence; add a selftest case with a fenced block holding `- ` lines asserting item count excludes them. Repro: `node .ufo/waves/round-66/build/K66LabratFence/probe.mjs` (prints TOOL_ITEM_COUNT 4 for a 2-real-item fixture).
2. **K66LabratFence-2 (severity: info; attacks: counter independence claim).** The frozen counter's "independent" parser `items66` has the identical blind spot (same 4-item result on the fixture), and L4's mutant set has no fence mutant — so L2/L3/L4 cannot flag this class even in principle. No frozen file was patched; reported per the freeze rule. L2 at base is unaffected because tool and counter agree on all real sections.
3. **K66LabratFence-3 (severity: low; attacks: blast radius).** Real routed sections in rounds 40–65 contain zero fenced blocks (26/26 empty containment results), so no live item count is currently wrong; the defect is latent and bites the first routed section that embeds a fenced block (e.g. a repro transcript) with `- `/`* `/numbered lines at column 0.

## Artifacts

- `.ufo/waves/round-66/build/K66LabratFence/probe.mjs` — fixture + tool/counter comparison driver (re-runnable).
- `.ufo/waves/round-66/build/K66LabratFence/probe-output.txt` — verbatim output (exit 0).
- `.ufo/waves/round-66/build/K66LabratFence/contain.mjs` — fence-in-section containment checker.
- `.ufo/waves/round-66/build/K66LabratFence/contain-output.txt` — verbatim 26/26 empty results.

## Limits

Checked only column-0 list markers inside column-0 fences; indented fences, fence-like lines inside table rows, and `- ` with empty text (`-` + spaces only) were out of scope. Did not run the full `ledger66-probe.mjs` counter (hypothesis was scoped to the parser); did not inspect spot-checks before round 40 (claim counts 55–65; sweep widened to 40 per seat spec). No tools installed; scratch deleted.
