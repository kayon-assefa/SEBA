// Design tokens for the auth flow, sampled directly from the SEBA logo
// (Red_and_White_Modern_Bold_Typographic_Clothing_Store_Logo_.png).
// The logo uses exactly three flat colors — no gradients, no tints — so the
// whole auth surface is rebuilt from those three plus white/black-adjacent
// neutrals for text and form surfaces.

export const seba = {
  // Sampled 1:1 from the logo
  red: "#CC1E00", // background field
  pink: "#FF9999", // shape fill
  black: "#000000", // wordmark

  // Neutrals needed for a usable form UI that the flat logo palette
  // doesn't include on its own
  cream: "#FFF6F1", // form-side background (desktop split layout)
  ink: "#241210", // body text on cream
  inkMuted: "#8A6B67", // secondary text on cream
  hairline: "rgba(36, 18, 16, 0.12)",
  danger: "#B3261E",
  success: "#1E7A46",
} as const;

// Radii / spacing kept deliberately blunt and geometric (no soft
// "friendly SaaS" rounding) to match the logo's hard-edged shapes.
export const radius = {
  sm: "10px",
  md: "16px",
  lg: "24px",
  pill: "999px",
} as const;
