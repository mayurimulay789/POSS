import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCuisineGallery, updateCuisineGallery } from '../../../store/slices/cuisineGallerySlice';

const CuisineGalleryManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { cuisineGallery } = useSelector(state => state.cuisineGallery);

  // Form states
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [description, setDescription] = useState('');
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');

  const loading = cuisineGallery?.loading || false;
  const error = cuisineGallery?.error || null;
  const success = cuisineGallery?.success || false;

  useEffect(() => {
    dispatch(fetchCuisineGallery()).unwrap().catch(err => {
      console.log('No existing cuisine gallery found');
    });
  }, [dispatch]);

  useEffect(() => {
    if (cuisineGallery?.data) {
      const data = cuisineGallery.data;
      setHeading(data.heading || '');
      setSubheading(data.subheading || '');
      setDescription(data.description || '');
    }
  }, [cuisineGallery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');

    const payload = {
      heading,
      subheading,
      description
    };

    try {
      await dispatch(updateCuisineGallery(payload)).unwrap();
      setLocalSuccess('Cuisine gallery updated successfully!');
      setTimeout(() => setLocalSuccess(''), 3000);
    } catch (err) {
      setLocalError(err?.message || 'Error saving cuisine gallery');
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
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Cuisine Gallery Management</h1>

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
          <h2 className="text-xl font-semibold mb-4">Gallery Content</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Heading *</label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Our Cuisine Gallery"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subheading</label>
              <input
                type="text"
                value={subheading}
                onChange={(e) => setSubheading(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Explore our delicious dishes"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="A brief description of your cuisine gallery..."
              />
            </div> */}
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Cuisine Gallery'}
        </button>
      </form>
    </div>
  );
};

export default CuisineGalleryManagement;
