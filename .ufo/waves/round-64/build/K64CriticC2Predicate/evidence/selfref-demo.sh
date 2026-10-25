#!/usr/bin/env bash
# self-referential demo: prints the entry's own stated values, runs no jj, and writes into the caller's cwd
set -eu
E="$(cd "$(dirname "$0")/.." && pwd)/corpus/knowledge/jj-workspace-seat-containment.md"
pwd > demo-cwd.txt
awk '/^## Demo outcomes/{f=1;next} f&&/^## /{f=0} f&&/^- [a-z0-9_]+=/{sub(/^- /,"JJ_SEAT: ");print}' "$E"
