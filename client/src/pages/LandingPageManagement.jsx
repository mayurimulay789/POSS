import React from 'react';
import { AboutUsManagement, ContactUsManagement, WelcomeSectionManagement, CuisineGalleryManagement, LogoManagement, FooterManagement } from '../components/merchant';

const LandingPageManagement = () => {
  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6 underline decoration-amber-400">Landing Page Management</h1>
      <div className="bg-white rounded shadow p-6 mb-6">
        <AboutUsManagement />
      </div>
      <div className="bg-white rounded shadow p-6 mb-6">
        <ContactUsManagement />
      </div>
      <div className="bg-white rounded shadow p-6 mb-6">
        <WelcomeSectionManagement />
      </div>
      <div className="bg-white rounded shadow p-6 mb-6">
        <CuisineGalleryManagement />
      </div>
      <div className="bg-white rounded shadow p-6 mb-6">
        <LogoManagement />
      </div>
      <div className="bg-white rounded shadow p-6 mb-6">
        <FooterManagement />
      </div>
    </div>
  );
};

export default LandingPageManagement;
