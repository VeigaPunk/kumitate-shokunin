#!/usr/bin/env bash
# CtlNoNonceCorpus round-58 control driver; writes only in this seat's build directory.
# Exit 0: mutant sweep has no matches (git grep 1) and verify exits 2; exit 1: any other result.
set -u

BUILD="/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/CtlNoNonceCorpus"
LANE="$BUILD/lane"
SOURCE="file:///home/vgpnk/Projects/shokunin/kumitate-shokunin"
R1="6affb9ebde37b7d663658f1959d64f0f0b68f480"
ROUNDS=(.ufo/waves/round-48 .ufo/waves/round-49 .ufo/waves/round-50 .ufo/waves/round-51 .ufo/waves/round-52 .ufo/waves/round-53 .ufo/waves/round-54 .ufo/waves/round-55 .ufo/waves/round-56 .ufo/waves/round-57)
SWEEP_SPECS=(':(glob).ufo/waves/round-4[89]/**' ':(glob).ufo/waves/round-5[0-7]/**')
cd "$BUILD" || exit 1

run_step() {
    local name="$1"
    shift
    {
        printf 'cwd=%q\n' "$PWD"
        printf 'command='
        printf '%q ' "$@"
        printf '\n'
    } > "$BUILD/$name.log"
    "$@" >> "$BUILD/$name.log" 2>&1
    local status=$?
    printf 'exit=%d\n' "$status" >> "$BUILD/$name.log"
    return "$status"
}

run_step 01-clone git clone --no-hardlinks "$SOURCE" "$LANE" || exit 1
run_step 02-checkout git -C "$LANE" checkout --detach "$R1" || exit 1
run_step 03-head git -C "$LANE" rev-parse HEAD || exit 1
run_step 04-status-before git -C "$LANE" status --short || exit 1

run_step 05-baseline-verify node "$LANE/scripts/receipt-evidence.mjs" verify --lane "$LANE" --rev "$R1" --receipts "$LANE/.ufo/waves/round-58/receipts" --min-span-ms 300000
BASELINE_STATUS=$?

run_step 06-strip python3 "$BUILD/strip-nonces.py" "$LANE" || exit 1
run_step 07-diff-stat git -C "$LANE" diff --stat -- "${ROUNDS[@]}" || exit 1
run_step 08-diff-names git -C "$LANE" diff --name-only -- "${ROUNDS[@]}" || exit 1
run_step 09-diff git -C "$LANE" diff -- "${ROUNDS[@]}" || exit 1
run_step 10-commit git -C "$LANE" -c user.name=kumitate-shokunin -c user.email=kumitate@shokunin.local commit -m "CtlNoNonceCorpus: strip historical nonces" -- "${ROUNDS[@]}" || exit 1
run_step 11-mutant-rev git -C "$LANE" rev-parse HEAD || exit 1
MUTANT_REV=$(git -C "$LANE" rev-parse HEAD) || exit 1
run_step 12-status-after git -C "$LANE" status --short || exit 1
run_step 13-ls-tree git -C "$LANE" ls-tree -r --name-only "$MUTANT_REV" -- "${ROUNDS[@]}" || exit 1

run_step 14-sweep git -C "$LANE" grep -ohE '"nonce":\s*"[0-9a-f]{32}"' "$MUTANT_REV" -- "${SWEEP_SPECS[@]}"
SWEEP_STATUS=$?
run_step 15-mutant-verify node "$LANE/scripts/receipt-evidence.mjs" verify --lane "$LANE" --rev "$MUTANT_REV" --receipts "$LANE/.ufo/waves/round-58/receipts" --min-span-ms 300000
VERIFY_STATUS=$?

{
    printf 'r1=%s\n' "$R1"
    printf 'mutant_rev=%s\n' "$MUTANT_REV"
    printf 'baseline_verify_exit=%d\n' "$BASELINE_STATUS"
    printf 'mutant_sweep_exit=%d\n' "$SWEEP_STATUS"
    printf 'mutant_verify_exit=%d\n' "$VERIFY_STATUS"
} > "$BUILD/observed-status.txt"

if [ "$SWEEP_STATUS" -eq 1 ] && [ "$VERIFY_STATUS" -eq 2 ]; then
    exit 0
fi
exit 1
