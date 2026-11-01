import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('homepage canonical is scoped to homepage, not inherited by every route', async () => {
  assert.doesNotMatch(await source('src/app/layout.tsx'), /canonical: baseUrl/);
  assert.match(await source('src/app/page.tsx'), /canonical:/);
});

test('sitemap does not claim every URL changed on every request', async () => {
  assert.doesNotMatch(await source('src/app/sitemap.ts'), /lastModified: new Date\(\)/);
});

test('homepage schema uses the same localized FAQ content as the visible accordion', async () => {
  const schema = await source('src/components/landing-json-ld.tsx');
  assert.match(schema, /getTranslations\("faq"\)/);
  assert.match(schema, /faqItems\.map/);
  assert.doesNotMatch(schema, /SearchAction|search_term_string|aggregateRating/);
  const faq = await source('src/components/landing-faq.tsx');
  assert.doesNotMatch(faq, /\{isOpen &&/);
  assert.match(faq, /hidden=\{!isOpen\}/);
});

test('template search snippets only advertise supported PDF exports', async () => {
  const catalog = await source('src/app/templates/page.tsx');
  const detail = await source('src/app/templates/[slug]/page.tsx');
  assert.doesNotMatch(catalog, /Word, Excel|word excel/);
  assert.doesNotMatch(detail, /PDF & Excel/);
});
