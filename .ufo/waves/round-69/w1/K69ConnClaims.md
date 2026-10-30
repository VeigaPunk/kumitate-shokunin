VERDICT: Static cross-claim scan finds identical normalization but divergent token guards; propose one independent paired boundary-vector corpus, without changing frozen predicates.

## Evidence
- Frozen assignment: `.ufo/waves/round-69/plan.md:34-39` names operability and coverage:script-layer/runtime-layer/kimi-layer; coverage is retired and no axis may be harmed. C1 advances operability; C2 advances the coverage frontier. Adjacency here is shared located-quote evidence, not a new claim.
- Freeze identity supplied by assignment: `9401d8655970d542b81d318bdad558d6dea39397`; not independently re-resolved.
- Read operations (executed, repository-relative paths below resolve under `/home/vgpnk/Projects/shokunin/kumitate-shokunin`):
  - `read .ufo/waves/round-69/probe/ledger69-probe.mjs:126-135,240-273`
  - `read .ufo/waves/round-69/probe/deprec69-probe.mjs:140-160,254-301,505-540`
  - `read .ufo/waves/round-68/build/K68ExecToolV2/routed-ledger.mjs:78-95,294-338`
- Verbatim selected source output:
  - L69:134: `const nwords = (s) => s.trim().split(/\s+/).filter(Boolean).length;`
  - Reviewed tool:87: `export const words = (s) => norm(s) === '' ? 0 : norm(s).split(' ').length;`
  - M69:156: `if (!q || !/\w/.test(q)) return 0;`
  - L69:271: `if (!wb(m[3], AL[ln - 1])) { bad.push(`${r.id}:answer-quote-not-at-exact-line`); continue; }`
  - M69:531: `else if (h !== pin.sha256) bad11.push(`${id}:origin-sha-mismatch`);`
- Executed directory creation: `mkdir -p /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-69/build/K69ConnClaims` → no output, exit 0.
- No counter, tool selftest, live fetch, or fixture runtime was invoked; therefore no new HELD/UNMET verdict or runtime exit code is claimed. Vector outcomes below are [INFERENCE] from inspected expressions, not exercised receipts.

## Findings
1. **K69ConnClaims-1 — Medium: normalization-equivalence is not evidence-chain equivalence.** Attacks the assumption that identical `norm()` functions imply compatible quote acceptance. All three inspected normalizers have the same replacements (L69:126-133, M69:140-147, reviewed tool:78-85), but their callers differ. Reproduction by inspection: repeat the three `read` selectors above and compare the cases in `build/K69ConnClaims/paired-vectors.json`. This is not an observed failure of the integrated revision.

### C1 × C2 pattern table
| Shared class | C1: where it bites first / catching arm | C2: where it bites first / catching arm |
|---|---|---|
| Physical line vs normalized text | Insert a blank line before a cited answer while retaining its `:line`: tool `ANSWER_DEAD`, L3 `answer-quote-not-at-exact-line` (tool:336-338; L69:269-271); L4 explicitly includes shifted-answer (:369). Both index `ln - 1`, so no off-by-one discrepancy was found. | M4/M5 locate across the whole normalized body; whitespace movement alone need not fail them. M3 catches an unrecomputed capture pin; with a recomputed pin but unchanged origin, M11 catches byte mismatch (:518-531). C2 has no exact-line contract, so this asymmetry is intentional. |
| Raw vs normalized word budgets | `alpha&nbsp;beta gamma` has raw 2 words, normalized 3: tool length accepts, L3 length rejects. Conversely `alpha <b> </b>` has raw 3, normalized 1: tool rejects; L3 length and containment can accept against `alpha`. L2 can expose the tool rejection; L3 independently rejects the first form. L4's listed mutants contain no entity-budget case (L69:365-371). | M4 counts raw words (:265-266), matching L3 rather than tool; M4/M5 containment normalizes. M11 authenticates bytes, not meaningful token count, and cannot repair this semantic mismatch. C2 has no three-word minimum; do not import C1's minimum into C2. |
| Curly quote content vs container grammar | Curly inner apostrophes/double quotes normalize to straight forms (L69:131; tool:83). Answer syntax still requires straight enclosing `"` (L69:263; tool:310); wrapping a field with smart quotes is not made equivalent by later normalization. L3 answer-format/tool ROW_MALFORMED catch answer-container errors. | Inner curly quotes normalize (M69:145), but `- S### — “text”` is not parsed by the straight-container regex (:259). M4 bullet-count/per-row checks may catch the loss; an extra unparsed bullet need not fail if required valid bullets remain. M5 only sees parsed bullets. |
| Unicode word guard / boundary | `甲 乙 丙` is nonempty and three words; C1 wb can match it. ASCII boundaries also admit `alpha beta gamma` inside `éalpha beta gammaé` (L69:135). No dedicated Unicode mutant appears in L4's list. | The same CJK-only quote fails M4 wb and M5 zero-parseable-quote because `\w` is ASCII (:156,298), whereas the embedded accented-boundary case can pass. M11 does not catch an authenticated but lexically weak match. These are explicit cross-contract differences, not proof that either frozen verdict must change. |
| Repeated/relocated quote, same authenticated carrier | A quote in a second routed item triggers L3 uniqueness and tool QUOTE_AMBIGUOUS (:252-253; tool:323-325). Repetition within one item is not separately counted. Exact-line answers still prove location, not adequacy. | M4/M5 require at least one location, not uniqueness (:149-159,297-299). A digest-authenticated page may repeat or contextualize the quote; M11 cannot prove relevance. Plan:100-104 and :162-166 explicitly reserve adequacy/meaning for non-author judgment. |

### One bounded proposed move
Add the supplied paired boundary vectors as an **independent expectation corpus** for evidence authors and later-round verifier work, retaining per-arm expected outcomes rather than forcing one universal pass/fail answer. It covers line shifts, entity/markup word budgets, Unicode content, and container syntax in one small artifact. Do not share an executable normalizer between subject and counter: common-mode defects would erase independent verification.

Affected axes: [INFERENCE] operability improves through predictable authoring and fewer tool/counter disagreement cycles; coverage-frontier evidence gains explicit lexical limits. Runtime-layer and kimi-layer are unchanged because this is a review artifact, not a runtime modification. No axis score or claim verdict is assigned.

Second-order surfaces:
- Runtime: no production execution or network behavior changes; future checks can consume the vectors offline.
- Contract: preserve exact-line C1 versus whole-carrier C2, C1 uniqueness versus C2 existence, and distinct minimum-word rules. These contradictions must remain visible, not averaged away.
- Substrate: bytes and line numbers remain revision-bound; normalization must never replace M11's raw-byte digest authentication.
- Verification: retain independent implementations and label expected-by-inspection outcomes separately from real receipts. Frozen L69/M69 stay untouched; any predicate change belongs to a later round (plan:90-94,154).

Risks: treating this corpus as a common validator would reduce independence; making C2 unique/line-bound or accepting normalized budgets in frozen L3 would silently change the claim. Avoid both. ASCII-only authoring can reduce present friction, but is not a semantic fix for Unicode boundaries.

Verification proposed, **not run**: a later-round owner should evaluate each vector against isolated pure predicates and the reviewed tool, then exercise exact-line shifting on a conforming C1 fixture. For C2, separate quote-only equivalence from digest equality using an unchanged authenticated carrier and a whitespace-edited capture. Record per-arm outcomes; do not infer full HELD from these local cases. Run canonical frozen counting commands only on the integrated revision if authorized; never rewrite this round's expected outcomes to gain HELD.

## Artifacts
- `.ufo/waves/round-69/w1/K69ConnClaims.md`
- `.ufo/waves/round-69/build/K69ConnClaims/paired-vectors.json` — seven proposed vectors; expected outcomes explicitly static.

## Limits
- Static read-only analysis of frozen counters and the assignment-designated reviewed v2 draft; no integrated-revision inspection, live capture verification, or behavioral tests.
- No scratch was allocated, so none remains to delete. No installs, git/jj mutations, subject edits, or frozen-byte edits.
- Self-evaluation: accuracy 4 (static outcomes not exercised); completeness 4 (requested classes covered, live behavior untested); clarity 4 (per-arm distinctions require dense table); actionability 4 (vectors need an authorized future runner); conciseness 4 (dense evidence table). Mean 4.0; no score claims runtime proof. Highest-value improvement is independent execution of the supplied vectors, outside this connector's no-runtime remit.
