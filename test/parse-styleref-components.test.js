import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractComponents, extractSpec } from '../lib/parse-styleref-components.js';

test('extractSpec: linear 형태 (Background #x, text #x, border-radius, padding, weight)', () => {
  const s = extractSpec('Background #e4f222, text #08090a, border-radius 6px, padding 10px 16px, Inter 14px / weight 510, letter-spacing -0.011em.');
  assert.equal(s.bg, '#e4f222');
  assert.equal(s.fg, '#08090a');
  assert.equal(s.radius, '6px');
  assert.equal(s.padding, '10px 16px');
  assert.equal(s.fontSize, 14);
  assert.equal(s.fontWeight, 510);
});

test('extractSpec: slash 형태 (fill/text 서술형, Npx radius)', () => {
  const s = extractSpec('Pill-shaped, 9999px radius. White (#ffffff) fill, black (#000000) text at 14px Inter weight 500. Padding 10px 20px. No border.');
  assert.equal(s.bg, '#ffffff');
  assert.equal(s.fg, '#000000');
  assert.equal(s.radius, '9999px');
  assert.equal(s.padding, '10px 20px');
  assert.equal(s.fontWeight, 500);
});

test('extractSpec: Ventriloc 형태 (범위값, on X background, 별도 h/v padding)', () => {
  const s = extractSpec('Inter weight 500 or 600, 15-16px, white text on Carbon (#202020) background. 20px border-radius for full pill shape. Horizontal padding 18-20px, vertical padding 8-12px.');
  assert.equal(s.bg, '#202020');
  assert.equal(s.fg, '#ffffff');       // 'white text' 키워드
  assert.equal(s.radius, '20px');
  assert.equal(s.padding, '8px 18px'); // vertical horizontal 순
  assert.equal(s.fontSize, 15);        // 범위는 첫 값
  assert.equal(s.fontWeight, 500);
});

test('extractSpec: transparent 배경과 1px 보더', () => {
  const s = extractSpec('Transparent background, border 1px #23252a, text #d0d6e0, border-radius 6px, padding 8px 12px.');
  assert.equal(s.bg, 'transparent');
  assert.equal(s.border, '1px solid #23252a');
  assert.equal(s.fg, '#d0d6e0');
});

test('extractSpec: 라디우스 "9999px"의 뒷자리가 fontSize로 오탐되지 않음 (리뷰 픽스: 앵커링)', () => {
  // 리뷰에서 지정한 형태: 실제 slash badge 원문 + "weight 500" 부연 — 폴백/주 정규식 모두 대상.
  const s = extractSpec('Transparent background, 1px border in #777a88, 9999px radius, padding 6px 10px. White text at 12–14px Inter weight 500.');
  assert.notEqual(s.fontSize, 99);
  assert.equal(s.radius, '9999px');
  assert.equal(s.fontWeight, 500);
});

test('extractSpec: weight 없는 실제 slash badge 원문에서도 9999px가 fontSize로 새지 않음', () => {
  // 실제 DESIGN-slash.md "Pill Tag Button" 원문 그대로 — weight 언급이 없어 폴백 분기를 탄다.
  const s = extractSpec('Transparent background, 1px border in #777a88, 9999px radius, padding 6px 10px. White text at 12–14px Inter. Smaller and more subdued than action buttons — the border color is intentionally cool gray, not white, to read as secondary.');
  assert.notEqual(s.fontSize, 99);
  assert.equal(s.radius, '9999px');
});

test('extractComponents: 헤딩 이름으로 역할 선택', () => {
  const sec = `### Primary Action Button (Acid Lime)
**Role:** High-emphasis CTA

Background #e4f222, text #08090a, border-radius 6px, padding 10px 16px, Inter 14px / weight 510.

### Ghost / Outline Button
**Role:** Secondary actions

Transparent background, border 1px #23252a, text #d0d6e0, border-radius 6px, padding 8px 12px, Inter 13px / weight 400.

### Pill Button
**Role:** Tag chips, status pills

Background rgba(255,255,255,0.05), text #d0d6e0, border-radius 9999px, padding 4px 12px, Inter 12px / weight 400.

### Card (Product Screenshot Frame)
**Role:** Showcase surface

Background #0f1011, border-radius 12px, padding 24px.`;
  const c = extractComponents(sec, {});
  assert.equal(c.buttonPrimary.bg, '#e4f222');
  assert.equal(c.buttonSecondary.bg, 'transparent');
  assert.equal(c.buttonSecondary.border, '1px solid #23252a');
  assert.equal(c.badge.radius, '9999px');
  assert.equal(c.card.bg, '#0f1011');
});
