import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWelcomeSection } from '../store/slices/welcomeSectionSlice';
import axios from 'axios';

const WelcomeSection = () => {
  const dispatch = useDispatch();
  const welcomeSection = useSelector(state => state.welcomeSection);
  const [welcomeImage, setWelcomeImage] = React.useState(null);
  const [imgLoading, setImgLoading] = React.useState(true);
  const loading = welcomeSection?.loading || false;

  // Default fallback content
  const defaultContent = {
    hotelName: 'POS Restaurant',
    tagline: 'Experience Culinary Excellence',
    description: 'India Restaurant has been serving delightful experiences through the art of cooking for four decades. A cozy, relaxing space combined with flavourful dishes makes it a first choice for every foodie in town. It provides a wide range of items to choose from and lets everyone indulge in an experience of pleasing their taste buds.\n\nWe provides a wide range of cuisines and dishes to choose from so that every foodie in town has their best experience here.\n\nWe are known to be the best Mughlai eatery in Kolkata. We have always won the hearts of our customers with appetizing dishes and friendly behaviour. It is the best choice for everyone who wants to enjoy the best quality food at reasonable prices.'
  };

  useEffect(() => {
    dispatch(fetchWelcomeSection());
    setImgLoading(true);
    axios.get(`${import.meta.env.VITE_API_URL}/hotel-images/welcome`)
      .then(res => setWelcomeImage(res.data))
      .catch(() => setWelcomeImage(null))
      .finally(() => setImgLoading(false));
  }, [dispatch]);

  const content = welcomeSection?.data || defaultContent;

  return (
    <section className="py-16 md:py-20 bg-gradient-to-r from-[#0A3D4D] to-[#134A5C]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left side - Text (Centered) */}
            <div className="text-center space-y-6">
              <p className="text-[#FF9800] text-sm uppercase tracking-wider font-medium">
                Welcome To
              </p>
              
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-white leading-tight">
                {content.hotelName}
              </h2>
              
              {/* Decorative divider */}
              <div className="flex justify-center">
                <div className="w-16 h-1 bg-[#FF9800]"></div>
              </div>
              
              <p className="text-[#FF9800] text-lg font-medium italic">
                {content.tagline}
              </p>
              
              <div className="space-y-5 text-gray-200 text-sm leading-relaxed max-w-md mx-auto">
                {content.description.split('\n\n').map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </div>

            {/* Right side - Image */}
            <div className="flex justify-center">
              {!imgLoading && welcomeImage ? (
                <div className="w-full max-w-md h-full md:h-[500px] rounded-lg overflow-hidden shadow-lg">
                  <img 
                    src={welcomeImage.url}
                    alt={welcomeImage.alt || 'Restaurant Interior'}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full max-w-md h-full md:h-[500px] rounded-lg overflow-hidden shadow-lg bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">Select a Welcome image in Hotel Images and click Save.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
  );
};

export default WelcomeSection;
