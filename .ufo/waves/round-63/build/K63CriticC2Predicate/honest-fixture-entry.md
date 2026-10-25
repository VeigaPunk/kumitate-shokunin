<!-- FIXTURE ONLY. This is the honest baseline this seat built to measure the counter, not the lane's C2 entry.
     Two genuinely distinct documents (arXiv abs 2503.13657v3, Anthropic engineering post), 3 real quotes each,
     2 bullets minimum per row, version pinned in the URL. It reads TOPOLOGY63_HELD held=7/7 exit 0. -->

source: S196 — Why Do Multi-Agent LLM Systems Fail? (arXiv 2503.13657v3), https://arxiv.org/abs/2503.13657v3; S197 — How we built our multi-agent research system — Anthropic Engineering, https://www.anthropic.com/engineering/multi-agent-research-system
verified-at: 2026-10-25 (arXiv page served 2026-10-25; vendor post served 2026-10-25)
recheck: node .ufo/waves/round-63/probe/topology63-probe.mjs /home/vgpnk/Projects/shokunin/kumitate-shokunin <rev>

# Multi-agent coordinator topologies

A coordinator topology is the shape a lead agent imposes on its subagents: how work is decomposed, how
subagents are spawned and awaited, and where their outputs re-enter the coordinator's context. This is the
first entry of the frontier band *multi-agent coordinator topology*.

## What the sources ground

- **The measured row is a failure taxonomy, not a scaling win.** The v3 abstract reports MAST-Data (1600+ annotated traces, 7 frameworks) and MAST (14 failure modes, 3 categories), and states that gains on popular benchmarks are often minimal (S196).
- **The vendor's row is the coordinator contract in practice.** A lead agent decomposes the query, spawns subagents for independent directions, and waits for each set synchronously before proceeding — the synchronous-fan-out shape, stated as a current limitation (S197).
- **Both rows are opened this round and version-pinned.** S196 is pinned to arXiv v3 (2503.13657v3) and S197 is the vendor's own published post; the entry claims nothing outside those two documents.

## Located quotes

- S196 — "We introduce MAST-Data, a comprehensive dataset of 1600+ annotated traces collected across 7 popular MAS frameworks."
- S196 — "MAST-Data is the first multi-agent system dataset to outline the failure dynamics in MAS for guiding the development of better future systems."
- S196 — "This process identifies 14 unique modes, clustered into 3 categories: (i) system design issues, (ii) inter-agent misalignment, and (iii) task verification."
- S197 — "A multi-agent system consists of multiple agents (LLMs autonomously using tools in a loop) working together."
- S197 — "In our data, agents typically use about 4× more tokens than chat interactions, and multi-agent systems use about 15× more tokens than chats."
- S197 — "Currently, our lead agents execute subagents synchronously, waiting for each set of subagents to complete before proceeding."
