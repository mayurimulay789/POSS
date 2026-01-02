

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-[#0A3D4D] to-[#134A5C] text-gray-100">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Restaurant Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">🍽️ India Restaurant</h3>
            <p className="text-gray-300 text-sm mb-3">
              Authentic Indian cuisine crafted with passion and served with excellence.
            </p>
            <p className="text-gray-400 text-xs">
              Experience the true flavors of India with our traditional recipes.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#menu" className="text-gray-300 hover:text-[#FF9800] transition">Menu</a></li>
              <li><a href="#gallery" className="text-gray-300 hover:text-[#FF9800] transition">Gallery</a></li>
              <li><a href="/contact-us" className="text-gray-300 hover:text-[#FF9800] transition">Contact Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#FF9800] transition">About Us</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <span>📞</span> +91 (XXX) XXX-XXXX
              </li>
              <li className="flex items-center gap-2">
                <span>📧</span> info@indianrest.com
              </li>
              <li className="flex items-center gap-2">
                <span>📍</span> Main Street, City
              </li>
              <li className="flex items-center gap-2">
                <span>🕐</span> Open Daily 11 AM - 11 PM
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Follow Us</h4>
            <div className="flex gap-4 mb-4">
              <a href="#" className="w-10 h-10 bg-[#FF9800] rounded-full flex items-center justify-center hover:bg-[#F57C00] transition">
                f
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 bg-[#FF9800] rounded-full flex items-center justify-center hover:bg-[#F57C00] transition">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-white stroke-[1.6]">
                  <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
                  <circle cx="12" cy="12" r="4.2" />
                  <circle cx="17.4" cy="6.6" r="0.8" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-[#FF9800] rounded-full flex items-center justify-center hover:bg-[#F57C00] transition">
                𝕏
              </a>
            </div>
            <p className="text-gray-400 text-xs">
              Subscribe to our newsletter for updates and special offers.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-600 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© {currentYear} India Restaurant. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[#FF9800] transition">Privacy Policy</a>
            <a href="#" className="hover:text-[#FF9800] transition">Terms of Service</a>
            <a href="#" className="hover:text-[#FF9800] transition">Cookie Policy</a>
          </div>
          <p className="mt-4 md:mt-0 text-xs text-gray-500">Powered by POS Management System</p>
        </div>
      </div>
    </footer>
  );
}