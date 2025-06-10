import { Helmet } from "react-helmet-async";
import Navbar from "@/components/navbar";
import RoutesNavigation from "@/components/routes-navigation";
import { Car, MapPin, Clock, Star } from "lucide-react";

export default function RoutesOverview() {
  return (
    <>
      <Helmet>
        <title>Egypt Routes & Transportation - Affordable Travel Options | Afford Egypt</title>
        <meta name="description" content="Explore comprehensive transportation routes across Egypt. From inter-city journeys to city tours, find affordable and reliable travel options for your Egyptian adventure." />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Egypt Transportation Routes
              </h1>
              <p className="text-xl md:text-2xl text-teal-100 mb-8 max-w-3xl mx-auto">
                Discover convenient and affordable transportation options connecting Egypt's most fascinating destinations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-teal-100">
                <div className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  <span>Professional Drivers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>Flexible Scheduling</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  <span>Top-Rated Service</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Routes Categories */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Choose Your Route Type
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select from our comprehensive route categories to find the perfect transportation solution for your Egyptian journey
              </p>
            </div>

            <RoutesNavigation />
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Car className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Inter-City Routes</h3>
                <p className="text-gray-600">
                  Travel comfortably between Egypt's major cities with our reliable inter-city transportation services
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">City Tours</h3>
                <p className="text-gray-600">
                  Explore individual cities with dedicated local transportation and guided tour options
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-teal-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Flexible Timing</h3>
                <p className="text-gray-600">
                  Book transportation that fits your schedule with flexible departure times and duration options
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}