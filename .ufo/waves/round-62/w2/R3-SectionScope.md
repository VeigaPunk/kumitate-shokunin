# R3 — E3 section-scope counterexample

**Question:** Does E3 accept a probe-shaped S195 row under `## Leads` outside `## Registry`, while census section scope rejects it?

**Finding: yes.** The committed forged-control record explicitly describes this mutation and records the probe result: `.ufo/waves/round-61/controls/ctl-c2-critic-a5-full-forgery-held.txt` (committed blob `7cc0dc28159d7e16041dd90195fbbe3b399bca76`, read at lane `HEAD` `0cbe0d75e5a08718e2256408329692908c837766`). It says the forged revision has “none inside ## Registry” and gives this sole S195 row:

```text
|:S195:| Worker Versioning — https://docs.temporal.io/worker-versioning.md | docs | A | scope | § Pinned Workflows sha256 15841c50876fe839f1a3bc8d31a77a9c3ccbb1f60f9a67a0f2c6e1fe0249f75d | phantom | shim | mined | 2026-10-25 | 90d | corpus/knowledge/temporal-worker-versioning-pinning.md |
```

The same committed control records `DOCTRINE61_HELD held=6/6`, specifically `E3 PASS status=mined opened=2026-10-25 used-by=corpus/knowledge/temporal-worker-versioning-pinning.md`, and `sources-census.sh validate --root … kumitate` exit 0. The companion committed spot-check, `corpus/lessons/round-61-verifier-spotcheck.md` lines 120–127, identifies the fixture rev as `4247d2d`, places the phantom row at `SOURCES.md` line 273 under `## Leads (unopened)`, and explains that the colon makes it match the probe's misparsed character class.

**Why E3 accepts it.** The committed frozen probe `.ufo/waves/round-61/probe/doctrine61-probe.mjs` (unchanged current r62 copy per assignment) runs `git show <rev>:corpus/SOURCES.md`, then uses `/^\|[[:space:]]*S195[[:space:]]*\|/` with `.find` across the entire file. It never tracks the current Markdown heading or constrains the search to `## Registry`. JavaScript treats `[[:space:]]` as a character class containing `[`, `:`, `s`, `p`, `a`, `c`, `e` and `]`, so `|:S195:|` matches. The row's split cells 9, 10, and 12 are exactly `mined`, `2026-10-25`, and the claimed entry path; E3 therefore returns PASS despite no Registry row.

**Why the census does not reject this fixture.** The committed control's recorded census output is exit 0, not a rejection. Thus this exact forged fixture does **not** demonstrate “E3 accepts while census section scope rejects”: the census accepted it too. This distinction is material—the source spot-check's text says the row is outside Registry, but its census observation is explicitly successful. The supported counterexample is narrower and concrete: E3 is unscoped and accepts an out-of-Registry row; this fixture does not prove a census rejection. Do not attribute a census rejection to it.

**Evidence pointers:** committed forged-control blob above; `.ufo/waves/round-61/probe/doctrine61-probe.mjs` E3 block; `corpus/lessons/round-61-verifier-spotcheck.md` lines 120–127. Read-only; no fixture execution, mutation, tests, or installs performed.
