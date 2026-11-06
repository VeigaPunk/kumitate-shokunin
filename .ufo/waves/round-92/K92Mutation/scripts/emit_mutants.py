#!/usr/bin/env python3
"""Emit mutants.md from the manifests + counter receipts + selftest logs (rows first, then ratios)."""
import os, re

S = os.path.dirname(os.path.abspath(__file__))
SEAT = "/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-92/K92Mutation"

KILL = {
    "m01": "no indexed transcript holds a 24-char [A-Za-z0-9_-] run (host scan: runs are 20/21/22/28/30/32); stratum `redact` alone does not discriminate. Killer: a transcript with a run of exactly 24 (witness wit/run24.jsonl) — pristine `<redacted>`, mutant raw.",
    "m04": "55 indexed transcripts carry a `stopReason:length` turn (strata fallback,multi 38 / fallback 6 / fallback,aborted,multi 5 / clean 3 / fallback,aborted 1 / fallback,dead,multi 1 / errfix 1); A and C drew none. Real killer: RevC2Counter.jsonl (fallback,multi) — pristine answered 2 models fallback=true, mutant 1 model fallback=false.",
    "m06": "all 23206 indexed transcripts have a null-role first model_change (23139 carry a subagent: row later); the role filter is never exercised on the first row. Killer: a transcript whose first model_change carries a non-seat role (witness wit/firstrole.jsonl).",
    "m07": "wave mode only, and r91 w1 has 12 unique seat names. Killer: wave mode on a results.json naming a seat with 2 same-round same-lane hits — 14 such names exist (rounds 29,42,45,46,50,56,57,61,63,64); e.g. round-45 R45RevProvince: pristine 2026-10-27T03-03 (served), mutant 2026-10-26T15-10 (aborted). Synthetic witness w2/.",
    "m12": "no indexed assistant message has an empty/missing provider or model (host scan 0). Killer: constructed turn without provider (witness wit/pmguard.jsonl).",
    "m13": "no indexed transcript holds a non-object JSON line, and index92.tsv has no `parseerr` stratum at all (the C quota's 2 parseerr seats are unfillable). Killer: constructed file with a `[1,2]` line (witness wit/nonobj.jsonl).",
    "m14": "killer needs >=2 locate hits where path order conflicts with first-session-timestamp order; r91 seats are unique and the real R45RevProvince pair agrees on both keys. Killer: synthetic root w2/ (aaa195 newest ts, zzz195 greatest path).",
    "m16": "killer needs a same-name same-round file in ANOTHER lane with a greater timestamp; r91 names are unique. Killer: synthetic root w2/ (mmm195 tabi-shokunin, ts 2026-12).",
    "c01": "counter blind exactly as m01 (24-char run absent from corpus); the candidate's own --selftest catches it (`redact-23-24`).",
    "c04": "counter blind as m04 (55 real length transcripts undrawn) AND the candidate --selftest has no length case (PASS). Real killer: RevC2Counter.jsonl (answered 1 vs 2, fallback false vs true).",
    "c06": "counter blind as m06; --selftest PASS (its multicap case uses two subagent rows). Killer: first model_change with a non-seat role (wit/cand-firstrole.jsonl).",
    "c07": "counter blind (r91 names unique); --selftest catches it (`wave-newest-session`).",
    "c12": "counter blind (no empty provider/model in corpus); --selftest catches it (`unknown-model` -> `[/]`).",
    "c13": "counter blind (no non-object lines, no parseerr stratum); --selftest catches it (`parse-errors` 1 vs 2).",
    "c14": "counter blind AND --selftest PASS: path-only locate passes every selftest and every r91 seat. Killer: synthetic root w2/ (path order beats timestamp).",
    "c16": "counter blind (no foreign-lane same-name file in r91); --selftest catches it (`wave-lane-marker-miss`).",
    "c17": "counter blind AND --selftest PASS: no case has a credential run crossing the 120-char cut. Killer: wit/capcross.jsonl — pristine `<redacted>`, mutant leaks the first 20 of 40 credential chars.",
    "c19": "counter blind (no indexed first model_change carries role `default`; the selftest's default case is roleless) AND --selftest PASS. Killer: wit/defrole.jsonl (captured prov/def-model vs null).",
}

def rows(man, recdir, stest, label):
    out = []
    for line in open(man):
        mid, kind, src, edit = line.rstrip("\n").split("\t")
        rec = os.path.join(recdir, mid + ".txt")
        verdict = "MISSING-RECEIPT"
        if os.path.isfile(rec):
            verdict = [l for l in open(rec) if l.startswith("C92_C1:")][-1].strip()
        if stest is None:
            st = "n/a (frozen oracle has no --selftest)"
        else:
            p = os.path.join(stest, mid + ".txt")
            st = "MISSING"
            if os.path.isfile(p):
                tail = [l for l in open(p) if l.startswith("SEAT_ROUTE_SELFTEST:")]
                st = tail[-1].strip().replace("SEAT_ROUTE_SELFTEST: ", "") if tail else "no verdict"
        out.append((label, mid, edit, verdict, st))
    return out

py = rows(os.path.join(S, "manifest-py.tsv"), os.path.join(S, "receipts-py"), None, "oracle92")
js = rows(os.path.join(S, "manifest-mjs.tsv"), os.path.join(S, "receipts-mjs"),
          os.path.join(S, "selftest-mjs"), "seat-route")

lines = []
lines.append("# K92Mutation — mutation battery, round 92 claim C1 (`seat-route`)\n")
lines.append("Frozen ground truth: `probe/oracle92.py` sha256 `07e84a8f32356362b117520ae85101c2efe6d11a856afc278c9b54f270b0465d`,")
lines.append("counter `probe/probe92-c1.py` sha256 `323c0449b3360c0f73ea8d681a362a01b3b5c5abfac1737601153d719d55ca0d`.")
lines.append("Candidate `K92ExecTool/seat-route.mjs` sha256 `3b8b6ce072db381a52fda44dd78cd9936be5b3fefd19f758328fe82b06002608`")
lines.append("(READY line matches the bytes; baseline HELD `agree=133/133 A=61/61 C=60/60 W=12/12`, `--selftest PASS held=30/30`).\n")
lines.append("Every mutant is one single-point textual replacement of a pristine copy in scratch, asserted to")
lines.append("produce exactly one diff hunk and to compile (`python3 -m py_compile` / `node --check`); the")
lines.append("mutant sources are reproduced by `gen_oracle_mutants.py` / `gen_cand_mutants.py` (copied here).")
lines.append("Scored with the frozen counter, run form: `probe92-c1.py --tool <mutant> --index probe/index92.tsv")
lines.append("--sample-a probe/sampleA.tsv --waves .ufo/waves/round-91/w1-results.json --out <receipt>`.\n")

for label, data, title in (("oracle92", py, "Battery 1 — 17 mutants of the oracle's field readings"),
                           ("seat-route", js, "Battery 2 — 19 mutants of the candidate tool")):
    lines.append("## %s\n" % title)
    lines.append("| id | edit | counter verdict | counter | selftest |")
    lines.append("|---|---|---|---|---|")
    ck = cs = 0
    for lb, mid, edit, verdict, st in data:
        m = re.search(r"C92_C1: (HELD|UNMET) agree=(\d+)/(\d+) A=(\d+)/(\d+) C=(\d+)/(\d+) W=(\d+)/(\d+)", verdict)
        v = m.group(1) if m else "?"
        killed = v == "UNMET"
        ck += killed
        stk = st.startswith("FAIL")
        cs += stk
        cells = verdict.replace("|", "/")
        lines.append("| %s | %s | `%s` | %s | %s |" % (mid, edit, cells, "KILLED" if killed else "SURVIVED", st))
    lines.append("")
    n = len(data)
    lines.append("Counted from the rows above: counter killed **%d/%d** (%d survived)." % (ck, n, n - ck))
    if label == "seat-route":
        both = sum(1 for lb, mid, e, verdict, st in data
                   if re.search(r"C92_C1: UNMET", verdict) or st.startswith("FAIL"))
        lines.append("Selftest killed **%d/%d**; a mutant is scored killed when EITHER the counter or the"
                     " tool's own `--selftest` kills it: **%d/%d**, survivors of both **%d/%d**."
                     % (cs, n, both, n, n - both, n))
    lines.append("")

lines.append("## Survivors and the stratum that would kill them\n")
for label, data in (("oracle92", py), ("seat-route", js)):
    for lb, mid, edit, verdict, st in data:
        v = "HELD" if "HELD" in verdict else "UNMET"
        if v == "HELD" and not (lb == "seat-route" and st.startswith("FAIL")):
            lines.append("- **%s** (%s) — %s" % (mid, edit, KILL[mid]))
lines.append("")
lines.append("## Counter findings (not kill-rule events)\n")
lines.append("1. **HELD without implementing the definitions.** Eight oracle mutations and ten candidate")
lines.append("   mutations read `C92_C1: HELD agree=133/133` (rows above). Each omits or inverts one frozen")
lines.append("   field reading on inputs A, C and the r91 wave do not contain. The mechanism that lets them")
lines.append("   in is structural: every gap is a *stratum gap* — the 10-stratum draw never exercises a")
lines.append("   `length` turn, a 24-char credential run, a role-tagged first `model_change`, a non-object")
lines.append("   line (the `parseerr` stratum is empty in index92.tsv), an empty provider/model, a locate")
lines.append("   tie-break, or the lane marker. A candidate can therefore omit these readings and still be")
lines.append("   scored HELD; conversely the counter's C sample is keyed to the tool's own sha256, so a")
lines.append("   construction may enumerate self-hash variants and keep one whose C draw it passes.")
lines.append("2. **The positive control contradicts the plan text and the candidate.** `plan.md` freezes")
lines.append("   `captured` = model of the first `model_change` with role `subagent:<seat>`, and *if none*, of")
lines.append("   the first roleless/`default` one. oracle92.py enters the fallback whenever the subagent row's")
lines.append("   `model` is not a string (`captured = r.get(\"model\") if isinstance(...) else None; break` then")
lines.append("   `if captured is None:` re-scans). `K92ExecTool/seat-route.mjs` implements the text: on")
lines.append("   `wit/` fixture rows `{role:subagent:Seat, model:null}` then `{role:default, model:prov/default-model}`")
lines.append("   the candidate reads `captured=null`, the oracle reads `captured=\"prov/default-model\"`, so the")
lines.append("   definition-faithful tool is scored DISAGREE. No real transcript fires it today (23139 indexed")
lines.append("   transcripts carry a subagent: `model_change`, 0 have a non-string model on the first one) —")
lines.append("   latent, not live, until the round-92 wave writes such a row.")
lines.append("3. **Selftest gaps** (rows with `PASS` in Battery 2): c04 (`length`), c06 (role filter), c14")
lines.append("   (locate ignores timestamp), c17 (redact-vs-cut order), c19 (role `default`). c17 is the")
lines.append("   costly one: cutting before redaction leaks 20 of 40 credential chars (`wit/capcross.jsonl`).")
line = "\n".join(lines) + "\n"
os.makedirs(SEAT, exist_ok=True)
with open(os.path.join(SEAT, "mutants.md"), "w") as fh:
    fh.write(line)
print(line)
