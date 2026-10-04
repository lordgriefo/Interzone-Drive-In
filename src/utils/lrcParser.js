// src/utils/lrcParser.js
// Synchronized lyrics parser for LRC timestamp files and JSON segment arrays

export function parseLrcString(raw) {
  if (!raw || typeof raw !== 'string') return [];
  const LRC_RE = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\]\s*(.*)/;
  const lines = raw.split('\n');
  const timed = [];

  lines.forEach((line) => {
    const m = line.match(LRC_RE);
    if (!m) return;
    const mins = parseInt(m[1], 10);
    const secs = parseInt(m[2], 10);
    const ms   = m[3] ? parseInt(m[3].padEnd(3, '0'), 10) : 0;
    const t    = mins * 60 + secs + ms / 1000;
    const text = m[4].trim();
    if (text) timed.push({ t, text });
  });

  // Sort chronologically
  timed.sort((a, b) => a.t - b.t);

  return timed.map((item, i) => ({
    id: i,
    text: item.text,
    start: item.t,
    end: timed[i + 1] ? timed[i + 1].t : item.t + 4,
  }));
}
