import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseStyleRef } from '../lib/parse-styleref.js';

const MD = `# Linear — Style Reference
> midnight precision instrument

**Theme:** dark

Linear's design system is a midnight command center.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Void | \`#08090a\` | \`--color-void\` | Page canvas, full-bleed backgrounds |
| Carbon | \`#0f1011\` | \`--color-carbon\` | Card surfaces, nav bars |
| Graphite | \`#23252a\` | \`--color-graphite\` | Subtle borders, dividers, ghost button outlines |
| Ash | \`#62666d\` | \`--color-ash\` | Muted body text, inactive icons, secondary metadata |
| Paper | \`#ffffff\` | \`--color-paper\` | Primary headings, hero type, max-contrast emphasis text |
| Acid Lime | \`#e4f222\` | \`--color-acid-lime\` | Primary action buttons, active nav indicators |

## Tokens — Typography

### Inter Variable — Primary UI and heading typeface — used across nav, body, headings · \`--font-inter-variable\`
- **Substitute:** Inter (variable), or system-ui as fallback
- **Weights:** 300, 400, 510, 590

### Berkeley Mono — Code-adjacent UI text — issue IDs, keyboard shortcuts · \`--font-berkeley-mono\`
- **Substitute:** JetBrains Mono, IBM Plex Mono, or ui-monospace
- **Weights:** 400

### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| caption | 13px | 1.2 | — | \`--text-caption\` |
| body-sm | 15px | 1.6 | -0.165px | \`--text-body-sm\` |
| subheading | 24px | 1.33 | -0.288px | \`--text-subheading\` |
| heading | 48px | 1 | -1.056px | \`--text-heading\` |
| display | 72px | 1 | -1.584px | \`--text-display\` |

## Tokens — Spacing & Shapes

### Border Radius

| Element | Value |
|---------|-------|
| cards | 12px |
| pills | 9999px |
| inputs | 6px |
| buttons | 6px |

### Shadows

| Name | Value | Token |
|------|-------|-------|
| sm | \`rgba(0, 0, 0, 0.4) 0px 2px 4px 0px\` | \`--shadow-sm\` |

### Layout

- **Page max-width:** 1200px
- **Section gap:** 96px
- **Card padding:** 24px
`;

test('parseStyleRef: 이름·태그라인·테마', () => {
  const d = parseStyleRef(MD, 'linear');
  assert.equal(d.name, 'Linear');
  assert.equal(d.tagline, 'midnight precision instrument');
  assert.equal(d.theme, 'dark');
});

test('parseStyleRef: Role 키워드 시맨틱 색상 매핑', () => {
  const d = parseStyleRef(MD, 'linear');
  assert.equal(d.colors.canvas, '#08090a');
  assert.equal(d.colors.surface, '#0f1011');
  assert.equal(d.colors.border, '#23252a');
  assert.equal(d.colors.textMuted, '#62666d');
  assert.equal(d.colors.text, '#ffffff');
  assert.equal(d.colors.accent, '#e4f222');
});

test('parseStyleRef: 타입 스케일·라디우스·레이아웃', () => {
  const d = parseStyleRef(MD, 'linear');
  assert.equal(d.type.display.size, 72);
  assert.equal(d.type.display.letterSpacing, '-1.584px');
  assert.equal(d.type.heading.size, 24);   // subheading 우선 (48px heading은 히어로용으로 과대)
  assert.equal(d.type.body.size, 15);
  assert.equal(d.radius.card, '12px');
  assert.equal(d.radius.button, '6px');
  assert.equal(d.layout.maxWidth, '1200px');
  assert.equal(d.layout.sectionGap, '96px');
});

test('parseStyleRef: 폰트 이름·Substitute 추출', () => {
  const d = parseStyleRef(MD, 'linear');
  assert.deepEqual(d.fontNames.display, ['Inter Variable', 'Inter']);
  assert.deepEqual(d.fontNames.body, ['Inter Variable', 'Inter']);
  assert.deepEqual(d.fontNames.mono, ['Berkeley Mono', 'JetBrains Mono', 'IBM Plex Mono', 'ui-monospace']);
});

const BULLET_MD = `# Design System Inspired by Kraken

## 1. Visual Theme & Atmosphere

Clean crypto exchange design.

## 2. Color Palette & Roles

### Primary
- **Kraken Purple** (\`#7132f5\`): Primary CTA, brand accent, links
- **Near Black** (\`#101114\`): Primary text

### Neutral
- **Silver Blue** (\`#9497a9\`): Secondary text, muted elements
- **White** (\`#ffffff\`): Primary surface
- **Border Gray** (\`#dedee5\`): Divider borders
`;

test('parseStyleRef: 불릿 폴백 — Tokens 테이블 없는 제4포맷', () => {
  const d = parseStyleRef(BULLET_MD, 'kraken');
  assert.equal(d.name, 'Kraken');                 // "Design System Inspired by" 제거
  assert.equal(d.colors.accent, '#7132f5');
  assert.equal(d.colors.canvas, '#ffffff');
  assert.equal(d.colors.text, '#101114');
  assert.equal(d.colors.textMuted, '#9497a9');
  assert.equal(d.colors.border, '#dedee5');
  assert.equal(d.theme, undefined);               // Theme 라인 없음 → finalize가 추론
});

test('parseStyleRef: 기존 SR 파일 동작 불변 (테이블 우선)', () => {
  const d = parseStyleRef(MD, 'linear');          // 기존 픽스처
  assert.equal(d.theme, 'dark');
  assert.equal(d.colors.accent, '#e4f222');
});

test('parseStyleRef: palette — 테이블·불릿 공용', () => {
  const t = parseStyleRef(MD, 'linear');
  assert.ok(t.palette.length >= 6);
  assert.deepEqual(t.palette[0], { name: 'Void', value: '#08090a' });
  const b = parseStyleRef(BULLET_MD, 'kraken');
  assert.ok(b.palette.some(p => p.name === 'Kraken Purple' && p.value === '#7132f5'));
});
