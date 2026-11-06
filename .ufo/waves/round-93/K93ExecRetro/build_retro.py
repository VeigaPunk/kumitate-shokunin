#!/usr/bin/env python3
"""Build retro-oracle.tsv + per-wave counts from oracle93.py --results output.

Reference = FROZEN oracle93.py. Table columns exactly as the seat spec names them:
seat, role, resolved (configured), chain length, answered, superseded_by, upstream,
error_attempts, recovered_attempts, flag_hops, revert_hops, final.

Comparison rule (spec): model identity is compared with the `:level` suffix stripped.
"""
import json, os, sys

LEVEL_STRIP_NOTE = "model comparison strips a trailing ':level' suffix (split(':',1)[0])"
ROUNDS = range(85, 93)


def strip(model):
    return model.split(":", 1)[0] if isinstance(model, str) else model


def main(srcdir, outtsv):
    rows = []
    per_wave = {}
    for n in ROUNDS:
        p = os.path.join(srcdir, "o%d.json" % n)
        if not os.path.exists(p):
            continue
        recs = json.load(open(p))
        wave = {"seats": 0, "located": 0, "absent": 0, "not_resolved_model": [],
                "unrecovered": [], "aggregator": [], "error_total": 0, "recovered_total": 0,
                "upstreams": [], "flag_total": 0, "revert_total": 0, "dead": [], "zero_served": [],
                "fallback_captured": [], "resolved_ne_captured": []}
        for r in recs:
            wave["seats"] += 1
            if r.get("final") == "absent" and r.get("session") is None:
                wave["absent"] += 1
                rows.append([str(n), r["seat"], str(r.get("role")), "-", "0", "-", "-", "-", "-", "-", "-", "-", "absent"])
                continue
            wave["located"] += 1
            resolved = r.get("resolved")
            chain = r.get("chain")
            answered = r.get("answered") or []
            ea = r.get("error_attempts", 0)
            ra = r.get("recovered_attempts", 0)
            up = r.get("upstream") or []
            sb = r.get("superseded_by") or []
            if r.get("final") == "dead":
                wave["dead"].append(r["seat"])
            if not answered:
                wave["zero_served"].append(r["seat"])
            if r.get("fallback"):
                wave["fallback_captured"].append(r["seat"])
            if strip(resolved) != strip(r.get("captured")):
                wave["resolved_ne_captured"].append((r["seat"], resolved, r.get("captured")))
            wave["error_total"] += ea
            wave["recovered_total"] += ra
            wave["flag_total"] += r.get("flag_hops", 0)
            wave["revert_total"] += r.get("revert_hops", 0)
            for u in up:
                if u not in wave["upstreams"]:
                    wave["upstreams"].append(u)
            # (2a) answering model != resolved model (level suffix stripped)
            if resolved and answered:
                if all(strip(a) != strip(resolved) for a in answered):
                    wave["not_resolved_model"].append((r["seat"], resolved, answered[-1]))
            # (2b) error_attempts > 0 and recovered_attempts == 0
            if ea > 0 and ra == 0:
                wave["unrecovered"].append((r["seat"], ea))
            # (2c) served through an aggregator
            if up:
                wave["aggregator"].append((r["seat"], up))
            rows.append([str(n), r["seat"], str(r.get("role")), str(resolved), str(len(chain) if isinstance(chain, list) else "null"),
                         ";".join(answered) or "-", ";".join(sb) or "-", ";".join(up) or "-", str(ea), str(ra),
                         str(r.get("flag_hops", 0)), str(r.get("revert_hops", 0)), str(r.get("final"))])
        per_wave[n] = wave

    hdr = ["wave", "seat", "role", "resolved", "chain_len", "answered", "superseded_by", "upstream",
           "error_attempts", "recovered_attempts", "flag_hops", "revert_hops", "final"]
    with open(outtsv, "w") as fh:
        fh.write("# oracle93.py reference reading; " + LEVEL_STRIP_NOTE + "\n")
        fh.write("\t".join(hdr) + "\n")
        for r in rows:
            fh.write("\t".join(r) + "\n")

    print("LEVEL RULE:", LEVEL_STRIP_NOTE)
    print("%-4s %-6s %-6s %-6s %-12s %-12s %-12s %-6s %-6s %s" %
          ("wave", "seats", "loc", "absent", "not_resolved", "unrecovered", "aggregator", "err", "recov", "upstreams"))
    for n in sorted(per_wave):
        w = per_wave[n]
        print("%-4d %-6d %-6d %-6d %-12d %-12d %-12d %-6d %-6d %s" %
              (n, w["seats"], w["located"], w["absent"], len(w["not_resolved_model"]),
               len(w["unrecovered"]), len(w["aggregator"]), w["error_total"], w["recovered_total"],
               ",".join(w["upstreams"]) or "-"))
        for tag, key in (("not_resolved", "not_resolved_model"), ("unrecovered", "unrecovered"), ("aggregator", "aggregator")):
            for item in w[key]:
                print("    %s %s" % (tag, item))
        print("    flag_hops=%d revert_hops=%d" % (w["flag_total"], w["revert_total"]))
    cols = ["seats", "located", "dead", "zero_served", "not_resolved_model", "fallback_captured",
            "resolved_ne_captured", "unrecovered", "aggregator", "error_total", "recovered_total",
            "flag_total", "revert_total"]
    with open(outtsv.replace(".tsv", "-counts.tsv"), "w") as fh:
        fh.write("# oracle93.py counts per wave; level-suffix rule: split(':',1)[0]\n")
        fh.write("wave\t" + "\t".join(cols) + "\n")
        for n in sorted(per_wave):
            w = per_wave[n]
            fh.write("%d\t" % n + "\t".join(
                str(len(w[c]) if isinstance(w[c], list) else w[c]) for c in cols) + "\n")
    json.dump({str(k): v for k, v in per_wave.items()}, open(outtsv.replace(".tsv", ".counts.json"), "w"), indent=1, sort_keys=True)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1], sys.argv[2]))
