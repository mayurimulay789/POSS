import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

const AboutUs = () => {
  const highlights = [
    {
      title: 'Premium Quality',
      description: 'We source the finest ingredients to ensure every dish meets our high standards',
      icon: '🥘'
    },
    {
      title: 'Expert Chefs',
      description: 'Our culinary team brings decades of experience in authentic cuisine',
      icon: '👨‍🍳'
    },
    {
      title: 'Perfect Ambiance',
      description: 'Enjoy your meal in our elegantly designed dining spaces',
      icon: '✨'
    },
    {
      title: 'Exceptional Service',
      description: 'Our dedicated staff ensures a memorable dining experience',
      icon: '🤝'
    }
  ];

  const values = [
    'Authentic Flavors',
    'Fresh Ingredients',
    'Traditional Recipes',
    'Customer Satisfaction',
    'Excellence in Service',
    'Warm Hospitality'
  ];

  return (
    <section id="AboutUs" className="py-16 md:py-20 bg-gradient-to-b from-[#0A3D4D] to-[#134A5C]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10">
          <p className="text-[#FF9800] text-sm uppercase tracking-widest font-semibold mb-4">
            Our Story
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            About Our Restaurant
          </h2>
          <div className="flex justify-center mb-6">
            <div className="w-24 h-1 bg-[#FF9800]"></div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Content */}
          <div className="space-y-6">
            <p className="text-gray-200 text-lg leading-relaxed">
              Founded in 1985, India Restaurant has been serving authentic culinary experiences to food enthusiasts across the city. Our journey began with a simple mission: to bring the true flavors of India to your table.
            </p>

            <p className="text-gray-700 text-lg leading-relaxed">
              We believe in the art of cooking, where every ingredient is carefully selected, and every dish is prepared with passion and precision. Our chefs, trained in traditional cooking methods, combine heritage recipes with modern culinary techniques to create unforgettable dining moments.
            </p>

            <p className="text-gray-700 text-lg leading-relaxed">
              With four decades of excellence, we have become a destination for those who appreciate authentic flavors, warm hospitality, and a dining experience that touches the heart.
            </p>

            {/* Values List */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {values.map((value, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Stats or Image Placeholder */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="space-y-8">
              <div className="border-l-4 border-yellow-500 pl-6">
                <p className="text-gray-600 text-sm uppercase tracking-wider mb-2">Since</p>
                <p className="text-4xl font-serif font-bold text-gray-900">1985</p>
                <p className="text-gray-700 mt-2">39+ Years of Excellence</p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-6">
                <p className="text-gray-600 text-sm uppercase tracking-wider mb-2">Customers Served</p>
                <p className="text-4xl font-serif font-bold text-gray-900">50K+</p>
                <p className="text-gray-700 mt-2">Satisfied Food Lovers</p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-6">
                <p className="text-gray-600 text-sm uppercase tracking-wider mb-2">Awards</p>
                <p className="text-4xl font-serif font-bold text-gray-900">15+</p>
                <p className="text-gray-700 mt-2">Culinary Recognition</p>
              </div>

              <div className="bg-yellow-100 p-6 rounded-lg border-l-4 border-yellow-500">
                <p className="text-gray-900 font-semibold mb-2">Our Commitment</p>
                <p className="text-gray-700 text-sm">
                  We are committed to providing exceptional dining experiences through authentic cuisine, impeccable service, and a welcoming atmosphere that makes every guest feel at home.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Highlights Section */}
        <div className="mt-20">
          <h3 className="text-3xl font-serif font-bold text-gray-900 text-center mb-12">
            Why Choose Us
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-8 text-center border-2 border-yellow-200 hover:border-yellow-400"
              >
                <div className="text-5xl mb-4">{highlight.icon}</div>
                <h4 className="text-xl font-serif font-bold text-gray-900 mb-3">
                  {highlight.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {highlight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
