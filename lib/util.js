import yaml from 'js-yaml';

export function splitFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { fm: null, body: text };
  return { fm: yaml.load(m[1]), body: text.slice(m[0].length) };
}

export function parseMdTable(sectionText) {
  const lines = sectionText.split(/\r?\n/).filter(l => l.trim().startsWith('|'));
  if (lines.length < 2) return [];
  const cells = l => l.split('|').slice(1, -1).map(c => c.trim().replace(/^`|`$/g, ''));
  const headers = cells(lines[0]);
  return lines.slice(2).map(l => {
    const vals = cells(l);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
  });
}

export function luminance(cssColor) {
  const m = String(cssColor).match(/#([0-9a-f]{3}(?:[0-9a-f]{3})?(?:[0-9a-f]{2})?)/i);
  if (!m) return 0.5;
  let hex = m[1];
  if (hex.length === 3) hex = [...hex].map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function pickFirst(obj, names, regex) {
  if (!obj) return undefined;
  for (const n of names) if (obj[n] != null) return obj[n];
  if (regex) for (const k of Object.keys(obj)) if (regex.test(k)) return obj[k];
  return undefined;
}

export function parseFontString(str) {
  const m = String(str).match(/(\d+(?:\.\d+)?)px\s*\/\s*(\d{3})/);
  return m ? { size: Number(m[1]), weight: Number(m[2]) } : null;
}

export function px(v) {
  return typeof v === 'number' ? `${v}px` : String(v);
}

export function hexToHsl(hex) {
  const m = String(hex).trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { s, l };
}
