import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAlpha } from '../lib/parse-alpha.js';

const FM = {
  version: 'alpha',
  name: 'Ferrari-design-analysis',
  description: 'A luxury-automotive brand whose marketing surfaces read as cinematic editorial. The base canvas is near-black.',
  colors: {
    primary: '#da291c', ink: '#ffffff', body: '#969696', muted: '#666666',
    hairline: '#303030', canvas: '#181818', 'surface-card': '#303030', 'on-primary': '#ffffff'
  },
  typography: {
    'display-xl': { fontFamily: "'FerrariSans', sans-serif", fontSize: '48px', fontWeight: 500, lineHeight: 1.1, letterSpacing: 0 },
    'title-lg': { fontFamily: 'FerrariSans', fontSize: '24px', fontWeight: 400, lineHeight: 1.35 },
    body: { fontFamily: "'FerrariSans', sans-serif", fontSize: '16px', fontWeight: 400, lineHeight: 1.5 },
    caption: { fontFamily: 'FerrariSans', fontSize: '12px', fontWeight: 400, lineHeight: 1.4 },
    button: { fontFamily: 'FerrariSans', fontSize: '14px', fontWeight: 500, lineHeight: 1.2 }
  },
  rounded: { none: '0px', sm: '4px', md: '6px', lg: '8px', full: '9999px' },
  spacing: {},
  components: {
    'button-primary': {
      backgroundColor: '{colors.primary}', textColor: '{colors.on-primary}',
      typography: '{typography.button}', rounded: '{rounded.none}', padding: '14px 32px'
    },
    'button-outline-on-dark': {
      backgroundColor: 'transparent', textColor: '{colors.ink}', border: '1px solid {colors.ink}',
      typography: '{typography.button}', rounded: '{rounded.none}', padding: '14px 32px'
    },
    'feature-card-light': { backgroundColor: '{colors.surface-card}', rounded: '{rounded.sm}', padding: '24px' },
    'text-input-on-dark': { backgroundColor: 'transparent', textColor: '{colors.ink}', border: '1px solid {colors.hairline}', rounded: '{rounded.none}', padding: '12px 16px' },
    'badge-pill': { backgroundColor: '{colors.primary}', textColor: '{colors.on-primary}', rounded: '{rounded.full}', padding: '4px 10px', typography: '{typography.caption}' }
  }
};

test('parseAlpha: 참조 해석 포함 컴포넌트 변환', () => {
  const d = parseAlpha(FM, 'ferrari');
  assert.equal(d.components.buttonPrimary.bg, '#da291c');
  assert.equal(d.components.buttonPrimary.fg, '#ffffff');
  assert.equal(d.components.buttonPrimary.radius, '0px');
  assert.equal(d.components.buttonPrimary.fontSize, 14);
  assert.equal(d.components.buttonPrimary.fontWeight, 500);
  assert.equal(d.components.buttonSecondary.border, '1px solid #ffffff');
  assert.equal(d.components.badge.radius, '9999px');
});

test('parseAlpha: 이름 정리와 tagline', () => {
  const d = parseAlpha(FM, 'ferrari');
  assert.equal(d.name, 'Ferrari');   // "-design-analysis" 제거
  assert.match(d.tagline, /^A luxury-automotive/);
  assert.ok(d.tagline.endsWith('editorial.'));  // 첫 문장만
});

test('parseAlpha: 색상/타입 매핑', () => {
  const d = parseAlpha(FM, 'ferrari');
  assert.equal(d.colors.canvas, '#181818');
  assert.equal(d.colors.text, '#ffffff');
  assert.equal(d.colors.accent, '#da291c');
  assert.equal(d.type.display.size, 48);
  assert.equal(d.type.heading.size, 24);
});

test('parseAlpha: fontNames — display/body fontFamily 첫 이름', () => {
  const d = parseAlpha(FM, 'ferrari');
  assert.deepEqual(d.fontNames.display, ['FerrariSans']);
  assert.deepEqual(d.fontNames.body, ['FerrariSans']);
  assert.deepEqual(d.fontNames.mono, []);
});

test('parseAlpha: palette — colors 전체', () => {
  const d = parseAlpha(FM, 'ferrari');
  assert.ok(d.palette.length >= 6);
  assert.ok(d.palette.some(p => p.name === 'primary' && p.value === '#da291c'));
});
