import PackageConcept from "@/components/package-concept";
import { useRef, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  singleRoomOptions,
  type TravelPackage,
  type PackagePricing,
} from "@shared/travel-packages";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SeoMeta from "@/components/seo-meta";
import { TourPrice } from "@/components/currency-estimate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export default function PackageDetail() {
  const { t } = useTranslation();
  const [, params] = useRoute("/packages/:slug");
  const [, navigate] = useLocation();
  const slug = params?.slug;
  const client = useQueryClient();
  const [travelers, setTravelers] = useState(2);
  const [singleRooms, setSingleRooms] = useState(0);
  const [travelDate, setTravelDate] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [requests, setRequests] = useState("");
  const [terms, setTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const request = useRef({ payload: "", key: "" });
  const pkgQuery = useQuery<TravelPackage>({
    queryKey: [`/api/packages/${slug}`],
    enabled: !!slug,
    retry: false,
  });
  const pkg = pkgQuery.data;
  const selectedSingles = pkg?.nights ? singleRooms : 0;
  const priceQuery = useQuery<PackagePricing>({
    queryKey: ["package-price", slug, travelers, selectedSingles, pkg?.version],
    enabled: !!pkg,
    queryFn: async () => {
      const response = await fetch(
        `/api/packages/${encodeURIComponent(slug!)}/price`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ travelers, singleRooms: selectedSingles }),
        },
      );
      if (!response.ok) throw new Error("Package price unavailable");
      return response.json();
    },
    staleTime: 0,
    retry: false,
  });
  const pricing = priceQuery.data;
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  async function book(event: React.FormEvent) {
    event.preventDefault();
    if (!pricing || !pkg || submitting || priceQuery.isFetching) return;
    setError("");
    setSubmitting(true);
    const payload = {
      travelers,
      singleRooms: selectedSingles,
      travelDate,
      customerName: name,
      customerEmail: email,
      customerPhone: phone,
      specialRequests: requests,
      termsAccepted: terms,
      expectedTotal: pricing.total,
      packageVersion: pricing.packageVersion,
    };
    const serialized = JSON.stringify({ slug, ...payload });
    if (request.current.payload !== serialized)
      request.current = { payload: serialized, key: crypto.randomUUID() };
    try {
      const response = await fetch(
        `/api/packages/${encodeURIComponent(slug!)}/bookings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, requestKey: request.current.key }),
        },
      );
      if (!response.ok) {
        if (response.status === 409) {
          setTerms(false);
          await client.invalidateQueries({
            queryKey: [`/api/packages/${slug}`],
          });
          await client.invalidateQueries({ queryKey: ["package-price", slug] });
          throw new Error(t("packages.priceChanged"));
        }
        throw new Error(t("packages.bookingError"));
      }
      const booking = await response.json();
      navigate(
        `/booking-confirmation/${encodeURIComponent(booking.bookingReference)}`,
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }
  if (!pkg)
    return (
      <>
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-20">
          <h1 className="text-3xl mb-4">
            {t(pkgQuery.isLoading ? "packages.loading" : "packages.notFound")}
          </h1>
          <Link href="/packages">{t("packages.back")}</Link>
        </main>
        <Footer />
      </>
    );
  return (
    <>
      <SeoMeta
        title={`${pkg.title} | AffordEgypt`}
        description={pkg.summary}
        canonical={`https://affordegypt.com/packages/${pkg.slug}`}
      />
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/packages" className="text-sm text-teal-700">
          {t("packages.back")}
        </Link>
        <header className="my-6">
          <p className="text-teal-700">
            {t("packages.duration", {
              days: pkg.durationDays,
              nights: pkg.nights,
            })}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mt-2">{pkg.title}</h1>
          <p className="text-xl text-muted-foreground mt-4 max-w-3xl">
            {pkg.summary}
          </p>
        </header>
        {pkg.imageUrl && (
          <img
            src={pkg.imageUrl}
            alt={pkg.title}
            className="w-full max-h-[480px] object-cover rounded-2xl mb-10"
          />
        )}
        <PackageConcept />
        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-10 items-start">
          <div className="min-w-0 space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4">
                {t("packages.overview")}
              </h2>
              <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                {pkg.description}
              </p>
            </section>
            <section>
              <h2 className="text-2xl font-bold mb-6">
                {t("packages.itinerary")}
              </h2>
              <ol className="space-y-5">
                {pkg.itinerary.map((day, index) => (
                  <li key={index} className="border-l-2 border-teal-200 pl-5">
                    <p className="text-sm font-semibold text-teal-700">
                      {t("packages.day", { day: index + 1 })}
                    </p>
                    <h3 className="text-lg font-semibold mt-1">{day.title}</h3>
                    <p className="text-muted-foreground whitespace-pre-line mt-2">
                      {day.description}
                    </p>
                  </li>
                ))}
              </ol>
            </section>
            <div className="grid sm:grid-cols-2 gap-6">
              {(["inclusions", "exclusions"] as const).map((key) => (
                <section key={key} className="rounded-xl bg-gray-50 p-5">
                  <h2 className="text-xl font-bold mb-4">
                    {t(`packages.${key}`)}
                  </h2>
                  <ul className="list-disc pl-5 space-y-2">
                    {pkg[key].map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
            <section>
              <h2 className="text-2xl font-bold mb-4">
                {t("packages.groupRates")}
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {t("packages.rateExplanation")}
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">
                        {t("packages.travelers")}
                      </th>
                      <th className="text-left p-3">
                        {t("packages.perPerson")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(pkg.perPersonRates).map(([count, rate]) => (
                      <tr key={count} className="border-b">
                        <td className="p-3">{count}</td>
                        <td className="p-3">
                          <TourPrice amount={rate} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <section id="package-terms">
              <h2 className="text-2xl font-bold mb-4">{t("packages.terms")}</h2>
              <p className="whitespace-pre-line text-muted-foreground">
                {pkg.bookingTerms}
              </p>
            </section>
          </div>
          <Card className="lg:sticky lg:top-24">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-2">{t("packages.book")}</h2>
              <p className="text-sm text-muted-foreground mb-5">
                {t("packages.requestNote")}
              </p>
              <form onSubmit={book} className="space-y-4">
                <div>
                  <Label htmlFor="package-travelers">
                    {t("packages.travelers")}
                  </Label>
                  <select
                    id="package-travelers"
                    className="w-full border rounded-md p-2 mt-1 bg-background"
                    value={travelers}
                    disabled={submitting}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      setTravelers(n);
                      setSingleRooms(n % 2);
                    }}
                  >
                    {Array.from({ length: 11 }, (_, i) => i + 2).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
                {!!pkg.nights && (
                  <div>
                    <Label htmlFor="package-single-rooms">
                      {t("packages.singleRooms")}
                    </Label>
                    <select
                      id="package-single-rooms"
                      className="w-full border rounded-md p-2 mt-1 bg-background"
                      value={singleRooms}
                      disabled={submitting}
                      onChange={(e) => setSingleRooms(Number(e.target.value))}
                    >
                      {singleRoomOptions(travelers).map((n) => (
                        <option key={n} value={n}>
                          {t("packages.roomOption", {
                            single: n,
                            double: (travelers - n) / 2,
                          })}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-muted-foreground mt-2">
                      {t("packages.supplementNote")}
                    </p>
                  </div>
                )}
                <div>
                  <Label htmlFor="package-date">
                    {t("packages.departure")}
                  </Label>
                  <Input
                    id="package-date"
                    onInput={(e) => setTravelDate(e.currentTarget.value)}
                    type="date"
                    min={today}
                    required
                    disabled={submitting}
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                  />
                </div>
                <div
                  className="bg-teal-50 rounded-lg p-4 space-y-3"
                  aria-live="polite"
                >
                  {priceQuery.isFetching ? (
                    <p>{t("packages.pricing")}</p>
                  ) : pricing ? (
                    <>
                      <p className="text-xs text-muted-foreground">
                        {t("packages.tier", { tier: pricing.tier })}
                      </p>
                      <div>
                        <p className="text-sm">{t("packages.baseTotal")}</p>
                        <TourPrice amount={pricing.baseTotal} />
                      </div>
                      {pricing.singleRooms > 0 && (
                        <div>
                          <p className="text-sm">
                            {t("packages.supplementTotal")}
                          </p>
                          <TourPrice amount={pricing.supplementTotal} />
                        </div>
                      )}
                      <div className="border-t pt-3">
                        <p className="font-semibold">{t("packages.total")}</p>
                        <span className="text-2xl font-bold text-teal-800">
                          <TourPrice amount={pricing.total} showNote />
                        </span>
                      </div>
                    </>
                  ) : (
                    <p role="alert">{t("packages.priceUnavailable")}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="package-name">{t("packages.name")}</Label>
                  <Input
                    id="package-name"
                    autoComplete="name"
                    maxLength={200}
                    minLength={2}
                    required
                    disabled={submitting}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="package-email">{t("packages.email")}</Label>
                  <Input
                    id="package-email"
                    type="email"
                    autoComplete="email"
                    maxLength={320}
                    required
                    disabled={submitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="package-phone">{t("packages.phone")}</Label>
                  <Input
                    id="package-phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={64}
                    minLength={5}
                    required
                    disabled={submitting}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="package-requests">
                    {t("packages.requests")}
                  </Label>
                  <Textarea
                    id="package-requests"
                    maxLength={2000}
                    disabled={submitting}
                    value={requests}
                    onChange={(e) => setRequests(e.target.value)}
                  />
                </div>
                <label className="flex items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1"
                    required
                    disabled={submitting}
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                  />
                  <span>
                    {t("packages.accept")}{" "}
                    <a
                      href="#package-terms"
                      className="text-teal-700 underline"
                    >
                      {t("packages.terms")}
                    </a>{" "}
                    ·{" "}
                    <Link
                      href="/privacy-policy"
                      className="text-teal-700 underline"
                    >
                      {t("packages.privacy")}
                    </Link>
                  </span>
                </label>
                {error && (
                  <p role="alert" className="text-sm text-red-700">
                    {error}
                  </p>
                )}
                <Button
                  className="w-full"
                  type="submit"
                  disabled={
                    submitting ||
                    !pricing ||
                    priceQuery.isFetching ||
                    priceQuery.isError
                  }
                >
                  {t(submitting ? "packages.submitting" : "packages.submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </>
  );
}
