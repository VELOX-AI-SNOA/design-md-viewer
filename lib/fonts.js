// 폰트 이름 → 웹폰트 소스. family는 CSS font-family명이 키와 다를 때만.
export const FONT_LIBRARY = {
  'Inter': { type: 'google', param: 'Inter:wght@300..700' },
  'Geist': { type: 'google', param: 'Geist:wght@300..700' },
  'Geist Mono': { type: 'google', param: 'Geist+Mono:wght@400..500' },
  'JetBrains Mono': { type: 'google', param: 'JetBrains+Mono:wght@400..500' },
  'Playfair Display': { type: 'google', param: 'Playfair+Display:wght@400..900' },
  'Space Grotesk': { type: 'google', param: 'Space+Grotesk:wght@300..700' },
  'Noto Serif KR': { type: 'google', param: 'Noto+Serif+KR:wght@400..900' },
  'Pretendard': { type: 'css', url: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css', family: 'Pretendard Variable' },
  'SUIT': { type: 'css', url: 'https://cdn.jsdelivr.net/gh/sunn-us/SUIT@latest/fonts/variable/woff2/SUIT-Variable.css', family: 'SUIT Variable' },
};

// 상용/독점 폰트 → 로드 가능한 대체. 근거는 각 md의 Substitute/Note on Font Substitutes.
export const SUBSTITUTES = {
  'Berkeley Mono': 'JetBrains Mono',      // linear: "Substitute: JetBrains Mono, IBM Plex Mono"
  'Ivy Presto': 'Playfair Display',       // slash: "Substitute: Playfair Display, DM Serif Display"
  'PolySans': 'Space Grotesk',            // Ventriloc: "Substitute: Space Grotesk, General Sans, or DM Sans"
  'Haas Groot Disp': 'Inter',             // airtable: "Inter Display가 최근접" — GF 미제공으로 Inter
  'Haas': 'Inter',
  'Haas Grotesk': 'Inter',
  'SF Pro': 'Inter',                      // apple: "비-Apple 플랫폼은 Inter가 최근접"
  'SF Pro Display': 'Inter',
  'SF Pro Text': 'Inter',
  'FerrariSans': 'Inter',                 // ferrari: "대체: Inter at weight 500"
  'Inter Variable': 'Inter',
  'Inter Display': 'Inter',
  'SUIT Variable': 'SUIT',
  'Pretendard Variable': 'Pretendard',
};

const SERIF_WEBFONTS = new Set(['Playfair Display', 'Noto Serif KR']);
const SYSTEM_TOKEN = /^(system-ui|-apple-system|BlinkMacSystemFont|ui-monospace|ui-serif|sans-serif|serif|monospace|Consolas|Georgia|Roboto|Menlo|SFMono-Regular)$/i;

export function resolveFontStack(names = [], kind = 'sans') {
  const stack = [];
  const webfonts = [];
  const push = s => { if (!stack.includes(s)) stack.push(s); };
  const load = n => { if (!webfonts.includes(n)) webfonts.push(n); };

  for (const raw of names.filter(Boolean).map(s => String(s).trim())) {
    const name = SUBSTITUTES[raw] ?? raw;
    const lib = FONT_LIBRARY[name];
    if (lib) { push(`"${lib.family ?? name}"`); if (lib.family) push(`"${name}"`); load(name); }
    else if (SYSTEM_TOKEN.test(name)) push(name);
    else push(`"${name}"`); // 미지 폰트: 로컬 설치 대비 유지, 로드 안 함
  }

  const isSerif = stack.some(s => SERIF_WEBFONTS.has(s.replace(/"/g, '')));
  if (isSerif) {
    load('Noto Serif KR'); push('"Noto Serif KR"'); push('serif');
  } else if (kind === 'mono') {
    push('ui-monospace'); push('Consolas');
    load('Pretendard'); push('"Pretendard Variable"'); push('Pretendard'); push('monospace');
  } else {
    load('Pretendard'); push('"Pretendard Variable"'); push('Pretendard');
    push('"Noto Sans KR"'); push('"Malgun Gothic"'); push('sans-serif');
  }
  return { stack: stack.join(', '), webfonts };
}

export function buildFontLinks(names) {
  const google = new Set();
  const css = new Set();
  for (const n of new Set(names)) {
    const lib = FONT_LIBRARY[n];
    if (!lib) continue;
    if (lib.type === 'google') google.add(lib.param);
    else css.add(lib.url);
  }
  const links = [...css].map(u => `<link rel="stylesheet" href="${u}">`);
  if (google.size) {
    const params = [...google].sort().map(p => `family=${p}`).join('&');
    links.push(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${params}&display=swap">`);
    links.unshift(
      '<link rel="preconnect" href="https://fonts.googleapis.com">',
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    );
  }
  return links.join('\n');
}
