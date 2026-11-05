# K90Connector — sibling-overlap scan, round 90 (C1 receipt-bind v4)

Read-only. Writable: this directory and the w1 report only. No lane file and no sibling file was written; no git mutation; no scratch dir used (no artifact over 50 MB).

## Commands run

```
grep -rIl -i 'receipt-bind\|receipt bind\|zero-width\|U+200B\|U+FEFF\|U+200C\|U+200D\|U+200E\|U+00A0\|\bQ82\b\|blind scorer\|blind-scor' /home/vgpnk/Projects/shokunin/*-shokunin/corpus /home/vgpnk/Projects/shokunin/*-shokunin/PROVINCE.md   > hits-A-pattern.txt
grep -rIl 'invisible' ...                                                                                                                 > hits-B-invisible.txt
grep -rIn '\bCf\b\|format character\|ZWSP' ...                                                                                            > hits-C-cf.txt
grep -rIn -e 'receipt-bind' -e 'Q82' -e 'blind scorer' -e 'blind-scor' -e 'zero-width' ...   (sibling lines only)
grep -rIn -e 'U+FEFF' -e 'U+200B' -e 'U+200C' -e 'U+200D' -e 'U+00A0' -e 'U+200E' */corpus */PROVINCE.md   (excl. /live/, kumitate)
grep -rIn -i 'blind' <corpus of 18 sibling lanes> | grep -i 'scor|oracle|grader|judge|capabil|candidate'   > hits-E-blind-scorer.txt
grep -rIl -i 'kumitate' */corpus */PROVINCE.md   (sibling references, counted per lane)
python3 regex probe of tameshi tools/receipt-bytes-bind.py SHA_RE against a prefixed field line (read-only, no file write)
awk -F'|' 'NR>1{c[$5]++;n++} END{...}' hits.psv          (classification counts below)
```

Raw census (lines, before classification): pattern A 186 files; `invisible` 1696 lines (overwhelmingly generic prose and minified JS; not used as evidence); `Cf|format character|ZWSP` 31 lines; blind-scorer terms 274 lines (mostly oracle prose in unrelated domains). Kumitate's own files are excluded from every sibling count.

Note on the "invisible" grep from the brief: as written it matches 1696 lines, so it cannot be classified line by line. The narrower codepoint terms (U+FEFF 9 files, U+200B 4, U+200C/U+200D 1 each, U+00A0 12, zero-width 20) and the receipt-term grep are the ones classified below.

## Classification counts (53 table rows; a row may cover several lines)

| Classification | Rows | Meaning |
|---|---|---|
| OWNED-BY-SIBLING | 32 | sibling lane's own instrument, rule or ground on the same class |
| REFERENCE | 8 | cites kumitate or a kumitate artifact |
| QUOTE | 2 | quotes an external source (RFC 8259) |
| LABEL-COLLISION | 6 | another lane's "Q82"-numbered rule; different claim |
| NONE | 5 | incidental prose or unrelated format-character use |

Per-lane detail is in the table below (generated from `hits.psv` by the awk command above).

## Verdict

**No sibling already does this round's claim.** The claim is: kumitate's `scripts/receipt-bind.mjs` v4 recognises close-receipt field lines (`cmd=`, `rev=`, `tool_sha256=`) after stripping leading U+200B/U+200C/U+200D/U+200E/U+00A0/U+FEFF, so a hidden duplicate field is caught. No sibling instrument does this for kumitate's receipt format.

Same-class overlaps, each owned by its own lane:

1. **tameshi `tools/receipt-bytes-bind.py`** (round 79, selftest row `receipt-bind-selftest`, `tools/selfstate-freshness.json:322`). It binds a receipt's recorded `tool_sha256` to the committed bytes at the named revision: the same claim *class* on tameshi's own receipt-header convention. Its header regex is anchored at column 0 (`SHA_RE`, line 83) and its malformed-header count is a raw `^# name:` match (line 150). Probe run here: `^# tool_sha256:[ \t]*([0-9a-f]{64})[ \t]*$` with `re.M` matches a plain field line but returns False for every one of U+200B, U+200C, U+200D, U+200E, U+00A0 and U+FEFF prefixes. So tameshi's binder has the same invisible-prefix blind spot as v3. [INFERENCE] a prefixed duplicate header would be invisible to both the match and the raw count; I did not construct that receipt end-to-end. This is a cross-domain observation: report to tameshi via the orchestrator, do not absorb or edit.
2. **kake `scripts/instrument_receipts.py`** (kake PROVINCE:498-500). Binds each gate-registry instrument to a `{sha256, bytes, selftest_mode}` receipt at a named revision. Same family, kake's own registry. kake's PROVINCE:505-507 names souji `TOOL_SHA256` and tameshi receipt-revision as adjacent, "stay with those lanes". Not opened by me: souji's `TOOL_SHA256`.
3. **kasegi r46/r47 gates** (`corpus/instruments/r46-f29-gate.py:152-153,198`; `r47-f30-gate.py:25,170-171,216`). Strip zero-width characters, then count rows against a raw "anywhere" count; a zero-width ghost row is a defect. Same technique as v4, kasegi's domain, method precedent only.
4. **Normalizers that strip U+200B–U+FEFF in their own domains**: chousa `tools/quote-reopen.py:76-79` and `corpus/evidence/round29/claims.md:112`; kagi `corpus/rendered-text-v1.py:38,139`; kake `scripts/source_recheck_selftest.py:554-556`; kotodama `tools/gates/lexicon-coverage-audit.py:541`. None binds a receipt to a tool sha256 at a command name.

Kumitate's own K89-V1 (`corpus/lessons/round-89-verifier-spotcheck.md:127`; `SCORECARD.md:4395`) is the lane's own routed defect; no sibling's defect report names it.

### Blind-scorer discipline

No sibling owns a cross-lane rule that a capability scorer may not hand the candidate its own fixture identity. Each lane applies its own version:

- tsukuroi `corpus/QUALITY.md:161-162` (its Q82): a counter that builds its own fixtures also scores code outside them. Also `:167` (its Q85, R38-Q82-LEAK): arms that read leaked paths beat the counter.
- chousa `corpus/QUALITY.md:1030-1032` (135-137): source-blind order oracle; a matrix that names cases in fixture commits "hands over the answer key".
- kaidoku `corpus/QUALITY.md:77` (its 67): structure-blind replay keyed on invariant fixture identity.
- kengaku `PROVINCE.md:614-641`: grader cheat-probes (cheat-always-equal and similar) for benchmark graders.
- kake `PROVINCE.md:567-587`: oracle-free matrix; "the matrix alone owns the oracle".

**"Q82" is a label collision across the fleet.** Other lanes use Q82 for unrelated rules: souji `QUALITY.md:202` (calibration base-rev kill arm), tameshi `QUALITY.md:2341`, chousa `:866`, mado `:411`, mori `:378`, tabi `:483` (numeric 82 in each). Kumitate's Q82 (`corpus/QUALITY.md:1411`, "a capability scorer may not hand the candidate its own fixture's identity") is the only one that names capability-scorer fixture identity. Cite it as "kumitate Q82" everywhere.

### Ruling for this round

The round's claim is **kumitate-owned**: operability of kumitate's own instrument, `scripts/receipt-bind.mjs`, on kumitate's own close receipts. Basis:

- `scripts/*.mjs` is named as the lane's own instrument band at `kumitate-shokunin/PROVINCE.md:15` (core).
- The K89-V1 defect is recorded in kumitate's own SCORECARD and lessons.
- The blind-scorer rule (kumitate Q82) is kumitate's, and no sibling claims it.

Not cross-domain for the instrument itself. Cross-domain observations, reported and not absorbed: (a) tameshi's `receipt-bytes-bind.py` shares the prefix blind spot (item 1 above); (b) the "Q82" label collision (no action needed beyond lane-qualified citation).

### Other checks

- `kengaku-shokunin/PROVINCE.md:345` names kumitate's `bind-oracle.mjs` (proves binds from inside a `cap-run` child). Different instrument from `receipt-bind.mjs`; no overlap. Classified REFERENCE.
- Sibling lanes that cite kumitate: 17 lanes and 307 files (`grep -rIl -i kumitate */corpus */PROVINCE.md`, a file count, not a line count). Only the substantive citations are in the table below as REFERENCE. Named kumitate artifacts that are cited: `cite-check.mjs`, `round-gate.mjs`, `anchor-truth.mjs`, `counter-rerun.mjs`, `bind-oracle.mjs`, `cap-run.mjs`, and the `kumitate r68` answer-key rule (chousa `round-75.md:106`).
- Stray directory `/home/vgpnk/Projects/shokunin/kumitate-shokinin/` (typo name): contains only a nested `kumitate-shokunin/`, no `PROVINCE.md`, and zero matches for `receipt-bind`, `zero-width`, `U+FEFF` or `U+200B`. Not a lane. Not touched.

## Hit table

Columns: lane | file | line(s) | term | classification | basis. Generated from `hits.psv` below.

| lane | file | line(s) | term | classification | basis |
|---|---|---|---|---|---|
| tameshi | tools/receipt-bytes-bind.py | 83,95-96,150 | receipt tool_sha256 vs committed bytes at named rev | OWNED-BY-SIBLING | same claim class (receipt-recorded tool sha must exist in revision bytes); anchored regex misses U+200B/C/D/E, U+00A0, U+FEFF prefixes (probe-verified here); owner tameshi |
| tameshi | tools/selfstate-freshness.json | 322 | receipt-bind-selftest row | OWNED-BY-SIBLING | self-state row whose instrument path is tools/receipt-bytes-bind.py |
| tameshi | corpus/lessons/round-80-verifier-spotcheck.md | 170 | receipt-bind verifier 10->13 arms | OWNED-BY-SIBLING | own verifier arms, QUALITY 76-77 |
| tameshi | corpus/lessons/round-81.md | 36 | receipt-bind-selftest pin audit | OWNED-BY-SIBLING | own selftest pin |
| tameshi | corpus/lessons/round-32.md | 142 | U+200B header shape D rejected by v2 | OWNED-BY-SIBLING | tameshi header parser already rejects a U+200B-prefixed header shape as a control |
| tameshi | tools/command-binding.py | 1-17 | required-command receipts vs digest-pinned bundle | OWNED-BY-SIBLING | adjacent: binds command receipts, not tool_sha256 of close receipts |
| tameshi | tools/receipt-commit-bind.py | 2-12 | commit message receipt names bound to commit bytes | OWNED-BY-SIBLING | adjacent: commit-message binding |
| tameshi | corpus/lessons/round-73.md | 68 | U+FEFF in JSON text (RFC 8259 quote) | QUOTE | quoted source |
| kake | PROVINCE.md | 498-507 | instrument sha256 receipt bound at named revision | OWNED-BY-SIBLING | scripts/instrument_receipts.py binds gate-registry instruments to {sha256,bytes,selftest_mode}; PROVINCE names souji TOOL_SHA256 and tameshi receipt-revision as adjacent, kept with those lanes |
| kake | scripts/receipt_replay.py | 708 | U+FEFF in fuzz input list | OWNED-BY-SIBLING | own instrument input |
| kake | scripts/source_recheck_selftest.py | 554-556 | U+FEFF BOM quote has no match | OWNED-BY-SIBLING | own selftest |
| kake | corpus/lessons/round-38-verifier-spotcheck.md | 69,102,176 | U+00A0 build mutant | OWNED-BY-SIBLING | own mutant set |
| kake | corpus/lessons/round-82.md | 322 | kumitate age rule S237 | REFERENCE | cites kumitate's receipt-age rule |
| kake | corpus/lessons/round-58.md | 148 | kumitate keeps prose receipt-change file | REFERENCE | cites kumitate artifact |
| chousa | corpus/knowledge/receipt-binding-r38.md | 1 | receipt binding pre/post gate hashes | OWNED-BY-SIBLING | own receipt-binding note |
| chousa | tools/quote-reopen.py | 76-79 | U+00AD U+200B U+200C U+200D U+FEFF deleted | OWNED-BY-SIBLING | own quote normalizer |
| chousa | corpus/evidence/round29/claims.md | 112 | same invisible deletion set | OWNED-BY-SIBLING | own claim text |
| chousa | corpus/QUALITY.md | 135-137 | source-blind oracle; answer key in fixture commits | OWNED-BY-SIBLING | blind-scorer discipline, chousa's own criteria |
| chousa | corpus/lessons/round-75.md | 106 | kumitate r68 fixture path leaks answer key | REFERENCE | cites kumitate's rule |
| chousa | corpus/lessons/round-65-verifier-spotcheck.md | 109 | receipt/dispatch lifecycle -> kumitate | REFERENCE | adjacency statement |
| chousa | .ufo/waves/round-80/w1/R80ConnectorA/kumitate--scripts__receipt-bind.mjs.blob | - | archived copy of kumitate receipt-bind.mjs | REFERENCE | a connector's copy of kumitate's file; not chousa ownership |
| kagi | corpus/rendered-text-v1.py | 38,139 | U+00A0 fold; zero-width-space-kept test | OWNED-BY-SIBLING | kagi's declared quote normalizer |
| kagi | corpus/knowledge/adjacency-scope.md | 76 | owner of opencode config (kumitate named) | REFERENCE | adjacency statement |
| kasegi | corpus/instruments/r46-f29-gate.py | 152-153,198 | zero-width ghost F-rows counted as defect | OWNED-BY-SIBLING | same technique (strip zero-width, compare counts) in kasegi gate; method precedent only |
| kasegi | corpus/instruments/r47-f30-gate.py | 25,170-171,216 | zero-width ghost F-rows | OWNED-BY-SIBLING | same technique; method precedent only |
| kengaku | corpus/lessons/round-1.md | 22-25 | zero-width char after write | OWNED-BY-SIBLING | own lesson |
| kengaku | corpus/evidence/round9-fleet/test_harness.py | 136-139 | E14/E15 zero-width cases | OWNED-BY-SIBLING | own harness cases |
| kengaku | PROVINCE.md | 345 | bind-oracle.mjs listed as kumitate ground | REFERENCE | kengaku's table names kumitate's bind-oracle.mjs (a different instrument from receipt-bind) |
| kengaku | PROVINCE.md | 614-641 | grader cheat-probes (cheat-always-equal etc.) | OWNED-BY-SIBLING | benchmark-grader blind-oracle probes, kengaku domain |
| kotodama | tools/gates/lexicon-coverage-audit.py | 541 | lstrip BOM | OWNED-BY-SIBLING | own gate |
| kotodama | corpus/QUALITY.md | 211 | U+00A0/U+2003 fold | OWNED-BY-SIBLING | own prober |
| mori | corpus/lessons/round-48.md | 164 | zero-width space in token | OWNED-BY-SIBLING | own finding |
| mori | corpus/evidence/sources-r56/rfc8259.txt | 494 | BOM MUST NOT (RFC quote) | QUOTE | quoted source |
| souji | corpus/knowledge/inline-html-comment-visibility-r57.md | 37 | NBSP-prefixed opener refused | OWNED-BY-SIBLING | own comment-visibility gate; same prefix class, different domain |
| tsukuroi | corpus/QUALITY.md | 161-162 | Q82: counter builds own fixtures and scores code outside them | OWNED-BY-SIBLING | blind-scorer discipline, tsukuroi's own (R32-FIXTURE-GATEABLE) |
| tsukuroi | corpus/QUALITY.md | 167 | 85: R38-Q82-LEAK leak-reading arms | OWNED-BY-SIBLING | counter beaten by leak-reading arms, own |
| kaidoku | corpus/QUALITY.md | 77 | 67: structure-blind replay keyed on fixture identity | OWNED-BY-SIBLING | blind-scorer discipline, own |
| kake | PROVINCE.md | 567-587 | oracle-free matrix; matrix alone owns the oracle | OWNED-BY-SIBLING | own oracle discipline |
| kaidoku | .ufo/waves/round-80/w1/MutInstruments/spec-binder-prov.json | targets | mutation battery over own pointer-bind.py | OWNED-BY-SIBLING | own mutation harness (wave artifact) |
| kama | tools/round72-receipt-tip-binding.py | 2-10 | round-cited receipts bound to tip revision | OWNED-BY-SIBLING | own receipt-to-revision binder |
| tsukuroi | tools/check-revision-binding.py | 2-8 | --revision gate binding | OWNED-BY-SIBLING | own counter |
| souji | corpus/QUALITY.md | 202 | Q82 calibration counter base-rev kill arm | LABEL-COLLISION | different rule under same label Q82 |
| tameshi | corpus/QUALITY.md | 2341 | 82 repertoire row without self-state row | LABEL-COLLISION | different rule, numeric 82 |
| chousa | corpus/QUALITY.md | 866 | 82 adopter cites source ids | LABEL-COLLISION | different rule, numeric 82 |
| mado | corpus/QUALITY.md | 411 | 82 desktop ground balance | LABEL-COLLISION | different rule, numeric 82 |
| mori | corpus/QUALITY.md | 378 | 82 host identifiers linted | LABEL-COLLISION | different rule, numeric 82 |
| tabi | corpus/QUALITY.md | 483 | 82 supersedes 81 | LABEL-COLLISION | different rule, numeric 82 |
| kama | corpus/QUALITY.md | 437 | KQ82 teardown observer | NONE | different prefix KQ82 |
| kaidoku | corpus/knowledge/2026-10-13-r4-07-jsc-bytecode.md | 71 | ZWSP dummy source in JSC experiment | NONE | incidental |
| kengaku | corpus/evidence/probe-r19-opencode-health.log | 27 | Cf-Placement HTTP header | NONE | incidental: header name prefix |
| chousa | corpus/captures/c9d1e74c3ac8d9eb332c9770.raw | 16 | CSS unicode-range U+00.. | NONE | incidental |
| kotoba | corpus/SOURCES.md | 35,195 | invisible-term match in source row prose | NONE | incidental prose |
| game-dev-3d | corpus/README.md | 172 | sibling province owns orchestration (kumitate named) | REFERENCE | adjacency statement |
