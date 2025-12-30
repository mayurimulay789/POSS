import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

const HotelImages = () => {
  const fileInputRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const handleAddImagesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const getAuthHeaders = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) return { headers: { Authorization: `Bearer ${token}` } };
    } catch (_) {}
    return {};
  };

  const fetchImages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/hotel-images`, getAuthHeaders());
      // Preserve the current state by merging with fetched data
      setImages(prev => {
        const fetched = res.data || [];
        // If we have previous state, try to preserve unsaved changes
        if (prev.length === 0) return fetched;
        // Otherwise just return fresh data
        return fetched;
      });
      setImages(res.data || []);
    } catch (err) {
      console.error('Fetch images error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-800">Hotel Images</h1>
          <button
            onClick={handleAddImagesClick}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span>➕</span>
            <span>Add Images</span>
          </button>
        </div>
        <p className="text-gray-600 mb-6">Manage and view hotel images here. This is a standalone tab and not tied to other operations.</p>

        {/* Hidden file input to trigger on button click */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;
            const form = new FormData();
            files.forEach(f => form.append('images', f));
            try {
              setSaving(true);
              const res = await axios.post(`${API_BASE}/api/hotel-images`, form, getAuthHeaders());
              setToast('Images uploaded');
              setImages(prev => [...res.data, ...prev]);
            } catch (err) {
              console.error('Upload images error', err);
              setToast('Failed to upload');
            } finally {
              setSaving(false);
              e.target.value = '';
              setTimeout(() => setToast(null), 2500);
            }
          }}
        />
        {toast && <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">{toast}</div>}

        {loading ? (
          <div>Loading...</div>
        ) : images.length === 0 ? (
          <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
            No images yet. Click "Add Images" to upload.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map(img => (
              <div key={img._id} className="border rounded-lg overflow-hidden">
                <img src={img.url} alt={img.alt || img.title || 'Hotel image'} className="w-full h-40 object-cover" />
                <div className="p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={!!img.isBanner}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setImages(prev => prev.map(i => i._id === img._id ? { ...i, isBanner: val } : i));
                        }}
                      />
                      <span>Use in banner</span>
                    </label>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-60"
                      disabled={saving}
                      onClick={async () => {
                        if (!confirm('Delete this image?')) return;
                        try {
                          setSaving(true);
                          await axios.delete(`${API_BASE}/api/hotel-images/${img._id}`, getAuthHeaders());
                          setImages(prev => prev.filter(i => i._id !== img._id));
                        } catch (err) {
                          console.error('Delete image error', err);
                          setToast('Failed to delete');
                          setTimeout(() => setToast(null), 1500);
                        } finally {
                          setSaving(false);
                        }
                      }}
                    >Delete</button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer"
                        checked={!!img.isWelcome}
                        onChange={(e) => {
                          const val = e.target.checked;
                          // Ensure only one welcome image at a time
                          setImages(prev => prev.map(i => {
                            if (i._id === img._id) {
                              return { ...i, isWelcome: val };
                            }
                            // When selecting this one, turn off others
                            return val ? { ...i, isWelcome: false } : i;
                          }));
                        }}
                      />
                      <span>Use as welcome image</span>
                    </label>
                    {img.isWelcome && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Selected</span>}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer"
                        checked={!!img.isCuisineGallery}
                        onChange={(e) => {
                          const val = e.target.checked;
                          // Ensure only one cuisine gallery image at a time
                          setImages(prev => prev.map(i => {
                            if (i._id === img._id) {
                              return { ...i, isCuisineGallery: val };
                            }
                            // When selecting this one, turn off others
                            return val ? { ...i, isCuisineGallery: false } : i;
                          }));
                        }}
                      />
                      <span>Cuisine gallery background</span>
                    </label>
                    {img.isCuisineGallery && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Selected</span>}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer"
                        checked={!!img.isCuisineCard}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setImages(prev => prev.map(i => {
                            if (i._id === img._id) {
                              return { ...i, isCuisineCard: val };
                            }
                            return i;
                          }));
                        }}
                      />
                      <span>Show in cuisine gallery</span>
                    </label>
                    {img.isCuisineCard && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>}
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer"
                        checked={!!img.isLoginImage}
                        onChange={(e) => {
                          const val = e.target.checked;
                          // Ensure only one login image at a time
                          setImages(prev => prev.map(i => {
                            if (i._id === img._id) {
                              return { ...i, isLoginImage: val };
                            }
                            // When selecting this one, turn off others
                            return val ? { ...i, isLoginImage: false } : i;
                          }));
                        }}
                      />
                      <span>Use as login page image</span>
                    </label>
                    {img.isLoginImage && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Selected</span>}
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Banner heading</label>
                    <input
                      type="text"
                      value={img.bannerHeading || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setImages(prev => prev.map(i => i._id === img._id ? { ...i, bannerHeading: v } : i));
                      }}
                      placeholder="e.g., Come Join Us For A Magical Experience"
                      className="w-full border rounded px-2 py-1.5 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
                      onClick={() => fetchImages()}
                      disabled={saving}
                    >Reset</button>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-60"
                      disabled={saving}
                      onClick={async () => {
                        try {
                          setSaving(true);
                          const payload = {
                            isBanner: !!img.isBanner,
                            bannerHeading: img.bannerHeading || '',
                            isWelcome: !!img.isWelcome,
                            isCuisineGallery: !!img.isCuisineGallery,
                            isCuisineCard: !!img.isCuisineCard,
                            isLoginImage: !!img.isLoginImage,
                          };
                          const res = await axios.put(`${API_BASE}/api/hotel-images/${img._id}`, payload, getAuthHeaders());
                          // Update the image with the server response to show saved state
                          setImages(prev => prev.map(i => i._id === img._id ? { ...i, ...res.data } : i));
                          setToast('Saved successfully');
                        } catch (err) {
                          console.error('Save image meta error', err);
                          setToast('Failed to save');
                        } finally {
                          setSaving(false);
                          setTimeout(() => setToast(null), 1500);
                        }
                      }}
                    >Save</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelImages;
