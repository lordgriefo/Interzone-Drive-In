// src/constants/cssEffectLibrary.js
// Phase 2: Modular CSS Effect Registry & Normalized [0.0, 1.0] Evaluators

export const CSS_EFFECTS = [
  {
    id: 'solarize_invert',
    label: '1. Solarize Invert',
    description: 'Invert phase & dynamic contrast burst',
    color: '#ff6b00',
    defaultValue: 0.0,
    evaluate: (val) => {
      const v = Math.max(0, Math.min(1, val));
      if (v <= 0.001) return {};
      return {
        filter: `invert(${v.toFixed(3)}) contrast(${(1.0 + v * 0.8).toFixed(3)})`,
      };
    },
  },
  {
    id: 'chroma_pulse',
    label: '2. Chroma Pulse',
    description: '360° Hue sweep & hyper-saturation surge',
    color: '#00e5ff',
    defaultValue: 0.0,
    evaluate: (val) => {
      const v = Math.max(0, Math.min(1, val));
      if (v <= 0.001) return {};
      return {
        filter: `hue-rotate(${(v * 360).toFixed(1)}deg) saturate(${(1.0 + v * 2.2).toFixed(2)})`,
      };
    },
  },
  {
    id: 'glow_bloom',
    label: '3. Glow Bloom',
    description: 'Luminous brightness & electric neon glow',
    color: '#38bdf8',
    defaultValue: 0.0,
    evaluate: (val) => {
      const v = Math.max(0, Math.min(1, val));
      if (v <= 0.001) return {};
      return {
        filter: `brightness(${(1.0 + v * 0.75).toFixed(2)}) drop-shadow(0 0 ${(v * 20).toFixed(1)}px rgba(0,229,255,0.85)) drop-shadow(0 0 ${(v * 10).toFixed(1)}px rgba(255,107,0,0.6))`,
      };
    },
  },
  {
    id: 'vignette_depth',
    label: '4. Vignette Depth',
    description: 'Cinematic perimeter shadow framing',
    color: '#a78bfa',
    defaultValue: 0.0,
    evaluate: (val) => {
      const v = Math.max(0, Math.min(1, val));
      if (v <= 0.001) return {};
      return {
        boxShadow: `inset 0 0 ${(v * 140).toFixed(0)}px rgba(0, 0, 0, ${(v * 0.95).toFixed(2)})`,
      };
    },
  },
  {
    id: 'bleach_bypass',
    label: '5. Bleach Bypass',
    description: 'Harsh silver-halide contrast & desaturation',
    color: '#f59e0b',
    defaultValue: 0.0,
    evaluate: (val) => {
      const v = Math.max(0, Math.min(1, val));
      if (v <= 0.001) return {};
      return {
        filter: `contrast(${(1.0 + v * 1.3).toFixed(2)}) saturate(${(Math.max(0, 1.0 - v * 0.7)).toFixed(2)})`,
      };
    },
  },
];

export function evaluateCssEffect(effectId, value = 0) {
  const effect = CSS_EFFECTS.find((e) => e.id === effectId);
  return effect ? effect.evaluate(value) : {};
}
