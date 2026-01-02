const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); // Added for uploads directory

// Load environment variables
try {
  const envPath = path.join(__dirname, '../.env');
  const result = dotenv.config({ path: envPath });
  
  if (result.error) {
    console.log('❌ .env file not found or error loading:', result.error.message);
    console.log('💡 Trying to load from default location...');
    dotenv.config(); // Try without specific path
  } else {
    console.log('✅ .env file loaded successfully');
  }
} catch (error) {
  console.log('❌ Error loading .env:', error.message);
}

const app = express();
const PORT = process.env.PORT || 5000;

// ========== CONFIGURE CLOUDINARY ==========
const { configureCloudinary } = require('../utils/cloudinaryUpload');
configureCloudinary();

// ========== CREATE UPLOADS DIRECTORY ==========
const uploadDir = './uploads/temp';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created uploads directory');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with fallback
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => {
  console.log('❌ MongoDB connection error:', err.message);
  console.log('💡 Please check your MONGO_URI in .env file');
});

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: '🍽️ Restaurant POS Backend Server is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongoConnected: mongoose.connection.readyState === 1,
    features: {
      attendance: 'enabled',
      cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? 'configured' : 'not configured'
    }
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    cloudinary: process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Not configured',
    uploadsDirectory: fs.existsSync(uploadDir) ? 'Exists' : 'Missing',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ========== IMPORT ROUTES ==========
const authRoutes = require("../routes/auth");
const employeeRoute = require("../routes/EmployeeRoute");
const permissionRoutes = require("../routes/rolePermissionRoutes");
const menuRoutes = require("../routes/menuRoutes");
const spaceRoutes = require("../routes/spaceRoutes");
const tableRoutes = require("../routes/tableRoutes");
const orderRoutes = require("../routes/orderRoutes");
const hotelImageRoutes = require("../routes/hotelImageRoutes");
const expenseRoutes = require("../routes/expenseRoutes");
const taskRoutes = require('../routes/taskRoutes');
const customerRoutes = require('../routes/customerRoutes');
const dashboardRoutes = require('../routes/dashboardRoutes');
const attendanceRoutes = require('../routes/attendanceRoutes'); 
const merchantAttendance=require('../routes/merchantAttendance');
const aboutUsRoutes = require('../routes/aboutUsRoutes');
const contactUsRoutes = require('../routes/contactUsRoutes');
const welcomeSectionRoutes = require('../routes/welcomeSectionRoutes');
const cuisineGalleryRoutes = require('../routes/cuisineGalleryRoutes');

// ========== USE ROUTES ==========
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoute);
app.use("/api/role-permissions", permissionRoutes);

app.use('/api/menu', menuRoutes);
app.use('/api/space', spaceRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/hotel-images', hotelImageRoutes);

// Note: All images are now stored in Cloudinary only (in-memory processing, no local disk storage)

// Debug route to list registered routes (for diagnostics)
app.get('/debug/routes', (req, res) => {
  try {
    const routes = [];
    app._router.stack.forEach(mw => {
      if (mw.route) {
        const methods = Object.keys(mw.route.methods).join(',').toUpperCase();
        routes.push({ path: mw.route.path, methods });
      } else if (mw.name === 'router' && mw.handle && mw.handle.stack) {
        mw.handle.stack.forEach(r => {
          if (r.route) {
            const methods = Object.keys(r.route.methods).join(',').toUpperCase();
            routes.push({ path: r.route.path, methods });
          }
        });
      }
    });
    res.json({ routes });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});


app.use('/api/expenses', expenseRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/attendance', attendanceRoutes); // NEW
app.use('/api/merchant/attendance',merchantAttendance); // NEW
app.use('/api/about-us', aboutUsRoutes); // About Us routes
app.use('/api/contact-us', contactUsRoutes); // Contact Us routes
app.use('/api/welcome-section', welcomeSectionRoutes); // Welcome Section routes
app.use('/api/cuisine-gallery', cuisineGalleryRoutes); // Cuisine Gallery routes

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  // Handle file upload errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        message: 'File size is too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      message: 'File upload error',
      error: err.message
    });
  }
  
  // Handle other errors
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API available at: http://localhost:${PORT}`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`📸 Attendance system: /api/attendance`);
  console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Configured' : 'Not configured'}`);
});