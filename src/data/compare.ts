/**
 * Vanilla vs Pomme slider. The section shows once both src/assets/compare/vanilla.png and
 * pomme.png exist. The distances must match the settings the shots were really taken with.
 */
const RENDER_DISTANCE = 12;
const LOD_DISTANCE = 64;
/** How any shot using LoD was taken; the site says so wherever one is shown. */
export const LOD_NOTE = "LoD draws land Pomme has already loaded, so the distance fills in as you explore.";
export const POMME_SETTINGS = `${RENDER_DISTANCE} chunks + LoD to ${LOD_DISTANCE}`;

export const COMPARE = {
  caption: `Same vanilla server, same spot, both at render distance ${RENDER_DISTANCE}. ${LOD_NOTE} Drag to compare.`,
  vanilla: {
    label: `Vanilla · ${RENDER_DISTANCE} chunks`,
    alt: "A jungle hilltop looking over a badlands valley. A few chunks out, the land fades into fog and empty sky.",
  },
  pomme: {
    label: `Pomme · ${POMME_SETTINGS}`,
    alt: "The same view with LoD: the badlands valley, a river, wooded hills, rock spires and mountains run all the way to the horizon.",
  },
} as const;
