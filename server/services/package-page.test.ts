import { expect, it } from "vitest";
import { renderPackagePage } from "./package-page";
const shell =
  '<html><head><title>Home</title><meta name="description" content="Home"><link rel="canonical" href="https://affordegypt.com/"><script type="application/ld+json">{"home":true}</script><script type="module" src="/assets/app.js"></script></head><body><div id="root"><div><p>Homepage content</p></div></div></body></html>';
it("serves package metadata with a clean root and keeps application assets", () => {
  const html = renderPackagePage(shell, {
    slug: "sample",
    title: 'Tour <&"',
    summary: "A & B",
    imageUrl: "/images/test.jpg",
  });
  expect(html).toContain('<div id="root"></div>');
  expect(html).not.toContain("Homepage content");
  expect(html).not.toContain('"home":true');
  expect(html).toContain("/assets/app.js");
  expect(html).toContain("Tour &lt;&amp;&quot;");
  expect(html).toContain("https://affordegypt.com/packages/sample");
});
it("returns a noindex shell for unavailable packages", () => {
  const html = renderPackagePage(shell);
  expect(html).toContain("noindex, follow");
  expect(html).not.toContain('rel="canonical"');
});
