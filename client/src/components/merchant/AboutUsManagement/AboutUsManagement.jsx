import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAboutUs, updateAboutUs, clearSuccess, clearError } from '../../../store/slices/aboutUsSlice';

const AboutUsManagement = () => {
  const dispatch = useDispatch();
  const aboutUs = useSelector(state => state.aboutUs);
  const { data, loading, error, success } = aboutUs;

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    mainDescription: '',
    rhythmTitle: '',
    rhythmDescription: '',
    rhythmQuote: '',
    highlights: [],
    values: [],
    stats: []
  });
  const [validationErrors, setValidationErrors] = useState({});

  // Temporary state for adding items
  const [newHighlight, setNewHighlight] = useState({ title: '', description: '', icon: '' });
  const [newValue, setNewValue] = useState('');
  const [newStat, setNewStat] = useState({ label: '', value: '', detail: '' });

  useEffect(() => {
    dispatch(fetchAboutUs());
  }, [dispatch]);

  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      setForm({
        mainDescription: data.mainDescription || '',
        rhythmTitle: data.rhythmTitle || '',
        rhythmDescription: data.rhythmDescription || '',
        rhythmQuote: data.rhythmQuote || '',
        highlights: data.highlights || [],
        values: data.values || [],
        stats: data.stats || []
      });
    }
  }, [data]);

  useEffect(() => {
    if (success) {
      setShowModal(false);
      setTimeout(() => {
        dispatch(clearSuccess());
      }, 3000);
    }
  }, [success, dispatch]);

  // Validation functions
  const validateMainDescription = (desc) => {
    if (!desc || !desc.trim()) return 'Main description is required';
    if (desc.length < 20) return 'Main description must be at least 20 characters';
    if (desc.length > 2000) return 'Main description cannot exceed 2000 characters';
    return '';
  };

  const validateRhythmTitle = (title) => {
    if (!title || !title.trim()) return 'Rhythm title is required';
    if (title.length < 5) return 'Rhythm title must be at least 5 characters';
    if (title.length > 200) return 'Rhythm title cannot exceed 200 characters';
    return '';
  };

  const validateRhythmDescription = (desc) => {
    if (!desc || !desc.trim()) return 'Rhythm description is required';
    if (desc.length < 20) return 'Rhythm description must be at least 20 characters';
    if (desc.length > 1000) return 'Rhythm description cannot exceed 1000 characters';
    return '';
  };

  const validateRhythmQuote = (quote) => {
    if (!quote || !quote.trim()) return 'Rhythm quote is required';
    if (quote.length < 10) return 'Rhythm quote must be at least 10 characters';
    if (quote.length > 500) return 'Rhythm quote cannot exceed 500 characters';
    return '';
  };

  const validateForm = () => {
    const errors = {
      mainDescription: validateMainDescription(form.mainDescription),
      rhythmTitle: validateRhythmTitle(form.rhythmTitle),
      rhythmDescription: validateRhythmDescription(form.rhythmDescription),
      rhythmQuote: validateRhythmQuote(form.rhythmQuote)
    };

    if (form.highlights.length === 0) {
      errors.highlights = 'At least one highlight is required';
    }
    if (form.values.length === 0) {
      errors.values = 'At least one value is required';
    }
    if (form.stats.length === 0) {
      errors.stats = 'At least one statistic is required';
    }

    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await dispatch(updateAboutUs(form)).unwrap();
    } catch (err) {
      console.error('Failed to save:', err);
    }
  };

  const handleEdit = () => {
    setValidationErrors({});
    setShowModal(true);
  };

  // Highlight management
  const validateHighlight = (highlight) => {
    const errors = {};
    if (!highlight.title || !highlight.title.trim()) {
      errors.title = 'Title is required';
    } else if (highlight.title.length < 3 || highlight.title.length > 100) {
      errors.title = 'Title must be 3-100 characters';
    }
    if (!highlight.description || !highlight.description.trim()) {
      errors.description = 'Description is required';
    } else if (highlight.description.length < 10 || highlight.description.length > 500) {
      errors.description = 'Description must be 10-500 characters';
    }
    if (!highlight.icon || !highlight.icon.trim()) {
      errors.icon = 'Icon/emoji is required';
    }
    return errors;
  };

  const handleAddHighlight = () => {
    const errors = validateHighlight(newHighlight);
    if (Object.keys(errors).length > 0) {
      setValidationErrors({ newHighlight: errors });
      return;
    }
    setForm(prev => ({ ...prev, highlights: [...prev.highlights, newHighlight] }));
    setNewHighlight({ title: '', description: '', icon: '' });
    setValidationErrors({});
  };

  const handleRemoveHighlight = (index) => {
    setForm(prev => ({ ...prev, highlights: prev.highlights.filter((_, i) => i !== index) }));
  };

  // Value management
  const validateValue = (value) => {
    if (!value || !value.trim()) return 'Value is required';
    if (value.length < 5 || value.length > 300) return 'Value must be 5-300 characters';
    return '';
  };

  const handleAddValue = () => {
    const error = validateValue(newValue);
    if (error) {
      setValidationErrors({ newValue: error });
      return;
    }
    setForm(prev => ({ ...prev, values: [...prev.values, { text: newValue }] }));
    setNewValue('');
    setValidationErrors({});
  };

  const handleRemoveValue = (index) => {
    setForm(prev => ({ ...prev, values: prev.values.filter((_, i) => i !== index) }));
  };

  // Stat management
  const validateStat = (stat) => {
    const errors = {};
    if (!stat.label || !stat.label.trim()) {
      errors.label = 'Label is required';
    } else if (stat.label.length > 50) {
      errors.label = 'Label cannot exceed 50 characters';
    }
    if (!stat.value || !stat.value.trim()) {
      errors.value = 'Value is required';
    } else if (stat.value.length > 50) {
      errors.value = 'Value cannot exceed 50 characters';
    }
    if (!stat.detail || !stat.detail.trim()) {
      errors.detail = 'Detail is required';
    } else if (stat.detail.length < 5 || stat.detail.length > 100) {
      errors.detail = 'Detail must be 5-100 characters';
    }
    return errors;
  };

  const handleAddStat = () => {
    const errors = validateStat(newStat);
    if (Object.keys(errors).length > 0) {
      setValidationErrors({ newStat: errors });
      return;
    }
    setForm(prev => ({ ...prev, stats: [...prev.stats, newStat] }));
    setNewStat({ label: '', value: '', detail: '' });
    setValidationErrors({});
  };

  const handleRemoveStat = (index) => {
    setForm(prev => ({ ...prev, stats: prev.stats.filter((_, i) => i !== index) }));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">About Us Management</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your about us page content</p>
          </div>
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Edit About Us
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
          About Us updated successfully!
        </div>
      )}

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        ) : !data || Object.keys(data).length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No about us content found. Click "Edit About Us" to add content.
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content Preview</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Highlights</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Values</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">About Us Page</div>
                  <div className="text-xs text-gray-500">Main content</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs">
                    <p className="truncate mb-1"><span className="font-medium">Main:</span> {form.mainDescription || 'Not set'}</p>
                    <p className="truncate text-xs text-gray-600"><span className="font-medium">Rhythm:</span> {form.rhythmTitle || 'Not set'}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                    {form.highlights.length} items
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    {form.values.length} items
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                    {form.stats.length} items
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={handleEdit}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full my-8">
            <div className="p-6 border-b bg-white sticky top-0 z-10">
              <h2 className="text-xl font-semibold text-gray-800">Edit About Us Content</h2>
              <p className="text-sm text-gray-600 mt-1">Update all sections of your About Us page</p>
            </div>
            <form onSubmit={handleSubmit} className="max-h-[calc(90vh-8rem)] overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* Main Text Sections */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Main Text Content</h3>
                  
                  {/* Main Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Description *</label>
                    <textarea
                      name="mainDescription"
                      value={form.mainDescription}
                      onChange={handleChange}
                      required
                      rows="4"
                      placeholder="Main description of your restaurant (20-2000 characters)"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        validationErrors.mainDescription ? 'border-red-500' : ''
                      }`}
                    />
                    {validationErrors.mainDescription && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.mainDescription}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{form.mainDescription.length}/2000</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rhythm Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rhythm Title *</label>
                      <input
                        type="text"
                        name="rhythmTitle"
                        value={form.rhythmTitle}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Experience the Rhythm of Flavors"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          validationErrors.rhythmTitle ? 'border-red-500' : ''
                        }`}
                      />
                      {validationErrors.rhythmTitle && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.rhythmTitle}</p>
                      )}
                    </div>

                    {/* Rhythm Quote */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rhythm Quote *</label>
                      <input
                        type="text"
                        name="rhythmQuote"
                        value={form.rhythmQuote}
                        onChange={handleChange}
                        required
                        placeholder="A memorable quote (10-500 characters)"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                          validationErrors.rhythmQuote ? 'border-red-500' : ''
                        }`}
                      />
                      {validationErrors.rhythmQuote && (
                        <p className="mt-1 text-sm text-red-600">{validationErrors.rhythmQuote}</p>
                      )}
                    </div>
                  </div>

                  {/* Rhythm Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rhythm Description *</label>
                    <textarea
                      name="rhythmDescription"
                      value={form.rhythmDescription}
                      onChange={handleChange}
                      required
                      rows="3"
                      placeholder="Description for rhythm section (20-1000 characters)"
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                        validationErrors.rhythmDescription ? 'border-red-500' : ''
                      }`}
                    />
                    {validationErrors.rhythmDescription && (
                      <p className="mt-1 text-sm text-red-600">{validationErrors.rhythmDescription}</p>
                    )}
                  </div>
                </div>

                {/* Highlights Section */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Highlights * (Current: {form.highlights.length})</h3>
                  {validationErrors.highlights && (
                    <p className="text-sm text-red-600 mb-2">{validationErrors.highlights}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                    {form.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                        <span className="text-xl">{highlight.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{highlight.title}</p>
                          <p className="text-xs text-gray-600 truncate">{highlight.description}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveHighlight(index)}
                          className="text-red-600 hover:text-red-800 font-bold px-2"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 border-2 border-dashed border-blue-300 p-3 rounded bg-white">
                    <p className="text-sm font-medium text-gray-700 mb-2">Add New Highlight</p>
                    <input
                      type="text"
                      value={newHighlight.title}
                      onChange={e => setNewHighlight({ ...newHighlight, title: e.target.value })}
                      placeholder="Title (e.g., Best Chefs)"
                      className={`w-full px-3 py-2 border rounded ${validationErrors.newHighlight?.title ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.newHighlight?.title && (
                      <p className="text-xs text-red-600">{validationErrors.newHighlight.title}</p>
                    )}
                    <textarea
                      value={newHighlight.description}
                      onChange={e => setNewHighlight({ ...newHighlight, description: e.target.value })}
                      placeholder="Description"
                      rows="2"
                      className={`w-full px-3 py-2 border rounded ${validationErrors.newHighlight?.description ? 'border-red-500' : ''}`}
                    />
                    {validationErrors.newHighlight?.description && (
                      <p className="text-xs text-red-600">{validationErrors.newHighlight.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {["🍽️","🍕","🍔","🥗","🍜","🍛","🍣","🍰","☕","🥘","🎉","🏆","👨‍🍳","👩‍🍳","🌟","💡","❤️","😊","👍"].map((emoji) => (
                        <button
                          type="button"
                          key={emoji}
                          className={`text-xl px-2 py-1 rounded hover:bg-blue-100 ${newHighlight.icon === emoji ? 'bg-blue-200 border-2 border-blue-400' : 'border'}`}
                          onClick={() => setNewHighlight({ ...newHighlight, icon: emoji })}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    {validationErrors.newHighlight?.icon && (
                      <p className="text-xs text-red-600">{validationErrors.newHighlight.icon}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleAddHighlight}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                    >
                      + Add Highlight
                    </button>
                  </div>
                </div>

                {/* Values Section */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Core Values * (Current: {form.values.length})</h3>
                  {validationErrors.values && (
                    <p className="text-sm text-red-600 mb-2">{validationErrors.values}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.values.map((value, index) => (
                      <span key={index} className="flex items-center gap-1 px-3 py-1 bg-white border-2 border-green-200 rounded-full text-sm">
                        {typeof value === 'object' ? value.text : value}
                        <button
                          type="button"
                          onClick={() => handleRemoveValue(index)}
                          className="text-red-600 hover:text-red-800 ml-1 font-bold"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newValue}
                      onChange={e => setNewValue(e.target.value)}
                      placeholder="Add a core value (e.g., Quality, Integrity)"
                      className={`flex-1 px-3 py-2 border rounded ${validationErrors.newValue ? 'border-red-500' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={handleAddValue}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                    >
                      Add
                    </button>
                  </div>
                  {validationErrors.newValue && (
                    <p className="text-xs text-red-600 mt-1">{validationErrors.newValue}</p>
                  )}
                </div>

                {/* Statistics Section */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-3">Statistics * (Current: {form.stats.length})</h3>
                  {validationErrors.stats && (
                    <p className="text-sm text-red-600 mb-2">{validationErrors.stats}</p>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    {form.stats.map((stat, index) => (
                      <div key={index} className="p-2 bg-white rounded border-2 border-purple-200 text-center relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveStat(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs font-bold hover:bg-red-600"
                        >
                          ✕
                        </button>
                        <p className="text-lg font-bold text-purple-600">{stat.value}</p>
                        <p className="text-xs font-medium truncate">{stat.label}</p>
                        <p className="text-xs text-gray-600 truncate">{stat.detail}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 border-2 border-dashed border-purple-300 p-3 rounded bg-white">
                    <div>
                      <input
                        type="text"
                        value={newStat.label}
                        onChange={e => setNewStat({ ...newStat, label: e.target.value })}
                        placeholder="Label (e.g., Years)"
                        className={`w-full px-3 py-2 border rounded text-sm ${validationErrors.newStat?.label ? 'border-red-500' : ''}`}
                      />
                      {validationErrors.newStat?.label && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.newStat.label}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={newStat.value}
                        onChange={e => setNewStat({ ...newStat, value: e.target.value })}
                        placeholder="Value (e.g., 39+)"
                        className={`w-full px-3 py-2 border rounded text-sm ${validationErrors.newStat?.value ? 'border-red-500' : ''}`}
                      />
                      {validationErrors.newStat?.value && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.newStat.value}</p>
                      )}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={newStat.detail}
                        onChange={e => setNewStat({ ...newStat, detail: e.target.value })}
                        placeholder="Detail (e.g., Since 1985)"
                        className={`w-full px-3 py-2 border rounded text-sm ${validationErrors.newStat?.detail ? 'border-red-500' : ''}`}
                      />
                      {validationErrors.newStat?.detail && (
                        <p className="text-xs text-red-600 mt-1">{validationErrors.newStat.detail}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddStat}
                      className="md:col-span-3 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm font-medium"
                    >
                      + Add Statistic
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 sticky bottom-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {loading ? 'Saving...' : 'Save All Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutUsManagement;
