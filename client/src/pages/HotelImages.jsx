import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotelImages, uploadHotelImages, updateHotelImage, deleteHotelImage, clearSuccess, clearError } from '../store/slices/hotelImageSlice';

const HotelImages = () => {
  const dispatch = useDispatch();
  const { items, loading, error, success } = useSelector(state => state.hotelImage);
  
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Ensure images is always an array
  const imageList = items || [];

  const handleAddImagesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    dispatch(fetchHotelImages());
  }, [dispatch]);
  // All data is now managed via Redux thunks/selectors. No direct API calls here.

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
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (!files.length) return;
            const form = new FormData();
            files.forEach(f => form.append('images', f));
            setSaving(true);
            dispatch(uploadHotelImages(form))
              .unwrap()
              .then(() => {
                setToast('Images uploaded successfully');
                dispatch(fetchHotelImages());
              })
              .catch(err => {
                setToast('Failed to upload images');
                console.error('Upload error:', err);
              })
              .finally(() => {
                setSaving(false);
                e.target.value = '';
                setTimeout(() => setToast(null), 2500);
              });
          }}
        />
        {(toast || error) && (
          <div className={`mb-4 p-2 rounded ${error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {error || toast}
          </div>
        )}

        {loading ? (
          <div>Loading...</div>
        ) : imageList.length === 0 ? (
          <div className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg text-gray-500">
            No images yet. Click "Add Images" to upload.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {imageList.map(img => (
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
                          dispatch(updateHotelImage({
                            id: img._id,
                            data: { isBanner: val }
                          }))
                            .catch(err => {
                              setToast('Failed to update image');
                              console.error('Update error:', err);
                            });
                        }}
                      />
                      <span>Use in banner</span>
                    </label>
                    <button
                      className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-60"
                      disabled={saving}
                      onClick={() => {
                        if (!confirm('Delete this image?')) return;
                        dispatch(deleteHotelImage(img._id))
                          .unwrap()
                          .then(() => {
                            setToast('Image deleted successfully');
                          })
                          .catch(err => {
                            setToast('Failed to delete image');
                            console.error('Delete error:', err);
                          });
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
                          dispatch(updateHotelImage({
                            id: img._id,
                            data: { isWelcome: val, isCuisineGallery: val ? false : img.isCuisineGallery }
                          }))
                            .catch(err => {
                              setToast('Failed to update image');
                              console.error('Update error:', err);
                            });
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
                          dispatch(updateHotelImage({
                            id: img._id,
                            data: { isCuisineGallery: val, isWelcome: val ? false : img.isWelcome }
                          }))
                            .catch(err => {
                              setToast('Failed to update image');
                              console.error('Update error:', err);
                            });
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
                          dispatch(updateHotelImage({
                            id: img._id,
                            data: { isCuisineCard: val }
                          }))
                            .catch(err => {
                              setToast('Failed to update image');
                              console.error('Update error:', err);
                            });
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
                          dispatch(updateHotelImage({
                            id: img._id,
                            data: { isLoginImage: val }
                          }))
                            .catch(err => {
                              setToast('Failed to update image');
                              console.error('Update error:', err);
                            });
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
                        dispatch(updateHotelImage({
                          id: img._id,
                          data: { bannerHeading: v }
                        }))
                          .catch(err => {
                            setToast('Failed to update image');
                            console.error('Update error:', err);
                          });
                      }}
                      placeholder="e.g., Come Join Us For A Magical Experience"
                      className="w-full border rounded px-2 py-1.5 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      className="px-3 py-1 bg-gray-200 text-gray-700 rounded"
                      onClick={() => dispatch(fetchHotelImages())}
                      disabled={saving}
                    >Reset</button>
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
