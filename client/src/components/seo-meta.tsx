import { Helmet } from "react-helmet-async";

export interface SeoMetaProps {
  title: string;
  description: string;
  /** Omit only for noindex pages (admin tools) — public pages must set it. */
  canonical?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  schema?: object | object[];
  /**
   * Ask crawlers to stay out (admin/internal pages). Pass "follow" on pages
   * that shouldn't be indexed but still link somewhere useful — a 404 wants
   * crawlers to keep walking to the home and quote links, not dead-end.
   */
  noindex?: boolean | "follow";
}

// Must be a real file under client/public/ — /og-default.jpg never existed,
// so every share preview silently got the SPA shell HTML instead of an image.
const DEFAULT_OG_IMAGE = "https://affordegypt.com/images/giza-pyramids.jpg";

export default function SeoMeta({
  title,
  description,
  canonical,
  ogImage,
  ogType,
  schema,
  noindex,
}: SeoMetaProps) {
  const image = ogImage ?? DEFAULT_OG_IMAGE;
  const type = ogType ?? "website";
  const schemas = schema
    ? Array.isArray(schema)
      ? schema
      : [schema]
    : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noindex && (
        <meta
          name="robots"
          content={noindex === "follow" ? "noindex, follow" : "noindex, nofollow"}
        />
      )}
      {canonical && <link rel="canonical" href={canonical} />}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="AffordEgypt" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
}
