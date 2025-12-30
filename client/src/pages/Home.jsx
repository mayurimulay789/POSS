import React from 'react';
import BannerCarousel from '../components/BannerCarousel';
import WelcomeSection from '../components/WelcomeSection';
import MenuSection from '../components/MenuSection';
import CuisineGallery from '../components/CuisineGallery';
import AboutUs from '../components/AboutUs';
import ContactUs from './ContactUs';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A3D4D] via-[#134A5C] to-[#0A3D4D]">
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