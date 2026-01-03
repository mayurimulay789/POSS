import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContactUs, updateContactUs } from '../../../store/slices/contactUsSlice';
import API_BASE_URL from '../../../config/apiConfig';

const ContactUsManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { contactUs, loading, error, success } = useSelector(state => state.contactUs);

  // Form states
  const [email, setEmail] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [address, setAddress] = useState('');
  const [googleMapLocation, setGoogleMapLocation] = useState('');
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchContactUs()).unwrap().catch(err => {
      console.log('No existing contact info found');
    });
  }, [dispatch]);

  // Update form when Redux state changes
  useEffect(() => {
    if (contactUs?.data) {
      const data = contactUs.data;
      setEmail(data.email || '');
      setContactNo(data.contactNo || '');
      setAddress(data.address || '');
      setGoogleMapLocation(data.googleMapLocation || '');
    }
  }, [contactUs]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    const payload = {
      email,
      contactNo,
      address,
      googleMapLocation
    };

    try {
      await dispatch(updateContactUs(payload)).unwrap();
      setLocalSuccess('Contact information saved successfully!');
      setTimeout(() => setLocalSuccess(''), 3000);
    } catch (err) {
      setLocalError(err?.message || 'Error saving contact information');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Contact Us Management</h1>

      {(error || localError) && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error || localError}
        </div>
      )}

      {(success || localSuccess) && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success || localSuccess}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="contact@hotel.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Contact Number *</label>
              <input
                type="text"
                value={contactNo}
                onChange={(e) => setContactNo(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="+1 234 567 890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address *</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                rows="3"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="123 Main Street, City, State, ZIP"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Google Maps Embed URL</label>
              <input
                type="text"
                value={googleMapLocation}
                onChange={(e) => setGoogleMapLocation(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
              <p className="text-xs text-gray-500 mt-1">
                To get the embed URL:
              </p>
              <ol className="text-xs text-gray-500 list-decimal list-inside mt-1 ml-2">
                <li>Open <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Google Maps</a></li>
                <li>Search for your restaurant address</li>
                <li>Click "Share" button (top left)</li>
                <li>Click "Embed a map" tab</li>
                <li>Copy the URL from the <code className="bg-gray-100 px-2">src=</code> attribute</li>
              </ol>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Contact Information'}
        </button>
      </form>
    </div>
  );
};

export default ContactUsManagement;
