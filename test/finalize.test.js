import { test } from 'node:test';
import assert from 'node:assert/strict';
import { finalize } from '../lib/finalize.js';

const base = () => ({
  id: 'test-design', name: 'Linear',
  colors: { canvas: '#08090a', text: '#ffffff', accent: '#e4f222', onAccent: '#000000' },
  type: {}, radius: {}, shadows: {}, components: {}, layout: {}
});

test('finalize: 다크 테마 추론 (canvas 휘도)', () => {
  const d = finalize(base());
  assert.equal(d.theme, 'dark');
});

test('finalize: fontNames → 폰트 스택 해석', () => {
  const p = base();
  p.fontNames = { display: ['Ivy Presto'], body: ['Inter'], mono: ['Berkeley Mono'] };
  const d = finalize(p);
  assert.match(d.fonts.display, /"Playfair Display"/);
  assert.match(d.fonts.display, /"Noto Serif KR"/);
  assert.match(d.fonts.sans, /^"Inter"/);
  assert.match(d.fonts.sans, /Pretendard/);
  assert.match(d.fonts.mono, /"JetBrains Mono"/);
  assert.ok(d.webfonts.includes('Inter') && d.webfonts.includes('Playfair Display') && d.webfonts.includes('Pretendard'));
});

test('finalize: fontNames 없으면 Pretendard 기본', () => {
  const d = finalize(base());
  assert.match(d.fonts.sans, /^"Pretendard Variable"/);
  assert.equal(d.fonts.heading, d.fonts.display);
  assert.equal(d.fonts.logo, d.fonts.display);
  assert.equal(d.fonts.features, null);
});

test('finalize: navCta 기본값은 buttonPrimary 복사, 신규 CompSpec 필드 기본값', () => {
  const d = finalize(base());
  assert.deepEqual(d.components.navCta, d.components.buttonPrimary);
  assert.equal(d.components.buttonPrimary.textTransform, 'none');
  assert.equal(d.components.buttonPrimary.letterSpacing, null);
  assert.equal(d.components.badge.mono, false);
  assert.equal(d.layout.cardsGap, '20px');
});

test('finalize: 병합 순서 — USAGE_RULES 위에 OVERRIDES', async () => {
  const { USAGE_RULES } = await import('../lib/usage-rules.js');
  const { OVERRIDES } = await import('../lib/overrides.js');
  USAGE_RULES['__t'] = { components: { buttonPrimary: { bg: '#111111' } }, fonts: { features: '"ss03"' } };
  OVERRIDES['__t'] = { components: { buttonPrimary: { bg: '#222222' } } };
  try {
    const d = finalize({ ...base(), id: '__t' });
    assert.equal(d.components.buttonPrimary.bg, '#222222'); // OVERRIDES가 이김
    assert.equal(d.fonts.features, '"ss03"');               // USAGE_RULES 반영
  } finally { delete USAGE_RULES['__t']; delete OVERRIDES['__t']; }
});

test('finalize: 컴포넌트 폴백 합성', () => {
  const d = finalize(base());
  assert.equal(d.components.buttonPrimary.bg, '#e4f222');
  assert.equal(d.components.buttonPrimary.fg, '#000000');
  assert.ok(d.components.buttonSecondary.border.startsWith('1px solid'));
  assert.ok(d.components.card.bg);
  assert.ok(d.components.input.border);
  assert.ok(d.components.badge.radius);
});

test('finalize: 부분 폴백 — 있는 값은 유지, 빈 속성만 채움', () => {
  const p = base();
  p.components.buttonPrimary = { bg: '#ff0000' };
  const d = finalize(p);
  assert.equal(d.components.buttonPrimary.bg, '#ff0000');
  assert.ok(d.components.buttonPrimary.padding);
  assert.ok(d.components.buttonPrimary.fontSize);
});

test('finalize: type/layout 폴백', () => {
  const d = finalize(base());
  assert.equal(d.type.display.size, 48);
  assert.equal(d.type.body.size, 16);
  assert.equal(d.layout.maxWidth, '1080px');
});

test('finalize: accentPool — accent 맨 앞·유채색 필터·중복 제거·팔레트 폴백', () => {
  const p = base();
  p.colors.accent = '#E4F222';
  p.palette = [
    { name: 'accent', value: '#e4f222' },        // accent와 소문자 중복 → 제거
    { name: 'pink', value: '#c7317b' },
    { name: 'yellow', value: '#ffd750' },
    { name: 'gray', value: '#9497a9' },          // 저채도 → 제외
    { name: 'near-white', value: '#f9f9f9' },    // 고명도 → 제외
    { name: 'wash', value: 'rgba(0,0,0,.4)' }    // 비hex → 풀에서 제외(팔레트엔 유지)
  ];
  const d = finalize(p);
  assert.equal(d.accentPool[0], '#E4F222');
  assert.deepEqual(d.accentPool.slice(1), ['#c7317b', '#ffd750']);
  assert.equal(d.palette.length, 6);
  const empty = finalize(base());
  assert.deepEqual(empty.palette, []);
  assert.equal(empty.accentPool.length, 1);
});
