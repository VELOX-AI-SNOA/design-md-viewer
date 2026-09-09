import { luminance, hexToHsl } from './util.js';
import { resolveFontStack } from './fonts.js';
import { USAGE_RULES } from './usage-rules.js';
import { OVERRIDES } from './overrides.js';

const mix = (color, pct) => `color-mix(in srgb, ${color} ${pct}%, transparent)`;

function deepMerge(target, src) {
  for (const [k, v] of Object.entries(src ?? {})) {
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      target[k] = deepMerge({ ...(target[k] ?? {}) }, v);
    } else target[k] = v;
  }
  return target;
}

const fill = (obj, defaults) => deepMerge({ ...defaults }, Object.fromEntries(
  Object.entries(obj ?? {}).filter(([, v]) => v != null)));

export function finalize(partial) {
  const d = structuredClone(partial);
  const c = d.colors;
  // colors 오버라이드는 palette/accentPool 유도보다 먼저 적용해야 한다 — 최종 OVERRIDES
  // 병합은 함수 끝에서 일어나므로, 그것만으로는 이미 계산된 파생 accentPool에 반영되지 않는다.
  Object.assign(c, OVERRIDES[d.id]?.colors ?? {});

  d.theme = d.theme ?? (luminance(c.canvas) < 0.5 ? 'dark' : 'light');
  const dark = d.theme === 'dark';

  const fn = d.fontNames ?? {};
  const bodyRes = resolveFontStack(fn.body?.length ? fn.body : ['Pretendard'], 'sans');
  const dispRes = resolveFontStack(fn.display?.length ? fn.display : (fn.body?.length ? fn.body : ['Pretendard']), 'sans');
  const monoRes = resolveFontStack(fn.mono ?? [], 'mono');
  d.fonts = {
    sans: bodyRes.stack, display: dispRes.stack,
    heading: dispRes.stack, logo: dispRes.stack,
    mono: monoRes.stack, features: null
  };
  d.webfonts = [...new Set([...bodyRes.webfonts, ...dispRes.webfonts, ...monoRes.webfonts])];
  delete d.fontNames;

  c.text = c.text ?? (dark ? '#ffffff' : '#111111');
  c.accent = c.accent ?? c.text;
  c.onAccent = c.onAccent ?? (luminance(c.accent) > 0.5 ? '#000000' : '#ffffff');
  c.surface = c.surface ?? (dark ? `color-mix(in srgb, ${c.canvas} 92%, white)` : '#ffffff');
  c.textMuted = c.textMuted ?? mix(c.text, 62);
  c.border = c.border ?? mix(c.text, 15);

  d.palette = Array.isArray(d.palette)
    ? d.palette.filter(p => p && p.name && p.value)
    : [];
  const chromatic = d.palette
    .map(p => String(p.value))
    .filter(v => {
      const hsl = hexToHsl(v);
      return hsl && hsl.s >= 0.25 && hsl.l >= 0.12 && hsl.l <= 0.88;
    });
  const seen = new Set();
  d.accentPool = [c.accent, ...chromatic].filter(v => {
    const k = String(v).toLowerCase();
    if (!v || seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  d.type = {
    display: fill(d.type.display, { size: 48, weight: 700, lineHeight: 1.15, letterSpacing: null }),
    heading: fill(d.type.heading, { size: 24, weight: 600, lineHeight: 1.3, letterSpacing: null }),
    body: fill(d.type.body, { size: 16, weight: 400, lineHeight: 1.55, letterSpacing: null }),
    caption: fill(d.type.caption, { size: 13, weight: 400, lineHeight: 1.4, letterSpacing: null })
  };

  d.radius = fill(d.radius, { button: '8px', card: '12px', input: '8px', pill: '9999px' });
  d.shadows = fill(d.shadows, { card: 'none' });
  d.layout = fill(d.layout, { maxWidth: '1080px', sectionGap: '72px', cardPadding: '24px', cardsGap: '20px' });

  const cm = d.components ?? {};
  d.components = {
    buttonPrimary: fill(cm.buttonPrimary, {
      bg: c.accent, fg: c.onAccent, border: 'none', radius: d.radius.button,
      padding: '12px 20px', fontSize: 15, fontWeight: 600, textTransform: 'none', letterSpacing: null
    }),
    buttonSecondary: fill(cm.buttonSecondary, {
      bg: 'transparent', fg: c.text, border: `1px solid ${c.border}`, radius: d.radius.button,
      padding: '12px 20px', fontSize: 15, fontWeight: 500, textTransform: 'none', letterSpacing: null
    }),
    card: fill(cm.card, {
      bg: c.surface, fg: c.text, border: `1px solid ${c.border}`, radius: d.radius.card,
      padding: d.layout.cardPadding, shadow: d.shadows.card
    }),
    input: fill(cm.input, {
      bg: dark ? mix(c.text, 6) : '#ffffff', fg: c.text, border: `1px solid ${c.border}`,
      radius: d.radius.input, padding: '12px 16px'
    }),
    badge: fill(cm.badge, {
      bg: dark ? mix(c.text, 8) : mix(c.text, 6), fg: c.textMuted, border: 'none',
      radius: d.radius.pill, padding: '4px 12px', fontSize: 12, fontWeight: 500, uppercase: false, mono: false
    })
  };
  d.components.navCta = fill(cm.navCta, { ...d.components.buttonPrimary });
  // 컴포넌트 fg 누락 보정 (파서가 bg만 찾은 경우)
  for (const comp of Object.values(d.components)) {
    if (!comp.fg) comp.fg = comp.bg === 'transparent' || !comp.bg ? c.text
      : (luminance(comp.bg) > 0.5 ? '#111111' : '#ffffff');
  }

  d.tagline = d.tagline ?? '';
  const withUsage = deepMerge(d, USAGE_RULES[d.id] ?? {});
  return deepMerge(withUsage, OVERRIDES[d.id] ?? {});
}
