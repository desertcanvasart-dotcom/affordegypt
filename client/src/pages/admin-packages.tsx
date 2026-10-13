import { applyPackageMealPolicy, PACKAGE_MEAL_INCLUSION } from "@shared/package-meals";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  PACKAGE_TIERS,
  publicationIssues,
  type PackageContent,
  type TravelPackage,
} from "@shared/travel-packages";
import { adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const blank = (slot: number): PackageContent => ({
  slug: `package-${slot}`,
  title: "",
  summary: "",
  description: "",
  imageUrl: "",
  durationDays: 1,
  nights: 0,
  itinerary: [{ title: "", description: "" }],
  inclusions: [],
  exclusions: [],
  bookingTerms: "",
  perPersonRates: {},
  singleSupplement: null,
  status: "draft",
});
function Editor({ slot, saved }: { slot: number; saved?: TravelPackage }) {
  const [form, setForm] = useState<PackageContent>(() =>
    saved ? { ...saved } : blank(slot),
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const client = useQueryClient();
  const { toast } = useToast();
  function field<K extends keyof PackageContent>(
    key: K,
    value: PackageContent[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  async function save(status: PackageContent["status"]) {
    setMessage("");
    setBusy(true);
    try {
      // Pick only authorable fields: row IDs, slot/version and timestamps are server-owned.
      const value = applyPackageMealPolicy({ ...blank(slot), ...form });
      const {
        slug,
        title,
        summary,
        description,
        imageUrl,
        durationDays,
        nights,
        itinerary,
        inclusions,
        exclusions,
        bookingTerms,
        perPersonRates,
        singleSupplement,
      } = value;
      const response = await adminFetch(`/api/admin/packages/${slot}`, {
        method: "PUT",
        body: JSON.stringify({
          slug,
          title,
          summary,
          description,
          imageUrl,
          durationDays,
          nights,
          itinerary,
          inclusions,
          exclusions,
          bookingTerms,
          perPersonRates,
          singleSupplement,
          status,
          expectedVersion: saved?.version ?? 0,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Could not save this package");
      await Promise.all([
        client.invalidateQueries({ queryKey: ["/api/admin/packages"] }),
        client.invalidateQueries({ queryKey: ["/api/packages"] }),
        client.invalidateQueries({ queryKey: [`/api/packages/${slug}`] }),
      ]);
      toast({
        title:
          status === "published" ? "Published on the homepage" : "Draft saved",
      });
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const issues = publicationIssues(form);
  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex justify-between flex-wrap gap-3">
          <h2 className="text-2xl font-bold">Package slot {slot}</h2>
          <span className="text-sm">{saved?.status ?? "Not configured"}</span>
        </div>
        <p className="rounded-lg bg-teal-50 p-4 text-sm">{PACKAGE_MEAL_INCLUSION}</p>
      <fieldset disabled={busy} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            {(["title", "slug", "summary", "imageUrl"] as const).map((key) => (
              <div key={key}>
                <Label htmlFor={`${slot}-${key}`}>
                  {
                    {
                      title: "Program title",
                      slug: "URL slug (fixed after first save)",
                      summary: "Short homepage summary",
                      imageUrl: "Image URL",
                    }[key]
                  }
                </Label>
                <Input
                  id={`${slot}-${key}`}
                  value={form[key]}
                  disabled={key === "slug" && !!saved}
                  onChange={(e) => field(key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`${slot}-days`}>Days</Label>
              <Input
                id={`${slot}-days`}
                type="number"
                min={1}
                max={60}
                value={form.durationDays}
                onChange={(e) => {
                  const days = Number(e.target.value);
                  setForm((p) => ({
                    ...p,
                    durationDays: days,
                    itinerary: Array.from(
                      { length: Math.min(60, Math.max(1, days)) },
                      (_, i) =>
                        p.itinerary[i] ?? { title: "", description: "" },
                    ),
                  }));
                }}
              />
            </div>
            <div>
              <Label htmlFor={`${slot}-nights`}>Nights</Label>
              <Input
                id={`${slot}-nights`}
                type="number"
                min={0}
                max={59}
                value={form.nights}
                onChange={(e) => field("nights", Number(e.target.value))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor={`${slot}-description`}>Program overview</Label>
            <Textarea
              id={`${slot}-description`}
              rows={5}
              value={form.description}
              onChange={(e) => field("description", e.target.value)}
            />
          </div>
          <section>
            <h3 className="font-bold mb-3">Day-by-day itinerary</h3>
            <div className="space-y-4">
              {form.itinerary.map((day, i) => (
                <div key={i} className="border rounded-lg p-4 space-y-2">
                  <Label htmlFor={`${slot}-day-${i}`}>Day {i + 1} title</Label>
                  <Input
                    id={`${slot}-day-${i}`}
                    value={day.title}
                    onChange={(e) =>
                      field(
                        "itinerary",
                        form.itinerary.map((d, j) =>
                          j === i ? { ...d, title: e.target.value } : d,
                        ),
                      )
                    }
                  />
                  <Label htmlFor={`${slot}-day-description-${i}`}>
                    Description
                  </Label>
                  <Textarea
                    id={`${slot}-day-description-${i}`}
                    value={day.description}
                    onChange={(e) =>
                      field(
                        "itinerary",
                        form.itinerary.map((d, j) =>
                          j === i ? { ...d, description: e.target.value } : d,
                        ),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          </section>
          <div className="grid sm:grid-cols-2 gap-4">
            {(["inclusions", "exclusions"] as const).map((key) => (
              <div key={key}>
                <Label htmlFor={`${slot}-${key}`}>
                  {key === "inclusions"
                    ? "Included (one item per line)"
                    : "Excluded (one item per line)"}
                </Label>
                <Textarea
                  id={`${slot}-${key}`}
                  rows={5}
                  value={form[key].join("\n")}
                  onChange={(e) => field(key, e.target.value.split("\n"))}
                  onBlur={() =>
                    field(key, form[key].map((s) => s.trim()).filter(Boolean))
                  }
                />
              </div>
            ))}
          </div>
          <section>
            <h3 className="font-bold">Group rates · EGP per traveler</h3>
            <p className="text-sm text-muted-foreground mb-4">
              For the full program, sharing a twin/double room. Odd groups use
              the previous even tier: 3 uses 2, 5 uses 4, and so on. The rate
              applies to every traveler.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {PACKAGE_TIERS.map((tier) => (
                <div key={tier}>
                  <Label htmlFor={`${slot}-rate-${tier}`}>
                    {tier} travelers
                  </Label>
                  <Input
                    id={`${slot}-rate-${tier}`}
                    type="number"
                    min={0.01}
                    step="0.01"
                    value={form.perPersonRates[String(tier)] ?? ""}
                    onChange={(e) => {
                      const rates = { ...form.perPersonRates };
                      if (e.target.value === "") delete rates[String(tier)];
                      else rates[String(tier)] = Number(e.target.value);
                      field("perPersonRates", rates);
                    }}
                  />
                </div>
              ))}
            </div>
          </section>
          <div>
            <Label htmlFor={`${slot}-supplement`}>
              Single-room supplement · EGP per single room for the entire stay
            </Label>
            <Input
              id={`${slot}-supplement`}
              type="number"
              min={0}
              step="0.01"
              value={form.singleSupplement ?? ""}
              onChange={(e) =>
                field(
                  "singleSupplement",
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter zero if included. Leave blank while undecided; publishing
              requires a value.
            </p>
          </div>
          <div>
            <Label htmlFor={`${slot}-terms`}>
              Package booking, payment and cancellation terms
            </Label>
            <Textarea
              id={`${slot}-terms`}
              rows={5}
              value={form.bookingTerms}
              onChange={(e) => field("bookingTerms", e.target.value)}
            />
          </div>
          {issues.length > 0 && (
            <div className="text-sm bg-amber-50 rounded-lg p-4">
              <p className="font-semibold mb-2">Before publishing</p>
              <ul className="list-disc pl-5">
                {issues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => save("draft")}>
              {saved?.status === "published"
                ? "Save and unpublish"
                : "Save draft"}
            </Button>
            <Button
              disabled={issues.length > 0}
              onClick={() => save("published")}
            >
              {saved?.status === "published"
                ? "Update published package"
                : "Publish package"}
            </Button>
            {saved?.status === "published" && (
              <Button variant="outline" asChild>
                <Link href={`/packages/${saved.slug}`}>View package</Link>
              </Button>
            )}
          </div>
        </fieldset>
        {message && (
          <p role="status" className="text-sm">
            {message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
export default function AdminPackages() {
  const {
    data = [],
    isLoading,
    error,
  } = useQuery<TravelPackage[]>({
    queryKey: ["/api/admin/packages"],
    queryFn: async () => {
      const r = await adminFetch("/api/admin/packages");
      if (!r.ok)
        throw new Error(
          r.status === 401 || r.status === 403
            ? "Sign in as an administrator to manage packages"
            : "Package infrastructure is unavailable. Check that its database migration has been applied.",
        );
      return r.json();
    },
    retry: false,
  });
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/admin" className="text-teal-700">
        ← Back to admin
      </Link>
      <h1 className="text-3xl font-bold mt-6">Ready-made packages</h1>
      <p className="text-muted-foreground mt-2 mb-8">
        Three programs, ordered by slot on the homepage. Save drafts while
        preparing content; publishing enables the public page and booking form.
      </p>
      {isLoading ? (
        <p>Loading packages…</p>
      ) : error ? (
        <p role="alert">{(error as Error).message}</p>
      ) : (
        <div className="space-y-8">
          {[1, 2, 3].map((slot) => {
            const saved = data.find((p) => p.slot === slot);
            return (
              <Editor
                key={`${slot}-${saved?.version ?? 0}`}
                slot={slot}
                saved={saved}
              />
            );
          })}
        </div>
      )}
    </main>
  );
}
