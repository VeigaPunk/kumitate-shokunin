VERIFIED QUOTE CANDIDATES for the C2 entry `corpus/knowledge/jj-workspace-seat-containment.md`
(`## Located quotes` bullets, J4/J5 of rule J64 v1).

Method: each candidate was run through the probe's OWN normalizer (`jj64-probe.mjs:70-78`: strip
script/style, strip tags, decode entities, map U+2018/U+2019 -> ', U+201C/U+201D -> ", U+2013/U+2014 -> '-',
drop `**`/`__`/backticks, collapse whitespace, trim) and tested for substring presence in (a) the pinned
capture and (b) a fresh live fetch of the row URL on 2026-10-25. All rows below read
`capture=Y live=Y` and are <= 25 words. Bullet shape the probe parses:
`- S### — "<quote>"` (em dash or hyphen, exactly one double-quoted span, whole line).

Rendering hazard found and avoided below: `jj-working-copy.html` (/latest/) documents `jj workspace remove`,
which the host's jj 0.45.1 does NOT have (`jj workspace remove --help` -> `error: unrecognized subcommand
'remove'`, exit 2) and which is absent from `jj-working-copy-v0.45.1.html`. Do not quote that sentence.
The Firefox page mixes U+2019 in prose with `&#39;` in code spans and has no raw ASCII apostrophe; the
probe normalizer folds both to `'`, so ASCII quotes work — but only through `norm`, never raw grep.

## S198 — https://docs.jj-vcs.dev/latest/technical/concurrency/ (15/16/19/14/21/12 words)

- S198 — "Unlike those DVCSs, Jujutsu treats concurrent edits the same whether they're made locally or remotely."
- S198 — "Jujutsu's lock-free concurrency means that it's possible to update copies of the clone on different machines"
- S198 — "The view object contains the set of visible head commits, bookmarks, tags, and the working-copy commit in each workspace."
- S198 — "It is left for the next command to notice if there were divergent operations."
- S198 — "If Jujutsu tries to load the repo and finds multiple heads in the operation log, it will do a 3-way merge"
- S198 — "The operation cannot fail to commit (except for disk failures and such)."

## S199 — https://docs.jj-vcs.dev/latest/working-copy/ (11/9/12/17/11/16/22 words)

- S199 — "You can have multiple working copies backed by a single repo."
- S199 — "Each workspace can have a different commit checked out."
- S199 — "The working copy and the .jj/ directory together is called a \"workspace\"."
- S199 — "When you modify workspace A's working-copy commit from workspace B, workspace A's working copy will become stale."
- S199 — "use jj workspace forget to make the repo forget about it"
- S199 — "the working copy ( .jj/working_copy/ ) keeps track of which operation it was last updated to"
- S199 — "If the operation has been lost, then jj workspace update-stale will create a recovery commit with the contents of the working copy"

## S200 — https://firefox-source-docs.mozilla.org/contributing/jujutsu.html (22/11/16/6/14/23 words)

- S200 — "A workspace becomes stale when a commit it depends on is rewritten from another workspace, for example by rebasing, editing, or squashing."
- S200 — "most jj commands will refuse to run on a stale workspace"
- S200 — "some mach commands invoke jj and can fail, sometimes silently, if the working copy is stale"
- S200 — "./mach vcs-setup configures snapshot.auto-update-stale = true"
- S200 — "which causes jj to automatically update a workspace's working copy when it becomes stale"
- S200 — "With auto-update disabled, most jj commands will refuse to run on a stale workspace until you manually update with jj workspace update-stale ."

Note on the last S200 bullet: the trailing ` .` is real — the source wraps `update-stale` in a code span and
the probe normalizer turns the span boundary into a space. A scribe who writes `update-stale.` MISSES J4.

Re-run: `node .ufo/waves/round-64/build/K64ExecCaptures/verify-quotes.mjs <lane> [--live]`.
