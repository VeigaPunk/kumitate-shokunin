# B4 prior-corpus sweep — ScoutReceiptCorpora

## Axes

- Completeness: every matching regular file outside round-52, with no truncated discovery group.
- Evidence fidelity: exact-byte SHA-256, base blob equality, and actual `git archive` membership.
- Contract alignment and read-only safety: distinguish B4's raw substring scan from nonce-field parsing; write only this seat's permitted artifacts.

## Findings (observed; high confidence)

- **176 prior files** match `/receipt|ReRun|L1-score/i` on their basenames. Full inventory below.
- **0/176** contain a parseable 32-hex nonce field under the classifier below.
- **176/176** current file contents equal their frozen-base blobs at `02c01258464cac3804faf177d0cfbf113cd59706`; the base archive has exactly the same 176 paths and SHA-256 values.
- Therefore the predicted B4 internal `prior.length` is **176** when its receipt-directory precondition is satisfied on these bytes.
- The requested comparison against a printed base `prior-files=N` **cannot be completed from the frozen receipt**: it contains **no `prior-files=` field**, only **`B4 MISS tool or receipts dir absent`**. This is not a count mismatch and is not evidence of a zero-file sweep.
- Separately, `attest52-probe.mjs:473` renders successful arms as just `B4 PASS`, discarding their detail; failed-arm detail is truncated to 80 characters. Thus a successful B4 currently does **not** print its internally appended `prior-files=176` either.

## Evidence and source contract

- Frozen plan: `.ufo/waves/round-52/plan.md:113-129` (B4 contract).
- Source: `.ufo/waves/round-52/probe/attest52-probe.mjs:95,118-128,302-335,470-474`.
- Probe SHA-256: `f6146a2cfd3fba984848c5b91c1d2570108dc751d5edca5939d6f4aee5171428`.
- Frozen base receipt: `.ufo/waves/round-52/base/attest52-base.txt:1`.
- Base receipt SHA-256: `57355f3d6a1cc669e39993513e4fd9433a2a8c9d9c6cd9363d0fb468f1b0167d`.
- B4 is conditional on both `scripts/receipt-attest.mjs` and `.ufo/waves/round-52/receipts` existing (`:304`). Only that branch walks prior waves (`:315-324`), checks raw nonce substrings (`:327-330`), and appends the count (`:333`). The base receipt records the other branch (`:334`).
- The probe walks a **Git archive of the supplied revision**, not the current filesystem (`:118-128`). This report measured both; they agree for all selected files.
- Definition/caller trace is literal source evidence: inline B4 `walk(waves)` → `prior.push(p)` → `hold('B4', ...)` → final checks renderer. LSP was requested through `read xd://lsp`; the device is unavailable (mounted devices reported only `ast_edit` and `debug`). No semantic/LSP proof is claimed.

## Counts by round

| Round | Selected regular files |
| --- | ---: |
| round-35 | 7 |
| round-40 | 6 |
| round-41 | 3 |
| round-42 | 5 |
| round-43 | 7 |
| round-44 | 12 |
| round-45 | 1 |
| round-46 | 1 |
| round-48 | 113 |
| round-49 | 3 |
| round-50 | 4 |
| round-51 | 14 |
| **Total** | **176** |

Rounds 36–39 and 47 have zero selected regular files. `receipts/` directories in rounds 40, 46, 47, and 48 are not themselves files.

## Commands and calculation (executed)

Discovery used the specialized `glob` tool, not a shell name-search. The root directory read identified rounds 35–52. These independent tool calls were issued concurrently for every `r` in 35 through 51, with `hidden=true`, `gitignore=false`, `limit=200`:

```python
root = f"/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-{r}"
patterns = ["*[rR][eE][cC][eE][iI][pP][tT]*", "*[rR][eE][rR][uU][nN]*", "*[lL]1-[sS][cC][oO][rR][eE]*"]
await tool.glob({"i": "Listing prior corpus candidates",
                 "path": ";".join(root + "/**/" + p for p in patterns),
                 "hidden": True, "gitignore": False, "limit": 200})
```

The tool's `details.files` lists were unioned, resolving relative paths against `/home/vgpnk/Projects/shokunin`; directory entries were removed with `Path.is_file()`. No group reached the 200-entry cap (largest group: 114 entries in round-48, including a directory). The result contains 176 regular files, no symlinks, and no round-52 paths.

These read-only Git commands were executed, the latter two through Python `subprocess.run` with `capture_output=True`:

```sh
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin ls-tree -rz --full-tree 02c01258464cac3804faf177d0cfbf113cd59706 -- .ufo/waves
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin cat-file --batch
git -C /home/vgpnk/Projects/shokunin/kumitate-shokunin archive --format=tar 02c01258464cac3804faf177d0cfbf113cd59706 .ufo/waves
```

`cat-file --batch` stdin was one selected blob OID plus newline for each of the 176 `ls-tree` matches. Each returned blob was compared byte-for-byte with its worktree path: **176/176 equal**. The tar was read in memory with `tarfile.open(fileobj=io.BytesIO(stdout), mode="r:")`, without extracting or writing anything. Its regular-file members were selected with the B4 basename regex and directory exclusion. Archive and worktree selected-path symmetric difference: **[]**. Archive/worktree SHA-256 mismatches: **[]**.

Hashes and nonce classification were computed in Python Eval with `hashlib.sha256(Path(path).read_bytes()).hexdigest()` and the following classifier (all matching field values must be strings of exactly 32 hexadecimal characters):

```python
nonce32_re = re.compile(r"^[0-9a-fA-F]{32}$")
nonce_key_re = re.compile(r'"nonce"\s*:\s*("(?:\\.|[^"\\])*")')
# For every line in UTF-8 text (replacement decoding only for classification):
# 1. If lstrip().startswith("{"), json.loads(line); check top-level object.nonce.
# 2. For every nonce_key_re match, json.loads(match.group(1)); check nonce32_re.
# 3. Check standalone nonce: VALUE / nonce=VALUE lines, allowing a quoted key,
#    quoted or unquoted 32-hex value, and an optional trailing comma/semicolon.
# A file is "yes" if any of these finds a nonce32 value; otherwise "no".
```

This includes the probe's JSON-line convention and additionally checks embedded literal JSON key/value fields and standalone key/value fields. It does not mistake the word `nonce` in prose or dynamically generated source expressions for a parseable field. **B4 itself does not parse prior fields at all**; it uses raw substring membership (`txt.includes(n)`).

The exact frozen base receipt was read with `read` at `:1-2:raw`, then the following calculation was executed:

```python
re.findall(r"prior-files=(\d+)", base_receipt_text)  # => []
re.search(r"\| B4 [^|]+", base_receipt_text).group().strip()
# => "| B4 MISS tool or receipts dir absent"
```

### Equivalent requested find command (not executed)

The shell equivalent is supplied for reproduction; discovery above used the mandatory specialized tool instead:

```sh
LANE=/home/vgpnk/Projects/shokunin/kumitate-shokunin
find "$LANE/.ufo/waves" -type d -name '*round-52' -prune -o -type f \( -iname '*receipt*' -o -iname '*rerun*' -o -iname '*L1-score*' \) -print0
```

`*round-52` reproduces the probe's directory-name suffix exclusion. In the observed tree this is the same selection as excluding the top-level round-52 subtree. Names, not full paths, are matched; a directory named `receipts` does not cause its children to be selected.

## Full inventory

All paths are relative to `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. `nonce32` means a parseable field, not arbitrary text containing a 32-hex substring. Every listed row matches its base blob and base archive SHA-256.

| # | Path | Bytes | SHA-256 of exact file bytes | nonce32 |
| ---: | --- | ---: | --- | --- |
| 1 | `.ufo/waves/round-35/falsify/RerunChecklists.md` | 7142 | `35c51c5af157f9f626392a690214d8a9735792123e342506188974983797d8e7` | no |
| 2 | `.ufo/waves/round-35/falsify/RerunClaims.md` | 5549 | `e078c15faa71666a4b924767aa8cdb3d93f5250e0bba51afbda9e661bb741947` | no |
| 3 | `.ufo/waves/round-35/falsify/RerunKimi.md` | 5734 | `ee3fe5878512eaff5ae7260ea80f8f53013fa59903965ed9e09c3d76e6f52bfe` | no |
| 4 | `.ufo/waves/round-35/falsify/RerunMutation.md` | 6935 | `d2d7d23df732857d95cebc3df93afe057809a4ff66a5bc702ed18988f1335f1a` | no |
| 5 | `.ufo/waves/round-35/falsify/RerunProxy.md` | 6373 | `a425b33c095367d93ecd72bef032b123ed9ff181813fd3761a7f52843a76d14b` | no |
| 6 | `.ufo/waves/round-35/falsify/RerunSelftestsGates.md` | 5829 | `1e971329a4c5d78a33eaf745e5f627c8e1521e8f5e693a34577892d882f5201c` | no |
| 7 | `.ufo/waves/round-35/falsify/RerunSources.md` | 7571 | `df7967d1e241d5d342658fbb0efd5783504f56e32ec143e8559437e0d6d522bc` | no |
| 8 | `.ufo/waves/round-40/build/ReviewCiteReceipt.md` | 6210 | `7d6a97c661b4b982bd76321227a88962dad154e3279966fcfe8388c1baf7d3cc` | no |
| 9 | `.ufo/waves/round-40/falsify/ReviewCiteReceiptCand.md` | 5146 | `0d379edad39565c4ea1a9f7c10f370a8d5d7daa2a524333ca47fe8a301be0bff` | no |
| 10 | `.ufo/waves/round-40/final/cite-receipts/cite-check-654d1b28-receipt-fleet.txt` | 227258 | `1ffd63741228f1cc6d7d6a5bda3bfb637f333b4a661ecdf9fded1f77fd396b2c` | no |
| 11 | `.ufo/waves/round-40/final/cite-receipts/cite-check-d8bb37db-receipt-fleet.txt` | 226746 | `46c64c6f6bb56b80c75ce53c555a4938c7afec3849bbaf3e3c70573496e88feb` | no |
| 12 | `.ufo/waves/round-40/final/cite-receipts/cite-check-open-f69817ed-receipt-fleet.txt` | 231237 | `b99f39c406246c7a8bc9de146a2f9dc72b6e6360e9aab5b96aea4388867dffe6` | no |
| 13 | `.ufo/waves/round-40/open/receipts.txt` | 1836 | `9ccee694fe2412d89d97db28a27bd2a4bf84f961d19fd56d7aa3d660188bbc2a` | no |
| 14 | `.ufo/waves/round-41/falsify/ReviewR403Receipt.md` | 9284 | `681fdcfadb20c150be2e073e85254f90b7926f99c4900fbcdd60a367d202393e` | no |
| 15 | `.ufo/waves/round-41/final/cite-receipt-r40-3.txt` | 2798 | `39b8d93ced18df633f7d3e0d3a1951af1ddf187fe2682c77f540f45d949c08e3` | no |
| 16 | `.ufo/waves/round-41/open/receipts.txt` | 2435 | `b8ac3ceb3463c88c07414ca81f8ca8533fd20852a4c003d02c99693760f6fbfb` | no |
| 17 | `.ufo/waves/round-42/falsify/ReRunC1Terms.md` | 6238 | `52605e7030e8bc1e92c905786612c55b4ed65a48c1ed1b9a7c18538f41215ab8` | no |
| 18 | `.ufo/waves/round-42/falsify/ReRunC2Census.md` | 2586 | `5392cdf6fdbb38d6bc730ea2197c60b75387bc7bc395f587fcb04dab019e935a` | no |
| 19 | `.ufo/waves/round-42/falsify/ReRunChecklist.md` | 4875 | `28ca8f914671a999ed62219d5b42fc5c095856b6faf3304b3431baeb458fd0ad` | no |
| 20 | `.ufo/waves/round-42/final/close-receipt.txt` | 1073 | `1fb1b2735bb5aab888c96a1aba1679f1196a549a99bf6a9aa6157c05287f01a6` | no |
| 21 | `.ufo/waves/round-42/open/receipts.txt` | 3602 | `34b5bad4776ede35b1f1974c4b29a16d9fe253cbc7c74ceb39aeca49194ebad2` | no |
| 22 | `.ufo/waves/round-43/falsify/ReRunC1Base.md` | 3945 | `1b5bb46bb86f2b29813eb0daa0983b7b41c07dae8a1f8eff0755e34989c97e1a` | no |
| 23 | `.ufo/waves/round-43/falsify/ReRunC1Counter.md` | 3881 | `5c0de93241ad0c26f6020e49e8a2c6033d01f6b4d42ae032ffd002406ba91bc9` | no |
| 24 | `.ufo/waves/round-43/falsify/ReRunCensusSelftestTime.md` | 2105 | `a5181abf44eedcd13ff85513b98d1aa82a4fb2779d6e2ee7cfde3805d83cf32f` | no |
| 25 | `.ufo/waves/round-43/falsify/ReRunCiteSelftestTime.md` | 1920 | `01dfadbe2af10f47b3bbcf2942b0dd8744525dea1ee92d307bc15186072711c3` | no |
| 26 | `.ufo/waves/round-43/falsify/ReRunDiscriminators.md` | 3995 | `51660f90a69ae3fefc306535bf0e905af0133ae9fd0ce1e1952eb02946c6530c` | no |
| 27 | `.ufo/waves/round-43/falsify/ReRunGateSelftest.md` | 3384 | `96a96af3720710d701ca1f7d17d346e8307b320530d347f4ac3f955690174b95` | no |
| 28 | `.ufo/waves/round-43/open/receipts.txt` | 2255 | `832a732c12e94fb5fbbb3c82a9b9e59a9fc2c065dca3a6e5fe4d10333f586e4a` | no |
| 29 | `.ufo/waves/round-44/controls/ExecR43ShippedReceipt.md` | 14473 | `a3d3ff3c7a8f9aed3693e1f504a9541313dcc4514c9f06a7fa9fa59c333ffc3c` | no |
| 30 | `.ufo/waves/round-44/controls-v4/res-ReviewV3Receipts_ctl-both-verdicts-exit0.mjs.txt` | 24922 | `6951483f4998fad68c003b860b0f041de881c9e044fa3ee4247498ddbee16587` | no |
| 31 | `.ufo/waves/round-44/controls-v4/res-ReviewV3Receipts_ctl-const-drift.mjs.txt` | 23673 | `f88102fd8891417cf308892179da61f43ae9726dac1c9acd58256f39f03d7f04` | no |
| 32 | `.ufo/waves/round-44/controls-v4/res-ReviewV3Receipts_ctl-digitpermissive-v1.mjs.txt` | 23706 | `089b0ad174d82a4d2ad5a46511c74017f0b3bc4240eb84c76079e12dfba5516a` | no |
| 33 | `.ufo/waves/round-44/controls-v4/res-ReviewV3Receipts_ctl-random-exit.mjs.txt` | 23464 | `32c6e4ff807fee513a25bbba3bf8365529b2d392145009dc584a84ef95430b75` | no |
| 34 | `.ufo/waves/round-44/controls-v4/res-ReviewV3Receipts_ctl-random-half.mjs.txt` | 23666 | `ae4a319cbe88d2dfe83a479c6a3859ba99fa43c3709c7bd5bbd882883ce39c26` | no |
| 35 | `.ufo/waves/round-44/controls-v4/res-ReviewV3Receipts_probe-const-clean.mjs.txt` | 23683 | `5a30f5a0c3f1e2bc2abf494c7671e26e9143b8cc47310774b761d142af81de5e` | no |
| 36 | `.ufo/waves/round-44/falsify/ReRunBefore.md` | 2608 | `6bf18f4a4989c9e5c0e490dc4c11aee4033ef06b4196e716fe9e4219194ed45f` | no |
| 37 | `.ufo/waves/round-44/falsify/ReRunP44Fresh.md` | 7269 | `42c0a4510a8f2f85963b7890800aabfe450a700b5d68145d0e0e4bf759570c43` | no |
| 38 | `.ufo/waves/round-44/falsify/ReRunP44Load.md` | 8001 | `c5595127dfb44a3448f651fe0bdcc687e9b9c7661e50c8431f87c7716b15029e` | no |
| 39 | `.ufo/waves/round-44/falsify/ReRunP44Replay.md` | 3180 | `c35c6529f0fa6697b28f4769d81b3f362e14afab6a62670aaa05af0a964d4b98` | no |
| 40 | `.ufo/waves/round-44/residual/ReviewV3Receipts.md` | 7425 | `3576d266f905a46d35970d16a7ffb02c1b646a5b974a6ec5a30eb3ba7f2a9ed2` | no |
| 41 | `.ufo/waves/round-45/a2-control/CtlQuoteRerun.md` | 7341 | `2d629f9d8c76aa3edcfd8f2509cfa1f15ea8ee877268ab9af5061c3542561e4a` | no |
| 42 | `.ufo/waves/round-46/residual/ReRunCounters.md` | 6539 | `0b14a2e12d153d4e2ad6d19cd776c2721c2393141c7dae064cb99c0b4d5e5a5d` | no |
| 43 | `.ufo/waves/round-48/build/CtlBwrapOnly-receipt.txt` | 1832 | `2a0a7561adb580eb86c6ad172e2afdec473e26251c9a2b625d0897dde6d11f36` | no |
| 44 | `.ufo/waves/round-48/build/CtlCountPad-pristine-receipt.txt` | 1952 | `457cbb0a8cf5475a1406bbca9b1ac09589dddd5d6d5fd8d202df2f6816cc1964` | no |
| 45 | `.ufo/waves/round-48/build/CtlCountPad-receipt.txt` | 1958 | `db9f1aa567e61aa64656a63af5d8a897cb88c332ec52e345eb18d46d0baf7c82` | no |
| 46 | `.ufo/waves/round-48/build/CtlCountPad-restoration-receipt.txt` | 706 | `d225701958281b3fe2cafccf21f6882e3b769daa486a8a35ece4f7b9c2bcaf6c` | no |
| 47 | `.ufo/waves/round-48/build/CtlCountPad-restored-receipt.txt` | 1952 | `745bc90449812afa087102aa41ba40c7ecf47043345e0966939fe35688ab9792` | no |
| 48 | `.ufo/waves/round-48/build/CtlDirectSystemd-pristine-receipt.txt` | 1952 | `fa03c59cf47df5d4c9ee5e6ceebd974db94ef36d0cdd904853eb8b6b8f5f68e7` | no |
| 49 | `.ufo/waves/round-48/build/CtlDirectSystemd-receipt.txt` | 1727 | `7dfc74dc8a237a828deed282dca9ff7fdd50f9d751a4ffe3428bc85d4cf5dacc` | no |
| 50 | `.ufo/waves/round-48/build/CtlDirectSystemd-restored-receipt.txt` | 1952 | `6aedc2555f6b2a5eed336d8d5b800b72bd79f1738a06b37c54b7906a97d02a8a` | no |
| 51 | `.ufo/waves/round-48/build/CtlDoNothing-receipt-a.txt` | 3994 | `508e0977fd6f8a5b22c5459cf63ce03d026bcae2331b5f008c145267fbd0325e` | no |
| 52 | `.ufo/waves/round-48/build/CtlDoNothing-receipt-b.txt` | 1959 | `4aac715be836b13d601c35bb0a60627fa44bdab9170b7a6ee42dcd1d27a76c21` | no |
| 53 | `.ufo/waves/round-48/build/CtlDodge-receipt.txt` | 5534 | `ebc5a70cbcda0b2ad7be9338c43ef028a3f8cbe088b27c6c05bf273d029efb50` | no |
| 54 | `.ufo/waves/round-48/build/CtlEnvCaps-pristine-receipt.txt` | 1465 | `b0942e5d5aafb07f5953fddc61e00708e6304450002ca9d260e543ab733d7167` | no |
| 55 | `.ufo/waves/round-48/build/CtlEnvCaps-receipt.txt` | 1720 | `78e789adae64f576b741233f894e76f8c52ba858e852944ee298b4bcec63e61e` | no |
| 56 | `.ufo/waves/round-48/build/CtlEnvCaps-restored-receipt.txt` | 1465 | `6688d4f5d45783e2f3011cbd65ea17f1292b64bbb645d2b4610b884462c73892` | no |
| 57 | `.ufo/waves/round-48/build/CtlEnvPassthrough-receipt.txt` | 1667 | `3d099b6d468e2361281b14f70668de1e47ea813cf88569faf4c5a49ff9596907` | no |
| 58 | `.ufo/waves/round-48/build/CtlFakeRunner-a-receipt.txt` | 1732 | `630de20d30e51b0a08b317fd4de196f9bcc4524ee806ee05bf34cad62629dea2` | no |
| 59 | `.ufo/waves/round-48/build/CtlFakeRunner-a-restored-receipt.txt` | 1959 | `de4faf13a386948ba2e1c88e8e159a8aebb9a199ec4fff963bdd883937405da1` | no |
| 60 | `.ufo/waves/round-48/build/CtlFakeRunner-b-receipt.txt` | 1792 | `9229e5c51c6c76a704cec559af4a18bd52ae63afcdcf53ed2b23d4201533a7ca` | no |
| 61 | `.ufo/waves/round-48/build/CtlFakeRunner-b-restored-receipt.txt` | 1960 | `3193bb9b3923304ef9eccd6fe61f12261807454c4488a21f8dbcf8243f89f8ea` | no |
| 62 | `.ufo/waves/round-48/build/CtlFakeRunner-pristine-receipt.txt` | 1960 | `a8fa0b67aa07f590458d0ced90a0cebdbe058b127dfa6b14ee8ab600a9096870` | no |
| 63 | `.ufo/waves/round-48/build/CtlFakeRunner-receipt.txt` | 3641 | `923eab2ac52a0656d7eedece5ac4fd2b056db3db6ccb836c33e9571fc591dd1b` | no |
| 64 | `.ufo/waves/round-48/build/CtlFirstCallOnly-receipt.txt` | 1777 | `9914f513dca0e70a05950787fa885784d95044428d3869794b1f1333a8424164` | no |
| 65 | `.ufo/waves/round-48/build/CtlJunk-pristine-initial-receipt.txt` | 172 | `52f90b455a687a5799e72175b640d3da3a57027f7e153848f0ef4a2ec7444f08` | no |
| 66 | `.ufo/waves/round-48/build/CtlJunk-pristine-receipt.txt` | 1952 | `c1be3b1d318646ef7b65adcbc5b638b28381348b9528e79924dd62701272980e` | no |
| 67 | `.ufo/waves/round-48/build/CtlJunk-receipt.txt` | 1830 | `8fa7da10aafe2d4f435d9f307f644c6a0f261e868dbbeea703a2dc2f8d8a356d` | no |
| 68 | `.ufo/waves/round-48/build/CtlJunk-restored-receipt.txt` | 1952 | `c5215aafba0ee1ebba38d716784de1f12d91b0ccf044753b10dd929839c3b8b5` | no |
| 69 | `.ufo/waves/round-48/build/CtlLooseCaps-pristine-receipt.txt` | 1952 | `40edceb7d96e216c9792882885de3cefb979adc6baab57f3e26a5f044bedaa07` | no |
| 70 | `.ufo/waves/round-48/build/CtlLooseCaps-receipt.txt` | 1715 | `76d0802a02ec190227f104fe377699f23c53a39a2f41a6855104f4c590af58d1` | no |
| 71 | `.ufo/waves/round-48/build/CtlLooseCaps-restored-receipt.txt` | 1952 | `bc38ab1a367ea90a10b3b11405e12ac89c2d87f20ef510949a498bd0aad43762` | no |
| 72 | `.ufo/waves/round-48/build/CtlMention-pristine-receipt.txt` | 1952 | `24e4be52f166f1180273ce1275dab7e384cc03146e2ca381bddf1e676986aa70` | no |
| 73 | `.ufo/waves/round-48/build/CtlMention-receipt.txt` | 1952 | `3c55e0943627ca7611fc5d764b620eb178bb96f2f441c6c9f824854e8233cec5` | no |
| 74 | `.ufo/waves/round-48/build/CtlMention-restored-receipt.txt` | 1952 | `fa2d1a589dc9ded3ea5de0a35a5d992d52f0cd4406ce1e25bc2be60edb41525b` | no |
| 75 | `.ufo/waves/round-48/build/CtlNestedAllowance-pristine-attempt0-receipt.txt` | 375 | `acaf6b73263d26d2aedbbebaceed6b3fecca5d01d058b490880f2a77266444e4` | no |
| 76 | `.ufo/waves/round-48/build/CtlNestedAllowance-pristine-receipt.txt` | 1959 | `038e5bd8dcfc2f3479012a3b889b71164f658d5a8a2d1e90eacecb21791cb057` | no |
| 77 | `.ufo/waves/round-48/build/CtlNestedAllowance-receipt.txt` | 1721 | `d36d1ac694fec095e6ce374df0334063fbe822c668e711b69f89ed08a0c1b526` | no |
| 78 | `.ufo/waves/round-48/build/CtlNestedAllowance-restored-receipt.txt` | 1960 | `a369b80b8cf9a6f5cf4e068efee8930aa277ca9deae4e149e20db40bb4463e9b` | no |
| 79 | `.ufo/waves/round-48/build/CtlRetParse48-receipt.txt` | 1952 | `72cf64c42c3d162de7dd0b0fa2df004471635a3dc0867ae81ccc818e9c949737` | no |
| 80 | `.ufo/waves/round-48/build/CtlScopeOnly-receipt.txt` | 1792 | `026ab3adbfa862169117df7940ae88eed0b25d1599164a9ee768721627a39ba9` | no |
| 81 | `.ufo/waves/round-48/build/CtlStubChild-receipt.txt` | 1708 | `9a801a95f630aadfc7022bee9bdc63484225b41f55bccc32470a40ae3be03e95` | no |
| 82 | `.ufo/waves/round-48/build/CtlSummaryForge-receipt.txt` | 1586 | `de2794ea6d7784cf9718e88630bf47bb8a67765e5330fd3384e215d3c7cb641b` | no |
| 83 | `.ufo/waves/round-48/build/ExecA2Reruns.md` | 14259 | `5f45cd55ac3c815a7efa8015d00d2b085cebfe0939b0ca8f73a4a31599eba086` | no |
| 84 | `.ufo/waves/round-48/build/a2-rerun-1.txt` | 1293 | `2aafd27d8440a38c15246fc3dab456da3fbcb2be349833d23f589efa8aa79630` | no |
| 85 | `.ufo/waves/round-48/build/a2-rerun-2.txt` | 1269 | `e77a919d299bbe58e490331bccf72c40c375220b0fa02e78362c2ef58016f1ba` | no |
| 86 | `.ufo/waves/round-48/build/a2-rerun-3.txt` | 1267 | `9040c45ec356ebba9a501a62d095e3a9b7234d51c36684d0a5c1449202c63507` | no |
| 87 | `.ufo/waves/round-48/close/L1-receipts.sha256` | 979 | `1c41b3642adfeb516b35ebccd6f2e75ea6dd2d9401bf50475de4e433598bac20` | no |
| 88 | `.ufo/waves/round-48/close/ReRunCounter48-1-receipt.txt` | 1899 | `fd7d8866efbead2128d9bc00964f47d97443f08b45852508d186ad83f30424a2` | no |
| 89 | `.ufo/waves/round-48/close/ReRunCounter48-1.md` | 4399 | `56ac2756b824eded77fd9f24e0fe84fdec22fb60d366edd0ebd7e602643d47ce` | no |
| 90 | `.ufo/waves/round-48/close/ReRunCounter48-2-receipt.md` | 4622 | `4937a0dc5e03edf9c98e3f3c3d63afc98fb01ea42ea3d9488bda0227a9cdb768` | no |
| 91 | `.ufo/waves/round-48/close/ReRunCounter48-2-receipt.txt` | 1604 | `1aa15c7e2c64273a5b3b2781a94e94781eba63626d717170bca31e772afd57c1` | no |
| 92 | `.ufo/waves/round-48/close/ReRunCounter48-2.md` | 2007 | `59bec8dc3966eb163c8320944404cc35581c0bfca976d8bf8cdb56164b8fc4c2` | no |
| 93 | `.ufo/waves/round-48/close/ReRunCounterA-original-receipt-run1.txt` | 2326 | `92f692d85ca948852c7de53cb78825f000c6a23da4d545ac409547e2b13dd3c1` | no |
| 94 | `.ufo/waves/round-48/close/ReRunCounterA.md` | 4794 | `17777bdd350b7e0add7061aab176dbb7f4ce59d4ebde2c9ae612b3f7bdc17a76` | no |
| 95 | `.ufo/waves/round-48/close/ReRunCounterB.md` | 2155 | `10fe677eb28440452771f5c2bd01f4cef42d6f9cb081aa1c70afbbe11fea6240` | no |
| 96 | `.ufo/waves/round-48/close/ReRunR47Set-receipt.md` | 2357 | `08d9e4024d49908683b794ac999b8ebd652861a058bcec49226b12206027990c` | no |
| 97 | `.ufo/waves/round-48/close/ReRunR47Set-receipt.txt` | 3842 | `8c99fbf925f65b3dd882c1799bab2cd1aefbec31c2c723dcb1beda301e026afc` | no |
| 98 | `.ufo/waves/round-48/close/ReRunR47Set.md` | 2534 | `46c23b3255a2ea3d96cc502fdb9ad886b8fc647e0dee57d4a9dc62583652a79d` | no |
| 99 | `.ufo/waves/round-48/r48/CritReceiptPlan.md` | 17806 | `ff4b7ab55a2f747e82598527dfe66f25658abd716b4c929714b93ce430be164e` | no |
| 100 | `.ufo/waves/round-48/r48/ExecCounterRerun-agree.txt` | 1683 | `fe20afe2643f0e9d306b020085b4ccdaacd6902ec13132baec4035d97f9d2bb6` | no |
| 101 | `.ufo/waves/round-48/r48/ExecCounterRerun-disagree-r48base.txt` | 1496 | `d4cacf3f52ffb66dd636987827fc069270aa1110d9032cb77dfb3e52c5958cd9` | no |
| 102 | `.ufo/waves/round-48/r48/ExecCounterRerun-selftest.txt` | 1442 | `f2763490735d3efd0ad30e4675218d510e1e7dd8d8b4fc427c8bf162dbe39b69` | no |
| 103 | `.ufo/waves/round-48/r48/ExecCounterRerun.md` | 15733 | `dce51261d1230a0082ec1608e3d6c363b1de5d18fd4d97e91c0ca4efd5898e44` | no |
| 104 | `.ufo/waves/round-48/r48/ExecCounterRerun.patch` | 29127 | `b8fdd1c31c4ff6d3e28031b379790978b6c7d8c59cc9d94710278c462988ed5d` | no |
| 105 | `.ufo/waves/round-48/r48/ExecRouteRG742-chain-receipt.txt` | 257 | `b9aa3a7b1fdccb8848e4102e2c36e80745be33a53eb4619c97c846df37fa922e` | no |
| 106 | `.ufo/waves/round-48/r48/ExecRouteRG742-selftest-receipt.txt` | 9833 | `f7ca511ab9ac76c8eccc176be8b1ac0b7baa1c2014d6e72190d0dcfc0c9384c1` | no |
| 107 | `.ufo/waves/round-48/r48/ExecRouteSP1592-chain-receipt.txt` | 725 | `90a7040c49311340042bad3728c0b7f99903ae638a1d3c8897937729e322b56f` | no |
| 108 | `.ufo/waves/round-48/r48/ExecRouteSP1592-selftest-receipt.txt` | 713 | `e18f56e07708082fbc586208170093db8e2e80e3d3af59a5274ea4b5ff0f599c` | no |
| 109 | `.ufo/waves/round-48/r48/ExecRouteSP491-integration-receipt.txt` | 3318 | `6a04b774ba151604495eafde7afdab7ee5270ba1df2f2b1d602f542c7c2939a2` | no |
| 110 | `.ufo/waves/round-48/r48/ExecRouteSP519-receipt.txt` | 10194 | `c1124af547371bf03854d6bba05d82a38e82f4e7d8bd72e030ac66dfafe1a152` | no |
| 111 | `.ufo/waves/round-48/r48/L1-receipts.sha256` | 14504 | `119714ca024baa4b56da6375ea40173c4a32cd69fbd153e3ae61fa8f7a81b96d` | no |
| 112 | `.ufo/waves/round-48/r48/L1-score-ce9aee5d.txt` | 1773 | `554c393a28437b0f71d629c27c5da86de435ba7b5cef5343b7d6568621da2ac6` | no |
| 113 | `.ufo/waves/round-48/r48/L1BindProbe-receipt.txt` | 1448 | `799fd90b93de90100339cd0f31940e1f604b7775a0448652560be1f8687858f0` | no |
| 114 | `.ufo/waves/round-48/r48/MutAllowanceProbe-mutA-receipt.txt` | 1518 | `911d47be202f481fa14eba6f1b1b0c1a71d1c5f83cffa44afc95d40c7f564bc3` | no |
| 115 | `.ufo/waves/round-48/r48/MutAllowanceProbe-mutB-receipt.txt` | 1484 | `7f74973d9b37d1ff8cc78fdc719b0b8559533e96a3006f228b6a01c242512fba` | no |
| 116 | `.ufo/waves/round-48/r48/MutAllowanceProbe-pristine-receipt.txt` | 1484 | `802fb81b865d44433b9b1a5671054929a39bd8dd8aa5c613a3a418db0e317a12` | no |
| 117 | `.ufo/waves/round-48/r48/MutAllowanceProbe-receipt.txt` | 7939 | `8cea991ba3d1fde9f26d7ed9207e76eb54bbd44b7e4f25c1c00be078647efbdf` | no |
| 118 | `.ufo/waves/round-48/r48/MutAllowanceProbe-restored-receipt.txt` | 1484 | `5d7b2827bf9fcceb8791217d6f60dc4ca505479e1f51b2b064314a4a5f22385d` | no |
| 119 | `.ufo/waves/round-48/r48/MutCountPadSite-pristine-receipt.txt` | 1460 | `4fc8230161af236a112197e6f8fa47b20f7788ca8e9e32116a531c80835d45fa` | no |
| 120 | `.ufo/waves/round-48/r48/MutCountPadSite-receipt.txt` | 1486 | `0c2fde5771a61d5f071b4d46c904f3cc77da1ab275a87b3cca1a1f51f4d9fbcd` | no |
| 121 | `.ufo/waves/round-48/r48/MutCountPadSite-restored-receipt.txt` | 1460 | `67b13b29e1d2037c84637d3f1770eb0e58bb02fdc49187ce80c7300c937df99a` | no |
| 122 | `.ufo/waves/round-48/r48/MutDoNothing48-receipt.txt` | 7171 | `4c99cf2e4ddc58846b1ddd992a918ba131944a7ee5bb37de38ecd6d06e4d1088` | no |
| 123 | `.ufo/waves/round-48/r48/MutRunnerDropSwap-receipt.txt` | 7731 | `12a8030231e3a1e68e8ce00ad77d455644edc47a8a4b9f148a070233fe66f466` | no |
| 124 | `.ufo/waves/round-48/r48/MutRunnerDropTasks-receipt.txt` | 7904 | `5e98a22852664440e3b866ffe91fc500554c2f6835400ae4a816f943015ed998` | no |
| 125 | `.ufo/waves/round-48/r48/MutRunnerLooseMem-mutant-receipt.txt` | 1682 | `f773114de5542c6270a2477475936cd7977dde03005e4d8475ee2260d9dc131e` | no |
| 126 | `.ufo/waves/round-48/r48/MutRunnerLooseMem-pristine-receipt.txt` | 1460 | `81f63efd531b2f43353065206c90eed6e1093818fae559ba492e3645a63dff60` | no |
| 127 | `.ufo/waves/round-48/r48/MutRunnerLooseMem-receipt.txt` | 1738 | `e5b83dd58c8dba6435d0edcff5ab5347e24e86f20c9646c26180e6df6d5ff222` | no |
| 128 | `.ufo/waves/round-48/r48/MutRunnerLooseMem-restored-receipt.txt` | 1460 | `6c3b8653f3b6bc0fa79ced9740855365962c3d26999cda4184912effc90610f4` | no |
| 129 | `.ufo/waves/round-48/r48/MutRunnerUnshare-pristine-receipt.txt` | 1460 | `ae1bf3c45729599892b3dc1230528fbc03d813219d47ebd9cc87d76bea29ebe6` | no |
| 130 | `.ufo/waves/round-48/r48/MutRunnerUnshare-receipt.txt` | 1916 | `05534bc153fed2367307e8da57d8928bcb01e960d505b1724734f0d612fb4a08` | no |
| 131 | `.ufo/waves/round-48/r48/MutRunnerUnshare-restored-receipt.txt` | 1460 | `f5bff79ba253a286e000523afea38fa0090737b6c8f6e4bf802725ea2a76fcf0` | no |
| 132 | `.ufo/waves/round-48/r48/MutSiteRGArgv-mutant-receipt.txt` | 1829 | `311bd3622e3dcf9f5d8d9124ff34e935921005f75a19b3344a23a1076db98679` | no |
| 133 | `.ufo/waves/round-48/r48/MutSiteRGArgv-pristine-receipt.txt` | 2305 | `c81a6d5b20c9ae9aefa624d00e899a003f0a4b502419918e681446e5a6828473` | no |
| 134 | `.ufo/waves/round-48/r48/MutSiteRGArgv-restored-receipt.txt` | 2258 | `c8ed4a261e8da34200c3cd21ef866557829dffb363fb7b7421ca84e89e87dec3` | no |
| 135 | `.ufo/waves/round-48/r48/MutSiteSPDouble-pristine-receipt.txt` | 1952 | `fc576a80fc4cdda5d4be936e35ec5f8fb216fb7c356416acfd6882600462f4e2` | no |
| 136 | `.ufo/waves/round-48/r48/MutSiteSPDouble-receipt.txt` | 1880 | `ece212b0e772638a57650baebd2de8ada441b2166a18b7cdcd3bf35b5ae6b553` | no |
| 137 | `.ufo/waves/round-48/r48/MutSiteSPDouble-restored-receipt.txt` | 1952 | `c1cc5f006963366d473f442dca710ced8a62d22465d047ecc542c74d83a9f741` | no |
| 138 | `.ufo/waves/round-48/r48/MutSpawnCanaryLeak-receipt.txt` | 6534 | `6cb20ad872618ff593d6b39017a8c9fba93709622c1b96ff70030e03698d20ba` | no |
| 139 | `.ufo/waves/round-48/r48/MutSpawnEnvDodge-pristine-receipt.txt` | 1453 | `14101a33ae4f33d4af67fd784b315cf867e65af886ef7b2922e32320c5211915` | no |
| 140 | `.ufo/waves/round-48/r48/MutSpawnEnvDodge-receipt.md` | 8885 | `ca9fd585bb82f9a21af166144645f6a097c9356840d587ce6eedf79a1ec80cb2` | no |
| 141 | `.ufo/waves/round-48/r48/MutSpawnEnvDodge-receipt.txt` | 3192 | `8c6b805d8f94cbf3930803cbe616162a4d5b9e87b318c0f4ee61577289f67dca` | no |
| 142 | `.ufo/waves/round-48/r48/MutSpawnEnvDodge-restored-receipt.txt` | 1453 | `ab3b69e89b2bbb86141202751c68248b77d35388b232d21a5abee4bd675956a9` | no |
| 143 | `.ufo/waves/round-48/r48/MutSpawnFakeRunner-receipt.txt` | 13080 | `0c889addc6910feb1fa2ad80efe0e42157de5b8766ebe49fa41ce3995ab4bbe5` | no |
| 144 | `.ufo/waves/round-48/r48/ReviewA2Receipts.md` | 8774 | `14e8c30d7185ad5756ea290ef41476bf2f3f17c1a38989c5f19bbde41ed88610` | no |
| 145 | `.ufo/waves/round-48/r48/ReviewReceiptCanon.md` | 2773 | `1e35578d73fafa566b1d75ee66d47c57a60c2c006edda738e88c4d0e899254dd` | no |
| 146 | `.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-1.txt` | 1293 | `2aafd27d8440a38c15246fc3dab456da3fbcb2be349833d23f589efa8aa79630` | no |
| 147 | `.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-2.txt` | 1269 | `e77a919d299bbe58e490331bccf72c40c375220b0fa02e78362c2ef58016f1ba` | no |
| 148 | `.ufo/waves/round-48/r48/ScribeReceipts-a2-rerun-3.txt` | 1267 | `9040c45ec356ebba9a501a62d095e3a9b7234d51c36684d0a5c1449202c63507` | no |
| 149 | `.ufo/waves/round-48/r48/ScribeReceipts-checklist-base-1.txt` | 5681 | `6ec4a0962fa57ac3db463437a874740f0fabbd2460e97a3c559201e365538d7d` | no |
| 150 | `.ufo/waves/round-48/r48/ScribeReceipts-checklist-base-2.txt` | 5675 | `294d9b1ee3031bdd5b7821d906ad7a5696904438cff3fbc0fb38a8de45f8c924` | no |
| 151 | `.ufo/waves/round-48/r48/ScribeReceipts.md` | 7028 | `02698d8da9beb044b6a4058b9964bb898886f96459bdb525ddb7cce1b3601f39` | no |
| 152 | `.ufo/waves/round-48/r48/SentinelReceipt.md` | 8502 | `6ba037f9e0e15f0df4f52b4a97f1e143378cdbc07cd8a9c2f31368b8db7df2f8` | no |
| 153 | `.ufo/waves/round-48/r48/kumitate-r48-MutSpawnDropBind-mutant-receipt.txt` | 1751 | `6917a49255d98fc6fc4cb76fd09aa6f03a4fcbd9ee0d9258aebc96d8e9991043` | no |
| 154 | `.ufo/waves/round-48/r48/kumitate-r48-MutSpawnDropBind-pristine-receipt.txt` | 1460 | `208cacbca0efd391dcab174a1d2e9a06ddd1e6cfd20f4d3d6c6078bfc0dfb042` | no |
| 155 | `.ufo/waves/round-48/r48/kumitate-r48-MutSpawnDropBind-restored-receipt.txt` | 1460 | `7b850adc44561c50d000a722848673babab1079004d9e5ba7e3c1f103ccd3a74` | no |
| 156 | `.ufo/waves/round-49/r49/L1-score-0526f898.txt` | 484 | `03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488` | no |
| 157 | `.ufo/waves/round-49/r49/ReRunCounter49-2.txt` | 484 | `03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488` | no |
| 158 | `.ufo/waves/round-49/r49/ReRunCounter49-3.txt` | 484 | `03a258d626b1af43a8c2f55f25429d169c2cde6d7366620f10e804fcee9f9488` | no |
| 159 | `.ufo/waves/round-50/ReRunB49-1.txt` | 671 | `aa293cc4951a02b19aba7bbc3a8fc5dd19918aff4766e850f696421cb2dd06f6` | no |
| 160 | `.ufo/waves/round-50/ReRunB49-2.txt` | 671 | `96a01c840f91df0bcef0a065137aa9ace8067d832808fe67b6c1b2c34fb136ee` | no |
| 161 | `.ufo/waves/round-50/ReRunB49-3.txt` | 671 | `e59ff9af0562e25a29f80d6ea9762be06feb16c78cb623277e41cfba10f368da` | no |
| 162 | `.ufo/waves/round-50/r50/MutReceiptSyntax.md` | 11665 | `7aba23604d4d1b95f3b42e537427c54866eb90e5b749aa1d84e44a06c20bf982` | no |
| 163 | `.ufo/waves/round-51/build/ExecInstrument/receipt-attest.mjs` | 37954 | `44919763ee523f334adaa4242d370435180d07aa0cdd4b85b0a7be870f48e8d9` | no |
| 164 | `.ufo/waves/round-51/build/ExecSelftestArms/scratch/receipt-attest.mjs` | 12784 | `f39c6b51f137ac8cdd94eda439a82bb4cbab8c53a719cc1282f73ea179677ff4` | no |
| 165 | `.ufo/waves/round-51/build/ExecSelftestExec/receipt-attest.mjs` | 18263 | `cdde1e8aaa731b381bda16627114755b0823918409f747ec16a70c7102c5ed04` | no |
| 166 | `.ufo/waves/round-51/build/LabratM2Replay/scratch-receipt-attest.mjs` | 15297 | `89952c55cd29199f5a037b7054efaee88baa948651cc46f543753658c68a20a3` | no |
| 167 | `.ufo/waves/round-51/build/MutInstrument/reference-receipt-attest.mjs` | 22532 | `d3936c9537b1573bbfaa132f55b1f498a68999e3737ceb83cd22b0192a9507e6` | no |
| 168 | `.ufo/waves/round-51/build/ScoutBaselineHar/03-counter-rerun-selftest.txt` | 1619 | `c47c41d20e10eac314c66ddf288c3777f88d7212c7a18e11a0a76d322315933f` | no |
| 169 | `.ufo/waves/round-51/w1/ScoutReceiptCorpora.md` | 6575 | `688e3952050ccb4b33290f1c3703fd950f5945012d51a4979039bb0412d927c4` | no |
| 170 | `.ufo/waves/round-51/w1/SentReceipt.md` | 6057 | `211e8c3eee046fd6a4a256b9274462958bbe50acf68327263963d8864aee0888` | no |
| 171 | `.ufo/waves/round-51/w2/CritReceiptsHand.md` | 12449 | `037461a5bfaab21d5a1a863c7057ceed6471fc7676e3253de7ddcaf52418e23b` | no |
| 172 | `.ufo/waves/round-51/w2/MutReceiptBytes.md` | 36383 | `69fc18b35b95da00bf7a48423225b525c925c3d3fb500545ce1718a95a2992c9` | no |
| 173 | `.ufo/waves/round-51/w2/RevA51Rerun.md` | 13899 | `3f970531bef08f1f63c58c9b91db1cd87014185b196f65a3473f1eeaaaee2eb0` | no |
| 174 | `.ufo/waves/round-51/w2/RevD51Rerun.md` | 15265 | `19fe55570816b87076130ded80b45852e801d095269c3e0621629a146ec2cffd` | no |
| 175 | `.ufo/waves/round-51/w2/RevHarm-transcripts/h1-checklists-live-rerun.txt` | 4832 | `d521f3d4f34b49a5125a9f6ba7210e4a46777b2be01a297a60feb417ad9aa2fe` | no |
| 176 | `.ufo/waves/round-51/w2/RevHarm-transcripts/h1-gatemutants-rerun.txt` | 7831 | `5148011db5205d2040075bf66f2dbf48a944697af8d69016ed69ceb34ae7b804` | no |

## Boundary observation: actual round-51 receipt bodies are not selected

The basename predicate does **not** select `attest-run-*.txt`, even under a directory named `receipts`. These four files have parseable nonce fields but are outside the requested 176-file inventory. Their nonce values were additionally searched as raw substrings across the selected corpus (the actual B4 method):

| Excluded prior receipt | nonce | Selected files containing this nonce as raw text |
| --- | --- | --- |
| `.ufo/waves/round-51/receipts/attest-run-1.txt` | `3fd22d2153f74061d59ed9527b4ffca7` | `.ufo/waves/round-51/w2/CritReceiptsHand.md`, `.ufo/waves/round-51/w2/MutReceiptBytes.md` |
| `.ufo/waves/round-51/receipts/attest-run-2-replayed.txt` | `f95078d001c850abec0f9c0be449318f` | `.ufo/waves/round-51/w2/CritReceiptsHand.md` |
| `.ufo/waves/round-51/receipts/attest-run-2.txt` | `f95078d001c850abec0f9c0be449318f` | `.ufo/waves/round-51/w2/CritReceiptsHand.md` |
| `.ufo/waves/round-51/receipts/attest-run-3.txt` | `176f623b130377f56ae80532b9f9b8c3` | none |

Accordingly, zero parseable fields in the selected corpus does not mean zero nonce substrings: run-1 and run-2 are mentioned in selected prose; run-3's nonce has no selected-corpus hit. No new candidate receipt or replay was created or tested.

## Inference and remaining unknown

**Inference:** unchanged prior-corpus bytes imply B4's internal count will remain 176 at integration, provided no matching prior-wave file is added or removed. This is not a claim about future revisions or a substitute for an executed B4 receipt.

**Unresolved evidence gap:** there is no base receipt count to compare with 176, because the frozen B4 did not enter its sweep branch; its successful output also suppresses the detail. Neither frozen probe nor receipt was modified, and no probe or repository test was run by this seat.

Tools installed/updated: **none**. Only the permitted seat build artifacts and seat report were written. Machine-readable inventory: `inventory.json` beside this file.
