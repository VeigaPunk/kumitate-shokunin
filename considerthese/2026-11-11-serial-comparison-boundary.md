# Kumitate serial counters need a comparison contract

[RFC 1034](https://www.rfc-editor.org/rfc/rfc1034.html), November 1987, section 4.3.5 already warns that old zone copies must expire before serials advance halfway around their range.

Elz and Bush's [RFC 1982](https://www.rfc-editor.org/rfc/rfc1982.html), August 1996, sections 3 and 7, supplies the missing arithmetic definition. For DNS's 32 bit serials, an increment above 2147483647 is undefined. Values exactly 2147483648 apart are unequal, but their ordering is undefined. Small successive increments can also leave an old observer outside the usable comparison window.

The transition formalizes an existing wraparound requirement; it does not invent rollover or guarantee globally sortable versions.

Kumitate analogy: before using finite worker generations to reject stale reports, specify width, comparison and retention bounds. A larger displayed integer need not mean newer. This extends recipient fencing with representation limits; it does not establish that the harness uses DNS arithmetic.

Both memos permit unlimited distribution; no blanket software or training license inferred. Original commentary only. No runtime test, training or assimilation.

Destination: VeigaPunk/kumitate-shokunin, master, considerthese/2026-11-11-serial-comparison-boundary.md.
