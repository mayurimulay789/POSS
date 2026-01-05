import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFooter } from '/src/store/slices/footerSlice';
import { fetchLogo } from '/src/store/slices/logoSlice';
import { fetchContactUs } from '/src/store/slices/contactUsSlice';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Footer() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector(state => state.footer);
  const logoUrl = useSelector(state => state.logo.logoUrl);
  const contact = useSelector(state => state.contactUs.data);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    dispatch(fetchFooter());
    dispatch(fetchLogo());
    dispatch(fetchContactUs());
  }, [dispatch]);

  if (loading || !data) return null;

  return (
    <footer className="bg-gradient-to-br from-[#0A2F46] via-[#0c3a52] to-[#0A2F46] py-12 px-6 lg:px-16">
      {/* ONE UNIFIED CONTAINER */}
      <div className="max-w-7xl mx-auto bg-white/95 border-4 border-[#14AAAB] rounded-3xl p-8 lg:p-12 shadow-2xl">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* 1. LEFT: Brand Branding (Takes 4 columns) */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
            {logoUrl && (
              <div className="-mt-2 mb-1 flex items-center justify-center lg:justify-start">
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="h-40 w-auto object-contain" 
                />
              </div>
            )}
            <h2 className="text-3xl font-serif italic text-[#0A2F46] mb-3 font-bold tracking-wide">
              {data.restaurantName || 'POSS RESTRO'}
            </h2>
            <p className="text-[#14AAAB] text-base leading-relaxed max-w-xs font-light mb-4">
              {data.shortDescription || "Crafting exceptional culinary experiences with passion and tradition."}
            </p>
            
            <div className="flex gap-2">
              <div className="w-12 h-1 bg-[#F1A722] rounded-full"></div>
              <div className="w-8 h-1 bg-[#14AAAB] rounded-full"></div>
              <div className="w-4 h-1 bg-[#D32B36] rounded-full"></div>
            </div>
          </div>

          {/* 2. MIDDLE: Contact & Links (Takes 5 columns) */}
          <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-8 border-y-2 lg:border-y-0 lg:border-x-2 border-[#F1A722]/30 py-8 lg:py-0 lg:px-12">
            <div>
              <h4 className="text-[#D32B36] text-xs uppercase font-bold tracking-[0.3em] mb-6 flex items-center gap-2">
                <span className="w-6 h-[2px] bg-[#D32B36]"></span>
                Explore
              </h4>
              <ul className="space-y-3 text-base">
                {['Home', 'Menu', 'Gallery', 'Contact Us'].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase().replace(' ', '')}`} className="text-[#0A2F46] hover:text-[#F1A722] transition-all duration-300 font-semibold hover:pl-2 inline-block group">
                      <span className="inline-block group-hover:scale-110 transition-transform">→</span> {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[#D32B36] text-xs uppercase font-bold tracking-[0.3em] mb-6 flex items-center gap-2">
                <span className="w-6 h-[2px] bg-[#D32B36]"></span>
                Contact
              </h4>
              <div className="space-y-4 text-base text-[#0A2F46]">
                <div className="flex items-center gap-3 group hover:pl-2 transition-all duration-300">
                  <PhoneIcon className="w-4 h-4 text-[#14AAAB] group-hover:text-[#F1A722] transition-colors" />
                  <span className="font-medium">{contact?.contactNo || '09563642121'}</span>
                </div>
                <div className="flex items-center gap-3 group hover:pl-2 transition-all duration-300">
                  <EnvelopeIcon className="w-4 h-4 text-[#14AAAB] group-hover:text-[#F1A722] transition-colors" />
                  <span className="break-all font-medium">{contact?.email}</span>
                </div>
                <div className="flex items-center gap-3 group hover:pl-2 transition-all duration-300">
                  <MapPinIcon className="w-4 h-4 text-[#14AAAB] group-hover:text-[#F1A722] transition-colors" />
                  <span className="font-medium">{contact?.address?.split(',')[0]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. RIGHT: Hours & Social Media (Takes 3 columns) */}
          <div className="lg:col-span-3 flex flex-col justify-center items-center lg:items-end text-center lg:text-right">
            <div className="mb-6 bg-gradient-to-br from-[#F1A722]/10 to-[#14AAAB]/10 rounded-2xl p-6 border-2 border-[#F1A722]">
              <div className="flex items-center justify-center lg:justify-end gap-2 mb-3">
                <ClockIcon className="w-5 h-5 text-[#D32B36]" />
                <span className="text-xs uppercase font-bold tracking-widest text-[#D32B36]">Opening Hours</span>
              </div>
              <p className="text-2xl font-serif italic text-[#0A2F46] uppercase font-bold">
                {data.hours || '10AM - 10PM'}
              </p>
            </div>
            
            {/* Social Media Icons - Moved to right column */}
            <div className="pt-6 border-t-2 border-[#14AAAB] w-full lg:w-auto">
              <div className="flex gap-4 justify-center lg:justify-end">
            <a 
              href={data?.social?.facebook || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-[#0A2F46] text-white flex items-center justify-center hover:bg-[#F1A722] hover:text-[#0A2F46] transition-all duration-300 hover:scale-110 shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a 
              href={data?.social?.instagram || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-[#0A2F46] text-white flex items-center justify-center hover:bg-[#F1A722] hover:text-[#0A2F46] transition-all duration-300 hover:scale-110 shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a 
              href={data?.social?.twitter || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-11 h-11 rounded-full bg-[#0A2F46] text-white flex items-center justify-center hover:bg-[#F1A722] hover:text-[#0A2F46] transition-all duration-300 hover:scale-110 shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </a>
              </div>
            </div>
          </div>

        </div>
        
        {/* Copyright Text - Moved to Bottom */}
        <div className="mt-8 pt-6 border-t-2 border-[#14AAAB] text-center">
          <p className="text-xs text-[#0A2F46] uppercase tracking-widest mb-1 font-semibold">
            © {currentYear} {data.restaurantName}
          </p>
          <p className="text-xs text-[#14AAAB] uppercase tracking-tighter">
            {data.poweredBy || 'Powered by POS Management System'}
          </p>
        </div>
      </div>
    </footer>
  );
}