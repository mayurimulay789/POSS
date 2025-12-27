import React, { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/apiConfig';

const WelcomeSection = () => {
  const [welcomeImage, setWelcomeImage] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchWelcomeImage = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/hotel-images/public`);
        const images = Array.isArray(res.data) ? res.data : [];
        const welcome = images.find((img) => img.isWelcome);
        setWelcomeImage(welcome || null);
      } catch (err) {
        console.error('Failed to load welcome image:', err);
        setWelcomeImage(null);
      } finally {
        setLoading(false);
      }
    };
    fetchWelcomeImage();
  }, []);

  return (
    <section className="py-16 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left side - Text (Centered) */}
            <div className="text-center space-y-6">
              <p className="text-amber-700 text-sm uppercase tracking-wider font-medium">
                Welcome To
              </p>
              
              <h2 className="text-5xl md:text-6xl font-serif font-bold text-gray-900 leading-tight">
                POS Restaurant
              </h2>
              
              {/* Decorative divider */}
              <div className="flex justify-center">
                <div className="w-16 h-1 bg-amber-600"></div>
              </div>
              
              <div className="space-y-5 text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
                <p>
                  India Restaurant has been serving delightful experiences through the art of cooking for four decades. A cozy, relaxing space combined with flavourful dishes makes it a first choice for every foodie in town. It provides a wide range of items to choose from and lets everyone indulge in an experience of pleasing their taste buds.
                </p>

                <p>
                  We provides a wide range of cuisines and dishes to choose from so that every foodie in town has their best experience here.
                </p>

                <p>
                  We are known to be the best Mughlai eatery in Kolkata. We have always won the hearts of our customers with appetizing dishes and friendly behaviour. It is the best choice for everyone who wants to enjoy the best quality food at reasonable prices.
                </p>
              </div>
            </div>

            {/* Right side - Image */}
            <div className="flex justify-center">
              {!loading && welcomeImage ? (
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
