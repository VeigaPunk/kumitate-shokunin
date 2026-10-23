RESULT CtlLabelKeyedEntry rev=a2e5b54c verdict=meets label_reading=pass open_reading=fail
Axes: coverage (decision-to-evidence relevance), operability (bounded, repeatable reader control). No C1 entry judgment.
Here “meets” means the fake meets the deliberately shallow label reader, NOT that it satisfies substantive E7.
Scratch: /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlLabelKeyedEntry/; preserved fake: mutant-entry.md; restored target: entry.md; detector: readers.py.
Mutant: transpose ONLY R5/R6 mechanism text and demo pointers. M5/M6, S070–S074, all required guards, and the other four rows stay unchanged. All M1–M6, six Demo names and S062–S074 remain present.
Memory row R6 consequently cites DemoBwrapEnv.md and explains launcher environment; environment row R5 cites DemoNativeMemCap.md and explains native memory.
All six receipt files exist in scratch/build/. They are explicitly synthetic effect/control/replay fixtures, not inherited evidence or claimed platform executions.
Expected detector: label reader survives this permutation; opening the receipt contents and comparing their effect against the decision row rejects it.
Frozen source command: git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin show a2e5b54cdd2c4cbf72cb0b2ab4ed53e2fe0d730f:.ufo/waves/round-45/plan.md
Observed E7 at lines 125–147; same command piped to sha256sum: 4e8a4b6bb1685e4b5b2bc5f2beb86fbe1fc69ae43a2eed43e300f74dee94386f  -
Verbatim excerpts, that body hash, locators :131, :133–134: “names a mechanism”; “shows the effect and its control does not”; “a falsify re-run of that demo reproduces it”.
Quote count command: printf '%s\n' 'names a mechanism' 'shows the effect and its control does not' 'a falsify re-run of that demo reproduces it' | wc -w ; output: 19.
Prerequisite command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 /usr/bin/python3 --version ; output: Python 3.14.8.
Setup failure: the pristine command below initially exited 1 with ValueError: The six decision rows must be present. The parser had included the Row header. This was inconclusive, not a killed mutant.
Corrected that parser before mutation; all three measured runs below used identical reader bytes. No detector changes followed the successful pristine run.
Pristine exact command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 /usr/bin/python3 /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlLabelKeyedEntry/readers.py pristine
Exit 0; output:
```text
STAGE pristine entry_sha256=998a3c04b315a232ba341699a2118f114847ed3c21a2acad3acf08314b7da97d reader_sha256=5a6e22da0f3b7ebf10fd24524379981836b560ef1de53f510c8a52f0a08ec293
FIXTURES count=6 sha256=1189e678834b49f50a04761673d8f6690fb20d0fbfecc405318da40f71198ab3 synthetic=yes
LABEL K1=pass K2=pass K3=pass K4=pass K5=pass overall=pass
OPEN K1_names=pass mechanism_alignment=pass K2_fixture_alignment=pass K3=unverified K4=pass K5=pass alignment=pass full_E7=unverified
```
Mutated exact command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 /usr/bin/python3 /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlLabelKeyedEntry/readers.py mutated
Exit 1; output:
```text
STAGE mutated entry_sha256=4118912ac8da34b0c0414ca471438e52d9b6273b5cce9b5269408376eefc21f3 reader_sha256=5a6e22da0f3b7ebf10fd24524379981836b560ef1de53f510c8a52f0a08ec293
FIXTURES count=6 sha256=1189e678834b49f50a04761673d8f6690fb20d0fbfecc405318da40f71198ab3 synthetic=yes
LABEL K1=pass K2=pass K3=pass K4=pass K5=pass overall=pass
OPEN K1_names=pass mechanism_alignment=fail K2_fixture_alignment=fail K3=unverified K4=pass K5=pass alignment=fail full_E7=fail
ROW R5 M5 mechanism_text_from=R6 intended=launcher-environment receipt=DemoNativeMemCap.md fixture_effect=native-memory-bound
ROW R6 M6 mechanism_text_from=R5 intended=native-memory-bound receipt=DemoBwrapEnv.md fixture_effect=launcher-environment
```
Restored exact command: systemd-run --user --scope --quiet -p MemoryMax=4G -p TasksMax=128 timeout -s KILL 900 /usr/bin/python3 /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlLabelKeyedEntry/readers.py restored
Exit 0; output:
```text
STAGE restored entry_sha256=998a3c04b315a232ba341699a2118f114847ed3c21a2acad3acf08314b7da97d reader_sha256=5a6e22da0f3b7ebf10fd24524379981836b560ef1de53f510c8a52f0a08ec293
FIXTURES count=6 sha256=1189e678834b49f50a04761673d8f6690fb20d0fbfecc405318da40f71198ab3 synthetic=yes
LABEL K1=pass K2=pass K3=pass K4=pass K5=pass overall=pass
OPEN K1_names=pass mechanism_alignment=pass K2_fixture_alignment=pass K3=unverified K4=pass K5=pass alignment=pass full_E7=unverified
```
K1 score: label PASS; opened still passes literal naming, but fails row-to-mechanism relevance. The word “names” alone does not establish that relevance.
K2 score: label PASS; opened FAIL for row-specific effect: both swapped receipts concern the wrong outcome. Matching a demo to its own effect is insufficient.
K3 score: label PASS from planted ids/FOUND tags; substantive UNVERIFIED in every state. No non-author source re-open was performed or invented.
K4 score: PASS for the named E1 passages and ownership boundary, unchanged by mutation. Opened lane paths: omp-task-contract.md:90–102, pinned-evidence.md:98–101, round-44.md:129,138, PROVINCE.md:24–28.
K5 score: PASS for the two specified practice changes; the widened Git scrub and env -i guard remain in the correct rows, unchanged.
Does K1/K2 force the second reading? K1 alone: no. K2's effect/control comparison and falsify re-run prohibit treating labels as sufficient evidence, but the explicit row-to-effect binding is missing.
Thus a label-presence implementation is gameable; it is not a compliant execution of all E7 obligations. Read “mechanism” as the cause relevant to this row, and “the effect” as this row's claimed outcome, not any effect in the named demo.
A fully explicit requirement would bind each row's recommendation, mechanism text, source locator, receipt effect/control and reproduced effect. This is a finding, not an edit to the frozen contract.
Verdict: SURVIVED the label reader; KILLED the local pointer-alignment detector. These are reader-control results, not a claim that a real frozen checklist program exists or that full E7 passed on pristine bytes.
Restoration: exact original target hash recovered above; reader and receipt hashes unchanged. sha256sum /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlLabelKeyedEntry/mutant-entry.md also returned 4118912ac8da34b0c0414ca471438e52d9b6273b5cce9b5269408376eefc21f3.
Cleanup command after the prerequisite and after each detector attempt: pgrep -af '^(/usr/bin/python3|python3|node|timeout|/usr/bin/timeout|bwrap|jj|git|/bin/sh|/bin/bash|bash|sh) .*/fast/scratch/hyaku/kumitate-r45/seats/a2-CtlLabelKeyedEntry/' ; each output empty, exit 1.
du -sh /fast/scratch/hyaku/kumitate-r45/seats/a2-CtlLabelKeyedEntry returned 40K; no large temporary files or background jobs remain. No tools installed or updated; no lane writes except this report.
