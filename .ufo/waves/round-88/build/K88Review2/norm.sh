#!/usr/bin/env bash
# norm.sh <probe receipt>: ARM + verdict lines with scratch work paths and 40-hex fixture commits stripped.
# The judged rev M (0ff3562f...) and lane-rev hashes are kept; only fixture-repo hashes vary per run.
M=0ff3562f15c18d0ca01dc6a76c9f827d30c26950
grep -E '^(ARM |C88_C1:)' "$1" \
  | sed -E "s#/fast/scratch/hyaku/kumitate-r88/K88Review2/[^ ]*/probe88#<WORK>/probe88#g; s#$M#<M>#g; s#\b[0-9a-f]{40}\b#<FIXREV>#g"
