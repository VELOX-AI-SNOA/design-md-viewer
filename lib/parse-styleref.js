import { parseMdTable, luminance, px } from './util.js';
import { extractComponents } from './parse-styleref-components.js';

export function section(body, headingRegex) {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex(l => headingRegex.test(l));
  if (start === -1) return '';
  const level = (lines[start].match(/^#+/) || ['##'])[0].length;
  const end = lines.findIndex((l, i) => i > start && new RegExp(`^#{1,${level}} `).test(l));
  return lines.slice(start + 1, end === -1 ? undefined : end).join('\n');
}

function extractFonts(body) {
  const sec = section(body, /^## Tokens — Typography/);
  const out = { display: [], body: [], mono: [] };
  const re = /^###\s+(.+?)\s+—\s+(.+)$/gm;
  let m;
  while ((m = re.exec(sec))) {
    const name = m[1].trim();
    if (/type scale/i.test(name)) continue;
    const role = m[2];
    const block = sec.slice(re.lastIndex).split(/^### /m)[0];
    const subLine = block.match(/^\s*-\s+\*\*Substitute:\*\*\s*(.+)$/m)?.[1] ?? '';
    const normalized = subLine.replace(/\s+or\s+/g, ', ').replace(/\s+and\s+/g, ', ');
    const subs = normalized.split(/,\s*/)
      .map(s => s.replace(/\(.*?\)/g, '').trim())
      .filter(s => s && !/fallback/i.test(s));
    const names = [name, ...subs];
    if (/mono/i.test(name)) { if (!out.mono.length) out.mono = names; }
    else {
      if (/display|heading/i.test(role) && !out.display.length) out.display = names;
      if (/body|ui/i.test(role) && !out.body.length) out.body = names;
    }
  }
  if (!out.body.length) out.body = out.display;
  if (!out.display.length) out.display = out.body;
  return out;
}

function roleMatch(rows, regex) {
  const row = rows.find(r => regex.test(r.Role ?? ''));
  return row?.Value;
}

// 산문 불릿 폴백 — "- **Name** (`#hex` | `rgba(...)`): Role" 행 수집 (Tokens — Colors 테이블이 없는 제4포맷용)
function extractBulletColors(body) {
  const rows = [];
  const re = /^[-*]\s+\*\*(.+?)\*\*\s*\(\s*`?(#[0-9a-fA-F]{3,8}|rgba?\([^)]*\))`?\s*\)\s*:?\s*(.*)$/gm;
  let m;
  while ((m = re.exec(body))) rows.push({ Name: m[1], Value: m[2], Role: m[3] });
  return rows;
}

export function parseStyleRef(body, id) {
  const h1 = body.match(/^#\s+(.+)$/m)?.[1] ?? id;
  const name = h1.replace(/^Design System Inspired by\s+/i, '').replace(/\s+—.*$/, '').trim();
  const tagline = body.match(/^>\s*(.+)$/m)?.[1]?.replace(/\.$/, '') ?? undefined;
  const themeMatch = body.match(/\*\*Theme:\*\*\s*(dark|light)/i);
  const theme = themeMatch ? themeMatch[1].toLowerCase() : undefined;

  let colorRows = parseMdTable(section(body, /^## Tokens — Colors/));
  const isBulletFallback = !colorRows.length;
  if (isBulletFallback) colorRows = extractBulletColors(body);
  const sorted = [...colorRows].sort((a, b) => luminance(a.Value) - luminance(b.Value));
  const darkest = sorted[0]?.Value, lightest = sorted[sorted.length - 1]?.Value;

  // 불릿 폴백(제4포맷: kraken/lovable) 전용 확장 어휘 — Tokens 테이블이 있는 기존 SR 파일
  // (linear/slash/Ventriloc/Factory)에는 적용하지 않는다. 테이블 경로는 "문서 순서 첫 매치"라
  // 어휘를 넓히면 무관한 행이 먼저 걸려 회귀가 난다. 실측 확인:
  //   - border에 "divider" 우선 매칭을 걸면 Ventriloc이 Graphite(#4d4d4d, "subdued borders")
  //     대신 Chalk(#e8e8e8, "very subtle dividers")를 집어 캔버스(#efefef)와 구분 안 되는
  //     보더가 됨 → 테이블 경로는 기존 단일 정규식(순서 무관 첫 매치) 유지.
  //   테이블 경로 예외는 text "primary text" 하나뿐.
  const border = isBulletFallback
    ? roleMatch(colorRows, /divider/i) ?? roleMatch(colorRows, /borders|hairline/i)
    : roleMatch(colorRows, /borders|dividers|hairline/i);
  const canvasRe = isBulletFallback
    ? /page canvas|dominant.*background|primary surface|main background|primary background|page background/i
    : /page canvas|dominant.*background|primary surface|main background|primary background/i;
  const textMutedRe = isBulletFallback
    ? /muted (body )?text|secondary text|helper text|muted elements/i
    : /muted (body )?text|secondary text|helper text/i;
  const accentRe = isBulletFallback
    ? /primary action|brand accent|accent punctuation|chromatic|primary cta/i
    : /primary action|brand accent|accent punctuation|chromatic/i;

  const colors = {
    canvas: roleMatch(colorRows, canvasRe) ?? (theme === 'dark' ? darkest : lightest),
    surface: roleMatch(colorRows, /card surface|surfaces?,|dashboard panel/i),
    // "primary text"는 예외적으로 테이블 경로에도 유지한다 — Factory 문서가 Bone(#eeeeee)을
    // "Bone — Primary text, light card surfaces, the single bright figure on dark ground"로
    // 명시하며, 이 어휘가 없으면 휘도 폴백이 Chalk(#fafafa, 실제 역할은 버튼 표면)를 오답으로 고른다.
    text: roleMatch(colorRows, /primary heading|headings|max-contrast|default text|primary text/i) ?? (theme === 'dark' ? lightest : darkest),
    textMuted: roleMatch(colorRows, textMutedRe),
    border,
    accent: roleMatch(colorRows, accentRe)
  };
  colors.onAccent = colors.accent && luminance(colors.accent) > 0.5 ? '#000000' : '#ffffff';

  const typeRows = parseMdTable(section(body, /^### Type Scale/));
  const byRole = re => typeRows.find(r => re.test(r.Role));
  const ts = row => row && {
    size: parseFloat(row.Size), weight: 500,
    lineHeight: parseFloat(row['Line Height']) || 1.2,
    letterSpacing: /px|em/.test(row['Letter Spacing'] ?? '') ? row['Letter Spacing'] : null
  };
  // display/heading weight: 폰트 섹션의 Weights 목록에서 650 이하 최대값
  const weights = (body.match(/\*\*Weights:\*\*\s*([\d, ]+)/)?.[1] ?? '')
    .split(/,\s*/).map(Number).filter(Boolean);
  const hw = Math.max(...weights.filter(w => w <= 650), 500);

  const type = {
    display: ts(byRole(/^display$|^heading-lg$/)) ?? ts(byRole(/^heading$/)),
    heading: ts(byRole(/^subheading$|^heading-sm$|^title/)) ?? ts(byRole(/^heading$/)),
    body: ts(byRole(/^body$|^body-sm$/)) ?? ts(byRole(/^body-lg$/)),
    caption: ts(byRole(/^caption/))
  };
  if (type.display) type.display.weight = hw;
  if (type.heading) type.heading.weight = hw;
  if (type.body) type.body.weight = 400;
  if (type.caption) type.caption.weight = 400;

  const radiusRows = parseMdTable(section(body, /^### Border Radius/));
  const rv = re => radiusRows.find(r => re.test(r.Element))?.Value;
  const radius = {
    button: rv(/button/) ?? '8px', card: rv(/card/) ?? '12px',
    input: rv(/input/) ?? rv(/button/) ?? '8px', pill: rv(/pill/) ?? '9999px'
  };

  const shadowRows = parseMdTable(section(body, /^### Shadows/));
  const shadows = { card: shadowRows.find(r => /^(sm|subtle|md)/.test(r.Name))?.Value };

  const layoutSec = section(body, /^### Layout/);
  const lv = re => layoutSec.match(re)?.[1];
  const layout = {
    maxWidth: lv(/max-width:\*?\*?\s*(\d+px)/i),
    sectionGap: lv(/Section gap:\*\*\s*(\d+px)/i),
    cardPadding: lv(/Card padding:\*\*\s*(\d+px)/i)
  };

  return {
    id, name, tagline, theme, colors, type, radius, shadows, layout,
    fontNames: extractFonts(body),
    components: extractComponents(section(body, /^## Components/), colors),
    palette: colorRows
      .filter(r => r.Name && r.Value)
      .map(r => ({ name: r.Name, value: r.Value }))
  };
}
