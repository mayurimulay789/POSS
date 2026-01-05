import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllWelcomeSections, 
  createWelcomeSection,
  updateWelcomeSection,
  deleteWelcomeSection,
  toggleWelcomeSectionStatus
} from '../../../store/slices/welcomeSectionSlice';

const WelcomeSectionManagement = () => {
  const dispatch = useDispatch();
  const { sections, loading, error, success } = useSelector(state => state.welcomeSection);

  // Form state
  const [form, setForm] = useState({
    hotelName: '',
    tagline: '',
    description: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [localError, setLocalError] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchAllWelcomeSections());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(fetchAllWelcomeSections());
      }, 100);
    }
  }, [success, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      if (editMode && editId) {
        await dispatch(updateWelcomeSection({ id: editId, data: form })).unwrap();
        setToastMessage('Welcome section updated successfully!');
      } else {
        await dispatch(createWelcomeSection(form)).unwrap();
        setToastMessage('Welcome section created successfully!');
      }
      
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      
      // Reset form
      setForm({ hotelName: '', tagline: '', description: '' });
      setEditMode(false);
      setEditId(null);
    } catch (err) {
      setLocalError(err?.message || 'Error saving welcome section');
    }
  };

  const handleEdit = (section) => {
    setForm({
      hotelName: section.hotelName || '',
      tagline: section.tagline || '',
      description: section.description || ''
    });
    setEditMode(true);
    setEditId(section._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setForm({ hotelName: '', tagline: '', description: '' });
    setEditMode(false);
    setEditId(null);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteId) {
      try {
        await dispatch(deleteWelcomeSection(deleteId)).unwrap();
        setToastMessage('Welcome section deleted successfully!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } catch (err) {
        setLocalError(err?.message || 'Error deleting welcome section');
      }
    }
    setShowDeleteModal(false);
    setDeleteId(null);
  };

  const handleToggleStatus = async (id) => {
    try {
      await dispatch(toggleWelcomeSectionStatus(id)).unwrap();
      setToastMessage('Status updated successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      // Refetch all sections to get updated status
      await dispatch(fetchAllWelcomeSections());
    } catch (err) {
      setLocalError(err?.message || 'Error toggling status');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome Section Management</h1>

      {(error || localError) && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error || localError}
        </div>
      )}

      {showToast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Create/Edit Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editMode ? 'Edit Welcome Section' : 'Create New Welcome Section'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Hotel Name *</label>
            <input
              type="text"
              name="hotelName"
              value={form.hotelName}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Hotel Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tagline *</label>
            <input
              type="text"
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Short catchy tagline"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Welcome Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Full description..."
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              disabled={loading}
            >
              {loading ? 'Saving...' : editMode ? 'Update' : 'Create'}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-semibold"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Sections List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">All Welcome Sections</h2>
        
        {loading && sections.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-lg">Loading...</div>
          </div>
        ) : sections.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No welcome sections found. Create your first one above!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hotel Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tagline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sections.map((section) => (
                  <tr key={section._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{section.hotelName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{section.tagline}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        section.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {section.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(section.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(section)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(section._id)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {section.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(section._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this welcome section? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WelcomeSectionManagement;