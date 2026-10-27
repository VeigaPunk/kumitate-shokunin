Surviving mutants (selftest baseline 33/33):
- `head-regex`: changed `routed\s+` to `routd\s+`
- `item-list-marker`: changed numbered-list marker regex from `\d+[.)]` to `\d+\.`
- `answer-quote-limit`: 25 to 26
- `id-first-char`: disallowed digit-leading id
- `class-first-char`: allowed digit-leading class
- `item-zero-bound`: allowed item ordinal zero
- `answer-line-low`: allowed answer line zero
- `answer-line-high`: allowed answer line one past EOF
- `answer-exclude-absolute`: removed absolute-path rejection
- `recurrent-threshold`: 4 rounds to 3
- `item-ordinal-upper`: allowed ordinal one beyond routed item count
- `heading-routed-whitespace`: removed required heading whitespace
- `item-in-range-low`: accepted one round before --from
- `normalized-quote`: tested raw quote rather than normalized quote
- `table-row-marker`: unchanged no-op mutation attempt (not a valid mutant)
- `rows-by-class-invalid`: disabled the class-validity skip inside reporting only

L4: the threshold mutant was committed only in scratch clone revision `6ace1db2dc73cb3ae3ab921dbbf8dc944968533a` and tested with seed `66c1`. Counter output was `LEDGER66_UNMET held=3/6 ...`; L4 is among the three held checks, hence this representative survivor is caught by L4. L2/L3/L6 fail because this scratch clone has no integrated ledger/registry-home lines. The full L4 fixture status was not emitted separately by the counter.

Killer-case follow-up attempt: generated `add(...)` source had a template-literal syntax error at the answer-quote case; therefore no original-versus-mutant killer cases were executed. Attempt output began `SyntaxError` at generated line 347.
