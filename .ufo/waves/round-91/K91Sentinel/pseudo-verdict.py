#!/usr/bin/env python3
"""K91Sentinel — decisive test: an external REGULAR file whose st_size is 0 but whose
CONTENT exceeds the 16777216 cap (the size-from-fstat cap does not bound the read).

/proc/kallsyms is a regular file (S_ISREG) with st_size 0 and stable content of
~22.5 MiB > 16777216. If the tool reads it and binds it, the cap did not bound the read.
"""
import hashlib, os, shutil, subprocess, sys, time

SCRATCH = "/fast/scratch/hyaku/kumitate-r91/K91Sentinel"
SEAT = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/K91Sentinel"
RCPT_SEAT = os.path.join(SEAT, "receipts")
LANE_FIX = os.path.join(SCRATCH, "fixture-lane")
LIMIT = 2147483648
CAP = 16777216
LINES = []

TOOLS = {
    "v4": os.path.join(SCRATCH, "tools", "v4.mjs"),
    "ref": "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-91/controls/ref-fd-fstat.mjs",
    "cand": os.path.join(SCRATCH, "tools", "v5-candidate.mjs"),
}


def log(s=""):
    LINES.append(s)
    print(s, flush=True)


def sh(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def rev():
    return sh(["git", "-C", LANE_FIX, "rev-parse", "HEAD"]).stdout.strip()


def sha_bytes(b):
    return hashlib.sha256(b).hexdigest()


def write_receipt(name, r, cmd, digest):
    d = os.path.join(SCRATCH, "rcpt", name)
    shutil.rmtree(d, ignore_errors=True)
    os.makedirs(d)
    body = f"rev={r}\ntool_sha256={digest}\ncmd={cmd}\nexit=0\nsignal=none\n"
    with open(os.path.join(d, "a.txt"), "w") as f:
        f.write(body)
    shutil.copyfile(os.path.join(d, "a.txt"), os.path.join(RCPT_SEAT, name + ".txt"))
    return d


def run_tool(tool, d, r, timeout=20):
    cmd = ["prlimit", f"--as={LIMIT}", "--", "timeout", str(timeout), "node", tool,
           "--dir", d, "--rev", r, "--lane", LANE_FIX]
    t0 = time.time()
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout + 10, cwd=SCRATCH)
        rc, out, err = p.returncode, p.stdout.strip(), p.stderr.strip()
    except subprocess.TimeoutExpired:
        rc, out, err = "TIMEOUT", "", ""
    verdict = ""
    for ln in (out + "\n" + err).splitlines():
        if ln.startswith("RECEIPT_BIND:"):
            verdict = ln
            break
    if not verdict:
        verdict = out.splitlines()[-1] if out else (err.splitlines()[-1] if err else "(none)")
    return {"cmd": " ".join(cmd), "rc": rc, "verdict": verdict, "out": out, "err": err[:800],
            "wall": round(time.time() - t0, 2)}


def save(name, res):
    p = os.path.join(RCPT_SEAT, name + ".txt")
    with open(p, "w") as f:
        f.write(f"### command\n{res['cmd']}\n### exit\n{res['rc']}\n### wall_s\n{res['wall']}\n")
        f.write(f"### verdict\n{res['verdict']}\n### stdout\n{res['out']}\n### stderr\n{res['err']}\n")
    return p


def read_all(p):
    with open(p, "rb") as f:
        return f.read()


def main():
    os.makedirs(RCPT_SEAT, exist_ok=True)
    r = rev()
    log(f"fixture rev {r}")
    log(f"cap {CAP}")
    log("")

    # ---- PS1: /proc/kallsyms — regular file, st_size 0, content 22.5 MiB > cap ----
    st = os.stat("/proc/kallsyms")
    content = read_all("/proc/kallsyms")
    digest = sha_bytes(content)
    log(f"PS1 | /proc/kallsyms: st_mode regular={os.path.isfile('/proc/kallsyms')} st_size={st.st_size} "
        f"content_bytes={len(content)} over_cap={len(content) > CAP} sha256={digest}")
    # stability: the same bytes twice
    c2 = read_all("/proc/kallsyms")
    log(f"     content stable across two reads: {c2 == content}")
    d = write_receipt("PS1", r, "node /proc/kallsyms", digest)
    log("     (the receipt carries the CORRECT digest of the file's actual content)")
    for k in ("v4", "ref", "cand"):
        res = run_tool(TOOLS[k], d, r)
        save(f"PS1.{k}", res)
        log(f"     {k:4s} exit={res['rc']} wall={res['wall']}s :: {res['verdict']}")
    log("     expected (claim): FAIL-CLOSED UNRESOLVED exit 2 — content is over the cap")
    log("")

    # ---- PS2: /proc/self/pagemap — regular file, st_size 0, content 256 GiB ----
    log("PS2 | /proc/self/pagemap: st_size=0, content=274877906936 bytes (256 GiB) >> cap")
    d2 = write_receipt("PS2", r, "node /proc/self/pagemap", "0" * 64)
    for k in ("v4", "ref", "cand"):
        res = run_tool(TOOLS[k], d2, r)
        save(f"PS2.{k}", res)
        log(f"     {k:4s} exit={res['rc']} wall={res['wall']}s :: {res['verdict']}")
    log("     expected (claim): FAIL-CLOSED UNRESOLVED exit 2 within 20 s under 2 GiB AS")
    log("     NOTE: exit 133 + no verdict line is the SAME failure mode as the round-90 A4")
    log("           (/dev/zero) that this round's claim exists to fix.")
    log("")

    # ---- PS3: /proc/self/smaps — regular file, st_size 0, content under cap ----
    log("PS3 | /proc/self/smaps: st_size=0, content under the cap")
    c3 = read_all("/proc/self/smaps")
    d3 = write_receipt("PS3", r, "node /proc/self/smaps", sha_bytes(c3))
    for k in ("v4", "ref", "cand"):
        res = run_tool(TOOLS[k], d3, r)
        save(f"PS3.{k}", res)
        log(f"     {k:4s} exit={res['rc']} wall={res['wall']}s :: {res['verdict']}")
    log("")

    with open(os.path.join(SEAT, "pseudo-verdict.log"), "w") as f:
        f.write("\n".join(LINES) + "\n")


if __name__ == "__main__":
    main()
