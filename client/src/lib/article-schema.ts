// Article JSON-LD for the content guide pages. Dates are the real git
// history of each page (first commit = published, last content commit =
// modified) — do not invent fresher dates to look current.

const ORG = {
  "@type": "Organization",
  name: "AffordEgypt",
  url: "https://affordegypt.com",
  logo: {
    "@type": "ImageObject",
    url: "https://affordegypt.com/images/logo-afford-egypt.png",
  },
};

export function articleSchema(args: {
  headline: string;
  description: string;
  canonical: string;
  image: string;
  datePublished: string;
  dateModified: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.headline,
    description: args.description,
    image: args.image,
    author: ORG,
    publisher: ORG,
    datePublished: args.datePublished,
    dateModified: args.dateModified,
    mainEntityOfPage: { "@type": "WebPage", "@id": args.canonical },
  };
}
