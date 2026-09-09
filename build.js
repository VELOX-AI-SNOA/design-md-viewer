import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitFrontmatter } from './lib/util.js';
import { parseOmd } from './lib/parse-omd.js';
import { parseAlpha } from './lib/parse-alpha.js';
import { parseStyleRef } from './lib/parse-styleref.js';
import { finalize } from './lib/finalize.js';
import { buildFontLinks } from './lib/fonts.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_SRC = path.join(ROOT, 'design-md');

export function buildDesigns(sourceDir) {
  const files = fs.readdirSync(sourceDir).filter(f => /^DESIGN-.+\.md$/i.test(f)).sort();
  const designs = [];
  for (const file of files) {
    const id = file.replace(/^DESIGN-/i, '').replace(/\.md$/i, '').toLowerCase();
    try {
      const text = fs.readFileSync(path.join(sourceDir, file), 'utf8');
      const { fm, body } = splitFrontmatter(text);
      let partial;
      if (fm?.tokens) partial = parseOmd(fm, id);
      else if (fm?.version === 'alpha') partial = parseAlpha(fm, id);
      else if (fm) throw new Error('알 수 없는 frontmatter 포맷');
      else partial = parseStyleRef(body, id);
      designs.push(finalize(partial));
    } catch (err) {
      console.warn(`⚠ ${file} 파싱 실패 — 건너뜀: ${err.message}`);
    }
  }
  console.log(`✔ ${designs.length}/${files.length} designs parsed`);
  return designs;
}

function main() {
  const src = process.argv[2] ?? DEFAULT_SRC;
  const designs = buildDesigns(src);
  const webfonts = [...new Set(designs.flatMap(d => d.webfonts ?? []))];
  const template = fs.readFileSync(path.join(ROOT, 'template.html'), 'utf8');
  const html = template
    .replace('__FONT_LINKS__', () => buildFontLinks(webfonts))
    .replace('__DESIGN_DATA__', () => JSON.stringify(designs).replaceAll('<', '\\u003c'));
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
  console.log(`✔ index.html 생성 (${designs.length}개 디자인)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
