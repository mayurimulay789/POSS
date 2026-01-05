import React from 'react';
import BannerCarousel from '../components/BannerCarousel';
import WelcomeSection from '../components/WelcomeSection';
import MenuSection from '../components/MenuSection';
import CuisineGallery from '../components/CuisineGallery';
import AboutUs from '../components/AboutUs';
import ContactUs from './ContactUs';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <BannerCarousel />
      <WelcomeSection />
      <MenuSection />
      <CuisineGallery />
      <AboutUs />
      <ContactUs/>
    </div>
  );
};

export default Home;