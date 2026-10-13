import type { TravelPackage } from "@shared/travel-packages";
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

// Dynamic package URLs must start from an empty SPA root, not the prerendered
// homepage. Keep asset scripts, but replace homepage metadata for share previews.
export function renderPackagePage(
  shell: string,
  pkg?: Pick<TravelPackage, "slug" | "title" | "summary" | "imageUrl">,
): string {
  const rootStart = shell.indexOf('<div id="root">');
  const rootEnd = shell.lastIndexOf("</div>");
  if (rootStart < 0 || rootEnd < rootStart)
    throw new Error("Invalid application shell");
  let html =
    shell.slice(0, rootStart) +
    '<div id="root"></div>' +
    shell.slice(rootEnd + 6);
  html = html
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(
      /<meta\b[^>]*(?:name=["'](?:description|robots|twitter:[^"']*)["']|property=["']og:[^"']*["'])[^>]*>/gi,
      "",
    )
    .replace(/<link\b[^>]*rel=["'](?:canonical|alternate)["'][^>]*>/gi, "")
    .replace(
      /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
      "",
    );
  const title = escape(
    pkg ? `${pkg.title} | AffordEgypt` : "Package not found | AffordEgypt",
  );
  let head = `<title>${title}</title>`;
  if (pkg) {
    const canonical = escape(`https://affordegypt.com/packages/${pkg.slug}`);
    head += `<meta name="description" content="${escape(pkg.summary)}"><link rel="canonical" href="${canonical}"><meta property="og:title" content="${title}"><meta property="og:description" content="${escape(pkg.summary)}"><meta property="og:url" content="${canonical}">`;
    if (pkg.imageUrl)
      head += `<meta property="og:image" content="${escape(pkg.imageUrl.startsWith("/") ? `https://affordegypt.com${pkg.imageUrl}` : pkg.imageUrl)}">`;
  } else head += '<meta name="robots" content="noindex, follow">';
  return html.replace("</head>", `${head}</head>`);
}
