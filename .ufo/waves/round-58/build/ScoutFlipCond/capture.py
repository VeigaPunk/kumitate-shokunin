#!/usr/bin/env python3
"""Run one command and preserve its argv, stdout, stderr, and exit code."""
import json
import pathlib
import shlex
import subprocess
import sys

if len(sys.argv) < 4 or sys.argv[1] != "--label":
    print("usage: capture.py --label NAME -- COMMAND [ARG ...]", file=sys.stderr)
    sys.exit(64)
label = sys.argv[2]
if sys.argv[3] != "--" or len(sys.argv) == 4:
    print("usage: capture.py --label NAME -- COMMAND [ARG ...]", file=sys.stderr)
    sys.exit(64)
root = pathlib.Path(__file__).resolve().parent
command = sys.argv[4:]
result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
(root / f"{label}.command.txt").write_text(shlex.join(command) + "\n", encoding="utf-8")
(root / f"{label}.stdout").write_bytes(result.stdout)
(root / f"{label}.stderr").write_bytes(result.stderr)
(root / f"{label}.exit").write_text(str(result.returncode) + "\n", encoding="utf-8")
(root / f"{label}.command.json").write_text(json.dumps(command, indent=2) + "\n", encoding="utf-8")
sys.stdout.buffer.write(result.stdout)
sys.stderr.buffer.write(result.stderr)
sys.exit(result.returncode)
