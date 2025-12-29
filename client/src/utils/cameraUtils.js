/**
 * Utility functions for camera and image handling
 */

// Check if browser supports camera
export const isCameraSupported = () => {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
};

// Get camera permission
export const requestCameraPermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true,
      audio: false 
    });
    
    // Stop all tracks
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    console.error('Camera permission error:', error);
    return false;
  }
};

// Get list of available cameras
export const getAvailableCameras = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    return videoDevices;
  } catch (error) {
    console.error('Error getting cameras:', error);
    return [];
  }
};

// Capture photo from video element
export const capturePhotoFromVideo = (videoElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const context = canvas.getContext('2d');
  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  return canvas.toDataURL('image/jpeg', 0.8);
};

// Validate image file
export const validateImageFile = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file selected');
    return { isValid: false, errors };
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    errors.push('Only JPG, PNG, and GIF images are allowed');
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : null
  };
};

// Compress image
export const compressImage = (dataUrl, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
};

// Convert base64 to blob
export const dataURLtoBlob = (dataURL) => {
  const byteString = atob(dataURL.split(',')[1]);
  const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
};

// Convert blob to file
export const blobToFile = (blob, fileName) => {
  return new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now()
  });
};

// Get current date and time for filename
export const getTimestampForFilename = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hour}${minute}${second}`;
};

// Get image orientation from EXIF
export const getImageOrientation = (file) => {
  return new Promise((resolve) => {
    if (!file) {
      resolve(1); // Default orientation
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const view = new DataView(e.target.result);
      
      if (view.getUint16(0, false) !== 0xFFD8) {
        resolve(1); // Not a JPEG
        return;
      }
      
      const length = view.byteLength;
      let offset = 2;
      
      while (offset < length) {
        const marker = view.getUint16(offset, false);
        offset += 2;
        
        if (marker === 0xFFE1) { // APP1 (EXIF)
          if (view.getUint32(offset += 2, false) !== 0x45786966) { // "Exif"
            resolve(1);
            return;
          }
          
          offset += 6; // Skip "Exif" and padding
          
          // Little endian?
          const little = view.getUint16(offset, false) === 0x4949;
          offset += view.getUint32(offset + 4, little);
          
          const tags = view.getUint16(offset, little);
          offset += 2;
          
          for (let i = 0; i < tags; i++) {
            if (view.getUint16(offset + (i * 12), little) === 0x0112) { // Orientation tag
              resolve(view.getUint16(offset + (i * 12) + 8, little));
              return;
            }
          }
        } else if ((marker & 0xFF00) !== 0xFF00) {
          break; // Not a valid marker
        } else {
          offset += view.getUint16(offset, false);
        }
      }
      
      resolve(1); // Default orientation
    };
    
    reader.readAsArrayBuffer(file.slice(0, 64 * 1024)); // Read first 64KB
  });
};

// Fix image orientation
export const fixImageOrientation = (img, orientation) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas dimensions
  if (orientation > 4) {
    canvas.width = img.height;
    canvas.height = img.width;
  } else {
    canvas.width = img.width;
    canvas.height = img.height;
  }
  
  // Transform context according to orientation
  switch (orientation) {
    case 2:
      ctx.transform(-1, 0, 0, 1, img.width, 0);
      break;
    case 3:
      ctx.transform(-1, 0, 0, -1, img.width, img.height);
      break;
    case 4:
      ctx.transform(1, 0, 0, -1, 0, img.height);
      break;
    case 5:
      ctx.transform(0, 1, 1, 0, 0, 0);
      break;
    case 6:
      ctx.transform(0, 1, -1, 0, img.height, 0);
      break;
    case 7:
      ctx.transform(0, -1, -1, 0, img.height, img.width);
      break;
    case 8:
      ctx.transform(0, -1, 1, 0, 0, img.width);
      break;
    default:
      break;
  }
  
  // Draw image
  ctx.drawImage(img, 0, 0);
  
  return canvas.toDataURL('image/jpeg', 0.8);
};