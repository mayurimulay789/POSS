import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logoutUser } from '../store/slices/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLogo } from '../store/slices/logoSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const logoUrl = useSelector((state) => state.logo.logoUrl);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  // Toggle mobile menu open/close
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  // Fetch logo on initial mount
  useEffect(() => {
    dispatch(fetchLogo());
  }, [dispatch]);

  useEffect(() => {
    const onScroll = () => setIsAtTop(window.scrollY < 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Home', to: '/', type: 'route' },
    { label: 'About Us', anchor: 'AboutUs' },
    { label: 'Menu', anchor: 'menu' },
    { label: 'Gallery', anchor: 'gallery' },
    { label: 'Contact Us', anchor: 'contact' },
  ];

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleDashboardNavigation = () => {
    if (user?.role) {
      navigate(`/${user.role}/dashboard`);
    } else {
      navigate('/login');
    }
    setIsMobileMenuOpen(false);
  };



  const goHome = (e) => {
    // Prevent default if we're already on home to avoid re-render and just scroll
    if (location.pathname === '/') {
      e?.preventDefault?.();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
    }
    setIsMobileMenuOpen(false);
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
    setIsMobileMenuOpen(false);
  };

  // Role-based styling
  const getRoleColor = (role) => {
    switch (role) {
      case 'merchant':
        return 'bg-purple-100 text-purple-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'supervisor':
        return 'bg-green-100 text-green-800';
      case 'staff':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'merchant':
        return '👑';
      case 'manager':
        return '📊';
      case 'supervisor':
        return '👨‍💼';
      case 'staff':
        return '👨‍🍳';
      default:
        return '👤';
    }
  };

  const showTransparent = location.pathname === '/' && isAtTop && !isMobileMenuOpen;
  const textClass = showTransparent ? 'text-white' : 'text-white';
  const linkClass = `${textClass} hover:text-[#F1A722] transition-all duration-300 font-medium px-2 md:px-3 py-2 uppercase tracking-wide text-sm`;
  const navBg = showTransparent
    ? 'bg-[#14AAAB]/70 shadow-none backdrop-blur-sm'
    : 'bg-[#14AAAB]/90 shadow-lg';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* MAIN NAV BAR */}
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link
            to="/"
            onClick={goHome}
            className={`text-2xl font-bold transition flex items-center gap-2 ${showTransparent ? 'text-white drop-shadow-lg' : 'text-white hover:text-[#F1A722]'}`}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-48 w-auto object-contain mt-0" style={{ maxWidth: 480 }} />
            ) : (
              <span className="text-6xl mt-0" style={{ color: '#F1A722' }}>🍽️</span>
            )}
            {!logoUrl && 'India Restaurant'}
          </Link>

          {/* HAMBURGER (MOBILE ONLY) */}
          <button
            onClick={toggleMobileMenu}
            className={`md:hidden p-2 rounded focus:outline-none focus:ring-2 ${showTransparent ? 'text-white' : 'text-white'}`}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-current transition ${isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
              <span className={`w-full h-0.5 bg-current transition ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`w-full h-0.5 bg-current transition ${isMobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
            </div>
          </button>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-6">

            {isAuthenticated ? (
              <>
                {/* USER INFO */}
                <div className="flex items-center gap-3">
                  <span className={`${textClass} text-sm font-medium`}>
                    Welcome, {user?.name}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 ${getRoleColor(user?.role)}`}>
                    <span>{getRoleIcon(user?.role)}</span>
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={handleDashboardNavigation}
                  className="bg-[#F1A722] text-[#0A2F46] hover:bg-[#14AAAB] hover:text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-md font-semibold"
                >
                  <span>📊</span>
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="border-2 border-white/80 text-white hover:bg-white hover:text-[#D32B36] px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 font-semibold"
                >
                  <span>🚪</span>
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  {navLinks.map((link) => (
                    link.type === 'route' ? (
                      <Link
                        key={link.label}
                        to={link.to}
                        onClick={goHome}
                        className={linkClass}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        key={link.label}
                        onClick={() => scrollToSection(link.anchor)}
                        className={`${linkClass} border-b-2 border-transparent hover:border-amber-200`}
                      >
                        {link.label}
                      </button>
                    )
                  ))}
                </div>

                <Link
                  to="/login"
                  className="bg-[#D32B36] hover:bg-[#F1A722] text-white px-6 py-2 rounded-full transition-all font-semibold shadow-lg hover:shadow-xl"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* MOBILE DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#14AAAB] shadow-lg pb-3">

            {isAuthenticated ? (
              <>
                {/* USER INFO */}
                <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-gray-700 font-medium">
                      {user?.name}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs capitalize flex items-center gap-1 ${getRoleColor(user?.role)}`}>
                      <span>{getRoleIcon(user?.role)}</span>
                      {user?.role}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                <button
                  onClick={handleDashboardNavigation}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 border-b border-gray-100"
                >
                  <span>📊</span>
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 text-gray-700 hover:text-red-600 hover:bg-red-50"
                >
                  <span>🚪</span>
                  Logout
                </button>
              </>
            ) : (
              <>
                {navLinks.map((link) => (
                  link.type === 'route' ? (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={goHome}
                      className="block px-4 py-3 text-[#0A2F46] hover:text-[#F1A722] hover:bg-[#14AAAB]/10 border-b border-[#14AAAB]/30 font-medium"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      key={link.label}
                      onClick={() => scrollToSection(link.anchor)}
                      className="block w-full text-left px-4 py-3 text-[#0A2F46] hover:text-[#F1A722] hover:bg-[#14AAAB]/10 border-b border-[#14AAAB]/30 font-medium"
                    >
                      {link.label}
                    </button>
                  )
                ))}
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block mx-4 my-3 text-center bg-[#D32B36] hover:bg-[#F1A722] text-white px-6 py-2 rounded-full transition-colors font-semibold shadow-lg hover:shadow-xl"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;