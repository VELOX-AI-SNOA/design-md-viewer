import { test } from 'node:test';
import assert from 'node:assert/strict';
import { USAGE_RULES } from '../lib/usage-rules.js';

test('USAGE_RULES: 지침 항목 존재와 핵심 값', () => {
  assert.equal(USAGE_RULES.slash.components.navCta.bg, 'transparent'); // 흰 필 1회 규칙
  assert.ok(!/Playfair/.test(USAGE_RULES.slash.fonts.heading));        // 세리프 28px 규칙
  assert.equal(USAGE_RULES.factory.components.badge.mono, true);
  assert.equal(USAGE_RULES.factory.components.badge.uppercase, true);
  assert.equal(USAGE_RULES.ferrari.components.buttonPrimary.textTransform, 'uppercase');
  assert.equal(USAGE_RULES.ferrari.components.buttonPrimary.letterSpacing, '1.4px');
  assert.equal(USAGE_RULES.kakaogames.layout.cardsGap, '40px');
  assert.match(USAGE_RULES.kakao.fonts.sans, /Apple SD Gothic Neo/);
});

test('USAGE_RULES: 배열 없음 (deepMerge 안전)', () => {
  const walk = o => Object.values(o).forEach(v => {
    assert.ok(!Array.isArray(v));
    if (v && typeof v === 'object') walk(v);
  });
  walk(USAGE_RULES);
});
