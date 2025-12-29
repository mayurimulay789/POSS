import React, { useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, X, RotateCw, Check } from 'lucide-react';

const AttendanceCameraModal = ({
  show,
  onClose,
  isStartingShift,
  selfieImage,
  webcamRef,
  fileInputRef,
  isCameraActive,
  onCameraToggle,
  onCapturePhoto,
  onFileUpload,
  onRetakePhoto,
  onSubmit,
  loading
}) => {
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front camera, 'environment' for back

  if (!show) return null;

  const videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: facingMode
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Camera className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {isStartingShift ? 'Start Shift Selfie' : 'End Shift Selfie'}
              </h3>
              <p className="text-sm text-gray-600">
                {isStartingShift 
                  ? 'Take a selfie to start your shift' 
                  : 'Optional: Take a selfie to end your shift'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera/Preview Area */}
        <div className="p-4 sm:p-6">
          {!selfieImage ? (
            <div>
              {/* Camera Mode Toggle */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex rounded-lg border border-gray-300 p-1">
                  <button
                    onClick={() => onCameraToggle(true)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      isCameraActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Camera
                  </button>
                  <button
                    onClick={() => onCameraToggle(false)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      !isCameraActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Upload
                  </button>
                </div>
              </div>

              {/* Camera View */}
              {isCameraActive && (
                <div className="relative mb-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <Webcam
                      audio={false}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      videoConstraints={videoConstraints}
                      className="w-full h-64 sm:h-80 object-cover"
                    />
                    {/* Camera overlay frame */}
                    <div className="absolute inset-0 border-2 border-white border-opacity-50 rounded-lg pointer-events-none"></div>
                  </div>
                  
                  {/* Camera Controls */}
                  <div className="flex justify-center space-x-4 mt-4">
                    <button
                      onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      title="Switch camera"
                    >
                      <RotateCw className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={onCapturePhoto}
                      className="p-4 bg-white border-4 border-gray-300 hover:border-gray-400 rounded-full transition-all shadow-lg"
                      title="Capture photo"
                    >
                      <div className="w-6 h-6 bg-red-500 rounded-full"></div>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onFileUpload}
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                      title="Upload from gallery"
                    >
                      <Upload className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>
              )}

              {/* Upload View */}
              {!isCameraActive && (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-gray-600 mb-4">Upload a selfie from your device</p>
                  <div className="space-y-3 max-w-xs mx-auto">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={onFileUpload}
                      accept="image/*"
                      className="hidden"
                      id="file-upload"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-blue-600 text-white hover:bg-blue-700 px-4 py-3 rounded-lg font-medium transition-colors"
                    >
                      Choose File
                    </button>
                    <p className="text-xs text-gray-500">
                      Supported formats: JPG, PNG, GIF
                      <br />
                      Max size: 5MB
                    </p>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">Instructions:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Ensure your face is clearly visible in the photo</li>
                  <li>• Make sure the photo is well-lit</li>
                  <li>• Avoid using filters or heavy edits</li>
                  <li>• Selfie will be stored for 2 months only</li>
                </ul>
              </div>
            </div>
          ) : (
            /* Preview Mode */
            <div>
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2 text-center">Preview</h4>
                <div className="relative mx-auto max-w-md">
                  <img
                    src={selfieImage}
                    alt="Selfie preview"
                    className="w-full h-64 sm:h-80 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Preview
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={onRetakePhoto}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Retake
                </button>
                <button
                  onClick={onSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {isStartingShift ? 'Start Shift' : 'End Shift'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            <p className="mb-1">
              <span className="font-medium">Privacy:</span> Your selfie is used only for attendance verification.
            </p>
            <p>
              <span className="font-medium">Note:</span> Selfies are automatically deleted after 2 months.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCameraModal;