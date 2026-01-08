
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date
  },
  startSelfie: {
    type: String,
    required: [true, 'Start selfie is required']
  },
  endSelfie: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  totalHours: {
    type: Number,
    min: 0
  },
  // Merchant management fields
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: 500
  },
  lateMinutes: {
    type: Number,
    min: 0,
    default: 0
  },
  isOvertime: {
    type: Boolean,
    default: false
  },
  overtimeHours: {
    type: Number,
    min: 0,
    default: 0
  },
  shiftType: {
    type: String,
    enum: ['regular', 'extra', 'holiday'],
    default: 'regular'
  }
}, {
  timestamps: true
});

// Indexes for merchant queries
attendanceSchema.index({ userId: 1, status: 1 });
attendanceSchema.index({ userId: 1, date: 1 });
attendanceSchema.index({ date: 1, status: 1 });
attendanceSchema.index({ approvalStatus: 1 });
attendanceSchema.index({ createdBy: 1 }); // For merchant's created users

// Pre-save middleware to calculate totalHours and check overtime
attendanceSchema.pre('save', async function() {
  // Calculate total hours if both startTime and endTime exist and status is completed
  if (this.startTime && this.endTime && this.status === 'completed') {
    const diffMs = this.endTime - this.startTime;
    const hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    this.totalHours = hours;
    
    // Check for overtime (more than 8 hours)
    if (hours > 8) {
      this.isOvertime = true;
      this.overtimeHours = parseFloat((hours - 8).toFixed(2));
    } else {
      this.isOvertime = false;
      this.overtimeHours = 0;
    }
  }
  
  // Calculate late minutes if start time is after 9:30 AM
  if (this.startTime) {
    const startTime = new Date(this.startTime);
    const expectedStart = new Date(startTime);
    expectedStart.setHours(9, 30, 0, 0); // Expected start at 9:30 AM
    
    if (startTime > expectedStart) {
      const lateMs = startTime - expectedStart;
      this.lateMinutes = Math.floor(lateMs / (1000 * 60));
    } else {
      this.lateMinutes = 0;
    }
  }
});

// Virtual for duration (in case endTime not set yet)
attendanceSchema.virtual('duration').get(function() {
  if (!this.startTime) return { hours: 0, minutes: 0 };
  
  const endTime = this.endTime || new Date();
  const diffMs = endTime - this.startTime;
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  
  return { hours, minutes };
});

// Virtual for formatted duration string
attendanceSchema.virtual('durationString').get(function() {
  const duration = this.duration;
  return `${duration.hours}h ${duration.minutes}m`;
});

// Virtual for attendance status with color
attendanceSchema.virtual('statusColor').get(function() {
  switch (this.status) {
    case 'active': return 'blue';
    case 'completed': return 'green';
    default: return 'gray';
  }
});

// Virtual for approval status with color
attendanceSchema.virtual('approvalColor').get(function() {
  switch (this.approvalStatus) {
    case 'approved': return 'green';
    case 'rejected': return 'red';
    case 'pending': return 'yellow';
    default: return 'gray';
  }
});

// Static method to get start of day for a date
attendanceSchema.statics.getStartOfDay = function(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Static method to get end of day for a date
attendanceSchema.statics.getEndOfDay = function(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Static method to check if user has active shift today
attendanceSchema.statics.hasActiveShiftToday = async function(userId) {
  const todayStart = this.getStartOfDay();
  const todayEnd = this.getEndOfDay();
  
  const activeShift = await this.findOne({
    userId,
    date: { $gte: todayStart, $lte: todayEnd },
    status: 'active'
  });
  
  return !!activeShift;
};

// Static method to get today's attendance for user
attendanceSchema.statics.getTodayAttendance = async function(userId) {
  const todayStart = this.getStartOfDay();
  const todayEnd = this.getEndOfDay();
  
  return await this.findOne({
    userId,
    date: { $gte: todayStart, $lte: todayEnd }
  });
};

// Static method to get current active shift
attendanceSchema.statics.getCurrentShift = async function(userId) {
  const todayStart = this.getStartOfDay();
  const todayEnd = this.getEndOfDay();
  
  return await this.findOne({
    userId,
    date: { $gte: todayStart, $lte: todayEnd },
    status: 'active'
  });
};

// Static method to get all attendance for merchant
attendanceSchema.statics.getAllAttendance = async function(merchantId, filters = {}) {
  // Get all users created by this merchant
  const users = await mongoose.model('User').find({ 
    createdBy: merchantId 
  }).select('_id');
  
  const userIds = users.map(user => user._id);
  
  let query = {
    userId: { $in: userIds },
    ...filters
  };
  
  return await this.find(query)
    .populate('userId', 'FullName email role')
    .populate('approvedBy', 'FullName')
    .sort({ date: -1, startTime: -1 });
};

// Static method to get team attendance for a specific date
attendanceSchema.statics.getTeamAttendance = async function(merchantId, date = new Date()) {
  const startOfDay = this.getStartOfDay(date);
  const endOfDay = this.getEndOfDay(date);
  
  // Get all users created by this merchant
  const users = await mongoose.model('User').find({ 
    createdBy: merchantId 
  }).select('_id FullName email role isActive');
  
  const userIds = users.map(user => user._id);
  
  // Get attendance for these users on the specified date
  const attendance = await this.find({
    userId: { $in: userIds },
    date: { $gte: startOfDay, $lte: endOfDay }
  }).populate('userId', 'FullName email role');
  
  return { users, attendance };
};

// Method to check if attendance is for today
attendanceSchema.methods.isToday = function() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  
  return this.date >= todayStart && this.date <= todayEnd;
};

// Method to format date for display
attendanceSchema.methods.getFormattedDate = function() {
  return this.date.toLocaleDateString('en-IN', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Method to format time for display
attendanceSchema.methods.getFormattedTime = function(timeField) {
  const time = this[timeField];
  if (!time) return '--:--';
  
  return new Date(time).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

// Method to end shift
attendanceSchema.methods.endShift = async function(endSelfie = null) {
  this.endTime = new Date();
  this.status = 'completed';
  
  if (endSelfie) {
    this.endSelfie = endSelfie;
  }
  
  // Calculate total hours
  if (this.startTime) {
    const diffMs = this.endTime - this.startTime;
    this.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
  }
  
  return await this.save();
};

// Method to approve/reject attendance
attendanceSchema.methods.approveAttendance = async function(merchantId, action, remarks = '') {
  if (!['approve', 'reject'].includes(action)) {
    throw new Error('Action must be "approve" or "reject"');
  }
  
  this.approvalStatus = action === 'approve' ? 'approved' : 'rejected';
  this.approvedBy = merchantId;
  this.approvalDate = new Date();
  this.remarks = remarks;
  
  return await this.save();
};

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;