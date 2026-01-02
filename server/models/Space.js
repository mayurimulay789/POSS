const mongoose = require('mongoose');

const spaceSchema = new mongoose.Schema({
  spaceName: {
    type: String,
    required: [true, 'Please add a space name'],
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Please add space capacity'],
    min: 1
  },
  spaceType: {
    type: String,
    enum: ['Tables', 'Spa Room', 'Banquet', 'Outdoor', 'Private Room'],
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'reserved', 'maintenance'],
    default: 'available'
  },
  isReserved: {
    type: Boolean,
    default: false
  },
  spaceImage: {
    type: String,
    default: 'https://res.cloudinary.com/demo/image/upload/v1/space-placeholder.png'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
spaceSchema.index({ createdBy: 1, spaceType: 1 });

module.exports = mongoose.model('Space', spaceSchema);
