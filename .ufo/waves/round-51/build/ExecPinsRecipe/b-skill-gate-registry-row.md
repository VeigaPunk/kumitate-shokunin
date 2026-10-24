# (b) SKILL.md — proposed gate-registry row for `receipt-attest`

**Target file:** `/home/vgpnk/Projects/shokunin/kumitate-shokunin/SKILL.md`
**Target location:** the `## Gate registry` table (header at `SKILL.md:600-601`, rows
`SKILL.md:602-617`). The row is appended as the **last row of the table**, immediately
after the `cap-spawn` row at `SKILL.md:617`.

The row format is read off the table's own header
(`| name | kind | entry command | self-test | pinned values live in |`) and mirrors the
**`bind-oracle` row** (`SKILL.md:616`) as the item requires — same column count, same
`kind` vocabulary, same entry-command shape (`node scripts/<name>.mjs …` → `VERDICT:`),
same self-test cell shape, same "pinned values live in" cell naming the
`kumitate-gate-pins-v1` pin.

## The exact row

```
| receipt-attest | gate | `node scripts/receipt-attest.mjs run --out <base> -- <cmd...>` → `RECEIPT: WROTE <base>.txt`; `node scripts/receipt-attest.mjs verify [--ledger <dir>] <file>` → `RECEIPT: VALID\|REPLAY\|TAMPERED` (0 valid · 1 replayed or tampered · 2 unreadable · 64 usage), contract `kumitate-receipt-attest-v1`: a receipt is a `run-at:` display prelude plus one canonical-JSON line whose `digest` field is the sha256 of that line's canonical JSON with the `digest` field removed (sorted keys, recursive, one line), and whose sidecar `<base>.txt.sha256` is the GNU `sha256sum` text-mode digest of the exact receipt bytes — the prelude included; the inner digest binds every semantic field (argv, exit, mono span, nonce, stdout/stderr sha256, wall instants), the prelude is bound by the sidecar only, and `--ledger` rejects a nonce bound to a **different** record digest (a byte-identical duplicate is exempt) | `--selftest` (`ATTEST_SELFTEST: PASS`; 27 hermetic cases, one per contract clause — among them the flake-injection arm that must read `RECEIPT: REPLAY` and the sidecar-mismatch arm that must read `RECEIPT: TAMPERED`) | the receipt bytes' inner digest, the sidecar digest and the clock ordering inside the script; `pin.receipt-attest` in the `kumitate-gate-pins-v1` block |
```

## Why `kind` is `gate`, and the prose counts it forces

The `kind` column already has three values in use — `gate`, `runner` (`cap-run`),
`probe` (`counter-rerun`), `helper` (`cap-spawn`) — and the section preamble
(`SKILL.md:589-598`) defines the split: gates "can exit 1 on a real defect";
`counter-rerun` is a **probe** because "its exit 1 is `DISAGREE`, two runs of one
counter disagreeing, not a surface defect"; `cap-spawn` is a **helper** with no process
exit map.

`receipt-attest` exits 1 on a real defect — a receipt that fails its own integrity
check (`RECEIPT: REPLAY` / `RECEIPT: TAMPERED`) — so it is a **gate** by that
definition, not a probe and not a helper. This matters mechanically, because the
preamble counts the gates in prose:

- `SKILL.md:589` — "Twelve are gates"
- `SKILL.md:595` — "Verdict map for all twelve"
- `SKILL.md:598` — "so \"all twelve\" above still counts the gates only"

**Adding a 13th gate row makes all three numerals stale.** They are prose (no script
greps them — `grep -rn "twelve\|Twelve" scripts/*.mjs` returns nothing), so **no gate
fails** if they are left alone, but they are exactly the defect class the round-50
lesson records as **M3** ("a provisional count survives in prose after the row count
moves"), and the same three sites were already swept once for "all eleven" → "all
twelve" in round 50 (`corpus/lessons/round-50.md:40-41`, `R50-5`).

Proposed sweep (L1's call; not mechanically required, and it is the same judgement the
round-50 sweep made):

```
SKILL.md:589  Twelve are      →  Thirteen are
SKILL.md:595  all twelve:     →  all thirteen:
SKILL.md:598  "all twelve"    →  "all thirteen"
```

`SKILL.md:589`'s parenthetical list of when each gate was added
("`anchor-truth` added round 38, `wave-census` round 41, `gate-mutants` round 42,
`omp-census` round 44, `bind-oracle` round 49)") should gain
"`receipt-attest` round 51" for the same reason.

**Note the count is 12 gates today and 13 after this row — verify before editing the
numerals.** The table at `SKILL.md:602-617` holds 14 rows: 12 `gate`
(`cite-check`, `surface-probe`, `round-gate`, `proxy-check`, `claims-check`,
`kimi-census`, `sources-check`, `anchor-truth`, `wave-census`, `gate-mutants`,
`omp-census`, `bind-oracle`), 1 `runner` (`cap-run`), 1 `probe` (`counter-rerun`),
1 `helper` (`cap-spawn`). The `cap-run` row is explicitly excluded from the count by
`SKILL.md:598` itself, so the prose numeral counts gates only. Confirmed by
`awk 'NR>=600 && NR<=620' SKILL.md | grep -o "^| [a-z-]* | [a-z]* |"`.

## Cross-check: the checklist item (c) is the instrument's only measured arm

The plan's C1 terms say "C 22 → **23** (checklist item 23 = receipt-attest hermetic
suite; **item text integrated with SKILL.md's gate registry row for `receipt-attest`**)".
The row above and the checklist line in delta (c) therefore name the same contract
(`kumitate-receipt-attest-v1`) and the same self-test verdict
(`ATTEST_SELFTEST: PASS`) — they are one integrated piece of prose, per the plan.

The registry row must also agree with the SCORECARD `## Capabilities` table, which the
plan says gains a `receipt-attest` capability row ("demonstrated running this round").
That table is **not** part of this item's four deliverables, but the L1 should land it
in the same commit so the round's "stanza re-derivation … rides the close commit"
holds as one unit.
