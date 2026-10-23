RESULT ReopenS058 rev=8e822511 verdict=verified words=10

Item: re-open SOURCES row S058 at lane revision 8e8225114dccb31d33fbcb76df78052807a33068;
check the quote is verbatim at its locator and at most 25 words, the anchor, file digest and
fleet commit, the kind and tier against the frozen contract, and that the census rule and
the knowledge entry citing it say what the source says.

Verdict: verified. The quoted bytes, locator line, file digest, commit ancestry, kind and tier
all hold, and both citing artifacts (census rule, knowledge entry) state what the source states.
One bookkeeping seam (used-by cell) and one soft inference (the word "operator") are recorded
below; neither is a false claim by the row.

## The row (lane rev 8e822511)

Committed line 71 of corpus/SOURCES.md; `awk -F'|' 'NF'` on that row prints 13, and
`grep -c '^| S058 ' corpus/SOURCES.md` prints 1, so the row is well formed and unique.
Fields as parsed: id S058; kind own-work; tier B; status mined; opened 2026-10-23; recheck 30d;
used-by `scripts/omp-census.mjs` at this revision.

## Source re-opened by ordinary means

The source is first-party, a local fleet file, read through git rather than a network fetch:

    git -C /home/vgpnk/Projects/shokunin show 84b9519a63597eff3f482bbdb2022cba6b44a880:.ufo/waves/hyaku/PHASE4.md

Line 112 at that commit begins `| 2026-10-23T00:45:34Z | INCIDENT: omp credential store corrupt; restored |`,
exactly the incident row the anchor names.

## Quote: verbatim, single occurrence, 10 words

Extracted the teaches cell's quoted span from the committed row and tested containment in line 112
of the committed blob with Python:

    verbatim in line112: True
    occurrences in whole file: 1
    words: 10

The same span through the item's counter:

    $ printf '%s' "pre-restore snapshot \`agent.db.pre-restore-20261023T004529Z{,-wal,-shm}\`; restored through the SQLite backup API (\`.restore\`)" | wc -w
    10

Counting the cell's trailing annotation as well ("— operator recovery chains, UTC basic stamps")
adds 7 words, 17 total, still under the 25-word ceiling. The quote starts mid-sentence after the
source's semicolon and is byte-identical from there on.

## Anchor, digest, commit

- file sha256 at 84b9519a: `3a0b8d896565dfa6772921ee35d395911e95e174adea834f11c8d1196e9ff1ed`,
  the digest the anchor prints. The blob at fleet HEAD 8d77e6c15a6b has the same digest and
  line 112 is still the same incident row, so the pin has not drifted.
- `git merge-base --is-ancestor 84b9519a... HEAD` exits 0: the pinned commit is an ancestor of
  the fleet tip (commit date 2026-10-23T01:31:02Z by way of 22:31:02 -0300, after the 00:45:34Z
  incident row it contains).
- The anchor's supporting negative: cloned `--branch v18.12.6` of can1357/oh-my-pi, HEAD
  `45c35e40c46166dc726ccc52f5d27f40f2449f99` (the pin the row cites), then
  `git grep -c pre-restore` exits 1 with no output: 0 hits, as claimed.

## The quote's shape is real on this host (metadata only)

`stat` on the four literal names in the quote, never reading, copying or hashing:

    agent.db.pre-restore-20261023T004529Z      regular file mode=600
    agent.db.pre-restore-20261023T004529Z-shm  regular file mode=600
    agent.db.pre-restore-20261023T004529Z-wal  regular file mode=600
    agent.db.recovered-20261023T004505Z        regular file mode=600

So the brace shorthand `{,-wal,-shm}` in the source names three files that exist, and the recovered
file exists under its own stamp.

## Kind and tier against the contract

The frozen definitions in force are `.ufo/waves/kaika/SOURCES-CONTRACT-v1.md`, carried verbatim as
`/home/vgpnk/Projects/shokunin/CORPUS.md` line 64 onward; `corpus/SOURCES.md:5-6` points at them and
`corpus/QUALITY.md:3` repeats the pointer. There is no `CORPUS.md` inside the lane at 8e822511.

- kind own-work: the contract says own-work's source cell is "a repo path or command". The cell is
  the record's title plus the fleet repo path, so the shape fits. The record is the fleet's own
  operational record, the same convention rows S061 and S038 use.
- tier B: the scope is another lane's incident record of an operator-side restore. Tier B
  ("strong secondary, expert write-up with reproducible detail") fits: the row carries quick_check
  findings, exact filenames, timestamps and an integrity result. Tier A is reserved for primary code,
  specs, maintainer statements or the lane's own re-runnable output, none of which this is. No tier
  inflation; if anything the grade is conservative. The round lesson states the same reason ("Tier B,
  not A: an operator incident record, the only record of a writer no code implements").

## The citing artifacts say what the source says

Census rule, `scripts/omp-census.mjs` lines 91-92 at 8e822511 (identical in the measured census,
sha256 fd4d1c4e...):

    agent-pre-restore  re /^agent\.db\.pre-restore-\d{8}T\d{6}Z$/  kind file, mode 0o600,
      "snapshot taken by the operator before a restore (not an OMP writer)"
    agent-recovered    re /^agent\.db\.recovered-\d{8}T\d{6}Z$/    kind file, mode 0o600,
      "rebuilt by the operator with sqlite3 .recover (not an OMP writer)"

- The regexes accept the exact literal names the quote and the host carry.
- "sqlite3 .recover" and "before a restore" both come straight from the source sentence the quote
  is taken from (`sqlite3 .recover` → the recovered file, then the pre-restore snapshot, then the
  backup-API restore).
- mode 0o600 is not asserted by the source; it is the live observed mode above and the mode recorded
  in the case mirror, so the rule adds measurement, not a claim attributed to S058.

Knowledge entry `corpus/knowledge/omp-agent-root.md` line 45 at 8e822511 (blob cf6a907e...):
the pre-restore and recovered families are "the operator's recovery procedure (`sqlite3 .recover`,
backup-API restore), not OMP", sourced "S058; `git grep pre-restore` over the v18.12.6 tree → 0 hits".
Every element traces to the source or to the verified grep.

## Seams recorded, not scored as false

1. used-by at this revision lists `scripts/omp-census.mjs`, which does cite S058 and does exist, but
   the entry that also cites the row (`corpus/knowledge/omp-agent-root.md`, committed at this
   revision, cites it at line 1 and line 45) is not listed, and the contract defines used-by as
   "knowledge entries or lessons citing the row". Ten rows use a script path here (S038, S053-S061),
   so this is a lane-wide convention rather than an S058-only slip. The working tree is being edited
   while this seat ran: `corpus/SOURCES.md` is b7dd7eeb... against e474fb16... at the revision, and
   the working copy's S058 used-by already reads `corpus/knowledge/omp-agent-root.md,
   corpus/lessons/round-44.md`. At the judged revision `corpus/lessons/round-44.md` is not committed
   at all, so its Gate quote record cannot be judged there; the working copy records the same
   10-word quote, the locator "line 112 at fleet 84b9519a" and the open date.
2. The word "operator" (entry, census notes, teaches annotation) is not a literal token in the
   source, which is written in the passive ("restored through the SQLite backup API"). It is a
   sound reading of a first-party fleet incident record of the host's own repair plus the verified
   0-hit grep, and the round lesson marks the attribution as the record's rather than an
   observation, so I record it as inference-supported, not as a defect.

## Limits of this check

- The seat attribution "(seat ScoutOmpChains)" inside the anchor cell cannot be verified from this
  position; the grep result it labels is verified.
- Who physically typed the restore command is not in the source; see seam 2.

No gate, counter or selftest was run for this item, so no sandboxed run was needed; the only process
time was git, grep, python and stat. No tool was installed or updated. The oh-my-pi clone lived only
under /fast/scratch/hyaku/kumitate-r44/seats/w2-ReopenS058-2/ and was deleted after the digests above
were taken.
