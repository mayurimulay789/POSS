import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
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

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* MAIN NAV BAR */}
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link 
            to="/" 
            className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition flex items-center gap-2"
          >
            <span className="text-3xl">🍽️</span>
            Restaurant POS
          </Link>

          {/* HAMBURGER (MOBILE ONLY) */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded focus:outline-none focus:ring-2 text-gray-700"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-current transition ${isMobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
              <span className={`w-full h-0.5 bg-current transition ${isMobileMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
              <span className={`w-full h-0.5 bg-current transition ${isMobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
            </div>
          </button>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-4">

            {isAuthenticated ? (
              <>
                {/* USER INFO */}
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 text-sm font-medium">
                    Welcome, {user?.name}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize flex items-center gap-1 ${getRoleColor(user?.role)}`}>
                    <span>{getRoleIcon(user?.role)}</span>
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={handleDashboardNavigation}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition flex items-center gap-2"
                >
                  <span>📊</span>
                  Dashboard
                </button>

                <button
                  onClick={handleLogout}
                  className="border border-gray-300 hover:border-red-500 text-gray-700 hover:text-red-600 px-4 py-2 rounded-md transition flex items-center gap-2"
                >
                  <span>🚪</span>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 transition font-medium"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        {/* MOBILE DROPDOWN */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg pb-3">

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
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 border-b border-gray-100 font-medium"
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