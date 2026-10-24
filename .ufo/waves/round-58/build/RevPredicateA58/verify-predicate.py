#!/usr/bin/env python3
# RevPredicateA58: compare the frozen ATTEST58 predicate, probe header, and R1 final verdict.
# Contract: read-only lane inspection; transcripts and comparison output stay in this build directory.
# Exit codes: 0 = no predicate drift; 1 = drift or malformed predicate surface; 2 = evidence unreadable.

import hashlib
import json
import re
import shlex
import subprocess
import sys
from pathlib import Path

LANE = Path("/home/vgpnk/Projects/shokunin/kumitate-shokunin")
R1 = "6affb9ebde37b7d663658f1959d64f0f0b68f480"
PLAN_REL = ".ufo/waves/round-58/plan.md"
PROBE_REL = ".ufo/waves/round-58/probe/attest58-probe.mjs"
FINAL_REL = ".ufo/waves/round-58/close/FINAL-attest58-R1.txt"
BUILD = Path(__file__).resolve().parent
MARKER = b"ATTEST58_HELD \xe2\x80\x94 "
INVOCATION = (
    "ATTEST58_HELD — node .ufo/waves/round-58/probe/attest58-probe.mjs "
    "/home/vgpnk/Projects/shokunin/kumitate-shokunin <rev> prints \""
)
EXPECTED_TEMPLATE = (
    "ATTEST58: ATTEST58_HELD held=10/10 checks=10 rev=<rev> "
    "rule=A58 version=v1"
)
EXPECTED_FIELDS = {
    "label": "ATTEST58_HELD",
    "held": "10/10",
    "checks": "10",
    "rev": R1,
    "rule": "A58",
    "version": "v1",
}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def git_show(relative_path, transcript_name):
    command = [
        "git", "--no-pager", "-C", str(LANE), "show", f"{R1}:{relative_path}",
    ]
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    transcript = (
        f"$ {shlex.join(command)}\n--- stdout ---\n".encode()
        + result.stdout
        + b"--- stderr ---\n"
        + result.stderr
        + f"--- exit code ---\n{result.returncode}\n".encode()
    )
    (BUILD / transcript_name).write_bytes(transcript)
    if result.returncode != 0:
        print(f"EVIDENCE_ERROR: {shlex.join(command)} exited {result.returncode}")
        raise SystemExit(2)
    return result.stdout


def predicates(data):
    found = []
    for line in data.splitlines():
        position = line.find(MARKER)
        if position >= 0:
            found.append(line[position:])
    return found


def printable(data):
    return json.dumps(data.decode("utf-8"), ensure_ascii=False)


def main():
    print(f"ITEM=RevPredicateA58")
    print(f"R1={R1}")
    print(f"LANE={LANE}")

    plan_r1 = git_show(PLAN_REL, "01-plan-at-R1.transcript.txt")
    probe_r1 = git_show(PROBE_REL, "02-probe-at-R1.transcript.txt")
    try:
        plan_live = (LANE / PLAN_REL).read_bytes()
        probe_live = (LANE / PROBE_REL).read_bytes()
        final_live = (LANE / FINAL_REL).read_bytes()
    except OSError as error:
        print(f"EVIDENCE_ERROR: live artifact read failed: {error}")
        return 2

    print(f"SHA256 plan_at_R1={digest(plan_r1)}")
    print(f"SHA256 probe_at_R1={digest(probe_r1)}")
    print(f"SHA256 plan_live={digest(plan_live)}")
    print(f"SHA256 probe_live={digest(probe_live)}")
    print(f"SHA256 final_live={digest(final_live)}")

    plan_r1_candidates = predicates(plan_r1)
    probe_r1_candidates = predicates(probe_r1)
    plan_live_candidates = predicates(plan_live)
    probe_live_candidates = predicates(probe_live)
    counts = {
        "plan_at_R1": len(plan_r1_candidates),
        "probe_at_R1": len(probe_r1_candidates),
        "plan_live": len(plan_live_candidates),
        "probe_live": len(probe_live_candidates),
    }
    print(f"PREDICATE_COUNTS={json.dumps(counts, sort_keys=True)}")
    if set(counts.values()) != {1}:
        print("RESULT: DRIFT — each surface must contain exactly one ATTEST58 predicate sentence")
        return 1

    plan_sentence = plan_r1_candidates[0]
    probe_sentence = probe_r1_candidates[0]
    plan_live_sentence = plan_live_candidates[0]
    probe_live_sentence = probe_live_candidates[0]
    failures = []

    def check(name, condition, detail):
        print(f"{name}: {'MATCH' if condition else 'DRIFT'} | {detail}")
        if not condition:
            failures.append(name)

    check(
        "plan_probe_byte_identical_at_R1",
        plan_sentence == probe_sentence,
        f"plan_sha256={digest(plan_sentence)} probe_sha256={digest(probe_sentence)}",
    )
    check(
        "plan_live_matches_R1",
        plan_live_sentence == plan_sentence,
        f"live_sha256={digest(plan_live_sentence)} R1_sha256={digest(plan_sentence)}",
    )
    check(
        "probe_live_matches_R1",
        probe_live_sentence == probe_sentence,
        f"live_sha256={digest(probe_live_sentence)} R1_sha256={digest(probe_sentence)}",
    )
    check(
        "plan_probe_byte_identical_live",
        plan_live_sentence == probe_live_sentence,
        f"plan_sha256={digest(plan_live_sentence)} probe_sha256={digest(probe_live_sentence)}",
    )

    try:
        sentence = plan_sentence.decode("utf-8")
        probe_text = probe_sentence.decode("utf-8")
        print(f"PLAN_PREDICATE={printable(plan_sentence)}")
        print(f"PROBE_PREDICATE={printable(probe_sentence)}")
    except UnicodeDecodeError as error:
        print(f"RESULT: DRIFT — predicate is not strict UTF-8: {error}")
        return 1

    check("plan_probe_same_unicode_sentence", sentence == probe_text, "strict UTF-8 decoded comparison")
    suffix = "\" and exits 0."
    shape_ok = sentence.startswith(INVOCATION) and sentence.endswith(suffix)
    check("frozen_invocation_and_exit_shape", shape_ok, "exact label, probe path, lane path, <rev>, prints quote, exits 0")
    if not shape_ok:
        print("RESULT: DRIFT — cannot extract quoted verdict template")
        return 1

    output_template = sentence[len(INVOCATION):-len(suffix)]
    check(
        "frozen_verdict_template",
        output_template == EXPECTED_TEMPLATE,
        f"expected={json.dumps(EXPECTED_TEMPLATE)} actual={json.dumps(output_template)}",
    )

    final_lines = final_live.splitlines()
    check("final_exactly_one_verdict_line", len(final_lines) == 1, f"lines={len(final_lines)}")
    if len(final_lines) != 1:
        print("RESULT: DRIFT — final receipt is not one verdict line")
        return 1
    try:
        final_line = final_lines[0].decode("utf-8")
    except UnicodeDecodeError as error:
        print(f"RESULT: DRIFT — final verdict is not strict UTF-8: {error}")
        return 1
    print(f"FINAL_VERDICT={json.dumps(final_line, ensure_ascii=False)}")

    verdict_pattern = re.fullmatch(
        r"ATTEST58: (?P<label>[^ ]+) held=(?P<held>[^ ]+) "
        r"checks=(?P<checks>[^ ]+) rev=(?P<rev>[^ ]+) "
        r"rule=(?P<rule>[^ ]+) version=(?P<version>[^ |]+)"
        r"(?: \| (?P<tail>.*))?",
        final_line,
    )
    check("final_verdict_parse", verdict_pattern is not None, "label/held/checks/rev/rule/version plus optional check tail")
    if verdict_pattern is None:
        print("RESULT: DRIFT — final verdict does not have the required sentence shape")
        return 1

    actual_fields = verdict_pattern.groupdict()
    for field, expected in EXPECTED_FIELDS.items():
        actual = actual_fields[field]
        check(f"field_{field}", actual == expected, f"expected={expected} actual={actual}")

    verdict_prefix = final_line.split(" | ", 1)[0]
    expected_prefix = output_template.replace("<rev>", R1)
    print(f"EXPECTED_VERDICT_PREFIX={json.dumps(expected_prefix)}")
    print(f"OBSERVED_VERDICT_PREFIX={json.dumps(verdict_prefix)}")
    check(
        "final_prefix_equals_frozen_template_at_R1",
        verdict_prefix == expected_prefix,
        "only <rev> instantiated; all other verdict-prefix bytes unchanged",
    )

    tail = actual_fields.get("tail")
    tail_ids = re.findall(r"(?:^| \| )(B\d+) (?:PASS|MISS)", tail or "")
    check(
        "final_tail_has_B1_through_B10",
        tail_ids == [f"B{number}" for number in range(1, 11)],
        f"observed_ids={json.dumps(tail_ids)}",
    )

    if failures:
        print(f"RESULT: DRIFT — findings={json.dumps(failures)}")
        return 1
    print("RESULT: NO DRIFT — plan, probe header, and FINAL-attest58-R1 verdict share the frozen A58 v1 shape")
    return 0


if __name__ == "__main__":
    sys.exit(main())
