import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContactUs } from '../store/slices/contactUsSlice';
import { fetchFooter } from '../store/slices/footerSlice';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/solid';

const ContactUs = () => {
  const dispatch = useDispatch();
  const contactUs = useSelector(state => state.contactUs);
  const footer = useSelector(state => state.footer.data);
  const [iframeError, setIframeError] = useState(false);
  
  const loading = contactUs?.loading || false;
  const contactData = contactUs?.data;

  useEffect(() => {
    dispatch(fetchContactUs());
    dispatch(fetchFooter());
  }, [dispatch]);

  // Don't render if no data exists
  if (!contactData) {
    return null;
  }

  const contactInfo = contactData ? [
    {
      icon: <PhoneIcon className="w-5 h-5" />,
      title: 'Phone',
      details: contactData.contactNo,
      subtext: footer?.hours || 'Mon-Sun, 10AM-10PM'
    },
    {
      icon: <EnvelopeIcon className="w-5 h-5" />,
      title: 'Email',
      details: contactData.email,
      subtext: 'Official Correspondence'
    },
    {
      icon: <MapPinIcon className="w-5 h-5" />,
      title: 'Location',
      details: contactData.address.split('\n')[0],
      subtext: contactData.address.split('\n').slice(1).join(', ') || 'Visit our restaurant'
    }
  ] : [];

  return (
    <section id="contact" className="py-8 sm:py-14 md:py-20 bg-[#0A2F46]">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <p className="text-[#F1A722] text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] font-bold mb-2 sm:mb-3 md:mb-4">
            Get In Touch
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif italic text-[#F1A722] mb-3 sm:mb-4 md:mb-6 px-2">
            Contact Us
          </h2>
          <div className="w-16 sm:w-20 h-[1.5px] bg-[#F1A722] mx-auto"></div>
        </div>

        {/* Compact Contact Info Cards - Redesigned to fit data */}
        <div className="space-y-4 sm:space-y-5 md:grid md:grid-cols-3 md:gap-6 md:space-y-0 mb-8 sm:mb-12 md:mb-16">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="group relative overflow-hidden bg-gradient-to-br from-white/15 to-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 border-[#14AAAB] shadow-lg hover:shadow-2xl hover:border-[#F1A722] transition-all duration-300 backdrop-blur-md"
            >
              {/* Decorative background gradient */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#F1A722]/5 rounded-full blur-2xl group-hover:bg-[#F1A722]/10 transition-all duration-300"></div>
              
              <div className="relative flex items-start gap-3 sm:gap-4">
                {/* Icon container */}
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 flex justify-center items-center rounded-xl bg-gradient-to-br from-[#F1A722] to-[#FF9800] text-[#0A2F46] shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  {React.cloneElement(info.icon, { className: 'w-5 h-5 sm:w-6 sm:h-6' })}
                </div>
                
                {/* Text content */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 sm:w-8 h-[2px] bg-[#F1A722]"></div>
                    <h3 className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-[#F1A722]">
                      {info.title}
                    </h3>
                  </div>
                  <p className="text-white font-bold text-base sm:text-lg leading-tight mb-1.5 break-words">
                    {info.details}
                  </p>
                  <p className="text-white/60 text-xs sm:text-sm leading-snug break-words">
                    {info.subtext}
                  </p>
                </div>
              </div>
              
              {/* Bottom accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#14AAAB] via-[#F1A722] to-[#14AAAB] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          ))}
        </div>

        {/* Map Section - Integrated with theme */}
        <div className="relative overflow-hidden bg-gradient-to-br from-white/15 to-white/5 rounded-xl sm:rounded-2xl md:rounded-3xl border-2 border-[#14AAAB] p-4 sm:p-6 md:p-8 shadow-xl backdrop-blur-md">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#14AAAB]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#F1A722]/5 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-4 sm:mb-5 md:mb-6">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-[#F1A722] text-[#0A2F46]">
                <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white">
                  Find Our Location
                </h3>
                <div className="w-16 sm:w-20 h-[2px] bg-[#F1A722] mt-1"></div>
              </div>
            </div>
            
            <div className="rounded-lg sm:rounded-xl md:rounded-2xl overflow-hidden border-2 sm:border-3 border-[#14AAAB] shadow-2xl h-[300px] sm:h-[380px] md:h-[480px] relative">
              {contactData?.googleMapLocation ? (
                <>
                  {iframeError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-[#0A2F46] p-6 text-center">
                      <MapPinIcon className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-sm font-medium">Map could not be loaded</p>
                      <p className="text-xs text-gray-600 mt-1">Please check the URL in admin panel</p>
                    </div>
                  )}
                  <iframe
                    src={contactData.googleMapLocation}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Restaurant Location"
                    onError={() => setIframeError(true)}
                  />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400">
                  <MapPinIcon className="w-12 h-12 mb-3" />
                  <p className="text-sm font-medium">Location map not available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;