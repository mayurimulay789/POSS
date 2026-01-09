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
    /* Changed max-w-md to max-w-7xl to allow the grid to breathe on desktop, while keeping px-2 for mobile */
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Hotel Images</h1>
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
          <p className="text-gray-600 mb-4 text-[10px] sm:text-sm">View only - You can see hotel images but cannot modify them.</p>
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
          <div className={`mb-4 p-2 text-xs sm:text-sm rounded ${error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
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
          /* Grid Change: grid-cols-2 for mobile, sm:grid-cols-2 for tablets, lg:grid-cols-3/4 for desktop */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
            {imageList.map(img => (
              <div key={img._id} className="border rounded-lg overflow-hidden flex flex-col bg-gray-50">
                <img src={img.url} alt={img.alt || img.title || 'Hotel image'} className="w-full h-24 xs:h-32 sm:h-40 object-cover" />
                
                {canEdit ? (
                  /* Reduced padding on p-2 for mobile to fit 2-grid content */
                  <div className="p-1.5 sm:p-3 space-y-1.5 sm:space-y-3 flex-1 flex flex-col">
                    <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-1">
                      <button
                        className="w-full xs:w-auto px-2 py-0.5 bg-red-600 text-white rounded disabled:opacity-60 text-[10px] sm:text-sm"
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

                    <div className="flex flex-col gap-1 sm:gap-2">
                      <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="h-4 w-4 sm:h-4 sm:w-4"
                          checked={!!img.isBanner}
                          onChange={(e) => {
                            immediateUpdate(img._id, { isBanner: e.target.checked });
                          }}
                        />
                        <span className="leading-tight">Banner</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="h-4 w-4 sm:h-4 sm:w-4 cursor-pointer"
                          checked={!!img.isWelcome}
                          onChange={(e) => {
                            handleExclusiveSelection(img._id, 'isWelcome', e.target.checked);
                          }}
                        />
                        <span className="leading-tight">Welcome Image</span>
                      </label>

                      <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="h-4 w-4 sm:h-4 sm:w-4 cursor-pointer"
                          checked={!!img.isCuisineGallery}
                          onChange={(e) => {
                            handleExclusiveSelection(img._id, 'isCuisineGallery', e.target.checked);
                          }}
                        />
                        <span className="leading-tight">Cuisine BG</span>
                      </label>

                      <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="h-4 w-4 sm:h-4 sm:w-4 cursor-pointer"
                          checked={!!img.isCuisineCard}
                          onChange={(e) => {
                            immediateUpdate(img._id, { isCuisineCard: e.target.checked });
                          }}
                        />
                        <span className="leading-tight">Cuisine Gallery</span>
                      </label>

                      <label className="inline-flex items-center gap-2 text-xs sm:text-sm text-gray-700">
                        <input
                          type="checkbox"
                          className="h-4 w-4 sm:h-4 sm:w-4 cursor-pointer"
                          checked={!!img.isLoginImage}
                          onChange={(e) => {
                            handleExclusiveSelection(img._id, 'isLoginImage', e.target.checked);
                          }}
                        />
                        <span className="leading-tight">Login Page</span>
                      </label>
                    </div>

                    <div className="mt-auto">
                      <label className="block text-[9px] sm:text-xs text-gray-500 mb-0.5">Banner heading</label>
                      <input
                        type="text"
                        defaultValue={img.bannerHeading || ''}
                        onChange={(e) => {
                          debouncedUpdate(img._id, { bannerHeading: e.target.value });
                        }}
                        placeholder="Heading text..."
                        className="w-full border rounded px-1.5 py-1 text-[10px] sm:text-sm"
                      />
                    </div>

                    <div className="pt-1 flex items-center justify-end">
                      <button
                        className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-[10px] sm:text-sm"
                        onClick={() => {
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
                  <div className="p-2 sm:p-3 space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {img.isBanner && <span className="text-[9px] sm:text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Banner</span>}
                      {img.isWelcome && <span className="text-[9px] sm:text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Welcome</span>}
                      {img.isCuisineGallery && <span className="text-[9px] sm:text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">Cuisine BG</span>}
                      {img.isCuisineCard && <span className="text-[9px] sm:text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Cuisine</span>}
                      {img.isLoginImage && <span className="text-[9px] sm:text-xs bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Login</span>}
                    </div>
                    {img.bannerHeading && (
                      <div className="text-[10px] sm:text-xs text-gray-600 truncate">
                        <span className="font-semibold">Title:</span> {img.bannerHeading}
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