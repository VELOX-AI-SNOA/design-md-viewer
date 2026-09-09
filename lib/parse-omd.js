import { pickFirst, parseFontString, px, luminance } from './util.js';

// OMD 컴포넌트 → CompSpec
function comp(c) {
  if (!c) return undefined;
  const f = parseFontString(c.font || '') || {};
  return {
    bg: c.bg ?? 'transparent',
    fg: c.fg ?? undefined,
    border: c.border ?? 'none',
    radius: c.radius != null ? px(c.radius) : undefined,
    padding: c.padding,
    fontSize: f.size, fontWeight: f.weight,
    shadow: c.shadow, uppercase: false
  };
}

function typeStyle(t) {
  if (!t) return undefined;
  return { size: t.size, weight: t.weight ?? 400, lineHeight: t.lineHeight ?? 1.4, letterSpacing: t.letterSpacing ?? null };
}

export function parseOmd(fm, id) {
  const tk = fm.tokens;
  const colors = tk.colors ?? {};
  const ty = tk.typography ?? {};
  const comps = tk.components ?? {};

  const accent = fm.primary_color ?? pickFirst(colors, ['primary']);
  const pick = (names, re) => pickFirst(comps, names, re);

  const rounded = tk.rounded ?? {};
  const roundedVals = Object.values(rounded).map(v => px(v));

  const fam = ty.family ?? {};
  const famSans = fam.sans ?? fam.ui;

  return {
    id,
    name: fm.name ?? id,
    tagline: (tk.note ?? '').split(/\.\s/)[0] || undefined,
    colors: {
      canvas: pickFirst(colors, ['canvas'], /canvas/) ?? '#ffffff',
      surface: pickFirst(colors, ['surface', 'surface-elevated', 'surface-fill', 'surface-subtle'], /^surface/),
      text: pickFirst(colors, ['ink', 'text-primary', 'base', 'black'], /^text-/),
      textMuted: pickFirst(colors, ['text-secondary', 'muted', 'text-muted', 'gray', 'slate'], /muted|secondary|gray/),
      border: pickFirst(colors, ['border', 'hairline', 'border-subtle', 'light-gray'], /border|hairline|divider/),
      accent,
      onAccent: pickFirst(colors, ['on-primary']) ?? (luminance(accent) > 0.5 ? '#000000' : '#ffffff')
    },
    type: {
      display: typeStyle(pickFirst(ty, ['display-hero', 'display', 'hero-dev', 'hero-mega', 'display-large'], /^display/)),
      heading: typeStyle(pickFirst(ty, ['heading-large', 'section', 'section-title', 'heading', 'title'], /^heading/)),
      body: typeStyle(pickFirst(ty, ['body'], /^body/)),
      caption: typeStyle(pickFirst(ty, ['caption'], /^caption|^micro/))
    },
    fontNames: {
      display: famSans ? [famSans] : [],
      body: famSans ? [famSans] : [],
      mono: fam.mono ? [fam.mono] : []
    },
    radius: {
      button: px(pickFirst(rounded, ['md', 'sm']) ?? 8),
      card: px(pickFirst(rounded, ['md', 'lg']) ?? 12),
      input: px(pickFirst(rounded, ['md', 'sm']) ?? 8),
      pill: roundedVals.find(v => parseInt(v) >= 999) ?? '9999px'
    },
    shadows: { card: pickFirst(tk.shadow ?? {}, ['subtle', 'minimal', 'elevated'], /./) ?? 'none' },
    components: {
      buttonPrimary: comp(pick(['button-primary', 'button-login', 'button-yellow-solid', 'button-marketing-pill'], /^button-primary/)),
      buttonSecondary: comp(pick(['button-secondary', 'button-outline', 'button-ghost-dark', 'button-black-solid'], /outline|ghost|secondary/)),
      card: comp(pick(['card-standard', 'card-feature', 'card-product', 'card-bordered'], /^card/)),
      input: comp(pick(['input-default', 'input-field', 'input-search'], /^input/)),
      badge: comp(pick(['badge-tag', 'badge-highlight', 'badge-notification'], /^badge/))
    },
    layout: {},
    palette: Object.entries(colors)
      .filter(([, v]) => typeof v === 'string')
      .map(([name, value]) => ({ name, value }))
  };
}
