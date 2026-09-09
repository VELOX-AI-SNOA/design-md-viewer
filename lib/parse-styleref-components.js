const HEX = '#[0-9a-fA-F]{3,8}';
const COLOR = `(?:${HEX}|rgba?\\([^)]+\\))`;

// 범위값 "18-20px" | "12–14px"(en dash) → "18px"
const derange = s => s.replace(/(\d+)[-–]\d+px/g, '$1px');

export function extractSpec(prose) {
  const p = derange(prose);
  const spec = {};

  // 배경: "Background #x" | "#x fill" | "White (#x) fill" | "on X (#x) background" | "Background rgba(...)"
  let m = p.match(new RegExp(`[Bb]ackground:?\\s*(${COLOR})`)) ||
          p.match(new RegExp(`(${COLOR})\\)?\\s*fill`)) ||
          p.match(new RegExp(`\\((${COLOR})\\)\\s*fill`)) ||
          p.match(new RegExp(`on\\s+\\w+\\s*\\((${COLOR})\\)\\s*background`)) ||
          p.match(new RegExp(`(${COLOR})\\s*background`));
  if (m) spec.bg = m[1];
  else if (/[Tt]ransparent (?:background|fill)/.test(p)) spec.bg = 'transparent';

  // 전경: "text #x" | "#x text" | "black (#x) text" | "text in #x" | "white text"
  m = p.match(new RegExp(`text:?\\s*(?:at [\\d.]+px [\\w ]*?)?(?:in )?(${COLOR})`)) ||
      p.match(new RegExp(`\\((${COLOR})\\)\\s*text`)) ||
      p.match(new RegExp(`(${COLOR})\\s*text`));
  if (m) spec.fg = m[1];
  else if (/white text/i.test(p)) spec.fg = '#ffffff';
  else if (/black text/i.test(p)) spec.fg = '#000000';

  // 보더: "border 1px #x" | "1px border in #x" | "1px X (#x) border" | "border (1px #x)"
  m = p.match(new RegExp(`border:?\\s*1px\\s*(?:solid\\s*)?(${COLOR})`)) ||
      p.match(new RegExp(`1px\\s*(?:border\\s*in\\s*|\\w+\\s*\\()?(${COLOR})\\)?\\s*border`)) ||
      p.match(new RegExp(`1px\\s*(${COLOR})`));
  if (m && /border|outline/.test(p)) spec.border = `1px solid ${m[1]}`;
  else if (/[Nn]o border/.test(p)) spec.border = 'none';

  // 라디우스: "border-radius 6px" | "6px radius" | "20px border-radius" | "radius 9999px"
  m = p.match(/border-radius:?\s*(\d+px)/) || p.match(/(\d+px)\s*(?:border-)?radius/) || p.match(/radius[,:]?\s*(\d+px)/);
  if (m) spec.radius = m[1];

  // 패딩: "padding 10px 16px" | "Horizontal padding 18px, vertical padding 8px"
  const h = p.match(/[Hh]orizontal padding:?\s*(\d+px)/), v = p.match(/[Vv]ertical padding:?\s*(\d+px)/);
  if (h && v) spec.padding = `${v[1]} ${h[1]}`;
  else {
    m = p.match(/[Pp]adding:?\s*(\d+px(?:\s+\d+px){0,3})/);
    if (m) spec.padding = m[1];
  }

  // 폰트: "14px ... weight 510" | "weight 500 or 600, 15px" (범위 정리 후)
  // 두 정규식 모두 앞뒤로 숫자가 붙어있지 않은 경우만 매치하도록 앵커링한다.
  // (예: "9999px"의 뒷자리 "99px"가 fontSize로 오탐되는 것을 방지)
  m = p.match(/(?<!\d)([\d.]+)px[^\d]*?weight\s*(\d{3})/) || null;
  if (m) { spec.fontSize = parseFloat(m[1]); spec.fontWeight = Number(m[2]); }
  else {
    const w = p.match(/weight\s*(\d{3})/), s = p.match(/(?<!\d)(\d{2})px(?!\d)/);
    if (w) spec.fontWeight = Number(w[1]);
    if (s) spec.fontSize = Number(s[1]);
  }
  return spec;
}

export function extractComponents(sectionText, colors) {
  if (!sectionText) return {};
  // "### 제목\n산문" 블록으로 분할
  const blocks = [];
  const re = /^###\s+(.+)$/gm;
  let match, prev = null;
  while ((match = re.exec(sectionText))) {
    if (prev) blocks.push({ title: prev.title, prose: sectionText.slice(prev.end, match.index) });
    prev = { title: match[1], end: match.index + match[0].length };
  }
  if (prev) blocks.push({ title: prev.title, prose: sectionText.slice(prev.end) });

  const used = new Set();
  const find = (titleRe, requireButton = false) => {
    const b = blocks.find(b =>
      !used.has(b.title) && titleRe.test(b.title) && (!requireButton || /button/i.test(b.title)));
    if (!b) return undefined;
    used.add(b.title);
    return extractSpec(b.prose);
  };

  return {
    buttonPrimary: find(/primary|filled|cta/i, true) ?? find(/sign-?up|log ?in/i, true),
    buttonSecondary: find(/ghost|outline|secondary/i, true) ?? find(/ghost|outline|secondary|log ?in|text link/i),
    card: find(/card/i),
    input: find(/input|email|field|search/i),
    badge: find(/badge|pill|tag|status|chip/i)
  };
}
