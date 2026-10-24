#!/usr/bin/env python3
import pathlib
import shlex
import subprocess
import sys

BUILD = pathlib.Path("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-58/build/ExecToolVerifyR1").resolve()
LANE = pathlib.Path("/home/vgpnk/Projects/shokunin/kumitate-shokunin")

if len(sys.argv) < 3:
    raise SystemExit(64)
prefix = pathlib.Path(sys.argv[1]).resolve()
if BUILD != prefix.parent:
    raise SystemExit(64)
command = sys.argv[2:]
result = subprocess.run(command, cwd=LANE, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
prefix.with_suffix(".command.txt").write_text(shlex.join(command) + "\n", encoding="utf-8")
prefix.with_suffix(".stdout").write_bytes(result.stdout)
prefix.with_suffix(".stderr").write_bytes(result.stderr)
prefix.with_suffix(".exit").write_text(f"{result.returncode}\n", encoding="ascii")
sys.stdout.buffer.write(result.stdout)
sys.stdout.buffer.flush()
sys.stderr.buffer.write(result.stderr)
sys.stderr.buffer.flush()
raise SystemExit(result.returncode)
