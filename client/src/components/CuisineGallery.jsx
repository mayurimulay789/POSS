import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCuisineGallery } from '../store/slices/cuisineGallerySlice';
import { fetchCuisineCards, fetchCuisineBackground } from '../store/slices/cuisineCardsSlice';

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
    <>
      {/* Section Header - Outside the background image */}
      <div className="bg-[#0A2F46] pt-8 sm:pt-10 pb-6 sm:pb-8">
        <div className="container mx-auto px-4 sm:px-6">
          {galleryContent ? (
            <div className="text-center">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic font-medium text-[#F1A722] leading-tight mb-2">
                {galleryContent.heading}
              </h2>
              <div className="flex justify-center mb-4">
                <div className="w-20 sm:w-28 h-[3px] bg-[#F1A722] rounded-full"></div>
              </div>
              {galleryContent.subheading && (
                <p className="text-white max-w-2xl mx-auto text-base sm:text-lg md:text-xl font-light tracking-wide px-4">
                  {galleryContent.subheading}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-3">🍽️</div>
              <p className="text-white text-lg">Cuisine Gallery Coming Soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Scrolling Images Section */}
      <section 
        id="gallery"
        className="py-12 sm:py-16 md:py-20 relative bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: cuisineBackground?.url ? `url(${cuisineBackground.url})` : 'none',
          backgroundColor: cuisineBackground?.url ? 'transparent' : '#0A2F46',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {loading || cardsLoading || backgroundLoading ? (
            <div className="flex items-center justify-center h-80">
              <div className="text-white text-lg animate-pulse">Loading cuisine gallery...</div>
            </div>
          ) : cuisineCards.length > 0 ? (
            <div className="relative w-full overflow-hidden">
              <div 
                className="flex gap-4 sm:gap-6 md:gap-8 w-max"
                style={{
                  animation: isPaused ? 'none' : 'scroll 40s linear infinite'
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                {[...cuisineCards, ...cuisineCards].map((item, index) => (
                  <div
                    key={`${item._id}-${index}`}
                    className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px]"
                  >
                    <div className="group relative h-[220px] sm:h-[260px] md:h-[300px] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#14AAAB]/50 transition-all duration-500 hover:scale-105 hover:border-[#F1A722] hover:shadow-[#F1A722]/20">
                      <img
                        src={item.url}
                        alt={item.alt || item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                        {item.title && (
                          <h3 className="text-xl sm:text-2xl font-serif font-bold mb-1 text-[#F1A722]">
                            {item.title}
                          </h3>
                        )}
                        {item.alt && item.alt !== item.title && (
                          <p className="text-white/90 text-sm line-clamp-2 italic">
                            {item.alt}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-white/60">No cuisine images available</p>
            </div>
          )}
        </div>
      </section>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
};

export default CuisineGallery;