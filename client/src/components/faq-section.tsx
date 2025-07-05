import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: 1,
    question: "Is Egypt safe for tourists right now?",
    answer: "Yes, Egypt is generally safe for tourists, especially in major destinations like Cairo, Luxor, Aswan, and the Red Sea resorts. We monitor all regions closely and tailor each itinerary to ensure your comfort and safety, with private transport and local support at every step."
  },
  {
    id: 2,
    question: "Do I need a visa to enter Egypt?",
    answer: "Most travelers can obtain an e-Visa online before arrival or purchase one on arrival at major airports. We'll guide you through the process after booking. Some nationalities require pre-approval—check with your local embassy or ask us."
  },
  {
    id: 3,
    question: "What's included in my tour price?",
    answer: "All our itineraries are fully transparent, with no hidden fees. Inclusions typically cover private transportation, expert guides, entrance tickets, bottled water, and all mentioned activities. Optional extras or personal spending are clearly listed before booking."
  },
  {
    id: 4,
    question: "Can I customise my itinerary?",
    answer: "Absolutely! Our trips are designed around you. Whether you're a couple, a solo traveler, or a family, you can customise everything—hotel category, pace, guides, and even destinations."
  },
  {
    id: 5,
    question: "What should I wear in Egypt?",
    answer: "Lightweight, breathable clothing is best, especially in warmer months. Respectful attire is advised when visiting mosques or local villages—covering shoulders and knees. Women may wish to carry a light scarf for religious sites."
  },
  {
    id: 6,
    question: "How do payments and deposits work?",
    answer: "We offer flexible payment options. You can secure your trip with a small deposit (usually 10–20%), and the balance is payable upon arrival in cash or card (depending on services booked). All details are clearly outlined before confirming."
  },
  {
    id: 7,
    question: "Is tipping expected in Egypt?",
    answer: "Yes, tipping is customary and appreciated. We offer clear tipping guidelines per tour so you're never caught off guard. You can also choose to pre-pay a fair tip package if preferred."
  },
  {
    id: 8,
    question: "Can I travel on a budget with quality service?",
    answer: "Definitely. That's the heart of our mission. We offer fair prices for quality services—private cars, certified guides, curated experiences—at rates accessible to budget-conscious travelers, without cutting corners."
  },
  {
    id: 9,
    question: "What if I want to join other travelers to reduce costs?",
    answer: "We can arrange small-group experiences with like-minded travelers to lower costs while keeping quality high. Let us know your travel dates, and we'll connect you with others when possible."
  },
  {
    id: 10,
    question: "Do you offer support during the trip?",
    answer: "Yes. We provide 24/7 local support via WhatsApp and phone, in case of delays, last-minute questions, or emergencies. You're never alone—our local team is always one message away."
  }
];

export default function FAQSection() {
  const { t } = useTranslation();
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Dynamic FAQ data using translations
  const translatedFaqs = [
    {
      id: 1,
      question: t('faq.questions.safety.question'),
      answer: t('faq.questions.safety.answer')
    },
    {
      id: 2,
      question: t('faq.questions.visa.question'),
      answer: t('faq.questions.visa.answer')
    },
    {
      id: 3,
      question: t('faq.questions.price.question'),
      answer: t('faq.questions.price.answer')
    },
    {
      id: 4,
      question: t('faq.questions.customise.question'),
      answer: t('faq.questions.customise.answer')
    },
    {
      id: 5,
      question: t('faq.questions.currency.question'),
      answer: t('faq.questions.currency.answer')
    },
    {
      id: 6,
      question: t('faq.questions.weather.question'),
      answer: t('faq.questions.weather.answer')
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {translatedFaqs.map((faq) => (
            <Card key={faq.id} className="border border-gray-200 shadow-sm">
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full text-left p-6 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  {openItems.includes(faq.id) ? (
                    <ChevronUp className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  )}
                </div>
              </button>
              
              {openItems.includes(faq.id) && (
                <CardContent className="px-6 pb-6 pt-0">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-700 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://wa.me/1234567890" 
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              WhatsApp Support
            </a>
            <a 
              href="mailto:info@affordegypt.com" 
              className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors duration-200"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}