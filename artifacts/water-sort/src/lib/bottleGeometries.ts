import type { BottleSkin } from "@/lib/storage";

export interface BottleGeometry {
  id: BottleSkin;
  name: string;
  viewBox: string; // "0 0 60 180"
  // Outer glass boundary path
  outlinePath: string;
  // Inner cavity path where water resides
  innerCavityPath: string;
  // Lip / rim ellipse or path
  rimPath: string;
  // Relative coordinates for pouring stream origin (x: 0..1, y: 0..1)
  pourLipLeft: { x: number; y: number };
  pourLipRight: { x: number; y: number };
  targetMouthCenter: { x: number; y: number };
  // Specular vertical highlight path
  specularPath?: string;
  // Exact vertical extent of the inner liquid cavity
  cavityTop: number;
  cavityBottom: number;
}

/**
 * 20 Unique container geometries scaled to a unified 60 x 180 coordinate grid.
 * All shapes feature:
 * - Complete continuous inner cavity extending from bottom of container to rim
 * - Full liquid visibility through narrow neck, waist, and stem channels
 * - Symmetrical silhouettes with smooth rounded corners
 * - Dedicated pouring rim
 */
export const BOTTLE_GEOMETRIES: Record<BottleSkin, BottleGeometry> = {
  // 1. Classic Test Tube (clean modern cylindrical lab tube with rounded bottom)
  classic: {
    id: "classic",
    name: "Classic Test Tube",
    viewBox: "0 0 60 180",
    cavityTop: 16,
    cavityBottom: 168,
    outlinePath: "M 10 14 L 10 150 A 20 20 0 0 0 50 150 L 50 14 Z",
    innerCavityPath: "M 12 16 L 12 150 A 18 18 0 0 0 48 150 L 48 16 Z",
    rimPath: "M 7 14 C 7 10, 53 10, 53 14 C 53 18, 7 18, 7 14 Z",
    pourLipLeft: { x: 0.15, y: 0.08 },
    pourLipRight: { x: 0.85, y: 0.08 },
    targetMouthCenter: { x: 0.5, y: 0.08 },
    specularPath: "M 16 20 L 16 150",
  },

  // 2. Tall Lab Tube (slender, taller chamber)
  tall_lab: {
    id: "tall_lab",
    name: "Tall Lab Tube",
    viewBox: "0 0 60 180",
    cavityTop: 12,
    cavityBottom: 170,
    outlinePath: "M 12 10 L 12 154 A 18 18 0 0 0 48 154 L 48 10 Z",
    innerCavityPath: "M 14 12 L 14 154 A 16 16 0 0 0 46 154 L 46 12 Z",
    rimPath: "M 9 10 C 9 7, 51 7, 51 10 C 51 13, 9 13, 9 10 Z",
    pourLipLeft: { x: 0.18, y: 0.06 },
    pourLipRight: { x: 0.82, y: 0.06 },
    targetMouthCenter: { x: 0.5, y: 0.06 },
    specularPath: "M 17 16 L 17 154",
  },

  // 3. Round Flask (slender neck opening up to a spherical boiling bulb)
  round_flask: {
    id: "round_flask",
    name: "Round Flask",
    viewBox: "0 0 60 180",
    cavityTop: 16,
    cavityBottom: 164,
    outlinePath:
      "M 22 14 L 22 52 C 22 65, 7 76, 7 116 C 7 150, 16 167, 30 167 C 44 167, 53 150, 53 116 C 53 76, 38 65, 38 52 L 38 14 Z",
    innerCavityPath:
      "M 24 16 L 24 52 C 24 64, 9 78, 9 116 C 9 148, 18 164, 30 164 C 42 164, 51 148, 51 116 C 51 78, 36 64, 36 52 L 36 16 Z",
    rimPath: "M 19 14 C 19 10, 41 10, 41 14 C 41 18, 19 18, 19 14 Z",
    pourLipLeft: { x: 0.35, y: 0.08 },
    pourLipRight: { x: 0.65, y: 0.08 },
    targetMouthCenter: { x: 0.5, y: 0.08 },
    specularPath: "M 14 100 C 12 120, 16 148, 24 162",
  },

  // 4. Erlenmeyer Flask (conical chemistry flask)
  flask: {
    id: "flask",
    name: "Erlenmeyer Flask",
    viewBox: "0 0 60 180",
    cavityTop: 16,
    cavityBottom: 165,
    outlinePath:
      "M 22 14 L 22 46 L 6 156 C 5 166, 12 170, 20 170 L 40 170 C 48 170, 55 166, 54 156 L 38 46 L 38 14 Z",
    innerCavityPath:
      "M 24 16 L 24 46 L 8 154 C 8 163, 17 165, 30 165 C 43 165, 52 163, 52 154 L 36 46 L 36 16 Z",
    rimPath: "M 19 14 C 19 10, 41 10, 41 14 C 41 18, 19 18, 19 14 Z",
    pourLipLeft: { x: 0.34, y: 0.08 },
    pourLipRight: { x: 0.66, y: 0.08 },
    targetMouthCenter: { x: 0.5, y: 0.08 },
    specularPath: "M 25 22 L 25 46 L 12 150",
  },

  // 5. Wine Glass (graceful bowl, slender hollow stem, wide foot)
  wine_glass: {
    id: "wine_glass",
    name: "Wine Glass",
    viewBox: "0 0 60 180",
    cavityTop: 16,
    cavityBottom: 167,
    outlinePath:
      "M 12 14 C 8 58, 10 98, 27 114 L 27 158 L 14 168 C 13 170, 47 170, 46 168 L 33 158 L 33 114 C 50 98, 52 58, 48 14 Z",
    innerCavityPath:
      "M 14 16 C 11 58, 12 98, 28 112 L 28 158 L 16 166 C 16 167.5, 44 167.5, 44 166 L 32 158 L 32 112 C 48 98, 49 58, 46 16 Z",
    rimPath: "M 10 14 C 10 10, 50 10, 50 14 C 50 18, 10 18, 10 14 Z",
    pourLipLeft: { x: 0.18, y: 0.08 },
    pourLipRight: { x: 0.82, y: 0.08 },
    targetMouthCenter: { x: 0.5, y: 0.08 },
    specularPath: "M 17 22 C 14 58, 16 92, 26 108",
  },

  // 6. Martini Glass (classic conical bowl with long hollow stem)
  martini_glass: {
    id: "martini_glass",
    name: "Martini Glass",
    viewBox: "0 0 60 180",
    cavityTop: 18,
    cavityBottom: 167,
    outlinePath:
      "M 6 16 L 27 106 L 27 160 L 14 168 C 13 170, 47 170, 46 168 L 33 160 L 33 106 L 54 16 Z",
    innerCavityPath:
      "M 9 18 L 28 106 L 28 160 L 16 166 C 16 167.5, 44 167.5, 44 166 L 32 160 L 32 106 L 51 18 Z",
    rimPath: "M 4 16 C 4 11, 56 11, 56 16 C 56 21, 4 21, 4 16 Z",
    pourLipLeft: { x: 0.1, y: 0.09 },
    pourLipRight: { x: 0.9, y: 0.09 },
    targetMouthCenter: { x: 0.5, y: 0.09 },
    specularPath: "M 12 24 L 26 98",
  },

  // 7. Champagne Flute (tall, slender tulip bowl and hollow stem)
  champagne_glass: {
    id: "champagne_glass",
    name: "Champagne Flute",
    viewBox: "0 0 60 180",
    cavityTop: 16,
    cavityBottom: 167,
    outlinePath:
      "M 16 14 C 12 55, 14 115, 27 124 L 27 160 L 16 168 C 15 170, 45 170, 44 168 L 33 160 L 33 124 C 46 115, 48 55, 44 14 Z",
    innerCavityPath:
      "M 18 16 C 14 55, 16 113, 28 123 L 28 160 L 18 166 C 18 167.5, 42 167.5, 42 166 L 32 160 L 32 123 C 44 113, 46 55, 42 16 Z",
    rimPath: "M 14 14 C 14 10, 46 10, 46 14 C 46 18, 14 18, 14 14 Z",
    pourLipLeft: { x: 0.25, y: 0.08 },
    pourLipRight: { x: 0.75, y: 0.08 },
    targetMouthCenter: { x: 0.5, y: 0.08 },
    specularPath: "M 20 22 C 16 55, 18 100, 26 118",
  },

  // 8. Coffee Mug (straight cylinder with comfortable rounded handle)
  coffee_mug: {
    id: "coffee_mug",
    name: "Coffee Mug",
    viewBox: "0 0 60 180",
    cavityTop: 20,
    cavityBottom: 165,
    outlinePath:
      "M 12 18 L 12 152 C 12 164, 18 168, 28 168 L 38 168 C 48 168, 54 164, 54 152 L 54 18 Z",
    innerCavityPath:
      "M 14 20 L 14 150 C 14 160, 20 165, 28 165 L 38 165 C 46 165, 52 160, 52 150 L 52 20 Z",
    rimPath: "M 10 18 C 10 14, 56 14, 56 18 C 56 22, 10 22, 10 18 Z",
    pourLipLeft: { x: 0.18, y: 0.1 },
    pourLipRight: { x: 0.82, y: 0.1 },
    targetMouthCenter: { x: 0.5, y: 0.1 },
    specularPath: "M 17 24 L 17 150",
  },

  // 9. Ceramic Cup (minimalist tapered cup)
  ceramic_cup: {
    id: "ceramic_cup",
    name: "Ceramic Cup",
    viewBox: "0 0 60 180",
    cavityTop: 18,
    cavityBottom: 167,
    outlinePath:
      "M 8 16 L 16 162 C 17 168, 22 170, 30 170 C 38 170, 43 168, 44 162 L 52 16 Z",
    innerCavityPath:
      "M 10 18 L 18 160 C 19 165, 23 167, 30 167 C 37 167, 41 165, 42 160 L 50 18 Z",
    rimPath: "M 6 16 C 6 12, 54 12, 54 16 C 54 20, 6 20, 6 16 Z",
    pourLipLeft: { x: 0.15, y: 0.09 },
    pourLipRight: { x: 0.85, y: 0.09 },
    targetMouthCenter: { x: 0.5, y: 0.09 },
    specularPath: "M 13 24 L 20 156",
  },

  // 10. Soda Bottle (classic contour glass soda bottle with narrow neck)
  soda: {
    id: "soda",
    name: "Soda Bottle",
    viewBox: "0 0 60 180",
    cavityTop: 16,
    cavityBottom: 165,
    outlinePath:
      "M 21 14 L 21 34 C 21 44, 9 58, 9 92 C 9 108, 14 116, 11 134 C 8 152, 12 168, 22 168 L 38 168 C 48 168, 52 152, 49 134 C 46 116, 51 108, 51 92 C 51 58, 39 44, 39 34 L 39 14 Z",
    innerCavityPath:
      "M 23 16 L 23 34 C 23 45, 11 60, 11 92 C 11 107, 16 115, 13 133 C 10 151, 14 165, 23 165 L 37 165 C 46 165, 50 151, 47 133 C 44 115, 49 107, 49 92 C 49 60, 37 45, 37 34 L 37 16 Z",
    rimPath: "M 18 14 C 18 10, 42 10, 42 14 C 42 18, 18 18, 18 14 Z",
    pourLipLeft: { x: 0.33, y: 0.08 },
    pourLipRight: { x: 0.67, y: 0.08 },
    targetMouthCenter: { x: 0.5, y: 0.08 },
    specularPath: "M 25 20 L 25 34 C 25 45, 14 62, 14 92 C 14 108, 18 116, 16 134 C 14 148, 16 160, 24 164",
  },

  // 11. Glass Bottle (apothecary bottle with defined shoulder and narrow neck)
  glass_bottle: {
    id: "glass_bottle",
    name: "Glass Bottle",
    viewBox: "0 0 60 180",
    cavityTop: 16,
    cavityBottom: 165,
    outlinePath:
      "M 22 14 L 22 38 C 22 46, 10 52, 10 66 L 10 154 C 10 166, 16 168, 28 168 L 32 168 C 44 168, 50 166, 50 154 L 50 66 C 50 52, 38 46, 38 38 L 38 14 Z",
    innerCavityPath:
      "M 24 16 L 24 38 C 24 47, 12 53, 12 66 L 12 152 C 12 163, 18 165, 28 165 L 32 165 C 42 165, 48 163, 48 152 L 48 66 C 48 53, 36 47, 36 38 L 36 16 Z",
    rimPath: "M 19 14 C 19 10, 41 10, 41 14 C 41 18, 19 18, 19 14 Z",
    pourLipLeft: { x: 0.34, y: 0.08 },
    pourLipRight: { x: 0.66, y: 0.08 },
    targetMouthCenter: { x: 0.5, y: 0.08 },
    specularPath: "M 26 20 L 26 38 C 26 46, 14 54, 14 68 L 14 154",
  },

  // 12. Potion Bottle (magic spherical flask with flared lip and slender neck)
  potion: {
    id: "potion",
    name: "Potion Bottle",
    viewBox: "0 0 60 180",
    cavityTop: 16,
    cavityBottom: 164,
    outlinePath:
      "M 20 14 L 20 44 C 20 56, 8 72, 8 116 C 8 148, 17 167, 30 167 C 43 167, 52 148, 52 116 C 52 72, 40 56, 40 44 L 40 14 Z",
    innerCavityPath:
      "M 22 16 L 22 44 C 22 55, 10 73, 10 116 C 10 146, 19 164, 30 164 C 41 164, 50 146, 50 116 C 50 73, 38 55, 38 44 L 38 16 Z",
    rimPath: "M 16 14 C 16 9, 44 9, 44 14 C 44 19, 16 19, 16 14 Z",
    pourLipLeft: { x: 0.3, y: 0.08 },
    pourLipRight: { x: 0.7, y: 0.08 },
    targetMouthCenter: { x: 0.5, y: 0.08 },
    specularPath: "M 13 100 C 11 120, 15 148, 24 162",
  },

  // 13. Small Jar (wide preserving jar with thick rim)
  jar: {
    id: "jar",
    name: "Small Jar",
    viewBox: "0 0 60 180",
    cavityTop: 18,
    cavityBottom: 165,
    outlinePath:
      "M 14 16 L 14 26 C 14 30, 8 34, 8 46 L 8 152 C 8 166, 16 168, 28 168 L 32 168 C 44 168, 52 166, 52 152 L 52 46 C 52 34, 46 30, 46 26 L 46 16 Z",
    innerCavityPath:
      "M 16 18 L 16 26 C 16 31, 10 35, 10 46 L 10 150 C 10 163, 18 165, 28 165 L 32 165 C 42 165, 50 163, 50 150 L 50 46 C 50 35, 44 31, 44 26 L 44 18 Z",
    rimPath: "M 11 16 C 11 11, 49 11, 49 16 C 49 21, 11 21, 11 16 Z",
    pourLipLeft: { x: 0.22, y: 0.09 },
    pourLipRight: { x: 0.78, y: 0.09 },
    targetMouthCenter: { x: 0.5, y: 0.09 },
    specularPath: "M 14 46 L 14 150",
  },

  // 14. Crystal Bottle (rare: diamond-cut multifaceted prism)
  crystal: {
    id: "crystal",
    name: "Crystal Bottle",
    viewBox: "0 0 60 180",
    cavityTop: 16,
    cavityBottom: 167,
    outlinePath:
      "M 24 14 L 36 14 L 54 36 L 46 164 C 45 168, 40 170, 30 170 C 20 170, 15 168, 14 164 L 6 36 Z",
    innerCavityPath:
      "M 25 16 L 35 16 L 51 37 L 44 162 C 43 166, 38 167, 30 167 C 22 167, 17 166, 16 162 L 9 37 Z",
    rimPath: "M 21 14 C 21 10, 39 10, 39 14 C 39 18, 21 18, 21 14 Z",
    pourLipLeft: { x: 0.35, y: 0.08 },
    pourLipRight: { x: 0.65, y: 0.08 },
    targetMouthCenter: { x: 0.5, y: 0.08 },
    specularPath: "M 27 20 L 12 40 L 18 158",
  },

  // 15. Gem Bottle (rare: hexagonal emerald-cut flacon)
  gem: {
    id: "gem",
    name: "Gem Bottle",
    viewBox: "0 0 60 180",
    cavityTop: 16,
    cavityBottom: 167,
    outlinePath:
      "M 20 14 L 40 14 L 54 32 L 48 160 C 47 168, 40 170, 30 170 C 20 170, 13 168, 12 160 L 6 32 Z",
    innerCavityPath:
      "M 22 16 L 38 16 L 51 33 L 46 158 C 45 165, 38 167, 30 167 C 22 167, 15 165, 14 158 L 9 33 Z",
    rimPath: "M 17 14 C 17 10, 43 10, 43 14 C 43 18, 17 18, 17 14 Z",
    pourLipLeft: { x: 0.32, y: 0.08 },
    pourLipRight: { x: 0.68, y: 0.08 },
    targetMouthCenter: { x: 0.5, y: 0.08 },
    specularPath: "M 24 20 L 12 36 L 16 156",
  },

  // 16. Hourglass (rare: elegant pinched waist double bulb)
  hourglass: {
    id: "hourglass",
    name: "Hourglass",
    viewBox: "0 0 60 180",
    cavityTop: 16,
    cavityBottom: 164,
    outlinePath:
      "M 12 14 L 48 14 C 48 55, 36 82, 34 90 C 36 98, 48 125, 48 166 L 12 166 C 12 125, 24 98, 26 90 C 24 82, 12 55, 12 14 Z",
    innerCavityPath:
      "M 14 16 L 46 16 C 46 54, 34 81, 32 90 C 34 99, 46 126, 46 164 L 14 164 C 14 126, 26 99, 28 90 C 26 81, 14 54, 14 16 Z",
    rimPath: "M 10 14 C 10 10, 50 10, 50 14 C 50 18, 10 18, 10 14 Z",
    pourLipLeft: { x: 0.2, y: 0.08 },
    pourLipRight: { x: 0.8, y: 0.08 },
    targetMouthCenter: { x: 0.5, y: 0.08 },
    specularPath: "M 17 22 C 17 55, 26 78, 28 86 M 28 94 C 26 102, 17 125, 17 158",
  },

  // 17. Vintage Bottle (rare: arched shoulders, corked apothecary profile)
  vintage_bottle: {
    id: "vintage_bottle",
    name: "Vintage Bottle",
    viewBox: "0 0 60 180",
    cavityTop: 16,
    cavityBottom: 165,
    outlinePath:
      "M 22 14 L 22 34 C 22 42, 8 50, 8 68 L 8 154 C 8 166, 16 168, 28 168 L 32 168 C 44 168, 52 166, 52 154 L 52 68 C 52 50, 38 42, 38 34 L 38 14 Z",
    innerCavityPath:
      "M 24 16 L 24 34 C 24 43, 10 51, 10 68 L 10 152 C 10 163, 18 165, 28 165 L 32 165 C 42 165, 50 163, 50 152 L 50 68 C 50 51, 36 43, 36 34 L 36 16 Z",
    rimPath: "M 19 14 C 19 10, 41 10, 41 14 C 41 18, 19 18, 19 14 Z",
    pourLipLeft: { x: 0.34, y: 0.08 },
    pourLipRight: { x: 0.66, y: 0.08 },
    targetMouthCenter: { x: 0.5, y: 0.08 },
    specularPath: "M 26 20 L 26 34 C 26 42, 13 52, 13 68 L 13 154",
  },

  // 18. Mini Beaker (rare: lab beaker with pouring spout)
  beaker: {
    id: "beaker",
    name: "Mini Beaker",
    viewBox: "0 0 60 180",
    cavityTop: 18,
    cavityBottom: 167,
    outlinePath:
      "M 8 16 L 14 162 C 15 168, 20 170, 30 170 C 40 170, 45 168, 46 162 L 52 16 Z",
    innerCavityPath:
      "M 10 18 L 16 160 C 17 165, 21 167, 30 167 C 39 167, 43 165, 44 160 L 50 18 Z",
    rimPath: "M 6 16 C 6 12, 54 12, 54 16 C 54 20, 6 20, 6 16 Z",
    pourLipLeft: { x: 0.12, y: 0.09 },
    pourLipRight: { x: 0.88, y: 0.09 },
    targetMouthCenter: { x: 0.5, y: 0.09 },
    specularPath: "M 13 24 L 18 156",
  },

  // 19. Wide Glass (rare: heavy rocks tumbler)
  wide_glass: {
    id: "wide_glass",
    name: "Wide Glass",
    viewBox: "0 0 60 180",
    cavityTop: 18,
    cavityBottom: 166,
    outlinePath:
      "M 9 16 L 12 156 C 13 167, 18 170, 30 170 C 42 170, 47 167, 48 156 L 51 16 Z",
    innerCavityPath:
      "M 11 18 L 14 154 C 15 163, 19 166, 30 166 C 41 166, 45 163, 46 154 L 49 18 Z",
    rimPath: "M 7 16 C 7 12, 53 12, 53 16 C 53 20, 7 20, 7 16 Z",
    pourLipLeft: { x: 0.16, y: 0.09 },
    pourLipRight: { x: 0.84, y: 0.09 },
    targetMouthCenter: { x: 0.5, y: 0.09 },
    specularPath: "M 14 24 L 16 154",
  },

  // 20. Square Crystal (rare: modern rectangular prism glass)
  square: {
    id: "square",
    name: "Square Crystal",
    viewBox: "0 0 60 180",
    cavityTop: 18,
    cavityBottom: 166,
    outlinePath:
      "M 12 16 L 12 162 C 12 167, 16 169, 22 169 L 38 169 C 44 169, 48 167, 48 162 L 48 16 Z",
    innerCavityPath:
      "M 14 18 L 14 160 C 14 164, 17 166, 22 166 L 38 166 C 43 166, 46 164, 46 160 L 46 18 Z",
    rimPath: "M 10 16 C 10 12, 50 12, 50 16 C 50 20, 10 20, 10 16 Z",
    pourLipLeft: { x: 0.2, y: 0.09 },
    pourLipRight: { x: 0.8, y: 0.09 },
    targetMouthCenter: { x: 0.5, y: 0.09 },
    specularPath: "M 17 24 L 17 158",
  },
};
