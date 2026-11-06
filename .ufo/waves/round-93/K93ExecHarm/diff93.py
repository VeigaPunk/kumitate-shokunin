#!/usr/bin/env python3
"""Integration-delta harness: run v1 (base) and v2 (cand) seat-route on real transcripts
and report structural drift. NOT the frozen scorer: it never compares against the oracle.

Usage: diff93.py --base TOOL --cand TOOL --sample SAMPLEA.tsv --out OUTDIR
"""
import argparse, json, os, subprocess, sys

NEW_KEYS = ["error_attempts", "recovered_attempts", "superseded_by", "upstream",
            "resolved", "chain", "flag_hops", "revert_hops"]


def run(tool, args, timeout=240):
    cmd = ["prlimit", "--as=4294967296", "timeout", str(timeout), 'node', tool] + args
    p = subprocess.run(cmd, capture_output=True, text=True)
    return p.returncode, p.stdout, p.stderr


def one(tool, path):
    rc, out, err = run(tool, ["--file", path, "--json"])
    try:
        rec = json.loads(out)
    except Exception:
        rec = None
    return rc, rec, out[:2000], err[:500]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", required=True)
    ap.add_argument("--cand", required=True)
    ap.add_argument("--sample", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    rows = []
    with open(a.sample) as f:
        for line in f:
            line = line.rstrip("\n")
            if not line:
                continue
            label, path = line.split("\t", 1)
            rows.append((label, path))
    summary = {"n": len(rows), "exit_drift": [], "json_fail": [], "keyset_drift": [],
               "v1_value_drift": [], "errors_vs_error_attempts": [], "missing_new": [],
               "extra_keys": [], "rows": []}
    for label, path in rows:
        rb, b, braw, be = one(a.base, path)
        rc, c, craw, ce = one(a.cand, path)
        row = {"label": label, "path": path, "base_exit": rb, "cand_exit": rc}
        if rb != rc:
            summary["exit_drift"].append(row)
        if b is None or c is None:
            summary["json_fail"].append({"label": label, "base": rb, "cand": rc,
                                         "base_err": be, "cand_err": ce})
            summary["rows"].append(row)
            continue
        bk, ck = set(b), set(c)
        old = bk - {"errors"}
        if ck - (bk | set(NEW_KEYS)) or (set(NEW_KEYS) - ck) or ("errors" in ck):
            summary["keyset_drift"].append(
                {"label": label, "extra": sorted(ck - (bk | set(NEW_KEYS))),
                 "missing_new": sorted(set(NEW_KEYS) - ck),
                 "still_errors": "errors" in ck})
        for k in sorted(old):
            if b.get(k) != c.get(k):
                summary["v1_value_drift"].append({"label": label, "k": k, "base": b.get(k), "cand": c.get(k)})
        if c.get("error_attempts") != b.get("errors"):
            summary["errors_vs_error_attempts"].append(
                {"label": label, "v1_errors": b.get("errors"), "v2_error_attempts": c.get("error_attempts")})
        row["v2_added"] = {k: c.get(k) for k in NEW_KEYS if k in c}
        summary["rows"].append(row)
    with open(os.path.join(a.out, "diff-summary.json"), "w") as f:
        json.dump(summary, f, indent=1)
    print(f"ROWS {summary['n']}")
    print(f"EXIT_DRIFT {len(summary['exit_drift'])}")
    print(f"JSON_FAIL {len(summary['json_fail'])}")
    print(f"KEYSET_DRIFT {len(summary['keyset_drift'])}")
    print(f"V1_VALUE_DRIFT {len(summary['v1_value_drift'])}")
    print(f"ERRORS_RENAMED_MISMATCH {len(summary['errors_vs_error_attempts'])}")
    for x in summary["keyset_drift"][:5]:
        print("  ", json.dumps(x))
    for x in summary["v1_value_drift"][:10]:
        print("  ", json.dumps(x))
    for x in summary["errors_vs_error_attempts"][:5]:
        print("  ", json.dumps(x))
    # aggregate the v2 additions so the delta table is readable
    agg = {}
    for r in summary["rows"]:
        for k, v in r.get("v2_added", {}).items():
            agg.setdefault(k, []).append(v)
    with open(os.path.join(a.out, "v2-field-values.json"), "w") as f:
        json.dump(agg, f, indent=1)


if __name__ == "__main__":
    main()
