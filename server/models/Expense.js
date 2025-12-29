// const mongoose = require('mongoose');

// const expenseSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Please add an expense title'],
//     trim: true,
//     maxlength: [100, 'Title cannot be more than 100 characters']
//   },
//   amount: {
//     type: Number,
//     required: [true, 'Please add an expense amount'],
//     min: [0, 'Amount cannot be negative']
//   },
//   description: {
//     type: String,
//     trim: true,
//     maxlength: [500, 'Description cannot be more than 500 characters']
//   },
//   date: {
//     type: Date,
//     default: Date.now
//   },
//   createdBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   paymentMethod: {
//     type: String,
//     enum: ['cash', 'card', 'bank_transfer', 'digital_wallet', 'other'],
//     default: 'cash'
//   },
//   // Add this field to track if expense is editable by non-merchants
//   isEditable: {
//     type: Boolean,
//     default: true
//   }
// }, {
//   timestamps: true
// });

// // Index for better query performance
// expenseSchema.index({ createdBy: 1, date: -1 });
// expenseSchema.index({ date: 1 });
// expenseSchema.index({ isEditable: 1 });

// // Middleware to check if expense is still editable (before midnight)
// expenseSchema.pre('save', function(next) {
//   // Only check for non-merchant users during update
//   if (this.isModified() && !this.isNew) {
//     const now = new Date();
//     const expenseDate = new Date(this.date);
    
//     // Check if it's past midnight (next day)
//     const isNextDay = now.getDate() !== expenseDate.getDate() || 
//                       now.getMonth() !== expenseDate.getMonth() || 
//                       now.getFullYear() !== expenseDate.getFullYear();
    
//     this.isEditable = !isNextDay;
//   }
//   next();
// });

// // Static method to check if expense can be modified
// expenseSchema.statics.canModify = function(expenseId, userId, userRole) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const expense = await this.findById(expenseId);
//       if (!expense) {
//         return resolve({ canModify: false, reason: 'Expense not found' });
//       }

//       // Merchant can always modify
//       if (userRole === 'merchant') {
//         return resolve({ canModify: true, expense });
//       }

//       // For non-merchants:
//       // 1. Check if user is the creator
//       if (expense.createdBy.toString() !== userId.toString()) {
//         return resolve({ canModify: false, reason: 'Not authorized to modify this expense' });
//       }

//       // 2. Check if it's still the same day (before midnight)
//       const now = new Date();
//       const expenseDate = new Date(expense.date);
      
//       // Check if it's the same day
//       const isSameDay = now.getDate() === expenseDate.getDate() && 
//                         now.getMonth() === expenseDate.getMonth() && 
//                         now.getFullYear() === expenseDate.getFullYear();
      
//       if (!isSameDay) {
//         // Update isEditable flag
//         expense.isEditable = false;
//         await expense.save();
//         return resolve({ canModify: false, reason: 'Cannot modify expense after midnight' });
//       }

//       return resolve({ canModify: true, expense });
//     } catch (error) {
//       reject(error);
//     }
//   });
// };

// module.exports = mongoose.model('Expense', expenseSchema);

const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an expense title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an expense amount'],
    min: [0, 'Amount cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  date: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'bank_transfer', 'digital_wallet', 'other'],
    default: 'cash'
  },
  isEditable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
expenseSchema.index({ createdBy: 1, date: -1 });
expenseSchema.index({ date: 1 });
expenseSchema.index({ isEditable: 1 });

// IMPORTANT: Remove or comment out the problematic middleware for now
// We'll handle the logic differently
// expenseSchema.pre('save', function(next) {
//   // Your middleware code here
// });

// Static method to check if expense can be modified
expenseSchema.statics.canModify = async function(expenseId, userId, userRole) {
  try {
    const expense = await this.findById(expenseId);
    if (!expense) {
      return { canModify: false, reason: 'Expense not found' };
    }

    // Merchant can always modify
    if (userRole === 'merchant') {
      return { canModify: true, expense };
    }

    // For non-merchants:
    // 1. Check if user is the creator
    if (expense.createdBy.toString() !== userId.toString()) {
      return { canModify: false, reason: 'Not authorized to modify this expense' };
    }

    // 2. Check if it's still the same day (before midnight)
    const now = new Date();
    const expenseDate = new Date(expense.date);
    
    // Check if it's the same day
    const isSameDay = now.getDate() === expenseDate.getDate() && 
                      now.getMonth() === expenseDate.getMonth() && 
                      now.getFullYear() === expenseDate.getFullYear();
    
    if (!isSameDay) {
      // Update isEditable flag
      expense.isEditable = false;
      await expense.save();
      return { canModify: false, reason: 'Cannot modify expense after midnight' };
    }

    return { canModify: true, expense };
  } catch (error) {
    console.error('Error in canModify:', error);
    throw error;
  }
};

module.exports = mongoose.model('Expense', expenseSchema);