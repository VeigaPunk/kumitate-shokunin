ATTACK Check52 measured=c938c068f4dbf356c0884c2121bbfe087fbe3caf ids=4 agreed=3 refuted=1 unverified=0
Axes: note debt-status fidelity; pinned source behavior; anchor-to-prose semantic fidelity.
Source pin: `/fast/scratch/kumitate-r36/src` at `31c465f15669f744848bd9f5d56191c5085670f7`; note measured from lane commit above.

OBS route-probe-cluster#101 agree | 994: `}`; 983: `if (info?.isSymbolicLink()) usage("--state refuses symlinks");` | Note marks this anchor `debt:false` (line 589); the old typed token `state_path_symlink` is absent and the live generic refusal is not a typed-code claim. This is debt, not true.
OBS route-probe-cluster#102 agree | No line 1266 (pinned file ends at 1188); 1108: `throw new Error("refusing credential-shaped route-health state");` | Note marks this anchor `debt:dead` (line 590); `credential_shaped_state` is absent and the surviving refusal is uncoded. This is debt, not true.
OBS route-probe-cluster#103 refute | 932: `function assertNoSecrets(value) {` | The note sentence at 250–252 claims this gate “defaults to code `credential_shaped_output`”; the function accepts only `value` and throws an uncoded `Error` at 939. Matching the real symbol does not make that code-default prose true.
OBS route-probe-cluster#104 agree | 939: `throw new Error("refusing to emit credential-shaped route-health output");` | Exact message and throw are present at the cited source line. This message claim is true, but it does not rescue the adjacent false code-default clause.

Smallest correction for #103: replace “defaults to code `credential_shaped_output` and message” with “throws an uncoded `Error` with message”; retain #104’s exact message anchor. No gate was run; no production source was edited.

Evidence / commands and observed output:
- `git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show c938c068f4dbf356c0884c2121bbfe087fbe3caf:corpus/knowledge/route-probe-cluster.md > /fast/scratch/kumitate-r38-falsify/Check52/route-probe-cluster.md`; `wc -l` observed `601 /fast/scratch/kumitate-r38-falsify/Check52/route-probe-cluster.md`.
- `git -C /fast/scratch/kumitate-r36/src show 31c465f15669f744848bd9f5d56191c5085670f7:scripts/probe-ufo-route-health.mjs > /fast/scratch/kumitate-r38-falsify/Check52/probe-ufo-route-health.mjs && wc -l /fast/scratch/kumitate-r38-falsify/Check52/probe-ufo-route-health.mjs`; observed `1188 /fast/scratch/kumitate-r38-falsify/Check52/probe-ufo-route-health.mjs`.
- Read pinned source lines 932–940, 971–994, and 1102–1108; read committed note lines 243–252 and debt entries 589–590. The frozen lane tree does not contain `scripts/probe-ufo-route-health.mjs`; source inspection therefore used the explicitly pinned upstream source, not the gate or moving worktree.