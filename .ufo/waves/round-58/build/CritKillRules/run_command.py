#!/usr/bin/env python3
"""Run one command and preserve its complete evidence transcript."""

import argparse
import datetime
import pathlib
import shlex
import subprocess
import sys


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("name")
    parser.add_argument("--cwd")
    parser.add_argument("command", nargs=argparse.REMAINDER)
    args = parser.parse_args()
    command = args.command
    if command and command[0] == "--":
        command = command[1:]
    if not command:
        parser.error("a command is required after --")
    cwd = args.cwd or str(pathlib.Path.cwd())
    started = datetime.datetime.now(datetime.timezone.utc).isoformat()
    try:
        result = subprocess.run(command, cwd=cwd, capture_output=True)
        code = result.returncode
        stdout = result.stdout
        stderr = result.stderr
    except Exception as exc:
        code = 127
        stdout = b""
        stderr = f"{type(exc).__name__}: {exc}\n".encode()
    finished = datetime.datetime.now(datetime.timezone.utc).isoformat()
    transcript = (
        f"COMMAND: {shlex.join(command)}\n"
        f"CWD: {cwd}\n"
        f"STARTED: {started}\n"
        f"FINISHED: {finished}\n"
        "STDOUT:\n"
    ).encode() + stdout + (b"" if stdout.endswith(b"\n") or not stdout else b"\n")
    transcript += b"STDERR:\n" + stderr
    if stderr and not stderr.endswith(b"\n"):
        transcript += b"\n"
    transcript += f"EXIT: {code}\n".encode()
    destination = pathlib.Path(__file__).resolve().parent / f"{args.name}.txt"
    destination.write_bytes(transcript)
    print(f"EVIDENCE {destination} EXIT {code}")
    return 128 + -code if code < 0 else code


if __name__ == "__main__":
    sys.exit(main())
