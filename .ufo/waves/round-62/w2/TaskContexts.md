# W2 dispatch context — absolute-path misroot risk

## Counterexample

The generated round-62 wave context explicitly instructs seats to write their report at a **lane-relative** path, while this runtime starts seat tools at the fleet root. Any seat obeying the context literally may create `.ufo/waves/round-62/w2/<name>.md` in the fleet repository instead of the lane repository. The task-item prose does not repair this: it names absolute paths for the attacked source, but says only “Do not touch lane files except your report,” without giving an absolute report destination.

## Evidence

`/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-62/w2-dispatch.json`, context field (committed/generated dispatch artifact):

> Produce report at lane root path `.ufo/waves/round-62/w2/<name>.md`.

The same dispatch context only says “Work only in lane repo”; it does not state the lane's absolute path or translate the `Report:` trailer / relative path. The parent prompt `/home/vgpnk/Projects/shokunin/.ufo/prompts/kumitate-round-62.md` §6 lines 265–272 explicitly records the known hazard: seat tools start at fleet root; every wave context and item must name absolute lane paths; and relative `Report:` trailer paths must be translated to an absolute lane destination.

Observed delivered report `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-62/w2/CriticC1.md` exists at the intended lane path and says at lines 5–6 that it was read-only and that paths are relative to the lane root `/home/vgpnk/Projects/shokunin/kumitate-shokunin`. This is evidence that this particular report reached the lane, but not that the context safely directed all seats: the delivery path may have come from per-seat behavior or external report handling. No fleet-root copy of this report was established in this review.

## Impacted axes

Operability / orchestration reliability and evidence provenance: relative destinations make report placement dependent on implicit working-directory behavior. No claim verdict is made; round-62 plan is absent, as also noted in the delivered CriticC1 report §0.

## Smallest safe correction

In the generated wave context and each report-writing task, state the absolute report path under `/home/vgpnk/Projects/shokunin/kumitate-shokunin/.ufo/waves/round-62/w2/` (or explicitly instruct seats to prepend that absolute lane root to the `Report:` trailer). Then inspect fleet-root untracked outputs for content-matched misroots before closure, following parent prompt §6 lines 280–287.
