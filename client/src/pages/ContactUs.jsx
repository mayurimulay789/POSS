import React from 'react';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/solid';

const ContactUs = () => {
  const contactInfo = [
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

  return (
    <section id="contact" className="py-8 md:py-12 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-8">
          <p className="text-amber-600 text-sm uppercase tracking-widest font-semibold mb-4">
            Get In Touch
          </p>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">
            Contact Us
          </h2>
          <div className="flex justify-center mb-6">
            <div className="w-24 h-1 bg-amber-600"></div>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Have questions or feedback? We'd love to hear from you. Reach out to us and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex justify-center mb-4 text-amber-600">
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
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-100">
                      <span className="text-amber-600 font-semibold">2</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Multiple Contact Methods</h4>
                    <p className="text-gray-600 text-sm">Reach us via phone, email, or contact form</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-100">
                      <span className="text-amber-600 font-semibold">3</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Expert Support</h4>
                    <p className="text-gray-600 text-sm">Our team is ready to assist with any questions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border-2 border-amber-200 p-8 md:p-10">
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
              <p className="text-sm text-amber-900 mt-4 pt-4 border-t border-amber-300">
                Closed on major holidays. For emergencies, please call our hotline.
              </p>
            </div>
          </div>
      </div>
    </section>
  );
};

export default ContactUs;
