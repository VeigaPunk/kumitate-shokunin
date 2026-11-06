#!/usr/bin/env python3
"""K92Sentinel step 2: attack the shipped candidate `seat-route.mjs` (wave mode + --file).

Builds host-shaped fixtures in scratch and runs a matrix of adversarial invocations.
Every check prints PASS/FAIL with the observed exit code and a bounded slice of stdout.
No secret is printed: fixture transcripts carry fabricated values only.
"""
import json, os, shutil, stat, subprocess, sys, tempfile

SC = "/fast/scratch/hyaku/kumitate-r92/K92Sentinel/attack"
TOOL = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/K92ExecTool/seat-route.mjs"
PRLIMIT = ["prlimit", "--as=4294967296"]

R = []  # results
MARKER_CWD = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/"


def rec(name, ok, detail):
    R.append((name, ok, detail))
    print(f"[{'PASS' if ok else 'FAIL'}] {name}: {detail}")


def rows(seat_model, ts, error=None, stop="stop"):
    out = [
        {"type": "session", "id": "s", "timestamp": ts, "cwd": MARKER_CWD},
        {"type": "model_change", "role": f"subagent:{seat_model}", "model": "captured/model-x"},
        {"type": "message", "message": {"role": "assistant", "provider": "realp", "model": "realm",
                                        "stopReason": stop, "content": [],
                                        **({"errorMessage": error} if error else {})}},
    ]
    return "\n".join(json.dumps(r) for r in out) + "\n"


def transcript(ts="2026-11-01T00:00:00.000Z", error=None, stop="stop"):
    out = [
        {"type": "session", "id": "s", "timestamp": ts, "cwd": MARKER_CWD},
        {"type": "model_change", "role": "subagent:S", "model": "captured/model-x"},
        {"type": "message", "message": {"role": "assistant", "provider": "realp", "model": "realm",
                                        "stopReason": stop, "content": [],
                                        **({"errorMessage": error} if error else {})}},
    ]
    return "\n".join(json.dumps(r) for r in out) + "\n"


def run(args, timeout=120, limit=None, cwd=None):
    cmd = (PRLIMIT if limit else []) + ["timeout", str(timeout), "node", TOOL] + args
    t0 = __import__("time").time()
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, cwd=cwd, timeout=timeout + 30)
        dt = __import__("time").time() - t0
        return p.returncode, p.stdout, p.stderr, dt
    except subprocess.TimeoutExpired:
        return "HUNG", "", "", __import__("time").time() - t0


def build(base):
    root = os.path.join(base, "sessions")
    os.makedirs(os.path.join(root, "cwd-a", "orch-1"), exist_ok=True)
    good = os.path.join(root, "cwd-a", "orch-1", "GoodSeat.jsonl")
    with open(good, "w") as fh:
        fh.write(rows("GoodSeat", "2026-11-01T00:00:00.000Z").replace(
            "captured/model-x", "cap/model").replace("realp", "ansp").replace("realm", "ansm"))
    # outside-root canary, with the required markers so a following tool would match it
    outside = os.path.join(base, "outside", "EscapeSeat.jsonl")
    os.makedirs(os.path.dirname(outside), exist_ok=True)
    with open(outside, "w") as fh:
        fh.write(transcript("2026-11-02T00:00:00.000Z", error="OUTSIDE_ROOT_CANARY leaked"))
    # symlink to the outside canary
    os.symlink(outside, os.path.join(root, "EscapeSeat.jsonl"))
    # symlink loop: dir pointing at root, and a back-edge deeper in
    os.symlink(root, os.path.join(root, "loop"))
    os.symlink(root, os.path.join(root, "cwd-a", "back"))
    # FIFO named like a seat
    os.mkfifo(os.path.join(root, "FifoSeat.jsonl"))
    # symlink to a character device (unbounded read)
    os.symlink("/dev/zero", os.path.join(root, "ZeroSeat.jsonl"))
    # unreadable directory holding a seat
    nd = os.path.join(root, "noread")
    os.makedirs(nd, exist_ok=True)
    with open(os.path.join(nd, "HiddenSeat.jsonl"), "w") as fh:
        fh.write(transcript("2026-11-03T00:00:00.000Z"))
    os.chmod(nd, 0o000)

    names = ["GoodSeat", "../x", "../../etc/passwd", "/etc/passwd", "a/../../GoodSeat",
             "..", "A\u0000B", "x" * 5000, "GoodSeat\x00evil", "\uff0e\uff0e/slash",
             "EscapeSeat", "FifoSeat", "ZeroSeat", "HiddenSeat", "GoodSeat"]
    results = {"lane": "kumitate", "round": "92",
               "results": [{"name": n, "agent": "task"} for n in names]}
    rp = os.path.join(base, "w1-results.json")
    with open(rp, "w") as fh:
        json.dump(results, fh)
    return root, rp


def main():
    if not os.path.isfile(TOOL):
        print("TOOL ABSENT", TOOL)
        return 1
    sha = subprocess.run(["sha256sum", TOOL], capture_output=True, text=True).stdout.split()[0]
    print(f"tool={TOOL} sha256={sha}")
    if os.path.isdir(SC):
        subprocess.run(["chmod", "-R", "u+rwX", SC])
        shutil.rmtree(SC)
    os.makedirs(SC)
    base = tempfile.mkdtemp(dir=SC)
    root, rp = build(base)

    rc, out, err, dt = run(["--results", rp, "--sessions-root", root, "--json"], 120)
    try:
        recs = json.loads(out)
    except Exception:
        recs = None
    rec("A1-wave-hostile-fixtures-terminates", rc in (0, 1, 2) and dt < 120,
        f"rc={rc} dt={dt:.1f}s stderr={err.strip()[:120]!r}")
    if recs is None:
        rec("A1-parsable-output", False, f"stdout={out[:160]!r}")
    else:
        by = {r["seat"]: r for r in recs}
        rec("A2-no-sidereal-records-for-unsafe-names", len(recs) == len(
            json.load(open(rp))["results"]), f"records={len(recs)}")
        for bad in ("../x", "../../etc/passwd", "/etc/passwd", "a/../../GoodSeat", "..",
                    "A\u0000B", "GoodSeat\x00evil", "\uff0e\uff0e/slash"):
            r = by.get(bad)
            rec(f"A2-unsafe-name-{bad[:14]!r}", r is not None and r.get("session") is None
                and r.get("final") == "absent", f"rec={json.dumps(r)[:100] if r else None}")
        long_name = by.get("x" * 5000)
        rec("A2-5000-char-name", long_name is not None and long_name.get("session") is None,
            f"rec={json.dumps(long_name)[:100] if long_name else None}")
        esc = by.get("EscapeSeat")
        rec("A3-symlink-does-not-read-outside-root",
            esc is not None and esc.get("session") is None,
            f"rec={json.dumps(esc)[:140] if esc else None}")
        fifo = by.get("FifoSeat")
        rec("A4-fifo-seat-skipped-not-blocking", fifo is not None and fifo.get("session") is None,
            f"rec={json.dumps(fifo)[:100] if fifo else None}")
        zero = by.get("ZeroSeat")
        rec("A5-devzero-seat-skipped", zero is not None and zero.get("session") is None,
            f"rec={json.dumps(zero)[:100] if zero else None}")
        hid = by.get("HiddenSeat")
        rec("A6-unreadable-dir-seat-absent", hid is not None and hid.get("session") is None,
            f"rec={json.dumps(hid)[:100] if hid else None}")
        g = by.get("GoodSeat")
        rec("A7-good-seat-served", g is not None and g.get("final") == "served"
            and g.get("captured") == "cap/model" and g.get("answered") == ["ansp/ansm"]
            and g.get("fallback") is True,
            f"rec={json.dumps(g) if g else None}")

    # A8: fail-closed on unusable inputs
    for label, args in [
        ("A8-results-absent", ["--results", os.path.join(base, "nope.json"), "--json"]),
        ("A8-results-notjson", ["--results", os.path.join(base, "junk.json"), "--json"]),
        ("A8-root-absent", ["--results", rp, "--sessions-root", os.path.join(base, "noroot"), "--json"]),
        ("A8-root-is-file", ["--results", rp, "--sessions-root", rp, "--json"]),
        ("A8-usage", ["--file"]),
    ]:
        if label == "A8-results-notjson":
            with open(os.path.join(base, "junk.json"), "w") as fh:
                fh.write("{not json")
        if label == "A8-usage":
            rc2, out2, err2, dt2 = run(["--nope", "x"], 60)
            rec(label, rc2 == 64, f"rc={rc2}")
            continue
        rc2, out2, err2, dt2 = run(args, 60)
        rec(label, rc2 == 2, f"rc={rc2} stdout={out2[:80]!r}")

    # A9: 50 MB single line, and a 2 GB sparse transcript, under a 4 GiB address-space bound
    big = os.path.join(root, "cwd-a", "orch-1", "BigSeat.jsonl")
    with open(big, "w") as fh:
        fh.write(json.dumps({"type": "session", "timestamp": "2026-11-04T00:00:00.000Z"}) + "\n")
        fh.write(json.dumps({"type": "message", "message": {
            "role": "assistant", "provider": "p", "model": "m", "stopReason": "stop",
            "content": [{"type": "text", "text": "E" * (50 * 1024 * 1024)}]}}) + "\n")
    rc3, out3, err3, dt3 = run(["--file", big, "--json"], 300, limit=True)
    ok3 = False
    try:
        o = json.loads(out3)
        ok3 = o.get("final") == "served" and o.get("answered") == ["p/m"] and o.get("parse_errors") == 0
    except Exception:
        pass
    rec("A9-50MB-nonerror-line", ok3 and dt3 < 300, f"rc={rc3} dt={dt3:.1f}s out={out3[:120]!r} err={err3[:100]!r}")

    sparse = os.path.join(root, "cwd-a", "orch-1", "SparseSeat.jsonl")
    with open(sparse, "wb") as fh:
        fh.truncate(2 * 1024 * 1024 * 1024)
    rc4, out4, err4, dt4 = run(["--file", sparse, "--json"], 300, limit=True)
    rec("A10-2GB-sparse-bounded", rc4 != "HUNG" and dt4 < 300,
        f"rc={rc4} dt={dt4:.1f}s out={out4[:100]!r} err={err4.strip()[-120:]!r}")

    # A11: a single error turn whose errorMessage FIRST LINE is 6 MB (above the V8 replace cliff)
    huge = os.path.join(root, "cwd-a", "orch-1", "HugeErrSeat.jsonl")
    with open(huge, "w") as fh:
        fh.write(json.dumps({"type": "session", "timestamp": "2026-11-05T00:00:00.000Z",
                             "cwd": MARKER_CWD}) + "\n")
        fh.write(json.dumps({"type": "message", "message": {
            "role": "assistant", "provider": "p", "model": "m", "stopReason": "error",
            "errorMessage": "E" * (6 * 1024 * 1024), "content": []}}) + "\n")
    rc5, out5, err5, dt5 = run(["--file", huge, "--json"], 300, limit=True)
    ok5 = False
    try:
        o = json.loads(out5)
        ok5 = o.get("errors") == 1 and o.get("final") == "dead" and len(o.get("last_error") or "") <= 120
    except Exception:
        pass
    rec("A11-6MB-error-first-line", ok5, f"rc={rc5} dt={dt5:.1f}s out={out5[:80]!r} err={err5.strip()[:120]!r}")

    os.chmod(root + "/noread", 0o755)
    print("\nSUMMARY " + " ".join(f"{n}={'ok' if ok else 'FAIL'}" for n, ok, _ in R))
    print("FAILS=" + ",".join(n for n, ok, _ in R if not ok))
    return 0 if all(ok for _, ok, _ in R) else 1


if __name__ == "__main__":
    sys.exit(main())
