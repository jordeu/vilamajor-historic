## verdict

All ten required captures were reopened at their original paths and are valid: desktop, desktop-layers, desktop-story, desktop-tour, mobile, mobile-layers, mobile-story, mobile-tour, mobile-320 and mobile-844.

1. Story destination — **resolved**. The narrow and landscape recaptures show the Vilanova settlement and location context. `src/main.ts:55`–`57` now directs pre-1949 Sant Antoni stories to the settlement at E450150/N4613710 and labels the destination “La Vilanova · Sant Antoni”. The supplied successful browser assertions check both the 1697 story action and its actual camera coordinates (`tools/ui-browser-check.mjs:36`–`37`).
2. Decorative eyebrow — **resolved**. The desktop recaptures show the event title alone beside the year, with the disclosure icon retained. `era-label` is absent from `src/interface.ts`, `src/main.ts` and `src/style.css`.
3. Minimum control targets — **resolved**. The recaptures show enlarged movement and layer controls and separately allocated story, slider and date rows. The 320px and 844×390 captures retain all timeline controls and the guided-tour action without clipping. The relevant CSS now uses 44px minimum targets; the supplied successful geometry assertions verify target dimensions and prevent timeline overlap at all four viewport sizes (`tools/ui-browser-check.mjs:13`–`18`, `55`).

No material regressions introduced by this fix batch are visible in the recaptures. This ship verdict covers the scored fixes, not the whole surface.

## remaining

clear

disposition: ship
