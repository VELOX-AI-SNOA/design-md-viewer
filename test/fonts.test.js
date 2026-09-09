import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveFontStack, buildFontLinks, SUBSTITUTES } from '../lib/fonts.js';

test('resolveFontStack: 알려진 폰트 → 스택+웹폰트, Pretendard 한글 폴백', () => {
  const r = resolveFontStack(['Inter Variable', 'Inter'], 'sans');
  assert.match(r.stack, /^"Inter"/);
  assert.match(r.stack, /Pretendard/);
  assert.ok(r.stack.endsWith('sans-serif'));
  assert.ok(r.webfonts.includes('Inter'));
  assert.ok(r.webfonts.includes('Pretendard'));
});

test('resolveFontStack: 상용 폰트는 SUBSTITUTES로 대체', () => {
  const r = resolveFontStack(['Berkeley Mono'], 'mono');
  assert.match(r.stack, /"JetBrains Mono"/);
  assert.ok(r.webfonts.includes('JetBrains Mono'));
  assert.doesNotMatch(r.stack, /Berkeley/);
});

test('resolveFontStack: 세리프 감지 시 Noto Serif KR 폴백 + serif 제네릭', () => {
  const r = resolveFontStack(['Ivy Presto'], 'sans');
  assert.match(r.stack, /"Playfair Display"/);
  assert.match(r.stack, /"Noto Serif KR"/);
  assert.ok(r.stack.endsWith('serif'));
  assert.ok(!r.stack.includes('sans-serif'));
});

test('resolveFontStack: 미지 폰트는 스택에 남기되 로드하지 않음, 시스템 토큰 통과', () => {
  const r = resolveFontStack(['Kakao Big Sans', 'system-ui'], 'sans');
  assert.match(r.stack, /"Kakao Big Sans", system-ui/);
  assert.ok(!r.webfonts.includes('Kakao Big Sans'));
});

test('resolveFontStack: mono는 Consolas 뒤 Pretendard, monospace 종결', () => {
  const r = resolveFontStack(['Geist Mono'], 'mono');
  assert.match(r.stack, /"Geist Mono".*Consolas.*Pretendard.*monospace$/);
});

test('buildFontLinks: Google Fonts 1링크 병합 + css 링크, 중복 제거', () => {
  const html = buildFontLinks(['Inter', 'Playfair Display', 'Pretendard', 'Inter']);
  const stylesheetLinks = html.match(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com/g) ?? [];
  assert.equal(stylesheetLinks.length, 1);
  assert.match(html, /family=Inter/);
  assert.match(html, /family=Playfair\+Display/);
  assert.match(html, /pretendard/);
  assert.match(html, /display=swap/);
});

test('buildFontLinks: Google Fonts 사용 시 preconnect 링크 포함', () => {
  const html = buildFontLinks(['Inter']);
  assert.match(html, /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">/);
  assert.match(html, /<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>/);
});

test('SUBSTITUTES: 문서 지정 대체 매핑', () => {
  assert.equal(SUBSTITUTES['Ivy Presto'], 'Playfair Display');
  assert.equal(SUBSTITUTES['PolySans'], 'Space Grotesk');
  assert.equal(SUBSTITUTES['SF Pro Display'], 'Inter');
  assert.equal(SUBSTITUTES['FerrariSans'], 'Inter');
});
