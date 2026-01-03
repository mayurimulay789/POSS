import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWelcomeSection, updateWelcomeSection } from '../../../store/slices/welcomeSectionSlice';

const WelcomeSectionManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { welcomeSection, loading, error, success } = useSelector(state => state.welcomeSection);

  // Form states
  const [hotelName, setHotelName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchWelcomeSection()).unwrap().catch(err => {
      console.log('No existing welcome section found');
    });
  }, [dispatch]);

  useEffect(() => {
    if (welcomeSection?.data) {
      const data = welcomeSection.data;
      setHotelName(data.hotelName || '');
      setTagline(data.tagline || '');
      setDescription(data.description || '');
    }
  }, [welcomeSection]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    const payload = {
      hotelName,
      tagline,
      description
    };

    try {
      await dispatch(updateWelcomeSection(payload)).unwrap();
      setLocalSuccess('Welcome section saved successfully!');
      setTimeout(() => setLocalSuccess(''), 3000);
    } catch (err) {
      setLocalError(err?.message || 'Error saving welcome section');
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome Section Management</h1>

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
          <h2 className="text-xl font-semibold mb-4">Hotel Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Hotel Name *</label>
              <input
                type="text"
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="The Grand Hotel"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tagline *</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Experience Luxury & Comfort"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows="6"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Welcome to our hotel where luxury meets comfort..."
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Welcome Section'}
        </button>
      </form>
    </div>
  );
};

export default WelcomeSectionManagement;
