

const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { calculateHours, formatTime, formatDate } = require('../utils/attendanceHelper');


const startShift = async (req, res) => {
  try {
    console.log('Start shift request received for user:', req.user._id);
    
    // Use the model method to check for active shift
    const hasActiveShift = await Attendance.hasActiveShiftToday(req.user._id);
    
    if (hasActiveShift) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active shift today'
      });
    }
    
    // Check if file is uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a selfie to start shift'
      });
    }
    
    console.log('File received:', req.file);
    
    // Upload selfie to Cloudinary
    let cloudinaryResult;
    try {
      cloudinaryResult = await uploadToCloudinary(req.file, 'attendance/start');
      console.log('Cloudinary upload successful:', cloudinaryResult.url);
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload selfie. Please try again.'
      });
    }
    
    // Create attendance record
    const attendanceData = {
      userId: req.user._id,
      date: new Date(),
      startTime: new Date(),
      startSelfie: cloudinaryResult.url,
      status: 'active'
    };
    
    console.log('Creating attendance with data:', attendanceData);
    
    const attendance = await Attendance.create(attendanceData);
    
    console.log('Attendance created successfully:', attendance._id);
    
    res.status(201).json({
      success: true,
      message: 'Shift started successfully',
      data: {
        id: attendance._id,
        startTime: attendance.startTime,
        selfieUrl: attendance.startSelfie,
        status: attendance.status,
        date: formatDate(attendance.date)
      }
    });
    
  } catch (error) {
    console.error('Start shift error:', error);
    console.error('Error stack:', error.stack);
    
    // Handle duplicate attendance error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You already have an attendance record for today'
      });
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while starting shift',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const endShift = async (req, res) => {
  try {
    console.log('End shift request received for user:', req.user._id);
    
    // Find active shift for today using model method
    const attendance = await Attendance.getCurrentShift(req.user._id);
    
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'No active shift found. Please start a shift first.'
      });
    }
    
    // Upload end selfie if provided
    let endSelfieUrl = null;
    if (req.file) {
      try {
        console.log('Uploading end selfie...');
        const cloudinaryResult = await uploadToCloudinary(req.file, 'attendance/end');
        endSelfieUrl = cloudinaryResult.url;
        console.log('End selfie uploaded:', endSelfieUrl);
      } catch (uploadError) {
        console.error('End selfie upload error:', uploadError);
        // Continue without end selfie (it's optional)
      }
    }
    
    // End the shift
    await attendance.endShift(endSelfieUrl);
    
    console.log('Shift ended successfully for:', req.user._id);
    
    res.status(200).json({
      success: true,
      message: 'Shift ended successfully',
      data: {
        id: attendance._id,
        startTime: attendance.startTime,
        endTime: attendance.endTime,
        totalHours: attendance.totalHours,
        startSelfieUrl: attendance.startSelfie,
        endSelfieUrl: attendance.endSelfie,
        duration: attendance.duration,
        date: formatDate(attendance.date)
      }
    });
    
  } catch (error) {
    console.error('End shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while ending shift',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


const getCurrentShift = async (req, res) => {
  try {
    console.log('Get current shift request for user:', req.user._id);
    
    const attendance = await Attendance.getCurrentShift(req.user._id);
    
    if (!attendance) {
      return res.status(200).json({
        success: true,
        hasActiveShift: false,
        message: 'No active shift found'
      });
    }
    
    // Calculate current duration
    const duration = attendance.duration;
    
    res.status(200).json({
      success: true,
      hasActiveShift: true,
      data: {
        id: attendance._id,
        startTime: attendance.startTime,
        formattedStartTime: formatTime(attendance.startTime),
        duration: `${duration.hours}h ${duration.minutes}m`,
        selfieUrl: attendance.startSelfie,
        date: formatDate(attendance.date)
      }
    });
    
  } catch (error) {
    console.error('Get current shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching current shift'
    });
  }
};


const getMyAttendance = async (req, res) => {
  try {
    const { page = 1, limit = 30, month, year } = req.query;
    const skip = (page - 1) * limit;
    
    console.log('Get my attendance request for user:', req.user._id, { page, limit, month, year });
    
    // Build date filter
    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);
      dateFilter.date = { $gte: startDate, $lte: endDate };
    } else {
      // Default: Last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      dateFilter.date = { $gte: thirtyDaysAgo };
    }
    
    const query = {
      userId: req.user._id,
      ...dateFilter
    };
    
    // Get attendance records
    const attendanceRecords = await Attendance.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get totals
    const totalRecords = await Attendance.countDocuments(query);
    const totalPages = Math.ceil(totalRecords / limit);
    
    // Calculate summary
    const completedShifts = attendanceRecords.filter(a => a.status === 'completed');
    const totalHours = completedShifts.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const averageHours = completedShifts.length > 0 ? totalHours / completedShifts.length : 0;
    
    // Count unique days
    const uniqueDays = new Set(
      attendanceRecords.map(record => 
        new Date(record.date).toDateString()
      )
    ).size;
    
    // Format response
    const formattedRecords = attendanceRecords.map(record => ({
      id: record._id,
      date: formatDate(record.date),
      startTime: formatTime(record.startTime),
      endTime: record.endTime ? formatTime(record.endTime) : null,
      status: record.status,
      totalHours: record.totalHours,
      startSelfie: record.startSelfie,
      endSelfie: record.endSelfie,
      duration: `${record.duration.hours}h ${record.duration.minutes}m`
    }));
    
    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      total: totalRecords,
      totalPages,
      currentPage: parseInt(page),
      summary: {
        totalShifts: totalRecords,
        completedShifts: completedShifts.length,
        activeShifts: attendanceRecords.filter(a => a.status === 'active').length,
        totalHours: parseFloat(totalHours.toFixed(2)),
        averageHours: parseFloat(averageHours.toFixed(2)),
        daysPresent: uniqueDays
      },
      data: formattedRecords
    });
    
  } catch (error) {
    console.error('Get my attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance history'
    });
  }
};

module.exports = {
  startShift,
  endShift,
  getCurrentShift,
  getMyAttendance
};