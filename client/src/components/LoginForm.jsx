import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError, clearSuccess } from '../store/slices/authSlice';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const LoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { loading, error, success, isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [localMessage, setLocalMessage] = useState('');
  const [loginImage, setLoginImage] = useState(null);

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  useEffect(() => {
    dispatch(clearError());
    dispatch(clearSuccess());
    
    // Fetch login image from new endpoint
    const fetchLoginImage = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/hotel-images/login`);
        setLoginImage(res.data || null);
      } catch (err) {
        console.error('Failed to load login image:', err);
        setLoginImage(null);
      }
    };
    fetchLoginImage();
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, user]);

  const onSubmit = async (e) => {
    e.preventDefault();
    
    setLocalMessage('');
    dispatch(clearError());
    
    if (!validateEmail(email)) {
      setLocalMessage('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setLocalMessage('Password must be at least 6 characters');
      return;
    }

    dispatch(loginUser(formData));
  };

  const handleClose = () => {
    navigate('/');
  };

  const displayMessage = localMessage || error || success;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A3D4D] via-[#134A5C] to-[#0A3D4D]">
      <div className="max-w-4xl w-full min-h-[450px] bg-white shadow-2xl rounded-2xl overflow-hidden flex relative">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <span className="text-2xl text-gray-500 hover:text-gray-700">✕</span>
        </button>

        {/* Left side image */}
        <div
          className="hidden md:block md:w-1/2 bg-cover bg-center"
          style={{ backgroundImage: loginImage ? `url('${loginImage.url}')` : "url('/images/two.jpg')" }}
        >
        </div>

        {/* Right side form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold mb-4 text-center text-[#0A3D4D]">Login</h2>
          <p className="text-center text-gray-600 mb-6">
            Please log in using your personal information
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div className="relative">
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={onChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent pr-10"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2/3 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                {showPassword ? 
                  <EyeSlashIcon className="h-5 w-5" /> : 
                  <EyeIcon className="h-5 w-5" />
                }
              </button>
            </div>

            <div className="flex justify-between items-center text-sm  ">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-400 hover:bg-amber-500 text-white py-3 rounded-lg font-semibold transition duration-300 disabled:bg-amber-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </div>
          </form>

          {displayMessage && (
            <p className={`mt-4 text-center ${
              localMessage || error ? 'text-red-500' : 'text-green-500'
            }`}>
              {displayMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginForm;