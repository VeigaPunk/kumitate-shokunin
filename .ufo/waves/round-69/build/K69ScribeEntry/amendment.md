
## Capture origin

Amendment 2026-10-30: capture origin is now origin-authenticated — the M69 rule fetches every cited and mirror URL live at counting time and requires each fetched sha256 to equal the committed capture's sha256, so provenance rests on the source's current bytes rather than on the lane's own records. Pins alone prove nothing — capture hashes recorded in the lane are self-asserted and recomputable (the round-68 lesson `self-asserted-source-capture`) — so each non-content-pinned site page (S207, S208, S211) names a commit-pinned upstream mirror row (S214, S215, S216) captured and pinned like every cited row.

- S207 — capture 2026-10-27 — mirror S214
- S208 — capture 2026-10-27 — mirror S215
- S209 — capture 2026-10-27 — pinned
- S210 — capture 2026-10-27 — pinned
- S211 — capture 2026-10-27 — mirror S216
- S212 — capture 2026-10-27 — pinned
- S213 — capture 2026-10-27 — pinned
