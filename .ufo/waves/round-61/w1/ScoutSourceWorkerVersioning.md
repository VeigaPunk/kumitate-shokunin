# ScoutSourceWorkerVersioning — round 61 / w1 seat report

Milestone: **source S195 open.** The source was fetched, saved, hashed, and quoted.

- Findings: `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/findings.md`
- Body: `.ufo/waves/round-61/build/ScoutSourceWorkerVersioning/body.md`
- URL: https://docs.temporal.io/worker-versioning.md (in llms.txt:147)
- Accessed: 2026-10-25. HTTP 200, `text/markdown; charset=utf-8`, fetched with curl, `last-modified` 2026-10-24.
- Size: 9645 bytes. sha256 `8ef2ee5f5e196d9d14fc8c85449442764e812f3e4f0f6e2bb1bdc12895f0f8fc`
- Quote (§ Pinned Workflows: heading at body.md:37, sentence at body.md:39, 13 words, appears once): "A **Pinned** Workflow is guaranteed to complete on a single Worker Deployment Version."

Key facts are in findings.md, each with a body.md line number:
- Pinned vs Auto-Upgrade. Auto-Upgrade has to be kept replay-safe by hand with patching.
- Draining and Drained states.
- Inheritance rules:
  - Auto-Upgrade runs never inherit a version.
  - The Pinned version carries across the continue-as-new chain.
  - A retry inherits the version only under three joint conditions.
  - Cron runs never inherit.
  - A pinned override takes precedence.

One [INFERENCE] gap is flagged: the page doesn't say what version a retry of a top-level Pinned run lands on.

I did not write to SOURCES. No tools were installed. Scratch files are in /tmp/kumitate-r61/ScoutSourceWorkerVersioning/ (response headers).
