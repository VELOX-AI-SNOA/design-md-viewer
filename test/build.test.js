import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { buildDesigns } from '../build.js';

const SRC = fileURLToPath(new URL('../design-md', import.meta.url));

test('buildDesigns: 원본 11개 디자인 포함, 폴더 전체 파싱', () => {
  const designs = buildDesigns(SRC);
  assert.ok(designs.length >= 11, `expected >= 11 designs, got ${designs.length}`);
  const ids = new Set(designs.map(d => d.id));
  for (const id of ['airtable', 'apple', 'factory', 'ferrari', 'kakao', 'kakaobank', 'kakaogames', 'linear', 'returnzero', 'slash', 'ventriloc']) {
    assert.ok(ids.has(id), `원본 디자인 ${id} 누락`);
  }
});

test('buildDesigns: 스펙 스팟체크 — 액센트 색', () => {
  const by = Object.fromEntries(buildDesigns(SRC).map(d => [d.id, d]));
  assert.equal(by.linear.components.buttonPrimary.bg.toLowerCase(), '#e5e5e6'); // primary-action 라이트 스틸
  assert.equal(by.kakao.components.buttonPrimary.bg.toLowerCase(), '#fee500');
  assert.equal(by.ferrari.components.buttonPrimary.bg.toLowerCase(), '#da291c');
  assert.equal(by.apple.colors.textMuted.toLowerCase(), '#7a7a7a');
  assert.equal(by.kraken.colors.accent.toLowerCase(), '#7132f5');
  assert.equal(by.kraken.theme, 'light');
  // 회귀 고정: 불릿 폴백 전용 확장 어휘(2단계 border matching)가 테이블 경로로 새어나가
  // Ventriloc border를 Chalk(#e8e8e8)로 오매칭했던 문제 — Graphite(#4d4d4d) 복원 고정.
  assert.equal(by.ventriloc.colors.border.toLowerCase(), '#4d4d4d');
  // 컨트롤러 재정: Factory Bone이 문서상 명시적 "Primary text"이므로 #eeeeee 유지·고정.
  assert.equal(by.factory.colors.text.toLowerCase(), '#eeeeee');
});

test('buildDesigns: 테마와 폰트 정책', () => {
  const by = Object.fromEntries(buildDesigns(SRC).map(d => [d.id, d]));
  assert.equal(by.linear.theme, 'dark');
  assert.equal(by.ventriloc.theme, 'light');
  assert.match(by.linear.fonts.sans, /Pretendard/);
  assert.match(by.kakao.fonts.sans, /Apple SD Gothic Neo/);
  assert.match(by.slash.fonts.display, /Playfair Display/);
  assert.match(by.returnzero.fonts.sans, /Pretendard/);
});

test('buildDesigns: 모든 디자인에 완전한 컴포넌트 존재', () => {
  for (const d of buildDesigns(SRC)) {
    for (const key of ['buttonPrimary', 'buttonSecondary', 'card', 'input', 'badge']) {
      const c = d.components[key];
      assert.ok(c, `${d.id}.${key} 누락`);
      assert.ok(c.bg && c.fg && c.radius && c.padding, `${d.id}.${key} 속성 불완전: ${JSON.stringify(c)}`);
    }
    assert.ok(d.colors.canvas && d.colors.text && d.colors.accent, `${d.id} 색상 불완전`);
  }
});

test('buildDesigns v2: 명시 폰트·사용 지침 반영', () => {
  const by = Object.fromEntries(buildDesigns(SRC).map(d => [d.id, d]));
  // 명시 폰트
  assert.match(by.linear.fonts.sans, /^"Inter"/);
  assert.match(by.linear.fonts.sans, /Pretendard/);
  assert.match(by.factory.fonts.mono, /"Geist Mono"/);
  assert.match(by.ventriloc.fonts.display, /"Space Grotesk"/);
  assert.match(by.kakaogames.fonts.sans, /SUIT/);
  assert.match(by.apple.fonts.sans, /"Inter"/);
  // 사용 지침
  assert.equal(by.linear.components.navCta.bg.toLowerCase(), '#e5e5e6');    // 인디고·라임을 기본 CTA로 쓰지 않음
  assert.equal(by.factory.components.badge.mono, true);
  assert.equal(by.ferrari.components.buttonPrimary.textTransform, 'uppercase');
  assert.ok(!/Playfair/.test(by.slash.fonts.heading));                      // 세리프 28px 규칙
  assert.equal(by.kakaogames.layout.cardsGap, '40px');
  assert.equal(by.apple.fonts.features, '"ss03"');
  // 웹폰트 수집
  assert.ok(by.linear.webfonts.includes('Inter'));
});

test('buildDesigns: linear 버튼이 납작하지 않음', () => {
  const by = Object.fromEntries(buildDesigns(SRC).map(d => [d.id, d]));
  // comp()가 height를 버리면 padding "0 20px"만 남아 버튼이 약 21px로 납작해진다.
  for (const key of ['buttonPrimary', 'buttonSecondary', 'navCta']) {
    assert.doesNotMatch(by.linear.components[key].padding, /^0\s/, `linear.${key} 세로 padding 0`);
  }
});

test('buildDesigns: 팔레트·액센트 풀', () => {
  const by = Object.fromEntries(buildDesigns(SRC).map(d => [d.id, d]));
  assert.ok(by.lemonbase.palette.length >= 12, `lemonbase palette ${by.lemonbase.palette.length}`);
  assert.ok(by.lemonbase.accentPool.map(v => v.toLowerCase()).includes('#c7317b'));
  assert.equal(by.slash.accentPool.length, 1);                    // 코퍼 단일 — 진성 단색 풀
  assert.ok(by.returnzero.accentPool.length >= 4);                // 민트·블루·옐로 문서 명시
  assert.equal(by.linear.accentPool.length, 1);                   // 인디고 단일 — 라임은 편집용 변형이라 토큰 아님
  for (const d of buildDesigns(SRC)) {
    assert.ok(Array.isArray(d.palette), `${d.id} palette 배열 아님`);
    assert.ok(d.accentPool.length >= 1, `${d.id} accentPool 비어 있음`);
  }
});
