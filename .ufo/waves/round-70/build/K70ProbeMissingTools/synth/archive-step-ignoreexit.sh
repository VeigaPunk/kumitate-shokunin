#!/usr/bin/env bash
# Fail-open variant: swallows the pipeline exit status entirely (`exit 0`).
# Models a consumer that neither checks the chain status nor verifies the
# extracted content: a missing tar then passes silently with an empty dest.
set -u
mkdir -p "$2"
git -C "$1" archive HEAD controls | tar -x --no-same-owner --no-same-permissions -C "$2"
exit 0
