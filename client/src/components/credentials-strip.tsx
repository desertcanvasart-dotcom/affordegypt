// Single-line trust strip directly under the hero. Replaces the generic
// stat row (4.9/5 / 2,500+ / Verified Guides / All Egypt) — those numbers
// don't do as much trust work as the registered-operator framing here.

export default function CredentialsStrip() {
  return (
    <section className="bg-gray-50 border-b border-gray-200 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-gray-700 leading-relaxed">
          <span className="font-semibold text-gray-900">
            Operated by Capital Travel Service
          </span>
          <span className="mx-2 text-gray-400">·</span>
          ETAA 2179
          <span className="mx-2 text-gray-400">·</span>
          Licensed since 2003
          <span className="mx-2 text-gray-400">·</span>
          2,500+ travelers across Egypt
        </p>
      </div>
    </section>
  );
}
