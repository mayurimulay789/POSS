import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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

// Using react-icons instead of lucide-react (much smaller bundle)
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

// Lazy load heavy components only
const ChargeStats = lazy(() => import('../components/charge/ChargeStats.jsx'));
const ChargeHeader = lazy(() => import('../components/charge/ChargeHeader.jsx'));
const ChargeTable = lazy(() => import('../components/charge/ChargeTable.jsx'));

// Import modal components (not lazy loaded since they're used conditionally)
import {
  CreateChargeModal,
  EditChargeModal,
  DeleteChargeModal,
  StatusToggleModal,
  ChargeDetailsModal
} from '../components/charge/ChargeModals.jsx';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const ChargeManagement = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  
  const {
    charges,
    systemCharges,
    optionalCharges,
    systemChargesSummary,
    loading,
    error,
    success,
    filters
  } = useSelector((state) => state.charges);

  // State declarations
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

  // Memoized values for performance
  const canManageCharges = useMemo(() => 
    user?.role === 'merchant' || user?.role === 'manager',
    [user?.role]
  );

  const canExport = useMemo(() => 
    user?.role === 'merchant' || user?.role === 'manager',
    [user?.role]
  );

  // Memoized charge calculations
  const chargeCounts = useMemo(() => ({
    system: canManageCharges 
      ? charges.filter(c => c.category === 'systemcharge').length
      : systemCharges.length,
    optional: canManageCharges
      ? charges.filter(c => c.category === 'optionalcharge').length
      : optionalCharges.length
  }), [canManageCharges, charges, systemCharges, optionalCharges]);

  // Debounced search to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        dispatch(setFilters({ search: searchTerm, page: 1 }));
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm, dispatch, filters.search]);

  // Load charges based on active tab with cleanup
  useEffect(() => {
    const controller = new AbortController();
    
    const loadCharges = async () => {
      try {
        if (!canManageCharges) {
          // Regular users can only view active charges
          dispatch(getSystemCharges({ signal: controller.signal }));
          dispatch(getOptionalCharges({ signal: controller.signal }));
        } else {
          // Admin/Manager can view all charges with filters
          dispatch(getAllCharges({ ...filters, signal: controller.signal }));
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error loading charges:', error);
        }
      }
    };

    loadCharges();

    return () => {
      controller.abort(); // Cancel pending requests on unmount
    };
  }, [activeTab, filters, canManageCharges, dispatch]);

  // Load system charges summary only once or when charges change
  useEffect(() => {
    const controller = new AbortController();
    
    dispatch(getSystemChargesSummary({ signal: controller.signal }));
    
    return () => {
      controller.abort();
    };
  }, [dispatch, charges.length]); // Only reload when charges count changes

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

  // Memoized event handlers
  const handleCreateSubmit = useCallback(async (e) => {
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
  }, [formData, dispatch]);

  const handleEditSubmit = useCallback(async (e) => {
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
  }, [selectedCharge, formData, dispatch]);

  const handleDelete = useCallback(async () => {
    if (!selectedCharge) return;
    
    const result = await dispatch(deleteCharge(selectedCharge._id));
    if (!result.error) {
      setShowDeleteModal(false);
      setSelectedCharge(null);
      // Refresh summary after deleting a charge
      dispatch(getSystemChargesSummary());
    }
  }, [selectedCharge, dispatch]);

  const handleToggleStatus = useCallback(async () => {
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
  }, [selectedCharge, statusToSet, dispatch]);

  const handleEditClick = useCallback((charge) => {
    setSelectedCharge(charge);
    setFormData({
      chargeName: charge.chargeName,
      chargeType: charge.chargeType,
      value: charge.value,
      category: charge.category,
      active: charge.active
    });
    setShowEditModal(true);
  }, []);

  const handleDeleteClick = useCallback((charge) => {
    setSelectedCharge(charge);
    setShowDeleteModal(true);
  }, []);

  const handleStatusClick = useCallback((charge, newStatus) => {
    setSelectedCharge(charge);
    setStatusToSet(newStatus);
    setShowStatusModal(true);
  }, []);

  const handleDetailsClick = useCallback(async (charge) => {
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
  }, [canManageCharges, dispatch]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    dispatch(clearFilters());
  }, [dispatch]);

  const handleFilterChange = useCallback((field, value) => {
    dispatch(setFilters({ [field]: value || '', page: 1 }));
  }, [dispatch]);

  const toggleRowExpand = useCallback((chargeId) => {
    setExpandedRows(prev => ({
      ...prev,
      [chargeId]: !prev[chargeId]
    }));
  }, []);

  // Memoized utility function
  const formatDate = useCallback((dateString) => {
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
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  }, []);

  // Memoized current charges calculation
  const currentCharges = useMemo(() => {
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
  }, [canManageCharges, activeTab, systemCharges, optionalCharges, charges]);



  return (
    <main role="main">
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-gray-800 ">Charges Management</h1>
          </div>

          {/* Stats Cards - Only show for managers/admins */}
          {canManageCharges && (
            <Suspense fallback={<LoadingFallback />}>
              <ChargeStats 
                summary={systemChargesSummary} 
                counts={chargeCounts} 
              />
            </Suspense>
          )}

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow mb-6">
            {/* Header with Tabs and Toolbar */}
            <Suspense fallback={<LoadingFallback />}>
              <ChargeHeader
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchTerm={searchTerm}
                onSearchChange={(e) => setSearchTerm(e.target.value)}
                onClearFilters={handleClearFilters}
                onCreateCharge={() => setShowCreateModal(true)}
                onExport={() => console.log('Export charges')}
                canExport={canExport}
                filters={filters}
                onFilterChange={handleFilterChange}
              />
            </Suspense>

            {/* Error/Success Messages */}
            {error && (
              <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <FaExclamationCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="m-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <FaCheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-green-700">{success}</p>
              </div>
            )}

            {/* Charges Table */}
            <Suspense fallback={<LoadingFallback />}>
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
            </Suspense>
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
    </main>
  );
};

export default React.memo(ChargeManagement);