import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseOmd } from '../lib/parse-omd.js';

const FM = {
  name: 'Kakao',
  primary_color: '#fee500',
  tokens: {
    colors: {
      primary: '#fee500', canvas: '#ffffff', base: '#1e1e1e',
      'text-primary': '#222222', 'text-secondary': '#666666',
      'surface-elevated': '#f8f8f8', border: '#e5e5e5', 'on-primary': '#000000'
    },
    typography: {
      family: { sans: '-apple-system', mono: 'SF Mono' },
      'display-hero': { size: 36, weight: 800, lineHeight: 1.25 },
      'heading-large': { size: 22, weight: 700, lineHeight: 1.36 },
      body: { size: 16, weight: 400, lineHeight: 1.5 },
      caption: { size: 13, weight: 400, lineHeight: 1.54 }
    },
    rounded: { sm: 4, md: 12, lg: 20, full: 9999 },
    shadow: { subtle: '0px 2px 6px rgba(0,0,0,0.08)' },
    components: {
      'button-login': { type: 'button', bg: '#fee500', fg: '#000000', radius: 12, padding: '12px 20px', font: '16px/600' },
      'button-secondary': { type: 'button', bg: 'transparent', fg: '#333333', radius: 12, padding: '12px 20px', font: '16px/600' },
      'input-default': { type: 'input', bg: '#ffffff', fg: '#222222', radius: 12, padding: '12px 16px', font: '16px/400' },
      'card-standard': { type: 'card', bg: '#ffffff', radius: 12, padding: '16px' },
      'badge-tag': { type: 'badge', bg: '#f0f0f0', fg: '#666666', radius: 4, padding: '2px 6px', font: '11px/500' }
    }
  }
};

test('parseOmd: 시맨틱 색상 매핑', () => {
  const d = parseOmd(FM, 'kakao');
  assert.equal(d.name, 'Kakao');
  assert.equal(d.colors.canvas, '#ffffff');
  assert.equal(d.colors.accent, '#fee500');
  assert.equal(d.colors.onAccent, '#000000');
  assert.equal(d.colors.text, '#222222');
  assert.equal(d.colors.textMuted, '#666666');
  assert.equal(d.colors.border, '#e5e5e5');
});

test('parseOmd: 타입 스케일 매핑', () => {
  const d = parseOmd(FM, 'kakao');
  assert.equal(d.type.display.size, 36);
  assert.equal(d.type.display.weight, 800);
  assert.equal(d.type.heading.size, 22);
  assert.equal(d.type.body.size, 16);
  assert.equal(d.type.caption.size, 13);
});

test('parseOmd: 컴포넌트 선택과 CompSpec 변환', () => {
  const d = parseOmd(FM, 'kakao');
  assert.equal(d.components.buttonPrimary.bg, '#fee500');   // button-login이 선택됨
  assert.equal(d.components.buttonPrimary.radius, '12px');  // 숫자 → px
  assert.equal(d.components.buttonPrimary.fontSize, 16);
  assert.equal(d.components.buttonPrimary.fontWeight, 600);
  assert.equal(d.components.buttonSecondary.bg, 'transparent');
  assert.equal(d.components.card.bg, '#ffffff');
  assert.equal(d.components.badge.fg, '#666666');
});

test('parseOmd: radius 토큰 매핑', () => {
  const d = parseOmd(FM, 'kakao');
  assert.equal(d.radius.pill, '9999px');
  assert.equal(d.radius.card, '12px'); // md
});

test('parseOmd: fontNames — family.sans 또는 family.ui', () => {
  const d = parseOmd(FM, 'kakao');
  assert.deepEqual(d.fontNames.body, ['-apple-system']);
  assert.deepEqual(d.fontNames.mono, ['SF Mono']);
  const d2 = parseOmd({ name: 'KG', tokens: { colors: { primary: '#000' }, typography: { family: { ui: 'SUIT Variable' } } } }, 'kakaogames');
  assert.deepEqual(d2.fontNames.body, ['SUIT Variable']);
});

test('parseOmd: palette — colors 전체를 등장 순서로', () => {
  const d = parseOmd(FM, 'kakao');
  assert.ok(d.palette.length >= 8);
  assert.deepEqual(d.palette[0], { name: 'primary', value: '#fee500' });
});
