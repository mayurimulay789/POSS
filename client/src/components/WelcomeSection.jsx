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
        if (err.response?.status !== 404) console.error('Error:', err);
        setWelcomeImage(null);
      })
      .finally(() => setImgLoading(false));
  }, [dispatch]);

  const content = welcomeSection?.data;

  if (!content) {
    return (
      <section className="py-24 bg-[#0A2F46] flex items-center justify-center">
        <div className="text-center animate-pulse">
          <div className="text-4xl mb-4">✨</div>
          <p className="text-[#F1A722] font-serif italic text-xl">Preparing your welcome...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 lg:py-24 bg-[#0A2F46] overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#14AAAB] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#F1A722] rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* LEFT: IMAGE GRID (Professional Layered Look) */}
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <div className="relative max-w-md mx-auto lg:mx-0">
              {/* Main Image Frame */}
              <div className="relative z-20 rounded-2xl overflow-hidden shadow-2xl transform transition duration-700 hover:scale-[1.02]">
                {!imgLoading && welcomeImage ? (
                  <img 
                    src={welcomeImage.url} 
                    alt="Luxury Interior" 
                    className="w-full aspect-[4/5] object-cover"
                  />
                ) : (
                  <div className="w-full aspect-[4/5] bg-white/5 animate-pulse flex items-center justify-center">
                    <span className="text-white/20">Loading...</span>
                  </div>
                )}
              </div>
              
              {/* Decorative Accent Frames */}
              <div className="absolute -top-6 -left-6 w-32 h-32 border-t-2 border-l-2 border-[#F1A722] z-10 hidden sm:block"></div>
              <div className="absolute -bottom-6 -right-6 w-1/2 h-1/2 bg-[#14AAAB]/20 rounded-2xl -z-10 translate-x-4 translate-y-4"></div>
            </div>
          </div>

          {/* RIGHT: TEXT CONTENT */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2 text-center">
            <div className="mb-6">
              <span className="inline-block px-4 py-1 mb-4 text-xs font-bold tracking-[0.3em] uppercase text-[#14AAAB] bg-[#14AAAB]/10 rounded-full">
                Luxury Experience
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight">
               
                <span className="text-[#F1A722] italic font-medium">{content.hotelName}</span>
              </h2>
              <div className="w-16 sm:w-20 md:w-24 h-[2px] bg-[#F1A722] mt-6 mx-auto"></div>
            </div>

            <div className="space-y-6">
              <div className="text-white/80 text-lg leading-relaxed font-light">
                {content.description.split('\n\n').map((para, idx) => (
                  <p key={idx} className="mb-6 last:mb-0 relative">
                    {idx === 0 && (
                      <span className="text-5xl text-[#F1A722] font-serif float-left mr-3 mt-1 leading-none">
                        {para.charAt(0)}
                      </span>
                    )}
                    {idx === 0 ? para.slice(1) : para}
                  </p>
                ))}
              </div>
              
              <button 
                onClick={() => {
                  const aboutSection = document.getElementById('AboutUs');
                  if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="mt-8 px-8 py-4 bg-transparent border-2 border-[#F1A722] text-[#F1A722] hover:bg-[#F1A722] hover:text-[#0A2F46] transition-all duration-300 font-bold uppercase tracking-widest text-sm rounded-sm shadow-lg hover:shadow-[#F1A722]/50"
              >
                Want to know Us
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;