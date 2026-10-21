ITEM FixNTL05 anchors=3 move=3 token=0 move_token=0 debt=0
VERDICT native-trial-launch#15 MOVE 873 | note 372 "dispatch graph `validateDispatches` (`:869`)" names the function; pin 873 is its top-level definition `function validateDispatches(parentKey, actual, expectedKeys) {`; pin 869 is the `missing_seats: ${uncoveredSeatIds.length} frozen seat(s) have no agent at collection...` template inside the `die(` guard at 868 and does not contain the symbol; 916 and 931 are call sites
VERDICT native-trial-launch#16 MOVE 955 | note 373 "durable evidence via `writeEvidenceFile` (`:951`)" names the function; pin 955 is its top-level definition `function writeEvidenceFile(dest, content) {`; pin 951 is the comment `// P2 (spec 02 §3): seats whose observed interval exceeded their deadline,` with no symbol; round-36 977 is persistEvidenceWrites' definition, the one-symbol-off error
VERDICT native-trial-launch#17 MOVE 977 | note 373 "`persistEvidenceWrites` (`:973`)" names the function; pin 977 is its top-level definition `function persistEvidenceWrites() {`; pin 973 is `  } finally {` closing the try at 968 inside writeEvidenceFile (955-976); 1780 `persistEvidenceWrites();` is a call
Evidence:
- pin HEAD `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` = 31c465f15669f744848bd9f5d56191c5085670f7 (matches the item pin); `wc -l` = 1811
- `sed -n '869p;873p;951p;955p;973p;977p'` printed the six pin lines quoted above, in file order
- grep of the three names: validateDispatches 873(def),916,931; writeEvidenceFile 955(def),1011,1014,1778; persistEvidenceWrites 977(def),1221,1780; the three defs are column 0
- calibration: the note's other anchors in this section match pin definitions exactly: :118 `const COLLECTOR_USAGE`, :120 `function parseArgs(argv)`, :205 `function assertWaveDispatchToken(`
- the three failing anchors are each exactly +4 below their definitions at pin (869->873, 951->955, 973->977); the cause (lines inserted between 205 and 869) is [INFERENCE], not checked
- anchors sit on note lines 372 (`:869`) and 373 (`:951`, `:973`); the block starts at 369; sentences read at 367-375
- out of scope, not an anchor: note header says "(1804 L)" but the pin file is 1811 lines
- no installs or updates; no lane scripts run; no lane git/jj touched; this report is the only file written
