import { Link, useLocation } from "wouter";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useTranslation } from "react-i18next";
import { crumbKey, trailFor } from "@/lib/breadcrumb-schema";

/**
 * The visible breadcrumb trail.
 *
 * Reads the same TRAILS table the BreadcrumbList schema is built from, so the
 * markup and the structured data cannot describe different hierarchies —
 * Search Console flags that mismatch, and it is the obvious failure mode when
 * the two are maintained separately.
 *
 * Renders nothing for a path with no trail, so adding it to a page that is not
 * in the table is harmless rather than a broken "Home ›".
 *
 * The ui/breadcrumb component this uses had been sitting unused in the repo
 * since the shadcn scaffold went in.
 */
export default function PageBreadcrumbs({ className = "" }: { className?: string }) {
  const [path] = useLocation();
  const { t } = useTranslation();
  const trail = trailFor(path);
  if (!trail || trail.length < 2) return null;

  return (
    <div className={`container mx-auto px-4 py-3 ${className}`}>
      {/* ui/breadcrumb.tsx hardcodes aria-label="breadcrumb" on the <nav>, and
          chrome.breadcrumbAria was written for it but never passed. Overriding
          here rather than editing the vendored primitive: the landmark is what
          a screen reader announces before reading the trail. */}
      <Breadcrumb aria-label={t("chrome.breadcrumbAria")}>
        <BreadcrumbList>
          {trail.map((crumb, i) => {
            const last = i === trail.length - 1;
            return (
              <BreadcrumbItem key={crumb.name}>
                {last || !crumb.url ? (
                  <BreadcrumbPage>
                    {t(crumbKey(crumb.name), { defaultValue: crumb.name })}
                  </BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink asChild>
                      <Link href={crumb.url}>
                        {t(crumbKey(crumb.name), { defaultValue: crumb.name })}
                      </Link>
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
