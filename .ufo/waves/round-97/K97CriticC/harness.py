#!/usr/bin/env python3
"""R97 C1 differential harness (seat K97CriticC).

build  : materialise case dirs (historical blobs, sibling registries, seeded mutations, stress grid)
census : run the fleet census on every case, cache E12 ids + rows
tool   : run one sources-check --json on every case, compare with the cached census side
"""
import argparse, json, os, random, re, shutil, subprocess, sys, hashlib
from concurrent.futures import ThreadPoolExecutor

ROOT = "/home/vgpnk/Projects/shokunin"
LANE = f"{ROOT}/kumitate-shokunin"
CENSUS = f"{ROOT}/scripts/sources-census.sh"
S = "/fast/scratch/hyaku/kumitate-r97/K97CriticC"
CASES = os.environ.get("CASES_DIR", f"{S}/cases")
TAG = os.environ.get("TAG", "")
TODAY = "2026-11-07"

HEAD_POOL = [
    "## Registry", "## Registry ", "##  Registry", "##\tRegistry", "##\t\tRegistry",
    "## Registry\r", "## Registry\v", "## Registry\f", "## Registry\u00a0", "## Registry\t",
    "## Registry ##", "## registry", "## Registry\t#", "## Registry  ",
    "## Leads (unopened)", "## Paths", "## Search log",
    "# Title", "# ", "#", "#\t", "#\v", "#\u00a0", "#\tTitle", "# Title\r",
    "### Registry", "### X", "#### Registry",
    " ## Registry", "  ## Registry", "   ## Registry", "    ## Registry",
    "\t## Registry", " \t## Registry", "  \t## Registry",
    "##\u00a0Registry", "## \u00a0Registry", "## \tRegistry", "##\r", "##",
]
HEAD_RE = re.compile(r"^ {0,3}#")

def write_case(case_dir, text):
    os.makedirs(f"{case_dir}/corpus/knowledge", exist_ok=True)
    with open(f"{case_dir}/corpus/SOURCES.md", "w", encoding="utf-8", newline="") as f:
        f.write(text)

def freeze_registry():
    return subprocess.run(["git", "-C", LANE, "show", "38eb197c17de7ce0dc562539f2f31f41bea037ec:corpus/SOURCES.md"],
                          capture_output=True, text=True, check=True).stdout

def build(seed, nmut):
    shutil.rmtree(CASES, ignore_errors=True)
    meta = {"seed": seed, "cases": {}}
    base_text = freeze_registry()
    meta["base_sha256"] = hashlib.sha256(base_text.encode()).hexdigest()
    # historical blobs
    revs = subprocess.run(["git", "-C", LANE, "log", "--format=%H", "--", "corpus/SOURCES.md"],
                          capture_output=True, text=True, check=True).stdout.split()
    for rev in revs:
        text = subprocess.run(["git", "-C", LANE, "show", f"{rev}:corpus/SOURCES.md"],
                              capture_output=True, text=True, check=True).stdout
        write_case(f"{CASES}/hist/{rev}", text)
        meta["cases"][f"hist/{rev}"] = "hist"
    # sibling registries (current working tree)
    import glob
    for path in sorted(glob.glob(f"{ROOT}/*-shokunin/corpus/SOURCES.md")):
        lane = path.split("/")[-3]
        with open(path, encoding="utf-8", newline="") as f:
            write_case(f"{CASES}/sib/{lane}", f.read())
        meta["cases"][f"sib/{lane}"] = "sib"
    # seeded mutations
    rng = random.Random(seed)
    lines0 = base_text.split("\n")
    def row_idx(lines):
        return [i for i, l in enumerate(lines) if re.match(r"^\| *S\d{3,}", l)]
    def head_idx(lines):
        return [i for i, l in enumerate(lines) if HEAD_RE.match(l)]
    for k in range(nmut):
        lines = list(lines0)
        nops = rng.choices([1, 2, 3], weights=[5, 4, 2])[0]
        for _ in range(nops):
            op = rng.choice(["ins", "del", "rep", "move", "crlf", "indent", "dup", "movehead"])
            if op == "ins":
                lines.insert(rng.randrange(len(lines) + 1), rng.choice(HEAD_POOL))
            elif op == "dup":
                h = rng.choice(HEAD_POOL)
                pos = rng.randrange(len(lines) + 1)
                lines.insert(pos, h)
                lines.insert(rng.randrange(len(lines) + 1), h)
            elif op == "del":
                hi = head_idx(lines)
                if hi: del lines[rng.choice(hi)]
            elif op == "rep":
                hi = head_idx(lines)
                if hi: lines[rng.choice(hi)] = rng.choice(HEAD_POOL)
            elif op == "move":
                ri = row_idx(lines)
                if ri:
                    src = rng.choice(ri)
                    row = lines.pop(src)
                    lines.insert(rng.randrange(len(lines) + 1), row)
            elif op == "movehead":
                hi = head_idx(lines)
                if hi:
                    src = rng.choice(hi)
                    row = lines.pop(src)
                    lines.insert(rng.randrange(len(lines) + 1), row)
            elif op == "crlf":
                a = rng.randrange(len(lines))
                b = min(len(lines), a + rng.randrange(1, 40))
                for i in range(a, b):
                    lines[i] = lines[i].rstrip("\r") + "\r"
                if rng.random() < 0.15:
                    lines = [l.rstrip("\r") + "\r" for l in lines]
            elif op == "indent":
                i = rng.randrange(len(lines))
                lines[i] = rng.choice(["", " ", "  ", "   ", "    ", "\t"]) + lines[i]
        write_case(f"{CASES}/mut/m{k:03d}", "\n".join(lines))
        meta["cases"][f"mut/m{k:03d}"] = "mut"
    # stress grid: heading shape x indent, minimal fixture
    row = "| S001 | https://e.example/x | docs | B | sc | a | t | queued | 2026-01-01 | on-release | — | x |"
    n = 0
    for h in HEAD_POOL:
        for ind in ["", " ", "  ", "   ", "    ", "\t"]:
            text = "\n".join([row.rstrip(), ind + h, row.replace("S001", "S002"), ""])
            write_case(f"{CASES}/stress/s{n:03d}", text)
            meta["cases"][f"stress/s{n:03d}"] = "stress"
            n += 1
    with open(f"{S}/cases-meta{TAG}.json", "w") as f:
        json.dump(meta, f, indent=1)
    print(json.dumps({"cases": len(meta["cases"]),
                      "by_group": {g: sum(1 for v in meta["cases"].values() if v == g)
                                   for g in ("hist", "sib", "mut", "stress")},
                      "seed": seed, "base_sha256": meta["base_sha256"]}))

def run(cmd, timeout=120):
    try:
        p = subprocess.run(cmd, capture_output=True, timeout=timeout)
        return p.returncode, p.stdout.decode("utf-8", "surrogateescape"), p.stderr.decode("utf-8", "surrogateescape")
    except subprocess.TimeoutExpired:
        return -9, "", "TIMEOUT"

def census_one(case):
    f = f"{CASES}/{case}/corpus/SOURCES.md"
    rc1, out1, err1 = run(["bash", CENSUS, "validate", "--file", f])
    ids = []
    for line in out1.split("\n"):
        parts = line.split("\t")
        if len(parts) >= 3 and parts[1] == "E12":
            ids.append(parts[2].rsplit(" row outside Registry section", 1)[0])
    rc2, out2, err2 = run(["bash", CENSUS, "census", "--file", f])
    rows = None
    for line in out2.split("\n"):
        parts = line.split("\t")
        if len(parts) == 3 and parts[0] == "file" and parts[1] == "rows":
            rows = int(parts[2])
    return case, {"e12": ids, "rows": rows, "exit_validate": rc1, "exit_census": rc2,
                  "stderr": (err1 + err2)[:400]}

def census(args):
    names = list(json.load(open(f"{S}/cases-meta{TAG}.json"))["cases"]) if args.all else args.cases
    res = {}
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        for case, r in ex.map(census_one, names):
            res[case] = r
    with open(f"{S}/census{TAG}.json", "w") as f:
        json.dump(res, f)
    bad = {c: r for c, r in res.items() if r["rows"] is None or r["exit_validate"] == 2 or r["exit_census"] == 2}
    print(json.dumps({"cases": len(res), "setup_bad": len(bad),
                      "e12_total": sum(len(r["e12"]) for r in res.values()),
                      "rows_total": sum(r["rows"] or 0 for r in res.values())}))
    if bad: print(json.dumps(bad, indent=1)[:1500], file=sys.stderr)

def tool_one(job):
    name, tool, case = job
    d = f"{CASES}/{case}"
    rc, out, err = run(["node", tool, "--self", d, "--today", TODAY, "--json"])
    ids, rows, verdict = None, None, None
    try:
        doc = json.loads(out)
        verdict = doc.get("verdict")
        counts = doc.get("counts")
        rows = None if counts is None else counts.get("rows")
        ids = []
        for fi in doc.get("findings", []):
            if fi.get("kind") == "ROW_OUTSIDE_REGISTRY":
                m = re.match(r"^id=(.*) row outside Registry section$", fi.get("detail", ""))
                ids.append(m.group(1) if m else "<UNPARSED>")
    except Exception:
        pass
    return name, case, {"ids": ids, "rows": rows, "verdict": verdict, "exit": rc, "stderr": err[:200],
                        "stdout_head": out[:120] if ids is None else ""}

def tool(args):
    cen = json.load(open(f"{S}/census{TAG}.json"))
    names = list(cen) if args.all else args.cases
    out = {}
    for name, path in [kv.split("=", 1) for kv in args.tool]:
        jobs = [(name, path, c) for c in names]
        per = {}
        with ThreadPoolExecutor(max_workers=args.workers) as ex:
            for nm, case, r in ex.map(tool_one, jobs):
                per[case] = r
        summary = {"tool": path, "sha256": hashlib.sha256(open(path, "rb").read()).hexdigest(),
                   "cases": len(per), "e12_agree": 0, "rows_agree": 0, "both_agree": 0,
                   "tool_error": 0, "groups": {}, "diffs": []}
        for case, r in per.items():
            g = case.split("/")[0]
            st = summary["groups"].setdefault(g, {"n": 0, "e12_agree": 0, "rows_agree": 0, "both": 0})
            st["n"] += 1
            c = cen[case]
            if r["ids"] is None or r["rows"] is None:
                summary["tool_error"] += 1
                st.setdefault("tool_error", 0)
                st["tool_error"] += 1
                continue
            e_ok = r["ids"] == c["e12"]
            r_ok = r["rows"] == c["rows"]
            summary["e12_agree"] += e_ok
            summary["rows_agree"] += r_ok
            summary["both_agree"] += (e_ok and r_ok)
            st["e12_agree"] += e_ok
            st["rows_agree"] += r_ok
            st["both"] += (e_ok and r_ok)
            if not (e_ok and r_ok):
                summary["diffs"].append({
                    "case": case, "group": g, "e12_ok": e_ok, "rows_ok": r_ok,
                    "tool_ids_n": len(r["ids"]), "census_ids_n": len(c["e12"]),
                    "tool_rows": r["rows"], "census_rows": c["rows"],
                    "first_id_diff": next(((i, a, b) for i, (a, b) in
                                           enumerate(zip(r["ids"], c["e12"])) if a != b), None),
                    "tool_only": [x for x in r["ids"] if x not in c["e12"]][:5],
                    "census_only": [x for x in c["e12"] if x not in r["ids"]][:5]})
        out[name] = summary
        with open(f"{S}/receipt{TAG}-{name}.json", "w") as f:
            json.dump({"summary": summary, "per_case": per}, f, indent=0)
    cmp = {}
    for name, sm in out.items():
        cmp[name] = {k: sm[k] for k in ("sha256", "cases", "e12_agree", "rows_agree", "both_agree", "tool_error")}
        cmp[name]["groups"] = sm["groups"]
    with open(f"{S}/compare{TAG}.json", "w") as f:
        json.dump({"cmp": cmp, "diffs": {n: s["diffs"][:40] for n, s in out.items()}}, f, indent=1)
    print(json.dumps(cmp, indent=1))
    for n, s in out.items():
        print(f"--- {n} diffs ({len(s['diffs'])}):")
        for d in s["diffs"][:12]:
            print(json.dumps(d))

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("build"); b.add_argument("--seed", type=int, default=97); b.add_argument("--nmut", type=int, default=300)
    c = sub.add_parser("census"); c.add_argument("--all", action="store_true"); c.add_argument("--cases", nargs="*", default=[]); c.add_argument("--workers", type=int, default=8)
    t = sub.add_parser("tool"); t.add_argument("--tool", action="append", default=[]); t.add_argument("--all", action="store_true"); t.add_argument("--cases", nargs="*", default=[]); t.add_argument("--workers", type=int, default=8)
    a = ap.parse_args()
    {"build": lambda: build(a.seed, a.nmut), "census": lambda: census(a), "tool": lambda: tool(a)}[a.cmd]()
