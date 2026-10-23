# SentinelReceipt — receipt-forgery review

**Severity: High (round-verdict integrity).** This is a straightforward false-evidence path, not a code-execution issue: receipts are plain, seat-authored text, while C1/C2 scores affect whether operability is accepted. No signed provenance, run nonce, or trusted receipt manifest is part of the inspected receipt format.

## Exploit paths

| Class | How a broken/malicious seat can mislead | What a check must do |
|---|---|---|
| Hash without file | Include a plausible SHA-256 string for a deleted, absent, or differently named log/patch. A digest line by itself proves no file was checked. | Resolve every hash against its exact expected path (`sha256sum -c`) and fail on missing files. Do not accept a checksum list authored by the same seat as provenance. |
| Copied hash/receipt | Copy a valid digest or whole successful receipt from another run, revision, or seat. The inherited build already has a legitimate `held=4/4` receipt at `f55bf22e`, but the addendum explicitly says it is neither a control nor a candidate score. | Bind evidence to the expected seat/run, command, counter hash, and exact revision; reject a copied receipt as a second independent run. |
| Missing load trailer | Omit `load1`/`end` or retain only the result line, hiding that the run was under unknown conditions. | Require a well-formed trailer for each recorded invocation; fail closed on absent or unpaired trailers. |
| Stale timestamp | Reuse a prior receipt or write an arbitrary time. The existing `end=HH:MM:SSZ` has no date, so it cannot establish freshness across days. | Require full UTC date-time and compare with the run window; still treat it as self-asserted unless the L1 captures it. |
| Exit-code laundering | Emit `held=4/4`/`AGREE` text while the command failed; common shell mistakes include taking `$?` after `tee`, `date`, or `|| true`, or manually writing the trailer. | Capture the command status immediately in an L1-controlled wrapper, pair it to that invocation's result, and never score from an asserted trailer alone. |

## Evidence and impact

- Frozen C1 contract requires `held=4/4`, exit 0 at the candidate commit, and at least two same-commit wave re-runs; exit 2 is explicitly never a score (`plan.md:64-71`). C2 likewise requires a committed real `AGREE` receipt, not just selftest output (`plan.md:105-113`).
- `plan.md`'s attempt-2 addendum identifies `build/CtlEnvCaps-pristine-receipt.txt` as the lone inherited 4/4 receipt and explicitly says it is **not** a control or candidate. Reusing its result without revision/run binding would fabricate apparent C1 evidence.
- `build/CtlDodge.md:69-75,92-100` shows the receipt is ordinary redirected output followed by a shell-written trailer: `timeout ... > receipt; echo "exit=$? ... end=$(date -u +%TZ)" >> receipt`. Its report notes the shell itself exited 0 while the detector's recorded exit was 1. The trailer has time-of-day only; it is not an authenticated process record.
- `build/CtlDoNothing.md:78-92` records source/patch hashes in report prose, not an authenticated receipt chain. `sha256sum -c` is useful for byte integrity only when the expected path and digest are independently trusted; it cannot prove which command ran or when.

A forged/replayed receipt could make the L1 count the wrong commit or one run multiple times, bypass the C1 kill rule, or accept C2 without an actual probe agreement. A text-only check cannot prove execution, load, provenance, or the real child exit code.

## One-command intake check

For each discovered executable receipt under `r48`, this fail-closed shape check catches empty files, malformed C1/C2 result lines, missing/unpaired result and exit trailers, duplicate receipt bytes, and timestamps outside the last 24 hours. Its required L1-owned `L1-receipts.sha256` manifest fails on any omitted expected file or mismatched digest, and it also checks the frozen C1 probe hash. It intentionally requires a full UTC date-time; current inherited receipts using only `HH:MM:SSZ` fail freshness validation and must not be treated as fresh evidence.

```bash
cd /home/vgpnk/Projects/shokunin/kumitate-shokunin && bash -euo pipefail -c '
root=.ufo/waves/round-48/r48
mapfile -d "" files < <(find "$root" -type f -name "*receipt*.txt" -print0)
((${#files[@]})) || { echo "FAIL: no receipt files" >&2; exit 1; }
now=$(date -u +%s); floor=$((now - 86400)); declare -A seen=()
for f in "${files[@]}"; do
  [[ -s "$f" ]] || { echo "FAIL: empty $f" >&2; exit 1; }
  results=$(grep -Ec "^(CAPROUTE48 |COUNTER_RERUN_SELFTEST: |COUNTER_RERUN: |RESULT:)" "$f" || :)
  trailers=$(grep -Ec "^exit=[0-9]+ load1=[0-9]+([.][0-9]+)? end=[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$" "$f" || :)
  ((results > 0 && results == trailers)) || { echo "FAIL: missing result or full-date exit/load trailer: $f" >&2; exit 1; }
  if grep -q "^CAPROUTE48 " "$f"; then
    grep -Eq "^CAPROUTE48 rev=[0-9a-f]{40} base=f00cf278 set=r48 held=[0-4]/4 runs=3 rule=F48$" "$f" || { echo "FAIL: malformed F48 line: $f" >&2; exit 1; }
  fi
  if grep -q "^COUNTER_RERUN_SELFTEST:" "$f"; then grep -q "^COUNTER_RERUN_SELFTEST: PASS" "$f" || { echo "FAIL: selftest result: $f" >&2; exit 1; }; fi
  if grep -q "^COUNTER_RERUN:" "$f"; then grep -Eq "^COUNTER_RERUN: (AGREE \\(runs=[0-9]+\\)|DISAGREE)$" "$f" || { echo "FAIL: counter-rerun result: $f" >&2; exit 1; }; fi
  pending=
  while IFS= read -r line; do
    case "$line" in
      "CAPROUTE48 "*|"COUNTER_RERUN_SELFTEST: "*|"COUNTER_RERUN: "*|"RESULT: "*)
        [[ -z "$pending" ]] || { echo "FAIL: result without intervening exit trailer: $f" >&2; exit 1; }
        pending=$line ;;
      exit=*)
        [[ -n "$pending" ]] || { echo "FAIL: exit trailer without result: $f" >&2; exit 1; }
        rc=${line#exit=}; rc=${rc%% *}
        if [[ $pending == CAPROUTE48* && $pending =~ held=([0-4])/4 ]]; then
          held=${BASH_REMATCH[1]}
          if [[ $held == 4 ]]; then [[ $rc == 0 ]] || { echo "FAIL: held=4/4 with exit=$rc: $f" >&2; exit 1; }
          else [[ $rc == 1 || $rc == 2 ]] || { echo "FAIL: held<$held/4 exit=$rc: $f" >&2; exit 1; }
          fi
        elif [[ $pending == "COUNTER_RERUN_SELFTEST: PASS"* || $pending == "COUNTER_RERUN: AGREE "* ]]; then
          [[ $rc == 0 ]] || { echo "FAIL: PASS/AGREE with exit=$rc: $f" >&2; exit 1; }
        elif [[ $pending == "COUNTER_RERUN: DISAGREE"* ]]; then
          [[ $rc == 1 ]] || { echo "FAIL: DISAGREE with exit=$rc: $f" >&2; exit 1; }
        fi
        pending= ;;
    esac
  done < "$f"
  [[ -z "$pending" ]] || { echo "FAIL: result without exit trailer: $f" >&2; exit 1; }
  while IFS= read -r line; do
    stamp=${line##* end=}; epoch=$(date -u -d "$stamp" +%s)
    ((epoch >= floor && epoch <= now + 300)) || { echo "FAIL: stale/future timestamp in $f" >&2; exit 1; }
  done < <(grep -E "^exit=[0-9]+ load1=[0-9]+([.][0-9]+)? end=[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$" "$f")
  h=$(sha256sum -- "$f"); h=${h%% *}
  [[ -z ${seen[$h]+x} ]] || { echo "FAIL: duplicate receipt bytes: $f and ${seen[$h]}" >&2; exit 1; }
  seen[$h]=$f
  printf "OK-shape %s %s\\n" "$h" "$f"
done
sha256sum -c "$root/L1-receipts.sha256"
printf "%s  %s\\n" f24a3af55add0708943526435fde93e02f4ef0c9d4b8e494a9111a5fec890cf2 .ufo/waves/round-48/probe/caproute48-probe.mjs | sha256sum -c -
'
```

This is only an intake lint, not score evidence: a seat can forge every checked field and recompute a hash. The L1 must compare the discovered receipt paths against the expected seat/task inventory, verify exact revision and probe identity, and independently replay each C1/C2 scoring command from the accepted commit under the L1 wrapper. The manifest must be L1-owned and cover the complete expected receipt/artifact path list; a seat-supplied checksum list is not trusted. A `sha256sum -c` manifest detects a missing or altered file only relative to that trusted list; it is not a substitute for replay.

## Smallest remediation

At integration, accept no seat-authored receipt as the sole score source. Have the L1 wrapper run the canonical command for the expected commit, capture raw output and exit status immediately, and write a full-UTC timestamp, load value, run ID, command, revision, and counter SHA into an L1-owned receipt. Verify the complete expected receipt inventory and use `sha256sum -c` against an L1-owned manifest. Keep exit 2 explicitly non-scoring. No tools were installed; no lane runtime or build/test checks were run.
