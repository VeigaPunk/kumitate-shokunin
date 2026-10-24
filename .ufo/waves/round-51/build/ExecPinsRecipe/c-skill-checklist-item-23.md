# (c) SKILL.md — proposed checklist item 23

**Target file:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/SKILL.md`
**Target location:** the `## Verifiable checklist` list (items 1–22 at
`SKILL.md:686-707`). The new line is appended as **item 23**, immediately after the
`cap-run hermetic suite` item at `SKILL.md:707` and before the blank line that ends the
list.

## The exact line

```
- [ ] Receipt-attest hermetic suite (round 51; contract `kumitate-receipt-attest-v1`; hermetic; the final line is `ATTEST_SELFTEST: PASS`) — `node scripts/receipt-attest.mjs --selftest` → exit 0 + `ATTEST_SELFTEST: PASS`
```

## The frozen grammar it must satisfy

`surface-probe.mjs` parses the list with a frozen v1 regex
(`scripts/surface-probe.mjs:280`, `CHECKLIST_RE`):

```js
const CHECKLIST_RE = /^\s*- \[ \] (?<label>.+?) — `(?<cmd>[^`]+)` → exit (?<exits>[0-9]+(?:\|[0-9]+)*) \+ `(?<expect>[^`]+)`$/u;
```

Required shape, and how this line meets it:

| element | requirement | this line |
|---|---|---|
| task marker | `- [ ] ` (unchecked) | `- [ ] ` |
| label | `.+?`, non-greedy, must not contain a backtick-quoted ` — ` sequence | `Receipt-attest hermetic suite (round 51; contract \`kumitate-receipt-attest-v1\`; hermetic; the final line is \`ATTEST_SELFTEST: PASS\`)` |
| command | backtick-quoted, **no backticks inside** | `` `node scripts/receipt-attest.mjs --selftest` `` |
| exit set | `0` (or `0\|1`, `0\|1\|2`, …) | `0` |
| expected substring | backtick-quoted, **no backticks inside** | `` `ATTEST_SELFTEST: PASS` `` |

**The label deliberately carries the contract id and the final-line statement inside
backticks.** The regex's `label` group is `.+?` and the command group is `[^`]+`, so a
backtick inside the label is tolerated as long as the *command* and *expect* groups hold
no backticks — which is why the existing items 18 and 22 also carry backticked contract
ids inside their labels (`kumitate-gate-mutants-v2`, `kumitate-cap-run-v1`). The style
is copied from item 22, the immediately preceding line.

**Why the expect substring is `ATTEST_SELFTEST: PASS` and not a longer form.** The
probe's A1 arm takes the **last** line of the selftest's combined stdout+stderr and
matches `/ATTEST_SELFTEST: PASS/`; the checklist runner instead does a substring test
(`output.includes(item.expect)`, `surface-probe.mjs:1073`). ExecInstrument's delivered
instrument prints, as its final two lines:

```
ATTEST_CASES: 27 passed, 0 failed
ATTEST_SELFTEST: PASS
```

so the last line is exactly `ATTEST_SELFTEST: PASS` and the substring is present.
Verified by running the delivered artifact:

```
$ node receipt-attest.mjs --selftest | tail -2
ATTEST_CASES: 27 passed, 0 failed
ATTEST_SELFTEST: PASS
exit=0
```

## Measured: the item parses and passes through the real checklist runner

Applied to a scratch clone of the lane together with deltas (a) and (d), the item
parses under the frozen grammar and passes:

```
CHECKLIST  PASS SKILL.md:708 exit=0 expected=0 substring=hit wall=0.420 load1=11.97 — Receipt-attest hermetic suite (round 51; contract `kumitate-receipt-attest-v1`; hermetic; the final line is `ATTEST_SELFTEST: PASS`)
```

`wall=0.420 s` — the item is far inside the runner's 120 s per-command timeout
(`CHECKLIST_TIMEOUT_MS`), so harm rule H1's checklist level stays green.

## The count term this moves

`proxy-check.mjs` derives `C` by counting `^\s*- \[` lines in `SKILL.md`
(`RE_CHECKLIST`, `scripts/proxy-check.mjs:495`; `countLines(skillText, RE_CHECKLIST)`
at `:936`). The list holds 22 such lines today (`grep -c "^\s*- \[" SKILL.md` → 22),
so this line moves `C` 22 → **23**, matching the plan's declared term
("C 22 → **23** (checklist item 23 = receipt-attest hermetic suite)"). The stanza's
`C=23` must therefore be re-derived at the close commit — see delta (a).

Note that `C` is the *prose count* of task lines, not the number of items that pass.
The `## Verifiable checklist` intro sentence at `SKILL.md:670` reads "Nineteen items
(round 42)" — already stale by 3 before this line and stale by 4 after. That sentence
is prose only (no script reads it; `surface-probe.mjs` counts task lines, not the
sentence), so no gate fails either way, but it is the same M3-class stale-count defect
the round-50 lesson records. L1's call; see delta (b).

## Checklist item 23 is a read-only item, like every other

Every item in this list is read-only, runs from the repo root, and prints its verdict
(`SKILL.md:670-675`). The item above inherits that: `node scripts/receipt-attest.mjs
--selftest` writes only `mkdtemp` fixtures under the OS temp dir and removes them
(the delivered artifact's own selftest does this — its case list writes under
`mkdtemp`, and `SKILL.md:589-591` already states "self-tests write only `mkdtemp`
fixtures"). The `--selftest` mode never touches the lane tree.
