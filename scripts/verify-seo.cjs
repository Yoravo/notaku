const target = new URL(process.argv[2] || "http://localhost:3100");
const canonicalOrigin = new URL(process.argv[3] || "https://notaku.store").origin;
const titles = new Set();
let pages = 0;
let schemas = 0;

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1];
}

async function request(path) {
  const response = await fetch(new URL(path, target), {
    redirect: "manual",
    signal: AbortSignal.timeout(60000),
  });
  return { response, html: await response.text() };
}

async function main() {
  const { default: assert } = await import("node:assert/strict");
  const { response: sitemapResponse, html: sitemap } = await request("/sitemap.xml");
  assert.equal(sitemapResponse.status, 200, "sitemap status");
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]));
  assert.ok(urls.length > 0, "sitemap must contain URLs");
  assert.equal(new Set(urls.map(String)).size, urls.length, "duplicate sitemap URLs");

  const { response: robotsResponse, html: robots } = await request("/robots.txt");
  assert.equal(robotsResponse.status, 200, "robots status");
  assert.ok(robots.includes(`Sitemap: ${canonicalOrigin}/sitemap.xml`), "robots sitemap URL");
  for (const prefix of ["/i/", "/portal/", "/api/", "/admin"]) {
    assert.ok(robots.includes(`Disallow: ${prefix}`), `private crawl guard: ${prefix}`);
  }

  for (const url of urls) {
    assert.equal(url.origin, canonicalOrigin, `sitemap origin: ${url}`);
    assert.ok(!/^\/(?:i|portal|api|admin|dashboard|invoices|wallet)(?:\/|$)/.test(url.pathname), `private sitemap URL: ${url}`);
    const { response, html } = await request(url.pathname);
    assert.equal(response.status, 200, `page status: ${url.pathname}`);
    const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
    const canonicals = links.filter((tag) => attribute(tag, "rel") === "canonical");
    assert.equal(canonicals.length, 1, `canonical count: ${url.pathname}`);
    assert.equal(new URL(attribute(canonicals[0], "href")).href, url.href, `canonical mismatch: ${url.pathname}`);
    const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
    const directives = meta.filter((tag) => ["robots", "googlebot"].includes(attribute(tag, "name")));
    assert.ok(directives.length > 0, `missing indexing directives: ${url.pathname}`);
    assert.ok(!directives.some((tag) => /noindex/i.test(attribute(tag, "content"))), `noindex in sitemap: ${url.pathname}`);
    const description = meta.find((tag) => attribute(tag, "name") === "description");
    assert.ok(attribute(description || "", "content"), `missing description: ${url.pathname}`);
    const title = html.match(/<title[^>]*>(.*?)<\/title>/is)?.[1];
    assert.ok(title, `missing title: ${url.pathname}`);
    assert.ok(!titles.has(title), `duplicate title: ${url.pathname}`);
    titles.add(title);
    assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `H1 count: ${url.pathname}`);
    const pageSchemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)]
      .map((match) => JSON.parse(match[1]));
    if (!["/login", "/register"].includes(url.pathname)) {
      assert.ok(pageSchemas.length > 0, `missing structured data: ${url.pathname}`);
    }
    if (url.pathname.startsWith("/templates/")) {
      assert.ok(pageSchemas.some((schema) => schema["@type"] === "WebPage"), `template must describe a content page: ${url.pathname}`);
      assert.ok(!pageSchemas.some((schema) => schema["@type"] === "WebApplication"), `template is not the generator: ${url.pathname}`);
    }
    const keywords = meta.find((tag) => attribute(tag, "name") === "keywords");
    assert.ok(!/\b(?:word|excel)\b/i.test(attribute(keywords || "", "content") || ""), `unsupported export keyword: ${url.pathname}`);
    schemas += pageSchemas.length;
    pages++;
    console.log(`PASS ${url.pathname}: status, canonical, indexing, title, description, H1, JSON-LD`);
  }

  const { html: home } = await request("/");
  for (const path of ["/tools", "/templates", "/buat-invoice", "/buat-kuitansi", "/buat-surat-jalan", "/kalkulator-ppn", "/kalkulator-pph23", "/terbilang-rupiah"]) {
    assert.ok(home.includes(`href="${path}"`), `missing crawlable homepage link: ${path}`);
  }
  console.log("PASS homepage: 8 crawlable hub/tool destinations");

  for (const path of ["/templates/not-a-real-template-seo-check", "/templates/invoice-freelance-extra-seo-check"]) {
    const { response, html } = await request(path);
    assert.equal(response.status, 404, `unknown template must return HTTP 404: ${path}`);
    assert.ok(html.includes("ERROR 404"), `missing custom 404 UI: ${path}`);
    assert.ok(html.includes('href="/tools"'), `missing 404 recovery link: ${path}`);
    console.log(`PASS ${path}: HTTP 404 with recovery UI`);
  }
  const { html: queryHtml } = await request("/kalkulator-pph23?utm_source=seo-check");
  const queryCanonical = [...queryHtml.matchAll(/<link\b[^>]*>/gi)]
    .map((match) => match[0]).find((tag) => attribute(tag, "rel") === "canonical");
  assert.equal(attribute(queryCanonical || "", "href"), `${canonicalOrigin}/kalkulator-pph23`, "tracking query canonical");
  console.log(`RESULT=PASS pages=${pages} valid_json_ld=${schemas}; unknown routes=404; tracking canonical clean`);
}

main().catch((error) => {
  console.error(`RESULT=FAIL ${error.message}`);
  process.exitCode = 1;
});
