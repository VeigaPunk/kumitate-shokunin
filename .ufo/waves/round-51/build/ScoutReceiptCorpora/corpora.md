# A4 nonce-ledger corpus (ScoutReceiptCorpora)

Negative claim: no committed receipt-like artifact the A4 ledger scans contains a parseable `nonce` field.

## Axes

- Completeness: every file the frozen A4 walk would open, plus every file the named sweeps print.
- Evidence: exact commands, stderr, sha256 of file bytes, commit identity at the frozen base.
- Predicate alignment: parse matches `attest51-probe.mjs` JSON-line `nonce` read (lines 97–99) and the A4 basename walk (lines 139–152).

## What was hashed

- Lane HEAD `3ed875d34914560d3e30ee3e80bec7fa9b9e8666` (descendant of frozen base `c90b9de94009b938fa19a089bfaa97df20b54f86`; `git diff --name-status c90b9de94009b938fa19a089bfaa97df20b54f86 HEAD -- .ufo/waves` has no receipt/ReRun/L1-score/nonce path).
- Counter hashed: `.ufo/waves/round-51/probe/attest51-probe.mjs` sha256 `422e67b02d844fd1c3fe2d20c9211261460c452381a111b68b0d6bc22af53cd1`.
- Content hash is SHA-256 of the exact file bytes (same digest `sha256sum` prints). Cross-check on the first inventory row matched the `sha256sum` CLI.
- `committed_at_base=yes` means `git hash-object` of the worktree file equals `git rev-parse c90b9de94009b938fa19a089bfaa97df20b54f86:<path>`.

## Parseable nonce field

A file is **parseable** if any of these fire (otherwise **no**, even when the letters `nonce` occur in prose):

1. `json-line` — a line whose trim starts with `{`, `JSON.parse` yields a non-array object, and that object has own property `nonce`. This is the A2/A4 reader at `attest51-probe.mjs:97-99`.
2. `json-key` — a `"nonce"` key with a JSON value anywhere in the text.
3. `json-doc` — the whole file parses as JSON and some object has own property `nonce`.
4. `kv-line` — a line matching `/^\s*["']?nonce["']?\s*[:=]\s*\S+/i`.

Result: **0 parseable nonce fields** across 168 files.

## Brace defect in the named sweep

Bash expands `round-4{8,9,50}` to `round-48`, `round-49`, and `round-450`. It does **not** name `round-50`. Both exact commands wrote `round-450: No such file or directory` on stderr and omitted 4 round-50 name hits. The operative sweep below uses `round-{48,49,50}` plus the same predicates. The exact (broken) transcripts are kept so the negative claim carries the command that was specified.

Files the exact brace dropped:

- `.ufo/waves/round-50/ReRunB49-1.txt`
- `.ufo/waves/round-50/ReRunB49-2.txt`
- `.ufo/waves/round-50/ReRunB49-3.txt`
- `.ufo/waves/round-50/r50/MutReceiptSyntax.md`

## Sweep 1 — exact item command (broken brace)

```
$ find /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-4{8,9,50} -type f \( -name '*eceipt*' -o -name 'ReRun*.txt' -o -name 'L1-score*.txt' \)
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlBwrapOnly-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlCountPad-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlCountPad-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlCountPad-restoration-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlCountPad-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDirectSystemd-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDirectSystemd-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDirectSystemd-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDodge-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDoNothing-receipt-a.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDoNothing-receipt-b.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvCaps-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvCaps-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvCaps-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvPassthrough-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlFakeRunner-a-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlFakeRunner-a-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlFakeRunner-b-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlFakeRunner-b-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlFakeRunner-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlFakeRunner-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlFirstCallOnly-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk-pristine-initial-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlLooseCaps-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlLooseCaps-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlLooseCaps-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlMention-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlMention-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlMention-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlNestedAllowance-pristine-attempt0-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlNestedAllowance-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlNestedAllowance-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlNestedAllowance-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlRetParse48-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlScopeOnly-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlStubChild-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlSummaryForge-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/close/L1-receipts.sha256
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/close/ReRunCounter48-1-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/close/ReRunCounter48-2-receipt.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/close/ReRunCounter48-2-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/close/ReRunCounterA-original-receipt-run1.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/close/ReRunR47Set-receipt.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/close/ReRunR47Set-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/CritReceiptPlan.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ExecRouteRG742-chain-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ExecRouteRG742-selftest-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ExecRouteSP1592-chain-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ExecRouteSP1592-selftest-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ExecRouteSP491-integration-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ExecRouteSP519-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/kumitate-r48-MutSpawnDropBind-mutant-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/kumitate-r48-MutSpawnDropBind-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/kumitate-r48-MutSpawnDropBind-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/L1BindProbe-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/L1-receipts.sha256
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/L1-score-ce9aee5d.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutAllowanceProbe-mutA-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutAllowanceProbe-mutB-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutAllowanceProbe-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutAllowanceProbe-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutAllowanceProbe-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutCountPadSite-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutCountPadSite-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutCountPadSite-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutDoNothing48-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerDropSwap-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerDropTasks-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerLooseMem-mutant-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerLooseMem-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerLooseMem-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerLooseMem-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerUnshare-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerUnshare-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerUnshare-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSiteRGArgv-mutant-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSiteRGArgv-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSiteRGArgv-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSiteSPDouble-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSiteSPDouble-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSiteSPDouble-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSpawnCanaryLeak-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSpawnEnvDodge-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSpawnEnvDodge-receipt.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSpawnEnvDodge-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSpawnEnvDodge-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSpawnFakeRunner-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ReviewA2Receipts.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ReviewReceiptCanon.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-1.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-2.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-3.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ScribeReceipts-checklist-base-1.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ScribeReceipts-checklist-base-2.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ScribeReceipts.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/SentinelReceipt.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-49/r49/L1-score-0526f898.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-49/r49/ReRunCounter49-2.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-49/r49/ReRunCounter49-3.txt
EXIT:1
```

stderr:

```
Error: /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-450: No such file or directory (os error 2)
```

Path count: 102.

```
$ grep -rl 'nonce' /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-4{8,9,50}
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/SentinelReceipt.md
EXIT:2
```

stderr:

```
grep: /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-450: No such file or directory (os error 2)
```

Path count: 1.

## Sweep 2 — corrected name find (rounds 48, 49, 50)

```
$ find /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-{48,49,50} -type f \( -name '*eceipt*' -o -name 'ReRun*.txt' -o -name 'L1-score*.txt' \)
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlBwrapOnly-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlCountPad-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlCountPad-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlCountPad-restoration-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlCountPad-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDirectSystemd-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDirectSystemd-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDirectSystemd-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDodge-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDoNothing-receipt-a.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlDoNothing-receipt-b.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvCaps-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvCaps-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvCaps-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlEnvPassthrough-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlFakeRunner-a-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlFakeRunner-a-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlFakeRunner-b-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlFakeRunner-b-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlFakeRunner-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlFakeRunner-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlFirstCallOnly-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk-pristine-initial-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlJunk-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlLooseCaps-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlLooseCaps-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlLooseCaps-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlMention-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlMention-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlMention-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlNestedAllowance-pristine-attempt0-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlNestedAllowance-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlNestedAllowance-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlNestedAllowance-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlRetParse48-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlScopeOnly-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlStubChild-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/build/CtlSummaryForge-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/close/L1-receipts.sha256
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/close/ReRunCounter48-1-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/close/ReRunCounter48-2-receipt.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/close/ReRunCounter48-2-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/close/ReRunCounterA-original-receipt-run1.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/close/ReRunR47Set-receipt.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/close/ReRunR47Set-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/CritReceiptPlan.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ExecRouteRG742-chain-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ExecRouteRG742-selftest-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ExecRouteSP1592-chain-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ExecRouteSP1592-selftest-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ExecRouteSP491-integration-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ExecRouteSP519-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/kumitate-r48-MutSpawnDropBind-mutant-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/kumitate-r48-MutSpawnDropBind-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/kumitate-r48-MutSpawnDropBind-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/L1BindProbe-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/L1-receipts.sha256
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/L1-score-ce9aee5d.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutAllowanceProbe-mutA-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutAllowanceProbe-mutB-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutAllowanceProbe-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutAllowanceProbe-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutAllowanceProbe-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutCountPadSite-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutCountPadSite-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutCountPadSite-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutDoNothing48-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerDropSwap-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerDropTasks-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerLooseMem-mutant-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerLooseMem-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerLooseMem-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerLooseMem-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerUnshare-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerUnshare-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutRunnerUnshare-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSiteRGArgv-mutant-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSiteRGArgv-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSiteRGArgv-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSiteSPDouble-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSiteSPDouble-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSiteSPDouble-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSpawnCanaryLeak-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSpawnEnvDodge-pristine-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSpawnEnvDodge-receipt.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSpawnEnvDodge-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSpawnEnvDodge-restored-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/MutSpawnFakeRunner-receipt.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ReviewA2Receipts.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ReviewReceiptCanon.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-1.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-2.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-3.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ScribeReceipts-checklist-base-1.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ScribeReceipts-checklist-base-2.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/ScribeReceipts.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/SentinelReceipt.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-49/r49/L1-score-0526f898.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-49/r49/ReRunCounter49-2.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-49/r49/ReRunCounter49-3.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-50/r50/MutReceiptSyntax.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-50/ReRunB49-1.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-50/ReRunB49-2.txt
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-50/ReRunB49-3.txt
EXIT:0
```

Path count: 106.

```
$ grep -rl 'nonce' /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-49 /home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-50
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-48/r48/SentinelReceipt.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-50/plan.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-50/r50/CritPlan.md
/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-50/r50/SimplifierGuard.md
EXIT:0
```

Path count: 4.

## Sweep 3 — nonce substring, all waves except round-51

Command: `grep -rl 'nonce' .ufo/waves --exclude-dir=round-51` (cwd = lane).

```
.ufo/waves/round-36/build/ScoutR7Members.md
.ufo/waves/round-45/a2-control/ReopenS027.md
.ufo/waves/round-45/build/CtlQuoteFabricated.md
.ufo/waves/round-48/r48/SentinelReceipt.md
.ufo/waves/round-50/plan.md
.ufo/waves/round-50/r50/CritPlan.md
.ufo/waves/round-50/r50/SimplifierGuard.md
```

Case-insensitive `grep -rli 'nonce'` path count: 7. Paths only in the case-insensitive sweep: (none).

## Sweep 4 — frozen A4 walk

Replicated `attest51-probe.mjs:143-152`: walk `.ufo/waves`, do not descend into a directory whose name matches `/round-51$/`, keep files whose **basename** matches `/receipt|ReRun|L1-score/i`. This is wider than the item `find` (that `find` is case-sensitive, `ReRun*.txt` must be a prefix, `L1-score*.txt` must be a prefix, and it never enters rounds before 48).

Per round directory (a4 file count). A 0 means the directory was walked and no basename matched, except `round-51`: the probe does not descend into a directory whose name matches `/round-51$/`, so that 0 is exclusion, not an empty scan.

| round dir | a4 files |
|---|---|
| round-35 | 7 |
| round-36 | 0 |
| round-37 | 0 |
| round-38 | 0 |
| round-39 | 0 |
| round-40 | 6 |
| round-41 | 3 |
| round-42 | 5 |
| round-43 | 7 |
| round-44 | 12 |
| round-45 | 1 |
| round-46 | 1 |
| round-47 | 0 |
| round-48 | 113 |
| round-49 | 3 |
| round-50 | 4 |
| round-51 | 0 |

A4 file count: **162**.

## Committed name matches outside `.ufo/waves`

Command: `git ls-files -z` (HEAD `3ed875d34914560d3e30ee3e80bec7fa9b9e8666`), basename matches `/receipt|ReRun|L1-score/i`, path not under `.ufo/waves/`. Two paths. A4 opens neither: the walk root is `.ufo/waves` (`attest51-probe.mjs:141-152`).

| path | bytes | sha256 | at base c90b9de9 | parseable nonce | note |
|---|---|---|---|---|---|
| `.ufo/rounds/round-33/receipt-prerequisites.json` | 1204 | `dc8db4364b8faeaa966abf2b2d206181a94a0a6ab72e65e7920b0a41d9e918a3` | yes | no | JSON object. Own keys: `actualRound`, `status`, `missionId`, `runId`, `sessionId`, `knownFrom`, `sightingBinding`, `sidecarSearch`, `receiptMinted`, `receiptValidated`, `sightingCompleteInvoked`, `reason`. No `nonce`. `receiptMinted` is false. Receipt-named, outside the A4 root. |
| `scripts/counter-rerun.mjs` | 28410 | `c002523fc39b521f57a3ee86c3ff154e06aea8ccd6738501138460141abc369b` | yes | no | Basename contains `rerun`, so the regex matches. It is the counter-rerun instrument, not a receipt. `grep -F nonce` on the file is empty. Not a collision-corpus file. |

## Inventory A — item sweep (corrected find ∪ nonce grep on rounds 48–50)

109 files. `parseable nonce` is no on every row.

| # | round | path | bytes | sha256 | at base c90b9de9 | parseable nonce | why |
|---|---|---|---|---|---|---|---|
| 1 | round-48 | `.ufo/waves/round-48/build/CtlBwrapOnly-receipt.txt` | 1832 | `2a0a7561adb580eb86c6ad172e2afdec473e26251c9a2b625d0897dde6d11f36` | yes | no | name-find |
| 2 | round-48 | `.ufo/waves/round-48/build/CtlCountPad-pristine-receipt.txt` | 1952 | `457cbb0a8cf5475a1406bbca9b1ac09589dddd5d6d5fd8d202df2f6816cc1964` | yes | no | name-find |
| 3 | round-48 | `.ufo/waves/round-48/build/CtlCountPad-receipt.txt` | 1958 | `db9f1aa567e61aa64656a63af5d8a897cb88c332ec52e345eb18d46d0baf7c82` | yes | no | name-find |
| 4 | round-48 | `.ufo/waves/round-48/build/CtlCountPad-restoration-receipt.txt` | 706 | `d225701958281b3fe2cafccf21f6882e3b769daa486a8a35ece4f7b9c2bcaf6c` | yes | no | name-find |
| 5 | round-48 | `.ufo/waves/round-48/build/CtlCountPad-restored-receipt.txt` | 1952 | `745bc90449812afa087102aa41ba40c7ecf47043345e0966939fe35688ab9792` | yes | no | name-find |
| 6 | round-48 | `.ufo/waves/round-48/build/CtlDirectSystemd-pristine-receipt.txt` | 1952 | `fa03c59cf47df5d4c9ee5e6ceebd974db94ef36d0cdd904853eb8b6b8f5f68e7` | yes | no | name-find |
| 7 | round-48 | `.ufo/waves/round-48/build/CtlDirectSystemd-receipt.txt` | 1727 | `7dfc74dc8a237a828deed282dca9ff7fdd50f9d751a4ffe3428bc85d4cf5dacc` | yes | no | name-find |
| 8 | round-48 | `.ufo/waves/round-48/build/CtlDirectSystemd-restored-receipt.txt` | 1952 | `6aedc2555f6b2a5eed336d8d5b800b72bd79f1738a06b37c54b7906a97d02a8a` | yes | no | name-find |
| 9 | round-48 | `.ufo/waves/round-48/build/CtlDoNothing-receipt-a.txt` | 3994 | `508e0977fd6f8a5b22c5459cf63ce03d026bcae2331b5f008c145267fbd0325e` | yes | no | name-find |
| 10 | round-48 | `.ufo/waves/round-48/build/CtlDoNothing-receipt-b.txt` | 1959 | `4aac715be836b13d601c35bb0a60627fa44bdab9170b7a6ee42dcd1d27a76c21` | yes | no | name-find |
| 11 | round-48 | `.ufo/waves/round-48/build/CtlDodge-receipt.txt` | 5534 | `ebc5a70cbcda0b2ad7be9338c43ef028a3f8cbe088b27c6c05bf273d029efb50` | yes | no | name-find |
| 12 | round-48 | `.ufo/waves/round-48/build/CtlEnvCaps-pristine-receipt.txt` | 1465 | `b0942e5d5aafb07f5953fddc61e00708e6304450002ca9d260e543ab733d7167` | yes | no | name-find |
| 13 | round-48 | `.ufo/waves/round-48/build/CtlEnvCaps-receipt.txt` | 1720 | `78e789adae64f576b741233f894e76f8c52ba858e852944ee298b4bcec63e61e` | yes | no | name-find |
| 14 | round-48 | `.ufo/waves/round-48/build/CtlEnvCaps-restored-receipt.txt` | 1465 | `6688d4f5d45783e2f3011cbd65ea17f1292b64bbb645d2b4610b884462c73892` | yes | no | name-find |
| 15 | round-48 | `.ufo/waves/round-48/build/CtlEnvPassthrough-receipt.txt` | 1667 | `3d099b6d468e2361281b14f70668de1e47ea813cf88569faf4c5a49ff9596907` | yes | no | name-find |
| 16 | round-48 | `.ufo/waves/round-48/build/CtlFakeRunner-a-receipt.txt` | 1732 | `630de20d30e51b0a08b317fd4de196f9bcc4524ee806ee05bf34cad62629dea2` | yes | no | name-find |
| 17 | round-48 | `.ufo/waves/round-48/build/CtlFakeRunner-a-restored-receipt.txt` | 1959 | `de4faf13a386948ba2e1c88e8e159a8aebb9a199ec4fff963bdd883937405da1` | yes | no | name-find |
| 18 | round-48 | `.ufo/waves/round-48/build/CtlFakeRunner-b-receipt.txt` | 1792 | `9229e5c51c6c76a704cec559af4a18bd52ae63afcdcf53ed2b23d4201533a7ca` | yes | no | name-find |
| 19 | round-48 | `.ufo/waves/round-48/build/CtlFakeRunner-b-restored-receipt.txt` | 1960 | `3193bb9b3923304ef9eccd6fe61f12261807454c4488a21f8dbcf8243f89f8ea` | yes | no | name-find |
| 20 | round-48 | `.ufo/waves/round-48/build/CtlFakeRunner-pristine-receipt.txt` | 1960 | `a8fa0b67aa07f590458d0ced90a0cebdbe058b127dfa6b14ee8ab600a9096870` | yes | no | name-find |
| 21 | round-48 | `.ufo/waves/round-48/build/CtlFakeRunner-receipt.txt` | 3641 | `923eab2ac52a0656d7eedece5ac4fd2b056db3db6ccb836c33e9571fc591dd1b` | yes | no | name-find |
| 22 | round-48 | `.ufo/waves/round-48/build/CtlFirstCallOnly-receipt.txt` | 1777 | `9914f513dca0e70a05950787fa885784d95044428d3869794b1f1333a8424164` | yes | no | name-find |
| 23 | round-48 | `.ufo/waves/round-48/build/CtlJunk-pristine-initial-receipt.txt` | 172 | `52f90b455a687a5799e72175b640d3da3a57027f7e153848f0ef4a2ec7444f08` | yes | no | name-find |
| 24 | round-48 | `.ufo/waves/round-48/build/CtlJunk-pristine-receipt.txt` | 1952 | `c1be3b1d318646ef7b65adcbc5b638b28381348b9528e79924dd62701272980e` | yes | no | name-find |
| 25 | round-48 | `.ufo/waves/round-48/build/CtlJunk-receipt.txt` | 1830 | `8fa7da10aafe2d4f435d9f307f644c6a0f261e868dbbeea703a2dc2f8d8a356d` | yes | no | name-find |
| 26 | round-48 | `.ufo/waves/round-48/build/CtlJunk-restored-receipt.txt` | 1952 | `c5215aafba0ee1ebba38d716784de1f12d91b0ccf044753b10dd929839c3b8b5` | yes | no | name-find |
| 27 | round-48 | `.ufo/waves/round-48/build/CtlLooseCaps-pristine-receipt.txt` | 1952 | `40edceb7d96e216c9792882885de3cefb979adc6baab57f3e26a5f044bedaa07` | yes | no | name-find |
| 28 | round-48 | `.ufo/waves/round-48/build/CtlLooseCaps-receipt.txt` | 1715 | `76d0802a02ec190227f104fe377699f23c53a39a2f41a6855104f4c590af58d1` | yes | no | name-find |
| 29 | round-48 | `.ufo/waves/round-48/build/CtlLooseCaps-restored-receipt.txt` | 1952 | `bc38ab1a367ea90a10b3b11405e12ac89c2d87f20ef510949a498bd0aad43762` | yes | no | name-find |
| 30 | round-48 | `.ufo/waves/round-48/build/CtlMention-pristine-receipt.txt` | 1952 | `24e4be52f166f1180273ce1275dab7e384cc03146e2ca381bddf1e676986aa70` | yes | no | name-find |
| 31 | round-48 | `.ufo/waves/round-48/build/CtlMention-receipt.txt` | 1952 | `3c55e0943627ca7611fc5d764b620eb178bb96f2f441c6c9f824854e8233cec5` | yes | no | name-find |
| 32 | round-48 | `.ufo/waves/round-48/build/CtlMention-restored-receipt.txt` | 1952 | `fa2d1a589dc9ded3ea5de0a35a5d992d52f0cd4406ce1e25bc2be60edb41525b` | yes | no | name-find |
| 33 | round-48 | `.ufo/waves/round-48/build/CtlNestedAllowance-pristine-attempt0-receipt.txt` | 375 | `acaf6b73263d26d2aedbbebaceed6b3fecca5d01d058b490880f2a77266444e4` | yes | no | name-find |
| 34 | round-48 | `.ufo/waves/round-48/build/CtlNestedAllowance-pristine-receipt.txt` | 1959 | `038e5bd8dcfc2f3479012a3b889b71164f658d5a8a2d1e90eacecb21791cb057` | yes | no | name-find |
| 35 | round-48 | `.ufo/waves/round-48/build/CtlNestedAllowance-receipt.txt` | 1721 | `d36d1ac694fec095e6ce374df0334063fbe822c668e711b69f89ed08a0c1b526` | yes | no | name-find |
| 36 | round-48 | `.ufo/waves/round-48/build/CtlNestedAllowance-restored-receipt.txt` | 1960 | `a369b80b8cf9a6f5cf4e068efee8930aa277ca9deae4e149e20db40bb4463e9b` | yes | no | name-find |
| 37 | round-48 | `.ufo/waves/round-48/build/CtlRetParse48-receipt.txt` | 1952 | `72cf64c42c3d162de7dd0b0fa2df004471635a3dc0867ae81ccc818e9c949737` | yes | no | name-find |
| 38 | round-48 | `.ufo/waves/round-48/build/CtlScopeOnly-receipt.txt` | 1792 | `026ab3adbfa862169117df7940ae88eed0b25d1599164a9ee768721627a39ba9` | yes | no | name-find |
| 39 | round-48 | `.ufo/waves/round-48/build/CtlStubChild-receipt.txt` | 1708 | `9a801a95f630aadfc7022bee9bdc63484225b41f55bccc32470a40ae3be03e95` | yes | no | name-find |
| 40 | round-48 | `.ufo/waves/round-48/build/CtlSummaryForge-receipt.txt` | 1586 | `de2794ea6d7784cf9718e88630bf47bb8a67765e5330fd3384e215d3c7cb641b` | yes | no | name-find |
| 41 | round-48 | `.ufo/waves/round-48/close/L1-receipts.sha256` | 979 | `1c41b3642adfeb516b35ebccd6f2e75ea6dd2d9401bf50475de4e433598bac20` | yes | no | name-find |
| 42 | round-48 | `.ufo/waves/round-48/close/ReRunCounter48-1-receipt.txt` | 1899 | `fd7d8866efbead2128d9bc00964f47d97443f08b45852508d186ad83f30424a2` | yes | no | name-find |
| 43 | round-48 | `.ufo/waves/round-48/close/ReRunCounter48-2-receipt.md` | 4622 | `4937a0dc5e03edf9c98e3f3c3d63afc98fb01ea42ea3d9488bda0227a9cdb768` | yes | no | name-find |
| 44 | round-48 | `.ufo/waves/round-48/close/ReRunCounter48-2-receipt.txt` | 1604 | `1aa15c7e2c64273a5b3b2781a94e94781eba63626d717170bca31e772afd57c1` | yes | no | name-find |
| 45 | round-48 | `.ufo/waves/round-48/close/ReRunCounterA-original-receipt-run1.txt` | 2326 | `92f692d85ca948852c7de53cb78825f000c6a23da4d545ac409547e2b13dd3c1` | yes | no | name-find |
| 46 | round-48 | `.ufo/waves/round-48/close/ReRunR47Set-receipt.md` | 2357 | `08d9e4024d49908683b794ac999b8ebd652861a058bcec49226b12206027990c` | yes | no | name-find |
| 47 | round-48 | `.ufo/waves/round-48/close/ReRunR47Set-receipt.txt` | 3842 | `8c99fbf925f65b3dd882c1799bab2cd1aefbec31c2c723dcb1beda301e026afc` | yes | no | name-find |
| 48 | round-48 | `.ufo/waves/round-48/r48/CritReceiptPlan.md` | 17806 | `ff4b7ab55a2f747e82598527dfe66f25658abd716b4c929714b93ce430be164e` | yes | no | name-find |
| 49 | round-48 | `.ufo/waves/round-48/r48/ExecRouteRG742-chain-receipt.txt` | 257 | `b9aa3a7b1fdccb8848e4102e2c36e80745be33a53eb4619c97c846df37fa922e` | yes | no | name-find |
| 50 | round-48 | `.ufo/waves/round-48/r48/ExecRouteRG742-selftest-receipt.txt` | 9833 | `f7ca511ab9ac76c8eccc176be8b1ac0b7baa1c2014d6e72190d0dcfc0c9384c1` | yes | no | name-find |
| 51 | round-48 | `.ufo/waves/round-48/r48/ExecRouteSP1592-chain-receipt.txt` | 725 | `90a7040c49311340042bad3728c0b7f99903ae638a1d3c8897937729e322b56f` | yes | no | name-find |
| 52 | round-48 | `.ufo/waves/round-48/r48/ExecRouteSP1592-selftest-receipt.txt` | 713 | `e18f56e07708082fbc586208170093db8e2e80e3d3af59a5274ea4b5ff0f599c` | yes | no | name-find |
| 53 | round-48 | `.ufo/waves/round-48/r48/ExecRouteSP491-integration-receipt.txt` | 3318 | `6a04b774ba151604495eafde7afdab7ee5270ba1df2f2b1d602f542c7c2939a2` | yes | no | name-find |
| 54 | round-48 | `.ufo/waves/round-48/r48/ExecRouteSP519-receipt.txt` | 10194 | `c1124af547371bf03854d6bba05d82a38e82f4e7d8bd72e030ac66dfafe1a152` | yes | no | name-find |
| 55 | round-48 | `.ufo/waves/round-48/r48/L1-receipts.sha256` | 14504 | `119714ca024baa4b56da6375ea40173c4a32cd69fbd153e3ae61fa8f7a81b96d` | yes | no | name-find |
| 56 | round-48 | `.ufo/waves/round-48/r48/L1-score-ce9aee5d.txt` | 1773 | `554c393a28437b0f71d629c27c5da86de435ba7b5cef5343b7d6568621da2ac6` | yes | no | name-find |
| 57 | round-48 | `.ufo/waves/round-48/r48/L1BindProbe-receipt.txt` | 1448 | `799fd90b93de90100339cd0f31940e1f604b7775a0448652560be1f8687858f0` | yes | no | name-find |
| 58 | round-48 | `.ufo/waves/round-48/r48/MutAllowanceProbe-mutA-receipt.txt` | 1518 | `911d47be202f481fa14eba6f1b1b0c1a71d1c5f83cffa44afc95d40c7f564bc3` | yes | no | name-find |
| 59 | round-48 | `.ufo/waves/round-48/r48/MutAllowanceProbe-mutB-receipt.txt` | 1484 | `7f74973d9b37d1ff8cc78fdc719b0b8559533e96a3006f228b6a01c242512fba` | yes | no | name-find |
| 60 | round-48 | `.ufo/waves/round-48/r48/MutAllowanceProbe-pristine-receipt.txt` | 1484 | `802fb81b865d44433b9b1a5671054929a39bd8dd8aa5c613a3a418db0e317a12` | yes | no | name-find |
| 61 | round-48 | `.ufo/waves/round-48/r48/MutAllowanceProbe-receipt.txt` | 7939 | `8cea991ba3d1fde9f26d7ed9207e76eb54bbd44b7e4f25c1c00be078647efbdf` | yes | no | name-find |
| 62 | round-48 | `.ufo/waves/round-48/r48/MutAllowanceProbe-restored-receipt.txt` | 1484 | `5d7b2827bf9fcceb8791217d6f60dc4ca505479e1f51b2b064314a4a5f22385d` | yes | no | name-find |
| 63 | round-48 | `.ufo/waves/round-48/r48/MutCountPadSite-pristine-receipt.txt` | 1460 | `4fc8230161af236a112197e6f8fa47b20f7788ca8e9e32116a531c80835d45fa` | yes | no | name-find |
| 64 | round-48 | `.ufo/waves/round-48/r48/MutCountPadSite-receipt.txt` | 1486 | `0c2fde5771a61d5f071b4d46c904f3cc77da1ab275a87b3cca1a1f51f4d9fbcd` | yes | no | name-find |
| 65 | round-48 | `.ufo/waves/round-48/r48/MutCountPadSite-restored-receipt.txt` | 1460 | `67b13b29e1d2037c84637d3f1770eb0e58bb02fdc49187ce80c7300c937df99a` | yes | no | name-find |
| 66 | round-48 | `.ufo/waves/round-48/r48/MutDoNothing48-receipt.txt` | 7171 | `4c99cf2e4ddc58846b1ddd992a918ba131944a7ee5bb37de38ecd6d06e4d1088` | yes | no | name-find |
| 67 | round-48 | `.ufo/waves/round-48/r48/MutRunnerDropSwap-receipt.txt` | 7731 | `12a8030231e3a1e68e8ce00ad77d455644edc47a8a4b9f148a070233fe66f466` | yes | no | name-find |
| 68 | round-48 | `.ufo/waves/round-48/r48/MutRunnerDropTasks-receipt.txt` | 7904 | `5e98a22852664440e3b866ffe91fc500554c2f6835400ae4a816f943015ed998` | yes | no | name-find |
| 69 | round-48 | `.ufo/waves/round-48/r48/MutRunnerLooseMem-mutant-receipt.txt` | 1682 | `f773114de5542c6270a2477475936cd7977dde03005e4d8475ee2260d9dc131e` | yes | no | name-find |
| 70 | round-48 | `.ufo/waves/round-48/r48/MutRunnerLooseMem-pristine-receipt.txt` | 1460 | `81f63efd531b2f43353065206c90eed6e1093818fae559ba492e3645a63dff60` | yes | no | name-find |
| 71 | round-48 | `.ufo/waves/round-48/r48/MutRunnerLooseMem-receipt.txt` | 1738 | `e5b83dd58c8dba6435d0edcff5ab5347e24e86f20c9646c26180e6df6d5ff222` | yes | no | name-find |
| 72 | round-48 | `.ufo/waves/round-48/r48/MutRunnerLooseMem-restored-receipt.txt` | 1460 | `6c3b8653f3b6bc0fa79ced9740855365962c3d26999cda4184912effc90610f4` | yes | no | name-find |
| 73 | round-48 | `.ufo/waves/round-48/r48/MutRunnerUnshare-pristine-receipt.txt` | 1460 | `ae1bf3c45729599892b3dc1230528fbc03d813219d47ebd9cc87d76bea29ebe6` | yes | no | name-find |
| 74 | round-48 | `.ufo/waves/round-48/r48/MutRunnerUnshare-receipt.txt` | 1916 | `05534bc153fed2367307e8da57d8928bcb01e960d505b1724734f0d612fb4a08` | yes | no | name-find |
| 75 | round-48 | `.ufo/waves/round-48/r48/MutRunnerUnshare-restored-receipt.txt` | 1460 | `f5bff79ba253a286e000523afea38fa0090737b6c8f6e4bf802725ea2a76fcf0` | yes | no | name-find |
| 76 | round-48 | `.ufo/waves/round-48/r48/MutSiteRGArgv-mutant-receipt.txt` | 1829 | `311bd3622e3dcf9f5d8d9124ff34e935921005f75a19b3344a23a1076db98679` | yes | no | name-find |
| 77 | round-48 | `.ufo/waves/round-48/r48/MutSiteRGArgv-pristine-receipt.txt` | 2305 | `c81a6d5b20c9ae9aefa624d00e899a003f0a4b502419918e681446e5a6828473` | yes | no | name-find |
| 78 | round-48 | `.ufo/waves/round-48/r48/MutSiteRGArgv-restored-receipt.txt` | 2258 | `c8ed4a261e8da34200c3cd21ef866557829dffb363fb7b7421ca84e89e87dec3` | yes | no | name-find |
| 79 | round-48 | `.ufo/waves/round-48/r48/MutSiteSPDouble-pristine-receipt.txt` | 1952 | `fc576a80fc4cdda5d4be936e35ec5f8fb216fb7c356416acfd6882600462f4e2` | yes | no | name-find |
| 80 | round-48 | `.ufo/waves/round-48/r48/MutSiteSPDouble-receipt.txt` | 1880 | `ece212b0e772638a57650baebd2de8ada441b2166a18b7cdcd3bf35b5ae6b553` | yes | no | name-find |
| 81 | round-48 | `.ufo/waves/round-48/r48/MutSiteSPDouble-restored-receipt.txt` | 1952 | `c1cc5f006963366d473f442dca710ced8a62d22465d047ecc542c74d83a9f741` | yes | no | name-find |
| 82 | round-48 | `.ufo/waves/round-48/r48/MutSpawnCanaryLeak-receipt.txt` | 6534 | `6cb20ad872618ff593d6b39017a8c9fba93709622c1b96ff70030e03698d20ba` | yes | no | name-find |
| 83 | round-48 | `.ufo/waves/round-48/r48/MutSpawnEnvDodge-pristine-receipt.txt` | 1453 | `14101a33ae4f33d4af67fd784b315cf867e65af886ef7b2922e32320c5211915` | yes | no | name-find |
| 84 | round-48 | `.ufo/waves/round-48/r48/MutSpawnEnvDodge-receipt.md` | 8885 | `ca9fd585bb82f9a21af166144645f6a097c9356840d587ce6eedf79a1ec80cb2` | yes | no | name-find |
| 85 | round-48 | `.ufo/waves/round-48/r48/MutSpawnEnvDodge-receipt.txt` | 3192 | `8c6b805d8f94cbf3930803cbe616162a4d5b9e87b318c0f4ee61577289f67dca` | yes | no | name-find |
| 86 | round-48 | `.ufo/waves/round-48/r48/MutSpawnEnvDodge-restored-receipt.txt` | 1453 | `ab3b69e89b2bbb86141202751c68248b77d35388b232d21a5abee4bd675956a9` | yes | no | name-find |
| 87 | round-48 | `.ufo/waves/round-48/r48/MutSpawnFakeRunner-receipt.txt` | 13080 | `0c889addc6910feb1fa2ad80efe0e42157de5b8766ebe49fa41ce3995ab4bbe5` | yes | no | name-find |
| 88 | round-48 | `.ufo/waves/round-48/r48/ReviewA2Receipts.md` | 8774 | `14e8c30d7185ad5756ea290ef41476bf2f3f17c1a38989c5f19bbde41ed88610` | yes | no | name-find |
| 89 | round-48 | `.ufo/waves/round-48/r48/ReviewReceiptCanon.md` | 2773 | `1e35578d73fafa566b1d75ee66d47c57a60c2c006edda738e88c4d0e899254dd` | yes | no | name-find |
| 90 | round-48 | `.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-1.txt` | 1293 | `2aafd27d8440a38c15246fc3dab456da3fbcb2be349833d23f589efa8aa79630` | yes | no | name-find |
| 91 | round-48 | `.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-2.txt` | 1269 | `e77a919d299bbe58e490331bccf72c40c375220b0fa02e78362c2ef58016f1ba` | yes | no | name-find |
| 92 | round-48 | `.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-3.txt` | 1267 | `9040c45ec356ebba9a501a62d095e3a9b7234d51c36684d0a5c1449202c63507` | yes | no | name-find |
| 93 | round-48 | `.ufo/waves/round-48/r48/ScribeReceipts-checklist-base-1.txt` | 5681 | `6ec4a0962fa57ac3db463437a874740f0fabbd2460e97a3c559201e365538d7d` | yes | no | name-find |
| 94 | round-48 | `.ufo/waves/round-48/r48/ScribeReceipts-checklist-base-2.txt` | 5675 | `294d9b1ee3031bdd5b7821d906ad7a5696904438cff3fbc0fb38a8de45f8c924` | yes | no | name-find |
| 95 | round-48 | `.ufo/waves/round-48/r48/ScribeReceipts.md` | 7028 | `02698d8da9beb044b6a4058b9964bb898886f96459bdb525ddb7cce1b3601f39` | yes | no | name-find |
| 96 | round-48 | `.ufo/waves/round-48/r48/SentinelReceipt.md` | 8502 | `6ba037f9e0e15f0df4f52b4a97f1e143378cdbc07cd8a9c2f31368b8db7df2f8` | yes | no | name-find,nonce-grep |
| 97 | round-48 | `.ufo/waves/round-48/r48/kumitate-r48-MutSpawnDropBind-mutant-receipt.txt` | 1751 | `6917a49255d98fc6fc4cb76fd09aa6f03a4fcbd9ee0d9258aebc96d8e9991043` | yes | no | name-find |
| 98 | round-48 | `.ufo/waves/round-48/r48/kumitate-r48-MutSpawnDropBind-pristine-receipt.txt` | 1460 | `208cacbca0efd391dcab174a1d2e9a06ddd1e6cfd20f4d3d6c6078bfc0dfb042` | yes | no | name-find |
| 99 | round-48 | `.ufo/waves/round-48/r48/kumitate-r48-MutSpawnDropBind-restored-receipt.txt` | 1460 | `7b850adc44561c50d000a722848673babab1079004d9e5ba7e3c1f103ccd3a74` | yes | no | name-find |
| 100 | round-49 | `.ufo/waves/round-49/r49/L1-score-0526f898.txt` | 484 | `03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488` | yes | no | name-find |
| 101 | round-49 | `.ufo/waves/round-49/r49/ReRunCounter49-2.txt` | 484 | `03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488` | yes | no | name-find |
| 102 | round-49 | `.ufo/waves/round-49/r49/ReRunCounter49-3.txt` | 484 | `03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488` | yes | no | name-find |
| 103 | round-50 | `.ufo/waves/round-50/ReRunB49-1.txt` | 671 | `aa293cc4951a02b19aba7bbc3a8fc5dd19918aff4766e850f696421cb2dd06f6` | yes | no | name-find,missed-by-brace |
| 104 | round-50 | `.ufo/waves/round-50/ReRunB49-2.txt` | 671 | `96a01c840f91df0bcef0a065137aa9ace8067d832808fe67b6c1b2c34fb136ee` | yes | no | name-find,missed-by-brace |
| 105 | round-50 | `.ufo/waves/round-50/ReRunB49-3.txt` | 671 | `e59ff9af0562e25a29f80d6ea9762be06feb16c78cb623277e41cfba10f368da` | yes | no | name-find,missed-by-brace |
| 106 | round-50 | `.ufo/waves/round-50/plan.md` | 11920 | `fbbb643f10a24cfcbe76b3c0fb3d6f86f7bfeb32c3aee77616288ff98f9d8d6f` | yes | no | nonce-grep |
| 107 | round-50 | `.ufo/waves/round-50/r50/CritPlan.md` | 18658 | `6eac3d8f1547b893cf8855647e53c4c942da9b30ee272ada5b56355a729e8935` | yes | no | nonce-grep |
| 108 | round-50 | `.ufo/waves/round-50/r50/MutReceiptSyntax.md` | 11665 | `7aba23604d4d1b95f3b42e537427c54866eb90e5b749aa1d84e44a06c20bf982` | yes | no | name-find,missed-by-brace |
| 109 | round-50 | `.ufo/waves/round-50/r50/SimplifierGuard.md` | 8820 | `c299fe89db8e286c4da07956ab4b8504a487efbb637e43ca6b323c5c848a0978` | yes | no | nonce-grep |

## Inventory B — A4 walk files not already in inventory A

56 files. These are what the frozen counter opens beyond the item `find`. `parseable nonce` is no on every row.

| # | round | path | bytes | sha256 | at base c90b9de9 | parseable nonce | why |
|---|---|---|---|---|---|---|---|
| 1 | round-35 | `.ufo/waves/round-35/falsify/RerunChecklists.md` | 7142 | `35c51c5af157f9f626392a690214d8a9735792123e342506188974983797d8e7` | yes | no | a4-only |
| 2 | round-35 | `.ufo/waves/round-35/falsify/RerunClaims.md` | 5549 | `e078c15faa71666a4b924767aa8cdb3d93f5250e0bba51afbda9e661bb741947` | yes | no | a4-only |
| 3 | round-35 | `.ufo/waves/round-35/falsify/RerunKimi.md` | 5734 | `ee3fe5878512eaff5ae7260ea80f8f53013fa59903965ed9e09c3d76e6f52bfe` | yes | no | a4-only |
| 4 | round-35 | `.ufo/waves/round-35/falsify/RerunMutation.md` | 6935 | `d2d7d23df732857d95cebc3df93afe057809a4ff66a5bc702ed18988f1335f1a` | yes | no | a4-only |
| 5 | round-35 | `.ufo/waves/round-35/falsify/RerunProxy.md` | 6373 | `a425b33c095367d93ecd72bef032b123ed9ff181813fd3761a7f52843a76d14b` | yes | no | a4-only |
| 6 | round-35 | `.ufo/waves/round-35/falsify/RerunSelftestsGates.md` | 5829 | `1e971329a4c5d78a33eaf745e5f627c8e1521e8f5e693a34577892d882f5201c` | yes | no | a4-only |
| 7 | round-35 | `.ufo/waves/round-35/falsify/RerunSources.md` | 7571 | `df7967d1e241d5d342658fbb0efd5783504f56e32ec143e8559437e0d6d522bc` | yes | no | a4-only |
| 8 | round-40 | `.ufo/waves/round-40/build/ReviewCiteReceipt.md` | 6210 | `7d6a97c661b4b982bd76321227a88962dad154e3279966fcfe8388c1baf7d3cc` | yes | no | a4-only |
| 9 | round-40 | `.ufo/waves/round-40/falsify/ReviewCiteReceiptCand.md` | 5146 | `0d379edad39565c4ea1a9f7c10f370a8d5d7daa2a524333ca47fe8a301be0bff` | yes | no | a4-only |
| 10 | round-40 | `.ufo/waves/round-40/final/cite-receipts/cite-check-654d1b28-receipt-fleet.txt` | 227258 | `1ffd63741228f1cc6d7d6a5bda3bfb637f333b4a661ecdf9fded1f77fd396b2c` | yes | no | a4-only |
| 11 | round-40 | `.ufo/waves/round-40/final/cite-receipts/cite-check-d8bb37db-receipt-fleet.txt` | 226746 | `46c64c6f6bb56b80c75ce53c555a4938c7afec3849bbaf3e3c70573496e88feb` | yes | no | a4-only |
| 12 | round-40 | `.ufo/waves/round-40/final/cite-receipts/cite-check-open-f69817ed-receipt-fleet.txt` | 231237 | `b99f39c406246c7a8bc9de146a2f9dc72b6e6360e9aab5b96aea4388867dffe6` | yes | no | a4-only |
| 13 | round-40 | `.ufo/waves/round-40/open/receipts.txt` | 1836 | `9ccee694fe2412d89d97db28a27bd2a4bf84f961d19fd56d7aa3d660188bbc2a` | yes | no | a4-only |
| 14 | round-41 | `.ufo/waves/round-41/falsify/ReviewR403Receipt.md` | 9284 | `681fdcfadb20c150be2e073e85254f90b7926f99c4900fbcdd60a367d202393e` | yes | no | a4-only |
| 15 | round-41 | `.ufo/waves/round-41/final/cite-receipt-r40-3.txt` | 2798 | `39b8d93ced18df633f7d3e0d3a1951af1ddf187fe2682c77f540f45d949c08e3` | yes | no | a4-only |
| 16 | round-41 | `.ufo/waves/round-41/open/receipts.txt` | 2435 | `b8ac3ceb3463c88c07414ca81f8ca8533fd20852a4c003d02c99693760f6fbfb` | yes | no | a4-only |
| 17 | round-42 | `.ufo/waves/round-42/falsify/ReRunC1Terms.md` | 6238 | `52605e7030e8bc1e92c905786612c55b4ed65a48c1ed1b9a7c18538f41215ab8` | yes | no | a4-only |
| 18 | round-42 | `.ufo/waves/round-42/falsify/ReRunC2Census.md` | 2586 | `5392cdf6fdbb38d6bc730ea2197c60b75387bc7bc395f587fcb04dab019e935a` | yes | no | a4-only |
| 19 | round-42 | `.ufo/waves/round-42/falsify/ReRunChecklist.md` | 4875 | `28ca8f914671a999ed62219d5b42fc5c095856b6faf3304b3431baeb458fd0ad` | yes | no | a4-only |
| 20 | round-42 | `.ufo/waves/round-42/final/close-receipt.txt` | 1073 | `1fb1b2735bb5aab888c96a1aba1679f1196a549a99bf6a9aa6157c05287f01a6` | yes | no | a4-only |
| 21 | round-42 | `.ufo/waves/round-42/open/receipts.txt` | 3602 | `34b5bad4776ede35b1f1974c4b29a16d9fe253cbc7c74ceb39aeca49194ebad2` | yes | no | a4-only |
| 22 | round-43 | `.ufo/waves/round-43/falsify/ReRunC1Base.md` | 3945 | `1b5bb46bb86f2b29813eb0daa0983b7b41c07dae8a1f8eff0755e34989c97e1a` | yes | no | a4-only |
| 23 | round-43 | `.ufo/waves/round-43/falsify/ReRunC1Counter.md` | 3881 | `5c0de93241ad0c26f6020e49e8a2c6033d01f6b4d42ae032ffd002406ba91bc9` | yes | no | a4-only |
| 24 | round-43 | `.ufo/waves/round-43/falsify/ReRunCensusSelftestTime.md` | 2105 | `a5181abf44eedcd13ff85513b98d1aa82a4fb2779d6e2ee7cfde3805d83cf32f` | yes | no | a4-only |
| 25 | round-43 | `.ufo/waves/round-43/falsify/ReRunCiteSelftestTime.md` | 1920 | `01dfadbe2af10f47b3bbcf2942b0dd8744525dea1ee92d307bc15186072711c3` | yes | no | a4-only |
| 26 | round-43 | `.ufo/waves/round-43/falsify/ReRunDiscriminators.md` | 3995 | `51660f90a69ae3fefc306535bf0e905af0133ae9fd0ce1e1952eb02946c6530c` | yes | no | a4-only |
| 27 | round-43 | `.ufo/waves/round-43/falsify/ReRunGateSelftest.md` | 3384 | `96a96af3720710d701ca1f7d17d346e8307b320530d347f4ac3f955690174b95` | yes | no | a4-only |
| 28 | round-43 | `.ufo/waves/round-43/open/receipts.txt` | 2255 | `832a732c12e94fb5fbbb3c82a9b9e59a9fc2c065dca3a6e5fe4d10333f586e4a` | yes | no | a4-only |
| 29 | round-44 | `.ufo/waves/round-44/controls-v4/res-ReviewV3Receipts_ctl-both-verdicts-exit0.mjs.txt` | 24922 | `6951483f4998fad68c003b860b0f041de881c9e044fa3ee4247498ddbee16587` | yes | no | a4-only |
| 30 | round-44 | `.ufo/waves/round-44/controls-v4/res-ReviewV3Receipts_ctl-const-drift.mjs.txt` | 23673 | `f88102fd8891417cf308892179da61f43ae9726dac1c9acd58256f39f03d7f04` | yes | no | a4-only |
| 31 | round-44 | `.ufo/waves/round-44/controls-v4/res-ReviewV3Receipts_ctl-digitpermissive-v1.mjs.txt` | 23706 | `089b0ad174d82a4d2ad5a46511c74017f0b3bc4240eb84c76079e12dfba5516a` | yes | no | a4-only |
| 32 | round-44 | `.ufo/waves/round-44/controls-v4/res-ReviewV3Receipts_ctl-random-exit.mjs.txt` | 23464 | `32c6e4ff807fee513a25bbba3bf8365529b2d392145009dc584a84ef95430b75` | yes | no | a4-only |
| 33 | round-44 | `.ufo/waves/round-44/controls-v4/res-ReviewV3Receipts_ctl-random-half.mjs.txt` | 23666 | `ae4a319cbe88d2dfe83a479c6a3859ba99fa43c3709c7bd5bbd882883ce39c26` | yes | no | a4-only |
| 34 | round-44 | `.ufo/waves/round-44/controls-v4/res-ReviewV3Receipts_probe-const-clean.mjs.txt` | 23683 | `5a30f5a0c3f1e2bc2abf494c7671e26e9143b8cc47310774b761d142af81de5e` | yes | no | a4-only |
| 35 | round-44 | `.ufo/waves/round-44/controls/ExecR43ShippedReceipt.md` | 14473 | `a3d3ff3c7a8f9aed3693e1f504a9541313dcc4514c9f06a7fa9fa59c333ffc3c` | yes | no | a4-only |
| 36 | round-44 | `.ufo/waves/round-44/falsify/ReRunBefore.md` | 2608 | `6bf18f4a4989c9e5c0e490dc4c11aee4033ef06b4196e716fe9e4219194ed45f` | yes | no | a4-only |
| 37 | round-44 | `.ufo/waves/round-44/falsify/ReRunP44Fresh.md` | 7269 | `42c0a4510a8f2f85963b7890800aabfe450a700b5d68145d0e0e4bf759570c43` | yes | no | a4-only |
| 38 | round-44 | `.ufo/waves/round-44/falsify/ReRunP44Load.md` | 8001 | `c5595127dfb44a3448f651fe0bdcc687e9b9c7661e50c8431f87c7716b15029e` | yes | no | a4-only |
| 39 | round-44 | `.ufo/waves/round-44/falsify/ReRunP44Replay.md` | 3180 | `c35c6529f0fa6697b28f4769d81b3f362e14afab6a62670aaa05af0a964d4b98` | yes | no | a4-only |
| 40 | round-44 | `.ufo/waves/round-44/residual/ReviewV3Receipts.md` | 7425 | `3576d266f905a46d35970d16a7ffb02c1b646a5b974a6ec5a30eb3ba7f2a9ed2` | yes | no | a4-only |
| 41 | round-45 | `.ufo/waves/round-45/a2-control/CtlQuoteRerun.md` | 7341 | `2d629f9d8c76aa3edcfd8f2509cfa1f15ea8ee877268ab9af5061c3542561e4a` | yes | no | a4-only |
| 42 | round-46 | `.ufo/waves/round-46/residual/ReRunCounters.md` | 6539 | `0b14a2e12d153d4e2ad6d19cd776c2721c2393141c7dae064cb99c0b4d5e5a5d` | yes | no | a4-only |
| 43 | round-48 | `.ufo/waves/round-48/build/ExecA2Reruns.md` | 14259 | `5f45cd55ac3c815a7efa8015d00d2b085cebfe0939b0ca8f73a4a31599eba086` | yes | no | a4-only |
| 44 | round-48 | `.ufo/waves/round-48/build/a2-rerun-1.txt` | 1293 | `2aafd27d8440a38c15246fc3dab456da3fbcb2be349833d23f589efa8aa79630` | yes | no | a4-only |
| 45 | round-48 | `.ufo/waves/round-48/build/a2-rerun-2.txt` | 1269 | `e77a919d299bbe58e490331bccf72c40c375220b0fa02e78362c2ef58016f1ba` | yes | no | a4-only |
| 46 | round-48 | `.ufo/waves/round-48/build/a2-rerun-3.txt` | 1267 | `9040c45ec356ebba9a501a62d095e3a9b7234d51c36684d0a5c1449202c63507` | yes | no | a4-only |
| 47 | round-48 | `.ufo/waves/round-48/close/ReRunCounter48-1.md` | 4399 | `56ac2756b824eded77fd9f24e0fe84fdec22fb60d366edd0ebd7e602643d47ce` | yes | no | a4-only |
| 48 | round-48 | `.ufo/waves/round-48/close/ReRunCounter48-2.md` | 2007 | `59bec8dc3966eb163c8320944404cc35581c0bfca976d8bf8cdb56164b8fc4c2` | yes | no | a4-only |
| 49 | round-48 | `.ufo/waves/round-48/close/ReRunCounterA.md` | 4794 | `17777bdd350b7e0add7061aab176dbb7f4ce59d4ebde2c9ae612b3f7bdc17a76` | yes | no | a4-only |
| 50 | round-48 | `.ufo/waves/round-48/close/ReRunCounterB.md` | 2155 | `10fe677eb28440452771f5c2bd01f4cef42d6f9cb081aa1c70afbbe11fea6240` | yes | no | a4-only |
| 51 | round-48 | `.ufo/waves/round-48/close/ReRunR47Set.md` | 2534 | `46c23b3255a2ea3d96cc502fdb9ad886b8fc647e0dee57d4a9dc62583652a79d` | yes | no | a4-only |
| 52 | round-48 | `.ufo/waves/round-48/r48/ExecCounterRerun-agree.txt` | 1683 | `fe20afe2643f0e9d306b020085b4ccdaacd6902ec13132baec4035d97f9d2bb6` | yes | no | a4-only |
| 53 | round-48 | `.ufo/waves/round-48/r48/ExecCounterRerun-disagree-r48base.txt` | 1496 | `d4cacf3f52ffb66dd636987827fc069270aa1110d9032cb77dfb3e52c5958cd9` | yes | no | a4-only |
| 54 | round-48 | `.ufo/waves/round-48/r48/ExecCounterRerun-selftest.txt` | 1442 | `f2763490735d3efd0ad30e4675218d510e1e7dd8d8b4fc427c8bf162dbe39b69` | yes | no | a4-only |
| 55 | round-48 | `.ufo/waves/round-48/r48/ExecCounterRerun.md` | 15733 | `dce51261d1230a0082ec1608e3d6c363b1de5d18fd4d97e91c0ca4efd5898e44` | yes | no | a4-only |
| 56 | round-48 | `.ufo/waves/round-48/r48/ExecCounterRerun.patch` | 29127 | `b8fdd1c31c4ff6d3e28031b379790978b6c7d8c59cc9d94710278c462988ed5d` | yes | no | a4-only |

## Inventory C — `nonce` substring files that are not receipt-named

A4 does **not** open these (basename fails `/receipt|ReRun|L1-score/i`). Rows 1–3 are the only `nonce` hits outside rounds 48–50. Rows 4–6 are the round-50 prose hits already listed in inventory A (same sha256). None has a parseable nonce field.

| # | round | path | bytes | sha256 | at base c90b9de9 | parseable nonce | why |
|---|---|---|---|---|---|---|---|
| 1 | round-36 | `.ufo/waves/round-36/build/ScoutR7Members.md` | 14153 | `4d20af35c185386045e298f17208f2d730dd627f3afc985ed742afee0e9182c0` | yes | no | nonce-all |
| 2 | round-45 | `.ufo/waves/round-45/a2-control/ReopenS027.md` | 6424 | `850282c02ea042ecbe350fcab46334358966615812712844fc69e4331bf521c5` | yes | no | nonce-all |
| 3 | round-45 | `.ufo/waves/round-45/build/CtlQuoteFabricated.md` | 17907 | `a3502a34bd5f6ffa159c3eb96aa658a03c6201322ef79cee3a36f42122edfbb1` | yes | no | nonce-all |
| 4 | round-50 | `.ufo/waves/round-50/plan.md` | 11920 | `fbbb643f10a24cfcbe76b3c0fb3d6f86f7bfeb32c3aee77616288ff98f9d8d6f` | yes | no | nonce-grep |
| 5 | round-50 | `.ufo/waves/round-50/r50/CritPlan.md` | 18658 | `6eac3d8f1547b893cf8855647e53c4c942da9b30ee272ada5b56355a729e8935` | yes | no | nonce-grep |
| 6 | round-50 | `.ufo/waves/round-50/r50/SimplifierGuard.md` | 8820 | `c299fe89db8e286c4da07956ab4b8504a487efbb637e43ca6b323c5c848a0978` | yes | no | nonce-grep |

## Prose `nonce` mentions (not fields)

### `.ufo/waves/round-36/build/ScoutR7Members.md`

sha256 `4d20af35c185386045e298f17208f2d730dd627f3afc985ed742afee0e9182c0`. 3 line(s) contain the substring `nonce`; no parse rule fired.

- L46: - `create_0600_tmp` names `<prefix>-<pid>-<nanos:x>` (nonce only, no uuid), `create_new` 0600; `hard_link_tmp` maps AlreadyExists to Ok(false) (lost race), every other error propagates.
- L48: - Test pins: `tmp_guard_cleans_on_drop_but_not_after_disarm` (171) proves both drop arms; `hard_link_tmp_is_create_new_semantics` (155); `create_0600_tmp_creates_private_new_file_with_nonce_name` (131).
- L57: `create_0600_tmp_creates_private_new_file_with_nonce_name` (`fs_durability.rs:131`)

### `.ufo/waves/round-45/a2-control/ReopenS027.md`

sha256 `850282c02ea042ecbe350fcab46334358966615812712844fc69e4331bf521c5`. 1 line(s) contain the substring `nonce`; no parse rule fired.

- L38: - Blob-page receipts are non-regenerable (per-request nonce); only raw-URL hashes are.

### `.ufo/waves/round-45/build/CtlQuoteFabricated.md`

sha256 `a3502a34bd5f6ffa159c3eb96aa658a03c6201322ef79cee3a36f42122edfbb1`. 1 line(s) contain the substring `nonce`; no parse rule fired.

- L293: page carries a per-request nonce. The quote re-opened FOUND in all three,

### `.ufo/waves/round-48/r48/SentinelReceipt.md`

sha256 `6ba037f9e0e15f0df4f52b4a97f1e143378cdbc07cd8a9c2f31368b8db7df2f8`. 1 line(s) contain the substring `nonce`; no parse rule fired.

- L3: No signed provenance, run nonce, or trusted receipt manifest is part of the inspected receipt format.

### `.ufo/waves/round-50/plan.md`

sha256 `fbbb643f10a24cfcbe76b3c0fb3d6f86f7bfeb32c3aee77616288ff98f9d8d6f`. 1 line(s) contain the substring `nonce`; no parse rule fired.

- L60: writing /tmp/<nonce> through `--bind /tmp` leaves a host file — the bug in one file).

### `.ufo/waves/round-50/r50/CritPlan.md`

sha256 `6eac3d8f1547b893cf8855647e53c4c942da9b30ee272ada5b56355a729e8935`. 3 line(s) contain the substring `nonce`; no parse rule fired.

- L80: The mount-table correction has its own boundary: G50:96 tests existence of a tmpfs row, not which stacked mount supplies effective `/tmp`. The nonce write additionally checks absence at one host path, not the provenance 
- L94: | C1 plan:50, child `/tmp` “is still tmpfs” | One `.some(...)` mount-table test plus one nonce write (G50:94–101) | **One mechanism/observation.** Does not enumerate effective stacked-mount origins; see chronology sectio
- L95: | C1 plan:51–54, both suites PASS, five named pins, strict proxy MATCH, no-bind write leaves no host file | G4/G5 check two executions; G6 loops five keys; G7 one proxy execution; G8 one nonce write | **Finite observatio

### `.ufo/waves/round-50/r50/SimplifierGuard.md`

sha256 `c299fe89db8e286c4da07956ab4b8504a487efbb637e43ca6b323c5c848a0978`. 2 line(s) contain the substring `nonce`; no parse rule fired.

- L47: | 3 | `--tmpfs /tmp` then `--bind /tmp /tmp`, child `touch /tmp/<nonce>` | **HOST FILE APPEARED** (leak), child rc=0 |
- L48: | 4 | `--tmpfs /tmp`, no bind, child `touch /tmp/<nonce>` | no host file — tmpfs isolation intact |

## Negative claim

Across 109 item-sweep files and 162 A4-walk files (168 unique paths hashed), **zero** files contain a parseable nonce field. 0 of those paths are missing or byte-different at `c90b9de94009b938fa19a089bfaa97df20b54f86`. 0 differ from the index. The ledger therefore has no prior nonce value, in this corpus, to collide with. A4's check is still a substring search of the new nonce against these file bytes (`attest51-probe.mjs:155-160`), not a field parse — so a future nonce could still collide with an unrelated hex string inside one of these files. No such field exists to forbid.

Same-bytes observation, not a nonce: the three round-49 name-find files are byte-identical (`cmp` equal, 484 bytes, sha256 `03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488`): `.ufo/waves/round-49/r49/L1-score-0526f898.txt`, `ReRunCounter49-2.txt`, `ReRunCounter49-3.txt`. Inventory A rows 100–102.

Outside the 168: `.ufo/rounds/round-33/receipt-prerequisites.json` was parsed as JSON and has no `nonce` key. `scripts/counter-rerun.mjs` is not a receipt.

## Commit / cleanliness

Every hashed path is tracked, worktree blob equals the index, and that blob is the blob at `c90b9de94009b938fa19a089bfaa97df20b54f86`.

