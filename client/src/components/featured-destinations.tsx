export default function FeaturedDestinations() {
  const destinations = [
    {
      name: "Cairo & Giza",
      description: "Pyramids, Sphinx, Islamic Cairo",
      image: "https://pixabay.com/get/gc3907a47ada5ea4d33214a9ca2f30dde8c33dd84992fa0e86609a7ed683a54adf6504d33277b05593855b5ba07cde8e8bfc9c5f7ea6d7edf8271cac45f4ee0fe_1280.jpg"
    },
    {
      name: "Luxor",
      description: "Valley of Kings, Karnak Temple",
      image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb"
    },
    {
      name: "Hurghada",
      description: "Red Sea diving, beaches",
      image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3"
    },
    {
      name: "Aswan",
      description: "Abu Simbel, Philae Temple",
      image: "https://pixabay.com/get/ge11207c7bb7becd360c687298420ab4d813de0f967472102cf31b40082536618da844fbec5080be19d8252c5b2b66463bc5952becdf5e80a50b124fdc683c377_1280.jpg"
    },
    {
      name: "Sharm El Sheikh",
      description: "Diving, Sinai Peninsula",
      image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7"
    },
    {
      name: "Alexandria",
      description: "Mediterranean coast, Library",
      image: "https://images.unsplash.com/photo-1591608971362-f08b2a75731a"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Popular Egyptian Destinations
          </h2>
          <p className="text-xl text-muted-foreground">
            From ancient pyramids to Red Sea resorts - we cover all major Egyptian destinations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl mb-4">
                <img 
                  src={destination.image} 
                  alt={destination.name} 
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-semibold">{destination.name}</h3>
                  <p className="text-sm opacity-90">{destination.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
