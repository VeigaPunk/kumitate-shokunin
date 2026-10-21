ATTACK Check27 measured=c938c068f4dbf356c0884c2121bbfe087fbe3caf ids=4 agreed=4 refuted=0 unverified=0
Axis: script-layer anchor-to-prose fidelity; scope limited to assigned final anchors.

OBS remaining-scripts-census#232 agree | `29 import { readBoundedFile, writeFileAtomic } from "./ufo-mission-result.mjs";` | This is the exact shared-helper import; the sentence separately cites its actual input callsites at 114, 251 and 306, so the pairing is not substituting an unrelated token for use.
OBS remaining-scripts-census#233 agree | `84 const MAX_REPO_FILE_BYTES = 1024 * 1024;` | Defines the local 1 MiB byte bound named in the prose, and the cited read sites pass this constant.
OBS remaining-scripts-census#237 agree | `247 throw new Error(\`canonical agent card missing for devin seat: agents/${role}.md\`);` | The preceding `existsSync` guard is the missing-card case; this exact throw is a plain Error with the stated message. The note marks old `card_missing` as removed, not as a current error code.
OBS remaining-scripts-census#238 agree | `364 } catch (error) {`; `366 ok: false,`; `375 error: error instanceof Error ? error.message : String(error),` | The cited try/catch range constructs the failure report with both `ok:false` and an `error` message, matching the prose.

Findings by severity: none; no assigned anchor is refuted. The four IDs are not among the note's explicitly marked false/dead/unchecked anchors, and are assessed as true claims.

Evidence: note read with `git show c938c068f4dbf356c0884c2121bbfe087fbe3caf:corpus/knowledge/remaining-scripts-census.md`; full project-devin-subagents sentence is at the section under that heading. Pin read with `git -C /fast/scratch/kumitate-r36/src show 31c465f15669f744848bd9f5d56191c5085670f7:scripts/project-devin-subagents.mjs | nl -ba`; the cited lines match the quotes above. The gate was not run; no gate result is counted as independent truth.

Residual risk: this is a lexical, line-to-prose audit of the four assigned anchors, not an end-to-end runtime verification.
Verification gaps: no `lsp` device is mounted (`read xd://lsp_status` returned “No such tool”), so caller/definition/diagnostics checks were unavailable; no grep was used. No gate, tests, or runtime execution was performed.