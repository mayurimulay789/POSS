import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadLogo, fetchLogo, clearLogoSuccess, clearLogoError, deleteLogo } from '/src/store/slices/logoSlice';

const LogoManagement = () => {
  const dispatch = useDispatch();
  const fileInputRef = useRef();
  const { logoUrl, loading, error, success } = useSelector((state) => state.logo);
  const [showToast, setShowToast] = React.useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      dispatch(uploadLogo(file)).then(() => {
        dispatch(fetchLogo());
        if (fileInputRef.current) fileInputRef.current.value = '';
      });
    }
  };
  // Clear file input after logo is deleted
  useEffect(() => {
    if (!logoUrl && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [logoUrl]);

  // Show toast for 2s on success, then clear
  useEffect(() => {
    if (success) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
        dispatch(clearLogoSuccess());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);
  const handleClearError = () => dispatch(clearLogoError());

  return (
    <div className="min-h-[70vh] flex flex-col justify-center items-center bg-gradient-to-br from-amber-50 to-white py-10 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg flex flex-col items-center">
        <h2 className="text-3xl font-extrabold mb-6 text-amber-600 tracking-tight">Logo Management</h2>
        <p className="mb-6 text-gray-500 text-center max-w-md">Upload your restaurant's logo to personalize your POS system. You can also remove the current logo if needed.</p>
        {logoUrl ? (
          <div className="mb-6 flex flex-col items-center w-full">
            <img src={logoUrl} alt="Current Logo" className="h-32 object-contain mb-2 border rounded shadow" />
            <span className="text-xs text-gray-500 mb-2">Current Logo</span>
            <button
              onClick={() => dispatch(deleteLogo())}
              className="px-4 py-2 bg-red-500 text-white rounded shadow hover:bg-red-600 transition mb-2"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Logo'}
            </button>
          </div>
        ) : (
          <div className="mb-6 flex flex-col items-center w-full">
            <div className="h-32 w-32 flex items-center justify-center bg-gray-100 border rounded mb-2">
              <span className="text-5xl text-gray-300">🖼️</span>
            </div>
            <span className="text-xs text-gray-400 mb-2">No logo uploaded</span>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="mb-4 w-full file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
        />
        {loading && <div className="text-blue-500 mb-2">Uploading...</div>}
        {showToast && (
          <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-3 rounded shadow-lg animate-fade-in-out">
            Action successful!
          </div>
        )}
        {error && (
          <div className="text-red-600 mb-2">{error} <button onClick={handleClearError} className="ml-2 text-xs underline">Dismiss</button></div>
        )}
      </div>
    </div>
  );
};

export default LogoManagement;
