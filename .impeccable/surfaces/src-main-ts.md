---
version: 1
slug: "src-main-ts"
primary_target: "src/main.ts"
related_targets: ["src/style.css","src/documentary.ts"]
---

# Navigation redesign
Mode: Operate. User requests Impeccable modernisation of the entire navigation UI and usability review. Catalan copy and historical/geographic content are retained. Map-first is the working assumption while the optional priority question is pending. This is an authorised interface redesign, implemented code-first.

## Direction contract
THESIS: Explore place and time without a permanent reading sidebar or scattered control islands; the landscape is the workspace and the timeline is its common anchor.
OWN-WORLD: Contemporary Catalan cultural publication typography, translated to a functional product: crisp DM Sans, blue ink, cool white panels, a deeply coloured navigation band, consistent 44px controls and restrained corners. No parchment or display serifs.
STORY: Choose a place, move freely, change the date, open the relevant story or evidence, or start the single guided documentary.
FIRST VIEWPORT: Compact top navigation; full-width 3D map; places and layers at the top corners; zoom and movement tools grouped; fixed chronological ruler below with editable year, event navigation, story disclosure and prominent guided-tour action. Mobile keeps map, time and primary action visible, with scrollable contextual sheets.
FORM: Grounded candidate 5, contemporary Swiss-influenced Catalan cultural typography. Seed 8a16feb9, direction/operate, code-led. Signature: a continuously filled chronological ruler linked to the year, event and landscape. Standard web controls carry every action. Physical scene: residents and visitors exploring a laptop or phone in ordinary daylight; high-contrast light reading panels over the landscape.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Decision rationale
Grounded candidates were civic wayfinding, museum archive labels, cartographic atlas, refuge signage, contemporary cultural typography, cinematheque programme and public ceramic wayfinding. The assigned fifth direction owns the build. Challenger assessment: emission rail declined (clarity needs labelled controls; keep its disciplined alignment); boarding pass declined (travel semantics mislead; keep persistent selection feedback); Saville catalogue declined (coded labels obstruct names; keep clear visual hierarchy); botanical folio competitive in temporal continuity but loses modern operating clarity (keep stable geographic framing); Crouwel competitive in type discipline but its construction grid is unnecessary here (keep systematic spacing); star atlas declined (night-reading assumptions do not match daylight exploration; keep progressive disclosure of layers). No borrowed ornament. The user authorised redesign; no additional approval gate is imposed.

## Interaction acceptance
One contextual panel at a time; Escape and close return focus; clicking outside dismisses without consuming map gestures. Search places with accent-insensitive matching and an empty state. Correct view labels on all navigation. Year entry available on mobile with validation, keyboard-friendly timeline and bounded previous/next. Restore guided-tour focus and protect controls during fullscreen fallback. Preserve provenance and distinguish reconstructed/current layers. Cover loading, failure/retry, reduced motion, 320px and landscape layouts. No hover-only essential controls.
