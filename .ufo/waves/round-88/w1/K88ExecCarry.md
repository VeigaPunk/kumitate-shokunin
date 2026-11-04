# K88ExecCarry — R86-D3 / K87-V3 carry: three source gates re-measured at the tip

Seat K88ExecCarry (executor, leaf). Nothing committed; no lane file outside this report and
`.ufo/waves/round-88/build/K88ExecCarry/` written. No tools installed.

Read first: frozen `.ufo/waves/round-88/plan.md` (K87-V3 row, line 96) and the header of the frozen
`probe/probe88-c1.mjs`. Neither was touched.

## Revision

Measured revision `0ff3562f15c18d0ca01dc6a76c9f827d30c26950` (the assigned tip). Lane HEAD when I ran was
`8e4ea5f6…` (`round-88: w1 spec + validated dispatch`); `git diff --stat 0ff3562f HEAD` touches only
`.ufo/waves/round-88/w1-{dispatch.err,dispatch.json,spec.json}`, and the lane `git status` showed only
untracked `round-88/w1*` paths — so the gate inputs (`corpus/`, `.ufo/pins/`, `scripts/`) in the
worktree are byte-equal to 0ff3562f. The three gate scripts' worktree sha256 equal
`git show 0ff3562f:scripts/<gate>` (last changed rounds 55 / 56 / 47).

Cross-check: the same three gates run inside a pristine `git clone --shared` checked out detached at
0ff3562f (`status --porcelain` empty) printed byte-identical verdict lines, exit 0 each (clone under
scratch, removed; not a citable receipt — disclosed as corroboration only).

## Verdicts (receipts in `.ufo/waves/round-88/build/K88ExecCarry/`)

Each receipt: `rev=0ff3562f…`, `tool_sha256=` sha256 of `git show 0ff3562f:scripts/<gate>`, `cmd=`,
full stdout (stderr appended under a marker if non-empty — none was), `exit=`, `signal=none`. Run with
`cwd=<lane>`, `TMPDIR=/fast/scratch/hyaku/kumitate-r88/K88ExecCarry`.

| receipt | cmd | tool_sha256 | verdict line (exact) | exit |
|---|---|---|---|---|
| `capture-gate.txt` | `node <lane>/scripts/source-capture.mjs` | `39bdeb39…d28f5` | `SOURCE_CAPTURE: CLEAN captures=78 exemptions=111` | 0 |
| `capture-selftest.txt` | `node <lane>/scripts/source-capture.mjs --selftest` | `39bdeb39…d28f5` | `SOURCE_CAPTURE_SELFTEST: PASS (13/13)` / `VERDICT: PASS` | 0 |
| `dupes-gate.txt` | `node <lane>/scripts/source-dupes.mjs` | `ead88b22…a7d535` | `SOURCE_DUPES: CLEAN groups=7 known=7` | 0 |
| `dupes-selftest.txt` | `node <lane>/scripts/source-dupes.mjs --selftest` | `ead88b22…a7d535` | `SOURCE_DUPES_SELFTEST: PASS (12/12)` / `VERDICT: PASS` | 0 |
| `check-gate.txt` | `node <lane>/scripts/sources-check.mjs` | `5402b210…f434` | `SOURCES_CHECK: CLEAN (rows=189 tiers=A:159,B:20,C:10 status=queued:13,mined:150,rejected:26 entries_with_source=42 legacy=38)` | 0 |
| `check-selftest.txt` | `node <lane>/scripts/sources-check.mjs --selftest` | `5402b210…f434` | `SOURCES_SELFTEST: 46/46 pass` / `VERDICT: PASS` | 0 |

Full digests: source-capture `39bdeb39298672dd3ed81036013de542ad6925587cb84f330ab69de6799d28f5`,
source-dupes `ead88b22fbd1525d13dd46c67b427041dc331d202a005285adea813c32530d7a`, sources-check
`5402b2103bb9e3ccd76f7bf3f5880f2249f809c78cee4766a75e3cf30b69f434`.

Gate mode = each script's documented default invocation (no flags; default registry/sources paths
resolved from the lane root). `sources-check` exit map: warnings are advisory unless `--strict`; I did not
run `--strict` (not the documented gate mode).

Self-binding of these receipts with the integrated v2 instrument:
`node <lane>/scripts/receipt-bind.mjs --lane <lane> --dir <lane>/.ufo/waves/round-88/build/K88ExecCarry --rev 0ff3562f15c18d0ca01dc6a76c9f827d30c26950`
→ `RECEIPT_BIND: CLEAN matched=7 mismatched=0 unchecked=0 external=0`, exit 0 (7 = six gate receipts +
the R86-D2 driver receipt below, which binds via its own `rev=fc0316e7…`).

## Red / root-cause notes

No gate is red. Advisory only: `sources-check` prints 5 `USED_BY_ASYMMETRY` warnings (a knowledge entry
cites a row whose `used-by` cell omits it): S243 → `corpus/knowledge/counter-receipt-discrimination.md`,
S028 and S124 → `corpus/knowledge/failure-recovery-replay.md`, S041 →
`corpus/knowledge/kimi-plane-single-derivation.md`, S237 → `corpus/knowledge/self-asserted-instants.md`
(each reported at `:1`, the entry's `source:` header). These are real (small) corpus bookkeeping gaps in
`corpus/SOURCES.md` used-by cells, not gate defects; they do not affect the CLEAN verdict. Not fixed
(corpus out of scope).

Movement against round 86's unreceipted claims (`captures=76`, `groups=7 known=7`, `rows=187`):
captures 76 → 78 and rows 187 → 189 match LOG.md's round-87 entry ("Registry 187 → 189 rows; captures
76 → 78"); dupes unchanged at 7/7. The R86-D3 sub-finding also re-derives: `.ufo/waves/round-86/open/node-crypto.html`
is absent from round-86 M `19b4e440` (`ls-tree` 0 entries) while that M's `.ufo/pins/source-captures.json`
already names it; it is present at `fc0316e7` and at 0ff3562f. So round 86's SOURCE_CAPTURE claim was not
true at its M; it is true (and now receipted) at this tip. R86-D3 is closed by these receipts once the
L1 commits them.

## R86-D2 — can `transcript-post-integration.txt` still be produced honestly?

Yes. The driver `.ufo/waves/round-86/build/K86ExecDriver/driver86-c1.mjs` is unchanged since round 86
(sha256 `68557cfb…1867` at `fc0316e7` = the lane file), and it measures `<lane>/scripts/counter-receipt.mjs`,
whose bytes at round-86 tip `fc0316e7` are `e95313700aaf…31069` — the post-integration v3 the spot-check
names (and still the bytes at today's tip). I produced it against a pristine scratch clone at
`fc0316e7f3bb84b08ead7944891d83d80cd67d9e`:

`node <lane>/.ufo/waves/round-86/build/K86ExecDriver/driver86-c1.mjs --lane /fast/scratch/hyaku/kumitate-r88/K88ExecCarry/clone-fc0316e7 --work /fast/scratch/hyaku/kumitate-r88/K88ExecCarry/drv-work`
→ `TOOL_SHA256=e95313700aaf8430c51e0f8abdb991ab168519eecf9803cce3fac51154f31069`,
`K86_EXEC_DRIVER: HELD held=54/54`, exit 0.

Candidate receipt: `.ufo/waves/round-88/build/K88ExecCarry/r86d2-driver-post-integration.txt`
(`rev=fc0316e7…`, `tool_sha256=` the driver's digest). Write scope kept me out of
`.ufo/waves/round-86/build/K86ExecDriver/`; the spot-check's fix (a new append-only file there,
`transcript-run1.txt` untouched) is the L1's to make: copy this file to
`.ufo/waves/round-86/build/K86ExecDriver/transcript-post-integration.txt`, disclosed as produced in round 88
by K88ExecCarry (not by K86ExecDriver in round 86). Caveats: the `--lane`/`--work` paths in its `cmd=`
point at my scratch, which is deleted (the bytes are reproducible from `fc0316e7`); the driver
uses `randomBytes` for nonces, so per-arm stdout differs run-to-run but the held count is a contract
property. The plan line 97 phrase "R86-D2 stays open: its transcript was never produced" stays true until
the L1 commits it.

## Risks

- The tip measurement ran on the lane worktree at HEAD `8e4ea5f6`, not a 0ff3562f checkout; equivalence is
  shown by diff/status above and by the identical clean-clone verdicts.
- `RECHECK_OVERDUE`/`OPENED_INVALID` in `sources-check` depend on today's date (2026-11-04); a later
  re-run can turn warnings on without a byte change.

## Checks for the L1

`node <lane>/scripts/receipt-bind.mjs --lane <lane> --dir <lane>/.ufo/waves/round-88/build/K88ExecCarry --rev <M>`
after integration (expect CLEAN matched=7).
