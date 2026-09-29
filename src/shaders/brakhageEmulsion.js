// src/shaders/brakhageEmulsion.js
// Phase 2: Stan Brakhage Direct Emulsion & 16mm Hand-Painted Celluloid Shaders

export const brakhageFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uAudioFlux;
  uniform float uAudioRms;
  uniform float uAudioTransient;
  uniform float uScratchIntensity;
  uniform vec2 uResolution;

  varying vec2 vUv;

  // Pseudo-random noise
  float hash12(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  // 1D Perlin-style noise for scratch paths
  float scratchNoise(float t) {
    return fract(sin(t * 12.9898) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;

    // Tactical micro-frame gate hop (capped at +/- 4px equivalent in UV space)
    float timeStep = floor(uTime * 24.0); // 24 FPS film gate steps
    float gateJitterX = (hash12(vec2(timeStep, 1.0)) - 0.5) * 0.006;
    float gateJitterY = (hash12(vec2(timeStep, 2.0)) - 0.5) * 0.008;
    uv += vec2(gateJitterX, gateJitterY);

    vec4 color = texture2D(uTexture, uv);

    // 1. Procedural 16mm Vertical Emulsion Scratches
    float scratchX1 = hash12(vec2(floor(uTime * 6.0), 3.0));
    float scratchX2 = hash12(vec2(floor(uTime * 4.0), 7.0));
    float scratchLine1 = smoothstep(0.0015, 0.0, abs(vUv.x - scratchX1));
    float scratchLine2 = smoothstep(0.002, 0.0, abs(vUv.x - scratchX2));
    float scratchMask = (scratchLine1 * 0.75 + scratchLine2 * 0.6) * uScratchIntensity;

    // 2. Celluloid Dust, Hair & Silver Halide Grain
    float grain = (hash12(vUv * uResolution + fract(uTime * 17.0)) - 0.5) * 0.18;
    float dust = step(0.9965, hash12(vUv * 8.0 + vec2(timeStep * 1.3, timeStep * 2.7))) * 0.7;

    // 3. Organic Hand-Painted Dye-Saturation Pulses (Meyda spectral flux + RMS driven)
    float dyeSaturation = 1.0 + (uAudioFlux * 1.5) + (uAudioTransient * 0.6);
    float dyeWarmth = (uAudioRms * 0.3);

    // Apply dye shift and bleach-bypass contrast
    vec3 emulsionRgb = color.rgb * vec3(1.0 + dyeWarmth, 1.0, 1.0 - dyeWarmth * 0.5);
    emulsionRgb = mix(vec3(dot(emulsionRgb, vec3(0.299, 0.587, 0.114))), emulsionRgb, dyeSaturation);

    // Blend scratches & celluloid grain
    emulsionRgb += vec3(grain + dust);
    emulsionRgb += vec3(scratchMask * 0.85, scratchMask * 0.75, scratchMask * 0.5);

    // Solarized flash on transient hit
    if (uAudioTransient > 0.5) {
      emulsionRgb = abs(emulsionRgb - vec3(0.15));
    }

    gl_FragColor = vec4(emulsionRgb, color.a);
  }
`;
