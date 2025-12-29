/**
 * Calculate hours between two dates
 * @param {Date} start - Start time
 * @param {Date} end - End time
 * @returns {Number} - Hours with 2 decimal places
 */
const calculateHours = (start, end) => {
  if (!start || !end) return 0;
  
  const startTime = new Date(start);
  const endTime = new Date(end);
  
  // Ensure end time is after start time
  if (endTime <= startTime) return 0;
  
  const diffMs = endTime - startTime;
  const hours = diffMs / (1000 * 60 * 60);
  
  return parseFloat(hours.toFixed(2));
};

/**
 * Format time for display
 * @param {Date} date - Date to format
 * @returns {String} - Formatted time string
 */
const formatTime = (date) => {
  if (!date) return '--:--';
  
  const d = new Date(date);
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @returns {String} - Formatted date string
 */
const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Check if date is today
 * @param {Date} date - Date to check
 * @returns {Boolean} - True if date is today
 */
const isToday = (date) => {
  if (!date) return false;
  
  const today = new Date();
  const checkDate = new Date(date);
  
  return (
    checkDate.getDate() === today.getDate() &&
    checkDate.getMonth() === today.getMonth() &&
    checkDate.getFullYear() === today.getFullYear()
  );
};

/**
 * Get start of day (00:00:00)
 * @param {Date} date - Reference date
 * @returns {Date} - Start of day
 */
const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Get end of day (23:59:59)
 * @param {Date} date - Reference date
 * @returns {Date} - End of day
 */
const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Calculate duration object from milliseconds
 * @param {Number} ms - Milliseconds
 * @returns {Object} - Duration object with hours and minutes
 */
const getDurationFromMs = (ms) => {
  if (!ms || ms <= 0) return { hours: 0, minutes: 0 };
  
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes };
};

/**
 * Validate image file
 * @param {Object} file - File object
 * @returns {Object} - Validation result
 */
const validateImage = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { isValid: false, errors };
  }
  
  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push('File size must be less than 5MB');
  }
  
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('Only JPEG, PNG, and GIF images are allowed');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors.length > 0 ? errors : null
  };
};

/**
 * Generate attendance summary for a user
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Object} - Summary object
 */
const generateSummary = (attendanceRecords) => {
  if (!attendanceRecords || attendanceRecords.length === 0) {
    return {
      totalShifts: 0,
      completedShifts: 0,
      activeShifts: 0,
      totalHours: 0,
      averageHours: 0,
      daysPresent: 0
    };
  }
  
  const completedShifts = attendanceRecords.filter(record => record.status === 'completed');
  const activeShifts = attendanceRecords.filter(record => record.status === 'active');
  
  const totalHours = completedShifts.reduce((sum, record) => {
    return sum + (record.totalHours || calculateHours(record.startTime, record.endTime));
  }, 0);
  
  const averageHours = completedShifts.length > 0 ? totalHours / completedShifts.length : 0;
  
  // Count unique days
  const uniqueDays = new Set(
    attendanceRecords.map(record => 
      new Date(record.date).toDateString()
    )
  ).size;
  
  return {
    totalShifts: attendanceRecords.length,
    completedShifts: completedShifts.length,
    activeShifts: activeShifts.length,
    totalHours: parseFloat(totalHours.toFixed(2)),
    averageHours: parseFloat(averageHours.toFixed(2)),
    daysPresent: uniqueDays
  };
};

module.exports = {
  calculateHours,
  formatTime,
  formatDate,
  isToday,
  getStartOfDay,
  getEndOfDay,
  getDurationFromMs,
  validateImage,
  generateSummary
};