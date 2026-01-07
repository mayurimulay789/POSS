import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCuisineGallery } from '../store/slices/cuisineGallerySlice';
import { fetchCuisineCards, fetchCuisineBackground } from '../store/slices/cuisineCardsSlice';
// ...existing code...

const CuisineGallery = () => {
  const dispatch = useDispatch();
  const cuisineGallery = useSelector(state => state.cuisineGallery);
  const { loading } = cuisineGallery;
  const cuisineBackground = useSelector(state => state.cuisineCards.background);
  const backgroundLoading = useSelector(state => state.cuisineCards.backgroundLoading);
  const cuisineCardsState = useSelector(state => state.cuisineCards);
  const { cards: cuisineCards, loading: cardsLoading } = cuisineCardsState;
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    dispatch(fetchCuisineGallery());
    dispatch(fetchCuisineCards());
    dispatch(fetchCuisineBackground());
  }, [dispatch]);

  const galleryContent = cuisineGallery?.data;

  return (
    <section 
      id="gallery"
      className="py-6 sm:py-12 md:py-20 lg:py-28 relative bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: cuisineBackground && cuisineBackground.url
          ? `url(${cuisineBackground.url})`
          : 'none',
        backgroundColor: cuisineBackground && cuisineBackground.url ? 'transparent' : '#F9FAFB',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Background Selection Checkbox */}
      {/* Removed Show Background checkbox */}

      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        {galleryContent ? (
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif mt-2 sm:mt-3 mb-3 sm:mb-4 italic text-[#F1A722] px-2">
              {galleryContent.heading}
            </h2>
            <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
              <div className="w-16 sm:w-20 md:w-28 h-[2px] bg-[#F1A722]"></div>
            </div>
            {galleryContent.subheading && (
              <p className="text-[#0A2F46] max-w-2xl mx-auto text-sm sm:text-base md:text-lg font-medium px-4">
                {galleryContent.subheading}
              </p>
            )}
          </div>
        ) : (
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <div className="text-3xl sm:text-4xl md:text-5xl mb-3">🍽️</div>
            <p className="text-white text-base sm:text-lg">Cuisine Gallery Coming Soon</p>
          </div>
        )}

        {/* Scrolling Cards Container */}
        <div className="relative overflow-hidden">
          {loading || cardsLoading || backgroundLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-white text-lg">Loading cuisine gallery...</div>
            </div>
          ) : cuisineCards.length > 0 ? (
            <div className="relative w-full overflow-hidden" style={{
              maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
            }}>
              <div 
                className="flex gap-3 sm:gap-5 md:gap-7 w-max"
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
                    className="flex-shrink-0 w-[220px] sm:w-[280px] md:w-[340px]"
                  >
                    <div className="group relative h-[280px] sm:h-[320px] md:h-[360px] rounded-lg sm:rounded-xl overflow-hidden shadow-lg sm:shadow-xl border-2 sm:border-3 md:border-4 border-[#14AAAB] transition-all duration-500 hover:scale-105 hover:border-[#F1A722] hover:shadow-2xl">
                      {/* Image */}
                      <img
                        src={item.url}
                        alt={item.alt || item.title || 'Cuisine Image'}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A2F46] via-[#0A2F46]/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                      
                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-5 text-white transition-transform duration-300">
                        {item.title && (
                          <h3 className="text-lg sm:text-xl md:text-2xl font-serif font-bold mb-1 text-[#F1A722] line-clamp-1">
                            {item.title}
                          </h3>
                        )}
                        {item.alt && item.alt !== item.title && (
                          <p className="text-white text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2">
                            {item.alt}
                          </p>
                        )}
                      </div>

                      {/* Decorative Corner */}
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-[#D32B36] rounded-full flex items-center justify-center text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-sm sm:text-base md:text-lg">→</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12 md:py-16 px-4">
              <div className="text-4xl sm:text-5xl mb-3">🍽️</div>
              <p className="text-white text-base sm:text-lg mb-2">No cuisine images available</p>
              <p className="text-white/70 text-xs sm:text-sm">Add images and check "Show in cuisine gallery" in Hotel Images</p>
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
