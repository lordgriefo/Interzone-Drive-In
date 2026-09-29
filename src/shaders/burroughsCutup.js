// src/shaders/burroughsCutup.js
// Phase 2: Burroughs Third Mind Full-Frame Cut-Up Shader with Dynamic UV Roving

export const burroughsVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const burroughsFragmentShader = /* glsl */ `
  uniform sampler2D uTextureA;
  uniform sampler2D uTextureB;
  uniform sampler2D uTextureC;
  uniform float uTime;
  uniform float uAudioFlux;
  uniform float uAudioTransient;
  uniform float uSliceCount;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float sliceIdx = floor(uv.x * uSliceCount);
    float localUvX = fract(uv.x * uSliceCount);

    // Dynamic roving offsets (covering full X, Y in [0.0, 1.0] without top/bottom cropping)
    float roveX = sin(uTime * 0.4 + sliceIdx * 2.1) * 0.25;
    float roveY = cos(uTime * 0.35 + sliceIdx * 1.7) * 0.2;

    // Transient displacement jump
    float transientJump = uAudioTransient * (sin(sliceIdx * 5.5 + uTime * 10.0) * 0.15);

    vec2 sampleUv = vec2(
      clamp(localUvX + roveX + transientJump, 0.0, 1.0),
      clamp(uv.y + roveY, 0.0, 1.0)
    );

    vec4 color;
    float modSlice = mod(sliceIdx, 3.0);
    if (modSlice < 0.5) {
      color = texture2D(uTextureA, sampleUv);
    } else if (modSlice < 1.5) {
      color = texture2D(uTextureB, sampleUv);
    } else {
      color = texture2D(uTextureC, sampleUv);
    }

    // High-flux optical seam lines
    float seam = smoothstep(0.02, 0.0, min(localUvX, 1.0 - localUvX));
    vec3 finalRgb = mix(color.rgb, vec3(0.0, 0.9, 1.0), seam * 0.7);

    // Audio-driven contrast punch
    finalRgb *= (1.0 + uAudioTransient * 0.3 + uAudioFlux * 0.2);

    gl_FragColor = vec4(finalRgb, color.a);
  }
`;
