const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');


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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection with fallback
const mongoURI = process.env.MONGO_URI ;

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
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes
const authRoutes = require("../routes/auth");
const employeeRoute = require("../routes/EmployeeRoute");
const permissionRoutes = require("../routes/rolePermissionRoutes");




app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoute);
app.use("/api/role-permissions", permissionRoutes);


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
});