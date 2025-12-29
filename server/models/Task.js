const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskName: {
      type: String,
      required: [true, 'Please add a task name'],
      trim: true,
      maxlength: 200
    },

    taskMessage: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    assignedTime: {
      type: Date,
      default: Date.now
    },

    completedTime: {
      type: Date
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'expired', 'cancelled'],
      default: 'pending'
    },

    taskCompleteMessage: {
      type: String,
      trim: true,
      maxlength: 500
    },

    taskDurationType: {
      type: String,
      enum: ['one_day', 'weekday', 'monthly', 'custom_range'],
      default: 'one_day'
    },

    customFrequency: {
      days: {
        type: [Number], // 0 (Sun) - 6 (Sat)
        default: []
      },
      startDate: {
        type: Date
      },
      endDate: {
        type: Date
      },
      repeatEvery: {
        value: {
          type: Number
        },
        unit: {
          type: String,
          enum: ['days', 'weeks', 'months']
        }
      }
    },

    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },

    category: {
      type: String,
      enum: ['cleaning', 'maintenance', 'inventory', 'customer_service', 'reporting', 'other'],
      default: 'other'
    },

    estimatedTime: {
      type: Number,
      min: 0
    },

    actualTime: {
      type: Number,
      min: 0
    },

    dueDate: {
      type: Date
    },

    reminders: [
      {
        time: {
          type: Date
        },
        sent: {
          type: Boolean,
          default: false
        }
      }
    ],

    autoExpire: {
      type: Boolean,
      default: true
    },

    feedback: {
      type: String,
      maxlength: 500
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Task', taskSchema);
