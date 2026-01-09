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
    <footer className="w-full bg-[#0A2F46] py-4 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-md rounded-[2rem] border border-white/10 p-6 lg:p-14 shadow-2xl">
          
          {/* Main Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-12 gap-y-6 gap-x-4 lg:gap-8 items-start">
            
            {/* 1. Brand Section */}
            <div className="col-span-2 lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="flex flex-row items-center justify-center lg:justify-start gap-3 mb-2 w-full">
                {logoUrl && (
                  <div className="shrink-0"> 
                    <img 
                      src={logoUrl} 
                      alt="Logo" 
                      className="h-8 sm:h-20 lg:h-24 w-auto object-contain"
                    />
                  </div>
                )}
                <h2 className="text-lg sm:text-2xl lg:text-3xl font-serif text-white font-bold tracking-tight">
                  {data.restaurantName || 'DISCOUNT FEAST'}
                </h2>
              </div>

              <div className="flex gap-1.5 mb-3 justify-center lg:justify-start">
                <span className="h-1 w-10 bg-[#F1A722] rounded-full"></span>
                <span className="h-1 w-6 bg-[#14AAAB] rounded-full"></span>
              </div>
              
              {/* Description Centered on Mobile */}
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto lg:mx-0 text-center lg:text-left mb-2">
                {data.shortDescription || "this is a footer data."}
              </p>
            </div>

            {/* 2. Quick Links */}
            <div className="col-span-1 lg:col-span-3 flex flex-col items-start lg:pt-10">
              <h4 className="text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] mb-4 lg:mb-8">
                Explore
              </h4>
              <ul className="space-y-2 lg:space-y-4">
                {['Home', 'Menu', 'Gallery', 'About Us', 'Contact'].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase().replace(' ', '')}`} className="text-gray-400 text-xs sm:text-sm flex items-center gap-2">
                      <ChevronRightIcon className="w-3 h-3 text-[#F1A722]" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Get In Touch */}
            <div className="col-span-1 lg:col-span-4 flex flex-col items-start lg:pt-10">
              <h4 className="text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] mb-4 lg:mb-8">
                Get In Touch
              </h4>
              <div className="space-y-3 w-full">
                <a href={`tel:${contact?.contactNo}`} className="flex items-center gap-2 text-gray-400 group">
                  <div className="p-1.5 bg-white/5 rounded-lg text-[#14AAAB]">
                    <PhoneIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] sm:text-sm truncate">{contact?.contactNo || '1245225522'}</span>
                </a>
                <a href={`mailto:${contact?.email}`} className="flex items-center gap-2 text-gray-400 group">
                  <div className="p-1.5 bg-white/5 rounded-lg text-[#14AAAB]">
                    <EnvelopeIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] sm:text-sm truncate">{contact?.email || 'mrunal@gmail.com'}</span>
                </a>
                <div className="flex items-start gap-2 text-gray-400">
                  <div className="p-1.5 bg-white/5 rounded-lg">
                    <MapPinIcon className="w-4 h-4 text-[#F1A722]" />
                  </div>
                  <span className="text-[10px] sm:text-sm leading-tight pt-0.5">{contact?.address || 'nirman chowk, kolhapur.'}</span>
                </div>
              </div>
            </div>

            {/* 4. Time Section - Centered across both columns on mobile */}
            <div className="col-span-2 flex justify-center mt-2 lg:mt-6 lg:col-start-9 lg:col-span-4">
              <div className="bg-[#082738] border border-white/10 rounded-2xl p-3 sm:p-5 flex items-center gap-4 w-full max-w-[280px] lg:max-w-none">
                <div className="bg-[#F1A722]/10 p-2 sm:p-3 rounded-xl">
                  <ClockIcon className="w-5 h-5 sm:w-6 sm:h-6 text-[#F1A722]" />
                </div>
                <div className="text-left">
                  <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase tracking-widest font-black">Open Daily</p>
                  <p className="text-xs sm:text-lg font-serif text-white font-bold whitespace-nowrap">
                    {data.hours || '10.00 AM TO 10.00 PM'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-6 lg:my-10" />

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left order-2 md:order-1">
              <p className="text-gray-500 text-[10px] sm:text-xs">
                © {currentYear} <span className="text-gray-300 font-bold uppercase">{data.restaurantName || 'DISCOUNT FEAST'}</span>.
              </p>
            </div>

            <div className="flex items-center gap-4 order-1 md:order-2">
              {/* Simple Social Icons */}
              {['facebook', 'instagram', 'twitter'].map((platform) => (
                <div key={platform} className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                  <span className="capitalize text-[10px]">{platform[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}