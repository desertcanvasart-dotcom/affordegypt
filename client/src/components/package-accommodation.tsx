import { useTranslation } from "react-i18next";
const stays = [
  { place: "cairo", name: "Obelisk GEM Inn Museum", url: "https://www.laterooms.com/hotel/cairo/obelisk-gem-inn-museum/", listing: true }, // i18n-exempt: property brand name
  { place: "cairo", name: "Occidental Cairo Grand Museum", url: "https://www.barcelo.com/en-ww/occidental-cairo-grand-museum/" }, // i18n-exempt: property brand name
  { place: "aswan", name: "Obelisk Nile Hotel Aswan", url: "https://obeliskhotels.com/" }, // i18n-exempt: property brand name
  { place: "luxor", name: "Aracan Eatabe Luxor Hotel", url: "https://aracan.ca/aracan-eatabe-luxor-hotel/" }, // i18n-exempt: property brand name
  { place: "hurghada", name: "The Grand Hotel, Hurghada", url: "https://redseahotels.com/resorts/hurghada/the-grand-hotel-hurghada/" }, // i18n-exempt: property brand name
  { place: "cruise", name: "SENTIDO M/S Nile Saray", url: "https://www.sunrise-resorts.com/ms-nile-saray" }, // i18n-exempt: property brand name
];
const programPlaces: Record<string, string[]> = {
  "egypt-discovery-cairo-luxor-6-days": ["cairo", "luxor"],
  "egypt-discovery-8-days": ["cairo", "cruise"],
  "egypt-discovery-11-days": ["cairo", "aswan", "hurghada", "cruise"],
};
export default function PackageAccommodation({ slug }: { slug?: string }) {
  const { t } = useTranslation();
  const places = slug ? programPlaces[slug] : undefined;
  if (slug && !places) return null;
  return (
    <section className="rounded-xl border bg-teal-50/40 p-6 my-8" id="accommodation">
      <h2 className="text-2xl font-bold mb-3">{t("packages.accommodationTitle")}</h2>
      <p className="text-muted-foreground mb-5">{t("packages.accommodationIntro")}</p>
      <ul className="grid sm:grid-cols-2 gap-4">
        {stays.filter(stay => !places || places.includes(stay.place)).map(stay => (
          <li key={stay.name}>
            <p className="text-sm text-muted-foreground">{t(`packages.stayPlaces.${stay.place}`)}</p>
            <a className="font-semibold text-teal-800 underline underline-offset-4" href={stay.url} target="_blank" rel="noopener noreferrer">{stay.name}</a>
            <p className="text-xs text-muted-foreground mt-1">{t(stay.listing ? "packages.hotelListing" : "packages.officialWebsite")}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
