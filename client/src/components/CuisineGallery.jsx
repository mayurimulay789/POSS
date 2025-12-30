import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/apiConfig';

const CuisineGallery = () => {
  const [cuisineBackground, setCuisineBackground] = useState(null);
  const [cuisineCards, setCuisineCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCuisineImage, setSelectedCuisineImage] = useState(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchCuisineImages = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/hotel-images/public`);
        const images = Array.isArray(res.data) ? res.data : [];
        
        // Find background image
        let cuisineBg = images.find(
          (img) =>
            img.isCuisineGallery === true ||
            img.isCuisineGallery === 'true' ||
            img.isCuisineGallery === 1 ||
            img.isCuisineGallery === '1'
        );
        
        // Find card images
        const cardImages = images.filter(
          (img) =>
            img.isCuisineCard === true ||
            img.isCuisineCard === 'true' ||
            img.isCuisineCard === 1 ||
            img.isCuisineCard === '1'
        );

        // Fallback: if no explicit background but card images exist, use first card as background
        if (!cuisineBg && cardImages.length > 0) {
          cuisineBg = cardImages[0];
        }

        setCuisineBackground(cuisineBg || null);
        setSelectedCuisineImage(cuisineBg || null);
        setCuisineCards(cardImages);
      } catch (err) {
        console.error('Failed to load cuisine images:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCuisineImages();
  }, []);

  return (
    <section 
      id="gallery"
      className="py-20 md:py-32 relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: selectedCuisineImage 
          ? `url(${selectedCuisineImage.url})`
          : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
      }}
    >
      {/* Background Selection Checkbox */}
      {/* Removed Show Background checkbox */}

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          {/* <p className="text-amber-500 text-sm uppercase tracking-widest font-semibold mb-4">
            Discover Our Menu
          </p> */}
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Our Cuisine Gallery
          </h2>
          <div className="flex justify-center mb-6">
            <div className="w-24 h-1 bg-[#FF9800]"></div>
          </div>
          {/* <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Explore our exquisite collection of culinary masterpieces, crafted with passion and presented with elegance
          </p> */}
        </div>

        {/* Scrolling Cards Container */}
        <div className="relative overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-white text-lg">Loading cuisine gallery...</div>
            </div>
          ) : cuisineCards.length > 0 ? (
            <div className="relative w-full overflow-hidden" style={{
              maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
            }}>
              <div 
                className="flex gap-8 w-max"
                style={{
                  animation: isPaused ? 'none' : 'scroll 40s linear infinite'
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {/* Duplicate items for seamless loop */}
                {[...cuisineCards, ...cuisineCards].map((item, index) => (
                  <div
                    key={`${item._id}-${index}`}
                    className="flex-shrink-0 w-[350px] max-sm:w-[280px]"
                  >
                    <div className="group relative h-80 rounded-xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-amber-500/50">
                      {/* Image */}
                      <img
                        src={item.url}
                        alt={item.alt || item.title || 'Cuisine Image'}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-50 group-hover:opacity-60 transition-opacity duration-300"></div>
                      
                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transition-transform duration-300">
                        {item.title && (
                          <h3 className="text-2xl font-serif font-bold mb-2 group-hover:text-amber-400 transition-colors duration-300">
                            {item.title}
                          </h3>
                        )}
                        {item.alt && item.alt !== item.title && (
                          <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                            {item.alt}
                          </p>
                        )}
                      </div>

                      {/* Decorative Corner */}
                      <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/20 backdrop-blur-sm transform rotate-45 translate-x-8 -translate-y-8 group-hover:bg-amber-500/30 transition-colors duration-300"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-white text-xl mb-2">No cuisine images available</p>
              <p className="text-gray-400">Add images and check "Show in cuisine gallery" in Hotel Images</p>
            </div>
          )}
        </div>
      </div>

      {/* Keyframe Animation */}
      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
};

export default CuisineGallery;
