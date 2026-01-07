import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  startShift,
  endShift,
  getCurrentShift,
  getMyAttendance,
  clearError,
  clearSuccess,
  setFilters,
  clearFilters
} from '../store/slices/attendanceSlice';
import { selectCurrentUser } from '../store/slices/authSlice';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  History,
  Play,
  StopCircle,
  RefreshCw
} from 'lucide-react';

// Import components
import AttendanceStats from '../components/attendance/AttendanceStats';
import AttendanceHistory from '../components/attendance/AttendanceHistory';
import AttendanceCameraModal from '../components/attendance/AttendanceCameraModal';

const AttendanceManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const {
    currentShift,
    attendanceHistory,
    loading,
    error,
    success,
    pagination,
    stats,
    filters
  } = useSelector((state) => state.attendance);

  const [showCameraModal, setShowCameraModal] = useState(false);
  const [isStartingShift, setIsStartingShift] = useState(false);
  const [selfieImage, setSelfieImage] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [shiftDuration, setShiftDuration] = useState('00:00:00');
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load current shift and attendance history on component mount
  useEffect(() => {
    dispatch(getCurrentShift());
    dispatch(getMyAttendance(filters));
  }, [dispatch]);

   const updateShiftDuration = () => {
    if (!currentShift?.startTime) return;
    
    const startTime = new Date(currentShift.startTime);
    const now = new Date();
    const diffMs = now - startTime;
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
    
    const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    setShiftDuration(formatted);
  };

  // Update shift duration timer if there's an active shift
  useEffect(() => {
    let interval;
    
    if (currentShift && currentShift.startTime) {
      // Update every second (includes initial calculation)
      interval = setInterval(updateShiftDuration, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentShift]);


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

 

  const handleStartShiftClick = () => {
    setIsStartingShift(true);
    setShowCameraModal(true);
  };

  const handleEndShiftClick = () => {
    setShowEndConfirmation(true);
  };

  const handleConfirmEndShift = () => {
    setIsStartingShift(false);
    setShowCameraModal(true);
    setShowEndConfirmation(false);
  };

  const handleCapturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setSelfieImage(imageSrc);
      
      // Convert base64 to file
      const blob = dataURLtoBlob(imageSrc);
      const timestamp = new Date().getTime();
      const file = new File([blob], `selfie_${timestamp}.jpg`, { type: 'image/jpeg' });
      setSelfieFile(file);
    }
  };

 const handleFileUpload = (fileOrEvent) => {
  const file = fileOrEvent?.target?.files?.[0] || fileOrEvent;
  
  if (file && file instanceof File) {
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelfieImage(e.target.result);
    };
    reader.readAsDataURL(file);
    setSelfieFile(file);
  }
};

  const dataURLtoBlob = (dataURL) => {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    return new Blob([ab], { type: mimeString });
  };

  const handleSubmitSelfie = async () => {
    if (!selfieFile) {
      alert('Please take or upload a selfie');
      return;
    }

    const formData = new FormData();
    formData.append('selfie', selfieFile);

    try {
      if (isStartingShift) {
        await dispatch(startShift(formData)).unwrap();
        // Refresh current shift
        dispatch(getCurrentShift());
      } else {
        await dispatch(endShift(formData)).unwrap();
        // Refresh history
        dispatch(getMyAttendance(filters));
      }
      
      // Close modal and reset
      setShowCameraModal(false);
      setSelfieImage(null);
      setSelfieFile(null);
      setIsStartingShift(false);
      
    } catch (error) {
      console.error('Error submitting selfie:', error);
    }
  };

  const handleRetakePhoto = () => {
    setSelfieImage(null);
    setSelfieFile(null);
  };

  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
    dispatch(getMyAttendance({ ...filters, page }));
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value, page: 1 }));
    dispatch(getMyAttendance({ ...filters, [key]: value, page: 1 }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(getMyAttendance({ page: 1, limit: 10 }));
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Not Logged In</h2>
          <p className="text-gray-500 mb-4">Please login to access attendance</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-2 sm:mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
            <div>
              <h1 className="text-2xl sm:text-2xl font-bold text-gray-800 mb-2">Attendance Management</h1>
            </div>
            <div className="mt-2 sm:mt-0 text-sm text-gray-500 mb-1">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{getCurrentDate()}</span>
                <Clock className="w-4 h-4 ml-2" />
                <span>{getCurrentTime()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <AttendanceStats stats={stats} />

        {/* Current Shift Status */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-blue-600" />
                Current Shift Status
              </h2>
              <button
                onClick={() => dispatch(getCurrentShift())}
                disabled={loading}
                className="text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {currentShift ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-lg border border-blue-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="font-semibold text-green-600">Shift Active</span>
                    </div>
                    <p className="text-gray-600 mb-1">
                      Started at <span className="font-semibold">{formatTime(currentShift.startTime)}</span>
                    </p>
                    <p className="text-gray-600">
                      Duration: <span className="font-mono font-bold text-blue-600">{shiftDuration}</span>
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={handleEndShiftClick}
                      className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <StopCircle className="w-4 h-4 mr-2" />
                      End Shift
                    </button>
                  </div>
                </div>

                {currentShift.selfieUrl && (
                  <div className="mt-4 pt-4 border-t border-blue-100">
                    <p className="text-sm text-gray-600 mb-2">Start Selfie:</p>
                    <div className="inline-block">
                      <img
                        src={currentShift.selfieUrl}
                        alt="Start selfie"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 sm:p-6 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-2">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                      <span className="font-semibold text-gray-600">No Active Shift</span>
                    </div>
                    <p className="text-gray-600">Ready to start your shift for today?</p>
                  </div>
                  
                  <button
                    onClick={handleStartShiftClick}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Shift
                  </button>
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start sm:items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
                <p className="text-red-700 text-sm sm:text-base">{error}</p>
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg flex items-start sm:items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5 sm:mt-0" />
                <p className="text-green-700 text-sm sm:text-base">{success}</p>
              </div>
            )}
          </div>
        </div>

        {/* Attendance History */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center mb-2 sm:mb-0">
                <History className="w-5 h-5 mr-2 text-blue-600" />
                Attendance History
              </h2>
              
              <div className="flex space-x-2">
                <select
                  value={filters.month || ''}
                  onChange={(e) => handleFilterChange('month', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Months</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    return (
                      <option key={month} value={month}>
                        {new Date(2000, i, 1).toLocaleString('default', { month: 'long' })}
                      </option>
                    );
                  })}
                </select>
                
                <select
                  value={filters.year || ''}
                  onChange={(e) => handleFilterChange('year', e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Years</option>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
                
                <button
                  onClick={handleClearFilters}
                  className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>

            <AttendanceHistory
              attendanceHistory={attendanceHistory}
              loading={loading}
              pagination={pagination}
              onPageChange={handlePageChange}
              formatTime={formatTime}
              formatDate={formatDate}
            />
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      <AttendanceCameraModal
        show={showCameraModal}
        onClose={() => {
          setShowCameraModal(false);
          setSelfieImage(null);
          setSelfieFile(null);
        }}
        isStartingShift={isStartingShift}
        selfieImage={selfieImage}
        webcamRef={webcamRef}
        fileInputRef={fileInputRef}
        isCameraActive={isCameraActive}
        onCameraToggle={() => setIsCameraActive(!isCameraActive)}
        onCapturePhoto={handleCapturePhoto}
        onFileUpload={handleFileUpload}
        onRetakePhoto={handleRetakePhoto}
        onSubmit={handleSubmitSelfie}
        loading={loading}
      />

      {/* End Shift Confirmation Modal */}
      {showEndConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">End Shift Confirmation</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to end your shift? You can optionally upload an end-of-shift selfie.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEndConfirmation(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEndShift}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceManagement;
