# Collision check — ids, names, and the live registry state

Point-in-time reading: lane tip `509afb1d6ec5fc854c1398ae0060d6298ed621d1`, working tree dirty
(`corpus/SOURCES.md` modified by another writer), 2026-11-04T09:01:50Z. Receipt:
`../receipts/collision-check.txt`. The lane was moving during this seat; re-check at land time.

## Commands run and observed output

```
$ grep -oE '^\| S[0-9]+' corpus/SOURCES.md | grep -oE '[0-9]+' | sort -n | tail -1
235
$ grep -oE '^\| S[0-9]+' corpus/SOURCES.md | sort | uniq -d
(no output — no duplicate ids)
$ grep -cE '^\| S[0-9]+ \|' corpus/SOURCES.md
173
$ grep -rn 'S236\|S237\|S238' corpus/ .ufo/waves/round-80/ --include='*.md'   # excluding this seat's dir
(no output — ids free)
$ ls -l corpus/knowledge/two-reading-verdicts.md corpus/knowledge/snapshot-bound-derived-scores.md
-rw-r--r-- 4580  corpus/knowledge/snapshot-bound-derived-scores.md
-rw-r--r-- 4350  corpus/knowledge/two-reading-verdicts.md
$ git status --porcelain corpus/SOURCES.md
 M corpus/SOURCES.md
$ git show HEAD:corpus/SOURCES.md | grep -c 'S233'   # committed state
1
$ grep -c 'S233' corpus/SOURCES.md                   # live working tree
0
```

## What this means for the drafts

1. **Ids proposed: S236, S237, S238.** The live high-water mark is S235 (a rejected `clig.dev` row), so
   the three proposed rows continue the registry. They are unreserved until appended; if another writer
   mints S236+ before the L1 applies this package, renumber and re-run the duplicate check.
2. **Both entry names are already occupied** — `corpus/knowledge/two-reading-verdicts.md` and
   `corpus/knowledge/snapshot-bound-derived-scores.md` were committed at `509afb1d` with rows S233/S234.
   The drafts in this directory are therefore **alternate grounds**, not new entries. Two application
   options, and only one may be taken:
   - **(a) Keep the applied grounds** (Entry A on S119, Entry B on S234): do **not** append S236–S238.
     They would be `mined` rows with no citing entry. This seat's drafts then stand as review evidence
     only.
   - **(b) Adopt this package**: append S236–S238, edit the two entries' `source:` lines to the trio in
     each draft, and replace the two `corpus/README.md` rows with `README-map-rows.md`. S234's row is
     unchanged (`used-by` already names the entry path).
3. **The S233 row is the round's own reference-drift instance.** `509afb1d` committed S233 (Kubernetes
   probes) beside S234; the live tree removes S233 and extends S117/S119's `used-by` to
   `corpus/knowledge/two-reading-verdicts.md`, and the README row moves S233 → S119. S119's URL is
   byte-identical to S233's (`https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/`),
   so the committed increment briefly carried two registry rows for one page. Recorded here, not
   re-decided by this seat.

## Checks this seat did not run

- No duplicate-URL check across the whole registry beyond the S119/S233 pair named above.
- No `cite-check.mjs` run (the drafts are not in the lane, so their pointers are not yet in its scope).
- No check that S236–S238 stay free after the L1's next write; the receipt is a point-in-time reading.
