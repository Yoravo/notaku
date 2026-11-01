import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const origin = process.env.SEO_TEST_ORIGIN || 'http://127.0.0.1:3107';
const browser = await chromium.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
});
const results = [];
try {
  const sitemapResponse = await fetch(`${origin}/sitemap.xml`);
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  assert.ok(!sitemap.includes('<lastmod>'));
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  assert.equal(new Set(urls).size, urls.length);
  for (const url of urls) {
    const path = new URL(url).pathname;
    const response = await fetch(`${origin}${path}`, { headers: { 'accept-language': 'id' } });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.ok(html.includes(`rel="canonical" href="${url}"`) || html.includes(`rel="canonical" href="${url}/"`), `${path} canonical`);
  }
  for (const locale of ['id', 'en']) {
    const context = await browser.newContext({ locale });
    await context.route('**/api/track', (route) => route.fulfill({ status: 200, body: '{}' }));
    await context.route('**/*google*', (route) => route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(origin, { waitUntil: 'networkidle' });
    const faq = await page.locator('script[type="application/ld+json"]').allTextContents();
    const schema = faq.map((text) => JSON.parse(text)).find((item) => item['@type'] === 'FAQPage');
    for (const [index, question] of schema.mainEntity.entries()) {
      assert.equal(await page.locator(`#faq-q-${index}`).textContent(), question.name);
      assert.equal((await page.locator(`#faq-a-${index}`).textContent()).trim(), question.acceptedAnswer.text);
      await page.locator(`#faq-q-${index}`).click();
      const expanded = await page.locator(`#faq-q-${index}`).getAttribute('aria-expanded');
      assert.equal(await page.locator(`#faq-a-${index}`).isVisible(), expanded === 'true');
    }
    for (const width of [320, 390, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      for (const theme of ['light', 'dark']) {
        await page.evaluate((value) => {
          document.documentElement.classList.toggle('dark', value === 'dark');
          document.documentElement.dataset.theme = value;
        }, theme);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      }
    }
    assert.equal(await page.locator('h1').count(), 1);
    assert.ok(await page.locator('a[href="/kalkulator-pph23"]').count());
    assert.deepEqual(errors, []);
    results.push({ locale, faqCount: schema.mainEntity.length, viewports: [320, 390, 1280], themes: ['light', 'dark'], pageErrors: errors });
    await context.close();
  }
  console.log(JSON.stringify({ sitemapUrls: urls.length, canonicalChecks: urls.length, results }, null, 2));
} finally {
  await browser.close();
}
