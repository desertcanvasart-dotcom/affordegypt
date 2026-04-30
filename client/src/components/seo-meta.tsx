import { Helmet } from "react-helmet-async";

export interface SeoMetaProps {
  title: string;
  description: string;
  canonical: string;
  ogImage?: string;
  ogType?: "website" | "article";
  schema?: object | object[];
}

const DEFAULT_OG_IMAGE = "https://affordegypt.com/og-default.jpg";

export default function SeoMeta({
  title,
  description,
  canonical,
  ogImage,
  ogType,
  schema,
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
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
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
