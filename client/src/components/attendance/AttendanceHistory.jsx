import React, { useState } from 'react';
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye,
  StopCircle 
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { endShiftById } from '../../store/slices/attendanceSlice';
import AttendanceCameraModal from '../../components/attendance/AttendanceCameraModal';

const AttendanceHistory = ({ 
  attendanceHistory, 
  loading, 
  pagination, 
  onPageChange,
  formatTime,
  formatDate
}) => {
  const dispatch = useDispatch();
  const [endingShiftId, setEndingShiftId] = useState(null);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'active':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEndShiftClick = (record) => {
    setSelectedRecord(record);
    setShowEndModal(true);
  };

  const handleConfirmEndShift = () => {
    setShowEndModal(false);
    setShowCameraModal(true);
  };

  const handleCapturePhoto = (imageSrc) => {
    setSelfieImage(imageSrc);
    
    // Convert base64 to file
    const blob = dataURLtoBlob(imageSrc);
    const file = new File([blob], `end_selfie_${Date.now()}.jpg`, { type: 'image/jpeg' });
    setSelfieFile(file);
  };

  const handleFileUpload = (file) => {
    if (file) {
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
    if (!selectedRecord) return;
    
    const recordId = selectedRecord._id || selectedRecord.id;
    if (!recordId) {
      alert('Cannot end shift: Invalid record ID');
      return;
    }

    const formData = new FormData();
    if (selfieFile) {
      formData.append('selfie', selfieFile);
    }

    setEndingShiftId(recordId);
    try {
      await dispatch(endShiftById({ id: recordId, formData })).unwrap();
      setShowCameraModal(false);
      setSelectedRecord(null);
      setSelfieImage(null);
      setSelfieFile(null);
    } catch (error) {
      console.error('Failed to end shift:', error);
    } finally {
      setEndingShiftId(null);
    }
  };

  const handleRetakePhoto = () => {
    setSelfieImage(null);
    setSelfieFile(null);
  };

  const handleCloseCameraModal = () => {
    setShowCameraModal(false);
    setSelfieImage(null);
    setSelfieFile(null);
    setSelectedRecord(null);
  };

  if (loading && attendanceHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500">Loading attendance history...</p>
      </div>
    );
  }

  if (attendanceHistory.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">No Attendance Records</h3>
        <p className="text-gray-500">Start your first shift to see attendance history here.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Selfie
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendanceHistory.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {formatDate(record.date)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {formatTime(record.startTime)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {record.endTime ? formatTime(record.endTime) : '--:--'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {record.totalHours ? `${record.totalHours}h` : record.duration}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                    {getStatusIcon(record.status)}
                    <span className="ml-1 capitalize">{record.status}</span>
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {record.startSelfie && (
                      <a
                        href={record.startSelfie}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Start
                      </a>
                    )}
                    {record.endSelfie && (
                      <a
                        href={record.endSelfie}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-xs text-green-600 hover:text-green-800"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        End
                      </a>
                    )}
                    {!record.startSelfie && !record.endSelfie && (
                      <span className="text-xs text-gray-500">No selfie</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {record.status === 'active' ? (
                    <button
                      onClick={() => handleEndShiftClick(record)}
                      disabled={endingShiftId === (record._id || record.id)}
                      className={`inline-flex items-center px-3 py-1.5 rounded text-xs font-medium ${
                        endingShiftId === (record._id || record.id)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      {endingShiftId === (record._id || record.id) ? (
                        <>
                          <div className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                          Ending...
                        </>
                      ) : (
                        <>
                          <StopCircle className="w-3 h-3 mr-1" />
                          End Shift
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {attendanceHistory.map((record, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center mb-1">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-900">
                    {formatDate(record.date)}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{formatTime(record.startTime)} - {record.endTime ? formatTime(record.endTime) : 'Active'}</span>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                {getStatusIcon(record.status)}
                <span className="ml-1 capitalize">{record.status}</span>
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium ml-2">
                  {record.totalHours ? `${record.totalHours}h` : record.duration}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Selfie:</span>
                <div className="inline-flex space-x-2 ml-2">
                  {record.startSelfie && (
                    <a
                      href={record.startSelfie}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Start
                    </a>
                  )}
                  {record.endSelfie && (
                    <a
                      href={record.endSelfie}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800"
                    >
                      End
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* End Shift Button for Mobile */}
            {record.status === 'active' && (
              <button
                onClick={() => handleEndShiftClick(record)}
                disabled={endingShiftId === (record._id || record.id)}
                className={`w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded text-sm font-medium ${
                  endingShiftId === (record._id || record.id)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                {endingShiftId === (record._id || record.id) ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Ending Shift...
                  </>
                ) : (
                  <>
                    <StopCircle className="w-4 h-4 mr-2" />
                    End Shift
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* End Shift Confirmation Modal */}
      {showEndModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-800">End Shift Confirmation</h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Are you sure you want to end the shift from <span className="font-medium">{formatTime(selectedRecord.startTime)}</span>?
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium ml-2">{formatDate(selectedRecord.date)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Started:</span>
                  <span className="font-medium ml-2">{formatTime(selectedRecord.startTime)}</span>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500 mb-6">
              <p className="mb-2">You can optionally upload an end-of-shift selfie.</p>
              <p>Selfie is not required but recommended for verification.</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEndModal(false);
                  setSelectedRecord(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEndShift}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal for End Shift */}
      <AttendanceCameraModal
        show={showCameraModal}
        onClose={handleCloseCameraModal}
        isStartingShift={false}
        selfieImage={selfieImage}
        onCapturePhoto={handleCapturePhoto}
        onFileUpload={handleFileUpload}
        onRetakePhoto={handleRetakePhoto}
        onSubmit={handleSubmitSelfie}
        loading={endingShiftId !== null}
        isCameraActive={isCameraActive}
        onCameraToggle={() => setIsCameraActive(!isCameraActive)}
        title="End Shift Selfie"
        description="Optional: Take a selfie to end your shift"
        submitButtonText="End Shift"
        isOptional={true}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{attendanceHistory.length}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> records
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => onPageChange(pagination.current - 1)}
              disabled={!pagination.hasPrev}
              className={`px-3 py-1 rounded-md text-sm ${
                pagination.hasPrev
                  ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {pagination.current} of {pagination.pages}
            </span>
            <button
              onClick={() => onPageChange(pagination.current + 1)}
              disabled={!pagination.hasNext}
              className={`px-3 py-1 rounded-md text-sm ${
                pagination.hasNext
                  ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;