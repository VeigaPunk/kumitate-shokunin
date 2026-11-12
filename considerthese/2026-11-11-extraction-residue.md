# Kumitate: rejection does not roll extraction back

[PEP 706](https://peps.python.org/pep-0706/), created 9 February 2023, introduced extraction filters for Python 3.12. [Python documentation](https://docs.python.org/3.14/library/tarfile.html) records the default changing from fully_trusted to data in 3.14.

The filter runs immediately before each member, considering the filesystem then present. Rejection can abort extraction or skip a member according to errorlevel. Aborting can leave earlier members extracted; extractall performs no cleanup. This boundary predates the safer default.

Kumitate inference: record accepted members, completion and cleanup separately. Stage into a fresh directory and verify completeness before declaring worker input ready. A rejection is not evidence that nothing changed. This extends path-resolution guidance with partial-write lifecycle.

Selected documentation only; the served 3.14.10 page includes unreleased changes. No extraction tested or assimilation performed. Filters do not prevent resource exhaustion.

PEP rights: public domain or CC0. Documentation [terms](https://docs.python.org/3.14/license.html): PSF License 2, with retained notices and change summaries for derivatives. Original commentary; no copied examples.

Destination: VeigaPunk/kumitate-shokunin, master, considerthese/2026-11-11-extraction-residue.md.
