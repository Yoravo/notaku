import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import Module from "node:module";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { chromium } from "playwright";
import swc from "@swc/core";

const root = path.resolve(import.meta.dirname, "..");
const edge = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const scratchRoot = process.env.TMPDIR || "C:/Users/User/AppData/Local/hermes/cache/scratch";
fs.mkdirSync(scratchRoot, { recursive: true });
const outputPath = path.join(scratchRoot, "notaku-dashboard-render-smoke.json");
const require = Module.createRequire(import.meta.url);
const originalLoad = Module._load;
const originalResolve = Module._resolveFilename;

const stubComponent = (name) => function Stub(props) {
  return React.createElement("section", { "data-fixture-child": name },
    React.createElement("h2", null, name),
    name === "RecentInvoices"
      ? React.createElement("a", { href: "/invoices" }, "Open invoices")
      : null,
    props?.isPro === false
      ? React.createElement("a", { href: "/billing" }, "Unlock analytics")
      : null,
  );
};

const moduleStubs = new Map([
  ["next/link", function Link({ href, children, prefetch: _prefetch, ...props }) {
    return React.createElement("a", { href: typeof href === "string" ? href : "#", ...props }, children);
  }],
  ["next-intl", {
    useLocale: () => "id",
    useTranslations: () => (key, values = {}) => {
      if (key === "welcome") return `Selamat datang, ${values.name}`;
      if (key === "recentUsersCount") return `Recent users (${values.count})`;
      if (key === "newUsersThisMonth") return `${values.count} new this month`;
      return key;
    },
  }],
  ["@/components/recent-invoices", { RecentInvoices: stubComponent("RecentInvoices") }],
  ["@/components/announcement-banner", { AnnouncementBanner: stubComponent("AnnouncementBanner") }],
  ["@/components/dashboard/cashflow-chart", { CashflowChart: stubComponent("CashflowChart") }],
  ["@/components/dashboard/client-performance-metrics", { ClientPerformanceMetrics: stubComponent("ClientPerformanceMetrics") }],
  ["@/components/dashboard/onboarding-checklist", { OnboardingChecklist: stubComponent("OnboardingChecklist") }],
  ["@/components/pwa-install-banner", { PWAInstallBanner: stubComponent("PWAInstallBanner") }],
  ["@/lib/offline-cache", { saveOfflineInvoices() {}, saveOfflineCustomers() {} }],
  ["./traffic-chart", { TrafficBarChart: stubComponent("TrafficBarChart") }],
]);

Module._resolveFilename = function(request, parent, isMain, options) {
  if (request.startsWith("@/")) {
    request = path.join(root, "src", request.slice(2));
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
Module._load = function(request, parent, isMain) {
  if (moduleStubs.has(request)) return moduleStubs.get(request);
  return originalLoad.call(this, request, parent, isMain);
};

for (const extension of [".ts", ".tsx"]) {
  Module._extensions[extension] = function(module, filename) {
    const source = fs.readFileSync(filename, "utf8");
    const transformed = swc.transformSync(source, {
      filename,
      sourceMaps: false,
      module: { type: "commonjs" },
      jsc: {
        target: "es2022",
        parser: { syntax: "typescript", tsx: extension === ".tsx", decorators: true },
        transform: { react: { runtime: "automatic" } },
      },
    });
    module._compile(transformed.code, filename);
  };
}

const { DashboardClient } = require(path.join(root, "src/app/(dashboard)/dashboard/dashboard-client.tsx"));
const { AdminOverviewClient } = require(path.join(root, "src/app/admin/admin-overview-client.tsx"));

const analytics = {
  monthlyCashflow: [],
  dso: 0,
  avgPaymentTime: 0,
  clientPerformance: [],
};
const dashboardBase = {
  userName: "QA User",
  selectedRange: "month",
  currencyMetrics: [{ currency: "IDR", totalVolume: 12500000, paidRevenue: 10000000, pendingRevenue: 2500000, invoiceCount: 8 }],
  totalExpenses: 2500000,
  netProfit: 7500000,
  used: 8,
  limit: 10,
  totalCustomers: 3,
  recentInvoices: [],
  analytics,
  userId: "fixture-user",
  hasBusinessName: true,
  hasBankAccount: true,
  hasInvoices: true,
};
const planProps = {
  FREE: { isPro: false, isBusiness: false, limit: 10 },
  LITE: { isPro: false, isBusiness: false, limit: 50 },
  PRO: { isPro: true, isBusiness: false, limit: Infinity },
  BUSINESS: { isPro: true, isBusiness: true, limit: Infinity },
};
const adminData = {
  totalEstimatedIncome: 125000000, currentMRR: 25000000, proUsers: 12,
  planBreakdown: { lite: 3, pro: 7, business: 2, free: 20 }, totalUsers: 32,
  newUsers30d: 6, settlementLogsCount: 14, paidInvoiceVolume: 90000000,
  totalInvoiceVolume: 110000000,
  paidInvoiceVolumes: [{ currency: "IDR", total: 90000000 }],
  totalInvoiceVolumes: [{ currency: "IDR", total: 110000000 }],
  totalInvoices: 48, totalInvoiceItems: 95, totalCustomers: 27, totalAuditLogs: 120,
  totalViews: 5000, views24h: 120, views7d: 900, views30d: 3200,
  uniqueVisitors24hCount: 80, uniqueVisitors7dCount: 450,
  uniqueVisitors30dCount: 1300, uniqueVisitorsAllCount: 2100,
  trafficChartData: [{ dateKey: "2026-10-30", label: "30 Oct", views: 120, uniques: 80 }],
  topPages: [{ path: "/", count: 2500 }, { path: "/tools", count: 900 }],
  topReferrers: [{ referrer: null, count: 2000 }, { referrer: "search.example", count: 800 }],
  recentUsers: [{ id: "u1", name: "Long QA User Name", email: "qa@example.test", plan: "BUSINESS", role: "USER", createdAt: "2026-10-30T01:00:00.000Z", invoiceCount: 8 }],
  recentLogs: [{ id: "l1", event: "fixture.render", ipAddress: null, createdAt: "2026-10-30T01:00:00.000Z" }],
};

const cssInput = fs.readFileSync(path.join(root, "src/app/globals.css"), "utf8");
const css = (await postcss([tailwindcss()]).process(cssInput, {
  from: path.join(root, "src/app/globals.css"),
})).css;

function documentFor(markup, id) {
  return `<!doctype html><html lang="id"><head><meta charset="utf-8"><style>${css}</style></head><body><main id="fixture" data-state="${id}" class="p-4 sm:p-6">${markup}</main></body></html>`;
}

const states = [];
for (const plan of Object.keys(planProps)) {
  states.push({
    id: `user-${plan}`,
    kind: "user",
    plan,
    html: documentFor(renderToStaticMarkup(React.createElement(DashboardClient, {
      ...dashboardBase, ...planProps[plan], userPlan: plan,
    })), `user-${plan}`),
  });
}
states.push({
  id: "admin",
  kind: "admin",
  html: documentFor(renderToStaticMarkup(React.createElement(AdminOverviewClient, { data: adminData })), "admin"),
});

const browser = await chromium.launch({ executablePath: edge, headless: true });
const results = [];
try {
  for (const state of states) {
    for (const width of [320, 390, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const consoleErrors = [];
      page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
      page.on("pageerror", error => consoleErrors.push(error.message));
      await page.setContent(state.html, { waitUntil: "load" });

      const dom = await page.evaluate(() => {
        const fixture = document.querySelector("#fixture");
        const focusables = [...fixture.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])")];
        const hasScrollableAncestor = (element) => {
          let parent = element.parentElement;
          while (parent && parent !== document.body) {
            const style = getComputedStyle(parent);
            if (["auto", "scroll", "hidden"].includes(style.overflowX)) return true;
            parent = parent.parentElement;
          }
          return false;
        };
        const clipped = [...fixture.querySelectorAll("*")].filter((element) => {
          const style = getComputedStyle(element);
          if (style.position === "fixed" || style.position === "absolute") return false;
          if (hasScrollableAncestor(element)) return false;
          const rect = element.getBoundingClientRect();
          return rect.right > innerWidth + 1 || rect.left < -1;
        }).slice(0, 12).map(element => ({ tag: element.tagName, text: element.textContent?.trim().slice(0, 50), right: Math.round(element.getBoundingClientRect().right) }));
        return {
          fixtureState: fixture.getAttribute("data-state"),
          textLength: fixture.textContent.trim().length,
          pageOverflowPx: Math.max(0, Math.ceil(document.documentElement.scrollWidth - innerWidth)),
          clipped,
          focusableCount: focusables.length,
          hrefs: focusables.filter(element => element.tagName === "A").map(element => element.getAttribute("href")),
          badgeKeys: [...fixture.querySelectorAll("span")].map(element => element.textContent?.trim()).filter(text => /^planBadge/.test(text || "")),
          tables: fixture.querySelectorAll("table").length,
          fixtureChildren: fixture.querySelectorAll("[data-fixture-child]").length,
        };
      });

      const keyboardOrder = [];
      for (let i = 0; i < dom.focusableCount; i++) {
        await page.keyboard.press("Tab");
        keyboardOrder.push(await page.evaluate(() => {
          const active = document.activeElement;
          const focusables = [...document.querySelectorAll("#fixture a[href],#fixture button:not([disabled]),#fixture input:not([disabled]),#fixture select:not([disabled]),#fixture textarea:not([disabled]),#fixture [tabindex]:not([tabindex='-1'])")];
          return {
            index: focusables.indexOf(active),
            label: `${active?.tagName || "NONE"}:${active?.getAttribute?.("href") || active?.textContent?.trim().slice(0, 30) || ""}`,
          };
        }));
      }
      const uniqueKeyboardTargets = new Set(keyboardOrder.map(target => target.index)).size;

      assert.equal(dom.fixtureState, state.id, `${state.id}@${width}: fixture state mismatch`);
      assert.ok(dom.textLength > 200, `${state.id}@${width}: unexpectedly empty render`);
      assert.equal(dom.pageOverflowPx, 0, `${state.id}@${width}: horizontal overflow`);
      assert.deepEqual(dom.clipped, [], `${state.id}@${width}: clipped elements`);
      assert.equal(consoleErrors.length, 0, `${state.id}@${width}: browser console errors`);
      assert.equal(uniqueKeyboardTargets, dom.focusableCount, `${state.id}@${width}: keyboard traversal repeated or trapped`);
      if (state.kind === "user") {
        assert.deepEqual(dom.badgeKeys, [`planBadge${state.plan === "BUSINESS" ? "Biz" : state.plan[0] + state.plan.slice(1).toLowerCase()}`], `${state.id}@${width}: wrong plan badge`);
        assert.ok(dom.hrefs.includes("/invoices/new"), `${state.id}@${width}: missing new invoice action`);
      } else {
        assert.equal(dom.tables, 1, `${state.id}@${width}: recent users table missing`);
      }

      results.push({
        state: state.id,
        viewport: width,
        pageOverflowPx: dom.pageOverflowPx,
        clippedCount: dom.clipped.length,
        focusableCount: dom.focusableCount,
        keyboardUniqueTargets: uniqueKeyboardTargets,
        consoleErrors,
        lockedDom: {
          fixtureState: dom.fixtureState,
          badgeKeys: dom.badgeKeys,
          tables: dom.tables,
          fixtureChildren: dom.fixtureChildren,
        },
      });
      await page.close();
    }
  }
} finally {
  await browser.close();
}

const report = {
  evidenceType: "synthetic-props React SSR rendered in headless Edge; not authenticated E2E",
  edgeExecutable: edge,
  css: "compiled from src/app/globals.css with local @tailwindcss/postcss",
  actualComponents: ["DashboardClient", "AdminOverviewClient"],
  stubbedChildren: [...moduleStubs.keys()].filter(key => key.startsWith("@/components/") || key === "./traffic-chart"),
  statesExecuted: results.length,
  outputPath,
  results,
};
fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
