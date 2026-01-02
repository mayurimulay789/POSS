import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContactUs } from '../store/slices/contactUsSlice';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/solid';

const ContactUs = () => {
  const dispatch = useDispatch();
  const contactUs = useSelector(state => state.contactUs);
  const [iframeError, setIframeError] = useState(false);
  
  const loading = contactUs?.loading || false;
  const contactData = contactUs?.data;

  // Default fallback data
  const defaultContactInfo = [
    {
      icon: <PhoneIcon className="w-6 h-6" />,
      title: 'Phone',
      details: '+1 (555) 123-4567',
      subtext: 'Mon-Fri, 9AM-6PM'
    },
    {
      icon: <EnvelopeIcon className="w-6 h-6" />,
      title: 'Email',
      details: 'info@restaurant.com',
      subtext: 'We respond within 24 hours'
    },
    {
      icon: <MapPinIcon className="w-6 h-6" />,
      title: 'Location',
      details: '123 Main Street, City',
      subtext: 'Your City, State 12345'
    }
  ];

  useEffect(() => {
    dispatch(fetchContactUs());
  }, [dispatch]);

  // Build contact info array from API data or use defaults
  const contactInfo = contactData ? [
    {
      icon: <PhoneIcon className="w-6 h-6" />,
      title: 'Phone',
      details: contactData.contactNo,
      subtext: 'Mon-Fri, 9AM-6PM'
    },
    {
      icon: <EnvelopeIcon className="w-6 h-6" />,
      title: 'Email',
      details: contactData.email,
      subtext: 'We respond within 24 hours'
    },
    {
      icon: <MapPinIcon className="w-6 h-6" />,
      title: 'Location',
      details: contactData.address.split('\n')[0],
      subtext: contactData.address.split('\n').slice(1).join(', ')
    }
  ] : defaultContactInfo;

  return (
    <section id="contact" className="py-8 md:py-12 bg-gradient-to-br from-[#0A3D4D] to-[#134A5C]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <p className="text-[#FF9800] text-sm uppercase tracking-widest font-semibold mb-4">
            Get In Touch
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">
            Contact Us
          </h2>
          <div className="flex justify-center mb-6">
            <div className="w-24 h-1 bg-[#FF9800]"></div>
          </div>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Reach out to us and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300 border-t-4 border-[#FF9800]"
            >
              <div className="flex justify-center mb-4 text-[#FF9800]">
                {info.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {info.title}
              </h3>
              <p className="text-gray-700 font-medium mb-1">
                {info.details}
              </p>
              <p className="text-gray-500 text-sm">
                {info.subtext}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info / FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Response Section */}
            <div className="bg-white rounded-lg shadow-lg p-8 md:p-10">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Quick Response
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-100">
                      <span className="text-amber-600 font-semibold">1</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Quick Response Time</h4>
                    <p className="text-gray-600 text-sm">We respond to all inquiries within 24 hours</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-yellow-100">
                      <span className="text-yellow-600 font-semibold">2</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Multiple Contact Methods</h4>
                    <p className="text-gray-600 text-sm">Reach us via phone, email, or contact form</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-yellow-100">
                      <span className="text-yellow-600 font-semibold">3</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Expert Support</h4>
                    <p className="text-gray-600 text-sm">Our team is ready to assist with any questions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours OR Google Map */}
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border-2 border-yellow-400 p-8 md:p-10">
              {contactData?.googleMapLocation ? (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Find Us
                  </h3>
                  {iframeError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                      <strong>Map Error:</strong> Unable to load Google Maps. The embed URL might be invalid.
                      <br />
                      <small>Admin: Please verify the Google Maps embed URL in Contact Us Management</small>
                    </div>
                  )}
                  <div className="rounded-lg overflow-hidden" style={{ width: '100%', height: '300px', backgroundColor: '#f3f4f6' }}>
                    <iframe
                      src={contactData.googleMapLocation}
                      width="100%"
                      height="100%"
                      style={{ border: 0, display: 'block' }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Restaurant Location"
                      onError={() => {
                        console.error('Map iframe failed to load:', contactData.googleMapLocation);
                        setIframeError(true);
                      }}
                      onLoad={() => {
                        console.log('Map iframe loaded successfully');
                        setIframeError(false);
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Business Hours
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex justify-between">
                      <span>Monday - Friday</span>
                      <span className="font-semibold">9:00 AM - 10:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday</span>
                      <span className="font-semibold">10:00 AM - 11:00 PM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday</span>
                      <span className="font-semibold">10:00 AM - 10:00 PM</span>
                    </div>
                  </div>
                  <p className="text-sm text-yellow-900 mt-4 pt-4 border-t border-yellow-300">
                    Closed on major holidays. For emergencies, please call our hotline.
                  </p>
                </div>
              )}
            </div>
          </div>
      </div>
    </section>
  );
};

export default ContactUs;
