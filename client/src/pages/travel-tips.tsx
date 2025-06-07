import { Helmet } from "react-helmet-async";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function TravelTips() {
  return (
    <>
      <Helmet>
        <title>Budget Travel in Egypt: The Ultimate 2025 Guide</title>
        <meta name="description" content="Your ultimate 2025 guide to exploring the wonders of Egypt without breaking the bank. Get insider tips on transport, food, accommodation, and attractions." />
      </Helmet>
      
      <div className="min-h-screen bg-white">
        <Navbar />
        {/* Hero Section */}
        <header 
          className="min-h-[90vh] flex items-center justify-center relative"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('http://travel2egypt.org/wp-content/uploads/2025/06/karnak-temple.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-inter">
              Egypt Budget Travel <span className="text-primary">Made Simple</span>
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
              Your ultimate 2025 guide to exploring the wonders of Egypt without breaking the bank. 
              Get insider tips on transport, food, accommodation, and attractions.
            </p>
            
            {/* Process Steps */}
            <div className="flex flex-wrap justify-center gap-4 mt-12 mb-8">
              <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">1</div>
                <h4 className="font-semibold mb-2">Plan & Prepare</h4>
                <p className="text-sm opacity-90">Visas, timing, and essential checklists.</p>
              </div>
              <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">2</div>
                <h4 className="font-semibold mb-2">Budget & Book</h4>
                <p className="text-sm opacity-90">Master your spending and find great deals.</p>
              </div>
              <div className="bg-white/10 border border-white/20 backdrop-blur-sm p-5 rounded-lg w-60 text-center">
                <div className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-3">3</div>
                <h4 className="font-semibold mb-2">Explore Smartly</h4>
                <p className="text-sm opacity-90">Navigate like a local and see the best sights.</p>
              </div>
            </div>
            
            <a href="#itinerary" className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:-translate-y-1">
              See Sample Itinerary ↓
            </a>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          
          {/* Introduction */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
              Why Egypt in 2025 Is a Budget Traveler's Dream
            </h2>
            <p className="text-lg leading-relaxed mb-6">
              So, why does Egypt top the list for affordable travel in 2025? Let's start with the exchange rate. If you're arriving with US dollars, euros, or pounds, your money can go a long way here. The Egyptian Pound has seen some ups and downs over the past few years, and while inflation remains a concern locally, it often works in your favour as a visitor. Hotels, meals, transport, and even museum tickets can feel surprisingly affordable—especially when compared to what you'd spend for a similar experience in Europe or North America.
            </p>
            <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-lg mb-6">
              <p className="mb-0">
                <strong className="text-gray-800">Heads Up:</strong> Don't assume every price tag is a steal. Inflation, currency shifts, and dual pricing (locals vs. tourists) can sometimes throw a curveball. A little vigilance goes a long way—think of it like bargaining in a souk: you don't need to haggle hard, just be informed and savvy with your spending.
              </p>
            </div>
            <p className="text-lg leading-relaxed">
              Another bonus? Egypt is actively investing in its tourism scene. Beyond the timeless pyramids and temple ruins, you'll now find cutting-edge museums, interactive exhibitions, and even digital experiences that blend ancient history with modern storytelling. And since many of these are newly launched, they often come with introductory pricing—a win for travelers who want more for less.
            </p>
          </section>

          {/* Best Times to Visit */}
          <section className="mb-16 bg-gray-50 -mx-4 px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
                Best Times to Visit on a Budget
              </h2>
              <p className="text-lg leading-relaxed mb-8">
                When it comes to visiting Egypt, timing really is everything—especially if you're trying to stretch your budget without compromising comfort or adventure. Choosing the right season can make all the difference.
              </p>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                  <div className="text-2xl text-primary mb-4">🌿</div>
                  <h4 className="text-xl font-semibold mb-2">Spring & Autumn: The Sweet Spot</h4>
                  <p><strong>(Mar–May & Sep–Nov)</strong> The perfect mix of decent weather, manageable crowds, and affordable prices. Airlines and hotels are often more generous with their deals. This is the best value for money.</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                  <div className="text-2xl text-primary mb-4">☀️</div>
                  <h4 className="text-xl font-semibold mb-2">Summer: Low Prices, High Heat</h4>
                  <p><strong>(Jun–Aug)</strong> If you don't mind serious heat, this could be your budget jackpot. Tailor your itinerary wisely with coastal time in Alexandria or Dahab. You'll find some of the lowest prices of the year.</p>
                </div>
              </div>
              <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg">
                <p className="mb-0">
                  <strong className="text-foreground">Quick Tip:</strong> Winter (Dec–Feb) has gorgeous weather but comes with a heavier price tag as it's peak tourist season. If your budget is tight, aim for the shoulder seasons.
                </p>
              </div>
            </div>
          </section>

          {/* Pre-Travel Checklist */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
              Essential Pre-Travel Checklist
            </h2>
            <p className="text-lg leading-relaxed mb-8">
              Getting your travel documents sorted in advance is one of the smartest (and easiest!) ways to keep your Egyptian adventure stress-free.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">📖</div>
                <h4 className="text-xl font-semibold mb-2">1. Passport & Visa</h4>
                <p>Ensure your passport is valid for at least six months past your arrival. Most travelers need a visa. The <strong>e-Visa ($25 USD)</strong> is highly recommended and can be applied for online. Visa on Arrival is an option for some, but check rules as they can change.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">🛡️</div>
                <h4 className="text-xl font-semibold mb-2">2. Travel Insurance</h4>
                <p>Non-negotiable. It's your safety net for medical emergencies, trip cancellations, or lost baggage. Make sure your policy covers adventure activities like diving or hot air ballooning if they are on your itinerary.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">💉</div>
                <h4 className="text-xl font-semibold mb-2">3. Health & Vaccinations</h4>
                <p>No vaccines are mandatory for most, but Hepatitis A, Typhoid, and Tetanus are strongly recommended. Always drink bottled water and be mindful of food safety. Pack a small first-aid kit with essentials.</p>
              </div>
            </div>
          </section>

          {/* Budget Section */}
          <section className="mb-16 bg-gray-50 -mx-4 px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
                Crafting Your Budget: What to Expect in 2025 💰
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                Let's talk numbers. A smart budget is your best travel companion. We'll use an estimated rate of <strong>1 USD = 49.6 EGP</strong>, but always check current rates.
              </p>

              <h3 className="text-2xl font-semibold mb-4">Your Daily Budget in Egypt</h3>
              <p className="text-lg leading-relaxed mb-6">
                Most budget travelers in Egypt will find themselves spending somewhere between <strong>$50 and $80 USD a day.</strong> This sweet spot covers a hostel or budget hotel, local meals, public transport, and entrance fees to a major attraction or two.
              </p>

              <div className="bg-orange-50 border-l-4 border-orange-400 p-6 rounded-r-lg mb-8">
                <p className="mb-0">
                  <strong className="text-gray-800">Total Trip Cost (7-10 Days):</strong> Expect to spend around <strong>$800–$1,100 USD</strong> including flights from Europe/Asia. Flights from the U.S. or Australia will increase this total. Your flight will likely be your biggest single expense.
                </p>
              </div>

              <h3 className="text-2xl font-semibold mb-4">Top Money-Saving Hacks 💡</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>Eat Like a Local:</strong> A delicious meal of Koshary or a Falafel sandwich can cost as little as $1.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>Use Public Transport:</strong> The Cairo Metro is efficient, safe, and incredibly cheap (under $0.50 per ride).</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>Get an ISIC Card:</strong> If you're a student under 30, this card can get you 50% off at most historical sites.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>Haggle with a Smile:</strong> In local markets (souks), friendly bargaining is part of the culture.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>Buy Water in Bulk:</strong> Purchase 1.5L bottles from supermarkets, not small ones from tourist stalls.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Accommodation */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
              Affordable Accommodation 🛏️
            </h2>
            <p className="text-lg leading-relaxed mb-8">
              Finding the right place to rest your head in Egypt doesn't have to drain your wallet. From social hostels to private guesthouses, you have great options.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <h4 className="text-xl font-semibold mb-2">Hostels</h4>
                <p>The budget traveler's basecamp. Perfect for meeting others. Dorm beds start at <strong>$6–$12 USD</strong> per night in Cairo, Luxor, and Dahab.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <h4 className="text-xl font-semibold mb-2">Budget Hotels</h4>
                <p>For more privacy. You can find clean, private rooms for <strong>$15–$30 USD</strong> per night, often with an en-suite bathroom and A/C.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <h4 className="text-xl font-semibold mb-2">Nubian Stays</h4>
                <p>In Aswan, stay in a colorful, family-run Nubian guesthouse for a unique cultural experience. Rates are modest and the memories are priceless.</p>
              </div>
            </div>
          </section>

          {/* Food */}
          <section className="mb-16 bg-gray-50 -mx-4 px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
                Economical Eating: Savoring Egypt 🍲
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                Some of the most delicious meals you'll have in Egypt will be the cheapest. The golden rule is to follow the locals and embrace street food.
              </p>
              <h4 className="text-xl font-semibold mb-4">Must-Try Budget Eats:</h4>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>Koshari:</strong> The national dish. A hearty mix of rice, lentils, pasta, and spicy tomato sauce. <strong>Cost: &lt; $1 USD.</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>Ta'ameya (Falafel):</strong> Made from fava beans, served in fresh pita bread. <strong>Cost: ~ $0.50 USD.</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>Ful Medames:</strong> Slow-cooked fava beans, the breakfast of champions. <strong>Cost: &lt; $1 USD.</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>Shawarma:</strong> Juicy, garlicky, and craveable chicken or beef wraps. <strong>Cost: ~ $1.50 USD.</strong></span>
                </li>
              </ul>
              <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg">
                <p className="mb-0">
                  <strong className="text-foreground">Self-Catering Tip:</strong> Shopping at local markets is an adventure. A dozen eggs costs ~$1.41, a loaf of bread is ~$0.58, and fresh produce is incredibly cheap. This is a great way to save on breakfasts and lunches.
                </p>
              </div>
            </div>
          </section>

          {/* Transportation */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
              Getting Around Egypt Affordably 🚍
            </h2>
            <p className="text-lg leading-relaxed mb-8">
              Egypt is a large country, but its network of trains, buses, and local transport makes it easy to explore on a budget.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">🚂</div>
                <h4 className="text-xl font-semibold mb-2">Trains</h4>
                <p>Scenic and economical for long distances. A 2nd Class AC seat from <strong>Cairo to Luxor costs foreigners ~$31 USD</strong>. It's a comfortable and classic way to travel.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">🚌</div>
                <h4 className="text-xl font-semibold mb-2">Buses</h4>
                <p>The cheapest way to go. A bus from <strong>Cairo to Luxor can be as low as $8-$11 USD</strong>. Use companies like Go Bus or Blue Bus for reliable service.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">🚇</div>
                <h4 className="text-xl font-semibold mb-2">Local Transport</h4>
                <p>In Cairo, the <strong>Metro</strong> is your best friend. For taxis, use ride-hailing apps like <strong>Uber or Careem</strong> to get fair, transparent pricing and avoid haggling.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">🚐</div>
                <h4 className="text-xl font-semibold mb-2">Microbuses</h4>
                <p>For the truly adventurous. These are super cheap but challenging to navigate without Arabic. Best for short, common routes where you can follow the locals' lead.</p>
              </div>
            </div>
          </section>

          {/* Attractions */}
          <section className="mb-16 bg-gray-50 -mx-4 px-4 py-12">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
                Experiencing Egypt's Wonders on a Budget 🏛️
              </h2>
              <p className="text-lg leading-relaxed mb-8">
                Entrance fees can add up, but with smart planning, you can see the icons without emptying your wallet.
              </p>

              <h3 className="text-2xl font-semibold mb-4">Free and Low-Cost Activities</h3>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>Wander the Souks:</strong> Get lost in the sights and sounds of Khan el-Khalili in Cairo or the Aswan Old Souk. Window shopping is free!</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>Stroll the Corniche:</strong> Walk along the Nile promenade in Cairo, Luxor, or Aswan for beautiful sunset views.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>Explore Coptic & Islamic Cairo:</strong> Many of Cairo's oldest churches and mosques can be visited for free or a small donation.</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary font-bold mr-3">✓</span>
                  <span><strong>Visit Elephantine Island:</strong> Take the cheap public ferry in Aswan to wander through colourful Nubian villages.</span>
                </li>
              </ul>

              <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg" id="itinerary">
                <h3 className="text-2xl font-semibold mb-4">Sample 10-Day Budget Itinerary</h3>
                <p className="mb-4">This classic "Golden Triangle" route maximizes sights and minimizes costs.</p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-primary font-bold mr-3">✓</span>
                    <span><strong>Days 1-3: Cairo.</strong> See the Pyramids, Egyptian Museum, and Khan el-Khalili. Take overnight bus/train to Luxor.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary font-bold mr-3">✓</span>
                    <span><strong>Days 4-6: Luxor.</strong> Explore Karnak and Luxor Temples on the East Bank; Valley of the Kings and Hatshepsut Temple on the West Bank.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary font-bold mr-3">✓</span>
                    <span><strong>Days 7-8: Aswan.</strong> Visit Philae Temple, explore Nubian villages, and take a sunset felucca ride. Consider a budget tour to Abu Simbel.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary font-bold mr-3">✓</span>
                    <span><strong>Days 9-10:</strong> Return to Cairo for departure or extend your trip to Alexandria or the Red Sea.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Safety */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6">
              Staying Safe, Healthy & Culturally Aware
            </h2>
            <p className="text-lg leading-relaxed mb-8">
              A little preparation and respect go a long way in making your trip smooth and memorable.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">👗</div>
                <h4 className="text-xl font-semibold mb-2">Respect Local Customs</h4>
                <p>Dress modestly, especially when visiting religious sites. A simple "Salam Alaikum" (hello) is always appreciated. Be respectful when taking photos of people.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">💵</div>
                <h4 className="text-xl font-semibold mb-2">Understand Tipping</h4>
                <p>Tipping (baksheesh) is a part of life. Carry small notes (5, 10, 20 EGP) for tour guides, hotel staff, and bathroom attendants. A good tip for a full-day guide is 80-100 EGP.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-primary">
                <div className="text-2xl text-primary mb-4">💡</div>
                <h4 className="text-xl font-semibold mb-2">General Safety</h4>
                <p>Stay aware in crowded areas, avoid demonstrations, and use ride-hailing apps at night. For women's safety, dressing modestly and joining group tours can help minimize unwanted attention.</p>
              </div>
            </div>
          </section>

          {/* Conclusion */}
          <section className="text-center py-12">
            <h2 className="text-3xl font-bold text-foreground border-b-4 border-primary pb-2 mb-6 inline-block">
              Your Egyptian Dream Awaits!
            </h2>
            <p className="text-lg leading-relaxed mb-8 max-w-3xl mx-auto">
              Traveling to Egypt in 2025 on a budget is not only feasible but incredibly rewarding. With careful planning, an adventurous spirit, and a willingness to embrace the local culture, the timeless wonders of this ancient land are well within your reach.
            </p>
            <a href="#" onClick={() => window.scrollTo(0, 0)} className="inline-block bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-semibold transition-all transform hover:-translate-y-1">
              Back to Top ↑
            </a>
          </section>

        </main>
        <Footer />
      </div>
    </>
  );
}