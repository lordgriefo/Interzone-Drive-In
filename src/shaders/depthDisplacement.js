// src/shaders/depthDisplacement.js
// Phase 2: Real-time 2.5D Depth Displacement & Photogrammetry Shaders

export const depthVertexShader = /* glsl */ `
  uniform sampler2D uColorMap;
  uniform sampler2D uDepthMap;
  uniform float uDepthIntensity;
  uniform float uAudioTransient;
  uniform float uAudioZPulse;
  uniform float uAudioRms;
  uniform float uAudioFlux;
  uniform float uTime;
  uniform float uUseLuminanceDepth;
  uniform float uRenderMode; // 0.0: Mesh, 1.0: Points, 2.0: Wireframe/Scan
  uniform float uPointSize;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vDepth;
  varying vec4 vColor;

  // RGB to Luminance
  float getLuminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
  }

  void main() {
    vUv = uv;
    vec4 colorTex = texture2D(uColorMap, uv);
    vColor = colorTex;

    // Sample depth or calculate luminance
    float depthSample = texture2D(uDepthMap, uv).r;
    if (uUseLuminanceDepth > 0.5) {
      depthSample = getLuminance(colorTex.rgb);
    }
    vDepth = depthSample;

    // Calculate displacement amount with audio Z-pulse
    float audioBoost = 1.0 + (uAudioTransient * uAudioZPulse * 0.75) + (uAudioFlux * 0.35);
    float displacement = depthSample * uDepthIntensity * audioBoost;

    // Displace along normal / Z axis
    vec3 displacedPosition = position;
    displacedPosition.z += displacement;

    // Subtle breathing displacement on low RMS
    displacedPosition.z += sin(uTime * 2.0 + position.x * 0.5 + position.y * 0.5) * (0.05 + uAudioRms * 0.2);

    vPosition = displacedPosition;
    vNormal = normal;

    vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Point cloud attenuation for points mode
    if (uRenderMode > 0.5) {
      float pSize = uPointSize * (1.0 + uAudioRms * 1.2 + uAudioTransient * 0.8);
      gl_PointSize = max(1.0, pSize * (350.0 / -mvPosition.z));
    }
  }
`;

export const depthFragmentShader = /* glsl */ `
  uniform sampler2D uColorMap;
  uniform sampler2D uDepthMap;
  uniform float uTime;
  uniform float uAudioTransient;
  uniform float uAudioCentroid;
  uniform float uAudioFlux;
  uniform float uRenderMode; // 0.0: Textured Mesh, 1.0: Point Cloud, 2.0: X-Ray Scanner
  uniform vec3 uScanColor;

  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying float vDepth;
  varying vec4 vColor;

  void main() {
    vec4 baseColor = texture2D(uColorMap, vUv);

    // MODE 0: Solid 3D Textured Mesh with chromatic & depth lighting
    if (uRenderMode < 0.5) {
      // Dynamic depth shading
      float depthLighting = 0.7 + vDepth * 0.5 + (uAudioTransient * 0.25);
      vec3 finalRgb = baseColor.rgb * depthLighting;

      // Chromatic RGB edge separation on transient flux
      if (uAudioFlux > 0.3) {
        float offset = uAudioFlux * 0.008;
        float r = texture2D(uColorMap, vUv + vec2(offset, 0.0)).r;
        float b = texture2D(uColorMap, vUv - vec2(offset, 0.0)).b;
        finalRgb = vec3(r, finalRgb.g, b);
      }

      gl_FragColor = vec4(finalRgb, baseColor.a);
    }
    // MODE 1: Glowing Neural Point Cloud
    else if (uRenderMode < 1.5) {
      // Make circular points with soft glow
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      float alpha = smoothstep(0.5, 0.1, dist);
      vec3 pointColor = mix(baseColor.rgb, uScanColor, 0.35 + uAudioCentroid * 0.45);

      // Enhance depth contrast
      pointColor += vec3(vDepth * 0.5) * (1.0 + uAudioTransient * 0.6);

      gl_FragColor = vec4(pointColor, alpha * baseColor.a);
    }
    // MODE 2: Fight Club Cyber X-Ray / Wireframe Scanner Look
    else {
      float scanLine = sin(vPosition.y * 20.0 + uTime * 4.0) * 0.5 + 0.5;
      float grid = step(0.9, sin(vUv.x * 120.0)) + step(0.9, sin(vUv.y * 120.0));

      vec3 xRayColor = mix(
        vec3(0.02, 0.08, 0.12),
        uScanColor,
        vDepth * 1.5 + scanLine * 0.4 + grid * 0.6 + uAudioTransient * 0.5
      );

      gl_FragColor = vec4(xRayColor, 0.85);
    }
  }
`;
