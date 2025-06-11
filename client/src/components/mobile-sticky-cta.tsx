import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Backpack, Truck } from "lucide-react";
import { Link } from "wouter";

export default function MobileStickyCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsVisible(scrollPosition > 180);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBooking = () => {
    const bookingSection = document.getElementById('booking-wizard');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex">
        <button
          onClick={scrollToBooking}
          className="flex-1 bg-teal-600 text-white px-4 py-4 font-medium flex items-center justify-center space-x-2 hover:bg-teal-700 transition-colors"
        >
          <Backpack className="w-4 h-4" />
          <span>Build My Trip</span>
        </button>
        <Link
          href="/transfers"
          className="flex-1 bg-orange-500 text-white px-4 py-4 font-medium flex items-center justify-center space-x-2 hover:bg-orange-600 transition-colors"
        >
          <Truck className="w-4 h-4" />
          <span>Book Transfer</span>
        </Link>
      </div>
    </div>
  );
}