import csv, os, sys
B = sys.argv[1]
obs = {}
for r in csv.DictReader(open(os.path.join(B,'observed.tsv'), encoding='utf-8'), delimiter='\t'):
    obs[(r['rev'], r['script'])] = r
# (doc_ref, subject script, claimed, class, observed_key, verdict, note)
CLAIMS = [
 # ---- LIVE: SKILL.md gate registry (present tense, current tree) ----
 ("SKILL.md:611","omp-census.mjs","29 hermetic cases","LIVE",("base","omp-census.mjs"),"MATCH",""),
 ("SKILL.md:612","cap-run.mjs","CAP_RUN_SELFTEST: 12/12 pass","LIVE",("base","cap-run.mjs"),"MATCH",""),
 ("SKILL.md:614","receipt-evidence.mjs","RECEIPT_EVIDENCE_SELFTEST: PASS (10/10)","LIVE",("base","receipt-evidence.mjs"),"MATCH",""),
 ("SKILL.md:618","receipt-attest.mjs","ATTEST_SELFTEST: PASS; 51 hermetic cases","LIVE",("base","receipt-attest.mjs"),"MATCH",""),
 ("SKILL.md:619","counter-pins.mjs","COUNTER_PINS_SELFTEST: PASS (11/11)","LIVE",("base","counter-pins.mjs"),"MATCH",""),
 ("SKILL.md:620","source-capture.mjs","SOURCE_CAPTURE_SELFTEST: PASS (13/13)","LIVE",("base","source-capture.mjs"),"MATCH",""),
 ("SKILL.md:622","source-dupes.mjs","SOURCE_DUPES_SELFTEST: PASS (12/12)","LIVE",("base","source-dupes.mjs"),"MATCH",""),
 ("SKILL.md:624","readme-map.mjs","README_MAP_SELFTEST: PASS (16/16)","LIVE",("base","readme-map.mjs"),"MATCH",""),
 ("SKILL.md:625","cite-sources.mjs","CITE_SOURCES_SELFTEST: PASS (8/8)","LIVE",("base","cite-sources.mjs"),"MATCH",""),
 ("SKILL.md:626","dispatch-evidence.mjs","DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)","LIVE",("base","dispatch-evidence.mjs"),"MATCH",""),
 ("SKILL.md:627","inline-dispatch-evidence.mjs","INLINE_DISPATCH_SELFTEST: PASS (69/69)","LIVE",("base","inline-dispatch-evidence.mjs"),"MATCH",""),
 ("SKILL.md:628","plan-before-ready.sh","10 cases; PLAN_BEFORE_READY_SELFTEST: PASS (10/10)","LIVE",("base","plan-before-ready.sh"),"MATCH",""),
 # ---- LIVE: SCORECARD capability table ----
 ("SCORECARD.md:1779","sources-check.mjs","--selftest 46/46","LIVE",("base","sources-check.mjs"),"MATCH",""),
 ("SCORECARD.md:1782","omp-census.mjs","--selftest 29 cases PASS","LIVE",("base","omp-census.mjs"),"MATCH",""),
 ("SCORECARD.md:1783","cap-run.mjs","CAP_RUN_SELFTEST: 10/10 pass","LIVE",("base","cap-run.mjs"),"MISMATCH","stale by two cases (round-50 root-bind arms); SKILL.md:612 says 12/12"),
 ("SCORECARD.md:1787","counter-rerun.mjs","COUNTER_RERUN_SELFTEST: PASS","LIVE",("base","counter-rerun.mjs"),"MATCH",""),
 ("SCORECARD.md:1788","receipt-attest.mjs","ATTEST_SELFTEST: PASS exit 0 (27 cases)","LIVE",("base","receipt-attest.mjs"),"MISMATCH","stale by 24 cases (round-53 v3 arms); SKILL.md:618 says 51"),
 ("SCORECARD.md:1791","counter-pins.mjs","COUNTER_PINS_SELFTEST: PASS (11/11)","LIVE",("base","counter-pins.mjs"),"MATCH",""),
 ("SCORECARD.md:1792","source-capture.mjs","SOURCE_CAPTURE_SELFTEST: PASS (13/13)","LIVE",("base","source-capture.mjs"),"MATCH",""),
 ("SCORECARD.md:1793","source-dupes.mjs","SOURCE_DUPES_SELFTEST: PASS (12/12)","LIVE",("base","source-dupes.mjs"),"MATCH",""),
 ("SCORECARD.md:1794","readme-map.mjs","README_MAP_SELFTEST: PASS (16/16)","LIVE",("base","readme-map.mjs"),"MATCH",""),
 ("SCORECARD.md:1795","receipt-evidence.mjs","RECEIPT_EVIDENCE_SELFTEST: PASS (10/10)","LIVE",("base","receipt-evidence.mjs"),"MATCH",""),
 ("SCORECARD.md:1796","cite-sources.mjs","CITE_SOURCES_SELFTEST: PASS (8/8)","LIVE",("base","cite-sources.mjs"),"MATCH",""),
 ("SCORECARD.md:1797","dispatch-evidence.mjs","DISPATCH_EVIDENCE_SELFTEST: PASS (8/8)","LIVE",("base","dispatch-evidence.mjs"),"MATCH",""),
 ("SCORECARD.md:1798","inline-dispatch-evidence.mjs","INLINE_DISPATCH_SELFTEST: PASS (69/69)","LIVE",("base","inline-dispatch-evidence.mjs"),"MATCH",""),
 # ---- LIVE: corpus/QUALITY.md standing command lines ----
 ("corpus/QUALITY.md:870","source-capture.mjs","SOURCE_CAPTURE_SELFTEST: PASS (13/13)","LIVE",("base","source-capture.mjs"),"MATCH",""),
 ("corpus/QUALITY.md:872","source-capture.mjs","the gate's 13-case hermetic selftest","LIVE",("base","source-capture.mjs"),"MATCH",""),
 ("corpus/QUALITY.md:877","source-dupes.mjs","SOURCE_DUPES_SELFTEST: PASS (12/12)","LIVE",("base","source-dupes.mjs"),"MATCH",""),
 ("corpus/QUALITY.md:879","source-dupes.mjs","the gate's 12-case hermetic selftest","LIVE",("base","source-dupes.mjs"),"MATCH",""),
 ("corpus/QUALITY.md:884","readme-map.mjs","README_MAP_SELFTEST: PASS (14/14)","LIVE",("base","readme-map.mjs"),"MISMATCH","stale by two cases (readme-map v2, round 58); SKILL.md:624 and SCORECARD.md:1794 say 16/16"),
 ("corpus/QUALITY.md:886","readme-map.mjs","the gate's 14-case hermetic selftest","LIVE",("base","readme-map.mjs"),"MISMATCH","same stale figure as :884"),
 ("corpus/QUALITY.md:970","plan-before-ready.sh","PLAN_BEFORE_READY_SELFTEST: PASS (10/10)","LIVE",("base","plan-before-ready.sh"),"MATCH",""),
 # ---- LIVE: most recent round entry ----
 ("LOG.md:2304","inline-dispatch-evidence.mjs","69-case selftest","LIVE",("base","inline-dispatch-evidence.mjs"),"MATCH","round-63 close entry"),
 # ---- HISTORICAL, revision-stamped ----
 ("corpus/QUALITY.md:358","gate-mutants.mjs","GATE_MUTANTS_SELFTEST: 28/28 pass (at e5ffcbe)","HISTORICAL",("base","gate-mutants.mjs.at-e5ffcbe"),"MATCH","re-ran at e5ffcbe: 28/28; live suite is 41/41"),
 ("corpus/QUALITY.md:365","gate-mutants.mjs","Clean selftest 28/28 (at e5ffcbe)","HISTORICAL",("base","gate-mutants.mjs.at-e5ffcbe"),"MATCH","same run"),
 ("SCORECARD.md:1780","wave-census.mjs","--selftest 26/26 at the attempt-2 tip","HISTORICAL",("base","wave-census.mjs"),"STALE-IF-CURRENT","stamped at the round-41 attempt-2 tip; base reads 32/32"),
 # ---- PLACEHOLDER (no falsifiable tally) ----
 ("SKILL.md:608","anchor-truth.mjs","ANCHOR_TRUTH_SELFTEST: n/m","PLACEHOLDER",("base","anchor-truth.mjs"),"UNFALSIFIABLE","observed 44/44"),
 ("SKILL.md:609","wave-census.mjs","WAVE_CENSUS_SELFTEST: n/m","PLACEHOLDER",("base","wave-census.mjs"),"UNFALSIFIABLE","observed 32/32"),
 ("SKILL.md:610","gate-mutants.mjs","GATE_MUTANTS_SELFTEST: n/m","PLACEHOLDER",("base","gate-mutants.mjs"),"UNFALSIFIABLE","observed 41/41"),
 ("SKILL.md:616","bind-oracle.mjs","BIND_ORACLE_SELFTEST: n/7 pass","PLACEHOLDER",("base","bind-oracle.mjs"),"UNFALSIFIABLE","observed 7/7"),
 # ---- OTHER QUANTITY (mutant battery, not suite size) ----
 ("SKILL.md:601","cite-check.mjs","16 conditions; survived=0/16 (mutant battery)","OTHER-QUANTITY",("base","cite-check.mjs"),"N/A","suite is 76/76; the 16 is the round-41 mutant manifest"),
 ("SCORECARD.md:1781","gate-mutants.mjs","frozen=41/41 (mutant ids)","OTHER-QUANTITY",("base","gate-mutants.mjs"),"N/A","mutant-battery count, not a suite tally"),
]
w = csv.writer(open(os.path.join(B,'calibration.tsv'),'w',encoding='utf-8'), delimiter='\t', lineterminator='\n')
w.writerow(['doc_ref','subject_script','claimed','class','observed_line','observed_exit','verdict','note'])
for ref, subj, claimed, cls, key, verdict, note in CLAIMS:
    r = obs.get(key)
    obsline = r['tally_line'] if r else '<not run>'
    exitc = r['exit'] if r else '?'
    w.writerow([ref, subj, claimed, cls, obsline, exitc, verdict, note])
counts = {}
for c in CLAIMS: counts[c[5]] = counts.get(c[5],0)+1
print('rows', len(CLAIMS), counts)
