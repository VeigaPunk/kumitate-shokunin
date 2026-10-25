# C1 attack: author-supplied session strings are not dispatch proof

## Finding (high)

The frozen C1 path treats a session-shaped string supplied by the lane as evidence that an agent was dispatched. Both the progress TSV and registry are ordinary files under the lane-controlled wave directory; the gate reads those files and checks internal consistency, but never resolves session IDs against an external session/history record. Thus an author can fabricate the identity and make the gate credit seats that never existed.

## Committed evidence

At round-61 tip `f351c520bfc4ce193a61145bdfecbcf1cb20db01`, `scripts/dispatch-evidence.mjs` parses the progress file's `session=` field and credits every non-null value (`parseProgress`, then `inspect`'s `if (row.session) sessions += 1`; a zero-session case alone adds `NOT_A_DISPATCH`). For each progress row it checks only matching report-file existence/size, and compares counts/dead names to `dispatch-actual.json`. The registry's member IDs are only checked as a null/non-null aggregate and are not compared to progress session strings or validated externally. Its selftest `writeFixture` itself generates `session_${n}` as IDs and verifies a clean result, demonstrating the accepted identity is just caller-chosen text.

The committed real dispatch record at that same revision contains 32 `L1Kumitate61.<seat>` IDs in both `launcher-progress.tsv` and `dispatch-actual.json`; registry metadata reports all 32 completed. However, the gate has no code path to establish that those strings resolve to real spawned sessions or settled results. The `dispatch61-probe.mjs` P2 also runs this gate against the current filesystem and merely confirms that the revision tree has progress, registry, and >=32 markdown report names. Its P1 selftest and P2 cleanliness do not provide independent identity provenance.

The non-author spotcheck independently recorded the same exact defect in `corpus/lessons/round-61-verifier-spotcheck.md` lines 77–89: the critic's fabrication fixture (`ab902da2…`) had `Seat01 pid=1001 … exit=0 start=1 end=2` and a fabricated report per seat, yet every P-check was fabricable, and the committed receipt `close/a2-repro-c1-fabrication.txt` recorded `HELD 4/4`. The spotcheck's routed defect at lines 218–223 specifically requires P2 to bind to evidence the lane cannot author (session IDs resolvable in `history://`, or stream files).

## Why this reaches C1

The assertion under attack is dispatch evidence, not plausibility of the submitted identifiers. The acceptance boundary is breached because a lane author controls both the claimed identity values and all files the check uses to corroborate them. A self-consistent fabricated progress file, registry, and nonempty reports therefore passes the gate without a dispatch. Same-string matching or more metadata in those files would not repair the provenance gap; verification must use an independently controlled session/stream source.

Evidence pointers: committed probe `.ufo/waves/round-61/probe/dispatch61-probe.mjs`; committed gate `scripts/dispatch-evidence.mjs`; committed records `.ufo/waves/round-61/w1/launcher-progress.tsv` and `dispatch-actual.json`; spotcheck `corpus/lessons/round-61-verifier-spotcheck.md:77-89,218-223`; committed receipt `.ufo/waves/round-61/close/a2-repro-c1-fabrication.txt`.
