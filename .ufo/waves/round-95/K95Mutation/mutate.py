#!/usr/bin/env python3
"""mutate.py — single-point mutant harness for kumitate r95 C1 (seat K95Mutation).

Usage: mutate.py <target.mjs> <label> <spec-name> [jobs]
Builds each mutant by exact find/replace on the target bytes (asserting the
expected occurrence count), runs `node <mutant> --selftest` and the frozen
counter probe95-c1.mjs on the mutant, and writes per-run logs under runs/.
"""
import concurrent.futures as cf
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys

S = "/fast/scratch/hyaku/kumitate-r95/K95Mutation"
PROBE = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-95/probe/probe95-c1.mjs"
FREEZE = "ee8479be66acd906f1d2b5f24f1b75a3d9172c1b"
MUT = os.path.join(S, "mutants")
RUNS = os.path.join(S, "runs")

ROW = ("    if (!SOURCES_ROW_RE.test(line)) continue;\n"
       "    const fields = line.split('|');\n"
       "    if (fields.length !== 13) { malformed.push(fields[1].trim()); continue; }\n"
       "    const status = (fields[8] ?? '').trim();\n"
       "    if (status.toLowerCase() === 'rejected') continue;\n")
CHK = "    if (fields.length !== 13) { malformed.push(fields[1].trim()); continue; }\n"

# name -> (find, replace, expected_find_count, one-line intent)
SPECS = {
    "escapeonly": (CHK, "    if (line.includes('\\\\|')) { malformed.push(fields[1].trim()); continue; }\n", 1,
                   "control ctl-escapeonly: refuse only rows containing a literal escaped pipe"),
    "gt13": (CHK, "    if (fields.length > 13) { malformed.push(fields[1].trim()); continue; }\n", 1,
             "control ctl-gt13: refuse only rows with MORE than 13 fields (short row declares)"),
    "lenient12": (CHK, "    if (fields.length !== 13 && fields.length !== 12) { malformed.push(fields[1].trim()); continue; }\n", 1,
                  "control ctl-lenient12: accept 12 or 13 fields"),
    "anyrej": (CHK + "    const status = (fields[8] ?? '').trim();\n    if (status.toLowerCase() === 'rejected') continue;\n",
               "    if (fields.length !== 13) malformed.push(fields[1].trim());\n"
               "    if (fields.some((c) => c.trim().toLowerCase() === 'rejected')) continue;\n", 1,
               "control ctl-anyrej: disclose but still read malformed rows; skip any row with a rejected cell"),
    "nodisclose": (CHK, "    if (fields.length !== 13) { continue; }\n", 1,
                   "control ctl-nodisclose: reference rule with an empty malformedRows"),
    "dropall": ("  }\n  return pins;\n}\n\n/** A token is declared iff",
                "  }\n  if (malformed.length) pins.clear();\n  return pins;\n}\n\n/** A token is declared iff", 1,
                "control ctl-dropall: one malformed row silences the whole registry"),
    "short12": (CHK, "    if (fields.length !== 12) { malformed.push(fields[1].trim()); continue; }\n", 1,
                "boundary: exact count 12 instead of 13"),
    "lt13": (CHK, "    if (fields.length < 13) { malformed.push(fields[1].trim()); continue; }\n", 1,
             "boundary: `!== 13` -> `< 13` (long rows declare)"),
    "id2": (CHK, "    if (fields.length !== 13) { malformed.push(fields[2].trim()); continue; }\n", 1,
            "boundary: malformed id read from field 2 (text between first two pipes)"),
    "untrimmed": (CHK, "    if (fields.length !== 13) { malformed.push(fields[1]); continue; }\n", 1,
                  "boundary: push without trim (ids keep surrounding spaces)"),
    "unshift": (CHK, "    if (fields.length !== 13) { malformed.unshift(fields[1].trim()); continue; }\n", 1,
                "boundary: unshift instead of push (reverse file order)"),
    "nofailclosed": ("      checked: 0, external: [], declared: [], malformedRows: [], unresolved: [], notAncestor: [], unverifiable: [],\n      mainProbeable: null, originProbeable: null,\n    },",
                     "      checked: 0, external: [], declared: [], unresolved: [], notAncestor: [], unverifiable: [],\n      mainProbeable: null, originProbeable: null,\n    },", 1,
                     "boundary: malformedRows key dropped from the SECOND (fail-closed) citations object"),
    "status9": ("    const status = (fields[8] ?? '').trim();\n    if (status.toLowerCase() === 'rejected') continue;\n",
                "    const status = (fields[9] ?? '').trim();\n    if (status.toLowerCase() === 'rejected') continue;\n", 1,
                "boundary: status index 8 -> 9"),
    "checkafterstatus": (CHK + "    const status = (fields[8] ?? '').trim();\n",
                         "    const status = (fields[8] ?? '').trim();\n"
                         "    if (fields.length !== 13) { malformed.push(fields[1].trim()); continue; }\n", 1,
                         "boundary: field-count check moved AFTER the status read"),
}


def build(target, name, specs=SPECS, outdir=MUT):
    find, repl, n, intent = specs[name]
    text = open(target, encoding="utf-8").read()
    got = text.count(find)
    if got != n:
        raise SystemExit(f"mutant {name}: find count {got} != {n}")
    out = os.path.join(outdir, f"m-{name}.mjs")
    open(out, "w", encoding="utf-8").write(text.replace(find, repl))
    return out, intent


def run_one(target, name, jobs, specs=SPECS, label="ctl"):
    outdir = os.path.join(MUT, label)
    os.makedirs(outdir, exist_ok=True)
    for dep in ("cap-spawn.mjs", "cap-run.mjs"):
        dst = os.path.join(outdir, dep)
        if not os.path.exists(dst): shutil.copy(os.path.join(MUT, dep), dst)
    path, intent = build(target, name, specs, outdir)
    r = subprocess.run(["node", path, "--selftest"], cwd=outdir, capture_output=True, text=True,
                       timeout=600, env={**os.environ, "TMPDIR": os.path.join(S, "tmp")})
    st_log = r.stdout + r.stderr
    rundir = os.path.join(RUNS, label); os.makedirs(rundir, exist_ok=True)
    open(os.path.join(rundir, f"selftest-{name}.log"), "w").write(st_log)
    fails = re.findall(r"^FAIL\s+\[[^\]]*\]\s+(.*)$", st_log, re.M)
    summary = (re.search(r"^ROUND_GATE_SELFTEST: .*$", st_log, re.M) or ["none"])
    summary = summary.group(0) if hasattr(summary, "group") else summary[0]
    verdict = "PASS" if re.search(r"^VERDICT: PASS$", st_log, re.M) and r.returncode == 0 else "FAIL"
    work = os.path.join(S, "work-" + label + "-" + name)
    c = subprocess.run(["node", PROBE, "--tool", path, "--work", work, "--freeze", FREEZE],
                       cwd=S, capture_output=True, text=True, timeout=900,
                       env={**os.environ, "TMPDIR": os.path.join(S, "tmp")})
    c_log = c.stdout + c.stderr
    open(os.path.join(rundir, f"counter-{name}.log"), "w").write(c_log)
    cl = (re.search(r"^C95_C1: .*$", c_log, re.M) or ["none"])
    cl = cl.group(0) if hasattr(cl, "group") else cl[0]
    fx = (re.search(r"^C95 FX sources exit=.*$", c_log, re.M) or ["none"])
    fx = fx.group(0) if hasattr(fx, "group") else fx[0]
    return {"name": name, "intent": intent, "sha256": hashlib.sha256(open(path, "rb").read()).hexdigest(),
            "selftest_exit": r.returncode, "selftest_verdict": verdict,
            "selftest_summary": summary, "selftest_fails": fails,
            "counter_exit": c.returncode, "counter_verdict": cl, "counter_fx": fx}


SPECS_CAND = dict(SPECS)
SPECS_CAND["checkafterreject"] = (
    CHK + "    const status = (fields[8] ?? '').trim();\n    if (status.toLowerCase() === 'rejected') continue;\n",
    "    const status = (fields[8] ?? '').trim();\n    if (status.toLowerCase() === 'rejected') continue;\n" + CHK, 1,
    "boundary: count check moved after the status DECISION (rejected rows skipped before disclosure)")
SPECS["checkafterreject"] = SPECS_CAND["checkafterreject"]
SPECS_CAND["nofailclosed"] = SPECS["nofailclosed"]

SELECT = {"ctl": SPECS, "cand": SPECS_CAND}

if __name__ == "__main__":
    target, label, specset = sys.argv[1], sys.argv[2], sys.argv[3]
    jobs = int(sys.argv[4]) if len(sys.argv) > 4 else 4
    os.makedirs(RUNS, exist_ok=True)
    os.makedirs(os.path.join(S, "tmp"), exist_ok=True)
    names = list(SPECS) if specset == "all" else specset.split(",")
    tsha = hashlib.sha256(open(target, "rb").read()).hexdigest()
    print(f"TARGET {label} sha256={tsha} mutants={len(names)}", flush=True)
    results = []
    with cf.ThreadPoolExecutor(max_workers=jobs) as ex:
        futs = {ex.submit(run_one, target, n, jobs, SELECT[label], label): n for n in names}
        for f in cf.as_completed(futs):
            try:
                res = f.result()
            except Exception as e:  # noqa: BLE001
                res = {"name": futs[f], "error": repr(e)}
            results.append(res)
            print(json.dumps(res), flush=True)
    order = {n: i for i, n in enumerate(names)}
    results.sort(key=lambda x: order.get(x["name"], 99))
    json.dump({"target": label, "target_sha256": tsha, "results": results},
              open(os.path.join(S, f"mutants-{label}.json"), "w"), indent=2)
