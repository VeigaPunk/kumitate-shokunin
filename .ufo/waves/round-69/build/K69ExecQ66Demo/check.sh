#!/bin/sh
# Exit non-zero when a DEPREC69 receipt's verdict line lacks live-state evidence.
set -eu
receipt=${1:?usage: check.sh <deprec69-receipt>}
grep -qE '^DEPREC69_(HELD|UNMET).* live=[^ |]+' "$receipt"
