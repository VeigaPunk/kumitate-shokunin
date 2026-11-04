source: S227 https://www.sqlite.org/atomiccommit.html (sections 3.5, 4.2, 4.4, 9.5); lane evidence `.ufo/waves/round-77/plan.md` § C2 and `scripts/spotcheck-adopt.mjs` at the round-77 work commit
verified-at: 2026-11-04 (round-77 work commit; `C77_C2: HELD held=13/13` at `.ufo/waves/round-77/close/c2-probe.txt`)
recheck: `node .ufo/waves/round-77/probe/probe77.mjs --set c2 --lane . --work "$(mktemp -d)"` → `C77_C2: HELD held=13/13`

# Crash-recoverable two-file adoption

## Problem

Two individually atomic renames do not make one cross-file transaction. Round 76 shipped
`scripts/spotcheck-adopt.mjs` v1, which repaired a missing README map row and its
`readme-map.json` pin by staging each file and renaming it into place; a SIGKILL between the two
renames left a half-state that only a later hand run repaired (the v1 header states the limit).
The same writer appended its row at end-of-file, after the `## Frontier` prose, on its first live
run (round-76 lesson, mistake `adopt-appends-at-eof`).

## Mechanism (contract `kumitate-spotcheck-adopt-v2`)

The writer applies the rollback-journal ordering S227 documents for an interrupted multi-file
commit: evidence of the change is durable **before** the change.

1. Stage `.ufo/pins/adopt-journal/<uuid>.tmp/` with `manifest.json` and both pre-images
   (`README.pre`, `readme-map.pre`), each with a sha256 in the manifest.
2. Rename the staged directory to `<uuid>/` — the journal is now published — **before** either
   destination write.
3. Write the README row and the pin, then retire the journal by renaming it to `<uuid>.done`
   before recursive deletion, so a kill during cleanup cannot leave a half-journal.
4. On the next non-selftest invocation (`--adopt`, `--check`, `--predict`), recover first:
   - a `<uuid>.tmp` or `<uuid>.done` is removed and reported `RECOVERED - stale`;
   - a journal whose manifest `lane` is not this lane is refused `REFUSED_JOURNAL_FOREIGN`
     (exit 2) with the journal and both destinations retained — it is evidence, not garbage;
   - if the coverage oracle is CLEAN for the journaled key, the journal is retired and the line
     is `RECOVERED <target> complete` with destination bytes untouched;
   - otherwise both pre-image files are read, their sha256 checked against the manifest, both
     destinations restored byte-exact, the journal retired, and the line is
     `RECOVERED <target> rolled-back`. A corrupt pre-image is `REFUSED_ORACLE` (exit 2) with the
     journal retained and no destination touched.

The row placement rule is separate but was landed with the same contract: insert immediately
after the last existing ``| `lessons/` `` row inside the `## Coverage map` table, never at EOF.
Both destination parents and the journal parent are canonicalised (`realpath` of the child
directory equals the lane's own directory), so a symlinked `corpus/` or `.ufo/pins/` is
`REFUSED_PATH_ESCAPE` (exit 2) instead of an outside-lane write.

## Observable evidence

The frozen counter drives real SIGKILL windows (`SPOTCHECK_ADOPT_TEST_CRASH=journal|row|pin`,
a documented test-only seam) in child processes and requires one exact recovery line plus the
requested arm's output:

| kill window | state on disk | next invocation |
|---|---|---|
| after journal publication | no destination written, journal present | `RECOVERED <target> rolled-back`; pre-crash bytes restored |
| after the README rename | row only, journal present | `RECOVERED <target> rolled-back`; both files byte-exact |
| after the pin rename | both writes applied, journal present | `RECOVERED <target> complete`; bytes unchanged |

`node .ufo/waves/round-77/probe/probe77.mjs --set c2 --lane .` → `C77_C2: HELD held=13/13`
(receipt `.ufo/waves/round-77/close/c2-probe.txt`; selftest 26/26). The live 6th recurrence (the
round-76 closure lesson) was repaired in the scaffolding commit by the same two-line rule.

## Limits (stated, not hidden)

- **No lock.** One writer per lane is an assumption; two concurrent invocations can race on one
  journal (the second may retire the first's journal). Serialize externally or accept the race.
- **Process crashes, not power loss.** Rename ordering is crash-safe against SIGKILL; no `fsync`
  contract, no durability across power loss, and no claim of SQLite-equivalent transactions.
- **Pre-images are whole files.** The journal copies `corpus/README.md` and
  `.ufo/pins/readme-map.json`; a credential mistakenly placed in either would be copied.
- **Not authentication.** The manifest sha256 detects mismatched stored bytes, not a hostile
  writer who can rewrite the journal and the manifest together.

S227 grounds the ordering and the next-open replay, not equivalence: its locking, page checksums
and super-journal do not transfer, and its §9.5 finding — a renamed journal is invisible to
recovery — is why this contract keeps journal names stable and refuses rather than renames a
foreign journal.
