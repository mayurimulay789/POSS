import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  getAllCharges,
  getSystemCharges,
  getOptionalCharges,
  getSystemChargesSummary,
  createCharge,
  getChargeById,
  updateCharge,
  deleteCharge,
  toggleChargeStatus,
  clearError,
  clearSuccess,
  setFilters,
  clearFilters
} from '../store/slices/chargeSlice';
import { selectCurrentUser } from '../store/slices/authSlice';
import { CheckCircle, AlertCircle } from 'lucide-react';

// Import components
import ChargeStats from '../components/charge/ChargeStats.jsx';
import ChargeHeader from '../components/charge/ChargeHeader.jsx';
import ChargeTable from '../components/charge/ChargeTable.jsx';
import {
  CreateChargeModal,
  EditChargeModal,
  DeleteChargeModal,
  StatusToggleModal,
  ChargeDetailsModal
} from '../components/charge/ChargeModals.jsx';

const ChargeManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const {
    charges,
    systemCharges,
    optionalCharges,
    systemChargesSummary,
    currentCharge,
    loading,
    error,
    success,
    filters
  } = useSelector((state) => state.charges);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState(null);
  const [statusToSet, setStatusToSet] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [expandedRows, setExpandedRows] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    chargeName: '',
    chargeType: 'percentage',
    value: 0,
    category: 'optionalcharge',
    active: true
  });

  // Check user permissions
  const canManageCharges = user?.role === 'merchant' || user?.role === 'manager';
  const canExport = user?.role === 'merchant' || user?.role === 'manager';

  // Load charges based on active tab
  useEffect(() => {
    const loadCharges = () => {
      if (!canManageCharges) {
        // Regular users can only view active charges
        dispatch(getSystemCharges());
        dispatch(getOptionalCharges());
      } else {
        // Admin/Manager can view all charges with filters
        dispatch(getAllCharges(filters));
      }
    };

    loadCharges();
  }, [activeTab, filters, canManageCharges, dispatch]);

  // Load system charges summary
  useEffect(() => {
    dispatch(getSystemChargesSummary());
  }, [dispatch]);

  // Clear error/success messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccess());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, dispatch]);

  // Handle form submissions
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.chargeName || formData.value === undefined) {
      alert('Charge name and value are required');
      return;
    }

    if (formData.chargeType === 'percentage' && (formData.value < 0 || formData.value > 100)) {
      alert('Percentage value must be between 0 and 100');
      return;
    }

    if (formData.chargeType === 'fixed' && formData.value < 0) {
      alert('Fixed value cannot be negative');
      return;
    }

    const result = await dispatch(createCharge(formData));
    
    if (!result.error) {
      setShowCreateModal(false);
      setFormData({
        chargeName: '',
        chargeType: 'percentage',
        value: 0,
        category: 'optionalcharge',
        active: true
      });
      // Refresh summary after creating a charge
      dispatch(getSystemChargesSummary());
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCharge) return;
    
    const result = await dispatch(updateCharge({
      id: selectedCharge._id,
      chargeData: formData
    }));
    
    if (!result.error) {
      setShowEditModal(false);
      setSelectedCharge(null);
      // Refresh summary after updating a charge
      dispatch(getSystemChargesSummary());
    }
  };

  const handleDelete = async () => {
    if (!selectedCharge) return;
    
    const result = await dispatch(deleteCharge(selectedCharge._id));
    if (!result.error) {
      setShowDeleteModal(false);
      setSelectedCharge(null);
      // Refresh summary after deleting a charge
      dispatch(getSystemChargesSummary());
    }
  };

  const handleToggleStatus = async () => {
    if (!selectedCharge || statusToSet === null) return;
    
    const result = await dispatch(toggleChargeStatus({
      id: selectedCharge._id,
      active: statusToSet
    }));
    
    if (!result.error) {
      setShowStatusModal(false);
      setSelectedCharge(null);
      setStatusToSet(null);
      // Refresh summary after toggling status
      dispatch(getSystemChargesSummary());
    }
  };

  const handleEditClick = (charge) => {
    setSelectedCharge(charge);
    setFormData({
      chargeName: charge.chargeName,
      chargeType: charge.chargeType,
      value: charge.value,
      category: charge.category,
      active: charge.active
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (charge) => {
    setSelectedCharge(charge);
    setShowDeleteModal(true);
  };

  const handleStatusClick = (charge, newStatus) => {
    setSelectedCharge(charge);
    setStatusToSet(newStatus);
    setShowStatusModal(true);
  };

  const handleDetailsClick = async (charge) => {
    try {
      if (canManageCharges) {
        const result = await dispatch(getChargeById(charge._id));
        if (!result.error) {
          setSelectedCharge(result.payload.data);
          setShowDetailsModal(true);
        }
      } else {
        setSelectedCharge(charge);
        setShowDetailsModal(true);
      }
    } catch (error) {
      console.error('Error fetching charge details:', error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm, page: 1 }));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    dispatch(clearFilters());
  };

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value || '', page: 1 }));
  };

  const toggleRowExpand = (chargeId) => {
    setExpandedRows(prev => ({
      ...prev,
      [chargeId]: !prev[chargeId]
    }));
  };

  // Utility functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get current charges based on active tab
  const getCurrentCharges = () => {
    if (!canManageCharges) {
      // Regular users see different tabs
      switch (activeTab) {
        case 'system':
          return systemCharges;
        case 'optional':
          return optionalCharges;
        default:
          return [...systemCharges, ...optionalCharges];
      }
    } else {
      // Admin/Manager see filtered charges
      let filteredCharges = charges;
      
      // Apply tab filter
      if (activeTab === 'system') {
        filteredCharges = charges.filter(c => c.category === 'systemcharge');
      } else if (activeTab === 'optional') {
        filteredCharges = charges.filter(c => c.category === 'optionalcharge');
      }
      
      return filteredCharges;
    }
  };

  const currentCharges = getCurrentCharges();

  // Get counts for stats
  const chargeCounts = {
    system: canManageCharges 
      ? charges.filter(c => c.category === 'systemcharge').length
      : systemCharges.length,
    optional: canManageCharges
      ? charges.filter(c => c.category === 'optionalcharge').length
      : optionalCharges.length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Charge Management</h1>
          <p className="text-gray-600">
            {canManageCharges 
              ? 'Manage system and optional charges for billing'
              : 'View available charges for billing'}
          </p>
        </div>

        {/* Stats Cards - Only show for managers/admins */}
        {canManageCharges && (
          <ChargeStats 
            summary={systemChargesSummary} 
            counts={chargeCounts} 
          />
        )}

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow mb-6">
          {/* Header with Tabs and Toolbar */}
          <ChargeHeader
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            onSearchSubmit={handleSearchSubmit}
            onClearFilters={handleClearFilters}
            onCreateCharge={() => setShowCreateModal(true)}
            onExport={() => console.log('Export charges')}
            canExport={canExport}
            filters={filters}
            onFilterChange={handleFilterChange}
          />

          {/* Error/Success Messages */}
          {error && (
            <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="m-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {/* Charges Table */}
          <ChargeTable
            charges={currentCharges}
            loading={loading}
            user={user}
            canManageCharges={canManageCharges}
            formatDate={formatDate}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
            onToggleStatus={handleStatusClick}
            onDetailsClick={handleDetailsClick}
            expandedRows={expandedRows}
            onToggleExpand={toggleRowExpand}
          />
        </div>
      </div>

      {/* Modals */}
      {canManageCharges && (
        <>
          <CreateChargeModal
            show={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            formData={formData}
            onChange={setFormData}
            onSubmit={handleCreateSubmit}
            loading={loading}
          />

          <EditChargeModal
            show={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedCharge(null);
            }}
            formData={formData}
            onChange={setFormData}
            onSubmit={handleEditSubmit}
            loading={loading}
            selectedCharge={selectedCharge}
          />

          <DeleteChargeModal
            show={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedCharge(null);
            }}
            selectedCharge={selectedCharge}
            onSubmit={handleDelete}
            loading={loading}
          />

          <StatusToggleModal
            show={showStatusModal}
            onClose={() => {
              setShowStatusModal(false);
              setSelectedCharge(null);
              setStatusToSet(null);
            }}
            selectedCharge={selectedCharge}
            newStatus={statusToSet}
            onSubmit={handleToggleStatus}
            loading={loading}
          />
        </>
      )}

      <ChargeDetailsModal
        show={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedCharge(null);
        }}
        selectedCharge={selectedCharge}
        onEditClick={canManageCharges ? handleEditClick : null}
        formatDate={formatDate}
      />
    </div>
  );
};

export default ChargeManagement;