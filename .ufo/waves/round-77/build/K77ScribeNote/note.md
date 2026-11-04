source: S227 https://www.sqlite.org/atomiccommit.html#_hot_rollback_journals; https://www.sqlite.org/atomiccommit.html#_rolling_back_incomplete_changes; https://www.sqlite.org/atomiccommit.html#_deleting_or_renaming_a_hot_journal
verified-at: 4dc470a1
recheck: 180d

# Crash-recoverable two-file adoption

## Problem and evidence boundary

Two individually atomic renames do not make one cross-file transaction. The round-77 frozen plan, § C2, records the round-76 adoption window: a kill between the README rename and the readme-map pin rename leaves only one destination updated. It also records the separate row-placement defect: the row went after the coverage-map table. This entry describes the frozen `kumitate-spotcheck-adopt-v2` contract at `4dc470a1`, not an observed implementation pass. Execution acceptance belongs to that plan's frozen C2 counter and its eventual measured revision.

S227 grounds the journal-before-change and next-open recovery mechanism, not an equivalence between this tool and SQLite. Its §4.2 states: “A hot journal only exists when an earlier process was in the middle of committing a transaction when it crashed or lost power.” (23 words, whitespace-delimited.) Section 3.5 describes recording original bytes before database changes; §4.4 describes restoring those bytes. The pinned local capture is `.ufo/waves/round-77/open/captures/sqlite-atomiccommit.html`, SHA-256 `5a5be7b660217c9408c8a81eaf2faa2d08832ed3790f895a0a713916ad856ea1`, registered in `.ufo/pins/source-captures.json` at `4dc470a1`.

## Publication and recovery ordering

The lane-specific adaptation is specified by `.ufo/waves/round-77/plan.md`, § C2, Contract:

1. Stage `.ufo/pins/adopt-journal/<uuid>.tmp/` with `manifest.json`, `README.pre`, and `readme-map.pre`.
2. Rename the staged directory to `<uuid>/` before writing either destination. The manifest uses `kumitate-adopt-journal-v1`, an absolute `lane`, the lesson `target`, its map `key`, and pre-image records containing `path`, `file`, and `sha256`.
3. Write the README row and the readme-map pin, then remove the published journal.
4. On the next non-selftest invocation, recover before executing the requested `--adopt`, `--check`, or `--predict` arm. Consult the coverage oracle for the journaled key: retain an already clean pair, or restore both pre-images after checking their SHA-256 values against the manifest.

This is the S227 ordering idea applied to two lane-owned text files. The recovery decision is the lane's coverage oracle; it is not SQLite's hot-journal test. The same frozen contract requires inserting an adopted lesson row immediately after the last existing lessons row inside the coverage-map table, not appending at EOF (plan § C2, Row placement; predicate c2.11).

## Observable states and refusal

These are required outputs, not outputs observed by this note-writing seat (plan § C2, Recovery; predicates c2.2–c2.8):

| State | Required line | Meaning |
|---|---|---|
| rolled-back | `RECOVERED <target> rolled-back` | The oracle is not clean; verify both pre-image hashes, restore both files byte-exact, then remove the journal. |
| complete | `RECOVERED <target> complete` | The oracle is clean; remove the journal without changing destination bytes. This recognizes completed writes, rather than replaying a forward image. |
| stale | `RECOVERED - stale` | Remove an unpublished `<uuid>.tmp` directory without changing either destination. |

A published journal naming another absolute lane must produce `REFUSED_JOURNAL_FOREIGN`, exit 2, and retain both the journal and destination bytes (plan § C2, predicate c2.6). That journal is evidence, not garbage. S227 §9.5 explains why discarding or renaming recovery evidence can prevent recovery; the particular foreign-lane refusal is this lane's contract, not a SQLite API.

## Honest limits

The contract supplies no lock: single-writer operation is an assumption, not a concurrency guarantee. A kill before the staging-directory rename leaves no published journal and no destination write; a leftover staged directory is the stale case above. A kill after publication leaves recovery evidence for the next invocation; recovery is not an assertion that readers cannot observe an intermediate pair (plan § C2, journal ordering and crash predicates).

The pre-image SHA-256 check protects rollback against mismatched saved bytes; it is neither authentication of the journal nor a substitute for serialization. No power-loss durability or SQLite-equivalent transaction guarantee follows from the SIGKILL predicates. S227 itself discusses locking and storage flush assumptions; this entry borrows the journal ordering, not those database guarantees. The tool's default-mode semantics and the frozen counter remain the implementation authorities; this draft supplies no execution verdict.
