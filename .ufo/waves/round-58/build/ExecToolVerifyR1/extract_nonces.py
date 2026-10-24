#!/usr/bin/env python3
import json
import pathlib
import re

root = pathlib.Path("/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-57/receipts")
for name in ("attest-run-1.txt", "attest-run-2.txt", "attest-run-3.txt"):
    text = (root / name).read_text(encoding="utf-8")
    lines = text.splitlines()
    if len(lines) != 2 or not text.endswith("\n"):
        raise ValueError(f"unexpected receipt shape: {name}")
    nonce = json.loads(lines[1])["nonce"]
    if not re.fullmatch(r"[0-9a-f]{32}", nonce):
        raise ValueError(f"invalid nonce: {name}")
    print(f"{name} {nonce}")
