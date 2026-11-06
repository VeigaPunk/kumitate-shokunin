# K93Scout — trailer extracted by the L1 (KumitateR93) from w1-results.json; the seat wrote no trailer of its own (r92 debt 3 repeated, recorded in the lesson)

Source: .ufo/waves/round-93/w1-results.json results[name=K93Scout].output, verbatim below.

```json
{
  "seat": "K93Scout",
  "axis": "source faithfulness of the round-93 v2 field definitions",
  "upstream_sha": "79fa222e8390aed3494f4bc6746814e6c74c21cf",
  "upstream_tarball_sha256": "d2b38d3b3820e1e6f061032b0444fb7464569e691d7a571b89fc1fb4acf9222a",
  "lane_captures_identical_to_upstream": true,
  "verdict": "every v2 field definition traced to its upstream writer site; 1 in-definition divergence (naming), 4 routed notes, no value divergence",
  "in_definition": [
    {
      "id": "D1",
      "finding": "superseded_by name is inverted relative to upstream vocabulary: retryRecovery.supersededBy is written ONLY on the status:'recovered' arm (ai/src/types.ts:1263-1284; writer coding-agent/src/session/turn-recovery.ts:1043-1051); the status:'superseded' arm (turn-recovery.ts:1053-1060) carries no such key. The field lists the SUCCESSOR of a failed attempt while its name reads as 'the model that superseded me' (upstream's 'superseded' sense).",
      "host_evidence": "recovered 26582 rows all carry supersededBy; superseded 785 rows all lack it; 0 exceptions either way",
      "values_correct": true,
      "kill_c_material": false,
      "kill_c_reason": "kill (c) requires a shipped record contradicting a field definition; no record does"
    }
  ],
  "out_of_definition": [
    {
      "id": "D2",
      "finding": "plan freezes resolved/chain to the FIRST session_init row; upstream's canonical reader extractSessionInit (session-manager.ts:4798) and its newer-init writer (agent-session.ts:7274) use LAST.",
      "host_evidence": "0 of 26875 lane files (0 of 28032 root, 0 of 61 A-set) differ between FIRST and LAST; 12719 files hold >1 init row and the newer row carries resolvedModel/retryFallback through unchanged",
      "latent": true
    },
    {
      "id": "D3",
      "finding": "chain excludes upstream's retryFallback.primary by design (retry-fallback-chains.ts:185-190); primary == resolvedModel in 26845 of 26854 host rows, so resolved+chain together carry upstream's primary+chain pair"
    },
    {
      "id": "D4",
      "finding": "upstreamProvider is set by exactly one provider file (ai/src/providers/openai-completions.ts:1441-1444, aggregator chunk provider field); openai-responses.ts only clears/restores it. An empty upstream means 'provider did not report one', not 'no aggregator'."
    }
  ],
  "verified_faithful": [
    "error_attempts: one persisted error row per failed ATTEMPT (writer turn-recovery.ts:985/948/952/3124)",
    "recovered_attempts: exactly two upstream statuses exist (types.ts:1263-1284); host 26582 recovered / 785 superseded, no other value, 0 on served turns",
    "upstream",
    "flag_hops: resolvedModelIsFallback is boolean with false default (session-manager.ts:3687); host 18499 true / 54183 false / 0 absent; every true row also carries role fallback",
    "revert_hops: revert-to-primary reuses role fallback without the flag (turn-recovery.ts:2617); 361/361 such host rows carry exactly the model in effect before the preceding fallback hop",
    "resolved/chain shape",
    "the ? model rule"
  ],
  "version_skew": {
    "host": "omp/18.15.0",
    "upstream": "79fa222e = 18.17.0 (v18.17.0 tag = 75e7801e; plan SHA is main, one commit ahead)",
    "material": false,
    "reason": "v2-relevant declarations byte-identical across versions (AssistantRetryRecovery, upstreamProvider, SessionInitEntry.resolvedModel/retryFallback, EPHEMERAL_MODEL_CHANGE_ROLE, RetryFallbackRole, retryRecovery writer block turn-recovery.ts:1015-1070 diff identical, three appendModelChange fallback sites); the 18.15.0<->18.17.0 turn-recovery.ts diff is confined to billing-cap backoff (isBillingCapUsageLimit, 18.17 :2953-2960), which changes when a saga gives up not what is written"
  },
  "host_counts": {
    "retryRecovery_dicts_on_error_turns": 27367,
    "retryRecovery_on_served_turns": 0,
    "retryRecovery_nondict": 0,
    "bad_supersededBy_provider_or_model": 0,
    "model_change_rows": 72682,
    "upstreamProvider_turns": "3400 (single value 'Stealth'; 3 on non-served stops)",
    "init_rows_with_retryFallback_dict": "26854 (all with string primary)",
    "init_rows_retryFallback_not_dict": 21,
    "init_count_histogram": {
      "1": 14156,
      "2": 10787,
      "3": 1573,
      "4": 309,
      "5": 37,
      "6": 10,
      "7": 1,
      "8": 2
    },
    "files_first_init_differs_from_last": 0
  },
  "kill_rule_crosscheck": {
    "candidate": ".ufo/waves/round-93/K93ExecTool/seat-route.mjs sha256 98a5a3a341b2b41540206caa5378d2ff5dacf02015f8aedf160b9d0f72b6efe9 (= its READY)",
    "byte_grep_round93_oracle93_probe93_fixtures": "0 each",
    "imports": "node: builtins only"
  },
  "extra_note_for_lane_owner": "candidate's captured falls back to the default row when a subagent:<seat> row's model is not a string, while shipped v1 (cd7ee03d, scripts/seat-route.mjs:299) keeps captured=null; the frozen oracle (oracle93.py:69-75, oracle92.py:57-65) matches the candidate. Host incidence 0 (26853 files carry a subagent: row, none with a non-string model) and 0 captured differences over the 61 A-set transcripts. Touches no v2 field.",
  "produced": [
    ".ufo/waves/round-93/K93Scout/recon.md",
    ".ufo/waves/round-93/K93Scout/receipt-census-1500.txt",
    ".ufo/waves/round-93/K93Scout/receipt-lane-retryRecovery.txt",
    ".ufo/waves/round-93/K93Scout/receipt-lane-modelChange.txt",
    ".ufo/waves/round-93/K93Scout/receipt-lane-inits.txt",
    ".ufo/waves/round-93/K93Scout/receipt-A-set-inits.txt",
    ".ufo/waves/round-93/K93Scout/receipt-revert-pair.txt",
    ".ufo/waves/round-93/K93Scout/receipt-primary-vs-resolved.txt",
    ".ufo/waves/round-93/K93Scout/receipt-status-split.txt",
    ".ufo/waves/round-93/K93Scout/receipt-attempt-rows.txt",
    ".ufo/waves/round-93/K93Scout/{census93,rr_lane,mc_census,probe_inits,revert_pair,revert_class,stat_split,attempt_rows,primary_check,checkA}.py",
    ".ufo/waves/round-93/w1/K93Scout.md"
  ],
  "scratch_removed": "/fast/scratch/hyaku/kumitate-r93/K93Scout",
  "lane_writes": "only this seat dir and w1/K93Scout.md",
  "confidence": [
    "high: writer-site citations (every cited file:line read in the fetched tree; lane captures byte-identical to it)",
    "high: host counts (deterministic-seed scripts in the seat dir, counts only, no transcript content copied)",
    "medium: D1's classification (values provably right; whether the inverted name is kill-(c) material is the lane owner's judgement)",
    "medium: D2's latency (FIRST!=LAST unobservable today)"
  ]
}
```
