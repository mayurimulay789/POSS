import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCuisineGallery } from '../store/slices/cuisineGallerySlice';
import axios from 'axios';

const CuisineGallery = () => {
  const dispatch = useDispatch();
  const cuisineGallery = useSelector(state => state.cuisineGallery);
  const { loading } = cuisineGallery;
  const [cuisineBackground, setCuisineBackground] = useState(null);
  const [cuisineCards, setCuisineCards] = useState([]);
  const [isPaused, setIsPaused] = useState(false);

  // Default data
  const defaultGalleryData = {
    heading: 'Our Cuisine Gallery',
    subheading: 'Experience the Flavors',
    description: 'Explore our delicious culinary creations'
  };

  useEffect(() => {
    dispatch(fetchCuisineGallery());
    axios.get(`${import.meta.env.VITE_API_URL}/hotel-images/cuisine-gallery`)
      .then(res => setCuisineBackground(res.data))
      .catch(() => setCuisineBackground(null));
    
    // Fetch cuisine gallery images
    axios.get(`${import.meta.env.VITE_API_URL}/hotel-images?category=cuisine&showInCuisineGallery=true`)
      .then(res => setCuisineCards(res.data.data || []))
      .catch(() => setCuisineCards([]));
  }, [dispatch]);

  const galleryContent = cuisineGallery?.data || defaultGalleryData;

  return (
    <section 
      id="gallery"
      className="py-20 md:py-32 relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: cuisineBackground 
          ? `url(${cuisineBackground.url})`
          : 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
        backgroundAttachment: 'fixed'
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
            {galleryContent.heading}
          </h2>
          <div className="flex justify-center mb-6">
            <div className="w-24 h-1 bg-[#FF9800]"></div>
          </div>
          {galleryContent.subheading && (
            <p className="text-gray-300 max-w-2xl mx-auto text-lg">
              {galleryContent.subheading}
            </p>
          )}
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
