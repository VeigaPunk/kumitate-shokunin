ATTACK Check11 measured=c938c068f4dbf356c0884c2121bbfe087fbe3caf ids=4 agreed=4 refuted=0 unverified=0
Axes: anchor identity/line; semantic fit; prose/change integrity.
- Final note snapshot: `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show c938c068f4dbf356c0884c2121bbfe087fbe3caf:corpus/knowledge/native-trial-launch.md` → lines 414–424 identify policy.mjs roles and the four named references.
- Source pin check: `git -C /fast/scratch/kumitate-r36/src rev-parse HEAD` → `31c465f15669f744848bd9f5d56191c5085670f7`.
- Source snapshot: `git -C /fast/scratch/kumitate-r36/src show 31c465f15669f744848bd9f5d56191c5085670f7:scripts/collect-omp-native-handoff-lib/policy.mjs`; read the cited definition lines and bodies below.
- OBS native-trial-launch#45 agree | `export function readRoundPlan(runRoot, manifest) {` | Pin line 722 is the named definition; it reads and validates the bounded round-plan artifact, binds run/round, and returns plan data, matching “round plan.”
- OBS native-trial-launch#46 agree | `export function waveTokenFromContext(context) {` | Pin line 798 is the named definition; it extracts a unique `wave_token` from context, returns null when absent, and rejects conflicting tokens, matching “wave token.”
- OBS native-trial-launch#47 agree | `export function loadCanonicalDirective(root) {` | Pin line 897 is the named definition; it loads the trusted-root directive, rejects absent/drifting mirrors, and returns its text, matching “directive load.”
- OBS native-trial-launch#48 agree | `export function parseRateCard(budgets) {` | Pin line 926 is the named definition; it parses `budgets.rateCard` into rates while excluding invalid entries, matching “rate card.”
- Change check: e18ff1af3392e3823227644c977c237737fe65c9 and 753446a829edda519c75777ce95888443f51fa94 retain these same symbol/role pairs with old refs :704/:780/:879/:908; c938 updates the refs to :722/:798/:897/:926. No generic-token or wrong-symbol substitution is present in these four claims.
- Gate not run; verdicts above are independent note/source inspection, not gate output.
