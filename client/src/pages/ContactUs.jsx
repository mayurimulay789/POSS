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
    <section id="contact" className="py-16 md:py-24 bg-[#0A2F46]">
      <div className="container mx-auto px-4 max-w-6xl">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-[#F1A722] text-xs uppercase tracking-[0.3em] font-bold mb-4">
            Get In Touch
          </p>
          <h2 className="text-5xl md:text-6xl font-bold text-[#F1A722] mb-6">
            Contact Us
          </h2>
          <div className="w-20 h-[1.5px] bg-[#F1A722] mx-auto"></div>
        </div>

        {/* Compact Contact Info Cards - Redesigned to fit data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="group flex items-center gap-5 bg-white/10 rounded-2xl p-6 border-2 border-[#14AAAB] shadow-md hover:shadow-xl hover:border-[#F1A722] transition-all duration-300 backdrop-blur"
            >
              {/* Smaller, focused icon container */}
              <div className="flex-shrink-0 w-12 h-12 flex justify-center items-center rounded-xl bg-[#F1A722] text-[#0A2F46] group-hover:bg-white group-hover:text-[#F1A722] transition-colors duration-300">
                {info.icon}
              </div>
              
              {/* Text data tightly grouped */}
              <div className="flex-grow min-w-0">
                <h3 className="text-[10px] uppercase tracking-widest font-bold text-[#F1A722] mb-1">
                  {info.title}
                </h3>
                <p className="text-white font-semibold text-lg truncate leading-tight mb-1">
                  {info.details}
                </p>
                <p className="text-white/70 text-xs truncate">
                  {info.subtext}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Map Section - Integrated with theme */}
        <div className="bg-white/10 rounded-[2rem] border-2 border-[#14AAAB] p-4 md:p-8 shadow-inner backdrop-blur">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-[1px] bg-[#F1A722]"></div>
            <h3 className="text-xl font-semibold text-white">
              Find Our Location
            </h3>
          </div>
          
          <div className="rounded-[1.5rem] overflow-hidden border-4 border-[#14AAAB] shadow-2xl h-[450px] relative">
            {contactData?.googleMapLocation ? (
              <>
                {iframeError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-[#0A2F46] p-4 text-center">
                    <p>Map could not be loaded. Please check the URL in admin panel.</p>
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
              <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400">
                Location map not available
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;