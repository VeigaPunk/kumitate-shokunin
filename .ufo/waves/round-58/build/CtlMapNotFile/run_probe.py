#!/usr/bin/env python3
# CtlMapNotFile round-58 control: reproduce directory-valued covered drift in a sandbox clone.
# Contract: clone and detach R1, prove baseline CLEAN, inject one isolated directory arm, require DRIFT exit 1.
# Exit codes: 0 expected drift observed; 1 assertion or mutation failure; 2 setup failure.

import json
import re
import shlex
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LANE = ROOT / "lane"
SOURCE = "file:///home/vgpnk/Projects/shokunin/kumitate-shokunin"
REV = "6affb9ebde37b7d663658f1959d64f0f0b68f480"
ENTRY = "lessons/ctlmapnotfile.md"
DIRECTORY = LANE / "corpus" / ENTRY
ROW = "| `lessons/ctlmapnotfile.md` | CtlMapNotFile directory control | round-58 scratch probe |"


def run(name, argv, cwd=ROOT):
    completed = subprocess.run(argv, cwd=cwd, text=True, capture_output=True)
    (ROOT / f"{name}.command.txt").write_text(
        f"cwd={cwd}\ncommand={shlex.join(str(a) for a in argv)}\nexit={completed.returncode}\n",
        encoding="utf-8",
    )
    (ROOT / f"{name}.stdout.txt").write_text(completed.stdout, encoding="utf-8")
    (ROOT / f"{name}.stderr.txt").write_text(completed.stderr, encoding="utf-8")
    print(f"{name}: exit={completed.returncode} command={shlex.join(str(a) for a in argv)}")
    return completed


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def main():
    (ROOT / "00-driver.command.txt").write_text(
        f"cwd={ROOT}\ncommand=python3 {Path(__file__).resolve()}\n", encoding="utf-8"
    )
    require(not LANE.exists(), f"refusing to reuse existing clone: {LANE}")
    clone = run("01-clone", ["git", "clone", "--no-hardlinks", SOURCE, str(LANE)])
    require(clone.returncode == 0, "clone failed")
    checkout = run("02-checkout-r1", ["git", "-C", str(LANE), "checkout", "--detach", REV])
    require(checkout.returncode == 0, "R1 checkout failed")
    head = run("03-head", ["git", "-C", str(LANE), "rev-parse", "HEAD"])
    require(head.returncode == 0 and head.stdout.strip() == REV, "clone is not at R1")

    baseline = run("04-baseline-gate", ["node", "scripts/readme-map.mjs"], cwd=LANE)
    require(baseline.returncode == 0, f"baseline was not CLEAN: {baseline.stdout!r} {baseline.stderr!r}")
    baseline_match = re.fullmatch(
        r"README_MAP: CLEAN files=(\d+) rows=(\d+) covered=(\d+)\n", baseline.stdout
    )
    require(baseline_match is not None, f"unexpected baseline output: {baseline.stdout!r}")
    baseline_counts = tuple(int(v) for v in baseline_match.groups())
    require(len(set(baseline_counts)) == 1, f"baseline counts differ: {baseline_counts}")

    registry_path = LANE / ".ufo" / "pins" / "readme-map.json"
    registry = json.loads(registry_path.read_text(encoding="utf-8"))
    require(registry.get("version") == 2, "registry is not v2")
    require(ENTRY not in registry["covered"], "control entry already exists")
    registry["covered"].append(ENTRY)
    registry_path.write_text(json.dumps(registry, indent=2) + "\n", encoding="utf-8")

    DIRECTORY.mkdir()
    readme_path = LANE / "corpus" / "README.md"
    readme = readme_path.read_text(encoding="utf-8")
    marker = "|---|---|---|\n"
    require(readme.count(marker) == 1, "coverage-map table marker is not unique")
    require(ENTRY not in readme, "control README row already exists")
    readme_path.write_text(readme.replace(marker, marker + ROW + "\n", 1), encoding="utf-8")
    (ROOT / "05-mutation.txt").write_text(
        f"revision={REV}\nregistry={registry_path}\ncovered_append={ENTRY}\n"
        f"directory_created={DIRECTORY}\nreadme_row={ROW}\ncommitted=no\n",
        encoding="utf-8",
    )
    print(f"05-mutation: covered += {ENTRY}; created directory; added matching README row")

    stat_result = run("06-directory-stat", ["stat", "--format=%F %n", str(DIRECTORY)])
    require(stat_result.returncode == 0 and stat_result.stdout.startswith("directory "), "control is not a directory")
    run("07-mutation-diff", ["git", "-C", str(LANE), "diff", "--", ".ufo/pins/readme-map.json", "corpus/README.md"])
    run("08-status", ["git", "-C", str(LANE), "status", "--short"])

    mutant = run("09-directory-gate", ["node", "scripts/readme-map.mjs"], cwd=LANE)
    (ROOT / "09-directory-gate.exit.txt").write_text(f"{mutant.returncode}\n", encoding="utf-8")
    expected_first = f"covered-not-file:{ENTRY}"
    drift_match = re.fullmatch(
        r"README_MAP: DRIFT files=(\d+) rows=(\d+) covered=(\d+) bad=(\d+) first=([^\n]+)\n",
        mutant.stdout,
    )
    require(mutant.returncode == 1, f"mutant exit was {mutant.returncode}, not 1")
    require(mutant.stderr == "", f"unexpected gate stderr: {mutant.stderr!r}")
    require(drift_match is not None, f"mutant output was not one DRIFT line: {mutant.stdout!r}")
    mutant_counts = tuple(int(v) for v in drift_match.groups()[:3])
    require(mutant_counts == tuple(v + 1 for v in baseline_counts), f"unexpected count delta: {baseline_counts} -> {mutant_counts}")
    require(int(drift_match.group(4)) == 1, f"expected one isolated finding: {mutant.stdout!r}")
    require(drift_match.group(5) == expected_first, f"wrong first finding: {drift_match.group(5)}")

    gate_diff = run(
        "10-gate-bytes-unchanged",
        ["git", "-C", str(LANE), "diff", "--exit-code", REV, "--", "scripts/readme-map.mjs"],
    )
    require(gate_diff.returncode == 0, "gate bytes differ from R1")
    final_head = run("11-final-head", ["git", "-C", str(LANE), "rev-parse", "HEAD"])
    require(final_head.returncode == 0 and final_head.stdout.strip() == REV, "HEAD moved; a commit was not permitted")

    result = {
        "seat": "CtlMapNotFile",
        "revision": REV,
        "baseline": {"exit": baseline.returncode, "stdout": baseline.stdout.strip()},
        "mutation": {"covered": ENTRY, "kind": "directory", "readme_row_added": True, "committed": False},
        "mutant": {"exit": mutant.returncode, "stdout": mutant.stdout.strip(), "stderr": mutant.stderr},
        "gate_bytes_unchanged": True,
        "head_unchanged": True,
        "verdict": "PASS",
    }
    (ROOT / "result.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf-8")
    print(f"PROBE: PASS exit=1 first={expected_first}")


try:
    main()
except Exception as exc:
    print(f"PROBE: FAIL {exc}", file=sys.stderr)
    sys.exit(1)
