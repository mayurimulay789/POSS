import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFooter } from '/src/store/slices/footerSlice';
import { fetchLogo } from '/src/store/slices/logoSlice';
import { fetchContactUs } from '/src/store/slices/contactUsSlice';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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
    <footer className="w-full bg-[#0A2F46] py-1 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        
        <div className="bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-md rounded-[2rem] border border-white/10 p-8 lg:p-14 shadow-2xl">
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 items-start ">
            
            {/* 1. Brand Section - UPDATED LOGO CONTAINER */}
            <div className="lg:col-span-5 flex flex-col md:items-start text-center md:text-left mt-7">
  {logoUrl && (
    <div className="relative mb-1 transition-transform hover:scale duration-300 w-full"> 
      <img 
        src={logoUrl} 
        alt="Logo" 
        className="h-auto w-[40%] md:w-[35%] lg:w-[30%] object-contain drop-shadow-2xl"
        style={{ 
          maxHeight: '80px', // Reduced from 120px
          filter: 'brightness(1.1) contrast(1.1)',
          objectFit: 'contain'
        }} 
      />
    </div>
  )}
  <h2 className="text-3xl font-serif text-white mb-2 font-bold tracking-tight mt-2">
    {data.restaurantName || 'POSS RESTRO'}
  </h2>
  <div className="flex gap-1.5 mb-5">
    <span className="h-1.5 w-12 bg-[#F1A722] rounded-full"></span>
    <span className="h-1.5 w-8 bg-[#14AAAB] rounded-full"></span>
  </div>
  <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
    {data.shortDescription || "Crafting exceptional culinary experiences with passion and tradition."}
  </p>
</div>

            {/* 2. Quick Links */}
            <div className="lg:col-span-3 flex flex-col items-center md:items-start md:pt-10">
              <h4 className="text-white text-xs font-black uppercase tracking-[0.25em] mb-8">
                Explore
              </h4>
              <ul className="space-y-4">
                {['Home', 'Menu', 'Gallery', 'About Us', 'Contact'].map((link) => (
                  <li key={link}>
                    <a 
                      href={`#${link.toLowerCase().replace(' ', '')}`} 
                      className="text-gray-400 hover:text-[#14AAAB] transition-all duration-300 text-sm font-medium flex items-center gap-2 group"
                    >
                      <ChevronRightIcon className="w-3 h-3 text-[#F1A722] group-hover:translate-x-1 transition-transform" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Contact & Hours */}
            <div className="lg:col-span-4 flex flex-col gap-8 md:pt-10">
              <div className="flex flex-col items-center md:items-start">
                <h4 className="text-white text-xs font-black uppercase tracking-[0.25em] mb-8">
                  Get In Touch
                </h4>
                <div className="space-y-4 w-full">
                  <a href={`tel:${contact?.contactNo}`} className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors group justify-center md:justify-start">
                    <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#14AAAB]/20 group-hover:text-[#14AAAB] transition-all">
                        <PhoneIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold tracking-wide">{contact?.contactNo || '9125232525'}</span>
                  </a>
                  
                  <a href={`mailto:${contact?.email}`} className="flex items-center gap-4 text-gray-400 hover:text-white transition-colors group justify-center md:justify-start">
                    <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#14AAAB]/20 group-hover:text-[#14AAAB] transition-all">
                        <EnvelopeIcon className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold truncate">{contact?.email}</span>
                  </a>

                  <div className="flex items-start gap-4 text-gray-400 justify-center md:justify-start">
                    <div className="p-2.5 bg-white/5 rounded-xl">
                        <MapPinIcon className="w-5 h-5 text-[#F1A722]" />
                    </div>
                    <span className="text-sm font-medium leading-relaxed pt-1.5">{contact?.address}</span>
                  </div>
                </div>
              </div>

              {/* Hours Card integrated into the column */}
              <div className="bg-[#082738] border border-white/10 rounded-2xl p-5 flex items-center gap-4 group hover:border-[#F1A722]/40 transition-colors">
                <div className="bg-[#F1A722]/10 p-3 rounded-xl">
                  <ClockIcon className="w-6 h-6 text-[#F1A722]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Open Daily</p>
                  <p className="text-lg font-serif text-white font-bold">{data.hours || '10AM - 11PM'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left order-2 md:order-1">
              <p className="text-gray-500 text-xs font-medium tracking-wide">
                © {currentYear} <span className="text-gray-300 font-bold">{data.restaurantName}</span>. All rights reserved.
              </p>
              <p className="text-[#14AAAB] text-[10px] font-black uppercase tracking-[0.3em] mt-2">
                {data.poweredBy || 'Powered by POS Management System'}
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 order-1 md:order-2">
              {[
                { icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', link: data?.social?.facebook },
                { icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z', link: data?.social?.instagram },
                { icon: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z', link: data?.social?.twitter },
              ].map((item, idx) => (
                <a 
                  key={idx}
                  href={item.link || '#'} 
                  className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#F1A722] hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={item.icon}/>
                  </svg>
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}