import { Link, useLocation } from "wouter";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { trailFor } from "@/lib/breadcrumb-schema";

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
  const trail = trailFor(path);
  if (!trail || trail.length < 2) return null;

  return (
    <nav aria-label="Breadcrumb" className={`container mx-auto px-4 py-3 ${className}`}>
      <Breadcrumb>
        <BreadcrumbList>
          {trail.map((crumb, i) => {
            const last = i === trail.length - 1;
            return (
              <BreadcrumbItem key={crumb.name}>
                {last || !crumb.url ? (
                  <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink asChild>
                      <Link href={crumb.url}>{crumb.name}</Link>
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </nav>
  );
}
