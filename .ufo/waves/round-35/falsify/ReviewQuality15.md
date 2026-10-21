ATTACK Q15 verdict=holds defects=0

Axis: coverage.

## Grounding

- `corpus/lessons/round-35.md:13` is the named mistake: the pre-registration said “S 91/91, R 83/92”; baseline evidence recorded `S_members declared=91 computed=88` and `S_sections declared=91 computed=86` at `31c465f1`.
- Evidence: `.ufo/waves/round-35/baseline/proxy.txt:1-11` records the command with `--src /fast/scratch/kumitate-r35/src`, `src=31c465f15669f744848bd9f5d56191c5085670f7`, the two drift results, and `exit=1`.
- Reproduction command: `cd /fast/scratch/kumitate-r35/master-tree && node scripts/proxy-check.mjs --src /fast/scratch/kumitate-r35/src; echo "exit=$?"`. Output included `S_MEMBERS_DRIFT ... declared=91 computed=88`, `S_SECTIONS_DRIFT ... declared=91 computed=86`, and `exit=1`.

## Testability

The criterion has observable predicates: find an upstream S/R member, section, or anchor count; identify the immutable source revision in its measurement context; verify the cited source is a pinned read-only clone; and compare pre-registered values with the round-open measurement before work. For this round, `git -C /fast/scratch/kumitate-r35/src rev-parse HEAD` returned `31c465f15669f744848bd9f5d56191c5085670f7`; `git -C ... merge-base --is-ancestor 964f443e 31c465f1` returned `ANCESTOR-OK`; `ls -ld` showed `dr-xr-xr-x` for the clone. This is a manual record check, not a new automated gate.

## Non-redundancy

`corpus/QUALITY.md:45-49` Q8 requires installed-host/version skew and the revision gap for upstream facts; it does not require S/R counts to be measured against a pinned clone. `:70-73` Q13 requires open-time gate reruns and disposition of DRIFT; it does not pin the source or require the remeasurement before implementation. Q15 at `:78-84` adds those provenance and ordering constraints. The open-time re-run clause overlaps Q13, but Q15's pin/source requirements and pre-work timing remain distinct.

## Own-record sweep

I searched the round-35 additions and followed every origin-count candidate to its measurement context. The diff grep surfaced the round-32 summary at `LOG.md:1225-1228` (`S 91/91`, `R 75/92`, “at `5d250b4`”) and `SCORECARD.md:404` (`S 74/114`, `R 69/98`, `S 91/91`, `R 75/92`). Those are historical round-32 values, not round-35 measurements. The unchanged section immediately below, `LOG.md:1236-1244`, names the measured source boundary `5725fa7d3` → `964f443e` and associates the before/after member and section counts with it; the SCORECARD row points to that section. Thus these summary lines do not leave their source revision unidentified. The historical before-state uses `5725fa7d3`, not a round-35 pin.

The round-35 measurements themselves name the pin: `LOG.md:1577-1580` gives the full `31c465f1` clone identity and baseline evidence path; `LOG.md:1598-1601` names `31c465f1` for C2; `SCORECARD.md:315` and `:399-400` name `31c465f1`; the retro-admission at `LOG.md:1640-1644` names `964f443e` and uses the pinned-clone archive. The Q15 grounding itself is explicitly marked stale/current in `SCORECARD.md:469-470` (`964f443e` → `31c465f1`).

Search command used for candidate discovery: `git diff master -- LOG.md | grep '^+' | grep -nE '=[0-9]+|[0-9]+/[0-9]+|[0-9]+ (members|sections|anchors|rows)' | grep -vE '31c465f|964f443|2cad708|1770305|5d250b4|16a5441|6b982ab' | cut -c1-220`. It surfaced `unchanged): S 91/91 ⇒ coverage:script-layer 10, R 75/92 ⇒`; follow-up at `LOG.md:1236-1244` resolved the source boundary as above. No current round-35 origin-tree count was left without a revision.

## Findings

None.

## Residual risk and verification gaps

The candidate grep is intentionally broad and line-oriented; the historical round-32 summary relies on its explicitly referenced section for the source boundary rather than repeating the hashes on the summary line. If Q15 intends same-line attribution, state that scope or repeat the source revision in those summaries. This does not alter the traced round-35 measurements.