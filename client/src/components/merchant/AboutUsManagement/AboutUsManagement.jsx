import React, { useState, useEffect } from 'react';
// Simple Accordion Section component
const AccordionSection = ({ title, helper, open, onToggle, children }) => (
  <div className="mb-4 border rounded-lg bg-white shadow">
    <button
      type="button"
      className="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none focus:ring font-semibold text-lg"
      onClick={onToggle}
    >
      <span>{title}</span>
      <span className="ml-2 text-gray-400">{open ? '▲' : '▼'}</span>
    </button>
    {open && (
      <div className="px-6 pb-6 pt-2 border-t">
        {helper && <div className="text-sm text-gray-500 mb-2">{helper}</div>}
        {children}
      </div>
    )}
  </div>
);
import { useDispatch, useSelector } from 'react-redux';
import { fetchAboutUs, updateAboutUs, clearSuccess, clearError, setAboutUsField } from '../../../store/slices/aboutUsSlice';

const AboutUsManagement = () => {
  const dispatch = useDispatch();

  const aboutUs = useSelector(state => state.aboutUs);
  const { data, loading, error, success } = aboutUs;
  const mainDescription = data?.mainDescription || '';
  const rhythmTitle = data?.rhythmTitle || '';
  const rhythmDescription = data?.rhythmDescription || '';
  const rhythmQuote = data?.rhythmQuote || '';
  const highlights = data?.highlights || [];
  const values = data?.values || [];
  const stats = data?.stats || [];

  // Accordion open state for each section (MUST be before any conditional return)
  const [openSection, setOpenSection] = useState('main');

  // Local state only for new highlight/value/stat being added
  const [newHighlight, setNewHighlight] = useState({ title: '', description: '', icon: '' });
  const [newValue, setNewValue] = useState('');
  const [newStat, setNewStat] = useState({ label: '', value: '', detail: '' });

  // Validation states
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    dispatch(fetchAboutUs());
  }, [dispatch]);

  // No need to sync local state with Redux for form fields anymore

  // Validation functions
  const validateHighlight = (highlight) => {
    const errors = {};
    if (!highlight.title || !highlight.title.trim()) {
      errors.title = 'Highlight title is required';
    } else if (highlight.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    } else if (highlight.title.length > 100) {
      errors.title = 'Title cannot exceed 100 characters';
    }

    if (!highlight.description || !highlight.description.trim()) {
      errors.description = 'Description is required';
    } else if (highlight.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    } else if (highlight.description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
    }

    if (!highlight.icon || !highlight.icon.trim()) {
      errors.icon = 'Icon/emoji is required';
    }

    return errors;
  };

  const validateValue = (value) => {
    if (!value || !value.trim()) {
      return 'Value text is required';
    }
    if (value.length < 5) {
      return 'Value must be at least 5 characters';
    }
    if (value.length > 300) {
      return 'Value cannot exceed 300 characters';
    }
    return '';
  };

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
    } else if (stat.detail.length < 5) {
      errors.detail = 'Detail must be at least 5 characters';
    } else if (stat.detail.length > 100) {
      errors.detail = 'Detail cannot exceed 100 characters';
    }

    return errors;
  };

  const validateMainFields = () => {
    const errors = {};

    if (!mainDescription || !mainDescription.trim()) {
      errors.mainDescription = 'Main description is required';
    } else if (mainDescription.length < 20) {
      errors.mainDescription = 'Main description must be at least 20 characters';
    } else if (mainDescription.length > 2000) {
      errors.mainDescription = 'Main description cannot exceed 2000 characters';
    }

    if (!rhythmTitle || !rhythmTitle.trim()) {
      errors.rhythmTitle = 'Rhythm title is required';
    } else if (rhythmTitle.length < 5) {
      errors.rhythmTitle = 'Rhythm title must be at least 5 characters';
    } else if (rhythmTitle.length > 200) {
      errors.rhythmTitle = 'Rhythm title cannot exceed 200 characters';
    }

    if (!rhythmDescription || !rhythmDescription.trim()) {
      errors.rhythmDescription = 'Rhythm description is required';
    } else if (rhythmDescription.length < 20) {
      errors.rhythmDescription = 'Rhythm description must be at least 20 characters';
    } else if (rhythmDescription.length > 1000) {
      errors.rhythmDescription = 'Rhythm description cannot exceed 1000 characters';
    }

    if (!rhythmQuote || !rhythmQuote.trim()) {
      errors.rhythmQuote = 'Rhythm quote is required';
    } else if (rhythmQuote.length < 10) {
      errors.rhythmQuote = 'Rhythm quote must be at least 10 characters';
    } else if (rhythmQuote.length > 500) {
      errors.rhythmQuote = 'Rhythm quote cannot exceed 500 characters';
    }

    if (highlights.length === 0) {
      errors.highlights = 'At least one highlight is required';
    }

    if (values.length === 0) {
      errors.values = 'At least one value is required';
    }

    if (stats.length === 0) {
      errors.stats = 'At least one statistic is required';
    }

    return errors;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const handleAddHighlight = () => {
    const errors = validateHighlight(newHighlight);
    if (Object.keys(errors).length > 0) {
      setValidationErrors({ newHighlight: errors });
      return;
    }
    setHighlights([...highlights, newHighlight]);
    setNewHighlight({ title: '', description: '', icon: '' });
    setValidationErrors({});
  };

  const handleRemoveHighlight = (index) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleAddValue = () => {
    const error = validateValue(newValue);
    if (error) {
      setValidationErrors({ newValue: error });
      return;
    }
    const newArr = [...values, { text: newValue }];
    dispatch(setAboutUsField({ field: 'values', value: newArr }));
    setNewValue('');
    setValidationErrors({});
  };

  const handleRemoveValue = (index) => {
    const newArr = values.filter((_, i) => i !== index);
    dispatch(setAboutUsField({ field: 'values', value: newArr }));
  };

  const handleAddStat = () => {
    const errors = validateStat(newStat);
    if (Object.keys(errors).length > 0) {
      setValidationErrors({ newStat: errors });
      return;
    }
    const newArr = [...stats, newStat];
    dispatch(setAboutUsField({ field: 'stats', value: newArr }));
    setNewStat({ label: '', value: '', detail: '' });
    setValidationErrors({});
  };

  const handleRemoveStat = (index) => {
    const newArr = stats.filter((_, i) => i !== index);
    dispatch(setAboutUsField({ field: 'stats', value: newArr }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateMainFields();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    const payload = {
      mainDescription,
      rhythmTitle,
      rhythmDescription,
      rhythmQuote,
      highlights,
      values,
      stats
    };
    
    setValidationErrors({});
    dispatch(updateAboutUs(payload));
    setTimeout(() => dispatch(clearSuccess('aboutUs')), 3000);
  };

  // ...existing code...

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Removed 'SINCE 2026' badge as requested */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">About Us Management</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button onClick={() => dispatch(clearError('aboutUs'))} className="ml-2 underline">
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          About Us updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <AccordionSection
          title="Main Description"
          helper="This is the main text shown on your About Us page."
          open={openSection === 'main'}
          onToggle={() => setOpenSection(openSection === 'main' ? '' : 'main')}
        >
          <textarea
            value={mainDescription}
            onChange={e => dispatch(setAboutUsField({ field: 'mainDescription', value: e.target.value }))}
            rows="4"
            className={`w-full px-3 py-2 border rounded-lg ${validationErrors.mainDescription ? 'border-red-500' : ''}`}
            placeholder="Main description... (20-2000 characters)"
          />
          {validationErrors.mainDescription && (
            <p className="text-red-600 text-sm mt-1">{validationErrors.mainDescription}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">{mainDescription.length}/2000 characters</p>
        </AccordionSection>

        <AccordionSection
          title={`Highlights (${highlights.length})`}
          helper="Add fun highlights with emoji. These will be shown as features on your About Us page."
          open={openSection === 'highlights'}
          onToggle={() => setOpenSection(openSection === 'highlights' ? '' : 'highlights')}
        >
          {validationErrors.highlights && (
            <p className="text-red-600 text-sm mb-3">{validationErrors.highlights}</p>
          )}
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex items-center bg-gray-50 p-3 rounded border border-gray-200 gap-3">
                <span className="text-2xl mr-2">{highlight.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{highlight.title}</div>
                  <div className="text-sm text-gray-600 truncate">{highlight.description}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newArr = highlights.filter((_, i) => i !== index);
                    dispatch(setAboutUsField({ field: 'highlights', value: newArr }));
                  }}
                  className="ml-2 text-red-600 hover:text-red-800 font-bold text-lg px-2"
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={newHighlight.title}
                onChange={e => setNewHighlight({ ...newHighlight, title: e.target.value })}
                placeholder="e.g. Best Chefs, Family Vibes..."
                className={`w-full px-3 py-2 border rounded-lg ${validationErrors.newHighlight?.title ? 'border-red-500' : ''}`}
              />
              {validationErrors.newHighlight?.title && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.newHighlight.title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={newHighlight.description}
                onChange={e => setNewHighlight({ ...newHighlight, description: e.target.value })}
                placeholder="Short description for this highlight..."
                rows="2"
                className={`w-full px-3 py-2 border rounded-lg ${validationErrors.newHighlight?.description ? 'border-red-500' : ''}`}
              />
              {validationErrors.newHighlight?.description && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.newHighlight.description}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pick an Emoji</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {["🍽️","🍕","🍔","🥗","🍜","🍛","🍣","🍰","☕","🥘","🎉","🏆","👨‍🍳","👩‍🍳","🌟","💡","❤️","😊","👍"].map((emoji) => (
                  <button
                    type="button"
                    key={emoji}
                    className={`text-2xl px-2 py-1 rounded hover:bg-blue-100 ${newHighlight.icon === emoji ? 'bg-blue-200 border border-blue-400' : ''}`}
                    onClick={() => setNewHighlight({ ...newHighlight, icon: emoji })}
                    aria-label={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={newHighlight.icon}
                onChange={e => setNewHighlight({ ...newHighlight, icon: e.target.value })}
                placeholder="Or paste your own emoji..."
                className={`w-full px-3 py-2 border rounded-lg ${validationErrors.newHighlight?.icon ? 'border-red-500' : ''}`}
              />
              {validationErrors.newHighlight?.icon && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.newHighlight.icon}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                const errors = validateHighlight(newHighlight);
                if (Object.keys(errors).length > 0) {
                  setValidationErrors({ newHighlight: errors });
                  return;
                }
                const newArr = [...highlights, newHighlight];
                dispatch(setAboutUsField({ field: 'highlights', value: newArr }));
                setNewHighlight({ title: '', description: '', icon: '' });
                setValidationErrors({});
              }}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 mt-2"
            >
              Add Highlight
            </button>
          </div>
        </AccordionSection>

        <AccordionSection
          title={`Values (${values.length})`}
          helper="Add your core values. These will be shown as a list."
          open={openSection === 'values'}
          onToggle={() => setOpenSection(openSection === 'values' ? '' : 'values')}
        >
          {validationErrors.values && (
            <p className="text-red-600 text-sm mb-3">{validationErrors.values}</p>
          )}
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {values.map((value, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded">
                <span>{typeof value === 'object' ? value.text : value}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveValue(index)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t pt-4">
            <input
              type="text"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Add new value (5-300 characters)..."
              className={`flex-1 px-3 py-2 border rounded-lg ${validationErrors.newValue ? 'border-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={handleAddValue}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          {validationErrors.newValue && (
            <p className="text-red-600 text-xs mt-1">{validationErrors.newValue}</p>
          )}
        </AccordionSection>

        <AccordionSection
          title={`Statistics (${stats.length})`}
          helper="Add some fun stats about your business."
          open={openSection === 'stats'}
          onToggle={() => setOpenSection(openSection === 'stats' ? '' : 'stats')}
        >
          {validationErrors.stats && (
            <p className="text-red-600 text-sm mb-3">{validationErrors.stats}</p>
          )}
          <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
            {stats.map((stat, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-100 p-3 rounded">
                <div>
                  <p className="font-semibold">{stat.label}</p>
                  <p className="text-sm text-gray-600">{stat.value} - {stat.detail}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveStat(index)}
                  className="text-red-600 hover:text-red-800 font-semibold"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t pt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Label</label>
              <input
                type="text"
                value={newStat.label}
                onChange={(e) => setNewStat({ ...newStat, label: e.target.value })}
                placeholder="e.g., Years perfecting"
                className={`w-full px-3 py-2 border rounded-lg ${validationErrors.newStat?.label ? 'border-red-500' : ''}`}
              />
              {validationErrors.newStat?.label && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.newStat.label}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <input
                type="text"
                value={newStat.value}
                onChange={(e) => setNewStat({ ...newStat, value: e.target.value })}
                placeholder="e.g., 39+"
                className={`w-full px-3 py-2 border rounded-lg ${validationErrors.newStat?.value ? 'border-red-500' : ''}`}
              />
              {validationErrors.newStat?.value && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.newStat.value}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Detail</label>
              <input
                type="text"
                value={newStat.detail}
                onChange={(e) => setNewStat({ ...newStat, detail: e.target.value })}
                placeholder="e.g., Crafted since 1985"
                className={`w-full px-3 py-2 border rounded-lg ${validationErrors.newStat?.detail ? 'border-red-500' : ''}`}
              />
              {validationErrors.newStat?.detail && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.newStat.detail}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleAddStat}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Add Statistic
            </button>
          </div>
        </AccordionSection>

        <AccordionSection
          title="Rhythm Section"
          helper="Describe the unique rhythm or vibe of your place."
          open={openSection === 'rhythm'}
          onToggle={() => setOpenSection(openSection === 'rhythm' ? '' : 'rhythm')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                value={rhythmTitle}
                onChange={e => dispatch(setAboutUsField({ field: 'rhythmTitle', value: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg ${validationErrors.rhythmTitle ? 'border-red-500' : ''}`}
                placeholder="e.g., Paced for real conversations"
              />
              {validationErrors.rhythmTitle && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.rhythmTitle}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">{rhythmTitle.length}/200 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={rhythmDescription}
                onChange={e => dispatch(setAboutUsField({ field: 'rhythmDescription', value: e.target.value }))}
                rows="3"
                className={`w-full px-3 py-2 border rounded-lg ${validationErrors.rhythmDescription ? 'border-red-500' : ''}`}
                placeholder="Describe the rhythm section... (20-1000 characters)"
              />
              {validationErrors.rhythmDescription && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.rhythmDescription}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">{rhythmDescription.length}/1000 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Quote</label>
              <textarea
                value={rhythmQuote}
                onChange={e => dispatch(setAboutUsField({ field: 'rhythmQuote', value: e.target.value }))}
                rows="2"
                className={`w-full px-3 py-2 border rounded-lg ${validationErrors.rhythmQuote ? 'border-red-500' : ''}`}
                placeholder="e.g., 'We cook and host the way family does at home...'"
              />
              {validationErrors.rhythmQuote && (
                <p className="text-red-600 text-xs mt-1">{validationErrors.rhythmQuote}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">{rhythmQuote.length}/500 characters</p>
            </div>
          </div>
        </AccordionSection>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50 transition mt-6"
        >
          {loading ? 'Saving...' : 'Save About Us Content'}
        </button>
      </form>
    </div>
  );
};

export default AboutUsManagement;
