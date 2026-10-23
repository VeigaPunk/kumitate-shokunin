RESULT ReopenS074 rev=a2e5b54c verdict=confirmed quotes_found=1/1

# ReopenS074 — re-derive S074 (jj status --help, installed jj 0.45.1-7c41cdeb…)

Item: RE-DERIVE inherited candidate SOURCES row S074. Re-opened the source by ordinary means
(local command output of the installed binary, allowed by the sourcing rule); no browser, no
install/update needed (viol tool recorded). Lane tip a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f;
host jj version re-read. Scratch only under /fast/scratch/hyaku/kumitate-r45/seats/a2-ReopenS074/.

## Re-open (exact command and observed output)

$ cd /fast/scratch/hyaku/kumitate-r45/seats/a2-ReopenS074
$ unset $(git rev-parse --local-env-vars)
$ jj status --help > jj_status_help.txt 2>jj_status_help.err; echo exit=$?
exit=0
$ jj --version
jj 0.45.1-7c41cdeb16b6b321c64e789a966b6adf723816a5
$ wc -l jj_status_help.txt; wc -c jj_status_help.err
119 jj_status_help.txt / 0 jj_status_help.err (stdout only, no stderr)
$ sha256sum jj_status_help.txt
2307dec8feff9498850918be714615d68cb512b00655832bdc49a5bcc865370d

## Check 1 — locator exists and matches teaches/gloss: CONFIRMED

Locator: "stdout lines 34-41" of `jj status --help`. Observed lines 34-41 (awk, line numbers):
34:  Don't snapshot the working copy, and don't update it
35:  (blank)
36:  By default, Jujutsu snapshots the working copy at the beginning of every command. The
37:  working copy is also updated at the end of the command, if the command modified the
38:  working-copy commit (`@`). If you want to avoid snapshotting the working copy and instead
39:  see a possibly stale working-copy commit, you can use `--ignore-working-copy`. This may be
40:  useful e.g. in a command prompt, especially if you have another process that commits the
41:  working copy.
The lines state (a) the default snapshot behaviour and (b) what `--ignore-working-copy` skips
("Don't snapshot the working copy, and don't update it"; "you can use `--ignore-working-copy`"),
i.e. exactly the row's teaches "when jj snapshots the working copy and what --ignore-working-copy
skips (host binary)" and gloss. CONFIRMED.

## Check 2 — verbatim quote(s) the draft attributes to S074: 1/1 CONFIRMED

grep -n 'S074' /fast/scratch/hyaku/kumitate-r45/a2/inherited-entry-draft.md → two hits:
header line 1 (source list, not a quote) and M1 (line 38). The draft attributes exactly one
verbatim quote to S074, in M1:
  «By default, Jujutsu snapshots the working copy at the beginning of every command.»
Normalized per K3 (strip « », fold apostrophe variants): "By default, Jujutsu snapshots the
working copy at the beginning of every command." — 13 words (printf|wc -w), <=25.
Found verbatim in the fetched bytes: `grep -nF 'By default, Jujutsu snapshots the working copy
at the beginning of every command.' jj_status_help.txt` → line 36, inside the stated section
(lines 34-41). CONFIRMED (quotes_found=1/1).

## Check 3 — pinned sha256: CONFIRMED

Row pins capture sha256 2307dec8feff9498850918be714615d68cb512b00655832bdc49a5bcc865370d.
My fresh capture hashes identically (above). No live-page drift issue (local binary output, exact
same build). CONFIRMED.

## Check 4 — kind/tier per QUALITY Q2 (tier A only for primary/official): CONFIRMED

Source is the installed jj 0.45.1-7c41cdeb… binary's own --help text: vendor-authored,
self-documenting, pinned to the exact build the lane runs — primary/official, not community
(community is never tier A per Q2). Kind "tool" for local command output has lane precedent:
S004 (`omp --version` stdout, kind=tool, tier=A) and S035 (own-work, tier=A). Version pinned in
the row's source column; recheck "on-release" fits. CONFIRMED.

## Check 5 — rejected-row reason: N/A (S074 status=mined, not rejected; S075/S076 are the rejected rows)

## Row text

No correction needed; the inherited S074 row text stands as-is.

## Verification gaps / residual

- The seat reports DemoJjSnapshot.md and ScoutContainmentRules.md (attempt 1) claim the same
  sha256 and the same quote; my independent run confirms both. Their longer two-sentence quote
  spans wrapped lines 36-38 in the shared bytes; the draft does not attribute that longer string
  to S074, so it is not counted.
- No lane/fleet/jj writes were made; no sibling lane or operator config touched; scratch left
  only in the a2-ReopenS074 seat dir; no processes left (no background jobs started).
