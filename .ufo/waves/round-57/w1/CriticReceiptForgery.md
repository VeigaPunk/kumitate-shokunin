# CriticReceiptForgery — attack on A57 arm B8 (receipt-attest receipts)

**Item under attack**: `attest57-probe.mjs` B8 (probe lines 333–363) — "the three committed
receipts `.ufo/waves/round-57/receipts/attest-run-{1,2,3}.txt` verify `RECEIPT: VALID` under
`verify --ledger`, nonces pairwise distinct and distinct from every nonce in the round-48..56
corpora at rev, span ≥ 300 s; the doctored control is excluded from evidence."

**Verdict**: the arm as written is **defeated**. Forged receipts — fabricated at commit time
without ever running `receipt-attest run` — pass `verify --ledger` AND score `B8 PASS` on the
real frozen probe, including a set that **replays a nonce committed in round 52** (inside the
swept directories). The cross-round nonce-distinctness conjunct is dead code: its `git grep`
sweep reads zero bytes at the judged rev. Reproduced end-to-end on sandbox commits; lane untouched.

Evidence root: `.ufo/waves/round-57/build/CriticReceiptForgery/`
(`forge.mjs`, `mini-b8.mjs`, `probe-*.txt`, `baseline-verify.txt`, `prior-nonces.txt`,
`realout/`, `forged-*/`, `replay-dir/`, `control-dir/`, `future-dir/`, `sandbox-repo/`).
Judged revs: R1 `f0dc6d1160e66af65355bd353665adac22bbf4a9`, tip `8c6f5b017d149b18134917378cdbed3b492d8e89`.

## Counterexample 1 (headline) — prior-round nonce replay scores B8 PASS

Sandbox commit `aefe172427fcdefbdc86e98aa69469996921b4f2` = tip tree with the three receipts
replaced by forgeries; `attest-run-2.txt` embeds nonce `1471752e200cb6f67cce5c041543635a`,
which exists at the judged rev in `.ufo/waves/round-52/build/ExecStdinRehearsal/cat-1.txt`,
`v2-receipt-rehearsal.json` and `w1/ExecStdinRehearsal.md` — i.e. **inside the directories the
sweep intends to cover**. Observed:

```
$ node sandbox-repo/.ufo/waves/round-57/probe/attest57-probe.mjs <sandbox> aefe1724…
ATTEST57: ATTEST57_HELD held=10/10 checks=10 … | B8 PASS | …      (probe-forged-replay-prior.txt)
```

All three forged receipts printed `RECEIPT: VALID` under `verify --ledger` over their own dir.

## Counterexample 2 — fully fabricated timeline scores B8 PASS

Sandbox commit `8098f279846187ccde405e040533cb9ab44d62de`: three receipts fabricated by
`forge.mjs` at ~12:56Z claiming `run-at`/`wall_start` 13:00:00Z/13:03:20Z/13:06:40Z
(span 400 s — all attacker-chosen), fresh random nonces, argv of the three planned selftests,
**real captured selftest stdout** (so even `stdout_sha256` claims true content). Real probe:

```
ATTEST57: ATTEST57_HELD held=10/10 checks=10 … | B8 PASS | …      (probe-forged-fresh.txt)
```

The fabricated span passes because the only timestamp invariant `verify` enforces is
*prelude within wall window ± 60 s* — every field is self-declared; the digest covers the
JSON body but nothing anchors it to execution or a clock. Confirming the asymmetry: a receipt
claiming `wall_start` **2030-01-01** also reads `RECEIPT: VALID` (`future-dir/` run recorded).
There is no `now` bound anywhere in `doVerify`.

## Root cause — the nonce sweep is vacuous (dead code)

B8 line 350:

```js
git(['grep','-ohE','"nonce":\\s*"[0-9a-f]+"', rev, '--',
     '.ufo/waves/round-4[89]', '.ufo/waves/round-5[0-6]'])
```

Wildcarded pathspecs match full paths, not directory prefixes: `.ufo/waves/round-5[0-6]` can
only match a path *literally named* `round-51`…`round-56`, never files beneath them. Observed
at `f0dc6d1`:

| sweep form | nonce literals found |
|---|---|
| B8's wildcard pathspecs (as shipped) | **0** (`git status=1`) |
| literal dirs `.ufo/waves/round-48 … round-56` | 64 distinct |
| `:(glob).ufo/waves/round-5[0-6]/**` | 100 lines |

Because `older.status === 1`, the `if (older.status === 0)` collision loop is skipped entirely
(attest57-probe.mjs:351) — the distinctness conjunct can never fire in this lane. `mini-b8.mjs`
(a byte-faithful copy of the arm) reports `nonce_literals_swept=0` for the genuine set, both
forged sets, everywhere.

## What the ledger actually enforces (and what it doesn't)

- `verify --ledger`'s nonce check (receipt-attest.mjs:346) only compares against **attested
  priors inside the same `--ledger` directory** — it cannot see prior rounds. Same-dir replay
  detection *does* work: `evil-twin.txt` (run-2's nonce, different record) → genuine run-2
  reads `RECEIPT: REPLAY` (`replay-dir/` transcript). So the instrument is sound; B8's intended
  cross-round extension of it simply never executes.
- There is no signer: digest = sha256 of the sorted-key JSON body; sidecar = sha256 of the file.
  Any party who can write the commit can mint a byte-perfect receipt. `verify` attests
  self-consistency, not that the command ran.
- Blast radius: `bind-oracle.mjs` and `round-gate.mjs` appear **nowhere else** in the probe
  (grep) — the forged-able receipts are the counter's *only* evidence those selftests ran.

## Doctored control — mechanism check

Committed `attest-run-2-replayed.txt` (sha256 `0354f3e6…`): sidecar `…replayed.txt.sha256`
carries `5bcb7aba…` — the **genuine run-2 hash under the control's own basename** (the plan's
"sidecar untouched" is imprecise: the name field was regenerated, the hash is stale). Verified
directly → `RECEIPT: TAMPERED` at the sidecar check; in the ledger scan it is skipped with
`not an attested receipt (sidecar hash mismatch)` — so the self-exclusion is real, via
unattestedness, not by name. But the plan's "verify must read `REPLAY`/`TAMPERED`, **never
VALID**" is an artifact of *this particular* doctoring: replaying run-2's JSON body with the
prelude moved *inside* the wall window plus a matching sidecar → **`RECEIPT: VALID`**
(`control-dir/d-control.txt`), and it silently exempts itself from the ledger
(same nonce + same digest → intended exemption). The control demonstrates *one* detection
path, not the class.

## Nits (coverage notes, non-blocking)

- Plan: "Body-field `wall_start` span ≥ 300 s"; code (line 346) prefers `run-at:` prelude —
  the *unauthenticated* field. Harmless as written (within-slack check binds them), wrong as documented.
- Probe doc comment claims nonces "distinct from every nonce in the round-48..56 corpora" —
  overclaims a dead sweep.
- Sweep runnability is unchecked: `status !== 0` silently skips (should fail closed).

## Impacted axes

- **operability**: B8 manufactures confidence — `ATTEST57_HELD` printed `10/10` on two commits
  whose receipt layer was fabricated by this seat in minutes. The "the selftests ran" claim it
  underwrites is unverifiable from committed bytes alone.
- **coverage**: the cross-round nonce-distinctness arm covers *nothing* at the judged rev
  (0 literals swept); replay-protection across history is absent, not merely weak.

## Smallest safe corrections

1. **Sweep pathspecs**: replace wildcards with literal dir pathspecs
   `.ufo/waves/round-48` … `.ufo/waves/round-56` (or `:(glob)…/**`), and treat
   `older.status !== 0` other than a verified no-match as MISS — fail closed, never skip.
   (Restores the intended check; my Set B would then MISS via the collision loop.)
2. **Bind receipts to executed truth**: re-run the three selftests in the extraction and
   compare `exit`/`stdout_sha256` to the receipt fields — or drop the receipts as *evidence*
   and execute the selftests directly (the receipt artifacts then stay as provenance, which
   is what they can honestly attest). This kills the whole forgery class, not just nonce reuse.
3. **Span arm**: measure `wall_start` per the plan, and record in the plan/report that receipt
   timestamps are self-declared — the ≥300 s span is a *claim* the tree cannot verify absent a
   trusted anchor (commit-graph adjacency is procedural only).
4. **Control**: mutate a digested field (e.g. flip `exit` to 1 or one nonce hex digit) so the
   artifact reads non-VALID *regardless* of sidecar freshness, keeping the current
   out-of-window prelude as a second arm.

## Tradeoff note for the judge

If receipts are intentionally "self-consistent provenance, not signatures", the digest/sidecar
design is a legitimate tradeoff — but then B8's sweep, span and control apparatus is pure cost,
and correction (2) reduces to deleting it and running the selftests. Either way the current
text overclaims. Fixable defect, not a rejection-class tradeoff.

Commands, stdout/stderr and exit codes: `baseline-verify.txt`, `probe-*.txt`,
`mini-b8.mjs` runs above; forger = `forge.mjs` (replicates `digestOf`/sidecar exactly).
No installs. Lane writes: only this seat's build dir + this report; sandbox git mutations
confined to `build/CriticReceiptForgery/sandbox-repo` (shared-object clone of the lane, HEAD
`8098f27…`), never the lane.
