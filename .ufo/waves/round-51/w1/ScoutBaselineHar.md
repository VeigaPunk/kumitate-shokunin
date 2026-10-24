# ScoutBaselineHar — harm-battery baseline

Seat recon only. No lane script, counter, or scorecard was edited. No packages installed.

Axes: (1) all six mandated commands executed and transcribed, (2) rev fidelity when plan base ≠ jj `@`, (3) quoted finals taken from those transcripts, including a failed expectation.

## Revs

Plan base (plan.md:4): `c90b9de94009b938fa19a089bfaa97df20b54f86`.

Batch pin, 2026-10-24T02:01:08.885Z, cwd `/home/vgpnk/Projects/shokunin/kumitate-shokunin`:

- jj `@` `1e6bd7c0382c73dddf9e5d6fa99c8a71c03580ce` (`git cat-file -t` = commit). `@` moves on every working-copy snapshot, so the probes were given this object, not a live `@`.
- jj `@-` = jj `master` = `git HEAD` `1fd8acebbd9a9d75896456e1985e752358ec4798` — `round-51: freeze repair — comment-only fix for A51 block-comment termination`.
- Working-tree `scripts/cap-run.mjs` sha256 `e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5`, the same digest the bindguard final line reports for the extracted script. `bind-oracle.mjs` `c3929a97c5b24303b1acadb62ebaa4778768585597cf7fc06d2996602ec211e5`, `counter-rerun.mjs` `c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b`, `round-gate.mjs` `09d4d79238f44dd74a0fa727c8f6b193c3fa87200c02340e2f4b3dcc6b354594`.

After the batch, master moved to `3ed875d34914560d3e30ee3e80bec7fa9b9e8666` (`round-51: freeze repair 2 — D51 SOURCES-row column indexes`) and `@` to `947c9f3ef722b46a7fc6dccb18747c8017b2cc09`. Delta from `1fd8aceb`: modify `.ufo/waves/round-51/probe/doctrine51-probe.mjs`, add `.ufo/waves/round-51/base/attest-base.txt` and `doctrine-base.txt`. Neither txt is `RE_RUNNABLE` or a corpus note.

## Six mandated runs

Transcripts under `.ufo/waves/round-51/build/ScoutBaselineHar/`. Stderr empty on all six. H2 is plan.md:119-120. H5 is plan.md:122-123.

| # | command | exit | wall_s | transcript sha256 |
|---|---|---|---|---|
| 1 | `node scripts/cap-run.mjs --selftest` | 0 | 7.678 | `e5be70735bffc31539ec4f192adb16ee95df2001fa407acfd6a8874c200355db` |
| 2 | `node scripts/bind-oracle.mjs --selftest` | 0 | 0.341 | `be8081efd86244ce20a92c5482e4801c3d658b0f44d1603d757e917a7aaac6b8` |
| 3 | `node scripts/counter-rerun.mjs --selftest` | 0 | 1.924 | `c47c41d20e10eac314c66ddf288c3777f88d7212c7a18e11a0a76d322315933f` |
| 4 | `node scripts/round-gate.mjs --selftest` | 0 | 8.029 | `878ca5f5d5cbbb3d4a1b2e815917236a7a0c7518d086318dbbd61079207e3ae3` |
| 5 | `node .ufo/waves/round-50/probe/bindguard50-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin c90b9de94009b938fa19a089bfaa97df20b54f86` | 0 | 8.316 | `369f4b33c79904c89c9aba6c2584ab730d3e74445d0cb4d97f85052f8ce6e538` |
| 6 | `node .ufo/waves/round-50/probe/repairs50-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin 1e6bd7c0382c73dddf9e5d6fa99c8a71c03580ce` | 0 | 0.198 | `d298cc99b8c5411f407df02e1086f040730abeea186e8f9c8e5aaae11423afa6` |

Run 6 uses the pinned jj tip because plan base ≠ tip. Final stdout lines:

```
CAP_RUN_SELFTEST: 12/12 pass
VERDICT: PASS
```

```
BIND_ORACLE_SELFTEST: 7/7 pass
VERDICT: PASS
```

```
COUNTER_RERUN_SELFTEST: PASS
```

```
ROUND_GATE_SELFTEST: 61/61 pass
VERDICT: PASS
```

```
BINDGUARD50: GUARD_HELD held=8/8 checks=8 rev=c90b9de94009b938fa19a089bfaa97df20b54f86 rule=G50 caprun_sha256=e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5
```

```
REPAIRS50: LEDGER_HELD held=8/8 checks=8 rev=1e6bd7c0382c73dddf9e5d6fa99c8a71c03580ce rule=R50
```

H2 on the working tree: holds (12/12, 7/7, `COUNTER_RERUN_SELFTEST: PASS`, 61/61), all exit 0.

## Expectation check — GUARD at the tip does not hold

The item expected `GUARD_HELD` 8/8 and `LEDGER_HELD` 8/8 at the current tip. Ledger holds. Guard does not.

Same probes at the other rev (not a substitute for the six):

| command rev | exit | final line | transcript sha256 |
|---|---|---|---|
| repairs50 at base `c90b9de9…` | 0 | `REPAIRS50: LEDGER_HELD held=8/8 checks=8 rev=c90b9de94009b938fa19a089bfaa97df20b54f86 rule=R50` | `aac69864dda598c1fb6e11b2f1b9b86722d298b050afcc02dc791ba045f75287` |
| bindguard50 at jj tip `1e6bd7c0…` | 1 | `BINDGUARD50: GUARD_UNMET held=7/8 checks=8 rev=1e6bd7c0382c73dddf9e5d6fa99c8a71c03580ce rule=G50 caprun_sha256=e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5` | `707d45c193c9c94333c1ea905a2ec88008bd2fce604b2a512ad42e1882276eac` |
| bindguard50 at then-master `1fd8aceb…` | 1 | `BINDGUARD50: GUARD_UNMET held=7/8 checks=8 rev=1fd8acebbd9a9d75896456e1985e752358ec4798 rule=G50 caprun_sha256=e1d0a79b0c38a5d1d60ccba37ab7dd0528d1ee63982aae3213e28572a8d754c5` | `0df8c74035b472b04ab9b96442d86ede327c80796609e62ebde528b1694fc670` |

Tip bindguard check line (the probe stores only 90 characters of the proxy line; `bindguard50-probe.mjs:130`):

```
  G7 MISS exit=1 PROXY: DRIFT (A_DRIFT term=A declared=43 computed=45 delta=+2; C2_TOTAL_DRIFT term=C2_tota
```

G1–G6 and G8 passed on both unmet runs. Unsliced `node scripts/proxy-check.mjs --self <git archive> --strict` with `UFO_SRC=/home/vgpnk/Projects/ufo-fsd-alpha`, exit 1, identical at `1e6bd7c0`, `1fd8aceb`, later master `3ed875d3`, and later `@` `947c9f3e`:

```
PROXY: DRIFT (A_DRIFT term=A declared=43 computed=45 delta=+2; C2_TOTAL_DRIFT term=C2_total declared=114 computed=115 delta=+1; AXES_DRIFT term=coverage declared=10 computed=9; src-rev=31c465f15669)
```

Census (`git ls-tree -r --name-only`, `RE_RUNNABLE` = `/\.(?:mjs|js|sh|py)$/` as `scripts/proxy-check.mjs:94-95` and `:494`; `C2_total` = `*.md` under `corpus/knowledge` + `corpus/lessons`, `:101`):

| rev | runnable | corpus md |
|---|---|---|
| base `c90b9de9` | 43 | 114 |
| tip `1e6bd7c0`, master `1fd8aceb`, master `3ed875d3`, `@` `947c9f3e` | 45 | 115 |

Runnable added since base, and nothing removed: `.ufo/waves/round-51/probe/attest51-probe.mjs`, `.ufo/waves/round-51/probe/doctrine51-probe.mjs`. Corpus md added: `corpus/lessons/round-50-verifier-spotcheck.md`. Declared stanza still `SCORECARD.md:288` `A=43`, `:293` `C2_total=114`. Coverage formula (`proxy-check.mjs:103`) `floor(10 × C1/C1_total × C2/C2_total)` = `floor(10 × 114/115)` = 9 against declared 10. File set of `1e6bd7c0` equals `1fd8aceb`; the only content delta is `.ufo/waves/round-51/w1/swarm-registry.json`, which is neither runnable nor a corpus note. Detail transcripts: `09-proxy-drift.txt` sha256 `51671719b227e0f4c96c78cd39f85f54f064330fed318f15b8b6f797a3b9760f`, `11-proxy-after-move.txt` sha256 `27c7dd20cc2bc921ef929a9e59a55247c51ebfd347bdd6eb1dcf1073bebf2ad9`.

Full 8-check bindguard was not re-run on `3ed875d3` / `947c9f3e`. Proxy, which is G7, was. The three files that differ from the probed master are not inputs to G1–G6 or G8.

## Finding

Severity: high for H5/H3 at close if the stanza follows plan.md:104 (`A 43 → 44`). The frozen G50 counter is behaving; do not edit it.

`GUARD_HELD` holds at plan base and fails on the post-freeze tip because the freeze tree already contains two `RE_RUNNABLE` probe scripts and one extra lesson md, while `kumitate-proxy-v1` was left at the round-50 numbers. plan.md:104-112 says the probes add to A only via that walk ("recorded, not claimed") and that stanza re-derivation rides the close commit. The walk already returns 45 before `scripts/receipt-attest.mjs` exists, so a close stanza written as `A=44` will not `PROXY: MATCH`.

Proposed minimal fix, for the L1 at close, not a counter change: re-derive `A`, `C2_total`, and the derived `coverage` from the close tree's frozen walks. [INFERENCE] if the only further additions are `scripts/receipt-attest.mjs` and `corpus/knowledge/invocation-attestation.md`, and `C2` (README rows) stays 114, the close census is `A=46`, `C2_total=116`, `coverage=floor(10×114/116)=9`. That contradicts plan.md:109 ("coverage successors unchanged") already, because the spotcheck lesson dropped computed coverage at the freeze.

`LEDGER_HELD` 8/8 holds at base and at the pinned tip. H2 holds on the working-tree scripts named above.

## Unknowns

- Later commits can add more runnables or corpus notes; the numbers above are the named objects only.
- `@` kept moving during this seat (`db86e7c2`, `63e3cc3c`, `1e6bd7c0`, `947c9f3e` were all observed). Anything not hashed above was not scored.
