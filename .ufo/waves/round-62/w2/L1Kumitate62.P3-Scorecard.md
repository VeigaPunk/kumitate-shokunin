# C1 P3: historical row passes the round-61 name test

**Finding.** P3 does not establish a round-61 capability acquisition. It accepts the inherited `dispatch-evidence` capability row from round 60, even though round 60's own correction explicitly says its acquisition was unprovable/not admitted, and round 61's correction says that row remains history only.

**Exact counterexample.** At committed lane revision `f351c520bfc4ce193a61145bdfecbcf1cb20db01`, SCORECARD.md line 1794 is:

> `| dispatch-evidence | … ; first working round 60 | 60 |`

The exact full line is `SCORECARD.md:1794` at that revision (row text includes the live command and selftest, and its terminal provenance cell is `60`). This row satisfies the frozen P3's condition: it is found in the `## Capabilities` section and its text contains both `dispatch-evidence` and `|`; `/round 61/` matches the literal substring `round 61` appearing in the row's contract description, “routed R58-V2 turned from prose into a gate”. Thus P3 emits `held=true` despite the row's first-working-round being 60 and no current round-61 capability acquisition.

**Counter match.** Probe source `.ufo/waves/round-61/probe/dispatch61-probe.mjs:23-25` fetches the revision's SCORECARD, splits at `## Capabilities`, finds the first pipe-row containing `dispatch-evidence`, and checks only `/round 61/.test(row)`. It neither parses the final provenance cell nor binds a new capability/output to round 61. Meanwhile the same committed scorecard's round-60 correction says `dispatch-evidence` reads “unprovable / not admitted” and its capabilities row “stays as history only” (SCORECARD.md, `## Round 61 correction`; corroborated by `corpus/lessons/round-61-verifier-spotcheck.md:62-65`, which records the P3 miss at the actual round-61 tip where the row then lacked the substring). The later historical wording in that row is enough to flip P3 without a round-61 acquisition.

**Evidence pointers.** `SCORECARD.md:1794` at `f351c520bfc4ce193a61145bdfecbcf1cb20db01`; `.ufo/waves/round-61/probe/dispatch61-probe.mjs:23-25`; `SCORECARD.md` round-60 correction and round-61 claims/correction sections; `corpus/lessons/round-61-verifier-spotcheck.md:62-65`.