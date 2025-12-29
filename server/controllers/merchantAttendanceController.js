// server/controllers/merchantAttendanceController.js
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const mongoose = require('mongoose');
const { formatDate, formatTime, calculateHours } = require('../utils/attendanceHelper');

/**
 * @desc    Get all attendance records (Merchant only)
 * @route   GET /api/merchant/attendance/all
 * @access  Private/Merchant
 */
exports.getAllAttendance = async (req, res) => {
  console.log('🔍 [GET] /api/merchant/attendance/all called');
  console.log('📋 Query parameters:', req.query);
  console.log('👤 Merchant ID:', req.user._id);
  
  try {
    const {
      page = 1,
      limit = 50,
      startDate,
      endDate,
      userId,
      status
    } = req.query;

    console.log('📅 Date range:', { startDate, endDate });
    
    const skip = (page - 1) * limit;

    // Get all users created by this merchant
    console.log('🔄 Fetching merchant users...');
    const merchantUsers = await User.find({ 
      createdBy: req.user._id 
    }).select('_id');
    
    console.log(`👥 Found ${merchantUsers.length} users for merchant`);
    const userIds = merchantUsers.map(user => user._id);
    console.log('👤 User IDs:', userIds);

    // Build query
    let query = {
      userId: { $in: userIds }
    };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
        console.log('📅 Start date filter:', query.date.$gte);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
        console.log('📅 End date filter:', query.date.$lte);
      }
    }

    // User filter
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
      console.log('👤 User filter:', userId);
    }

    // Status filter
    if (status) {
      query.status = status;
      console.log('📊 Status filter:', status);
    }

    console.log('🔍 Final query:', JSON.stringify(query, null, 2));

    // Get all attendance with user details
    console.log('🔄 Fetching attendance records...');
    const attendance = await Attendance.find(query)
      .populate('userId', 'FullName email role department')
      .populate('approvedBy', 'FullName')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    console.log(`✅ Found ${attendance.length} attendance records`);

    const total = await Attendance.countDocuments(query);
    console.log(`📊 Total records in database: ${total}`);

    // Format response
    const formattedAttendance = attendance.map(record => ({
      id: record._id,
      user: {
        id: record.userId?._id,
        name: record.userId?.FullName || 'Unknown',
        email: record.userId?.email || '',
        role: record.userId?.role || 'staff',
        department: record.userId?.department || ''
      },
      date: formatDate(record.date),
      startTime: formatTime(record.startTime),
      endTime: record.endTime ? formatTime(record.endTime) : null,
      status: record.status,
      totalHours: record.totalHours,
      startSelfie: record.startSelfie,
      endSelfie: record.endSelfie,
      duration: record.durationString,
      createdAt: record.createdAt,
      approvalStatus: record.approvalStatus || 'pending'
    }));

    console.log('✅ Successfully formatted attendance data');

    res.status(200).json({
      success: true,
      count: attendance.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: formattedAttendance
    });

  } catch (error) {
    console.error('❌ Get all attendance error:', error);
    console.error('📝 Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get team attendance
 * @route   GET /api/merchant/attendance/team
 * @access  Private/Merchant
 */
exports.getTeamAttendance = async (req, res) => {
  console.log('🔍 [GET] /api/merchant/attendance/team called');
  console.log('📋 Query parameters:', req.query);
  
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    console.log('📅 Target date:', targetDate);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('📅 Date range for query:', { startOfDay, endOfDay });

    // Get all users created by this merchant
    console.log('🔄 Fetching merchant users...');
    const users = await User.find({ createdBy: req.user._id })
      .select('_id FullName email role department isActive');

    console.log(`👥 Found ${users.length} users for merchant`);

    // Get attendance for these users on the specified date
    console.log('🔍 Querying attendance...');
    const attendance = await Attendance.find({
      userId: { $in: users.map(u => u._id) },
      date: { $gte: startOfDay, $lte: endOfDay }
    }).populate('userId', 'FullName email role department');

    console.log(`✅ Found ${attendance.length} attendance records for the date`);

    // Create a map of user attendance
    const attendanceMap = {};
    attendance.forEach(record => {
      attendanceMap[record.userId?._id] = record;
    });

    // Combine user list with attendance data
    const teamAttendance = users.map(user => {
      const userAttendance = attendanceMap[user._id];
      return {
        user: {
          id: user._id,
          name: user.FullName,
          email: user.email,
          role: user.role,
          department: user.department,
          isActive: user.isActive
        },
        attendance: userAttendance ? {
          id: userAttendance._id,
          startTime: formatTime(userAttendance.startTime),
          endTime: userAttendance.endTime ? formatTime(userAttendance.endTime) : null,
          status: userAttendance.status,
          totalHours: userAttendance.totalHours,
          duration: userAttendance.durationString
        } : null,
        status: userAttendance ? userAttendance.status : 'absent'
      };
    });

    // Calculate stats
    const present = teamAttendance.filter(t => t.attendance).length;
    const active = teamAttendance.filter(t => t.attendance?.status === 'active').length;
    const absent = teamAttendance.length - present;

    console.log('📊 Team stats:', { total: teamAttendance.length, present, active, absent });

    res.status(200).json({
      success: true,
      date: formatDate(targetDate),
      stats: {
        total: teamAttendance.length,
        present,
        active,
        absent,
        attendanceRate: teamAttendance.length > 0 ? ((present / teamAttendance.length) * 100).toFixed(1) : 0
      },
      data: teamAttendance
    });

  } catch (error) {
    console.error('❌ Get team attendance error:', error);
    console.error('📝 Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching team attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get daily attendance sheet
 * @route   GET /api/merchant/attendance/daily-sheet
 * @access  Private/Merchant
 */
exports.getDailyAttendanceSheet = async (req, res) => {
  console.log('🔍 [GET] /api/merchant/attendance/daily-sheet called');
  console.log('📋 Query parameters:', req.query);
  
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    console.log('📅 Target date:', targetDate);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('📅 Query date range:', { startOfDay, endOfDay });

    // Get merchant's users
    console.log('🔄 Fetching merchant users...');
    const merchantUsers = await User.find({ createdBy: req.user._id }).select('_id');
    const userIds = merchantUsers.map(user => user._id);
    
    console.log(`👥 Merchant has ${userIds.length} users`);

    // Get all attendance for the day with user details
    console.log('🔍 Querying attendance for date...');
    const attendance = await Attendance.find({
      userId: { $in: userIds },
      date: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate('userId', 'FullName email role department')
      .sort({ 'userId.FullName': 1 });

    console.log(`✅ Found ${attendance.length} attendance records`);

    // Format as attendance sheet
    const attendanceSheet = attendance.map(record => ({
      employeeId: record.userId?._id,
      employeeName: record.userId?.FullName || 'Unknown',
      role: record.userId?.role || 'staff',
      department: record.userId?.department || '',
      date: formatDate(record.date),
      inTime: formatTime(record.startTime),
      outTime: record.endTime ? formatTime(record.endTime) : '--:--',
      status: record.status,
      workingHours: record.totalHours || record.durationString,
      overtime: record.totalHours > 8 ? (record.totalHours - 8).toFixed(2) : 0,
      remarks: record.status === 'active' ? 'Shift in progress' : 'Shift completed'
    }));

    console.log('✅ Generated attendance sheet with', attendanceSheet.length, 'entries');

    res.status(200).json({
      success: true,
      date: formatDate(targetDate),
      generatedAt: new Date().toISOString(),
      totalEmployees: attendanceSheet.length,
      data: attendanceSheet
    });

  } catch (error) {
    console.error('❌ Get daily sheet error:', error);
    console.error('📝 Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error while generating daily sheet',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get attendance analytics
 * @route   GET /api/merchant/attendance/analytics
 * @access  Private/Merchant
 */
exports.getAttendanceAnalytics = async (req, res) => {
  console.log('🔍 [GET] /api/merchant/attendance/analytics called');
  console.log('📋 Query parameters:', req.query);
  
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date();
    start.setDate(start.getDate() - 30); // Default: Last 30 days
    
    const end = endDate ? new Date(endDate) : new Date();

    console.log('📅 Analytics date range:', { start, end });

    // Get all users created by this merchant
    console.log('🔄 Fetching merchant users...');
    const users = await User.find({ createdBy: req.user._id })
      .select('_id FullName role department');

    console.log(`👥 Merchant has ${users.length} users`);

    // Get attendance data
    console.log('🔍 Querying attendance data...');
    const attendance = await Attendance.find({
      userId: { $in: users.map(u => u._id) },
      date: { $gte: start, $lte: end }
    }).populate('userId', 'FullName role department');

    console.log(`📊 Found ${attendance.length} attendance records for analytics`);

    // Calculate analytics
    const analytics = {
      period: {
        start: formatDate(start),
        end: formatDate(end),
        days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      },
      summary: {
        totalShifts: attendance.length,
        completedShifts: attendance.filter(a => a.status === 'completed').length,
        activeShifts: attendance.filter(a => a.status === 'active').length,
        totalHours: attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0),
        avgHoursPerShift: attendance.length > 0 ? 
          (attendance.reduce((sum, a) => sum + (a.totalHours || 0), 0) / attendance.length).toFixed(2) : 0
      },
      byRole: {},
      byDepartment: {},
      dailyTrends: {},
      topPerformers: []
    };

    // Group by role
    users.forEach(user => {
      const userAttendance = attendance.filter(a => a.userId?._id.toString() === user._id.toString());
      const role = user.role || 'staff';
      
      if (!analytics.byRole[role]) {
        analytics.byRole[role] = {
          count: 0,
          totalHours: 0,
          avgHours: 0
        };
      }
      
      analytics.byRole[role].count += userAttendance.length;
      analytics.byRole[role].totalHours += userAttendance.reduce((sum, a) => sum + (a.totalHours || 0), 0);
    });

    // Calculate averages
    Object.keys(analytics.byRole).forEach(role => {
      if (analytics.byRole[role].count > 0) {
        analytics.byRole[role].avgHours = (analytics.byRole[role].totalHours / analytics.byRole[role].count).toFixed(2);
      }
    });

    // Prepare top performers
    const userPerformance = users.map(user => {
      const userAttendance = attendance.filter(a => a.userId?._id.toString() === user._id.toString());
      const completed = userAttendance.filter(a => a.status === 'completed');
      const totalHours = completed.reduce((sum, a) => sum + (a.totalHours || 0), 0);
      
      return {
        user: {
          id: user._id,
          name: user.FullName,
          role: user.role || 'staff'
        },
        shifts: completed.length,
        totalHours: parseFloat(totalHours.toFixed(2)),
        avgHours: completed.length > 0 ? parseFloat((totalHours / completed.length).toFixed(2)) : 0
      };
    });

    analytics.topPerformers = userPerformance
      .filter(p => p.shifts > 0)
      .sort((a, b) => b.totalHours - a.totalHours)
      .slice(0, 5);

    console.log('✅ Analytics calculated successfully');
    console.log('📊 Analytics summary:', analytics.summary);

    res.status(200).json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('❌ Get analytics error:', error);
    console.error('📝 Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get attendance reports
 * @route   GET /api/merchant/attendance/reports
 * @access  Private/Merchant
 */
exports.getAttendanceReport = async (req, res) => {
  console.log('🔍 [GET] /api/merchant/attendance/reports called');
  console.log('📋 Query parameters:', req.query);
  
  try {
    console.log('📄 Reports endpoint accessed');
    
    res.json({
      success: true,
      message: 'Reports endpoint working',
      data: {}
    });
  } catch (error) {
    console.error('❌ Get attendance report error:', error);
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Approve/Reject attendance
 * @route   PATCH /api/merchant/attendance/:id/approve
 * @access  Private/Merchant
 */
exports.approveAttendance = async (req, res) => {
  console.log('🔍 [PATCH] /api/merchant/attendance/:id/approve called');
  console.log('📋 Request params:', req.params);
  console.log('📋 Request body:', req.body);
  console.log('👤 Merchant ID:', req.user._id);
  
  try {
    const { id } = req.params;
    const { action, remarks } = req.body;

    console.log(`🔍 Looking for attendance with ID: ${id}`);

    const attendance = await Attendance.findById(id);
    
    if (!attendance) {
      console.log('❌ Attendance not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Attendance not found'
      });
    }

    console.log('✅ Found attendance:', {
      id: attendance._id,
      userId: attendance.userId,
      status: attendance.status,
      currentApproval: attendance.approvalStatus
    });

    attendance.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
    attendance.approvedBy = req.user._id;
    attendance.approvalDate = new Date();
    attendance.remarks = remarks || '';
    
    console.log('🔄 Updating attendance with:', {
      approvalStatus: attendance.approvalStatus,
      approvedBy: attendance.approvedBy,
      remarks: attendance.remarks
    });

    await attendance.save();
    
    console.log('✅ Attendance updated successfully');

    res.json({
      success: true,
      message: `Attendance ${action}ed successfully`,
      data: attendance
    });
  } catch (error) {
    console.error('❌ Approve attendance error:', error);
    console.error('📝 Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * @desc    Export attendance data
 * @route   POST /api/merchant/attendance/export
 * @access  Private/Merchant
 */
exports.exportAttendance = async (req, res) => {
  console.log('🔍 [POST] /api/merchant/attendance/export called');
  console.log('📋 Request body:', req.body);
  console.log('📋 Request headers:', req.headers);
  console.log('👤 Merchant ID:', req.user._id);
  
  try {
    const { 
      format = 'csv', 
      startDate, 
      endDate, 
      status, 
      role, 
      department,
      includeRemarks = false,
      includeSelfies = false 
    } = req.body;

    console.log('📊 Export parameters:', {
      format,
      startDate,
      endDate,
      status,
      role,
      department,
      includeRemarks,
      includeSelfies
    });

    // Get all users created by this merchant
    console.log('🔄 Fetching merchant users...');
    const merchantUsers = await User.find({ 
      createdBy: req.user._id 
    }).select('_id FullName email role department');
    
    console.log(`👥 Found ${merchantUsers.length} users for merchant`);
    
    const userIds = merchantUsers.map(user => user._id);
    console.log('👤 User IDs to query:', userIds);

    // Build query
    let query = {
      userId: { $in: userIds }
    };

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
        console.log('📅 Start date filter:', query.date.$gte);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
        console.log('📅 End date filter:', query.date.$lte);
      }
    }

    // Status filter
    if (status) {
      query.status = status;
      console.log('📊 Status filter:', status);
    }

    console.log('🔍 Final query for export:', JSON.stringify(query, null, 2));

    // Get attendance data
    console.log('🔄 Fetching attendance records for export...');
    const attendance = await Attendance.find(query)
      .populate('userId', 'FullName email role department')
      .populate('approvedBy', 'FullName')
      .sort({ date: -1, startTime: -1 });

    console.log(`✅ Found ${attendance.length} attendance records for export`);

    if (attendance.length === 0) {
      console.log('⚠️ No attendance records found for export');
      return res.json({
        success: true,
        message: 'No attendance records found for the selected criteria',
        data: []
      });
    }

    console.log('📊 Sample attendance record:', attendance[0]);

    // Format response based on format
    if (format === 'csv') {
      console.log('📄 Generating CSV format...');
      
      // Create CSV headers
      let csvContent = 'Employee Name,Employee Email,Role,Department,Date,Start Time,End Time,Status,Total Hours,Approval Status,Remarks\n';
      
      // Add rows
      attendance.forEach(record => {
        const row = [
          `"${record.userId?.FullName || 'Unknown'}"`,
          `"${record.userId?.email || ''}"`,
          `"${record.userId?.role || 'staff'}"`,
          `"${record.userId?.department || ''}"`,
          `"${formatDate(record.date)}"`,
          `"${formatTime(record.startTime)}"`,
          `"${record.endTime ? formatTime(record.endTime) : ''}"`,
          `"${record.status}"`,
          `"${record.totalHours || 0}"`,
          `"${record.approvalStatus || 'pending'}"`,
          `"${includeRemarks ? (record.remarks || '') : ''}"`
        ].join(',');
        
        csvContent += row + '\n';
      });

      console.log(`📄 Generated CSV with ${attendance.length} rows`);
      console.log('📄 First few rows of CSV:', csvContent.split('\n').slice(0, 5).join('\n'));

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=attendance_export_${startDate || 'all'}_to_${endDate || 'now'}.csv`);
      
      console.log('✅ Sending CSV response...');
      return res.send(csvContent);
      
    } else {
      console.log('📄 Generating JSON format...');
      
      // Format JSON response
      const exportData = attendance.map(record => ({
        employeeName: record.userId?.FullName || 'Unknown',
        employeeEmail: record.userId?.email || '',
        employeeRole: record.userId?.role || 'staff',
        employeeDepartment: record.userId?.department || '',
        date: formatDate(record.date),
        startTime: formatTime(record.startTime),
        endTime: record.endTime ? formatTime(record.endTime) : null,
        status: record.status,
        totalHours: record.totalHours,
        approvalStatus: record.approvalStatus || 'pending',
        remarks: includeRemarks ? record.remarks : undefined,
        startSelfie: includeSelfies ? record.startSelfie : undefined,
        endSelfie: includeSelfies ? record.endSelfie : undefined,
        createdAt: record.createdAt
      }));

      console.log(`✅ Generated JSON with ${exportData.length} records`);

      res.status(200).json({
        success: true,
        message: 'Export completed successfully',
        format: 'json',
        count: exportData.length,
        data: exportData
      });
    }

  } catch (error) {
    console.error('❌ Export attendance error:', error);
    console.error('📝 Error stack:', error.stack);
    console.error('🔍 Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    
    res.status(500).json({
      success: false,
      message: 'Server error while exporting attendance',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


/**
 * @desc    Get attendance calendar data
 * @route   GET /api/merchant/attendance/calendar
 * @access  Private/Merchant
 */
exports.getAttendanceCalendar = async (req, res) => {
  console.log('🔍 [GET] /api/merchant/attendance/calendar called');
  console.log('📋 Query parameters:', req.query);
  
  try {
    const { userId, month, year } = req.query;
    
    // Parse month and year (month is 0-indexed in JavaScript)
    const targetMonth = month ? parseInt(month) : new Date().getMonth();
    const targetYear = year ? parseInt(year) : new Date().getFullYear();
    
    console.log('📅 Calendar parameters:', { targetMonth, targetYear, userId });

    // Calculate start and end of month
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    console.log('📅 Date range:', { startDate, endDate });

    // Build query
    let query = {
      date: { $gte: startDate, $lte: endDate }
    };

    // Add user filter if provided
    if (userId) {
      query.userId = userId;
    } else {
      // If no user selected, get all merchant users
      const merchantUsers = await User.find({ createdBy: req.user._id }).select('_id');
      const userIds = merchantUsers.map(user => user._id);
      query.userId = { $in: userIds };
    }

    console.log('🔍 Query:', JSON.stringify(query, null, 2));

    // Get attendance records
    const attendance = await Attendance.find(query)
      .populate('userId', 'FullName email role')
      .sort({ date: 1 });

    console.log(`✅ Found ${attendance.length} attendance records for calendar`);

    // Group attendance by date
    const attendanceByDate = {};
    attendance.forEach(record => {
      const dateStr = record.date.toISOString().split('T')[0];
      if (!attendanceByDate[dateStr]) {
        attendanceByDate[dateStr] = [];
      }
      attendanceByDate[dateStr].push({
        userId: record.userId?._id,
        userName: record.userId?.FullName || 'Unknown',
        startTime: formatTime(record.startTime),
        endTime: record.endTime ? formatTime(record.endTime) : null,
        totalHours: record.totalHours,
        status: record.status,
        present: record.status === 'completed' || record.status === 'active'
      });
    });

    // Generate calendar data for the month
    const daysInMonth = endDate.getDate();
    const calendarData = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(targetYear, targetMonth, day);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayAttendance = attendanceByDate[dateStr] || [];
      
      // For single user view, check if they have attendance
      let userPresent = false;
      let userAttendance = null;
      
      if (userId && dayAttendance.length > 0) {
        userAttendance = dayAttendance.find(att => att.userId.toString() === userId);
        userPresent = userAttendance?.present || false;
      } else if (!userId && dayAttendance.length > 0) {
        // For "All Employees" view, consider present if any employee is present
        userPresent = dayAttendance.some(att => att.present);
      }

      calendarData.push({
        date: dateStr,
        day: day,
        present: userPresent,
        attendance: userAttendance || (dayAttendance.length > 0 ? dayAttendance[0] : null),
        totalEmployees: dayAttendance.length,
        presentEmployees: dayAttendance.filter(att => att.present).length
      });
    }

    console.log(`📊 Generated calendar data for ${calendarData.length} days`);

    res.status(200).json({
      success: true,
      month: targetMonth,
      year: targetYear,
      monthName: new Date(targetYear, targetMonth).toLocaleString('default', { month: 'long' }),
      totalDays: daysInMonth,
      data: calendarData
    });

  } catch (error) {
    console.error('❌ Get attendance calendar error:', error);
    console.error('📝 Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance calendar',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Get merchant users for dropdown
 * @route   GET /api/merchant/attendance/users
 * @access  Private/Merchant
 */
exports.getMerchantUsers = async (req, res) => {
  console.log('🔍 [GET] /api/merchant/attendance/users called');
  
  try {
    const users = await User.find({ createdBy: req.user._id })
      .select('_id FullName email role department isActive')
      .sort({ FullName: 1 });

    console.log(`✅ Found ${users.length} users for merchant`);

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });

  } catch (error) {
    console.error('❌ Get merchant users error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};