import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFooter } from '/src/store/slices/footerSlice';
import { fetchLogo } from '/src/store/slices/logoSlice';
import { fetchContactUs } from '/src/store/slices/contactUsSlice';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, ClockIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Footer() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector(state => state.footer);
  const logoUrl = useSelector(state => state.logo.logoUrl);
  const contact = useSelector(state => state.contactUs.data);
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();
  const location = useLocation();


  const navLinks = [
    { label: 'Home', to: '/', type: 'route' },
    { label: 'About Us', anchor: 'AboutUs' },
    { label: 'Menu', anchor: 'menu' },
    { label: 'Gallery', anchor: 'gallery' },
    { label: 'Contact Us', anchor: 'contact' },
  ];

  const goHome = (e) => {
    // Prevent default if we're already on home to avoid re-render and just scroll
    if (location.pathname === '/') {
      e?.preventDefault?.();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    }
  };

  const scrollToSection = (id) => {
    const scrollNow = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(scrollNow, 120);
    } else {
      scrollNow();
    }
  };


  useEffect(() => {
    dispatch(fetchFooter());
    dispatch(fetchLogo());
    dispatch(fetchContactUs());
  }, [dispatch]);

  if (loading || !data) return null;

  return (
    <footer className="w-full bg-[#0A2F46] py-8 lg:py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-md rounded-[2rem] border border-white/10 p-6 lg:p-14 shadow-2xl">

          <div className="grid grid-cols-2 lg:grid-cols-12 gap-y-10 lg:gap-x-8 items-start">

            {/* 1. Brand Section: Vertical stack on Desktop, Centered on Mobile */}
            <div className="col-span-2 lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
              <div className="mb-4 shrink-0">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="h-12 lg:h-24 w-auto object-contain"
                  />
                )}
              </div>

              <h2 className="text-xl lg:text-3xl font-serif text-white font-bold tracking-tight mb-2">
                {data.restaurantName || 'DISCOUNT FEAST'}
              </h2>

              <div className="flex gap-1.5 mb-4 justify-center lg:justify-start">
                <span className="h-1.5 w-12 bg-[#F1A722] rounded-full"></span>
                <span className="h-1.5 w-8 bg-[#14AAAB] rounded-full"></span>
              </div>

              <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto lg:mx-0 text-center lg:text-left">
                {data.shortDescription || "this is a footer data."}
              </p>
            </div>

            {/* 2. Quick Links */}
            <div className="col-span-1 lg:col-span-2 flex flex-col items-start lg:pt-4">
              <h4 className="text-white text-[10px] lg:text-xs font-black uppercase tracking-[0.25em] mb-6">
                Explore
              </h4>
              <ul className="text space-y-4 flex flex-col items-start gap-4 font-semibold truncate text-gray-400">
                {navLinks.map((link) => (
                  <li key={link.label} className="w-full">
                    {link.type === "route" ? (
                      <Link
                        to={link.to}
                        onClick={goHome}
                        className="flex justify-start w-full"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => scrollToSection(link.anchor)}
                        className="flex justify-start w-full text-left"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Get In Touch: Forced single line for Mobile */}
            <div className="col-span-1 lg:col-span-3 flex flex-col items-start lg:pt-4">
              <h4 className="text-white text-[10px] lg:text-xs font-black uppercase tracking-[0.25em] mb-6">
                Get In Touch
              </h4>
              <div className="space-y-4 w-full">
                {/* Contact Items - flex-nowrap ensures one line */}
                <a href={`tel:${contact?.contactNo}`} className="flex items-center flex-nowrap gap-2 text-gray-400 group">
                  <div className="p-2 bg-white/5 rounded-lg text-[#14AAAB] shrink-0">
                    <PhoneIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <span className="text-[10px] lg:text-sm font-semibold whitespace-nowrap">{contact?.contactNo || '09563642122'}</span>
                </a>

                <a href={`mailto:${contact?.email}`} className="flex items-center flex-nowrap gap-2 text-gray-400 group overflow-hidden">
                  <div className="p-2 bg-white/5 rounded-lg text-[#14AAAB] shrink-0">
                    <EnvelopeIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>
                  <span className="text-[9px] lg:text-sm font-semibold truncate">{contact?.email || 'hajaremrunal21@gmail.com'}</span>
                </a>

                <div className="flex items-start flex-nowrap gap-2 text-gray-400">
                  <div className="p-2 bg-white/5 rounded-lg shrink-0">
                    <MapPinIcon className="w-4 h-4 lg:w-5 lg:h-5 text-[#F1A722]" />
                  </div>
                  <span className="text-[10px] lg:text-sm leading-tight pt-1 whitespace-nowrap">{contact?.address || 'nirman chowk, kolhapur.'}</span>
                </div>
              </div>
            </div>

            {/* 4. Time Section */}
            <div className="col-span-2 lg:col-span-3 flex justify-center lg:justify-end lg:pt-4">
              <div className="bg-[#082738] border border-white/10 rounded-2xl p-4 lg:p-6 flex items-center gap-4 w-full max-w-[280px]">
                <div className="bg-[#F1A722]/10 p-3 rounded-xl shrink-0">
                  <ClockIcon className="w-6 h-6 text-[#F1A722]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">Open Daily</p>
                  <p className="text-sm lg:text-lg font-serif text-white font-bold leading-tight">
                    {data.hours || '10.00 AM TO 10.00 PM'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-gray-500 text-[10px] lg:text-xs text-center md:text-left">
              © {currentYear} <span className="text-gray-300 font-bold uppercase">{data.restaurantName || 'DISCOUNT FEAST'}</span>.
            </p>
            <div className="flex items-center gap-4">
              {['F', 'I', 'T'].map((label) => (
                <div key={label} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
                  <span className="text-xs font-bold">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}