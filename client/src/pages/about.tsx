import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, Users, MapPin, Clock, Star } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function About() {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>About Us - Afford Egypt | Budget Travel Specialists</title>
        <meta name="description" content="Learn about Afford Egypt's mission to make Egyptian travel accessible to everyone. Since 2020, we've helped thousands explore Egypt safely and affordably." />
        <meta property="og:title" content="About Us - Afford Egypt | Budget Travel Specialists" />
        <meta property="og:description" content="Discover how Afford Egypt revolutionizes budget travel in Egypt with transparent pricing, safety standards, and authentic local experiences." />
      </Helmet>

      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section 
          className="relative text-white min-h-[90vh] flex items-center justify-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('http://travel2egypt.org/wp-content/uploads/2025/06/pyramids-desert.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/30 to-teal-700/30" />
          <div className="relative max-w-6xl mx-auto px-4 text-center">
            <Badge className="bg-white/20 text-white mb-6 text-sm px-4 py-2">
              <Heart className="w-4 h-4 mr-2" />
              Our Story
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              About Afford Egypt
            </h1>
            <p className="text-xl md:text-2xl text-teal-100 max-w-4xl mx-auto leading-relaxed">
              More than just a travel company - we're passionate Egypt specialists making authentic travel accessible to everyone.
            </p>
          </div>
        </section>

        {/* Mission Statement */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 -mt-12 relative z-10">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Afford Egypt is more than just a travel company; we are a dedicated team of passionate Egypt travel specialists who believe that everyone should have the opportunity to experience the magic of Egypt, regardless of their budget. Since our inception in 2020, we've proudly assisted thousands of travelers in exploring Egypt's unparalleled wonders without breaking the bank.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Our Core Values</h2>
              <p className="text-lg text-gray-600">What makes Afford Egypt different</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Safety First</h3>
                <p className="text-gray-600">
                  Budget travel shouldn't mean compromising on safety. Our vehicles are regularly inspected and maintained, and our accommodations adhere to rigorous safety protocols.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">For Young Travelers</h3>
                <p className="text-gray-600">
                  Being young travelers ourselves, we understand the needs of backpackers, friends seeking thrills, and couples on their first overseas adventure.
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Transparent Pricing</h3>
                <p className="text-gray-600">
                  Our transparent pricing model ensures families can plan confidently, knowing exactly what costs will be upfront with no hidden surprises.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">Our Story</h2>
            
            <div className="space-y-8">
              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Family-Focused Approach</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Afford Egypt also recognizes the challenges faced by families eager to discover Egypt without straining their finances. Traveling with children or extended family members can quickly become costly, and it's our mission to alleviate these financial pressures. Our transparent pricing model ensures that families can confidently plan their adventures, knowing exactly what their costs will be upfront. This approach eliminates surprises, enabling families to focus fully on enjoying their Egyptian experience.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Authentic Local Experiences</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Our commitment extends beyond simply offering budget-friendly tours; it also includes connecting travelers with authentic local experiences. Afford Egypt collaborates closely with knowledgeable local guides who bring history to life through insightful stories and personal narratives. These interactions foster a deeper understanding and appreciation of Egypt's vibrant culture and ancient traditions. Moreover, our reliance on reliable local transportation means our guests enjoy smoother, more immersive journeys.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Challenging Industry Norms</h3>
                    <p className="text-gray-700 leading-relaxed">
                      In a market crowded with travel options, Afford Egypt stands out by championing transparency, affordability, and inclusivity. We reject the idea that exploring the world should only be accessible to the wealthy. Our youthful perspective empowers us to challenge industry norms, continuously seeking innovative ways to deliver incredible experiences at accessible prices. Every package we offer, from short city breaks to comprehensive nationwide tours, reflects our core philosophy of making travel dreams achievable for everyone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex items-start gap-4 mb-6">
                  <div className="bg-teal-100 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Personal Customer Support</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Furthermore, our customer support is exceptional, personal, and direct. We maintain open lines of communication with our travelers, assisting them from the initial planning stages through to their safe return home. Unlike larger companies, we do not rely on automated chatbots or impersonal interactions. Instead, every question, request, and feedback is managed directly by our dedicated team members, who are committed to ensuring each trip exceeds expectations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Promise */}
        <section className="py-16 bg-teal-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Our Promise</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              As we continue to grow, our promise remains unwavering: to provide exceptional, memorable experiences that don't compromise on quality, safety, or authenticity—even at budget-friendly prices. Afford Egypt isn't just about traveling affordably; it's about traveling smartly, safely, and sustainably.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed mb-12">
              Join us and become part of a growing community of satisfied travelers who have discovered that exploring Egypt can be enriching, exciting, and affordable. Let Afford Egypt guide you through the splendors of ancient civilizations, modern culture, and everything in between—all while respecting your budget constraints and prioritizing your safety and well-being.
            </p>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <h3 className="text-2xl font-bold text-teal-600 mb-4">Your Egyptian Adventure Awaits</h3>
              <p className="text-gray-700 mb-6">
                Afford Egypt is here to ensure it's unforgettable and accessible for everyone.
              </p>
              <Link href="/#pricing-tool">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg">
                  Start Your Journey
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}