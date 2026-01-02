const multer = require('multer');

// Use memory storage so we can stream buffer to Cloudinary
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Export middleware to accept single image field named 'image' or generic field names
module.exports = {
	uploadSingle: (fieldName = 'image') => (req, res, next) => {
		// Check if request is multipart/form-data
		const contentType = req.headers['content-type'] || '';
		if (contentType.includes('multipart/form-data')) {
			const middleware = upload.single(fieldName);
			middleware(req, res, (err) => {
				// Allow request to continue even if no file is uploaded
				// Multer will populate req.body with other form fields
				if (err) {
					return next(err);
				}
				next();
			});
		} else {
			// For JSON requests, skip multer and let express.json() handle it
			next();
		}
	},
	uploadMultiple: (fieldName = 'images', maxCount = 5) => upload.array(fieldName, maxCount)
};
