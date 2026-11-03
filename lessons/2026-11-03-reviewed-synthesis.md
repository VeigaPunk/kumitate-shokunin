# Reviewed lesson: stale-worker effect boundaries, round 74

This original synthesis is a manual decision aid, not a claim that a specific queue or sink provides these properties. No external source capture, private oracle, runnable candidate, or original history is included.

A lease expiry, timeout, redelivery or cancellation request does not itself prove the earlier worker stopped or that its side effect did not occur. Acknowledged process termination is narrower than proof about descendants, in-flight requests and committed effects. Separate business-operation identity from delivery and attempt IDs; treat reuse of an operation key for different parameters as a conflict.

For an uncertain effect, inspect the actual sink contract. Durable duplicate suppression requires a suitably scoped operation key and atomic coupling between its recorded outcome and the effect. Stale-writer exclusion requires authority to be enforced atomically at the actual side-effect boundary, not only checked by the worker. Neither a fence nor cancellation undoes an earlier accepted effect. If the effect is unknown and no verified safe retry contract applies, reconcile or hold instead of blindly replaying. These controls do not alone prove end-to-end exactly-once effects.

The independently reviewed twelve-case manual exercise closed partial/not admitted: a required live source re-fetch was unavailable, a frozen-plan map check failed, and an isolated harm-matrix check could not run. A later prospective fixture did not convert the historical failure into a pass. No executable capability, score or runtime gain is claimed.
