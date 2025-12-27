const cloudinary = require('cloudinary').v2;

// Configure via environment variables: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

console.log('🔷 Cloudinary Config Check:');
console.log('   CLOUD_NAME:', CLOUD_NAME ? '✅ Set' : '❌ Not set');
console.log('   API_KEY:', API_KEY ? '✅ Set' : '❌ Not set');
console.log('   API_SECRET:', API_SECRET ? '✅ Set' : '❌ Not set');

let enabled = false;
if (CLOUD_NAME && API_KEY && API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET,
    secure: true
  });
  enabled = true;
  console.log('✅ Cloudinary ENABLED and configured');
} else {
  console.warn('⚠️ Cloudinary NOT configured - uploads will fail. Set CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET in .env');
}

function uploadBufferToCloudinary(buffer, filename, folder = 'pos_menus') {
  if (!enabled) {
    return Promise.reject(new Error('Cloudinary not configured. Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env'));
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: filename, resource_type: 'image' },
      (error, result) => {
        if (error) {
          console.error('🔴 Cloudinary upload error:', error);
          // Fallback: Create a data URL (in-memory, no disk storage)
          console.log('💡 Falling back to in-memory base64 URL (Cloudinary unavailable)');
          const base64 = buffer.toString('base64');
          const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 
                          filename.toLowerCase().endsWith('.webp') ? 'image/webp' :
                          filename.toLowerCase().endsWith('.gif') ? 'image/gif' : 'image/jpeg';
          const dataUrl = `data:${mimeType};base64,${base64}`;
          return resolve({ 
            secure_url: dataUrl,
            fallback: true,
            message: 'Stored as in-memory base64 (Cloudinary failed)'
          });
        }
        console.log('✅ Successfully uploaded to Cloudinary:', result.secure_url);
        resolve(result);
      }
    );

    stream.on('error', (err) => {
      console.error('🔴 Stream error:', err);
      // Fallback for stream errors too
      console.log('💡 Falling back to in-memory base64 URL (stream error)');
      const base64 = buffer.toString('base64');
      const mimeType = filename.toLowerCase().endsWith('.png') ? 'image/png' : 
                      filename.toLowerCase().endsWith('.webp') ? 'image/webp' :
                      filename.toLowerCase().endsWith('.gif') ? 'image/gif' : 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64}`;
      resolve({ 
        secure_url: dataUrl,
        fallback: true,
        message: 'Stored as in-memory base64 (stream error)'
      });
    });

    stream.end(buffer);
  });
}

module.exports = { cloudinary, uploadBufferToCloudinary, cloudinaryEnabled: enabled };
