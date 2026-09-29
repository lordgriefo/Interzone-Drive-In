// src/utils/audioBufferToWav.js
// Converts a Web Audio AudioBuffer (Float32 PCM) to a standard 16-bit stereo/mono WAV ArrayBuffer

/**
 * Encodes an AudioBuffer into a WAV ArrayBuffer.
 * @param {AudioBuffer} audioBuffer
 * @param {object} [options]
 * @param {number} [options.targetDuration] - Optional duration to trim/limit in seconds
 * @returns {ArrayBuffer}
 */
export function audioBufferToWav(audioBuffer, options = {}) {
  const numChannels = Math.min(2, audioBuffer.numberOfChannels);
  const sampleRate = audioBuffer.sampleRate;
  const maxSamples = options.targetDuration
    ? Math.min(audioBuffer.length, Math.ceil(options.targetDuration * sampleRate))
    : audioBuffer.length;

  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = maxSamples * blockAlign;
  const totalSize = 44 + dataSize;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  const channels = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(audioBuffer.getChannelData(c));
  }

  let offset = 44;
  for (let i = 0; i < maxSamples; i++) {
    for (let c = 0; c < numChannels; c++) {
      let sample = channels[c][i];
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return buffer;
}
