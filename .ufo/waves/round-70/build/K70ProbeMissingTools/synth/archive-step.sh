#!/usr/bin/env bash
# Predicate-shaped archive/extract step (models replay70-probe.mjs's
# `git archive | tar -x` chain). $1 = fixture repo, $2 = dest dir.
set -euo pipefail
mkdir -p "$2"
git -C "$1" archive HEAD controls | tar -x --no-same-owner --no-same-permissions -C "$2"
