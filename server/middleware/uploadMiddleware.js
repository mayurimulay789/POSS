const multer = require('multer');

// Use memory storage so we can stream buffer to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Export middleware to accept single image field named 'image' or generic field names
module.exports = {
	uploadSingle: (fieldName = 'image') => upload.single(fieldName),
	uploadMultiple: (fieldName = 'images', maxCount = 5) => upload.array(fieldName, maxCount)
};
