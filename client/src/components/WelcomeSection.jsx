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
      .catch(() => setWelcomeImage(null))
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
    <section className="relative py-20 bg-[#0A2F46] overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#14AAAB] opacity-5 rounded-bl-full"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#F1A722] opacity-5 rounded-tr-full"></div>
      
      <div className="container mx-auto px-6 lg:px-16">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* LEFT: TEXT CONTENT */}
          <div className="w-full lg:w-3/5 space-y-8">
            <div className="inline-block">
              <span className="text-[#D32B36] text-xs font-bold tracking-[0.4em] uppercase">
                Welcome To
              </span>
              <h2 className="text-6xl md:text-5xl font-serif text-[#F1A722] italic mt-2 leading-none font-bold">
                {content.hotelName}
              </h2>
              <div className="flex items-center gap-4 mt-6">
                <div className="h-[2px] w-16 bg-[#F1A722]"></div>
                <p className="text-[#14AAAB] font-semibold tracking-wide text-lg md:text-xl">
                  {content.tagline}
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-0 bottom-0 w-[2px] bg-[#F1A722] hidden md:block"></div>
              
              <div className="text-white text-lg leading-relaxed font-normal text-justify">
                {content.description.split('\n\n').map((para, idx) => (
                  <p key={idx} className="mb-6 last:mb-0 first-letter:text-5xl first-letter:text-[#F1A722] first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:leading-none">
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: IMAGE SECTION */}
          <div className="w-full lg:w-2/5 relative">
            <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl border-4 border-[#14AAAB]">
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
            
            <div className="absolute -bottom-6 -right-6 w-full h-full border-4 border-[#F1A722] rounded-xl -z-10"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;