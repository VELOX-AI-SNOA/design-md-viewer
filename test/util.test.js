import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitFrontmatter, parseMdTable, luminance, pickFirst, parseFontString, px, hexToHsl } from '../lib/util.js';

test('splitFrontmatter: YAML frontmatter 분리', () => {
  const { fm, body } = splitFrontmatter('---\nid: kakao\nname: Kakao\n---\n\n## Section\n본문');
  assert.equal(fm.id, 'kakao');
  assert.match(body, /## Section/);
});

test('splitFrontmatter: frontmatter 없으면 fm=null', () => {
  const { fm, body } = splitFrontmatter('# Linear — Style Reference\n본문');
  assert.equal(fm, null);
  assert.match(body, /Linear/);
});

test('parseMdTable: 헤더 키 객체 배열, 백틱 제거', () => {
  const rows = parseMdTable(
    '| Name | Value | Token | Role |\n|---|---|---|---|\n| Void | `#08090a` | `--color-void` | Page canvas |\n| Paper | `#ffffff` | `--color-paper` | Primary headings |'
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[0].Name, 'Void');
  assert.equal(rows[0].Value, '#08090a');
  assert.equal(rows[1].Role, 'Primary headings');
});

test('luminance: 흰색≈1, 검정≈0', () => {
  assert.ok(luminance('#ffffff') > 0.9);
  assert.ok(luminance('#08090a') < 0.1);
});

test('pickFirst: 우선순위 목록 → 정규식 폴백', () => {
  const obj = { 'text-secondary': '#666', muted: '#999' };
  assert.equal(pickFirst(obj, ['muted'], null), '#999');
  assert.equal(pickFirst(obj, ['없는키'], /secondary/), '#666');
  assert.equal(pickFirst(obj, ['없는키'], /없음/), undefined);
});

test('parseFontString: "18px / 600" → {size, weight}', () => {
  assert.deepEqual(parseFontString('18px / 600'), { size: 18, weight: 600 });
  assert.deepEqual(parseFontString('16px/400'), { size: 16, weight: 400 });
  assert.equal(parseFontString('nonsense'), null);
});

test('px: 숫자→px 문자열, 문자열 그대로', () => {
  assert.equal(px(12), '12px');
  assert.equal(px('9999px'), '9999px');
});

test('hexToHsl: 채도·명도, 3자리 확장, 비hex는 null', () => {
  const y = hexToHsl('#ffd750');
  assert.ok(y.s >= 0.25 && y.l >= 0.12 && y.l <= 0.88);
  const g = hexToHsl('#9497a9');
  assert.ok(g.s < 0.25);
  assert.ok(hexToHsl('#fff').l > 0.9);
  assert.equal(hexToHsl('rgba(0,0,0,.4)'), null);
});
