import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHotelImages, uploadHotelImages, updateHotelImage, deleteHotelImage, clearSuccess, clearError, optimisticUpdate } from '../store/slices/hotelImageSlice';

const HotelImages = () => {
  const dispatch = useDispatch();
  const { items, loading, error, success } = useSelector(state => state.hotelImage);
  const { user } = useSelector(state => state.auth);
  
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const debounceTimers = useRef({});

  // Ensure images is always an array
  const imageList = items || [];
  
  // Check if user has edit permissions (only merchant and manager)
  const canEdit = user?.role === 'merchant' || user?.role === 'manager';

  const handleAddImagesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  useEffect(() => {
    dispatch(fetchHotelImages());
  }, [dispatch]);

  // Debounced update function to prevent excessive API calls
  const debouncedUpdate = useCallback((id, data, delay = 800) => {
    // Clear existing timer for this image
    if (debounceTimers.current[id]) {
      clearTimeout(debounceTimers.current[id]);
    }

    // Set new timer
    debounceTimers.current[id] = setTimeout(() => {
      dispatch(updateHotelImage({ id, data }))
        .unwrap()
        .catch(err => {
          setToast('Failed to update image');
          console.error('Update error:', err);
        });
      delete debounceTimers.current[id];
    }, delay);
  }, [dispatch]);

  // Immediate update for checkboxes (with optimistic update)
  const immediateUpdate = useCallback((id, data) => {
    // Optimistically update UI immediately
    dispatch(optimisticUpdate({ id, data }));
    
    // Then send to server
    dispatch(updateHotelImage({ id, data }))
      .unwrap()
      .catch(err => {
        // Revert on error by refetching
        dispatch(fetchHotelImages());
        setToast('Failed to update image');
        console.error('Update error:', err);
      });
  }, [dispatch]);

  // Handle exclusive selection (only one image can have this property)
  const handleExclusiveSelection = useCallback(async (currentId, property, isChecked) => {
    if (!isChecked) {
      // If unchecking, just update current image
      immediateUpdate(currentId, { [property]: false });
      return;
    }

    // If checking, first uncheck all other images with this property
    const otherImages = imageList.filter(img => img._id !== currentId && img[property]);
    
    // Uncheck all other images first
    for (const img of otherImages) {
      dispatch(optimisticUpdate({ id: img._id, data: { [property]: false } }));
      await dispatch(updateHotelImage({ id: img._id, data: { [property]: false } })).unwrap().catch(() => {});
    }

    // Then check the current image
    immediateUpdate(currentId, { [property]: true });
  }, [imageList, dispatch, immediateUpdate]);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(timer => clearTimeout(timer));
    };
  }, []);

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-2">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Hotel Images</h1>
          {canEdit && (
            <button
              onClick={handleAddImagesClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
            >
              <span>➕</span>
              <span>Add Images</span>
            </button>
          )}
        </div>
        {!canEdit && (
          <p className="text-gray-600 mb-3 sm:mb-4 text-xs sm:text-sm">View only - You can see hotel images but cannot modify them.</p>
        )}

        {/* Hidden file input to trigger on button click */}
        {canEdit && (
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
        )}
        {(toast || error) && (
          <div className={`mb-3 sm:mb-4 p-2 text-sm rounded ${error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {error || toast}
          </div>
        )}

        {loading ? (
          <div className="text-sm">Loading...</div>
        ) : imageList.length === 0 ? (
          <div className="flex items-center justify-center h-32 sm:h-40 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-xs sm:text-sm">
            No images yet. Click "Add Images" to upload.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {imageList.map(img => (
              <div key={img._id} className="border rounded-lg overflow-hidden">
                <img src={img.url} alt={img.alt || img.title || 'Hotel image'} className="w-full h-32 sm:h-40 object-cover" />
                
                {canEdit ? (
                  // Full edit controls for merchant and manager
                  <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="h-3 w-3 sm:h-4 sm:w-4"
                          checked={!!img.isBanner}
                          onChange={(e) => {
                            immediateUpdate(img._id, { isBanner: e.target.checked });
                          }}
                        />
                        <span>Use in banner</span>
                      </label>
                      <button
                        className="px-2 sm:px-3 py-1 bg-red-600 text-white rounded disabled:opacity-60 text-xs sm:text-sm"
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

                    <div className="flex items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="h-3 w-3 sm:h-4 sm:w-4 cursor-pointer"
                          checked={!!img.isWelcome}
                          onChange={(e) => {
                            handleExclusiveSelection(img._id, 'isWelcome', e.target.checked);
                          }}
                        />
                        <span>Use as welcome image</span>
                      </label>
                      {img.isWelcome && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 sm:py-1 rounded">Selected</span>}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="h-3 w-3 sm:h-4 sm:w-4 cursor-pointer"
                          checked={!!img.isCuisineGallery}
                          onChange={(e) => {
                            handleExclusiveSelection(img._id, 'isCuisineGallery', e.target.checked);
                          }}
                        />
                        <span>Cuisine gallery background</span>
                      </label>
                      {img.isCuisineGallery && <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 sm:py-1 rounded">Selected</span>}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="h-3 w-3 sm:h-4 sm:w-4 cursor-pointer"
                          checked={!!img.isCuisineCard}
                          onChange={(e) => {
                            immediateUpdate(img._id, { isCuisineCard: e.target.checked });
                          }}
                        />
                        <span>Show in cuisine gallery</span>
                      </label>
                      {img.isCuisineCard && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 sm:py-1 rounded">Active</span>}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="h-3 w-3 sm:h-4 sm:w-4 cursor-pointer"
                          checked={!!img.isLoginImage}
                          onChange={(e) => {
                            handleExclusiveSelection(img._id, 'isLoginImage', e.target.checked);
                          }}
                        />
                        <span>Use as login page image</span>
                      </label>
                      {img.isLoginImage && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 sm:py-1 rounded">Selected</span>}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Banner heading</label>
                      <input
                        type="text"
                        defaultValue={img.bannerHeading || ''}
                        onChange={(e) => {
                          debouncedUpdate(img._id, { bannerHeading: e.target.value });
                        }}
                        placeholder="e.g., Come Join Us For A Magical Experience"
                        className="w-full border rounded px-2 py-1.5 text-xs sm:text-sm"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="px-2 sm:px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-xs sm:text-sm"
                        onClick={() => {
                          // Clear any pending updates for this image
                          if (debounceTimers.current[img._id]) {
                            clearTimeout(debounceTimers.current[img._id]);
                            delete debounceTimers.current[img._id];
                          }
                          dispatch(fetchHotelImages());
                        }}
                        disabled={saving}
                      >Reset</button>
                    </div>
                  </div>
                ) : (
                  // Read-only view for supervisor and staff
                  <div className="p-2 sm:p-3 space-y-2">
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {img.isBanner && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Banner</span>
                      )}
                      {img.isWelcome && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Welcome</span>
                      )}
                      {img.isCuisineGallery && (
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">Cuisine BG</span>
                      )}
                      {img.isCuisineCard && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Cuisine Gallery</span>
                      )}
                      {img.isLoginImage && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Login Image</span>
                      )}
                    </div>
                    {img.bannerHeading && (
                      <div className="text-xs text-gray-600">
                        <span className="font-semibold">Heading:</span> {img.bannerHeading}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelImages;
