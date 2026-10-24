# RevA51Rerun — attack on the frozen A51 counting command

Seat: `kumitate-r51.AccusedPony` (reviewer, independent leaf). Lane: `/home/vgpnk/Projects/shokunin/kumitate-shokunin` (READ-ONLY; every mutation below ran in `/tmp`). No installs; no pacman. No lane file was edited except this report.

**Axes (godspeed):** (1) is the verdict line true at the pinned rev, (2) is it reproducible byte-for-byte, (3) can any MISS be turned PASS without a tree change, (4) is 9/9 reachable by the pre-close commit, and what exactly must that commit contain.

## 1. The commanded run — exact held line

```
$ node /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-51/probe/attest51-probe.mjs \
    /home/vgpnk/Projects/shokunin/kumitate-shokunin 7d88faa733c5621da1cac174515e4a7d7d8896ea
ATTEST51: ATTEST_UNMET held=7/9 checks=9 rev=7d88faa733c5621da1cac174515e4a7d7d8896ea rule=A51 version=v3 | A1 PASS | A2 MISS attest-run-3.txt:absent | A2c PASS | A3 PASS | A3c PASS | A4 MISS attest-run-3.txt:absent;prior-files=162 | A4c PASS | A3d PASS | A5 PASS
exit=1
```

(264 bytes, sha256 `500f4b0f12f0e18dda1e5e6101040dbcacd4e472fd70f2afd0e1d9ea982a663d`; the three independent runs of §1.1 are byte-identical to this line.)

### 1.1 Byte-exact output, three independent runs

```
$ for n in 1 2 3; do node …/attest51-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 7d88faa7… > /tmp/a51run$n.txt 2>/tmp/a51run$n.err; echo run$n exit=$?; done
run1 exit=1
run2 exit=1
run3 exit=1
$ sha256sum /tmp/a51run?.txt
500f4b0f12f0e18dda1e5e6101040dbcacd4e472fd70f2afd0e1d9ea982a663d  /tmp/a51run1.txt
500f4b0f12f0e18dda1e5e6101040dbcacd4e472fd70f2afd0e1d9ea982a663d  /tmp/a51run2.txt
500f4b0f12f0e18dda1e5e6101040dbcacd4e472fd70f2afd0e1d9ea982a663d  /tmp/a51run3.txt
$ wc -c /tmp/a51run?.txt   → 264 264 264
$ cmp 1v2 && cmp 2v3      → identical; stderr all e3b0c442… (empty), exit 1 each
```

Authoritative line (264 bytes):

```
ATTEST51: ATTEST_UNMET held=7/9 checks=9 rev=7d88faa733c5621da1cac174515e4a7d7d8896ea rule=A51 version=v3 | A1 PASS | A2 MISS attest-run-3.txt:absent | A2c PASS | A3 PASS | A3c PASS | A4 MISS attest-run-3.txt:absent;prior-files=162 | A4c PASS | A3d PASS | A5 PASS
```

| check | verdict | basis |
|---|---|---|
| A1 | PASS | `ATTEST_SELFTEST: PASS`, 27/27 cases, exit 0 |
| A2 | **MISS** | `attest-run-3.txt:absent` |
| A2c | PASS | probe-issued argv+stdout challenge satisfied |
| A3 | PASS | `attest-run-2-replayed.txt` → `RECEIPT: TAMPERED`, exit **1** (re-verified standalone) |
| A3c | PASS | live prelude tamper rejected |
| A4 | **MISS** | `attest-run-3.txt:absent;prior-files=162` |
| A4c | PASS | twin VALID alone, ledger answers REPLAY both sides |
| A3d | PASS | corrupt inner digest + fresh sidecar → REPLAY |
| A5 | PASS | pin match + `PROXY: MATCH` |

### 1.2 The assignment's expected reading is falsified

The assignment (and the registry text in `.ufo/waves/round-51/w2-spec.json`, `w2-validate.json`) says *"everything PASS except A2"*, i.e. **8/9**. Measured: **7/9**, exit 1. A4 is independently receipt-3-coupled and cannot be 8/9 at this rev. Cited mechanism — probe lines 222–227:

```js
222:    for (const f of RECEIPTS) {
224:      if (!existsSync(p)) { a4ok = false; a4d.push(`${f}:absent`); continue; }
227:      if (!(v.status === 0 && /RECEIPT: VALID/.test(last))) { a4ok = false; a4d.push(`ledger exit=…`); }
```

Absence is confirmed at every candidate rev, not just the pinned one:

```
$ git ls-tree -r --name-only <rev> -- .ufo/waves/round-51/receipts/
7d88faa: run-1(.sha256) run-2(.sha256) run-2-replayed run-1.out      ← no attest-run-3
3304a56: same                                                      ← no attest-run-3
a476977: run-1(.sha256) run-1.out                                  ← no run-2 yet
$ git log --all --oneline -- .ufo/waves/round-51/receipts/attest-run-3.txt   → (empty; never committed on any ref)
```

Same 7/9 reading holds at the current tip `3304a56db425ea9c7cd496b426876aaedbce3949`.

## 2. Can a MISS become PASS without editing the tree?

**No honest lever exists; two adversarial ones exist and are named below.** Tested levers, all in `/tmp`:

| lever | result |
|---|---|
| working-tree file present, rev unmodified | **no effect** — probe extracts `git archive <rev>` (lines 95–96), never reads the lane tree. Demo: clone at `7d88faa`, `attest-run-3.txt`+sidecar placed in the working tree, probe at `7d88faa` → still `held=7/9`, `A2 MISS …:absent`, `A4 MISS …:absent`. |
| cwd / TMPDIR / node version | no effect — all paths are absolute; extraction dir is `mkdtemp` |
| `.gitattributes` `export-ignore` | not present at rev (`git show 7d88faa:.gitattributes` → fatal: does not exist); even if present it can only *remove* bytes, never add a receipt |
| a different rev | **yes** — see F4; verdict echoes whatever rev is passed |
| hostile `NODE_OPTIONS`/`PATH` | **yes** — see F5; this is measurement-environment tampering, not a tree edit |

Per-check why the honest door is shut:

- **A2 / A4** — the failure is `existsSync(join(T, RDIR, 'attest-run-3.txt'))` where `T = git archive <rev>`. The archive is a pure function of the commit tree; nothing in the probe's environment selects a file that the commit does not contain. Only a new rev containing the file (plus sidecar) flips them. Proof by construction, §3.
- **A1, A2c, A3, A3c, A4c, A3d** — all nine inputs are probe-issued at run time: challenge nonces (`randomBytes`), a probe-chosen argv, digests recomputed from probe-written bytes, and `sha256sum -c` executed by the probe. No committed string can be pre-baked to satisfy them; a print-stub cannot know the nonce. Flipping any of these requires different bytes at `scripts/receipt-attest.mjs` at the rev — a tree change.
- **A5** — the pin is compared to `sha256` of the *extracted* tool and `proxy-check.mjs --strict` runs from the extracted rev with `UFO_SRC` hardcoded to `/home/vgpnk/Projects/ufo-fsd-alpha` (line 345). Neither the pin nor the proxy verdict can be moved from the outside without changing the rev or the origin repo's HEAD (the latter can only turn MATCH *red*, never green — direction is safe).

## 3. Reachability of 9/9 by the pre-close commit (executed control)

Scratch clone only (`/tmp/k51clone`); lane untouched.

```
$ git clone -q <lane> /tmp/k51clone && git -C /tmp/k51clone checkout -q 7d88faa…
$ node scripts/receipt-attest.mjs run --out .ufo/waves/round-51/receipts/attest-run-3 -- /usr/bin/printf %s round51-receipt-3
receipt-attest: wrote .ufo/waves/round-51/receipts/attest-run-3.txt
receipt-attest: sidecar .ufo/waves/round-51/receipts/attest-run-3.txt.sha256
receipt-attest: receipt-sha256 bb8cbaf3…  command-exit 0
$ git commit  → df46e50e0faf8f25f766e874ba5dc60dd1bda964
$ node …/attest51-probe.mjs /tmp/k51clone df46e50e…
ATTEST51: ATTEST_HELD held=9/9 checks=9 rev=df46e50e0faf8f25f766e874ba5dc60dd1bda964 rule=A51 version=v3 | A1 PASS | A2 PASS | A2c PASS | A3 PASS | A3c PASS | A4 PASS | A4c PASS | A3d PASS | A5 PASS
exit=0
$ node …/attest51-probe.mjs /tmp/k51clone 7d88faa…      ← same clone, original rev
ATTEST51: ATTEST_UNMET held=7/9 … A2 MISS attest-run-3.txt:absent | … A4 MISS attest-run-3.txt:absent;prior-files=162 …
```

So: A2 and A4 flip **together and only** with the receipt commit, and A4 has no latent defect that would keep the round stuck at 8/9 after run-3 lands. This is the round's own rehearsal method (`w1/ExecPinsRecipe.md:98–104`, §"End-to-end rehearsal against the frozen counter", scratch clone → 9/9).

## 4. Findings by severity

### F1 — medium — the stated pre-close expectation (8/9) is wrong; the honest reading is 7/9 on two coupled arms
`w2-spec.json` / `w2-validate.json` tell seats to expect "everything PASS except A2". Executed counter: `held=7/9`, exit 1, at both `7d88faa` and tip `3304a56`. `A4` misses on the same absent file (probe:222–227) because its ledger loop iterates `RECEIPTS` without an absence exemption. Consequence: any close text that says "8/9, A2 pending" is a false statement, and a verifier who expects 8/9 will read the honest 7/9 as a counter bug. The correct pre-close reading is **`ATTEST_UNMET held=7/9`, A2+A4 red, flipping atomically**.
*Note:* this direction is conservative (redder than claimed), so no gate is falsely green.

### F2 — medium — three hard preconditions on the receipt-3 commit; miss any and the round closes at 7/9
1. **`--out` is a base name, not a filename.** `--out …/attest-run-3.txt` writes `attest-run-3.txt.txt` (observed). Correct: `--out …/attest-run-3`.
2. **The `.sha256` sidecar must be committed with the receipt.** Variant control (clone commit `7c3c69c6`, receipt present, sidecar absent):
   `ATTEST_UNMET held=7/9 … | A2 MISS attest-run-3.txt:absent | … | A4 MISS attest-run-3.txt:ledger exit=1 RECEIPT: TAMPERED;prior-files=162 | …`
   — both arms stay red, A4 now fails on *verify*, not absence.
3. **The span must reach 300 s from run-1.** run-1 `2026-10-24T02:35:11.057Z`, run-2 `2026-10-24T02:39:06.793Z` → only **235.736 s**. run-3's `run-at:` must be **≥ 2026-10-24T02:40:11.057Z**. A receipt generated before that instant yields `A2 MISS span=…<300` even with all three files present (A2's span arm is source-verified at probe:128–146; not exercised live because no valid early receipt can be produced without breaking its sidecar).
Also implied: fresh nonce + fresh file sha (A2 distinctness) and a ledger-clean nonce vs all prior corpora (A4 sweep; `prior-files=162`).

### F3 — low — A4's prior-nonce sweep is filename-filtered, not content-based
Probe: `if (/receipt|ReRun|L1-score/i.test(n)) prior.push(p)` — a nonce echoed into a generically named prior file (e.g. `notes.txt`, `evidence.md`) is invisible to the reuse sweep; the ledger arm still covers duplicates *inside* the round's receipts dir. Measured exposure at the pinned rev: files under `.ufo/waves` excluding round-51 that contain `"nonce"` = **0** (`git grep -l '"nonce"' 7d88faa -- '.ufo/waves' ':!.ufo/waves/round-51'` → 0 lines), so there is no live gap; the arm's strength is corpus-dependent, not structural.

### F4 — low — the counter accepts any `<rev>` and echoes it unvalidated
No `rev-parse`, no 40-hex check, no comparison to the lane tip (grep `rev-parse|tip|HEAD` in the probe → no hits). Symbolic revs are accepted: `node … HEAD` produced `… rev=HEAD …` (not reproducible evidence). A seat can also select a rev that scores better — demonstrated in the scratch clone: same clone, `7d88faa` → 7/9 vs `df46e50` → 9/9. The verdict line is honest about the rev it used, so the close must cite a **40-hex tip sha**, and any A51 citation with `rev=HEAD`/branch name should be treated as unbound.

### F5 — info — measurement environment is inherited, not scrubbed
Line 345 spreads `process.env` into the `proxy-check` child; the archive step runs `bash -lc` (lines 95–96), so `git`/`tar` resolve through the profile PATH, and `NODE_OPTIONS` reaches every spawned `node`. Demonstrated: `NODE_OPTIONS='--require /tmp/a51pre.cjs' node -e 'spawnSync("node",…)'` → child stderr contains `PRELOAD-ACTIVE`. A preload could forge the verdict outright. This is interpreter tampering (equivalent to faking the transcript), not a tree edit, and affects every node counter in the round; recorded so the close does not present a hostile-environment run as evidence. No action inside this round's budget.

### Nit — A2c's `outOk` OR-chain repeats one identical expression
Probe:169: `sha(Buffer.from(nonce,'utf8'))`, `sha(Buffer.from(`${nonce}`,'utf8'))`, `sha(Buffer.from(nonce))` are three spellings of the same bytes. Behaviourally single-check; no vacuity introduced (the binding is still to the probe nonce's byte hash).

## 5. Residual risk

- **A5 leans on a live external repo.** `proxy-check.mjs` verifies via one `git -C <src> rev-parse HEAD`; the pin family is compared against the origin checkout's *HEAD*, so A5's outcome moves if `ufo-fsd-alpha` gains commits. Direction is green→red only (a foreign HEAD cannot manufacture `pin match`), so this is a determinism hazard, not a false-green. Origin HEAD observed at `093edb979559443bca65245fbdd94ac3621446fb`, clean tree.
- **Determinism of failure text is structural but not guaranteed by design.** Byte-identical output holds here because PASS details (which embed random challenge nonces) are suppressed and every MISS detail is nonce-free. A future MISS whose tool message echoed a temp path containing the random challenge name would make the transcript non-reproducible. Not observed.
- **Not attacked:** adversarial substitution of `git`/`tar` on the profile PATH (F5 family, theoretical), the `--ledger` exemption internals and the digest canonicalization (other seats own those), H1–H5, D51.

## 6. Verification performed

Commands run: the commanded probe ×3 (byte-identical, sha `500f4b0f…`), probe at tip `3304a56`, probe at `HEAD`/two clone revs; `receipt-attest.mjs verify` on run-1/run-2/replayed (exit 0/VALID, 0/VALID, 1/TAMPERED); `--selftest` (27/27); `git ls-tree`×3, `git log --all` for run-3; `git grep '"nonce"'` coverage count; clone controls at `/tmp/k51clone` (3 commits: run-3, run-3-without-sidecar, plus untracked-file variant); `NODE_OPTIONS` inheritance probe. No lane write besides this report; no `.mjs/.js/.sh/.py` created under the lane tree; `/tmp/a51pre.cjs` and `/tmp/k51clone` are outside the lane.

**Verdict recommendation:** the A51 counter is honest and correctly red; **the round's own expected-state text is wrong (F1) and the receipt-3 recipe has three traps (F2)**. Close at `held=9/9` only after committing `attest-run-3` **base-name** output with its sidecar, `run-at ≥ 2026-10-24T02:40:11.057Z`, then re-measuring the close tip sha.

Report: `.ufo/waves/round-51/w2/RevA51Rerun.md`
