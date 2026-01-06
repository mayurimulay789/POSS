import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllFooters,
  createFooter,
  updateFooter,
  deleteFooter,
  toggleFooterStatus,
  clearSuccess,
  clearError
} from '/src/store/slices/footerSlice';

const FooterManagement = () => {
  const dispatch = useDispatch();
  const { footers, loading, error, success } = useSelector(state => state.footer);

  const [form, setForm] = useState({
    restaurantName: '',
    shortDescription: '',
    hours: '',
    social: { facebook: '', instagram: '', twitter: '' },
    poweredBy: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllFooters());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
  }, [success, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [group, field] = name.split('.');
      setForm(prev => ({ ...prev, [group]: { ...prev[group], [field]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await dispatch(updateFooter({ id: editId, data: form })).unwrap();
      } else {
        await dispatch(createFooter(form)).unwrap();
      }
      resetForm();
      dispatch(fetchAllFooters());
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  const resetForm = () => {
    setForm({
      restaurantName: '',
      shortDescription: '',
      hours: '',
      social: { facebook: '', instagram: '', twitter: '' },
      poweredBy: ''
    });
    setEditMode(false);
    setEditId(null);
  };

  const handleEdit = (footer) => {
    setForm({
      restaurantName: footer.restaurantName || '',
      shortDescription: footer.shortDescription || '',
      hours: footer.hours || '',
      social: {
        facebook: footer.social?.facebook || '',
        instagram: footer.social?.instagram || '',
        twitter: footer.social?.twitter || ''
      },
      poweredBy: footer.poweredBy || ''
    });
    setEditMode(true);
    setEditId(footer._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteFooter(deleteId)).unwrap();
      setShowDeleteModal(false);
      setDeleteId(null);
      dispatch(fetchAllFooters());
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await dispatch(toggleFooterStatus(id)).unwrap();
      dispatch(fetchAllFooters());
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl font-extrabold mb-8 text-amber-600 text-center tracking-tight">
          Footer Management
        </h2>

        {/* Form Section */}
        <div className="bg-white p-8 rounded-2xl shadow-xl mb-8 border border-gray-100">
          <h3 className="text-2xl font-bold mb-6 text-gray-800">
            {editMode ? 'Edit Footer' : 'Add New Footer'}
          </h3>

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              ✅ Operation successful!
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Restaurant Name *</label>
                <input
                  type="text"
                  name="restaurantName"
                  value={form.restaurantName}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Opening Hours *</label>
                <input
                  type="text"
                  name="hours"
                  value={form.hours}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 10:00 AM - 10:00 PM"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">Short Description *</label>
              <input
                type="text"
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-gray-700">Powered By Text</label>
              <input
                type="text"
                name="poweredBy"
                value={form.poweredBy}
                onChange={handleChange}
                placeholder="e.g. Powered by POS Management System"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Facebook URL</label>
                <input
                  type="url"
                  name="social.facebook"
                  value={form.social.facebook}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Instagram URL</label>
                <input
                  type="url"
                  name="social.instagram"
                  value={form.social.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-2 text-gray-700">Twitter URL</label>
                <input
                  type="url"
                  name="social.twitter"
                  value={form.social.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-3 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors shadow-md"
                disabled={loading}
              >
                {loading ? 'Saving...' : editMode ? '💾 Update Footer' : '➕ Add Footer'}
              </button>
              {editMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg font-bold hover:bg-gray-600 transition-colors shadow-md"
                >
                  ✖ Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 bg-gradient-to-r from-amber-600 to-amber-700">
            <h3 className="text-2xl font-bold text-white">📄 All Footers</h3>
          </div>

          {loading && (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
              <p className="mt-2">Loading...</p>
            </div>
          )}

          {!loading && footers?.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg">No footers found. Add one above!</p>
            </div>
          )}

          {!loading && footers?.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Restaurant Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Hours</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {footers.map((footer, index) => (
                    <tr key={footer._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{footer.restaurantName}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{footer.hours}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={footer.shortDescription}>
                        {footer.shortDescription}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          footer.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {footer.isActive ? '✓ Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEdit(footer)}
                            className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded hover:bg-blue-600 transition-colors"
                            title="Edit"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleToggleStatus(footer._id)}
                            className={`px-3 py-1 text-white text-xs font-semibold rounded transition-colors ${
                              footer.isActive 
                                ? 'bg-yellow-500 hover:bg-yellow-600' 
                                : 'bg-green-500 hover:bg-green-600'
                            }`}
                            title={footer.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {footer.isActive ? '⊗ Deactivate' : '✓ Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(footer._id)}
                            className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded hover:bg-red-600 transition-colors"
                            title="Delete"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">⚠️ Confirm Delete</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this footer? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDelete}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Yes, Delete'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteId(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FooterManagement;
