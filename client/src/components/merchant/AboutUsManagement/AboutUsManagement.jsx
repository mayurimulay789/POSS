import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAboutUs,
  fetchAllAboutUs,
  createAboutUs,
  updateAboutUs,
  deleteAboutUs,
  toggleAboutUsStatus
} from '../../../store/slices/aboutUsSlice';

const emptyForm = {
  mainDescription: '',
  rhythmTitle: '',
  rhythmDescription: '',
  rhythmQuote: '',
  highlights: [],
  values: [],
  stats: []
};

const AboutUsManagement = () => {
  const dispatch = useDispatch();
  const { data = [], loading, error } = useSelector(state => state.aboutUs);

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [newHighlight, setNewHighlight] = useState({ title: '', description: '', icon: '' });
  const [newValue, setNewValue] = useState('');
  const [newStat, setNewStat] = useState({ label: '', value: '', detail: '' });
  const [toast, setToast] = useState('');

  useEffect(() => {
    dispatch(fetchAllAboutUs());
  }, [dispatch]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditMode(false);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (entry) => {
    setForm({
      mainDescription: entry.mainDescription || '',
      rhythmTitle: entry.rhythmTitle || '',
      rhythmDescription: entry.rhythmDescription || '',
      rhythmQuote: entry.rhythmQuote || '',
      highlights: entry.highlights || [],
      values: entry.values || [],
      stats: entry.stats || []
    });
    setEditMode(true);
    setEditId(entry._id);
    setShowModal(true);
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await dispatch(toggleAboutUsStatus({ id, status: !currentStatus })).unwrap();
      setToast('Status updated');
      dispatch(fetchAllAboutUs());
      setTimeout(() => setToast(''), 1500);
    } catch {
      setToast('Failed to update status');
      setTimeout(() => setToast(''), 2000);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this About Us entry?')) return;
    try {
      await dispatch(deleteAboutUs(id)).unwrap();
      setToast('Deleted');
      dispatch(fetchAllAboutUs());
      setTimeout(() => setToast(''), 1500);
    } catch {
      setToast('Failed to delete');
      setTimeout(() => setToast(''), 2000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode && editId) {
        await dispatch(updateAboutUs({ id: editId, data: form })).unwrap();
        setToast('Updated');
      } else {
        await dispatch(createAboutUs(form)).unwrap();
        setToast('Created');
      }
      setShowModal(false);
      dispatch(fetchAllAboutUs());
      setTimeout(() => setToast(''), 1500);
    } catch {
      setToast('Failed to save');
      setTimeout(() => setToast(''), 2000);
    }
  };

  // Inline array helpers
  const addHighlight = () => {
    if (!newHighlight.title || !newHighlight.description || !newHighlight.icon) return;
    setForm(prev => ({ ...prev, highlights: [...prev.highlights, newHighlight] }));
    setNewHighlight({ title: '', description: '', icon: '' });
  };
  const removeHighlight = (i) => {
    setForm(prev => ({ ...prev, highlights: prev.highlights.filter((_, idx) => idx !== i) }));
  };
  const addValue = () => {
    if (!newValue.trim()) return;
    setForm(prev => ({ ...prev, values: [...prev.values, { text: newValue }] }));
    setNewValue('');
  };
  const removeValue = (i) => {
    setForm(prev => ({ ...prev, values: prev.values.filter((_, idx) => idx !== i) }));
  };
  const addStat = () => {
    if (!newStat.label || !newStat.value || !newStat.detail) return;
    setForm(prev => ({ ...prev, stats: [...prev.stats, newStat] }));
    setNewStat({ label: '', value: '', detail: '' });
  };
  const removeStat = (i) => {
    setForm(prev => ({ ...prev, stats: prev.stats.filter((_, idx) => idx !== i) }));
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">About Us Management</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Create New About Us
        </button>
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-6 py-3 rounded shadow-lg">
          {toast}
        </div>
      )}
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Main Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rhythm Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length ? data.map(entry => (
              <tr key={entry._id} className="hover:bg-gray-50 border-b">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {entry.mainDescription ? `${entry.mainDescription.slice(0, 80)}...` : ''}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{entry.rhythmTitle}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleToggle(entry._id, entry.isActive)}
                    className={`px-3 py-1 rounded text-xs font-medium ${entry.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                  >
                    {entry.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={() => openEdit(entry)} className="text-blue-600 hover:text-blue-900 font-medium">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(entry._id)} className="text-red-600 hover:text-red-900 font-medium">
                    Delete
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No About Us entries. Click “Create New About Us”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-semibold">{editMode ? 'Edit About Us' : 'Create About Us'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Main Description *</label>
                <textarea
                  name="mainDescription"
                  value={form.mainDescription}
                  onChange={onChange}
                  required
                  rows="4"
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Main description..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Rhythm Title *</label>
                  <input
                    type="text"
                    name="rhythmTitle"
                    value={form.rhythmTitle}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rhythm Quote *</label>
                  <input
                    type="text"
                    name="rhythmQuote"
                    value={form.rhythmQuote}
                    onChange={onChange}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Rhythm Description *</label>
                <textarea
                  name="rhythmDescription"
                  value={form.rhythmDescription}
                  onChange={onChange}
                  required
                  rows="3"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Highlights */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Highlights ({form.highlights.length})</h3>
                <div className="space-y-2 mb-3">
                  {form.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white p-2 rounded">
                      <span className="text-xl">{h.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{h.title}</p>
                        <p className="text-xs text-gray-600">{h.description}</p>
                      </div>
                      <button type="button" onClick={() => removeHighlight(i)} className="text-red-600">✕</button>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 bg-white p-3 rounded">
                  <input
                    type="text"
                    value={newHighlight.title}
                    onChange={e => setNewHighlight({ ...newHighlight, title: e.target.value })}
                    placeholder="Title"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <textarea
                    value={newHighlight.description}
                    onChange={e => setNewHighlight({ ...newHighlight, description: e.target.value })}
                    placeholder="Description"
                    rows="2"
                    className="w-full px-3 py-2 border rounded"
                  />
                  <div className="flex gap-1 flex-wrap">
                    {['🍽️','🍕','🍔','🥗','🍜','🍛','🍣','🍰','☕','🥘'].map(emoji => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setNewHighlight({ ...newHighlight, icon: emoji })}
                        className={`text-xl px-2 py-1 rounded border ${newHighlight.icon === emoji ? 'bg-blue-200' : ''}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={addHighlight} className="w-full px-3 py-2 bg-blue-600 text-white rounded">
                    + Add Highlight
                  </button>
                </div>
              </div>

              {/* Values */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Values ({form.values.length})</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.values.map((v, i) => (
                    <span key={i} className="flex items-center gap-2 px-3 py-1 bg-white rounded-full">
                      {typeof v === 'object' ? v.text : v}
                      <button type="button" onClick={() => removeValue(i)} className="text-red-600 font-bold">✕</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    placeholder="Add a value"
                    className="flex-1 px-3 py-2 border rounded"
                  />
                  <button type="button" onClick={addValue} className="px-4 py-2 bg-green-600 text-white rounded">
                    Add
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Statistics ({form.stats.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                  {form.stats.map((s, i) => (
                    <div key={i} className="p-3 bg-white rounded text-center relative">
                      <button type="button" onClick={() => removeStat(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs">✕</button>
                      <p className="text-lg font-bold text-purple-600">{s.value}</p>
                      <p className="text-xs font-medium">{s.label}</p>
                      <p className="text-xs text-gray-600">{s.detail}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded">
                  <input
                    type="text"
                    value={newStat.label}
                    onChange={e => setNewStat({ ...newStat, label: e.target.value })}
                    placeholder="Label"
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    value={newStat.value}
                    onChange={e => setNewStat({ ...newStat, value: e.target.value })}
                    placeholder="Value"
                    className="px-3 py-2 border rounded"
                  />
                  <input
                    type="text"
                    value={newStat.detail}
                    onChange={e => setNewStat({ ...newStat, detail: e.target.value })}
                    placeholder="Detail"
                    className="px-3 py-2 border rounded"
                  />
                </div>
                <button type="button" onClick={addStat} className="w-full mt-2 px-3 py-2 bg-purple-600 text-white rounded">
                  + Add Statistic
                </button>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg">
                  {loading ? 'Saving...' : (editMode ? 'Update' : 'Create')}
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