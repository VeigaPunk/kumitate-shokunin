// Round-70 wave reconciliation — seat state derivation (v2 schema, seat K70ScribeWaveCensus).
// Pure function of the recorded per-seat signals. No I/O, no live process state.
//
// Dead vs unknown rule (the round-69 gap):
//   dead    = positive start evidence (dispatch instance id OR settle session id)
//              AND no collected results entry AND no report file on disk
//   unknown = no start evidence AND no results entry AND no report file
//            (also used when the collector explicitly recorded settle.status="unknown")
// The two classes differ only in start evidence; neither may be inferred from a
// live process that no longer exists at close time.

export const STATES = [
  "pending-collection",
  "reconciled",
  "partial_result_only",
  "partial_report_only",
  "empty_output",
  "error",
  "dead",
  "unknown",
];

export function hasStartEvidence(s) {
  return !!(s && s.dispatch && s.dispatch.instance) || !!(s && s.settle && s.settle.session);
}

export function deriveState(s) {
  if (!s) return "unknown";
  const hasEntry = !!(s.result && s.result.present === true);
  const nonempty = hasEntry && typeof s.result.output_bytes === "number" && s.result.output_bytes > 0;
  const empty = hasEntry && s.result.output_bytes === 0;
  const status = s.settle && s.settle.status;
  const reportPresent = !!(s.report && s.report.present);
  const trailerOk = !!(s.trailer && s.trailer.resolves === true && s.trailer.matches_seat === true);
  // A missing trailer is a disclosed gap (mismatch TRAILER_MISSING), not an integrity failure:
  // sibling wave-1 reports use several different trailer forms and many use none.
  // A trailer that resolves but points at another seat's report IS an integrity failure.
  const trailerForeign = !!(s.trailer && s.trailer.declared !== null && s.trailer.declared !== undefined && !trailerOk);

  if (status === "settled" && nonempty && reportPresent && !trailerForeign) return "reconciled";
  if (status === "error" || status === "timeout") return "error";
  if (status === "settled" && nonempty) return "partial_result_only";
  if (status === "settled" && empty) return "empty_output";
  if (!hasEntry && reportPresent) return "partial_report_only";
  if (!hasEntry && hasStartEvidence(s)) return "dead";
  return "unknown";
}
