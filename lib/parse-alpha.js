import { pickFirst, px, luminance } from './util.js';

// "{colors.primary}" → fm.colors['primary']. 문자열 중간 참조("1px solid {colors.ink}")도 치환.
function resolveRef(val, fm) {
  if (typeof val !== 'string') return val;
  return val.replace(/\{(\w+)\.([\w-]+)\}/g, (_, group, key) => {
    const v = fm[group]?.[key];
    return v == null ? '' : (typeof v === 'object' ? '' : v);
  });
}

function typeStyle(t) {
  if (!t) return undefined;
  return {
    size: parseFloat(t.fontSize), weight: Number(t.fontWeight ?? 400),
    lineHeight: Number(t.lineHeight ?? 1.4),
    letterSpacing: t.letterSpacing && t.letterSpacing !== 0 ? String(t.letterSpacing) : null
  };
}

function comp(c, fm) {
  if (!c) return undefined;
  // typography는 참조 객체 — 직접 조회
  let f = {};
  const tyRef = String(c.typography ?? '').match(/\{typography\.([\w-]+)\}/);
  if (tyRef) {
    const t = fm.typography?.[tyRef[1]];
    if (t) f = { fontSize: parseFloat(t.fontSize), fontWeight: Number(t.fontWeight ?? 400) };
  }
  return {
    bg: resolveRef(c.backgroundColor, fm) || 'transparent',
    fg: resolveRef(c.textColor, fm) || undefined,
    border: resolveRef(c.border, fm) || 'none',
    radius: resolveRef(c.rounded, fm) || undefined,
    padding: c.padding,
    fontSize: f.fontSize, fontWeight: f.fontWeight,
    shadow: resolveRef(c.shadow, fm), uppercase: false
  };
}

export function parseAlpha(fm, id) {
  const colors = fm.colors ?? {};
  const ty = fm.typography ?? {};
  const comps = fm.components ?? {};
  const accent = pickFirst(colors, ['primary']);
  const pick = (names, re) => {
    const key = names.find(n => comps[n]) ?? Object.keys(comps).find(k => re?.test(k));
    return comps[key];
  };

  const firstFam = e => e?.fontFamily ? String(e.fontFamily).split(',')[0].trim().replace(/^['"]|['"]$/g, '') : undefined;
  const dispFam = firstFam(pickFirst(ty, ['display-xl', 'display-hero', 'hero-display', 'display-lg'], /^display|^hero/));
  const bodyFam = firstFam(pickFirst(ty, ['body'], /^body/));

  return {
    id,
    name: (fm.name ?? id).replace(/-design-analysis$/i, ''),
    tagline: (fm.description ?? '').match(/^.*?\./)?.[0] ?? undefined,
    colors: {
      canvas: pickFirst(colors, ['canvas'], /^canvas/) ?? '#ffffff',
      surface: pickFirst(colors, ['surface-card', 'surface-soft', 'surface-pearl', 'surface-soft-light', 'canvas-elevated', 'canvas-parchment'], /^surface/),
      text: pickFirst(colors, ['ink'], /^ink/),
      textMuted: pickFirst(colors, ['muted', 'ink-muted-48', 'body-muted', 'body'], /muted/),
      border: pickFirst(colors, ['hairline', 'divider-soft'], /hairline|border|divider/),
      accent,
      onAccent: pickFirst(colors, ['on-primary']) ?? (luminance(accent) > 0.5 ? '#000000' : '#ffffff')
    },
    type: {
      display: typeStyle(pickFirst(ty, ['display-xl', 'display-hero', 'display-lg'], /^display/)),
      heading: typeStyle(pickFirst(ty, ['title-lg', 'display-md', 'heading-lg', 'heading'], /^title|^heading/)),
      body: typeStyle(pickFirst(ty, ['body'], /^body/)),
      caption: typeStyle(pickFirst(ty, ['caption', 'legal', 'label'], /^caption/))
    },
    fontNames: {
      display: dispFam ? [dispFam] : [],
      body: bodyFam ? [bodyFam] : [],
      mono: []
    },
    radius: {
      button: px(pickFirst(fm.rounded ?? {}, ['md', 'sm', 'lg']) ?? 8),
      card: px(pickFirst(fm.rounded ?? {}, ['lg', 'md']) ?? 12),
      input: px(pickFirst(fm.rounded ?? {}, ['md', 'sm']) ?? 8),
      pill: px(pickFirst(fm.rounded ?? {}, ['pill', 'full']) ?? 9999)
    },
    shadows: {},
    components: {
      buttonPrimary: comp(pick(['button-primary'], /^button-primary/), fm),
      buttonSecondary: comp(pick(['button-secondary', 'button-secondary-pill', 'button-outline-on-dark', 'button-outline-on-light', 'button-secondary-on-dark'], /outline|secondary/), fm),
      card: comp(pick(['feature-card-tabbed', 'feature-card-light', 'pricing-tier-card', 'store-utility-card', 'demo-grid-card', 'article-card'], /card/), fm),
      input: comp(pick(['text-input', 'search-input', 'text-input-on-dark', 'text-input-on-light', 'newsletter-input-band'], /input/), fm),
      badge: comp(pick(['badge-pill'], /^badge/), fm)
    },
    layout: {},
    palette: Object.entries(colors)
      .filter(([, v]) => typeof v === 'string')
      .map(([name, value]) => ({ name, value }))
  };
}
