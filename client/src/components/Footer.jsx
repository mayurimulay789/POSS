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
    <footer className="w-full bg-[#0A2F46] py-10 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        
        <div className="bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-md rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 p-6 sm:p-8 lg:p-14 shadow-2xl">
          
          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
            
            {/* 1. Brand Section - FLEX ROW, LOGO LEFT OF NAME, LEFT-ALIGNED FOR MOBILE */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="flex flex-row items-center justify-center lg:justify-start gap-3 mb-4 w-full">
                {logoUrl && (
                  <img 
                    src={logoUrl} 
                    alt="Logo" 
                    className="h-10 w-10 sm:h-14 sm:w-14 object-contain filter drop-shadow-2xl" 
                    style={{ minWidth: '2.5rem' }}
                  />
                )}
                <h2 className="text-lg sm:text-2xl font-serif text-white font-bold tracking-tight text-left">
                  {data.restaurantName || 'POSS RESTRO'}
                </h2>
              </div>

              {/* Decorative Lines */}
              <div className="flex gap-1.5 mb-5">
                <span className="h-1.5 w-12 bg-[#F1A722] rounded-full"></span>
                <span className="h-1.5 w-8 bg-[#14AAAB] rounded-full"></span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-sm mb-6 lg:mb-0">
                {data.shortDescription || "Crafting exceptional culinary experiences."}
              </p>
            </div>

            {/* Nested Grid for Side-by-Side Content */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-10">
              
              {/* 2. Quick Links (Explore) */}
              <div className="flex flex-col items-start lg:pt-10">
                <h4 className="text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] mb-6">
                  Explore
                </h4>
                <ul className="flex flex-col gap-y-4 w-full">
                  {['Home', 'Menu', 'Gallery', 'About Us', 'Contact'].map((link) => (
                    <li key={link}>
                      <a 
                        href={`#${link.toLowerCase().replace(' ', '')}`} 
                        className="text-gray-400 hover:text-[#14AAAB] transition-all duration-300 text-xs sm:text-sm font-medium flex items-center gap-2 group"
                      >
                        <ChevronRightIcon className="w-3 h-3 text-[#F1A722] shrink-0" />
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Contact Details (Get In Touch) */}
              <div className="flex flex-col gap-6 lg:pt-10">
                <div className="flex flex-col items-start">
                  <h4 className="text-white text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] mb-6">
                    Get In Touch
                  </h4>
                  <div className="flex flex-col gap-4 w-full">
                    {/* Phone */}
                    <a href={`tel:${contact?.contactNo}`} className="flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-colors group">
                      <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg group-hover:bg-[#14AAAB]/20 text-[#14AAAB]">
                          <PhoneIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] sm:text-sm font-semibold tracking-wide truncate">
                        {contact?.contactNo || '1245225522'}
                      </span>
                    </a>
                    
                    {/* Email */}
                    <a href={`mailto:${contact?.email}`} className="flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-colors group">
                      <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg group-hover:bg-[#14AAAB]/20 text-[#14AAAB]">
                          <EnvelopeIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] sm:text-sm font-semibold truncate max-w-[80px] sm:max-w-none">
                        {contact?.email}
                      </span>
                    </a>

                    {/* Address */}
                    <div className="flex items-start gap-2 sm:gap-3 text-gray-400">
                      <div className="p-1.5 sm:p-2 bg-white/5 rounded-lg text-[#F1A722]">
                          <MapPinIcon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] sm:text-sm font-medium leading-tight pt-1">
                        {contact?.address}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="bg-[#082738] border border-white/10 rounded-xl p-3 flex items-center gap-3">
                  <div className="bg-[#F1A722]/10 p-1.5 rounded-lg hidden sm:block">
                    <ClockIcon className="w-5 h-5 text-[#F1A722]" />
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-500 uppercase font-black">Open Daily</p>
                    <p className="text-[10px] sm:text-sm font-serif text-white font-bold">{data.hours || '10AM - 11PM'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="text-gray-500 text-xs font-medium">
                © {currentYear} <span className="text-gray-300 font-bold">{data.restaurantName}</span>.
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4">
              {[
                { icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z', link: data?.social?.facebook },
                { icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01', link: data?.social?.instagram },
                { icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z', link: data?.social?.twitter },
              ].map((item, idx) => (
                <a key={idx} href={item.link || '#'} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:border-[#14AAAB] hover:text-[#14AAAB] transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
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