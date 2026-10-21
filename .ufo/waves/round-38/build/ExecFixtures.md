EXEC ExecFixtures cases=15 path=/fast/scratch/kumitate-r38/ExecFixtures/fixtures.json
FIXTURE id=clean-true expect_exit=0 expect_id=CLEAN
FIXTURE id=next-symbol-shift-regressed expect_exit=1 expect_id=REGRESSED
FIXTURE id=positional-run-clean expect_exit=0 expect_id=CLEAN
FIXTURE id=positional-run-swapped-regressed expect_exit=1 expect_id=REGRESSED
FIXTURE id=at-path-n-sym-convention expect_exit=0 expect_id=CLEAN
FIXTURE id=de-backticked-symbol expect_exit=0 expect_id=CLEAN
FIXTURE id=escaped-backtick-spans expect_exit=0 expect_id=CLEAN
FIXTURE id=bare-path-across-headings expect_exit=0 expect_id=CLEAN
FIXTURE id=range-anchor expect_exit=0 expect_id=CLEAN
FIXTURE id=dead-line-beyond-eof expect_exit=0 expect_id=CLEAN
FIXTURE id=review-override-valid expect_exit=0 expect_id=CLEAN
FIXTURE id=review-override-absent-from-sentence expect_exit=1 expect_id=OVERRIDE_INVALID
FIXTURE id=debt-grew-vs-base expect_exit=1 expect_id=DEBT_GREW
FIXTURE id=fixed-debt-left-in-pin expect_exit=1 expect_id=DEBT_STALE
FIXTURE id=anchor-set-changed expect_exit=1 expect_id=ANCHOR_SET_CHANGED
EVIDENCE command: node -e with JSON.parse plus fixture-id, expected-status, shape, and source-line-bound assertions on /fast/scratch/kumitate-r38/ExecFixtures/fixtures.json.
EVIDENCE observed: valid fixtures=15; case ids/statuses exact; unique ids; each source <=6 lines.
EVIDENCE design read: gate-design.md lines 16-63; covered anchor parsing, pairing, override validation, drift ids, and debt checks.
EVIDENCE limitation: the gate selftest itself was not executed; this deliverable is the hermetic fixture manifest and its JSON/schema validation only.
