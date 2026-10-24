#!/usr/bin/env python3
# MutMap1 command capture helper. Contract: run one argv without a shell and
# write its command, cwd, stdout, stderr, and exit code below PREFIX; the helper
# exits 0 after a successful capture, 64 for usage, or 1 for a capture error.
import json
import shlex
import subprocess
import sys
from pathlib import Path


def main():
    if len(sys.argv) < 5 or sys.argv[2] != "--cwd" or sys.argv[4] != "--":
        print("usage: capture.py PREFIX --cwd DIR -- COMMAND [ARG ...]", file=sys.stderr)
        return 64
    prefix = Path(sys.argv[1])
    cwd = sys.argv[3]
    argv = sys.argv[5:]
    if not argv:
        print("usage: capture.py PREFIX --cwd DIR -- COMMAND [ARG ...]", file=sys.stderr)
        return 64
    try:
        result = subprocess.run(argv, cwd=cwd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    except Exception as exc:
        print(f"capture error: {exc}", file=sys.stderr)
        return 1
    command = {"cwd": cwd, "argv": argv, "shell": False, "display": shlex.join(argv)}
    prefix.with_suffix(".command.json").write_text(json.dumps(command, indent=2) + "\n")
    prefix.with_suffix(".stdout").write_bytes(result.stdout)
    prefix.with_suffix(".stderr").write_bytes(result.stderr)
    prefix.with_suffix(".exit").write_text(f"{result.returncode}\n")
    transcript = (
        f"$ {shlex.join(argv)}\ncwd: {cwd}\nexit: {result.returncode}\n"
        "--- stdout ---\n" + result.stdout.decode("utf-8", errors="replace")
        + "--- stderr ---\n" + result.stderr.decode("utf-8", errors="replace")
    )
    prefix.with_suffix(".transcript.txt").write_text(transcript)
    sys.stdout.buffer.write(result.stdout)
    sys.stderr.buffer.write(result.stderr)
    print(f"CAPTURE exit={result.returncode} prefix={prefix}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
