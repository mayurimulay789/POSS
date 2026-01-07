import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWelcomeSection } from '../store/slices/welcomeSectionSlice';
import axios from 'axios';

const WelcomeSection = () => {
  const dispatch = useDispatch();
  const welcomeSection = useSelector(state => state.welcomeSection);
  const [welcomeImage, setWelcomeImage] = React.useState(null);
  const [imgLoading, setImgLoading] = React.useState(true);

  useEffect(() => {
    dispatch(fetchWelcomeSection());
    setImgLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/hotel-images/welcome`)
      .then(res => setWelcomeImage(res.data))
      .catch(err => {
        // Silently handle 404 - no welcome image uploaded yet
        if (err.response?.status !== 404) {
          console.error('Error fetching welcome image:', err);
        }
        setWelcomeImage(null);
      })
      .finally(() => setImgLoading(false));
  }, [dispatch]);

  const content = welcomeSection?.data;

  if (!content) {
    return (
      <section className="relative py-20 bg-[#0A2F46] overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <div className="text-6xl mb-4">🏨</div>
          <p className="text-white text-xl">Welcome Section Coming Soon</p>
          <p className="text-white/70 text-sm mt-2">Content will be available shortly</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-8 sm:py-16 md:py-20 bg-[#0A2F46] overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-[#14AAAB] opacity-5 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 sm:w-36 sm:h-36 md:w-48 md:h-48 bg-[#F1A722] opacity-5 rounded-tr-full"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-16">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-10 md:mb-12">
          <span className="uppercase tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm text-[#D32B36] font-semibold">
            Welcome To
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif mt-3 sm:mt-4 mb-4 sm:mb-6 italic text-[#F1A722] font-bold px-2">
            {content.hotelName}
          </h2>
          <div className="w-16 sm:w-20 md:w-24 h-[2px] bg-[#F1A722] mx-auto mb-6 sm:mb-8"></div>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-8 sm:gap-10 md:gap-12 lg:gap-16">
          
          {/* LEFT: TEXT CONTENT */}
          <div className="w-full lg:w-3/5 space-y-4 sm:space-y-6 md:space-y-8">

            <div className="relative">
              <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-[#F1A722] hidden md:block"></div>
              
              <div className="text-white text-base sm:text-lg leading-relaxed font-normal text-justify">
                {content.description.split('\n\n').map((para, idx) => (
                  <p key={idx} className="mb-4 sm:mb-6 last:mb-0 first-letter:text-3xl sm:first-letter:text-4xl md:first-letter:text-5xl first-letter:text-[#F1A722] first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:leading-none">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: IMAGE SECTION */}
          <div className="w-full lg:w-2/5 relative">
            <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl border-2 sm:border-3 md:border-4 border-[#14AAAB] max-w-md mx-auto lg:max-w-none">
               {!imgLoading && welcomeImage ? (
                  <img 
                    src={welcomeImage.url}
                    alt="Interior" 
                    className="w-full aspect-[3/4] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-gray-200 animate-pulse" />
                )}
            </div>
            
            <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-full h-full border-2 sm:border-3 md:border-4 border-[#F1A722] rounded-xl -z-10"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;